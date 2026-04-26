import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { CreateMessage, CreateMessageRead, GenerateChat, GenerateGroupChat, GetChatList, GetConversation } from "../services/chat.services";
import { ReqUser } from "../types/user.types";
import apiResponse from "../utils/apiResponse";



export const CreateChat = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const user_id = req.body.user_id
    const result = await GenerateChat(user_id, (req.user as ReqUser).id);
    apiResponse(res, 201, "Chat created successfully", result);
});



export const CreateGroupChat = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const group_name = req.body.group_name;
    const result = await GenerateGroupChat(group_name, (req.user as ReqUser).id);
    apiResponse(res, 201, "Group chat created successfully", result);
});



export const ChatList = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const result = await GetChatList((req.user as ReqUser).id);
    apiResponse(res, 200, "Chatlist fetched successfully", result);
});



export const SendMessage = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { message, chat_id } = req.body;
    const attachment = req?.file
    const result = await CreateMessage(Number(chat_id), (req.user as ReqUser).id, message, attachment?.buffer);
    return apiResponse(res, 201, "Message sent successfully", result);
});


export const Conversation = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const chat_id = req.params.id;
    const req_user = req.user as ReqUser
    const result = await GetConversation(Number(chat_id), req_user.id);
    return apiResponse(res, 200, "Chat fetched successfully", result[0]);
}
);


export const ReadMessage = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const message_id = req.params.id;
    const result = await CreateMessageRead(Number(message_id), (req.user as ReqUser).id);
    return apiResponse(res, 200, result.message);
}
);