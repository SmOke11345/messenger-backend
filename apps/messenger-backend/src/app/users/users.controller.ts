import {
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Res,
    Session,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { UsersService } from "./users.service";

import multer from "multer";
import { JwtAuthGuard } from "../auth/guard/auth.guard";

/**
 * Создания хранилища файлов
 */
const storage = multer.diskStorage({
    destination: "./apps/messenger-backend/src/assets/profile_img",
    filename: (req, file, cb) => {
        // const uniqueName = `${Date.now()}-${Math.round(
        //     Math.random() * 1e9,
        // )}${path.extname(file.originalname)}`;
        cb(null, file.originalname.replace(/\s+/g, ""));
    },
});

@Controller("users")
export class UsersController {
    constructor(@Inject("USER_SERVICE") private usersService: UsersService) {}

    /**
     * Получение данных всех зарегистрированных пользователей из базы данных
     */

    @Get("")
    async getData() {
        return this.usersService.getData();
    }

    /**
     * Получение друзей
     */
    @Get("friends")
    async getFriends(@Query("id") id: number) {
        id = Number(id); // Query параметр передает строковые значения, а нам нужны числовые
        const user = await this.usersService.findUserById(id);

        // TODO: Вернуть массив друзей пользователя
        return {
            user: user.friends,
        };
    }

    /**
     * Добавление друзей
     * @param id
     * @param session
     */
    @UseGuards(JwtAuthGuard)
    @Patch("friends/add")
    async addFriend(
        @Query("id") id: number,
        @Session() session: Record<string, any>,
    ) {
        id = Number(id); // Query параметр передает строковые значения, а нам нужны числовые
        const user = await this.usersService.findUserById(id);
        const authUser = Number(session.passport.user.id); // Получаем id вошедшего пользователя

        return this.usersService.addFriend(authUser, user);
    }

    /**
     * Запрос для загрузки изображений
     * @param file
     */
    @Post("upload")
    @UseInterceptors(FileInterceptor("file", { storage }))
    async uploadedFile(@UploadedFile() file: Express.Multer.File) {}

    /**
     * Запрос для получения изображения
     * @param filename
     * @param res
     */
    @Get("upload/:filename")
    async getFile(@Param("filename") filename: string, @Res() res: any) {
        return res.sendFile(filename, {
            root: "./apps/messenger-backend/src/assets/profile_img",
        });
    }
}
