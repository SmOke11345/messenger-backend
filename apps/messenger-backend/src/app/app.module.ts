import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { GatewayModule } from "./gateway/gateway.module";

@Module({
    imports: [
        AuthModule,
        PassportModule.register({
            session: true,
        }),
        UsersModule,
        GatewayModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
