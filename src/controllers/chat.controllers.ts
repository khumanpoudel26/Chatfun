import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { CreateMessage, CreateMessageRead, DeleteMember, GenerateChat, GenerateGroupChat, GetChatList, GetConversation, InsertMember, LeaveGroup, SetDelete, UpdateMessage } from "../services/chat.services";
import { ReqUser } from "../types/user.types";
import apiResponse from "../utils/apiResponse";



export const CreateChat = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const user_id = req.body.user_id
    const result = await GenerateChat(Number(user_id), (req.user as ReqUser).id);
    apiResponse(res, 201, "Chat created successfully", result);
});



export const CreateGroupChat = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const group_name = req.body.group_name;
    const result = await GenerateGroupChat(String(group_name), (req.user as ReqUser).id);
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
    const result = await CreateMessage(
        Number(chat_id), (req.user as ReqUser).id,
        message,
        attachment?.buffer,
        Number(req.body?.reply_id)
    );
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
    return apiResponse(res, 204, result.message);
}
);



export const EditMessage = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { message_id, text } = req.body;
    const result = await UpdateMessage(Number(message_id), String(text), (req.user as ReqUser).id);
    return apiResponse(res, 200, "Message edited successfully", result);
}
);



export const DeleteMessage = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const message_id = req.body.message_id;
    const result = await SetDelete(Number(message_id), (req.user as ReqUser).id);
    return apiResponse(res, 204, "Message deleted successfully", result);
}
);



export const AddMember = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { username, chat_id } = req.body
    const result = await InsertMember(username, Number(chat_id), (req.user as ReqUser).id);
    return apiResponse(res, 200, result.message);
}
);


export const LeaveGroupChat = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const group_id = req.body.group_id;
    const result = await LeaveGroup(Number(group_id), (req.user as ReqUser).id);
    return apiResponse(res, 204, result.message);
}
);



export const RemoveMember = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { group_id, member_user_id } = req.body;
    const result = await DeleteMember(Number(group_id), Number(member_user_id), (req.user as ReqUser).id);
    return apiResponse(res, 204, result.message);
}
);