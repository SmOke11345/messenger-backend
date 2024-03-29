import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

import { AuthService } from "../auth/auth.service";
import { User } from "../models/UserTypes";

import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
    constructor(
        @Inject("AUTH_SERVICE") private authService: AuthService,
        private prismaService: PrismaService,
    ) {}

    /**
     * Поиск пользователя по id.
     * @param id
     */
    async findUserById(id: number) {
        return await this.prismaService.users.findFirst({
            where: {
                id,
            },
        });
    }

    /**
     * Подготовка друзей. Дополнительная функция.
     * @param id
     */
    async prepareFriends(id: number) {
        const user = await this.prismaService.users.findFirst({
            where: {
                id,
            },
            include: {
                friends: {
                    include: {
                        user: true,
                    },
                },
                friendsOf: {
                    include: {
                        friend: true,
                    },
                },
            },
        });

        return [
            ...user.friends.map((friend) => friend.user),
            ...user.friendsOf.map((friendOf) => friendOf.friend),
        ];
    }

    /**
     * Получение всех пользователей.
     * @param id
     */
    async getAllUsers(id: number) {
        // Получение всех пользователей.
        const allUsers: User[] = await this.prismaService.users.findMany();
        // Получение друзей пользователя.
        const friends: User[] = await this.prepareFriends(id);

        if (friends.length === 0) {
            return allUsers;
        }

        // Удаляем из общего списка пользователей, которые уже есть в списке друзей.
        return allUsers.filter((same: User) => {
            // Some -- "проверяет, удовлетворяет ли какой-либо элемент массива условию, заданному в передаваемой функции".
            // => Если true то данные не попадают в новый массив благодаря методу filter.
            return !friends.some(
                (friend: User) => same.id === friend.id || same.id === id,
            );
        });
    }

    /**
     * Страница find-friends.
     * Поиск пользователя по имени или фамилии.
     * @param request
     * @param q
     */
    async getSearchUsers(request: any, q: string) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        // Получаем список всех пользователей.
        const usersAll: User[] = await this.prismaService.users.findMany();

        // Получение друзей пользователя.
        const friends: User[] = await this.prepareFriends(sub);

        // Фильтруем массив друзей, для поиска пользователей по схожему имени или фамилии.
        const users = usersAll.filter(
            (arr) => arr.name.includes(q) || arr.lastname.includes(q),
        );

        if (users.length === 0) {
            throw new NotFoundException("Users not found");
        }

        // Возвращает список найденных пользователей, без уже добавленных друзей.
        return users.filter(
            (same) => !friends.some((friend: User) => same.id === friend.id),
        );
    }

    /**
     * Страница friends.
     * Поиск пользователя по имени или фамилии.
     * @param request
     * @param q
     */
    async getSearchFriends(request: any, q: string) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        // Получение друзей пользователя.
        const friends: User[] = await this.prepareFriends(sub);

        // Фильтруем массив друзей, для поиска пользователей по схожему имени или фамилии.
        const findFriends: User[] = friends.filter(
            (arr: any) => arr.name.includes(q) || arr.lastname.includes(q),
        );

        if (findFriends.length === 0) {
            throw new ForbiddenException("Users not found");
        }

        return findFriends;
    }

    /**
     * Получение друзей.
     * @param id
     */
    async getFriends(id: number) {
        const friends: User[] = await this.prepareFriends(id);

        if (friends.length === 0) {
            throw new NotFoundException("Friend not added yet");
        }

        return friends;
    }

    // TODO: НАБУДУЩЕЕ Сделать отправку заявки на добавление в друзья.
    /**
     * Добавление друзей.
     * @param request
     * @param id
     */
    async addFriend(request: any, id: number) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        // Получаем данные пользователя.
        const user: User = await this.findUserById(sub);

        // Если пользователь не найден.
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // Если пользователь уже добавлен в друзья.
        const friends_user = await this.prismaService.friends.findFirst({
            where: {
                OR: [
                    {
                        userId: sub,
                        friendId: id,
                    },
                    {
                        userId: id,
                        friendId: sub,
                    },
                ],
            },
        });
        if (friends_user) {
            throw new ForbiddenException("You already added this user");
        }

        // На случай добавления в друзья самого себя.
        if (sub === id) {
            throw new ForbiddenException("You can't add yourself as a friend");
        }

        return this.prismaService.friends.create({
            data: {
                userId: sub,
                friendId: id,
            },
        });
    }

    /**
     * Удаление друзей.
     * @param request
     * @param _id
     */
    async deleteFriend(request: any, _id: number) {
        const { sub } = request.user; // Получение id пользователя (аутентифицированного).

        await this.prismaService.friends.deleteMany({
            where: {
                OR: [
                    {
                        userId: sub,
                        friendId: _id,
                    },
                    {
                        userId: _id,
                        friendId: sub,
                    },
                ],
            },
        });

        return {
            message: "User deleted successfully",
        };
    }

    /**
     * Изменение данных пользователя.
     * @param request
     * @param id
     */
    async editProfile(request: any, id: number) {
        const { ...data } = request.body;

        // Если полученный объект включает пароль.
        if (data.password) {
            // Хэшируем новый пароль и перезаписываем его обратно в data.
            data.password = await bcrypt.hash(data.password, 10);
        }

        // Eсли полученные объект включает login.
        if (data.login) {
            // Ищем подобный login.
            const findLogin = await this.authService.getUserEmail(data.login);
            // Если такой login существует, выдаем ошибку.
            if (findLogin) {
                throw new ForbiddenException(
                    `Login ${data.login} already exists`,
                );
            }
        }

        return this.prismaService.users.update({
            where: {
                id: id,
            },
            data: {
                ...data,
            },
        });
    }
}
