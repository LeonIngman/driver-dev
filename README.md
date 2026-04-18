# Driver

A marketplace for repo fixes. Companies connect their GitHub repos, developers browse open issues and submit code changes — companies preview and approve before a PR is ever opened.

---

## How it works

1. Company links their private repo to Driver
2. Driver is added as a collaborator via GitHub App
3. Developers browse open issues on the Driver platform
4. Developer opens a fix window — Claude-assisted or manual — and implements a solution
5. On submit, Driver spins up a live preview of the changes
6. Company approves → Driver opens a PR revealing the source code

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js |
| Backend | Hono (Node) |
| Database | PostgreSQL + Prisma |
| GitHub Integration | GitHub App + Octokit |
| AI | Anthropic SDK (Claude) |
| Editor | Monaco Editor |
| Preview Sandboxes | e2b |
| Infrastructure | Docker Compose |

---

## Monorepo Structure

The project is split into two apps — a Next.js frontend and a Hono API — and a shared packages layer for the database client and TypeScript types. Both apps run in Docker and share a PostgreSQL database.

The API is responsible for all GitHub communication, preview sandbox orchestration via e2b, and AI interactions with Claude. The frontend handles auth, the issue browser, and the fix editor.

---

## GitHub App

Driver integrates with GitHub as a GitHub App rather than standard OAuth. This means Driver acts as its own bot identity with explicit, scoped permissions — rather than impersonating the logged-in user. When a company connects their repo, they install the Driver GitHub App, granting it access to read issues and open pull requests on their behalf.

Webhooks from GitHub are received by the API and used to keep Driver's view of issues in sync with the repo.

---

## Preview Deployments

When a developer submits a fix, Driver uses e2b to spin up an isolated sandbox environment, applies the code changes, and exposes a live preview URL. This gives the company a real, running version of their site with the proposed fix before any code is merged. No changes touch the actual repo until the company approves.

---

## Getting Started

Prerequisites: Docker, Node.js 20+, a GitHub App, an e2b account, and an Anthropic API key.

Both apps are configured via environment variables covering database connection, GitHub App credentials, e2b and Anthropic API keys, and NextAuth config for the web layer.
