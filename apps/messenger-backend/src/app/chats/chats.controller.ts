import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Request,
    UseGuards,
} from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { JwtAuthGuard } from "../auth/guard/auth.guard";

@Controller("chats")
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    // /**
    //  * Удаление сообщений.
    //  * @param body
    //  */
    // @Delete("delete-messages")
    // async deleteMessages(@Body() body: { chatId: string; messages: number[] }) {
    //     return this.chatsService.deleteMessages(+body.chatId, body.messages);
    // }

    /**
     * Получение сообщений из Б.Д.
     * @param request
     * @param chatId
     */
    @UseGuards(JwtAuthGuard)
    @Get("get-messages/:chatId")
    async getMessages(
        @Request() request: any,
        @Param("chatId") chatId: string,
    ) {
        return this.chatsService.getMessages(request, +chatId);
    }

    /**
     * Получение списка всех чатов.
     */
    @UseGuards(JwtAuthGuard)
    @Get("get-all-chats")
    async getAllChats(@Request() request: any) {
        return this.chatsService.getAllChats(request);
    }

    /**
     * Создание-получение чата.
     * @param friendId
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Get("create-or-get-chat/:friendId")
    async createOrGetChat(
        @Request() request: any,
        @Param("friendId") friendId: string,
    ) {
        return this.chatsService.createOrGetChat(request, +friendId);
    }
}
