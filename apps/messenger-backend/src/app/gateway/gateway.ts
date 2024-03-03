import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { ChatsService } from "../chats/chats.service";

/*
   Сообщение на которое мы подписываемся newMessage.
   Отправляем сообщение, тот пользователь, который подключился к сокету
   и подписался на событие onMessage,
   получит его в виде строки "отправленное сообщение в newMessage".
   emit - отправка сообщения, on - подписка.
*/

@WebSocketGateway({
    cors: {
        // Список доменов, которые разрешены.
        origin: ["http://localhost:4200"],
    },
})
export class Gateways
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    // Прямой доступ к экземпляру сервера.
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger("Gateways");

    constructor(public chatsService: ChatsService) {}

    afterInit(server: any) {
        this.logger.log("Init");
    }

    /**
     * Сообщение в консоль при подключении к сокету.
     * @param client
     */
    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    /**
     * Сообщение в консоль при отключении от сокета.
     * @param client
     */
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // TODO: В socket после получение данных нужно создавать сообщение в бд, и возвращать его данные в socket.

    /**
     * Отправка сообщений.
     * @param payload
     */
    @SubscribeMessage("newMessage")
    async onNewMessage(
        @MessageBody()
        payload: {
            content: string;
            chatId: string;
            senderId: string;
        },
    ) {
        const newMessage = await this.chatsService.sendMessage(
            payload.senderId,
            {
                chatId: payload.chatId,
                content: payload.content,
            },
        );
        console.log(newMessage);
        // Если пользователи находятся в одном чате (комнате), то прослушиваем onMessage и получаем отправленное сообщение.
        this.server.to(payload.chatId).emit("onMessage", {
            date: new Date(),
            messages: [
                {
                    ...newMessage,
                },
            ],
        });
    }

    // TODO: Добавить удаление сообщений.

    // @SubscribeMessage("deleteMessage")
    // onDeleteMessage(
    //     @MessageBody() payload: { messageId: number; chatId: string },
    // ) {
    //     this.server
    //         .to(payload.chatId)
    //         .emit("onDeleteMessage", payload.messageId);
    // }

    // TODO: Добавить изменение сообщения.

    @SubscribeMessage("updateMessage")
    async onUpdateMessage(
        @MessageBody()
        payload: {
            messageId: number;
            content: string;
            chatId: string;
        },
    ) {
        const updatedMessage = await this.chatsService.updateMessage(
            +payload.chatId,
            payload.messageId,
            payload.content,
        );

        this.server.to(payload.chatId).emit("onUpdateMessage", updatedMessage);
    }

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
        client.join(chatId); // Подключаемся к комнате.
        // Для получения подключенных пользователей, в frontend.
        this.server
            .to(chatId)
            .emit(
                "onJoinChat",
                `Пользователь ${client.id} подключился к комнате ${chatId}`,
            );
        this.logger.log(
            `Пользователь ${client.id} подключился к комнате ${chatId}`,
        );
    }

    /**
     * Выход из чата (комнаты).
     * @param chatId
     * @param client
     */
    @SubscribeMessage("leaveChat")
    onLeaveChat(
        @MessageBody() chatId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(chatId); // Покидаем комнату.
        // Для получения пользователей которые вышли, в frontend.
        this.server
            .to(chatId)
            .emit(
                "onJoinChat",
                `Пользователь ${client.id} покинул комнату ${chatId}`,
            );
    }
}
