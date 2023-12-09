import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { Strategy } from "passport-local";

import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject("AUTH_SERVICE") private authService: AuthService) {
        // Изначально ожидает получить username и password,
        // меняем это поведение и ожидаем получить
        super({
            usernameField: "login",
            passwordField: "password",
        });
    }

    /**
     * Используется для вывода данных о пользователе, после успешной аутентификации
     * @param login
     * @param password
     */
    async validate(login: string, password: string) {
        // Проверяет есть ли такой email в базе данных и совпадает ли пароль
        const user = await this.authService.validateUser(login, password);
        if (!user) {
            throw new UnauthorizedException("Login not found");
        }
        return user;
    }
}
