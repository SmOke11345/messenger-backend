import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { CreateUserDto } from "../dto/CreateUserDto.dto";
import { PrismaService } from "../prisma/prisma.service";
import { jwtConstants } from "./utils/constants";
import { User } from "../models/UserTypes";

import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prismaService: PrismaService,
    ) {}

    /**
     * Регистрация пользователя.
     *
     * Ошибку "Type 'Promise' is not assignable to type 'string'" возникает, когда вы пытаетесь присвоить Promise<string> переменной, которая ожидает значение типа string.
     *
     * Примером такого случая может быть, когда вы пытаетесь присвоить результат асинхронной операции (которая возвращает Promise<string>) переменной, которая ожидает простое значение типа string.
     *
     * Чтобы решить эту ошибку, вам необходимо использовать ключевое слово await, чтобы дождаться выполнения промиса и получить его значение.
     * @param user
     */

    async register(user: CreateUserDto) {
        // Ищем email введенный пользователем в базе данных
        const _user: User = await this.getUserEmail(user.login);

        // Если email уже существует, выбрасываем ошибку.
        if (_user) {
            throw new ForbiddenException(`Login ${_user.login} already exists`);
        }

        // Хэшируем пароль.
        const hashedPassword = await bcrypt.hash(user.password, 10);

        return this.prismaService.users.create({
            data: {
                ...user,
                password: hashedPassword,
            },
        });
    }

    /**
     * Получение email пользователя из базы данных.
     * @param login
     */
    getUserEmail(login: string) {
        return this.prismaService.users.findFirst({
            where: {
                login,
            },
        });
    }

    /**
     * Валидация пользователя при аутентификации.
     * @param login
     * @param password
     */
    async validateUser(login: string, password: string) {
        const user: User = await this.getUserEmail(login);

        // Если такого login не существует.
        if (user === null) {
            throw new UnauthorizedException("Login not found");
        }

        // Хэшируем полученный пароль и сравниваем его с хэшем пароля из базы данных.
        if (!bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedException("Invalid password credentials");
        }

        if (user) {
            // Получаем все данные кроме пароля, и возвращаем их.
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    /**
     * Создание токена.
     * @param payload
     */
    async generateToken(payload: any) {
        return this.jwtService.signAsync(payload, {
            secret: jwtConstants.secret,
        });
    }

    /**
     * Аутентификация пользователя.
     * Получает данные пользователя после удачной аутентификации и возвращает токен.
     * @param user
     */
    async singIn(user: any) {
        // Создаем в возвращаем токен.
        return await this.generateToken({
            sub: user.id,
            login: user.login,
        });
    }
}
