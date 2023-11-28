import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
    async canActivate(context: ExecutionContext) {
        // Когда дело доходит до входа пользователя в систему
        const result = (await super.canActivate(context)) as boolean;

        // Получаем запрос, который был отправлен
        const request = context.switchToHttp().getRequest();

        // Входим в систему используя passport
        await super.logIn(request);

        // десериализация данных и их вывод из базы данный по полученному id пользователя
        return result;
    }
}
