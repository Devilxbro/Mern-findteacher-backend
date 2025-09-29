import { Router } from "express";
import { TeacherController } from "../Teacher/controller";
import { authMiddleware } from "../../Middleware/Middleware";
import { ROUTES } from "../../Constants/constants";

const router = Router();
const controller = TeacherController.getInstance();

/**
 * Teacher Routes
 */


router.get(ROUTES.TEACHERS.LIST, controller.listTeachers.bind(controller));
router.get(ROUTES.TEACHERS.DETAIL, controller.getTeacher.bind(controller));
router.get(ROUTES.TEACHERS.REVIEWS, controller.getReviews.bind(controller));
router.post(ROUTES.TEACHERS.ADD_REVIEW, authMiddleware, controller.addReview.bind(controller));
export default { path: ROUTES.TEACHERS.ROOT, router };
