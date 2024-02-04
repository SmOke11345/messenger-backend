import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";

/*
   Сообщение на которое мы подписываемся newMessage.
   Отправляем сообщение, тот пользователь, который подключился к сокету
   и подписался на событие onMessage,
   получит его в виде строки "отправленное сообщение в newMessage".
*/

@WebSocketGateway({
    cors: {
        // Список доменов, которые разрешены.
        origin: ["http://localhost:4200"],
    },
})
export class Gateways implements OnGatewayConnection, OnGatewayDisconnect {
    // Прямой доступ к экземпляру сервера.
    @WebSocketServer()
    server: Server;

    /**
     * Сообщение в консоль при подключении к сокету.
     * @param client
     */
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    /**
     * Сообщение в консоль при отключении от сокета.
     * @param client
     */
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Отправка сообщений.
     * @param payload
     */
    @SubscribeMessage("newMessage")
    onNewMessage(@MessageBody() payload: { content: string; chatId: string }) {
        // Если пользователи находятся в одном чате (комнате), то прослушиваем onMessage и получаем отправленное сообщение.
        this.server.to(payload.chatId).emit("onMessage", payload.content);
    }

    // TODO: Добавить удаление сообщений.

    /**
     * Подключение к чату (комнате).
     * @param chatId
     * @param client
     */
    @SubscribeMessage("joinChat")
    onJoinChat(
        @MessageBody() chatId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(chatId);
    }

    //  TODO: Добавить выход из чата (комнаты).
}
