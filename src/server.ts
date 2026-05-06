import http from "http"
import express, { type NextFunction, type Request, type Response } from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/user.routes";
import errorHandler from "./middlewares/errorHandler";
import emptyBody from "./middlewares/emptyBody";
import chatRoutes from "./routes/chat.routes";
import { Server } from "socket.io";
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";
dotenv.config({})

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://chatfunapp.lovable.app"],
        credentials: true
    }
});
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(cors({
    origin: ["http://localhost:5173", "https://chatfunapp.lovable.app"],
    credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
//app.use(emptyBody); // Middleware to check for empty body in POST, PUT, PATCH, DELETE requests

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    const user_id = socket.handshake.query.user_id;

    socket.on("join_chat", (chat_id) => {
        socket.join(`${chat_id}`);
        console.log(`User ${user_id} joined chat ${chat_id}`)
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", user_id);
    });

});


const PORT = process.env.PORT || 8081

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Healthy"
    })
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use(errorHandler);



server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export { io }