import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config();

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  try {
    const res = await db.execute("PRAGMA table_info(services)");
    console.log("Table info:", res.rows);
    
    const count = await db.execute("SELECT count(*) as c FROM services");
    console.log("Count:", count.rows[0].c);
  } catch (e) {
    console.error("DB Error:", e);
  }
})();
