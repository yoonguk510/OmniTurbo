import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

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
    req: ExpressRequest;
    res: ExpressResponse;
  }
}
