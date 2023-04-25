import {config} from "dotenv";
import express from "express";
// import entries from "./routes/message";
import treeRoutes from "./routes/trees/routes";

config()
const port = process.env.PORT || 3000;
const apiMountPoint = process.env.API_MOUNT_POINT || "/api";
const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(express.static("public"));

// app.use(`${apiMountPoint}/message`, entries);
app.use(`${apiMountPoint}/trees`, treeRoutes);

app.get('/', (req, res) => {
    res.send("Hello, Welcome to the chat-bot!, Some of the routes are /entries");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);

})

