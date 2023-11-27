import {
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { FileInterceptor } from "@nestjs/platform-express";

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
