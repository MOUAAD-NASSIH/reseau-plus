import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { socketEmitter } from "../socket/emitter";
import type { MessagePayload } from "../types/socket.types";

const userSelectWithProfile = {
    id: true,
    email: true,
    profilePicture: true,
    worker: {
        select: {
            firstName: true,
            lastName: true
        }
    },
    institution: {
        select: {
            institutionName: true,
            logo: true
        }
    }
};

export const getOrCreateConversation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { otherUserId } = req.params;
        const otherUserIdInt = parseInt(otherUserId);

        if (!otherUserIdInt || isNaN(otherUserIdInt)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const participantIds = [userId, otherUserIdInt].sort();

        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participantIds: { has: userId } },
                    { participantIds: { has: otherUserIdInt } }
                ]
            },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 50,
                    include: {
                        sender: { select: userSelectWithProfile },
                        receiver: { select: userSelectWithProfile }
                    }
                }
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participantIds,
                },
                include: {
                    messages: {
                        include: {
                            sender: { select: userSelectWithProfile },
                            receiver: { select: userSelectWithProfile }
                        }
                    }
                }
            });
        }

        const otherParticipantId = participantIds.find(id => id !== userId);
        const otherUser = await prisma.user.findUnique({
            where: { id: otherParticipantId },
            select: userSelectWithProfile
        });

        return res.status(200).json({
            success: true,
            data: { ...conversation, otherUser }
        });
    } catch (error) {
        console.error("Error getting/creating conversation:", error);
        return res.status(500).json({ success: false, message: "Failed to get conversation" });
    }
};


export const getMyConversations = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        const conversations = await prisma.conversation.findMany({
            where: {
                participantIds: {
                    has: userId
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: {
                        sender: { select: userSelectWithProfile }
                    }
                }
            },
            orderBy: { lastMessageAt: "desc" }
        });

        const conversationsWithParticipants = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participantIds.find(id => id !== userId);
                const otherUser = await prisma.user.findUnique({
                    where: { id: otherUserId },
                    select: userSelectWithProfile
                });

                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        receiverId: userId,
                        status: {
                            not: "READ"
                        }
                    }
                });

                return {
                    ...conv,
                    otherUser,
                    unreadCount
                };
            })
        );

        return res.status(200).json({ success: true, data: conversationsWithParticipants });
    } catch (error) {
        console.error("Error getting conversations:", error);
        return res.status(500).json({ success: false, message: "Failed to get conversations" });
    }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { conversationId, content, receiverId } = req.body;

        if (!conversationId || !content || !receiverId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participantIds: {
                    has: userId
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        const receiverIdInt = parseInt(receiverId);
        if (!conversation.participantIds.includes(receiverIdInt)) {
            return res.status(403).json({
                success: false,
                message: "Receiver is not a participant in this conversation"
            });
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                receiverId: receiverIdInt,
                content,
                status: "SENT"
            },
            include: {
                sender: { select: userSelectWithProfile },
                receiver: { select: userSelectWithProfile }
            }
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });

        const messagePayload: MessagePayload = {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content,
            status: message.status,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
            sender: {
                id: message.sender.id,
                email: message.sender.email,
                profilePicture: message.sender.profilePicture,
                worker: message.sender.worker ? {
                    firstName: message.sender.worker.firstName,
                    lastName: message.sender.worker.lastName,
                } : undefined,
                institution: message.sender.institution ? {
                    institutionName: message.sender.institution.institutionName,
                    logo: message.sender.institution.logo,
                } : undefined,
            },
        };

        socketEmitter.emitMessage(conversationId, messagePayload);
        socketEmitter.emitToUser(receiverIdInt, 'message', messagePayload);

        await prisma.notification.create({
            data: {
                userId: receiverIdInt,
                type: "MESSAGE",
                message: `You have a new message`,
                isRead: false
            }
        });

        return res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ success: false, message: "Failed to send message" });
    }
};


export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { conversationId } = req.params;
        const conversationIdInt = parseInt(conversationId);

        if (!conversationIdInt || isNaN(conversationIdInt)) {
            return res.status(400).json({ success: false, message: "Invalid conversation ID" });
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationIdInt,
                participantIds: {
                    has: userId
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        const result = await prisma.message.updateMany({
            where: {
                conversationId: conversationIdInt,
                receiverId: userId,
                status: {
                    not: "READ"
                }
            },
            data: {
                status: "READ"
            }
        });

        if (result.count > 0) {
            socketEmitter.emitMessageRead(conversationIdInt, {
                conversationId: conversationIdInt,
                readBy: userId,
                readAt: new Date().toISOString()
            });
        }

        return res.status(200).json({
            success: true,
            data: { markedAsRead: result.count }
        });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return res.status(500).json({ success: false, message: "Failed to mark messages as read" });
    }
};

export const getConversationMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { conversationId } = req.params;
        const conversationIdInt = parseInt(conversationId);

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        if (!conversationIdInt || isNaN(conversationIdInt)) {
            return res.status(400).json({ success: false, message: "Invalid conversation ID" });
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationIdInt,
                participantIds: {
                    has: userId
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { conversationId: conversationIdInt },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    sender: { select: userSelectWithProfile },
                    receiver: { select: userSelectWithProfile }
                }
            }),
            prisma.message.count({
                where: { conversationId: conversationIdInt }
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                messages: messages.reverse(),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Error getting conversation messages:", error);
        return res.status(500).json({ success: false, message: "Failed to get messages" });
    }
};
