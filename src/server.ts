import http from "http"
import express from "express"
import dotenv from "dotenv"

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

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

