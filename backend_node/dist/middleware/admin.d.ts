import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
export declare function adminMiddleware(req: AuthenticatedRequest, res: Response, next: Function): Promise<Response<any, Record<string, any>> | undefined>;
export default adminMiddleware;
//# sourceMappingURL=admin.d.ts.map