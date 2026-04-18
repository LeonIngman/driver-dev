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
