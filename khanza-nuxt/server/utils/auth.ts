import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'khanza-repaint-secret-key-change-me';

export function generateToken(userId: number, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
