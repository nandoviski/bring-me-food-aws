import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

/* ROUTE IMPORTS */
import mealRoutes from "./routes/mealRoutes";
import menuRoutes from "./routes/menuRoutes";
import chefRoutes from "./routes/chefRoutes";
import customerRoutes from "./routes/customerRoutes";

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
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello, this is the Bring Me Food API!");
});

app.use("/meals", mealRoutes);
app.use("/menus", menuRoutes);
app.use("/chefs", chefRoutes);
app.use("/customers", customerRoutes);

/* SERVER */
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
