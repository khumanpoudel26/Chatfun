import { id } from "zod/v4/locales"
import { prisma } from "../configs/client"
import redis from "../configs/redis"
import apiError from "../utils/apiError"
import { uploadCloud } from "../utils/uploadCloud"
import e from "express"



export const GenerateChat = async (
    user_id: number,
    req_user_id: number
) => {
    if (!user_id) {
        throw new apiError(400, "user_id is required");
    }
    if (user_id === req_user_id) {
        throw new apiError(403, "Forbidden");
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            id: user_id
        }
    });
    if (!existingUser) {
        throw new apiError(404, "User with this id not found");
    }

    const existingChat = await prisma.chat.findFirst({
        where: {
            is_group: false,
            members: {
                every: {
                    user_id: {
                        in: [user_id, req_user_id]
                    }
                },
            },
        },
        select: {
            id: true,
            is_group: true,
            members: {
                select: {
                    user_id: true
                }
            }
        }
    });
    if (existingChat) {
        throw new apiError(400, "Chat already exists");
    }


    const chat = await prisma.chat.create({
        data: {
            members: {
                create: [
                    { user_id: req_user_id },
                    { user_id: user_id }
                ]
            }
        },
        select: {
            id: true,
            is_group: false,
            created_at: true
        }
    });

    return chat;
}




export const GenerateGroupChat = async (
    group_name: string,
    req_user: number
) => {
    if (!group_name) {
        throw new apiError(400, "group_name shouldn't be empty");
    }

    const chat = await prisma.chat.create({
        data: {
            name: group_name,
            is_group: true,
            members: {
                create: {
                    user_id: req_user
                }
            }
        }
    });

    return chat;
}



export const GetChatList = async (
    req_user: number
) => {
    const cache = await redis.get(`chatlist:${req_user}`);

    if (cache) return JSON.parse(cache);

    const list = await prisma.chat.findMany({
        where: {
            members: {
                some: {
                    user_id: req_user
                }
            }
        },
        include: {
            messages: {
                where: {
                    is_deleted: false
                },
                include: {
                    reads: {
                        select: {
                            user_id: true
                        }
                    }
                },
                take: 1,
                orderBy: {
                    sent_at: 'desc'
                }
            },
            members: {
                where: {
                    NOT: {
                        user_id: req_user
                    }
                },
                select: {
                    member: {
                        select: {
                            id: true,
                            fullname: true,
                            username: true,
                            profile_picture: true
                        }
                    }
                },
                take: 1
            }
        }
    });

    const result = list.map(l => {
        const last_message = l.messages.map(m => {
            return {
                text: m.text,
                attachment: m.attachment,
                read_by_you: m.reads.some(r => r.user_id === req_user),
                sent_at: m.sent_at
            }
        });
        return {
            id: l.id,
            name: l.name,
            is_group: l.is_group,
            last_message: last_message[0] || null,
            chatting_with: !l.is_group ? l.members[0].member : undefined
        }
    });

    await redis.setex(`chatlist:${req_user}`, 900, JSON.stringify(result));
    return result;
}




export const CreateMessage = async (
    chat_id: number,
    req_user: number,
    message?: string,
    attachment?: Buffer
) => {
    if (!message && !attachment) {
        throw new apiError(400, "Provide message or attachment to send")
    }
    if (!chat_id) {
        throw new apiError(400, "Provide chat_id to send")
    }

    const chat = await prisma.chat.findUnique({
        where: {
            id: chat_id
        },
        include: {
            members: {
                select: {
                    user_id: true
                }
            }
        }
    });
    if (!chat) {
        throw new apiError(404, "Chat with this id not found")
    }
    if (!chat.members.some(m => m.user_id === req_user)) {
        throw new apiError(403, "Forbidden");
    }


    const data: {
        sender_id: number,
        chat_id: number
        text?: string
        attachment?: string
    } = {
        sender_id: req_user,
        chat_id,
    }
    if (message) data.text = message;
    if (attachment) {
        const url = await uploadCloud(attachment, "chatfun/medias");
        data.attachment = url
    }

    const msg = await prisma.message.create({
        data: {
            sender_id: data.sender_id,
            chat_id: data.chat_id,
            text: data.text,
            attachment: data.attachment,
            reads: {
                create: {
                    user_id: req_user
                }
            }
        }
    });

    await Promise.all(
        chat.members.map(m => {
            redis.del(`chatlist:${m.user_id}`);
        })
    );
    await redis.del(`chat:${chat_id}`);
    return msg;
}


