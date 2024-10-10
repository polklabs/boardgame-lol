import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbService } from './services/db.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EmojiService } from './auth/emoji.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { BoardGameManager } from './managers/BoardGame.manager';
import { GameManager } from './managers/Game.manager';
import { ClubManager } from './managers/Club.manager';
import { PlayerManager } from './managers/Player.manager';
import { PlayerGameManager } from './managers/PlayerGame.manager';
import { UserManager } from './managers/User.manager';
import { ClubUserManager } from './managers/ClubUser.manager';

const clientPath = process.env.CLIENT_PATH ?? join(__dirname, '../../../../dist/client/browser');

@Module({
  controllers: [AppController, AuthController],
  providers: [
    DbService,
    BoardGameManager,
    GameManager,
    ClubManager,
    PlayerManager,
    PlayerGameManager,
    UserManager,
    ClubUserManager,
    AuthService,
    EmailService,
    EmojiService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    ServeStaticModule.forRoot({
      rootPath: clientPath,
    }),
    ThrottlerModule.forRoot([{ ttl: 1000, limit: 10 }]),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
