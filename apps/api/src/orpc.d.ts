import { Request as ExpressRequest } from 'express';

declare module 'express' {
  interface Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
  }
}

declare module '@orpc/nest' {
  export interface ORPCGlobalContext {
    request: ExpressRequest;
  }
}
