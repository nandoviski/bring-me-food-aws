import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

/* MIDDLEWARE IMPORTS */
import { authMiddleware } from "./middleware/auth";

/* ROUTE IMPORTS */
import mealRoutes from "./routes/mealRoutes";
import menuRoutes from "./routes/menuRoutes";
import chefRoutes from "./routes/chefRoutes";
import customerRoutes from "./routes/customerRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import orderRoutes from "./routes/orderRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  }),
);

/* AUTHENTICATION MIDDLEWARE */
app.use(authMiddleware);

/* ROUTES */
const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.send("Hello, this is the Bring Me Food API!");
});

apiRouter.use("/meals", mealRoutes);
apiRouter.use("/menus", menuRoutes);
apiRouter.use("/chefs", chefRoutes);
apiRouter.use("/customers", customerRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/orders", orderRoutes);

// Mount the router with a prefix
app.use("/api", apiRouter);

/* SERVER */
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}/api`);
});
