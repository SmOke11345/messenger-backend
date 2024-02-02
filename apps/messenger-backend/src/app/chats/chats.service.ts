import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatsService {
    constructor(private prisma: PrismaService) {}

    async sendMessage(body: {
        content: string;
        chatId: string;
        senderId: string;
    }) {
        return await this.prisma.messages.create({
            data: {
                content: body.content,
                chatId: +body.chatId,
                senderId: +body.senderId,
            },
        });
    }

    async getMessages(chatId: number) {
        return this.prisma.chats.findUnique({
            where: {
                id: chatId,
            },
            include: {
                messages: true,
            },
        });
    }
}
