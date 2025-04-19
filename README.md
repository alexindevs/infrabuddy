# 🧞 InfraBuddy

**InfraBuddy** is a stack-agnostic, ultra-configurable DevOps scaffolder that helps developers spin up project infrastructure in seconds.

It works like magic: you answer a few questions — and InfraBuddy generates a zipped folder with battle-tested configs tailored to your stack.

---

## ✨ Vision

The goal of InfraBuddy is to give every developer — backend, frontend, or full-stack — a frictionless way to:

- Containerize their app (with sane Docker defaults)
- Add CI/CD pipelines (starting with GitHub Actions)
- Deploy or provision cloud infrastructure (starting with AWS via Terraform)

It’s DevOps as a **starter kit**, not a punishment.

---

## ✅ MVP Scope

### 📁 Output Contents

Depending on user choices, InfraBuddy can generate:

```text
infra-output/
├── Dockerfile
├── docker-compose.yml
├── nginx/
│   └── default.conf
├── .dockerignore
├── .env.sample
├── .github/
│   └── workflows/
│       └── [dev|staging|prod].yml
├── terraform/
│   ├── main.tf
│   ├── ec2.tf
│   └── ...
└── README.md
```

---

### 💬 Supported Features (MVP)

#### 🔧 Docker

- Language support: NestJS, Express, React, Go, Rust, Laravel, Rails, Spring Boot, .NET, etc.
- Optional database config: PostgreSQL, MongoDB, MySQL, Redis
- Built-in Nginx (SPA mode or reverse proxy)
- User-defined services via text input
- `.env.sample` and `.dockerignore` generation
- Multi-stage Dockerfiles with sensible build commands

#### ⚙️ GitHub Actions

- Environment-based workflows: `dev`, `staging`, `prod`
- Stack-aware setup (Node, Go, Rust, Java, etc.)
- Support for test/build/dockerize phases
- Fallback if no stack specified

#### ☁️ Terraform (AWS only)

- Optional infra: EC2, RDS, S3, ECS, VPC
- Default values with override capability
- Output IPs and URLs
- Sane security defaults for quick prototyping

---

## 🔁 Flow (Behind the Scenes)

1. **User answers CLI or API questions**
2. Answers go into a `context builder` (per config type)
3. Context is passed through a **Mustache transformer**
4. Templates are populated + saved to an output directory
5. Directory is zipped and returned to the user

---

## 🔮 Future Additions

- GCP + Azure Terraform support
- Kubernetes (K8s) modules
- Remote deployment hooks (e.g., to ECS or DigitalOcean)
- Web-based config builder (powered by the same API)
- Live preview before zip/download
- Preset saving & sharing

---

## 🧠 Philosophy

- ✅ Opinionated defaults — always work out of the box
- 🧱 Modular templates — extend easily per stack or provider
- 🧘 Don’t ask the user for 50 things — just the 5 that matter
- 📦 Output should be deployable today, not “someday”

---

## 🛠 Dev Setup (Locally)

```bash
# install deps
npm install

# run CLI (WIP)
npm cli

# run API (WIP)
npm run start:dev
```

---

## 📚 Tech Stack

- Node.js + TypeScript
- Mustache for templating
- Archiver for zip generation
- Inquirer for CLI UX
- NestJS for the API

---

## ✍️ Author

Built with too much caffeine and a sprinkle of rage by [@alexin](https://github.com/alexindevs).

---

InfraBuddy isn’t here to replace DevOps engineers —  
it’s here to stop solo devs from burning out trying to be one.
