import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./Constants/Router.ts";
// import { models } from "./Constants/DbIndex.ts"; // central models import
import { connectDB } from "./Db/connection.ts";

const app: Application = express();

// ----------------------
// Global Middleware
// ----------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ----------------------
// Connect to MongoDB
// ----------------------
connectDB()
    .then(() => console.log("Database ready is working"))
    .catch((err) => {
        console.error("❌ Database connection failed", err);
        process.exit(1);
    });




app.use(routes);


app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Server is healthy 🚀" });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
