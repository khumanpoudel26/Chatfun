import http from "http"
import express, { type NextFunction, type Request, type Response } from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/user.routes";
import errorHandler from "./middlewares/errorHandler";


dotenv.config({})

const app = express();
const server = http.createServer(app);

app.use(express.json());


const PORT = process.env.PORT || 8081

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Healthy"
    })
});

app.use('/api/user', userRoutes);
app.use(errorHandler);


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

