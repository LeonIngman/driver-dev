# Driver — Master API Reference

**Base URL:** `process.env.API_URL` (default: `http://localhost:3001`)

---

## Database Schema

### `companies`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `org_name` | `text` | |
| `email` | `text` | unique |
| `password_hash` | `text` | null for OAuth-only accounts |
| `github_id` | `text` | nullable |
| `plan` | `text` | e.g. `"Pro plan"` |
| `created_at` | `timestamptz` | |

### `developers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `first_name` | `text` | |
| `last_name` | `text` | |
| `username` | `text` | unique |
| `email` | `text` | unique |
| `password_hash` | `text` | null for OAuth-only accounts |
| `github_id` | `text` | nullable |
| `google_id` | `text` | nullable |
| `anthropic_api_key` | `text` | encrypted at rest |
| `preferred_model` | `text` | e.g. `"claude-3-7"` |
| `created_at` | `timestamptz` | |

### `repos`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `company_id` | `uuid` | FK → companies |
| `org` | `text` | GitHub org/user name |
| `name` | `text` | repo name |
| `full_name` | `text` | `org/name` |
| `description` | `text` | |
| `lang` | `text` | primary language |
| `stars` | `int` | |
| `created_at` | `timestamptz` | |

### `repo_tags`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `repo_id` | `uuid` | FK → repos |
| `tag` | `text` | e.g. `"ai"`, `"sdk"`, `"bug"` |

### `issues`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `repo_id` | `uuid` | FK → repos |
| `title` | `text` | |
| `status` | `text` | `open \| claimed \| in_review \| completed` |
| `label` | `text` | `bug \| enhancement \| feature \| security \| a11y` |
| `priority` | `text` | `P1 \| P2 \| P3` — nullable |
| `salary` | `int` | USD cents |
| `comments_count` | `int` | |
| `updated_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |

### `issue_developers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `issue_id` | `uuid` | FK → issues |
| `developer_id` | `uuid` | FK → developers |
| `claimed_at` | `timestamptz` | |

### `sessions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `issue_id` | `uuid` | FK → issues |
| `developer_id` | `uuid` | FK → developers |
| `tokens_used` | `int` | |
| `cost_usd` | `numeric(10,6)` | |
| `submitted_at` | `timestamptz` | nullable — null until submitted |
| `created_at` | `timestamptz` | |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `session_id` | `uuid` | FK → sessions |
| `role` | `text` | `user \| claude \| system` |
| `content` | `text` | |
| `created_at` | `timestamptz` | |

### `github_installations`
Stores GitHub App installations created during company onboarding.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` | PK |
| `installation_id` | `integer` | unique — GitHub's installation ID |
| `account_login` | `text` | GitHub org/user login |
| `account_type` | `text` | `Organization \| User` |
| `company_id` | `uuid` | FK → companies — nullable until linked post-signup |
| `created_at` | `timestamptz` | |

### `connected_repos`
Repos a company selects during onboarding. Sourced from `github_installations`; eventually promoted to the `repos` table.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` | PK |
| `installation_id` | `integer` | FK → github_installations.installation_id |
| `repo_id` | `integer` | GitHub's numeric repo ID |
| `repo_full_name` | `text` | e.g. `"acme-org/my-repo"` |
| `private` | `boolean` | |
| `connected_at` | `timestamptz` | |

### `configured_issues`
Issues a company configures with salaries during onboarding. Sourced from `connected_repos`; eventually promoted to the `issues` table.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` | PK |
| `installation_id` | `integer` | FK → github_installations.installation_id |
| `repo_full_name` | `text` | e.g. `"acme-org/my-repo"` |
| `issue_number` | `integer` | GitHub issue number |
| `title` | `text` | |
| `salary` | `integer` | USD cents |
| `labels` | `text[]` | GitHub label names |
| `created_at` | `timestamptz` | |

---

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/companies/signup` | Email/password signup for companies |
| `POST` | `/developers/signup` | Email/password signup for developers |
| `GET` | `/auth/github?role=company` | GitHub OAuth — company |
| `GET` | `/auth/github?role=developer` | GitHub OAuth — developer |
| `GET` | `/auth/google?role=developer` | Google OAuth — developer |

### `POST /companies/signup`
**Body**
```json
{
  "orgName": "Acme Corp",
  "email": "you@company.com",
  "password": "supersecret"
}
```
**Success** `201` → redirect to `/company/connect-repo`
**Error** `4xx` → `{ "message": "..." }`

---

### `POST /developers/signup`
**Body**
```json
{
  "firstName": "Jamie",
  "lastName": "Klein",
  "email": "you@example.com",
  "password": "supersecret",
  "anthropicApiKey": "sk-ant-api03-…"
}
```
**Success** `201` → redirect to `/repos`
**Error** `4xx` → `{ "message": "..." }`

---

### `GET /auth/github?role=company|developer`
Redirects to GitHub OAuth. On callback, sets session and redirects to:
- `company` → `/company/connect-repo`
- `developer` → `/repos`

