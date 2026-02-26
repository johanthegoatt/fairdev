import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthTokenPayload = JwtPayload & {
  userId: string;
  email: string;
};

export function signAccessToken(user: { id: string; email: string }): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    subject: user.id,
  };

  return jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET as Secret, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET as Secret) as AuthTokenPayload;
}
