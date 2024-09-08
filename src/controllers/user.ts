import { type NextFunction, type Response, type Request } from "express";
import { asyncWrapper } from "../utility/async-wrapper.js";
import { createCustomError } from "../errors/custom-error.js";
import { EmailManager } from "../model/EmailManager.js";
import { comparePassword } from "../utility/comparePassword.js";
import { generateAccessTokenAndRefreshToken } from "../utility/jwtGenerator.js";


export const signupUser = asyncWrapper(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const emailManager = EmailManager.getInstance();
        console.log(JSON.stringify(req.body))
        const isUserExist = await emailManager.searchUserIndexByEmail(req.body.email)
        console.log("isUserExist" + JSON.stringify(isUserExist))
        if (isUserExist.length > 0) {
            throw createCustomError("User already exists", 409);
        }
        console.log("data " + JSON.stringify(req.body))
        const validatedUser = await emailManager.validateUser(req.body);
        console.log("validatedUser " + JSON.stringify(validatedUser))
        const newUser = await emailManager.indexUser(validatedUser);
        res.status(201).json(newUser)
        console.log("sign up ")
    }
)


export const loginUser = asyncWrapper(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const emailManager = EmailManager.getInstance();
        const { email, password } = req.body;
        const user = await emailManager.searchUserIndexByEmail(email);
        console.log(user)
        if (user.length === 0) {
            throw createCustomError("Invalid Credentials", 401);
        }
        const id = user[0]._id;
        const hashedPassword = user[0]._source.password;
        const isPasswordCorrect = await comparePassword(password, hashedPassword);
        if (!isPasswordCorrect) {
            throw createCustomError("Invalid Credentials", 401);
        }
        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(id);
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 30 * 1000,
        };
        const loggedInUser = {
            email
        };


        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ loggedInUser, accessToken, refreshToken });
        // res.send("login sucessfull <a href=\"/\">Home</a>")
    }
)


export const logoutUser = asyncWrapper(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        console.log("log out")
        const user = {
            id: "1230"
        }
        if (true) {
            res.status(201).json(user);
        } else {
            throw createCustomError(`Id: ${user.id} already exists`, 400);
        }
    }
)

