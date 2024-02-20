import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
    ChatsType,
    FindMembershipType,
    GetMessagesType,
    IChatMemberships,
    UserType,
} from "./chatsTypes";

@Injectable()
export class ChatsService {
    constructor(private prisma: PrismaService) {}

    /**
     * Отправка сообщений в Б.Д.
     * @param request
     * @param payload
     */
    async sendMessage(
        request: any,
        payload: {
            content: string;
            chatId: string;
        },
    ) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        await this.findMembership(sub, +payload.chatId); // Проверка является ли пользователь членом чата.

        // Проверка на пустое сообщение.
        if (payload.content === "") {
            throw new ForbiddenException("Message is empty");
        }

        return await this.prisma.messages.create({
            data: {
                content: payload.content,
                chatId: +payload.chatId,
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

        const chats: GetMessagesType = await this.prisma.chats.findUnique({
            where: {
                id: chatId,
            },
            include: {
                messages: {
                    select: {
                        content: true,
                        senderId: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        return chats.messages;
    }

    /**
     * Получение списка всех чатов.
     */
    async getAllChats(request: any) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        const allChatsUser: ChatsType[] = await this.prisma.chats.findMany({
            where: {
                members: {
                    some: {
                        userId: sub,
                    },
                },
            },
            include: {
                members: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                lastname: true,
                                profile_img: true,
                            },
                        },
                    },
                },
                messages: {
                    select: {
                        senderId: true,
                        createdAt: true,
                        content: true,
                    },
                },
            },
        });

        // TODO: Сделать чтобы socket не подключал сразу всех пользователей,
        //  потому что, из-за большого количества запросов сервер не может обрабатывать запросы сразу, а лишь только после перезагрузки страницы. Может это frontend виноват...посмотрим.

        // TODO: Если чат с пользователем существует, но в нем нет сообщений.
        if (allChatsUser.length === 0) {
        }

        return allChatsUser.map((chat: ChatsType) => {
            return {
                ...chat.members.find(
                    (member: UserType) => member.user.id !== sub,
                ),
                lastMessage: chat.messages.at(-1),
            };
        });
    }

    /**
     * Создание-получение чата.
     * @param request
     * @param friendId
     */
    async createOrGetChat(request: any, friendId: number) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        const chat: IChatMemberships[] =
            await this.prisma.chatMemberships.findMany({
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
        const membersChat: FindMembershipType =
            await this.prisma.chats.findFirst({
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
