import type { ZodSchema } from "zod/v3";
import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";

export function validator<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({
                    error: "Validation failed, check your data",
                    details: e.issues,
                });
            }
            next(e);
        }
    };
}
