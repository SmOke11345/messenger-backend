import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../models/UserTypes";

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) {}

    /**
     * Получение всех пользователей из базы данных
     */
    getData() {
        return this.prismaService.users.findMany();
    }

    /**
     * Поиск пользователя по id
     * @param id
     */
    findUserById(id: number) {
        return this.prismaService.users.findFirst({
            where: {
                id,
            },
        });
    }

    /**
     * Добавление друзей
     * @param authUser
     * @param user
     */
    addFriend(authUser: any, user: User) {
        return this.prismaService.users.update({
            where: {
                id: authUser,
            },
            data: {
                friends: {
                    push: user as object, // Добавляем пользователя в список друзей
                },
            },
        });
    }

    // TODO: Сделать удаление друзей
}
