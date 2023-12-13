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
                // Если у пользователя name и lastname начинается со строчных букв, то переводим в верхний регистр первую букву
                name: user.name.charAt(0).toUpperCase() + user.name.slice(1),
                lastname:
                    user.lastname.charAt(0).toUpperCase() +
                    user.lastname.slice(1),
                password: hashedPassword,
            },
        });
    }

    /**
     * Получение email пользователя из базы данных
     * @param login
     */
    getUserEmail(login: string) {
        return this.prismaService.users.findFirst({
            where: {
                login,
            },
        });
    }

    async validateUser(login: string, password: string) {
        const user = await this.getUserEmail(login);

        // Если такого email не существует
        if (user === null) {
            throw new UnauthorizedException("Login not found");
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
     * Аутентификация пользователя.
     * Получает данные пользователя после удачной аутентификации и возвращает токен
     * @param user
     */
    async singIn(user: any) {
        // Создаем в возвращаем токен
        return await this.generateToken({
            sub: user.id,
            login: user.login,
        });
    }
}
