import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyTokenUnified, TokenPayload } from '../utils/jwt';
import { User, IUser, UserRole } from '../models/User';
import { sendError } from '../utils/response';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: TokenPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication required. Please provide a valid Bearer token.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    let payload: TokenPayload;

    try {
      payload = await verifyTokenUnified(token);
    } catch (err: any) {
      sendError(res, `Invalid or expired authentication token: ${err.message}`, 401);
      return;
    }

    let user;
    if (payload.isAuth0 && payload.auth0Id) {
      user = await User.findOne({
        $or: [{ auth0Id: payload.auth0Id }, { email: payload.email.toLowerCase() }],
      });

      if (!user) {
        // Auto-provision Auth0 authenticated patient profile
        user = await User.create({
          auth0Id: payload.auth0Id,
          email: payload.email.toLowerCase(),
          fullName: payload.email.split('@')[0],
          role: payload.role || 'USER',
          isEmailVerified: true,
          isActive: true,
        });
      } else if (!user.auth0Id) {
        user.auth0Id = payload.auth0Id;
        await user.save();
      }
    } else {
      user = await User.findById(payload.userId);
    }

    if (!user) {
      sendError(res, 'Account not found. Authentication rejected.', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Account has been deactivated. Please contact support.', 403);
      return;
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
      return;
    }

    next();
  };
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);
    if (user && user.isActive) {
      req.user = user;
      req.tokenPayload = payload;
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }

  next();
}
