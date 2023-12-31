import { PassportSerializer } from "@nestjs/passport";
import { Inject } from "@nestjs/common";

import { UsersService } from "../../users/users.service";
import { User } from "../../models/UserTypes";

export class SessionSerializer extends PassportSerializer {
    constructor(
        @Inject("USER_SERVICE") private readonly userService: UsersService,
    ) {
        super();
    }

    /**
     * Преобразует (сериализирует) данные, используется для преобразования полученных данных в формат JSON.
     *
     * Происходит в момент аутентификации пользователя, или после первого входа в систему.
     * @param user
     * @param done
     */
    serializeUser(user: User, done: (error: any, user: User) => void): any {
        console.log("SerializeUser");
        done(null, user);
    }

    /**
     *  Принимает сериализованные данные, преобразует их в исходный формат данных полученный при сериализации
     *
     *  Использует сеанс в том виде в котором он был сериализован
     *
     *  Происходит в момент когда пользователь аутентифицировался и получил доступ к ресурсу
     * @param user
     * @param done
     */
    async deserializeUser(user: User, done: (error: any, user: User) => void) {
        console.log("DeserializeUser");
        const user_DB: User = await this.userService.findUserById(user.id);
        // Если пользователь был найден, то возвращаем его сериализованные данные, иначе возвращаем null.
        return user_DB ? done(null, user_DB) : done(null, null);
    }
}
