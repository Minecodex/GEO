// Real backend, migrations, fresh database and production UI. No provider calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { chromium, _electron } = require('playwright');

const argument = name => process.argv[process.argv.indexOf(name) + 1];
const packaged = process.argv.includes('--app');
const source = path.resolve(argument(packaged ? '--app' : '--backend'));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'superlink-ci-'));
let backend, browser, server, app;
const logs = [];

async function ready() {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    if (backend && backend.exitCode !== null) throw new Error('Backend exited before readiness');
    try {
      const response = await fetch('http://127.0.0.1:8080/healthz', { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('The actual bundled backend did not become healthy');
}

async function main() {
  let page;
  if (packaged) {
    app = await _electron.launch({ executablePath: source, cwd: root,
      args: ['--user-data-dir=' + path.join(root, 'profile')],
      env: { ...process.env, DEBUG: 'false', METRICS_ENABLED: 'false' }, timeout: 90000 });
    page = await app.firstWindow();
  } else {
    const resources = path.join(root, 'resources');
    fs.mkdirSync(resources);
    const binary = path.join(resources, process.platform === 'win32' ? 'backend.exe' : 'backend');
    fs.copyFileSync(source, binary);
    if (process.platform !== 'win32') fs.chmodSync(binary, 0o755);
    backend = spawn(binary, [], { cwd: root, windowsHide: true,
      env: { ...process.env, DEBUG: 'false', METRICS_ENABLED: 'false' } });
    backend.stdout.on('data', data => logs.push(String(data)));
    backend.stderr.on('data', data => logs.push(String(data)));
    const build = path.resolve('build');
    server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let file = path.resolve(build, '.' + pathname);
      if (!file.startsWith(build + path.sep) && file !== build) { response.writeHead(403); return response.end(); }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(build, 'index.html');
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[path.extname(file)];
      response.setHeader('Content-Type', type || 'application/octet-stream');
      fs.createReadStream(file).pipe(response);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:' + server.address().port);
  }
  await ready();
  const status = await (await fetch('http://127.0.0.1:8080/v1/auth/init_status')).json();
  assert.equal(status.data, false, 'Acceptance must start with a fresh application database');
  await page.getByPlaceholder('输入公司或组织名称').fill('CI acceptance company');
  await page.getByPlaceholder('设置主管理员账号').fill('ciadmin');
  await page.getByPlaceholder('设置高强度管理员密码').fill('CI-public-fixture-123!');
  await page.getByRole('button', { name: '完成初始化并登录' }).click();
  await page.locator('.init-card').waitFor({ state: 'hidden', timeout: 30000 });
  await page.reload();
  await page.locator('.init-card').waitFor({ state: 'hidden', timeout: 30000 });
  assert.equal((await (await fetch('http://127.0.0.1:8080/v1/auth/init_status')).json()).data, true);
  assert.ok((await page.locator('body').innerText()).length > 20, 'The production UI must render after initialization');
  console.log('Fresh database, backend migrations, UI initialization and persistence passed.');
}

main().catch(error => { console.error(error); console.error(logs.join('').slice(-4000)); process.exitCode = 1; }).finally(async () => {
  if (app) await app.close();
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (backend && backend.exitCode === null) {
    backend.kill();
    await new Promise(resolve => backend.once('exit', resolve));
  }
  // A packaged backend stores its database adjacent to the candidate bundle.
  // The entire candidate belongs to the disposable CI job; only our profile is removed here.
  fs.rmSync(root, { recursive: true, force: true });
});
