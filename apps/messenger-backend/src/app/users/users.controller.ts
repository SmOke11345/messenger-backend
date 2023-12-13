import {
    Controller,
    Get,
    Inject,
    NotFoundException,
    Param,
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
     * Получение данных всех пользователей
     */
    @Get("")
    async getAllUsers(@Query("id") id: string) {
        return this.usersService.getAllUsers(+id);
    }

    /**
     * Поиск пользователя по имени или фамилии
     * @param q
     * @param request
     */
    @Post("search")
    async getSearchUsers(@Query("q") q: string, @Request() request: any) {
        const { auth_user_id } = request.body;
        return this.usersService.getSearchUsers(auth_user_id, q);
    }

    /**
     * Получение друзей
     */
    @Get("friends/:id")
    async getFriends(@Param("id") id: string) {
        // Параметры передаваемые в строку запроса являются строковым типом => нужно преобразовать в числовой
        const { friends } = await this.usersService.findUserById(+id);

        // Если массив с друзьями пуст выдаем ошибку
        if (friends.length === 0) {
            throw new NotFoundException("You haven't added any friends yet!");
        }

        return friends;
    }

    /**
     * Добавление друзей
     * @param id
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Post("friends/add/:id")
    async addFriend(@Param("id") id: string, @Request() request: any) {
        // TODO: Упростить, если это возможно, повторяющиеся строчки кода
        // Query параметр передает строковые значения, а нам нужны числовые
        const user = await this.usersService.findUserById(+id);
        const { auth_user_id } = request.body; // Получаем id вошедшего пользователя

        // TODO: Если пользователь уже в списке друзей, то выдать ошибку

        return this.usersService.addFriend(auth_user_id, user);
    }

    /**
     * Удаление друзей
     * @param id
     * @param request
     */
    @UseGuards(JwtAuthGuard)
    @Post("friends/delete/:id")
    async deleteFriend(@Param("id") id: string, @Request() request: any) {
        // TODO: Упростить, если это возможно, повторяющиеся строчки кода
        // Query параметр передает строковые значения, а нам нужны числовые
        const user = await this.usersService.findUserById(+id);
        const { auth_user_id } = request.body; // Получаем id вошедшего пользователя

        return this.usersService.deleteFriend(auth_user_id, user);
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
