import { Router } from "express";
import * as user from "../controllers/user.controllers"
import { uploadProfile } from "../middlewares/multer";
import { rateLimiter } from "../middlewares/rateLimiter";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const userRoutes = Router();


userRoutes.post('/register', rateLimiter(20, 160), uploadProfile.single('profile'), user.Register);
userRoutes.post('/login', rateLimiter(20, 160), user.Login);
userRoutes.post('/logout', user.Logout);
userRoutes.get('/me', isAuthenticated, user.Me);
userRoutes.get('/find', isAuthenticated, user.FindUser);
userRoutes.post('/send-verification', rateLimiter(10, 160),user.SendEmailVerification);
userRoutes.post('/verify-email', rateLimiter(20, 90),user.VerifyEmail);
export default userRoutes;