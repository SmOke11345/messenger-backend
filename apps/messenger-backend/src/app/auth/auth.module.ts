import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./utils/constants";
import { LocalStrategy } from "./strategy/local.strategy";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { PrismaService } from "../prisma/prisma.service";
import { SessionSerializer } from "./utils/SessionSerializer";
import { UsersService } from "../users/users.service";

@Module({
    imports: [
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {
                expiresIn: "7d",
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        // Используется для более гибкого управления зависимости
        {
            // какой токен будет предоставлен в контейнере зависимотей
            provide: "AUTH_SERVICE",
            // Предоставляемая зависимость
            useClass: AuthService,
        },
        {
            provide: "USER_SERVICE",
            useClass: UsersService,
        },
        LocalStrategy,
        JwtStrategy,
        PrismaService,
        SessionSerializer,
    ],
})
export class AuthModule {}
