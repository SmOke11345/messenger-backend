import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
    controllers: [UsersController],
    providers: [
        PrismaService,
        {
            provide: "USER_SERVICE",
            useClass: UsersService,
        },
    ],
    exports: [],
})
export class UsersModule {}
