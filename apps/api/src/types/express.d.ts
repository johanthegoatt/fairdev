import type { Request } from "express";

declare global {
  namespace Express {
    interface UserContext {
      id: string;
      email: string;
    }

    interface Request {
      user?: UserContext;
    }
  }
}

export type RequestWithUser = Request & { user: Express.UserContext };