> **Current implementation:** The backend's `GET /auth/github` redirects to GitHub App installation (not OAuth). Full OAuth login for both roles is not yet implemented — see the [Onboarding](#onboarding-github-app-installation) section for what's currently wired up.

---

## Onboarding (GitHub App Installation)

These endpoints drive the company onboarding flow: installing the GitHub App, selecting repos, and configuring issue salaries. All installation-scoped endpoints require `installation_id`.

> **Currently implemented** in `driver-backend/src/index.ts`. The onboarding tables (`github_installations`, `connected_repos`, `configured_issues`) hold staging data that is later promoted to the core `repos` / `issues` tables once a company account is fully linked.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/github` | Redirect to GitHub App installation page |
| `GET` | `/auth/github/callback` | GitHub posts here after install; stores record, redirects to frontend |
| `GET` | `/api/repos?installation_id=` | List repos available on the installation (from GitHub) |
| `POST` | `/api/repos/connect` | Save a repo as connected |
| `DELETE` | `/api/repos/connect` | Remove a connected repo |
| `GET` | `/api/repos/connected?installation_id=` | List repos already connected for an installation |
| `GET` | `/api/installations` | List all recorded GitHub App installations |
| `GET` | `/api/issues?installation_id=` | Fetch open issues from GitHub across connected repos |
| `POST` | `/api/issues/configure` | Save issues with salary amounts to `configured_issues` |

### `GET /auth/github`
Redirects the browser to the GitHub App installation page.

> **Note:** This is GitHub App installation (not OAuth user login). URL: `https://github.com/apps/{GITHUB_APP_SLUG}/installations/new`

---

### `GET /auth/github/callback`
GitHub redirects here after the app is installed.

**Query params:** `?installation_id=123&setup_action=install`

Stores the record in `github_installations`, then redirects to:
```
{FRONTEND_URL}/company/connect-repo?installation_id=123
```

---

### `GET /api/repos?installation_id=:id`
Lists repos available on the given GitHub App installation. Calls the GitHub API.

**Response** `200`
```json
{
  "repos": [
    {
      "id": 123456,
      "name": "my-repo",
      "full_name": "acme-org/my-repo",
      "private": false,
      "language": "TypeScript",
      "stars": 42,
      "issues": 8,
      "pushed_at": "2025-04-15T10:00:00Z"
    }
  ]
}
```

---

### `POST /api/repos/connect`
Saves a repo as connected for an installation.

**Body**
```json
{
  "installation_id": 123,
  "repo_id": 456,
  "repo_full_name": "acme-org/my-repo",
  "private": false
}
```
**Response** `200`
```json
{ "connected": { /* connected_repos row or null if already existed */ } }
```

---

### `DELETE /api/repos/connect`
Removes a connected repo.

**Body**
```json
{ "installation_id": 123, "repo_id": 456 }
```
**Response** `200`
```json
{ "ok": true }
```

---

### `GET /api/repos/connected?installation_id=:id`
Lists repos already connected for an installation.

**Response** `200`
```json
{
  "repos": [
    {
      "id": 1,
      "installation_id": 123,
      "repo_id": 456,
      "repo_full_name": "acme-org/my-repo",
      "private": false,
      "connected_at": "2025-04-15T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/installations`
Lists all recorded GitHub App installations.

**Response** `200`
```json
{
  "installations": [
    {
      "id": 1,
      "installation_id": 123,
      "account_login": "acme-org",
      "account_type": "Organization",
      "created_at": "2025-04-15T09:00:00Z"
    }
  ]
}
```

---

### `GET /api/issues?installation_id=:id`
Fetches open issues from GitHub across all connected repos for the installation. Excludes pull requests.

**Response** `200`
```json
{
  "issues": [
    {
      "number": 384,
      "title": "Fix race condition in streaming response handler",
      "repo": "acme-org/my-repo",
      "labels": ["bug"],
      "created_at": "2025-04-01T12:00:00Z",
      "html_url": "https://github.com/acme-org/my-repo/issues/384"
    }
  ]
}
```

---

### `POST /api/issues/configure`
Saves issues with salary configuration to `configured_issues`. Upserts on `(installation_id, repo_full_name, issue_number)`.

**Body**
```json
{
  "installation_id": 123,
  "issues": [
    {
      "repo_full_name": "acme-org/my-repo",
      "issue_number": 384,
      "title": "Fix race condition in streaming response handler",
      "salary": 45000,
      "labels": ["bug"]
    }
  ]
}
```
**Response** `200`
```json
{ "ok": true, "count": 1 }
```

---

## Company

### `GET /api/company/profile`
**Response** `200`
```json
{
  "name": "Acme Corp",
  "initials": "AC",
  "plan": "Pro plan"
}
```

---

### `GET /api/company/repos`
**Response** `200`
```json
[
  { "name": "claude-tools", "full": "acme-corp/claude-tools" }
]
```

---

### `GET /api/company/issues`
**Query params:** `repo?`, `status?`, `page?`, `limit?`

