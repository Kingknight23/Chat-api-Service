// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";

// import authenticate from "./middleware/auth.js";
// import errorHandler from "./middleware/error.js";

// import authRoutes from "./routes/auth.routes.js";
// import friendRoutes from "./routes/friend.routes.js";
// import groupRoutes from "./routes/group.routes.js";
// import broadcastRoutes from "./routes/broadcast.routes.js";
// import conversationRoutes from "./routes/conversation.routes.js";
// import messageRoutes from "./routes/message.routes.js";
// const app = express();

// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(morgan("dev"));

// app.get(
//     "/health",
//     (req, res) => {
//         res.json({
//             status: "ok",
//             service: "chat-api"
//         });
//     }
// );

// /*
//  * Public routes
//  */
// app.use("/api/auth",authRoutes);

// /*
//  * Protected routes
//  */
// app.use(authenticate);

// app.use("/api/friends",friendRoutes);

// app.use("/api/groups",groupRoutes);

// app.use("/api/broadcasts",broadcastRoutes);

// app.use("/api/conversations",conversationRoutes);

// app.use("/api/conversations",messageRoutes);

// app.use(errorHandler);

// export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authenticate from "./middleware/auth.js";
import errorHandler from "./middleware/error.js";

import authRoutes from "./routes/auth.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import groupRoutes from "./routes/group.routes.js";
import broadcastRoutes from "./routes/broadcast.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import keyRoutes from "./routes/key.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get(
    "/health",
    (req, res) => {
        res.json({
            status: "ok",
            service: "chat-api"
        });
    }
);

/*
 * Public routes
 */
app.use(
    "/api/auth",
    authRoutes
);

/*
 * Protected routes
 */
app.use(authenticate);

app.use(
    "/api/friends",
    friendRoutes
);

app.use(
    "/api/groups",
    groupRoutes
);

app.use(
    "/api/broadcasts",
    broadcastRoutes
);

app.use(
    "/api/conversations",
    conversationRoutes
);

app.use(
    "/api/conversations",
    messageRoutes
);

app.use(
    "/api/keys",
    keyRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(errorHandler);

export default app;