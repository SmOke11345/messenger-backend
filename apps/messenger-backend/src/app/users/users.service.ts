import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../models/UserTypes";

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) {}

    /**
     * Получение всех пользователей из базы данных
     */
    async getAllUsers() {
        return await this.prismaService.users.findMany();
    }

    /**
     * Поиск пользователя по имени или фамилии
     * @param q
     */
    async getSearchUsers(q: string) {
        const users = await this.prismaService.users.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: q,
                        },
                    },
                    {
                        lastname: {
                            contains: q,
                        },
                    },
                ],
            },
        });

        console.log(users);

        if (users.length === 0) {
            throw new NotFoundException("Users not found");
        }

        return users;
    }

    /**
     * Поиск пользователя по id
     * @param id
     */
    async findUserById(id: number) {
        return await this.prismaService.users.findFirst({
            where: {
                id,
            },
        });
    }

    // TODO: НАБУДУЩЕЕ Сделать отправку заявки на добавление в друзья.
    //  Которая в свою очередь будет ссылаться на этот запрос
    /**
     * Добавление друзей
     * @param authUser
     * @param user
     */
    async addFriend(authUser: number, user: User) {
        return await this.prismaService.users.update({
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

    /**
     * Удаление друзей
     * @param authUser
     * @param user
     */
    async deleteFriend(authUser: number, user: User) {
        // Получаем все данные пользователя
        const foundUser = await this.findUserById(authUser);

        // Используется для обновления данных пользователя
        return await this.prismaService.users.update({
            where: {
                id: authUser,
            },
            data: {
                friends: {
                    // Из полученных данных берем массив с друзьями,
                    // затем фильтруем его и устанавливаем при помощи set
                    set: foundUser.friends.filter(
                        (friend) => friend["id"] !== user.id,
                    ),
                },
            },
        });
    }
}
