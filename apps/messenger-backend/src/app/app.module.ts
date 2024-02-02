import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { GatewayModule } from "./gateway/gateway.module";
import { ChatsModule } from "./chats/chats.module";

@Module({
    imports: [
        AuthModule,
        PassportModule.register({
            session: true,
        }),
        UsersModule,
        GatewayModule,
        ChatsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
