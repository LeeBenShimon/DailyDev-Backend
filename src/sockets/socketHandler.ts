import { Server, Socket } from "socket.io";
import Message from "../models/messages_model";

interface JoinRoomPayload {
  roomId: string;
}

interface SendMessagePayload {
  roomId: string;
  message: string;
}

const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Join room
    socket.on("joinRoom", (payload: JoinRoomPayload) => {
      socket.join(payload.roomId);
      console.log("🛏 User ${socket.id} joined room: ${payload.roomId}");
    });

    // Send message
    socket.on(
      "sendMessage",
      async (
        payload: SendMessagePayload & { senderId: string; receiverId: string }
      ) => {
        try {
          const messageDoc = await Message.create({
            sender: payload.senderId,
            receiver: payload.receiverId,
            content: payload.message,
            chatId: payload.roomId,
          });

          // Broadcast to the room
          socket.to(payload.roomId).emit("receiveMessage", {
            content: messageDoc.content,
            senderId: messageDoc.sender,
            receiverId: messageDoc.receiver,
            timestamp: messageDoc.timestamp,
            chatId: messageDoc.chatId,
          });
        } catch (err) {
          console.error("Failed to save message:", err);
        }
      }
    );

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export default socketHandler;
