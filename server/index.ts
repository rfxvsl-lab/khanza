import express from "express";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import 'dotenv/config';

import { setupDb } from "./config/database";
import { runSeeders } from "./seeders";
import { errorHandler } from "./middleware/errorHandler";
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = 3000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Setup DB & Seed
async function initDatabase() {
    await setupDb();
    await runSeeders();
}
initDatabase();

// Routes
app.use(publicRoutes);
app.use(adminRoutes);

// Error handler
app.use(errorHandler);

async function startServer() {
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
