import { Router } from "express";
import * as user from "../controllers/user.controllers"
import { uploadProfile } from "../middlewares/multer";

const userRoutes = Router();


userRoutes.post('/register', uploadProfile.single('profile'), user.Register);
userRoutes.post ('/login', user.Login);
export default userRoutes;