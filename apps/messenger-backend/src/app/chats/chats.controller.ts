import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { JwtAuthGuard } from "../auth/guard/auth.guard";

@Controller("chats")
export class ChatsController {
    F;

    constructor(private chatsService: ChatsService) {}

    @UseGuards(JwtAuthGuard)
    @Post("send-message")
    async sendMessage(
        @Body() body: { content: string; chatId: string },
        @Request() request: any,
    ) {
        return this.chatsService.sendMessage(request, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get("get-messages")
    async getMessages(
        @Body() body: { chatId: string },
        @Request() request: any,
    ) {
        return this.chatsService.getMessages(request, +body.chatId);
    }

    /**
     * Создание-получение чата.
     * @param friendId
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Post("create-or-get-chat/:friendId")
    async createOrGetChat(
        @Param("friendId") friendId: string,
        @Request() request: any,
    ) {
        return this.chatsService.createOrGetChat(request, +friendId);
    }
}
