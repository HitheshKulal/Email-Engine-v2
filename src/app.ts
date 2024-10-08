import express, { type Request, type Response } from "express";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";
import path from "path";
import authenticateUser from "./middlewares/authentication.js";
import outlookRouter from "./routes/auth.js"
import emailRouter from "./routes/email.js"
import session from 'express-session';
import { EmailManager } from "./model/EmailManager.js";
import { engine as expressHbs } from "express-handlebars"
import { UserManager } from "./model/UserManager.js";
import { ElasticSearchManager } from "./model/ElasticSearchManager.js";


const app = express();
const templatePath = path.join(__dirname, "../src/views");

console.log(templatePath);
console.log(process.env.EXPRESS_SESSION_SECRET)
// The port on which the server will listen
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // to parse application/x-www-form-urlencoded

app.use(session({
    secret: "123",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
    }
}));


// app.engine(
//     'hbs',
//     expressHbs({
//         layoutsDir: '/views/layouts/',
//         defaultLayout: 'main-layout',
//         extname: 'hbs'
//     })
// );
// Set Handlebars as the view engine
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(path.join(__dirname, "../src/public")));


app.use("/auth", outlookRouter);



app.use("/user", userRouter);
app.use(authenticateUser)
app.use("/mail", emailRouter);
app.get("/", (req: Request, res: Response) => {
    res.render("home")
});

const elasticSearch = ElasticSearchManager.getInstance();
elasticSearch.initializeIndex()



// Start the server
app.listen(port, () => {
    console.log(`Listening on port ${port}.....`);

});

// export default app;
