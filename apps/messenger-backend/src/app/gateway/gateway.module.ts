import { Module } from "@nestjs/common";
import { Gateways } from "./gateway";

@Module({
    controllers: [],
    providers: [Gateways],
})
export class GatewayModule {}
