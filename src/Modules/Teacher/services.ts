import { UserModel } from "../../Db/entities/User.ts";
import { ReviewModel } from "../../Db/entities/Review.ts";
import { Types } from "mongoose";
import debug from "debug";

const log = debug("app:teacher-service");

export class TeacherService {
    private static instance: TeacherService;
    private constructor() {}
    public static getInstance() {
        if (!TeacherService.instance) TeacherService.instance = new TeacherService();
        return TeacherService.instance;
    }

  async listTeachers(filter: any = {}) {
    log("listTeachers filter:", filter);

    const page = parseInt(filter.page || "1", 10);
    const limit = parseInt(filter.limit || "10", 10);
    const skip = (page - 1) * limit;

    const query: any = { role: "teacher", isActive: true };

    if (filter.isFeatured) query.isFeatured = true;

    if (filter.minRating) query.rating = { $gte: Number(filter.minRating) };


    if (filter.maxHourlyRate) query.hourlyRate = { $lte: Number(filter.maxHourlyRate) };


    if (filter.nearby && filter.latitude && filter.longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(filter.longitude), Number(filter.latitude)],
          },
          $maxDistance: filter.maxDistance || 10000, // meters (10km default)
        },
      };
    }


    const sort: any = {};
    if (filter.sortBy === "rating") sort.rating = -1;           // Top Rated
    else if (filter.sortBy === "hourlyRate") sort.hourlyRate = 1; // Cheapest first
    else sort.createdAt = -1;                                    // Default: newest first

    log("MongoDB query:", query);
    log("Sort:", sort);

    const [teachers, total] = await Promise.all([
      UserModel.find(query)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      teachers,
      total,
      page,
      totalPages,
      nextPage,
    };
  }


  async getTeacherById(id: string) {
        const teacher = await UserModel.findById(id).select("-password").lean();
        if (!teacher) throw new Error("Teacher not found");
        return teacher;
    }

    async addReview(teacherId: string, studentId: string, rating: number, feedback?: string) {
        const review = await ReviewModel.create({ teacherId, studentId, rating, feedback });

        // Recalculate average rating for teacher
        const stats = await ReviewModel.aggregate([
            { $match: { teacherId: new Types.ObjectId(teacherId) } },
            { $group: { _id: "$teacherId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            await UserModel.findByIdAndUpdate(teacherId, {
                rating: stats[0].avgRating,
                totalReviews: stats[0].totalReviews,
            });
        }

        return review;
    }


    async getReviews(teacherId: string) {
        return ReviewModel.find({ teacherId })
            .populate("studentId", "fullName email")
            .sort({ createdAt: -1 });
    }
}
