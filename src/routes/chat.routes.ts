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
chatRoutes.delete('/delete-message',isAuthenticated,chat.DeleteMessage);
chatRoutes.post('/group/add-member', isAuthenticated, chat.AddMember);
chatRoutes.delete('/group/leave', isAuthenticated, chat.LeaveGroupChat);
chatRoutes.delete('/group/remove-member', isAuthenticated, chat.RemoveMember);
chatRoutes.get('/group/members', isAuthenticated, chat.GroupMembers);
export default chatRoutes;