**Response** `200`
```json
{
  "issues": [
    {
      "id": "#384",
      "title": "Fix race condition in streaming response handler",
      "repo": "claude-tools",
      "status": "open | claimed | in_review | completed",
      "label": "bug | enhancement | feature | security | a11y",
      "salary": 450,
      "devs": 2,
      "devInitials": ["JK", "LM"],
      "devColors": ["#3B82F6", "#8B5CF6"],
      "updated": "12m ago"
    }
  ],
  "total": 34
}
```

---

### `GET /api/company/issues/stats`
**Response** `200`
```json
{
  "openCount": 5,
  "inProgressCount": 3,
  "activeDevs": 7,
  "totalValue": 3075,
  "total": 34
}
```

---

## Developer

### `GET /api/developer/profile`
**Response** `200`
```json
{
  "username": "jamie_k",
  "initials": "JK",
  "githubConnected": true,
  "model": "claude-3-7"
}
```

---

### `GET /api/developer/issues`
**Query params:** `status?`, `page?`, `limit?`

**Response** `200`
```json
{
  "issues": [
    {
      "id": "384",
      "title": "Fix race condition in streaming response handler",
      "repo": "anthropic/claude-tools",
      "status": "open | claimed | in_review | completed",
      "labels": ["bug", "P1"],
      "salary": 450,
      "devs": 2,
      "devInitials": ["JK", "LM"],
      "devColors": ["#3B82F6", "#8B5CF6"],
      "comments": 7,
      "updated": "12m ago"
    }
  ],
  "total": 10
}
```

---

### `GET /api/developer/issues/stats`
**Response** `200`
```json
{
  "openCount": 6,
  "claimedCount": 3,
  "totalValue": 2350,
  "earnedTotal": 4800
}
```

---

### `GET /api/developer/leaderboard/week`
Returns the top-earning developer for the current week.

**Response** `200`
```json
{
  "username": "jamie_k",
  "initials": "JK",
  "fixesCount": 12,
  "earned": "$3,240"
}
```

---

## Repos (Marketplace)

> **Note:** `GET /api/repos` without `installation_id` is the marketplace endpoint (reads from DB). `GET /api/repos?installation_id=` is the onboarding endpoint (reads from GitHub API) — see the [Onboarding](#onboarding-github-app-installation) section.

### `GET /api/repos`
**Response** `200`
```json
[
  {
    "org": "Anthropic",
    "orgInitial": "A",
    "orgColor": "#CC785C",
    "name": "claude-tools",
    "description": "Utility library for building Claude-powered applications.",
    "lang": "TypeScript",
    "langDot": "lang-ts",
    "issues": 12,
    "totalValue": 4850,
    "avgSalary": 404,
    "devs": 9,
    "stars": 3210,
    "tags": ["ai", "sdk", "bug"]
  }
]
```

---

### `GET /api/repos/stats`
**Response** `200`
```json
{
  "totalIssues": 99,
  "totalValue": 43460,
  "activeDevs": 87
}
```

---

### `GET /api/repos/:org/:repo`
**Response** `200`
```json
{
  "org": "Anthropic",
  "orgInitial": "A",
  "orgColor": "#CC785C",
  "name": "claude-tools",
  "fullName": "anthropic / claude-tools",
  "description": "Utility library for building Claude-powered applications.",
  "lang": "TypeScript",
  "langDot": "lang-ts",
  "stars": 3210,
  "tags": ["ai", "sdk", "llm"]
}
```

---

### `GET /api/repos/:org/:repo/issues`
**Response** `200`
```json
[
  {
    "id": "384",
    "title": "Fix race condition in streaming response handler",
    "status": "open | claimed | in_review | completed",
    "labels": ["bug", "P1"],
    "salary": 450,
    "devs": 2,
    "devInitials": ["JK", "LM"],
    "devColors": ["#3B82F6", "#8B5CF6"],
    "comments": 7,
    "updated": "12m ago"
  }
]
```

---

## Sessions (Editor)

Session ID is passed as a query param on the frontend: `/editor?sessionId=<id>`

### `GET /api/sessions/:id`
**Response** `200`
```json
{
  "issue": {
    "id": 384,
    "title": "Fix race condition in streaming response handler",
    "labels": ["bug", "P1"],
    "bounty": "$450",
    "repoName": "claude-tools"
  },
  "files": [
    {
      "name": "src",
      "type": "folder",
      "children": [
        { "name": "streaming.ts", "type": "file", "active": true, "ext": "ts" }
      ]
    }
  ],
  "diff": { "added": 24, "removed": 3 },
  "usage": { "tokens": 2400, "cost": "≈ $0.007" },
  "user": { "initials": "JK" }
}
```

---

### `GET /api/sessions/:id/messages`
**Response** `200`
```json
[
  { "role": "user | claude | system", "content": "..." }
]
```

---

### `POST /api/sessions/:id/messages`
**Body**
```json
{ "content": "..." }
```
**Response** `200`
```json
{ "role": "claude", "content": "..." }
```

---

### `POST /api/sessions/:id/submit`
Submits the fix for company review.

**Response** `200` → redirect to `/repos/detail`
