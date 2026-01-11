import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Get or create conversation between two users
export const getOrCreateConversation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { otherUserId } = req.params;
        const otherUserIdInt = parseInt(otherUserId);

        if (!otherUserIdInt || isNaN(otherUserIdInt)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        // Check if conversation already exists
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
                        sender: {
                            select: {
                                id: true,
                                email: true,
                                worker: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        profilePicture: true
                                    }
                                },
                                institution: {
                                    select: {
                                        institutionName: true,
                                        logo: true
                                    }
                                }
                            }
                        },
                        receiver: {
                            select: {
                                id: true,
                                email: true,
                                worker: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        profilePicture: true
                                    }
                                },
                                institution: {
                                    select: {
                                        institutionName: true,
                                        logo: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Create new conversation if doesn't exist
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participantIds,
                },
                include: {
                    messages: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    email: true,
                                    worker: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            profilePicture: true
                                        }
                                    },
                                    institution: {
                                        select: {
                                            institutionName: true,
                                            logo: true
                                        }
                                    }
                                }
                            },
                            receiver: {
                                select: {
                                    id: true,
                                    email: true,
                                    worker: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            profilePicture: true
                                        }
                                    },
                                    institution: {
                                        select: {
                                            institutionName: true,
                                            logo: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        // Get the other user's info
        const otherParticipantId = participantIds.find(id => id !== userId);
        const otherUser = await prisma.user.findUnique({
            where: { id: otherParticipantId },
            select: {
                id: true,
                email: true,
                worker: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePicture: true
                    }
                },
                institution: {
                    select: {
                        institutionName: true,
                        logo: true
                    }
                }
            }
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

// Get all conversations for current user
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
                    take: 1, // Only get the last message
                    include: {
                        sender: {
                            select: {
                                id: true,
                                email: true,
                                worker: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        profilePicture: true
                                    }
                                },
                                institution: {
                                    select: {
                                        institutionName: true,
                                        logo: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { lastMessageAt: "desc" }
        });

        // Get other participant info for each conversation
        const conversationsWithParticipants = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participantIds.find(id => id !== userId);
                const otherUser = await prisma.user.findUnique({
                    where: { id: otherUserId },
                    select: {
                        id: true,
                        email: true,
                        worker: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profilePicture: true
                            }
                        },
                        institution: {
                            select: {
                                institutionName: true,
                                logo: true
                            }
                        }
                    }
                });

                // Count unread messages
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

// Send a message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { conversationId, content, receiverId } = req.body;

        console.log("Send message request:", { userId, conversationId, content, receiverId });

        if (!conversationId || !content || !receiverId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Verify conversation exists and user is participant
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

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                receiverId: parseInt(receiverId),
                content,
                status: "SENT"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        worker: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profilePicture: true
                            }
                        },
                        institution: {
                            select: {
                                institutionName: true,
                                logo: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        email: true,
                        worker: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profilePicture: true
                            }
                        },
                        institution: {
                            select: {
                                institutionName: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        // Update conversation's lastMessageAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });

        // Create notification for receiver
        await prisma.notification.create({
            data: {
                userId: parseInt(receiverId),
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

// Mark messages as read
export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { conversationId } = req.params;

        await prisma.message.updateMany({
            where: {
                conversationId: parseInt(conversationId),
                receiverId: userId,
                status: {
                    not: "READ"
                }
            },
            data: {
                status: "READ"
            }
        });

        return res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return res.status(500).json({ success: false, message: "Failed to mark messages as read" });
    }
};

// Get messages for a conversation
export const getConversationMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        // Verify user is participant
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: parseInt(conversationId),
                participantIds: {
                    has: userId
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: parseInt(conversationId),
                ...(before && { createdAt: { lt: new Date(before as string) } })
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        worker: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profilePicture: true
                            }
                        },
                        institution: {
                            select: {
                                institutionName: true,
                                logo: true
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        email: true,
                        worker: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profilePicture: true
                            }
                        },
                        institution: {
                            select: {
                                institutionName: true,
                                logo: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: parseInt(limit as string)
        });

        return res.status(200).json({ success: true, data: messages.reverse() });
    } catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).json({ success: false, message: "Failed to get messages" });
    }
};
