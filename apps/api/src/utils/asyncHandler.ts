import { Request, Response, NextFunction } from 'express';

// Express 5 types params as string | string[], but named route params are always string
export type AppRequest = Request & { params: Record<string, string> };

type AsyncFn = (req: AppRequest, res: Response, next: NextFunction) => Promise<any>;

export function asyncHandler(fn: AsyncFn) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as unknown as AppRequest, res, next).catch(next);
  };
}
