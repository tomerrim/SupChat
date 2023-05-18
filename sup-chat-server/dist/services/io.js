import { Server } from "socket.io";
import chatEvents from "./chatio.js";
import messageEvents from "./messageio.js";
import userEvents from "./userio.js";
function addEvents(socket, functions, names) {
    console.log('adding events...');
    for (let i = 0; i < names.length; i++) {
        socket.on(names[i], (data) => functions[i](data, socket));
    }
}
export function initSocketIO(server) {
    const io = new Server(server, { cors: { origin: "*" } });
    // const io : socketIO.Server = socketIO(server)
    io.on("connection", (socket) => {
        addEvents(socket, chatEvents.functions, chatEvents.eventNames);
        addEvents(socket, messageEvents.functions, messageEvents.eventNames);
        addEvents(socket, userEvents.functions, userEvents.eventNames);
        socket.on('test', (test) => console.log('test !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'));
        console.log("Client connected:", socket.id);
    });
}
//# sourceMappingURL=io.js.map