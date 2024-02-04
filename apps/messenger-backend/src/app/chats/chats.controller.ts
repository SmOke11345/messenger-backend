import { Controller, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { JwtAuthGuard } from "../auth/guard/auth.guard";

@Controller("chats")
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    // @Post(":id")
    // async sendMessage(
    //     @Body() body: { content: string; chatId: string; senderId: string },
    // ) {
    //     return this.chatsService.sendMessage(body);
    // }
    //
    // @Get(":id")
    // async getMessages(@Body() body: { chatId: string }) {
    //     return this.chatsService.getMessages(+body.chatId);
    // }

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
