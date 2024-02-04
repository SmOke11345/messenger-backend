import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatsService {
    constructor(private prisma: PrismaService) {}

    // async sendMessage(body: {
    //     content: string;
    //     chatId: string;
    //     senderId: string;
    // }) {
    //     return await this.prisma.messages.create({
    //         data: {
    //             content: body.content,
    //             chatId: +body.chatId,
    //             senderId: +body.senderId,
    //         },
    //     });
    // }
    //
    // async getMessages(chatId: number) {
    //     return this.prisma.chats.findUnique({
    //         where: {
    //             id: chatId,
    //         },
    //         include: {
    //             messages: true,
    //         },
    //     });
    // }

    /**
     * Создание или получение чата.
     * @param request
     * @param friendId
     */
    async createOrGetChat(request: any, friendId: number) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        const chat = await this.prisma.chatMemberships.findMany({
            where: {
                userId: sub,
                chat: {
                    members: {
                        // Получаем все записи в которых одна или несколько связанных записей соответствуют условию.
                        some: {
                            userId: +friendId,
                        },
                    },
                },
            },
            include: {
                chat: true,
            },
        });

        // Если чат существует возвращаем его.
        if (chat.length !== 0) {
            return chat[0].chat;
        }

        // Создаем новую комнату чата.
        const newChat: { id: number } = await this.prisma.chats.create({
            data: {},
        });

        // Добавляем пользователей в чат.
        await this.prisma.chatMemberships.createMany({
            data: [
                { userId: sub, chatId: newChat.id },
                { userId: +friendId, chatId: newChat.id },
            ],
        });

        return newChat;
    }
}
