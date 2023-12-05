import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { LocalStrategy } from "../auth/strategy/local.strategy";
import { SessionSerializer } from "../auth/utils/SessionSerializer";
import { AuthService } from "../auth/auth.service";
import { JwtStrategy } from "../auth/strategy/jwt.strategy";
import { JwtService } from "@nestjs/jwt";

@Module({
    controllers: [UsersController],
    providers: [
        PrismaService,
        {
            // какой токен будет предоставлен в контейнере зависимостей
            provide: "AUTH_SERVICE",
            // Предоставляемая зависимость
            useClass: AuthService,
        },
        {
            provide: "USER_SERVICE",
            useClass: UsersService,
        },
        LocalStrategy,
        SessionSerializer,
        JwtStrategy,
        JwtService,
        PrismaService,
        SessionSerializer,
    ],
})
export class UsersModule {}
