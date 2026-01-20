import { Router } from "express";
import { regsiterUser } from "../controllers/auth.controllers.js";

const router = Router();

router.route("/register").post(regsiterUser);

export default router;