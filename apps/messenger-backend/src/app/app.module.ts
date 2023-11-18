import { AuthModule } from "./auth/auth.module";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "./users/users.module";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        AuthModule,
        PassportModule.register({
            session: true,
        }),
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
