import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
    ChatsType,
    FindMembershipType,
    IChatMemberships,
    UserType,
} from "./chatsTypes";

@Injectable()
export class ChatsService {
    constructor(private prisma: PrismaService) {}

    /**
     * Отправка сообщений в Б.Д.
     * @param senderId
     * @param payload
     */
    async sendMessage(
        // request: any,
        senderId: string,
        payload: {
            content: string;
            chatId: string;
        },
    ) {
        // const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        await this.findMembership(+senderId, +payload.chatId); // Проверка является ли пользователь членом чата.

        // Проверка на пустое сообщение.
        if (payload.content.trim() === "") {
            throw new ForbiddenException("Message is empty");
        }

        return await this.prisma.messages.create({
            data: {
                content: payload.content,
                chatId: +payload.chatId,
                senderId: +senderId,
            },
        });
    }

    /**
     * Удаление сообщений.
     * @param chatId
     * @param messages
     */
    async deleteMessages(chatId: number, messages: number[]) {
        return await this.prisma.messages.deleteMany({
            where: {
                id: {
                    // Если ничего не будет найдено, то вернется null
                    in: messages,
                },
                chatId,
            },
        });
    }

    /**
     * Изменение сообщения.
     * @param chatId
     * @param messageId
     * @param content
     */
    async updateMessage(chatId: number, messageId: number, content: string) {
        // Проверка на пустое сообщение.
        if (content.trim() === "") {
            return;
        }

        return this.prisma.messages.update({
            where: {
                id: messageId,
                chatId,
            },
            data: {
                content,
            },
        });
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

        // Не добавлять чаты в которых нет сообщений.
        const chats: ChatsType[] = allChatsUser.filter(
            (chat) => chat.messages.length !== 0,
        );

        // Если у пользователя еще нет чатов.
        if (chats.length === 0) {
            throw new ForbiddenException("No chats found");
        }

        return chats.map((chat: ChatsType) => {
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

    /**
     * Получение даты по id сообщения.
     * @param chatId
     * @param messageId
     */
    getMessageDate(chatId: number, messageId: number) {
        return this.prisma.chats.findFirst({
            where: {
                id: chatId,
            },
            include: {
                messages: {
                    where: {
                        id: messageId,
                    },
                },
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

        const chats: ChatsType = await this.prisma.chats.findUnique({
            where: {
                id: chatId,
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
                messages: true,
            },
        });

        // Группировка сообщений по дате.
        const groupMessage = chats.messages.reduce((acc, message) => {
            const data = `${message.createdAt.getDate()}-${
                message.createdAt.getMonth() + 1
            }-${message.createdAt.getFullYear()}`;
            // Ищет новое значение дня и создает массив с новым значением дня,
            // затем меняет значение data, => поиск осуществляется уже по новой дате.
            if (!acc[data]) {
                acc[data] = { date: data, messages: [] };
            }
            acc[data].messages.push(message);
            return acc;
        }, []);

        // TODO: Решить что-то с сортировкой сообщений. Сейчас идет от большего к меньшему. => 21.02. потом 5.03. потом 3.03.
        // а где-то нормально сортируется...м-да.

        return [
            chats.members.find((member) => member.user.id !== sub),
            ...Object.values(groupMessage),
        ];
    }
}
