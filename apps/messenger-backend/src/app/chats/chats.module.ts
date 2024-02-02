import { Module } from "@nestjs/common";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    controllers: [ChatsController],
    providers: [ChatsService, PrismaService],
})
export class ChatsModule {}
