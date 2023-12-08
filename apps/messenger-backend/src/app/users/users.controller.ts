import {
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Request,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guard/auth.guard";

import multer from "multer";

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
    @Get("friends/:id")
    async getFriends(@Param("id") id: string) {
        // Query параметр передает строковые значения, а нам нужны числовые
        const user = await this.usersService.findUserById(+id);

        return user.friends;
    }

    /**
     * Добавление друзей
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Post("friends/add")
    async addFriend(@Request() request: any) {
        // TODO: Упростить, если это возможно, повторяющиеся строчки кода
        // Query параметр передает строковые значения, а нам нужны числовые
        const user = await this.usersService.findUserById(request.body.id);
        const authUser = request.body.auth_user_id; // Получаем id вошедшего пользователя

        return this.usersService.addFriend(authUser, user);
    }

    /**
     * Удаление друзей
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Post("friends/delete")
    async deleteFriend(@Request() request: any) {
        // TODO: Упростить, если это возможно, повторяющиеся строчки кода
        // Query параметр передает строковые значения, а нам нужны числовые
        const user = await this.usersService.findUserById(request.body.id);
        const authUser = request.body.auth_user_id; // Получаем id вошедшего пользователя

        return this.usersService.deleteFriend(authUser, user);
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
