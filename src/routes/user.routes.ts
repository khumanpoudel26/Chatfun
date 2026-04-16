import { Router } from "express";
import * as user from "../controllers/user.controllers"
import { uploadProfile } from "../middlewares/multer";
import { rateLimiter } from "../middlewares/rateLimiter";

const userRoutes = Router();


userRoutes.post('/register', uploadProfile.single('profile'), user.Register);
userRoutes.post('/login', rateLimiter(20, 160), user.Login);
export default userRoutes;