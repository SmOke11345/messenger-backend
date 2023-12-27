import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
    Request,
    Session,
    UseGuards,
} from "@nestjs/common";

import { CreateUserDto } from "../dto/CreateUserDto.dto";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guard/auth.guard";
import { LocalAuthGuard } from "./guard/local-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(@Inject("AUTH_SERVICE") private authService: AuthService) {}

    @Post("register")
    async register(@Body() user: CreateUserDto) {
        return this.authService.register({ ...user });
    }

    /**
     * Аутентификация пользователя.
     * @param request
     * @param session
     */
    @UseGuards(LocalAuthGuard)
    @Post("login")
    async login(
        @Request() request: any,
        @Session() session: Record<string, any>,
    ) {
        const token = await this.authService.singIn(request.user);

        return {
            access_token: token,
            data: session,
        };
    }

    /**
     * Защищаем маршрут, и смотрим данные пользователя из token`a.
     * @param request
     * @param session
     */
    @UseGuards(JwtAuthGuard)
    @Get("chats")
    async getDataUser(
        @Request() request: any,
        @Session() session: Record<string, any>,
    ) {
        session.authenticated = true; // Изменения происходят сразу, как только мы изменим объект сессии.

        // Получаем токен который мы сохранили в auth.guard.ts.
        return {
            user: request.user,
            cookie: session,
        };
    }
}
