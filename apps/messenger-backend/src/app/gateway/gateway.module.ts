import { Module } from "@nestjs/common";
import { Gateways } from "./gateway";
import { ChatsService } from "../chats/chats.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    providers: [Gateways, ChatsService, PrismaService],
})
export class GatewayModule {}
