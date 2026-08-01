import { db } from '../../utils/db';
import { generateToken, comparePassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const user = await db.execute({ sql: "SELECT * FROM users WHERE email = ? AND role = 'admin'", args: [body.email] });
    if (user.rows.length > 0 && await comparePassword(body.password, user.rows[0].password)) {
        return { success: true, token: generateToken(user.rows[0].id, body.email) };
    }
    throw createError({ statusCode: 401, statusMessage: "Invalid" });
});