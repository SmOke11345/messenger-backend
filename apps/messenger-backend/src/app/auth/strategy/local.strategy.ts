import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject("AUTH_SERVICE") private authService: AuthService) {
        // Изначально ожидает получить username и password,
        // меняем это поведение и ожидаем получить
        super({
            usernameField: "email",
            passwordField: "password",
        });
    }

    /**
     * Используется для вывода данных о пользователе, после успешной аутентификации
     * @param email
     * @param password
     */
    async validate(email: string, password: string) {
        // Проверяет есть ли такой email в базе данных и совпадает ли пароль
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException("Email not found");
        }
        return user;
    }
}
