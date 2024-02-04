import { Module } from "@nestjs/common";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Module({
    controllers: [ChatsController],
    providers: [ChatsService, PrismaService, JwtService],
})
export class ChatsModule {}
