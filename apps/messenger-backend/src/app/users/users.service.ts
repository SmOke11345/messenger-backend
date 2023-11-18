import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) {}

    /**
     * Получение всех пользователей из базы данных
     */
    getData() {
        return this.prismaService.users.findMany();
    }

    findUserById(id: number) {
        return this.prismaService.users.findFirst({
            where: {
                id,
            },
        });
    }
}
