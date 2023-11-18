import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../dto/CreateUserDto.dto";
import { PrismaService } from "../prisma/prisma.service";
import { jwtConstants } from "./utils/constants";

import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prismaService: PrismaService,
    ) {}

    /**
     * Регистрация пользователя
     *
     * Ошибку "Type 'Promise' is not assignable to type 'string'" возникает, когда вы пытаетесь присвоить Promise<string> переменной, которая ожидает значение типа string.
     *
     * Примером такого случая может быть, когда вы пытаетесь присвоить результат асинхронной операции (которая возвращает Promise<string>) переменной, которая ожидает простое значение типа string.
     *
     * Чтобы решить эту ошибку, вам необходимо использовать ключевое слово await, чтобы дождаться выполнения промиса и получить его значение.
     * @param user
     */

    async registerUser(user: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return this.prismaService.users.create({
            data: {
                ...user,
                password: hashedPassword,
            },
        });
    }

    /**
     * Получение email пользователя из базы данных
     * @param email
     */
    getUserEmail(email: string) {
        return this.prismaService.users.findFirst({
            where: {
                email,
            },
        });
    }

    async validateUser(email: string, password: string) {
        const user = await this.getUserEmail(email);

        // Если такого email не существует
        if (user === null) {
            throw new UnauthorizedException("Email not found");
        }

        // Расхэшироваем пароль и сравниваем его с введенным
        if (!bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedException("Invalid password credentials");
        }

        if (user) {
            // Получаем все данные кроме пароля, и возвращаем их
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    /**
     * Создание токена
     * @param payload
     */
    async generateToken(payload: any) {
        return this.jwtService.signAsync(payload, {
            secret: jwtConstants.secret,
        });
    }

    /**
     * Аутентификация пользователя
     * Принимает данные пользователя после удачной аутентификации и возвращает токен
     * @param user
     */
    async singIn(user: any) {
        // Создаем токен
        const token = await this.generateToken({
            sub: user.id,
            email: user.email,
        });

        // Возвращаем токен
        return { access_token: token };
    }
}
