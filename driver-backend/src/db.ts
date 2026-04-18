import postgres from "postgres";

export const sql = postgres(process.env.DATABASE_URL!);

/** Run once at startup to ensure tables exist */
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_name TEXT NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      github_id TEXT UNIQUE,
      plan TEXT NOT NULL DEFAULT 'Free',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS github_installations (
      id SERIAL PRIMARY KEY,
      installation_id INTEGER UNIQUE NOT NULL,
      account_login TEXT NOT NULL,
      account_type TEXT NOT NULL DEFAULT 'Organization',
      company_id UUID REFERENCES companies(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS connected_repos (
      id SERIAL PRIMARY KEY,
      installation_id INTEGER NOT NULL REFERENCES github_installations(installation_id),
      repo_id INTEGER NOT NULL,
      repo_full_name TEXT NOT NULL,
      private BOOLEAN DEFAULT false,
      connected_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(installation_id, repo_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS developers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      username TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      github_id TEXT UNIQUE,
      anthropic_api_key TEXT,
      preferred_model TEXT NOT NULL DEFAULT 'claude-opus-4-6',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,
      installation_id INTEGER NOT NULL,
      repo_full_name TEXT NOT NULL,
      issue_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      salary INTEGER NOT NULL DEFAULT 0,
      labels TEXT[] DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'open',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(installation_id, repo_full_name, issue_number)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS developer_issues (
      id SERIAL PRIMARY KEY,
      developer_id UUID NOT NULL REFERENCES developers(id),
      issue_id INTEGER NOT NULL REFERENCES issues(id),
      status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed','submitted','completed')),
      claimed_at TIMESTAMPTZ DEFAULT NOW(),
      submitted_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      UNIQUE(developer_id, issue_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      repo_full_name TEXT NOT NULL,
      issue_number INTEGER NOT NULL,
      developer_id UUID REFERENCES developers(id),
      status TEXT NOT NULL DEFAULT 'active',
      branch_name TEXT,
      default_branch TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Add columns if they don't exist (for existing databases)
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS branch_name TEXT`
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS default_branch TEXT`
}
