# SuperLink — AI GEO / AIEO Desktop App

> English | [简体中文](./README_CN.md)

**SuperLink** is a desktop app for **GEO (Generative Engine Optimization)** — also called **AIEO (AI Engine Optimization)**. It helps brands and creators get **cited and recommended by AI search engines and large language models** (ChatGPT, Perplexity, Doubao, Kimi, etc.).

The idea: when users ask an AI a question, the AI answers from content it has ingested across the web. SuperLink generates high-quality, LLM-friendly articles around your **target keywords**, then publishes them across a **matrix of content platforms** so AI models are more likely to reference your brand.

---

## ✨ Features

- **GEO / AIEO content generation** — mine the real questions users ask AI, then generate clean, LLM-friendly Markdown articles grounded on your knowledge base and images.
- **Multi-platform publishing matrix** — one-click publish to Zhihu, Toutiao, Baijiahao, Sohu, NetEase, Qi'e, WeChat, CSDN, Bilibili, Douyin, Kuaishou, Xiaohongshu, TikTok, with per-platform/per-account delivery tracking.
- **Copywriting assistant** — streaming chat-based planning/copywriting expert with industry skill templates and versioned files.
- **Model management** — add your own LLM / embedding providers, set a default, test connectivity, and track token-based usage.
- **Self-contained** — bundles its own backend and an embedded database; nothing else to install.

---

## ⬇️ Download & Install

Grab the latest installer from the **[Releases page](https://github.com/kakj-go/GEO/releases/latest)**:

| Platform | File |
|---|---|
| 🪟 **Windows** | `SuperLink Setup x.y.z.exe` |
| 🍎 **macOS (Apple Silicon)** | `SuperLink-x.y.z-arm64.dmg` |
| 🍎 **macOS (Intel)** | `SuperLink-x.y.z.dmg` |

**Windows** — run the `.exe`, choose an install location, and finish. A desktop / Start-menu shortcut is created.

**macOS** — open the `.dmg` and drag **SuperLink** into **Applications**.

> The builds are **unsigned**. On first launch you'll see a warning:
> - **Windows**: SmartScreen → *More info* → *Run anyway*.
> - **macOS**: right-click the app → **Open** → **Open** (or *System Settings ▸ Privacy & Security ▸ Open Anyway*).

---

## 🚀 First-Time Use

The app starts its own backend automatically — **no MySQL, no server setup**. Data is stored locally in an embedded SQLite database (`database/data.db`, next to the app's resources).

> 🔑 **Default login** — username **`root`**, password **`123456`**. Please change the password after your first login.

1. **Launch** SuperLink.
2. **Log in** with the default account `root` / `123456` (or initialize the system to create your own company + admin account).
3. **Change the default password** in user settings.
4. **Enter your APIMart API Key** in *模型管理器 (Model Manager)*. The built-in models all run through [APIMart](https://apimart.ai/) — paste the key, click Save, and every AI feature works. **No environment variables required.** Don't have a key yet? Get one at **https://apimart.ai/**.
5. **Pick your default models** in the Model Manager (text / image / video).
6. **Add platform logins** (optional) so you can publish — authorize each target platform once.
7. **Generate & publish** — create a GEO task from your keywords, review the generated articles, then send them to your chosen platforms.

> All configuration (APIMart key, models, platform logins) happens **inside the app** — you don't need environment variables at all.

---

## ⚙️ Environment Variables (optional)

SuperLink works out of the box and the **APIMart key is configured in the app** (Model Manager), so you normally **don't need any environment variables**. They exist only for advanced tweaks. The bundled backend **inherits the operating-system environment**, so you set variables at the OS level **before launching the app**.

| Variable | Description | Default |
|---|---|---|
| `APIMART_API_KEY` | Fallback API key for the built-in APIMart gateway ([get one](https://apimart.ai/)). Optional — the key entered in the Model Manager takes priority, so this is only a fallback. | — |
| `JWT_SECRET` | Secret used to sign login tokens. | built-in default |
| `LOG_LEVEL` | Log verbosity: `debug` / `info` / `warn` / `error`. | `info` |
| `SWAGGER_ENABLED` | Expose the API docs at `http://localhost:8080/swagger/index.html`. | `false` |
| `METRICS_ENABLED` | Expose Prometheus metrics. | `true` |
| `DEBUG` | Enable debug mode. | `false` |

> ⚠️ Do **not** change `HTTP_PORT`. The desktop UI talks to the backend on `localhost:8080`; changing the port breaks the app.

### How to set them

**Windows** (set a user variable, then restart the app):

```powershell
# PowerShell — persists for your user account
setx APIMART_API_KEY "your-key-here"
setx LOG_LEVEL "debug"
# Close and reopen SuperLink so it picks up the new values.
```

Or via **Settings ▸ System ▸ About ▸ Advanced system settings ▸ Environment Variables**.

**macOS** (launch with the variables set, e.g. from Terminal):

```bash
APIMART_API_KEY="your-key-here" LOG_LEVEL="debug" \
  open -a SuperLink
```

To set them permanently, add the `export` lines to your shell profile (`~/.zshrc`) or use a `launchctl setenv` entry, then relaunch.

---

## 🩺 Troubleshooting

- **AI features do nothing / errors** — make sure a model is configured and its connectivity test passes in *Model Management* (or that `APIMART_API_KEY` is set).
- **Logs** — for diagnosing issues, check the runtime log:
  - **Windows**: `%APPDATA%\superlink\logs\run.log`
  - **macOS**: `~/Library/Application Support/superlink/logs/run.log`
- **Reset everything** — quit the app and delete the local `database/data.db` (this erases all local data).

---

## 🧑‍💻 Build from Source

Building the desktop installers (and producing macOS builds, which require macOS) is automated via GitHub Actions on tag push — see [.github/workflows/release.yml](.github/workflows/release.yml). To build the Windows app locally:

```bash
cd front
npm install
npm run dist-win     # → front/release/
```

---

## 📄 License

See the repository for license details.


## Contributing and CI

Changes to the default branch require a pull request and passing CI. See [the branch protection and CI policy](docs/ci.md).
