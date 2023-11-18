/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

import passport from "passport";
import session from "express-session";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const globalPrefix = "api";

  app.setGlobalPrefix(globalPrefix);

  // TODO: в дальнейшем если нужно будет, реализовать раздельные ошибки в register
  // гарантирует, что все конечные точки защищены от получения не верных данных
  // app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      name: "NESTJS_SESSION_ID",
      secret: "m*f~w^cMMK2CQ3:",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
