import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
export type SessionClaims = { userId: string; email: string };
export function createToken(claims: SessionClaims) { return jwt.sign(claims, process.env.JWT_SECRET || 'development-secret-change-me', { expiresIn: '7d' }); }
export async function getSession(): Promise<SessionClaims | null> {
  const token = cookies().get('iv_session')?.value; if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET || 'development-secret-change-me') as SessionClaims; } catch { return null; }
}
