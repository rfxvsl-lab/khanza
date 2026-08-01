import { verifyToken } from '../utils/auth';

export default defineEventHandler((event) => {
    const url = getRequestURL(event);
    
    // Only protect /api/admin/* routes except login
    if (url.pathname.startsWith('/api/admin/') && url.pathname !== '/api/admin/login') {
        const authHeader = getHeader(event, 'authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
        }

        try {
            const decoded = verifyToken(token);
            event.context.user = decoded;
        } catch (e) {
            throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" });
        }
    }
});
