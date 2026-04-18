# Driver API Endpoints

Base URL: `process.env.API_URL` (default: `http://localhost:3001`)

---

## Company

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

---

## Developer

### `GET /api/developer/issues`
Returns issues claimed by or available to the authenticated developer.

**Query params:** `status?`, `page?`, `limit?`

**Response:**
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
Returns aggregate stats for the developer's issues dashboard.

**Response:**
```json
{
  "openCount": 6,
  "claimedCount": 3,
  "totalValue": 2350,
  "earnedTotal": 4800
}
```

---

### `GET /api/developer/profile`
Returns the authenticated developer's profile.

**Response:**
```json
{
  "username": "jamie_k",
  "initials": "JK",
  "githubConnected": true,
  "model": "claude-3-7"
}
```
