import jwt, { type Secret, type JwtPayload } from "jsonwebtoken";
import { type NextFunction, type Request, type Response } from "express";
import { CustomAPIError } from "../errors/custom-error.js";
import { asyncWrapper } from "../utility/async-wrapper.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

const authenticateUser = asyncWrapper(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new CustomAPIError("Unauthorized request", 401);
        }
        try {
            const jwtSecret = process.env.JWT_ACCESS_SECRET as Secret || "test";
            const payload = jwt.verify(token, jwtSecret) as JwtPayload;
            req.user = { id: payload.id };
            console.log(JSON.stringify(req.user))
            next();
        } catch (error) {
            throw new CustomAPIError("Unauthorized request", 401);
        }
    },
);

export default authenticateUser;