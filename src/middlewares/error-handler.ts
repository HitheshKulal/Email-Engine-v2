import { type Request, type Response, type NextFunction } from "express";
import { CustomAPIError } from "../errors/custom-error.js";
import zod from "zod";

/**
 * Handles and responds to errors in the Express application.
 * @param {Error} err - The error object to be handled.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Response} The Express response object with an appropriate error message and status code.
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): Response => {
    if (err instanceof zod.ZodError) {
        const errorMessages: Record<string, string> = {};

        err.issues.forEach((issue) => {
            const path = issue.path.join(".");
            errorMessages[path] = issue.message;
        });

        return res.status(400).json(errorMessages);
    }

    if (err instanceof CustomAPIError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    return res
        .status(500)
        .json({ message: "Something Went Wrong, Please Try Again Later.....!!!!" });
};