export const GetConversation = async (
    chat_id: number,
    req_user: number
) => {

    if (!chat_id) {
        throw new apiError(400, "chat_user_id is required")
    }
    const existingChat = await prisma.chat.findUnique({
        where: {
            id: chat_id
        },
        include: {
            members: {
                select: {
                    user_id: true
                }
            }
        }
    });

    if (!existingChat) {
        throw new apiError(400, "Invalid chat_id provided");
    }
    if (!existingChat.members.some(m => m.user_id === req_user)) {
        throw new apiError(403, "Forbidden");
    }


    const cache = await redis.get(`chat:${chat_id}`);
    if (cache) return JSON.parse(cache)

    const chat = await prisma.chat.findMany({
        where: {
            id: chat_id
        },
        select: {
            id: true,
            name: true,
            is_group: true,
            created_at: true,
            messages: {
                select: {
                    id: true,
                    text: true,
                    attachment: true,
                    reads: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    fullname: true
                                }
                            }
                        }
                    },
                    is_edited: true,
                    is_deleted: true,
                    sender: {
                        select: {
                            id: true,
                            fullname: true,
                            profile_picture: true
                        }
                    }
                }
            }
        }
    });

    const result = chat.map(c => {
        return {
            ...c,
            name: c.is_group ? c.name : undefined,
            messages: c.messages.map(m => {
                return {
                    ...m,
                    text: !m.is_deleted ? m.text : "Deleted message",
                    attachment: !m.is_deleted ? m.attachment : null,
                    reads: c.is_group ? m.reads.map(r => {
                        return r.user
                    }) : undefined,
                    is_read: !c.is_group ? m.reads.length > 1 : undefined,
                    sender: m.sender
                }
            }),

        }
    });
    await redis.setex(`chat:${chat_id}`, 1200, JSON.stringify(result));
    return result;
}



export const CreateMessageRead = async (
    message_id: number,
    req_user: number
) => {
    const existingMessage = await prisma.message.findUnique({
        where: {
            id: message_id,
            is_deleted: false
        },
        include: {
            chat: {
                select: {
                    members: {
                        select: {
                            user_id: true
                        }
                    }
                }
            },
            reads: {
                select: {
                    user_id: true
                }
            }
        }
    });

    if (!existingMessage) {
        throw new apiError(404, "Message with this id not found");
    }

    if (!existingMessage.chat.members.some(m => m.user_id === req_user)) {
        throw new apiError(404, "Message with this id not found"); // Only members can read message
    }

    if (existingMessage.reads.some(r => r.user_id === req_user)) {
        throw new apiError(400, "You have already read the message");
    }

    await prisma.read.create({
        data: {
            user_id: req_user,
            message_id
        }
    });

    await Promise.all(
        existingMessage.chat.members.map(m => {
            redis.del(`chatlist:${m.user_id}`);
        })
    );
    await redis.del(`chat:${existingMessage.chat_id}`);

    return {
        message: "Message read successfully"
    }

}



export const UpdateMessage = async (
    message_id: number,
    text: string,
    req_user: number
) => {
    if (!message_id || !text) throw new apiError(400, "message_id and text is required");

    const existingMessage = await prisma.message.findUnique({
        where: {
            id: message_id,
            is_deleted: false
        },
        include: {
            chat: {
                select: {
                    members: {
                        select: {
                            user_id: true
                        }
                    }
                }
            }
        }
    });
    if (!existingMessage) throw new apiError(404, "Message not found");
    if (existingMessage.sender_id !== req_user) throw new apiError(403, "Forbidden");

    const edit = await prisma.message.update({
        where: {
            id: message_id
        },
        data: {
            text,
            is_edited: true
        }
    });
    await Promise.all(
        existingMessage.chat.members.map(m => {
            redis.del(`chatlist:${m.user_id}`);
        })
    );
    await redis.del(`chat:${existingMessage.chat_id}`);
    return edit;
}



export const SetDelete = async (
    message_id: number,
    req_user: number
) => {
    if (!message_id) throw new apiError(400, "message_id is required");

    const existingMessage = await prisma.message.findUnique({
        where: {
            id: message_id,
            is_deleted: false
        },
        include: {
            chat: {
                select: {
                    members: {
                        select: {
                            user_id: true
                        }
                    }
                }
            }
        }
    });
    if (!existingMessage) throw new apiError(404, "Message not found");
    if (existingMessage.sender_id !== req_user) throw new apiError(403, "Forbidden");

    const del = await prisma.message.update({
        where: {
            id: message_id
        },
        data: { is_deleted: true }
    });

    await Promise.all(
        existingMessage.chat.members.map(m => {
            redis.del(`chatlist:${m.user_id}`);
        })
    );
    await redis.del(`chat:${existingMessage.chat_id}`);
    return del;
}