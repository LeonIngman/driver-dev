import postgres from 'postgres'

export const sql = postgres(process.env.DATABASE_URL!)

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
  `

  await sql`
    CREATE TABLE IF NOT EXISTS github_installations (
      id SERIAL PRIMARY KEY,
      installation_id INTEGER UNIQUE NOT NULL,
      account_login TEXT NOT NULL,
      account_type TEXT NOT NULL DEFAULT 'Organization',
      company_id UUID REFERENCES companies(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

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
  `

  await sql`
    CREATE TABLE IF NOT EXISTS configured_issues (
      id SERIAL PRIMARY KEY,
      installation_id INTEGER NOT NULL,
      repo_full_name TEXT NOT NULL,
      issue_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      salary INTEGER NOT NULL DEFAULT 0,
      labels TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(installation_id, repo_full_name, issue_number)
    )
  `

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
  `

  await sql`
    CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      github_id TEXT UNIQUE,
      plan TEXT NOT NULL DEFAULT 'Free',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

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
  `
}
