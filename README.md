# Dschang's Signal — Frontend

> Citizen issue reporting platform for the city of Dschang.  
> Built with **React 19 · Vite · Tailwind CSS**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

**Repository:** https://github.com/uni2growcm/dschang-signal-fe  
**API counterpart:** https://github.com/uni2growcm/dschang-signal-api

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## Overview

Dschang's Signal is a web application where citizens report urban problems (broken traffic lights, potholes, fallen trees, etc.) and city administrators review, accept, and track their resolution. This repository contains the React SPA frontend.

**User roles:**

- **Citizen** — submits reports, views the public feed, deletes their own pending reports.
- **Admin** — moderates incoming reports (accept/reject), updates report status (Pending → In Progress → Resolved).

---

## Prerequisites

Make sure the following are installed on your machine:

| Tool    | Minimum version |
| ------- | --------------- |
| Node.js | 20.x            |
| npm     | 10.x            |

> The backend API and database are managed separately. See the [API repository](https://github.com/uni2growcm/dschang-signal-api) for setup instructions.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/uni2growcm/dschang-signal-fe.git
cd dschang-signal-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values (see [Environment Variables](#environment-variables) below).

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

> Make sure the backend API is running before using the app. Follow the setup guide in the [API repository](https://github.com/uni2growcm/dschang-signal-api).

---

## Environment Variables

Create a `.env.local` file at the project root. All variables must be prefixed with `VITE_` to be exposed to the browser.

| Variable            | Description                      | Example                        |
| ------------------- | -------------------------------- | ------------------------------ |
| `VITE_API_BASE_URL` | Base URL of the backend REST API | `http://localhost:8080/api/v1` |

**Example `.env.local`:**

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

> Never commit `.env.local` or any file containing real secrets. It is already listed in `.gitignore`.

---

## Available Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR           |
| `npm run build`   | Build optimized production assets to `dist/` |
| `npm run preview` | Locally preview the production build         |
| `npm run lint`    | Run ESLint across the source tree            |
| `npm run test`    | Run unit tests with Vitest                   |

---

## Project Structure

```
src/
├── api/              # Axios instance and request/response interceptors
├── components/       # Reusable UI components (Button, Badge, Modal, …)
├── features/
│   ├── auth/         # Login, Register pages and useAuth hook
│   ├── reports/      # Feed, ReportCard, ReportDetail, Submit pages
│   └── admin/        # Admin moderation queue and status controls
├── hooks/            # Shared custom hooks
├── router/           # Route definitions, ProtectedRoute, RoleGuard
├── store/            # Auth context (JWT state)
└── utils/            # Date formatting, status label maps, validators
```

---

## Contributing

Thank you for considering a contribution to Dschang's Signal!

### Workflow

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Make your changes.** Keep commits small and focused.
3. **Write or update tests** for any logic you add or change.
4. **Lint your code** before committing:
   ```bash
   npm run lint
   ```
5. **Open a Pull Request** against the `main` branch with a clear description of what was changed and why.

### Branch naming

| Prefix      | Use for                                     |
| ----------- | ------------------------------------------- |
| `feat/`     | New features                                |
| `fix/`      | Bug fixes                                   |
| `chore/`    | Tooling, dependencies, config               |
| `docs/`     | Documentation only                          |
| `refactor/` | Code restructuring without behaviour change |

### Code style

- Follow the existing ESLint and Prettier configuration.
- Use **named exports** for components; keep one component per file.
- Prefer **React Query** for all server-state; avoid storing API data in React context.
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/).

### Reporting bugs

Open a [GitHub Issue](https://github.com/uni2growcm/dschang-signal-fe/issues) with a clear title, steps to reproduce, expected vs. actual behaviour, and your browser/OS version.
