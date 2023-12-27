import {
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
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
     * Получение всех пользователей
     */
    @Get("")
    async getAllUsers(@Query("id") id: string) {
        return this.usersService.getAllUsers(+id);
    }

    /**
     * Поиск пользователя по имени или фамилии.
     * Страница find-friends.
     * @param q
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Get("find-friends")
    async getSearchUsers(@Query("q") q: string, @Request() request: any) {
        return this.usersService.getSearchUsers(request, q);
    }

    /**
     * Поиск пользователя по имени или фамилии.
     * Страница friends.
     * @param q
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Get("friends")
    async getSearchFriends(@Query("q") q: string, @Request() request: any) {
        return this.usersService.getSearchFriends(request, q);
    }

    /**
     * Получение друзей
     * @param id
     */
    @Get("friends/:id")
    async getFriends(@Param("id") id: string) {
        return this.usersService.getFriends(+id);
    }

    /**
     * Добавление друзей.
     * @param id
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Post("friends/add/:id")
    async addFriend(@Param("id") id: string, @Request() request: any) {
        return this.usersService.addFriend(request, +id);
    }

    /**
     * Удаление друзей.
     * @param id
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Delete("friends/delete/:id")
    async deleteFriend(@Param("id") id: string, @Request() request: any) {
        return this.usersService.deleteFriend(request, +id);
    }

    /**
     * Запрос для загрузки изображений.
     * @param file
     */
    @Post("upload")
    @UseInterceptors(FileInterceptor("file", { storage }))
    async uploadedFile(@UploadedFile() file: Express.Multer.File) {}

    /**
     * Получения изображения профиля.
     * @param filename
     * @param res
     */
    @Get("upload/:filename")
    async getFile(@Param("filename") filename: string, @Res() res: any) {
        return res.sendFile(filename, {
            root: "./apps/messenger-backend/src/assets/profile_img",
        });
    }

    /**
     * Изменение данных пользователя.
     * @param id
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Patch("profile/:id")
    async editProfile(@Param("id") id: string, @Request() request: any) {
        return this.usersService.editProfile(request, +id);
    }
}
