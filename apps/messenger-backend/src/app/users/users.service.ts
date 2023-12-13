import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../models/UserTypes";

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) {}

    /**
     * Получение всех пользователей из базы данных
     */
    async getAllUsers(id: number) {
        const { friends } = await this.findUserById(id);
        const allUsers = await this.prismaService.users.findMany();

        if (friends.length === 0) {
            return allUsers;
        }

        // Удаляем из общего списка пользователей, которые уже есть в списке друзей.
        return allUsers.filter((same) => {
            // Some -- "проверяет, удовлетворяет ли какой-либо элемент массива условию, заданному в передаваемой функции".
            // => Если true то данные не попадают в новый массив благодаря методу filter.
            return !friends.some((friend: any) => same.id === friend.id);
        });
    }

    /**
     * Страница find-friends
     * Поиск пользователя по имени или фамилии
     * @param id
     * @param q
     */
    async getSearchUsers(id: number, q: string) {
        const { friends } = await this.findUserById(id);
        // TODO: Сделать чтобы поиск проходил по первой заглавной или строчной букве одинаково.
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

        if (users.length === 0) {
            throw new NotFoundException("Users not found");
        }

        // Возвращает список найденных пользователей, без уже добавленных друзей
        return users.filter(
            (same) => !friends.some((friend: any) => same.id === friend.id),
        );
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
        const { friends } = await this.findUserById(authUser);

        const hiddenFriend = friends.find(
            (friend: any) => friend.id === user.id,
        );

        if (hiddenFriend) {
            throw new NotFoundException("You already added this user");
        }

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
        // Получаем друзей пользователя
        const { friends } = await this.findUserById(authUser);

        // Используется для обновления данных пользователя
        return await this.prismaService.users.update({
            where: {
                id: authUser,
            },
            data: {
                friends: {
                    // Из полученных данных берем массив с друзьями,
                    // затем фильтруем его и устанавливаем при помощи set
                    set: friends.filter((friend) => friend["id"] !== user.id),
                },
            },
        });
    }
}
