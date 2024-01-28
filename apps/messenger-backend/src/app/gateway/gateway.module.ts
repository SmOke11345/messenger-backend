import { Module } from "@nestjs/common";
import { Gateways } from "./gateway";

@Module({
    providers: [Gateways],
})
export class GatewayModule {}
