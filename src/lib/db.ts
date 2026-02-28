import { createClient } from "@libsql/client";
import 'dotenv/config';

export const db = createClient({
  url: process.env.TURSO_CONNECTION_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
