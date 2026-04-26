import http from "http"
import express, { type NextFunction, type Request, type Response } from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/user.routes";
import errorHandler from "./middlewares/errorHandler";
import emptyBody from "./middlewares/emptyBody";
import chatRoutes from "./routes/chat.routes";


dotenv.config({})

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
//app.use(emptyBody); // Middleware to check for empty body in POST, PUT, PATCH, DELETE requests
const PORT = process.env.PORT || 8081

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Healthy"
    })
});

app.use('/api/user', userRoutes);
app.use('/api/chat',chatRoutes);
app.use(errorHandler);



server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

