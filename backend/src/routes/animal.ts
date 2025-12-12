import { type Request, type Response } from "express";
import express from "express";
import { validator } from "../middlewares/validator";
import { type IAnimalController } from "../interfaces/animal.controller.interface";
import * as schemas from "../schemas/animal.schema";

const api = express.Router();

api.get("/", (req: Request, res: Response) => {});
