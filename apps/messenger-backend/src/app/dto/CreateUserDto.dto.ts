import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsString()
    lastname: string;

    @MinLength(6)
    @IsString()
    password: string;
}
