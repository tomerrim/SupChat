import http from "http";
import { Server, Socket } from "socket.io";
import chatEvents from "./chatio.js";
import messageEvents from "./messageio.js";
import userEvents from "./userio.js";

const users = new Map<string,Socket>();

function addEvents(socket:Socket,io:Server,users:Map<string, Socket>, functions, names) {
  console.log('adding events...')
  for (let i = 0; i < names.length; i++) {
    socket.on(names[i], async (data) => await functions[i](data, io, socket, users));
  }
}

function initSocketIO(server: http.Server) {
  const io = new Server(server, { cors: { origin: "*" } });
  // const io : socketIO.Server = socketIO(server)
  io.on("connection", (socket) => {
    socket.on('subscribe',user_id => {
      users.set(user_id,socket)
    });
    addEvents(socket, io, users, chatEvents.functions, chatEvents.eventNames);
    addEvents(socket, io, users, messageEvents.functions, messageEvents.eventNames);
    addEvents(socket, io, users, userEvents.functions, userEvents.eventNames);
  });
}

export default initSocketIO;