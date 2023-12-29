import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";

import { Server } from "socket.io";
import { OnModuleInit } from "@nestjs/common";

// Подключение веб-сокета (http://localhost:3000).
@WebSocketGateway({
    cors: {
        // Список доменов, которые разрешены.
        origin: ["http://localhost:4200"],
    },
})
export class Gateways implements OnModuleInit {
    // Прямой доступ к экземпляру сервера.
    @WebSocketServer()
    server: Server;

    // Для подключения к сокету после инициализации модуля.
    onModuleInit() {
        this.server.on("connection", (socket) => {
            console.log(socket.id);
            console.log("Connected");
        });
    }

    // Сообщение на которое мы подписываемся newMessage.
    // Отправляем сообщение, тот пользователь, который подключился к сокету
    // и подписался на событие onMessage,
    // получит его в виде объекта {status: 'send message', data: отправленное сообщение в newMessage}.
    @SubscribeMessage("newMessage")
    onNewMessage(@MessageBody() data: any) {
        // server.emit - пропускает сообщение только для тех пользователей, кто подключился.
        // onMessage - название события.
        this.server.emit("onMessage", {
            status: "send message",
            data: data,
        });
    }
}
