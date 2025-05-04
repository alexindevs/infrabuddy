# ⚙️ InfraBuddy

**Spin up infrastructure templates for your backend apps in seconds.**  
InfraBuddy helps you scaffold infra like Docker, GitHub Actions, and soon—Terraform, Kubernetes, and more—based on your stack and preferences.

> 🛠 Built by [@alexindevs](https://github.com/alexindevs) to end infrastructure procrastination, one zip file at a time.

---

## 🚀 Supported Stacks (v1)

InfraBuddy currently supports three backend stacks:

- **Node.js** (Javascript)
- **FastAPI** (Python)
- **Flask** (Python)

For each, you can generate:

- ✅ Dockerfile + Compose setup
- ✅ GitHub Actions CI/CD workflow
- ✅ Nginx reverse proxy config
- ✅ Optional DB (PostgreSQL, MySQL, MongoDB)
- ✅ Optional Redis cache
- ✅ SSH-based server deployment

All configurations are customized to your answers using dynamic templates.

---

## 📦 Usage

You can run InfraBuddy via CLI:

```bash
# Clone and install
git clone https://github.com/alexindevs/infrabuddy
cd infrabuddy
npm install
npm run cli
```

Or make it global:

```bash
npm run build
npm link

infrabuddy
```

---

## 💡 Planned Improvements

Here’s what’s coming next:

- 🌍 **Terraform generation**: Infra-as-code templates for AWS, GCP, Azure
- ☸️ **Kubernetes support**: Helm charts, K8s manifests, deployment strategies
- 🗄️ **More Stacks**: Rust with Axum/Actix, Java with Spring Boot, Go with Gin/Fiber
- 🎨 **Frontend support**: React, Vue, SPA deployments with Nginx
- 📁 **Custom template loading**: Bring your own infra base and use InfraBuddy to extend it
- 🖥 **Web interface**: For folks who don’t vibe with the CLI

---

## 🤝 Contributing

Pull requests? YES.
Want to add a new stack or CI config? Let’s talk.
Got ideas? File an issue or DM [@alexindevs](https://x.com/alexindevs) on Twitter.

---

## ❤️ Credits

InfraBuddy is powered by:

- 🧪 Inquirer.js
- ✨ Mustache templates
- 🧵 NestJS + TS backend
- 💻 and a chaotic engineer who was tired of writing boilerplate

---

<!-- ## 📸 Demo

*Coming soon — CLI screenshots & sample outputs* -->

---

## 🧙‍♀️ Magic Words

> Infrastructure shouldn't be a barrier to building.  
> InfraBuddy sets it up, so you can **focus on the magic.**
