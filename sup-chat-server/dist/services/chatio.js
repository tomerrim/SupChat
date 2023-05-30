import { Sup } from "../repository/Sup.js";
import { Chat } from "../schemas/chat.js";
import { Message } from "../schemas/message.js";
const Dal = new Sup();
//events name
const newMessageEventName = "message";
const joinRoomEventName = "joinRoom";
const leaveRoomEventName = "leaveRoom";
const addToRoomEventName = "addToRoom";
const removeFromRoomEventName = "removeFromRoom";
const createChatEventName = "newChat";
const newMessage = async (data, io, socket) => {
    console.log(`new message recived: ${data.message}`);
    const { message: messageData, chat_id } = data;
    const newMessage = new Message({
        text: messageData.text,
        dateTime: messageData.dateTime,
        user: messageData.user._id,
    });
    await Dal.messageRep.add(newMessage);
    const chat = await Dal.chatRep.getById(chat_id);
    chat.messages.push(newMessage);
    Dal.chatRep.update(chat_id, chat);
    socket.broadcast.to(chat_id).emit("message", data);
};
const joinRoom = async (room_id, io, socket) => {
    socket.join(room_id);
};
const leaveRoom = async (room_id, io, socket) => {
    socket.leave(room_id);
};
const addToRoom = async (data, io, socket) => {
    const { chat_id, user_id } = data;
    const chat = await Dal.chatRep.getById(chat_id);
    const user = await Dal.userRep.getById(user_id);
    chat.participants.push(user);
    user.chats.push(chat);
    await Dal.chatRep.update(chat._id, chat);
    await Dal.userRep.update(user._id, user);
    socket.broadcast.to(chat_id).emit("addToRoom", user);
};
const removeFromRoom = async (data, io, socket, users) => {
    const { chat_id, user_id } = data;
    const chat = await Dal.chatRep.getById(chat_id);
    const user = await Dal.userRep.getById(user_id);
    chat.participants = chat.participants.filter(p => p._id.toString() !== user._id.toString());
    chat.admins = chat.admins.filter(p => p._id.toString() !== user._id.toString());
    user.chats = user.chats.filter(c => c._id.toString() !== chat._id.toString());
    await Dal.chatRep.update(chat._id, chat);
    await Dal.userRep.update(user._id, user);
    const inRoom = (await io.in(chat_id).fetchSockets()).length;
    socket.broadcast.to(chat_id).emit("removeFromRoom", { user, chat });
    const inRoom2 = (await io.in(chat_id).fetchSockets()).length;
    const userSocket = users.get(user_id);
    userSocket?.leave(chat_id);
    const inRoom3 = (await io.in(chat_id).fetchSockets()).length;
    console.log('bruh');
};
const createChat = async (data, io, socket, users) => {
    const newChat = new Chat({ ...data });
    await Dal.chatRep.add(newChat);
    newChat.participants.forEach(async (p) => {
        const user = await Dal.userRep.getById(p._id);
        user.chats.push(newChat);
        await Dal.userRep.update(user._id, user);
    });
    newChat.participants.forEach(async (u) => {
        const pSocket = users.get(u._id.toString());
        pSocket?.emit("newChat", newChat);
    });
};
const chatEvents = {
    functions: [
        newMessage,
        joinRoom,
        leaveRoom,
        addToRoom,
        removeFromRoom,
        createChat,
    ],
    eventNames: [
        newMessageEventName,
        joinRoomEventName,
        leaveRoomEventName,
        addToRoomEventName,
        removeFromRoomEventName,
        createChatEventName,
    ],
};
export default chatEvents;
//# sourceMappingURL=chatio.js.map