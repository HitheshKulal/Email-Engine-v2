import { type NextFunction, type Response, type Request } from "express";
import { asyncWrapper } from "../utility/async-wrapper.js";
import { createCustomError } from "../errors/custom-error.js";
import { EmailManager } from "../model/EmailManager.js";
import { comparePassword } from "../utility/comparePassword.js";
import { generateAccessTokenAndRefreshToken } from "../utility/jwtGenerator.js";
import { UserManager } from "../model/UserManager.js";
import { escape } from "querystring";


export const signupUser = asyncWrapper(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const userManger = new UserManager();
        console.log(JSON.stringify(req.body))
        const isUserExist = await userManger.searchUserIndexByEmail(req.body.email)
        if (isUserExist.length > 0) {
            return res.status(409).render('404', { pageTitle: "User already exists" });
        }
        const validatedUser = await userManger.validateUser(req.body);
        const newUser = await userManger.indexUser(validatedUser);
        res.status(303)
            .render("login.hbs", { pageTitile: "Log in" })
    }
)


export const loginUser = asyncWrapper(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const userManger = new UserManager();
        const emailManager = new EmailManager();
        const { email, password } = req.body;
        const user = await userManger.searchUserIndexByEmail(email);
        console.log(user)
        if (user.length === 0) {
            return res.status(404).render('404', { pageTitle: "User does not exist" });
        }
        const id = user[0]._id;
        const hashedPassword = user[0]._source.password;
        const isPasswordCorrect = await comparePassword(password, hashedPassword);
        if (!isPasswordCorrect) {
            return res.status(401).render('404', { pageTitle: "Invalid Credentials" });
        }
        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(id);
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 30 * 1000,
        };



        res.status(303)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .render("home.hbs")
    }
)


export const logoutUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        req.session.destroy(err => {
            if (err) {
                return next(err);
            }
            res
                .status(303)
                .clearCookie("accessToken")
                .clearCookie("refreshToken")
                .redirect('/');
        });
    }
);

