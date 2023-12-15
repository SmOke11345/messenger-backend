import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) {}

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

    /**
     * Получение всех пользователей
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
     * @param request
     * @param q
     */
    async getSearchUsers(request: any, q: string) {
        const { sub } = request.user;
        const { friends } = await this.findUserById(sub);

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
     * Страница find-friends
     * Поиск пользователя по имени или фамилии
     * @param request
     * @param q
     */
    async getSearchFriends(request: any, q: string) {
        const { sub } = request.user;
        const { friends } = await this.findUserById(sub);

        let findFriends = friends.filter(
            (arr: any) => arr.name.includes(q) || arr.lastname.includes(q),
        );

        if (findFriends.length === 0) {
            throw new ForbiddenException("Users not found");
        }

        return findFriends;
    }

    // Получение друзей
    async getFriends(id: number) {
        // Параметры передаваемые в строку запроса являются строковым типом => нужно преобразовать в числовой
        const { friends } = await this.findUserById(+id);

        // Если массив с друзьями пуст выдаем ошибку
        if (friends.length === 0) {
            throw new NotFoundException("You haven't added any friends yet!");
        }

        return friends;
    }

    // TODO: НАБУДУЩЕЕ Сделать отправку заявки на добавление в друзья.
    //  Которая в свою очередь будет ссылаться на этот запрос
    /**
     * Добавление друзей
     * @param request
     * @param id
     */
    async addFriend(request: any, id: number) {
        const { sub } = request.user;
        // Получаем данные пользователя которого нужно добавить
        const user = await this.findUserById(id);
        // Получаем друзей пользователя
        const { friends } = await this.findUserById(sub);

        const hiddenFriend = friends.find(
            (friend: any) => friend.id === user.id,
        );

        // Если пользователь уже добавлен в друзья
        if (hiddenFriend) {
            throw new NotFoundException("You already added this user");
        }

        return await this.prismaService.users.update({
            where: {
                id: sub,
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
     * @param request
     * @param _id
     */
    async deleteFriend(request: any, _id: number) {
        const { sub } = request.user;
        // Получаем данные пользователя которого нужно удалить
        const { id } = await this.findUserById(_id);
        // Получаем друзей пользователя
        const { friends } = await this.findUserById(sub);

        // Используется для обновления данных пользователя
        return await this.prismaService.users.update({
            where: {
                id: sub,
            },
            data: {
                friends: {
                    // Из полученных данных берем массив с друзьями,
                    // затем фильтруем его и устанавливаем при помощи set
                    set: friends.filter((friend) => friend["id"] !== id),
                },
            },
        });
    }
}
