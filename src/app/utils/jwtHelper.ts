import jwt from 'jsonwebtoken';

export const createToken = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const verifyToken = <T>(token: string, secret: string): T => {
  return jwt.verify(token, secret) as T;
};