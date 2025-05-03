import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateRefreshToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateVerifyToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateAccessToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateApiKey(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateSecret(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateSalt(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateHash(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateChallenge(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateVerifier(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateCode(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateScope(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateRedirectUri(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateClientId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateClientSecret(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateAuthorizationCode(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateIdToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
} 