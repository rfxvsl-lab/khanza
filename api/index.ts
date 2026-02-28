import express from "express";
import helmet from "helmet";
import cors from "cors";
import 'dotenv/config';

import { setupDb } from "../server/config/database";
import { runSeeders } from "../server/seeders";
import { errorHandler } from "../server/middleware/errorHandler";
import publicRoutes from "../server/routes/public";
import adminRoutes from "../server/routes/admin";

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Setup DB & Seed (lazy init, only once)
let dbInitialized = false;
async function initDatabase() {
    if (dbInitialized) return;
    try {
        console.log('[Vercel] Initializing database...');
        console.log('[Vercel] TURSO_CONNECTION_URL exists:', !!process.env.TURSO_CONNECTION_URL);
        console.log('[Vercel] TURSO_AUTH_TOKEN exists:', !!process.env.TURSO_AUTH_TOKEN);
        await setupDb();
        await runSeeders();
        dbInitialized = true;
        console.log('[Vercel] Database initialized successfully');
    } catch (err) {
        console.error('[Vercel] Database init error:', err);
        throw err;
    }
}

// Initialize DB on first request
app.use(async (req, res, next) => {
    try {
        await initDatabase();
        next();
    } catch (err: any) {
        console.error('[Vercel] Middleware DB error:', err?.message || err);
        res.status(500).json({
            error: "Database initialization failed",
            details: err?.message || "Unknown error",
            hint: "Check TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN in Vercel Environment Variables"
        });
    }
});

// Routes
app.use(publicRoutes);
app.use(adminRoutes);

// Error handler
app.use(errorHandler);

export default app;
