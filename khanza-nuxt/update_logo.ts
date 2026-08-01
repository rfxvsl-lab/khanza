import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL || "file:./local.db",
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function updateLogo() {
  await db.execute({
    sql: "UPDATE site_config SET value = '/logo-baru.png' WHERE key = 'logo_url'",
    args: []
  });
  console.log("Logo updated in DB");
}

updateLogo();
