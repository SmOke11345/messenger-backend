import { Body, Controller, Get, Post } from "@nestjs/common";
import { ChatsService } from "./chats.service";

@Controller("chats")
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    @Post(":id")
    async sendMessage(
        @Body() body: { content: string; chatId: string; senderId: string },
    ) {
        return this.chatsService.sendMessage(body);
    }

    @Get(":id")
    async getMessages(@Body() body: { chatId: string }) {
        return this.chatsService.getMessages(+body.chatId);
    }
}
