# Developer Endpoints

All endpoints are prefixed with the backend URL (default `http://localhost:3001`).

## Profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/developer/profile?id={developer_id}` | Full profile for the logged-in developer (stats, activity, account info) |
| GET | `/api/developer/profile/:username` | Public profile visible to anyone |

## Issues

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/developer/issues?developer_id={id}` | List all issues claimed/submitted/completed by the developer |
| GET | `/api/developer/issues/stats?developer_id={id}` | Aggregated stats: open count, claimed count, total value, earned total |
| POST | `/api/developer/issues/claim` | Claim a configured issue — body: `{ developer_id, configured_issue_id }` |
| POST | `/api/developer/issues/submit` | Submit work on a claimed issue — body: `{ developer_id, configured_issue_id }` |

## Earnings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/developer/earnings?developer_id={id}` | Earnings summary: total earned, pending, completed count, and payout history |

## Existing (unchanged)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/github?role=developer` | GitHub OAuth login |
| GET | `/auth/github/callback` | OAuth callback handler |
| GET | `/api/repos?installation_id={id}` | List repos on an installation |
| POST | `/api/repos/connect` | Connect a repo |
| DELETE | `/api/repos/connect` | Disconnect a repo |
| GET | `/api/repos/connected?installation_id={id}` | List connected repos |
| GET | `/api/installations` | List all installations |
| GET | `/api/issues?installation_id={id}` | Fetch open issues from GitHub for connected repos |
| POST | `/api/issues/configure` | Save issues with salaries |
