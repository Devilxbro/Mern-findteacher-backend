// /**
//  * Middlewares.ts
//  * -----------------------------------------------------
//  * This file bundles up all the core middlewares used
//  * across the project. Think of this as the "security
//  * and sanity net" for our API.
//  *
//  * Covered here:
//  * - Logging (so we know what’s happening in real-time)
//  * - Security headers (to avoid silly exploits)
//  * - CORS (so our frontend can talk to us)
//  * - Input cleaning (to block NoSQL injection & XSS)
//  * - Rate limiting (so no one spams the server)
//  * - JWT auth (so we know who’s talking to us)
//  * - Role-based permissions (so not everyone is an admin)
//  * - Validation (so bad data never hits our services)
//  * - 404 handling (clear message if route doesn’t exist)
//  * - Error handler (catch all, keep the app from crashing)
//  */
//
// import { Application, Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import helmet from "helmet";
// import cors from "cors";
// import morgan from "morgan";
// import xssClean from "xss-clean";
// import mongoSanitize from "express-mongo-sanitize";
// import rateLimit from "express-rate-limit";
// import { ZodObject } from "zod";
// import { UserModel } from "../Db/entities/User.ts";
//
// // Secret used for signing JWTs
// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
//
// // Extend Request type so we can safely attach user info
// export interface AuthRequest extends Request {
//     user?: { userId: string };
// }
//
// /* -----------------------------------------------------
//    Core app-wide middlewares (security, logging, cleanup)
// ----------------------------------------------------- */
// export const applyGlobalMiddleware = (app: Application) => {
//     // Logs every request (method, URL, status, response time)
//     app.use(morgan("combined"));
//
//     // Sets common security headers (prevents clickjacking, sniffing, etc.)
//     app.use(helmet());
//
//     // Allow frontend requests – adjust origin for production
//     app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
//
//     // Clean user input to prevent XSS attacks
//     app.use(xssClean());
//
//     // Prevent MongoDB operator injection ($gt, $or, etc.)
//     app.use(mongoSanitize());
//
//     // Basic DDoS / brute-force protection
//     app.use(
//         "/api",
//         rateLimit({
//             windowMs: 15 * 60 * 1000, // 15 minutes
//             max: 100, // limit each IP
//             message: "Too many requests, take a breather.",
//             standardHeaders: true,
//             legacyHeaders: false,
//         })
//     );
// };
//
// /* -----------------------------------------------------
//    JWT authentication – verify token & attach user to req
// ----------------------------------------------------- */
// export const authMiddleware = (
//     req: AuthRequest,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const authHeader = req.headers.authorization;
//         if (!authHeader?.startsWith("Bearer ")) {
//             return res.status(401).json({ error: "No token, no entry 🚫" });
//         }
//
//         const token = authHeader.split(" ")[1];
//         const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
//
//         // Store user info on request for next handlers
//         req.user = { userId: decoded.userId };
//         next();
//     } catch {
//         return res.status(401).json({ error: "Invalid or expired token ⚠️" });
//     }
// };
//
// /* -----------------------------------------------------
//    Role-based access control – e.g., admin-only routes
// ----------------------------------------------------- */
// export const roleMiddleware = (roles: string[]) => {
//     return async (req: AuthRequest, res: Response, next: NextFunction) => {
//         try {
//             if (!req.user?.userId) {
//                 return res.status(401).json({ error: "Login required" });
//             }
//
//             const user = await UserModel.findById(req.user.userId);
//             if (!user) {
//                 return res.status(401).json({ error: "User doesn’t exist" });
//             }
//
//             if (!roles.includes(user.role)) {
//                 return res.status(403).json({ error: "You don’t have access here 🚫" });
//             }
//
//             next();
//         } catch {
//             return res.status(500).json({ error: "Something went wrong with role check" });
//         }
//     };
// };
//
// /* -----------------------------------------------------
//    Validation middleware – hook into Zod schemas
// ----------------------------------------------------- */
// export const validate = (schema: ZodObject) => (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         schema.parse(req.body);
//         next();
//     } catch (err: any) {
//         return res.status(400).json({ error: err.errors || "Validation failed" });
//     }
// };
//
// /* -----------------------------------------------------
//    404 handler – catch unknown routes
// ----------------------------------------------------- */
// export const notFoundMiddleware = (req: Request, res: Response) => {
//     res.status(404).json({ error: `Route ${req.originalUrl} doesn’t exist 🤷‍♂️` });
// };
//
// /* -----------------------------------------------------
//    Global error handler – last line of defense
// ----------------------------------------------------- */
// export const errorMiddleware = (
//     err: any,
//     _req: Request,
//     res: Response,
//     _next: NextFunction
// ) => {
//     console.error(" Uncaught Error:", err);
//
//     res.status(err.status || 500).json({
//         error: err.message || "Something broke on our end",
//         stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//     });
// };


import { Application, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import xssClean from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { ZodObject } from 'zod';
import { UserModel } from '../Db/entities/User';
import envConfig from '../Config/env.ts';
const config = envConfig();

const JWT_SECRET = config.JWT_SECRET;


// const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

// Global Middleware
export const applyGlobalMiddleware = (app: Application) => {
  app.use(morgan('combined'));
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
  app.use(xssClean());
  app.use(mongoSanitize());

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests, take a breather.',
    })
  );
};

// Auth Middleware
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, no entry 🚫' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token ⚠️' });
  }
};

// Role-based Access
export const roleMiddleware = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Login required' });
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'User doesn’t exist' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'You don’t have access here 🚫' });
      }

      next();
    } catch {
      return res.status(500).json({ error: 'Something went wrong with role check' });
    }
  };
};

// Validation Middleware
export const validate = (schema: ZodObject<any>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || 'Validation failed' });
  }
};

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} doesn’t exist 🤷‍♂️` });
};

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Uncaught Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Something broke on our end',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
