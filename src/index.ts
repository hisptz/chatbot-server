import {config} from "dotenv";
import express from "express";
import message from "./routes/message/routes";
import flowRoutes from "./routes/flows/routes";
import helmet from "helmet"
import RateLimit from "express-rate-limit"
import {initPrisma} from "./client";

config()
const port = process.env.PORT || 3000;
const apiMountPoint = process.env.API_MOUNT_POINT || "/api";
const app = express();

app.use(express.json());
app.use(helmet.contentSecurityPolicy({
    useDefaults: true
}))

const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 100
})

app.use(limiter);

app.use(express.urlencoded({extended: true}));

app.use(express.static("public"));

app.use(`${apiMountPoint}/chat`, message);
app.use(`${apiMountPoint}/flows`, flowRoutes);

app.get('/', (req, res) => {
    res.send("Hello, Welcome to the chat-bot!, Some of the routes are /entries");
})


initPrisma().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);

    })
});


