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

// Setup DB & Seed
let dbInitialized = false;
async function initDatabase() {
    if (dbInitialized) return;
    await setupDb();
    await runSeeders();
    dbInitialized = true;
}

// Initialize DB on first request
app.use(async (req, res, next) => {
    try {
        await initDatabase();
        next();
    } catch (err) {
        console.error('DB init error:', err);
        next(err);
    }
});

// Routes
app.use(publicRoutes);
app.use(adminRoutes);

// Error handler
app.use(errorHandler);

export default app;
