import { type Response, type NextFunction } from "express";
import { type AuthenticatedRequest } from "../middlewares/authentication.js";

/**
 * A function that handles Express requests and returns a promise.
 */
type RequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => Promise<void>;

/**
 * Wraps Request handler function.
 * @param func - The asynchronous request handler function.
 * @returns A new request handler function that handles errors.
 */
export const asyncWrapper = (func: RequestHandler): RequestHandler => {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            await func(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};