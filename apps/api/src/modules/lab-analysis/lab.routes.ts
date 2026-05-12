import { Router } from "express";
import { analyzeLabs } from "./lab.controller.js";

export const labRoutes = Router();

labRoutes.post("/analyze", analyzeLabs);
