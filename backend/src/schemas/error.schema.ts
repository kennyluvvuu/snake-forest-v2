import { z } from "zod";

// Error Schemas for Swagger documentation
export const NotFoundErrorSchema = z.object({
    statusCode: z.literal(404),
    error: z.string(),
    message: z.string(),
});

export const InternalServerErrorSchema = z.object({
    statusCode: z.literal(500),
    error: z.string(),
    message: z.string(),
});

export const BadRequestErrorSchema = z.object({
    statusCode: z.literal(400),
    error: z.string(),
    message: z.string(),
});

export const UnauthorizedErrorSchema = z.object({
    statusCode: z.literal(401),
    error: z.string(),
    message: z.string(),
});

export const ForbiddenErrorSchema = z.object({
    statusCode: z.literal(403),
    error: z.string(),
    message: z.string(),
});

export const ConflictErrorSchema = z.object({
    statusCode: z.literal(409),
    error: z.string(),
    message: z.string(),
});