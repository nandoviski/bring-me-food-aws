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

/* CONFIGURATIONS */
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
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
  })
);

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello, this is the Bring Me Food API!");
});

app.use("/meals", mealRoutes);
app.use("/menus", menuRoutes);
app.use("/chefs", chefRoutes);

/* SERVER */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
