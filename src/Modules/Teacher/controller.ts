import { Request, Response } from "express";
import { TeacherService } from "../Teacher/services.ts";
import debug from "debug";

const log = debug("app:teacher-controller");

export class TeacherController {
    private static instance: TeacherController;
    private service = TeacherService.getInstance();

    private constructor() {}
    public static getInstance() {
        if (!TeacherController.instance) TeacherController.instance = new TeacherController();
        return TeacherController.instance;
    }

    async listTeachers(req: Request, res: Response) {
        try {
            const filter = req.query;
            const data = await this.service.listTeachers(filter);
            res.json({ success: true, data });
        } catch (err: any) {
            log("listTeachers error:", err.message);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getTeacher(req: Request, res: Response) {
        try {
            const data = await this.service.getTeacherById(req.params.id);
            res.json({ success: true, data });
        } catch (err: any) {
            log("getTeacher error:", err.message);
            res.status(404).json({ success: false, message: err.message });
        }
    }

    async addReview(req: Request, res: Response) {
        try {
            const { studentId, rating, comment } = req.body;
            const data = await this.service.addReview(req.params.id, studentId, rating, comment);
            res.json({ success: true, data });
        } catch (err: any) {
            log("addReview error:", err.message);
            res.status(400).json({ success: false, message: err.message });
        }
    }

    async getReviews(req: Request, res: Response) {
        try {
            const data = await this.service.getReviews(req.params.id);
            res.json({ success: true, data });
        } catch (err: any) {
            log("getReviews error:", err.message);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
