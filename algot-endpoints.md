# Driver API Endpoints

## `/company/signup`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/companies/signup` | Create a new company account with email/password. Redirects to `/company/connect-repo` on success. |
| `GET` | `/auth/github?role=company` | Initiate GitHub OAuth flow for company signup. |

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

### `GET /auth/github?role=company`

Redirects the browser to GitHub OAuth. After authorization, GitHub redirects back to the backend callback which sets a session and redirects the user to `/company/connect-repo`.

---

## `/developer/signup`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/developers/signup` | Create a new developer account with email/password and Anthropic API key. Redirects to `/repos` on success. |
| `GET` | `/auth/github?role=developer` | Initiate GitHub OAuth flow for developer signup. |
| `GET` | `/auth/google?role=developer` | Initiate Google OAuth flow for developer signup. |
| `GET` | `/developers/leaderboard/week` | Fetch the top-earning developer for the current week (displayed on the left panel). |

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

### `GET /developers/leaderboard/week`

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

## `/editor`

Session ID is passed as a query param: `/editor?sessionId=<id>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sessions/:id` | Fetch session data — issue, file tree, diff stats, usage, user. |
| `GET` | `/sessions/:id/messages` | Fetch chat message history for this session. |
| `POST` | `/sessions/:id/messages` | Send a message to Claude. Returns Claude's reply. |
| `POST` | `/sessions/:id/submit` | Submit the fix for company review. Redirects to `/repos/detail` on success. |

### `GET /sessions/:id`

**Response** `200`
```json
{
  "issue": { "id": 384, "title": "Fix race condition in streaming response handler", "labels": ["bug", "P1"], "bounty": "$450", "repoName": "claude-tools" },
  "files": [{ "name": "src", "type": "folder", "children": [{ "name": "streaming.ts", "type": "file", "active": true, "ext": "ts" }] }],
  "diff": { "added": 24, "removed": 3 },
  "usage": { "tokens": 2400, "cost": "≈ $0.007" },
  "user": { "initials": "JK" }
}
```

### `GET /sessions/:id/messages`

**Response** `200` — array of `{ "role": "claude" | "user" | "system", "content": "..." }`

### `POST /sessions/:id/messages`

**Body** `{ "content": "..." }`

**Response** `200` — `{ "role": "claude", "content": "..." }`

### `POST /sessions/:id/submit`

**Response** `200` → redirect to `/repos/detail`
