import { Request, Response, NextFunction } from "express";
import { SessionService } from "../BookingManagemnt/services.ts";
import { ApiError } from "../../../Utls/ApiError.ts";

const sessionService = SessionService.getInstance();

export class SessionController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await sessionService.listSessions({
        teacherId: req.query.teacherId as string,
        studentId: req.query.studentId as string,
        date: req.query.date as string,
      });
      res.json({ success: true, data: sessions });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(400, error.message));
      } else {
        next(new ApiError(400, "Unknown error occurred"));
      }
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await sessionService.getSessionById(req.params.id);
      res.json({ success: true, data: session });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(404, error.message));
      } else {
        next(new ApiError(404, "Unknown error occurred"));
      }
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sessionService.cancelSession(req.params.id, req.body.reason);
      res.json({ success: true, ...result });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(400, error.message));
      } else {
        next(new ApiError(400, "Unknown error occurred"));
      }
    }
  }

  static async analytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await sessionService.getAnalytics();
      res.json({ success: true, data: stats });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(500, error.message));
      } else {
        next(new ApiError(500, "Unknown error occurred"));
      }
    }
  }
}
