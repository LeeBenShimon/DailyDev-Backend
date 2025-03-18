import express, { Express } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import postsRoutes from "./routes/posts_routes";
import bodyParser from "body-parser";
import commentsRoutes from "./routes/comments_routes";
import authRoutes from "./routes/auth_routes";
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import profileRoutes from "./routes/profile_route";
// import path from "path";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Dev 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{ url: "http://localhost:3000" }],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

function initApp() {
    return new Promise<Express>((resolve, reject) => {
        if (!process.env.DB_CONNECT) {
            console.error("DB_CONNECT is not set");
            return reject();
        }

        mongoose.connect(process.env.DB_CONNECT).then(() => {
            console.log("Connected to MongoDB");

            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(cookieParser());

            // API Routes
            app.use("/posts", postsRoutes);
            app.use("/comments", commentsRoutes);
            app.use("/auth", authRoutes);
            app.use("/user/profile", profileRoutes);

            // // ✅ Serve static files from the correct `public/` location
            // const publicPath = path.join(__dirname, "../public");
            // app.use(express.static(publicPath));

            // // ✅ Redirect `/` to `index.html`
            // app.get("/", (req, res) => {
            //     res.sendFile(path.join(publicPath, "index.html"));
            // });

            resolve(app);
        }).catch((error) => {
            console.error("MongoDB Connection Error:", error);
            reject();
        });
    });
}

export default initApp;
