import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatsService {
    constructor(private prisma: PrismaService) {}

    /**
     * Отправка сообщений в Б.Д.
     * @param request
     * @param body
     */
    async sendMessage(
        request: any,
        body: {
            content: string;
            chatId: string;
        },
    ) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        await this.findMembership(sub, +body.chatId); // Проверка является ли пользователь членом чата.

        // TODO: Убирать пробелы во frontend после отправки сообщения.
        // Проверка на пустое сообщение.
        if (body.content === "") {
            throw new ForbiddenException("Message is empty");
        }

        return await this.prisma.messages.create({
            data: {
                content: body.content,
                chatId: +body.chatId,
                senderId: sub,
            },
        });
    }

    /**
     * Получение сообщений из Б.Д.
     * @param request
     * @param chatId
     */
    async getMessages(request: any, chatId: number) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        await this.findMembership(sub, chatId); // Проверка является ли пользователь членом чата.

        const chats = await this.prisma.chats.findUnique({
            where: {
                id: chatId,
            },
            include: {
                messages: {
                    // TODO: Выбрать все кроме...
                    select: {
                        content: true,
                        senderId: true,
                        updatedAt: true,
                        createdAt: true,
                    },
                },
            },
        });

        return chats.messages;
    }

    /**
     * Создание-получение чата.
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
                        // Получаем все записи в которых одна или несколько связанных записей соответствуют условию. Поиск по связям таблицы.
                        some: {
                            userId: friendId,
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
                { userId: friendId, chatId: newChat.id },
            ],
        });

        return newChat;
    }

    /**
     * Поиск пользователя в чате.
     * @param userId
     * @param chatId
     */
    async findMembership(userId: number, chatId: number) {
        // Ищем пользователя в чате.
        const membersChat = await this.prisma.chats.findFirst({
            where: {
                id: chatId,
                members: {
                    // Получаем все записи в которых одна или несколько связанных записей соответствуют условию. Поиск по связям таблицы.
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                members: true,
            },
        });

        if (!membersChat) {
            throw new ForbiddenException("You are not a member of this chat");
        }

        return true;
    }
}
