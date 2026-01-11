import { Router } from "express";
import {
    getOrCreateConversation,
    getMyConversations,
    sendMessage,
    markMessagesAsRead,
    getConversationMessages
} from "../controllers/messageController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(protect);

// Get all conversations for current user
router.get("/conversations", getMyConversations);

// Get or create conversation with another user
router.get("/conversations/user/:otherUserId", getOrCreateConversation);

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", getConversationMessages);

// Send a message
router.post("/messages", sendMessage);

// Mark messages as read
router.patch("/conversations/:conversationId/read", markMessagesAsRead);

export default router;
