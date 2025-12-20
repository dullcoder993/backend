import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controller";

const router = Router()

router.route("/health").get(healthCheck)
