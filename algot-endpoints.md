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
