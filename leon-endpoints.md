# Driver API Endpoints — Company Issues

Base URL: `process.env.API_URL` (default: `http://localhost:3001`)

---

## Issues

### `GET /api/company/issues`
Returns a paginated list of issues.

**Query params:** `repo?`, `status?`, `page?`, `limit?`

**Response:**
```json
{
  "issues": [
    {
      "id": "#384",
      "title": "Fix race condition in streaming response handler",
      "repo": "claude-tools",
      "status": "open | claimed | in_review | completed",
      "label": "bug | enhancement | feature | security | a11y",
      "salary": "450",
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
Returns aggregate stats for the issues dashboard.

**Response:**
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

## Repos

### `GET /api/company/repos`
Returns all repos connected to the company account.

**Response:**
```json
[
  { "name": "claude-tools", "full": "acme-corp/claude-tools" },
  { "name": "design-system", "full": "acme-corp/design-system" },
  { "name": "api-gateway",   "full": "acme-corp/api-gateway"  }
]
```

---

## Profile

### `GET /api/company/profile`
Returns the authenticated company's profile.

**Response:**
```json
{
  "name": "Acme Corp",
  "initials": "AC",
  "plan": "Pro plan"
}
```
