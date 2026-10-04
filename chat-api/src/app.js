import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authenticate from "./middleware/auth.js";
import errorHandler from "./middleware/error.js";

import friendRoutes from "./routes/friend.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";


const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "chat-api"
    });
});


app.use(authenticate);


app.use("/api/friends", friendRoutes);


app.use("/api/conversations",conversationRoutes);

app.use("/api/conversations", messageRoutes);

app.use(errorHandler);

export default app;