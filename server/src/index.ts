import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

/* MIDDLEWARE IMPORTS */
import { authMiddleware } from "./middleware/auth";

/* ROUTE IMPORTS */
import mealRoutes from "./routes/mealRoutes";
import menuRoutes from "./routes/menuRoutes";
import chefRoutes from "./routes/chefRoutes";
import customerRoutes from "./routes/customerRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import subscriberRoutes from "./routes/subscriberRoutes";
import paymentRoutes, { stripeWebhookRouter } from "./routes/paymentRoutes";
import promoCodeRoutes from "./routes/promoCodeRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 3000;

/* S3 / MINIO BUCKET SETUP */
import { createS3Client, ensureBucketExists } from "./lib/s3Client";
const s3 = createS3Client();
const bucket = process.env.S3_BUCKET || "bring-me-food";
ensureBucketExists(s3, bucket).catch((e) => console.error("[S3] Startup bucket check failed:", e));

// ⚠️ Stripe webhook MUST be mounted before bodyParser.json()
// Stripe requires the raw request body to verify the webhook signature
app.use("/api/stripe", stripeWebhookRouter);

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* AUTHENTICATION MIDDLEWARE */
app.use(authMiddleware);

/* ROUTES */
const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.send("Hello, this is the Bring Me Food API!");
});

// Health check — used by Railway / load balancers
apiRouter.get("/health", async (req, res) => {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: "error", db: "disconnected", ts: new Date().toISOString() });
  } finally {
    await prisma.$disconnect();
  }
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/meals", mealRoutes);
apiRouter.use("/menus", menuRoutes);
apiRouter.use("/chefs", chefRoutes);
apiRouter.use("/customers", customerRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/orders", paymentRoutes); // payment routes mount on /orders too (e.g. /orders/:id/checkout)
apiRouter.use("/subscribers", subscriberRoutes);
apiRouter.use("/promo-codes", promoCodeRoutes);

// Mount the router with a prefix
app.use("/api", apiRouter);

/* SERVER */
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}/api`);
});
