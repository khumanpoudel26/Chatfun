import { Router } from "express";
import * as chat from "../controllers/chat.controllers"
import { uploadFile } from "../middlewares/multer";
import { isAuthenticated } from "../middlewares/isAuthenticated";
const chatRoutes = Router();


chatRoutes.post('/create-chat', isAuthenticated, chat.CreateChat);
chatRoutes.post('/create-group', isAuthenticated, chat.CreateGroupChat);
chatRoutes.get('/chatlist', isAuthenticated, chat.ChatList);
chatRoutes.post('/send-message', isAuthenticated, uploadFile.single("attachment"), chat.SendMessage);
chatRoutes.get('/:id', isAuthenticated, chat.Conversation);
chatRoutes.patch('/read-message/:id', isAuthenticated, chat.ReadMessage);
chatRoutes.patch('/edit-message',isAuthenticated, chat.EditMessage);
export default chatRoutes;