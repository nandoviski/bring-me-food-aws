import express from "express";
import { presignUpload, deleteUpload } from "../controllers/uploadController";

const router = express.Router();
router.post("/presign", presignUpload);
router.post("/delete", deleteUpload);
export default router;
