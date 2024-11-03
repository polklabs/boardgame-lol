import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Put,
  UseGuards,
  Request,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { ValidationError } from './errors/validation.error';
import { AuthorizationError } from './errors/authorization.error';
import { AuthGuard } from './auth/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './guards/throttler-behind-proxy.guard';
import { ClubManager } from './managers/Club.manager';
import { GameManager } from './managers/Game.manager';
import { BoardGameManager } from './managers/BoardGame.manager';
import { PlayerGameManager } from './managers/PlayerGame.manager';
import { PlayerManager } from './managers/Player.manager';
import { BoardGameEntity, GameWrapper, ClubEntity, PlayerEntity } from 'libs/index';

const publicThrottle = { default: { limit: 200, ttl: 600000 } };
const authThrottle = { default: { limit: 15, ttl: 30000 } };

@Controller('api')
@UseGuards(ThrottlerBehindProxyGuard)
export class AppController {
  constructor(
    private clubManager: ClubManager,
    private gameManager: GameManager,
    private boardGameManager: BoardGameManager,
    private playerGameManager: PlayerGameManager,
    private playerManager: PlayerManager,
  ) {}

  getUserId(request: any) {
    if (request['user']) {
      return request['user'].userId;
    } else {
      throw new UnauthorizedException();
    }
  }

  handleErrors(e: any) {
    if (e instanceof ValidationError) {
      throw new HttpException(e.message, HttpStatus.UNPROCESSABLE_ENTITY);
    } else if (e instanceof AuthorizationError) {
      throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
    } else {
      console.error(e);
      throw new HttpException(e.toString(), HttpStatus.BAD_REQUEST);
    }
  }

  /// --------------------------------------------------------------------------------
  /// Club
  /// --------------------------------------------------------------------------------
  @Throttle(publicThrottle)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('clubs')
  getPublicClubs() {
    return this.clubManager.loadMany('Public', '1');
  }

  @Throttle(publicThrottle)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('club/:clubId')
  getClub(@Param() params: { clubId: string }) {
    return {
      Club: this.clubManager.loadOne(params.clubId),
      Games: this.gameManager.loadMany('ClubId', params.clubId),
      PlayerGames: this.playerGameManager.loadMany('ClubId', params.clubId),
      BoardGames: this.boardGameManager.loadMany('ClubId', params.clubId),
      Players: this.playerManager.loadMany('ClubId', params.clubId),
    };
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put('club')
  addClub(@Request() req: any, @Body() entity: ClubEntity) {
    try {
      return this.clubManager.put(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('club')
  updateClub(@Request() req: any, @Body() entity: ClubEntity) {
    try {
      return this.clubManager.patch(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  /// --------------------------------------------------------------------------------
  /// Game
  /// --------------------------------------------------------------------------------
  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put('game')
  addGame(@Request() req: any, @Body() wrapper: GameWrapper) {
    try {
      return this.gameManager.put(this.getUserId(req), wrapper);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('game')
  updateGame(@Request() req: any, @Body() wrapper: GameWrapper) {
    try {
      return this.gameManager.patch(this.getUserId(req), wrapper);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('game/:clubId/:gameId')
  deleteGame(@Request() req: any, @Param() params: { clubId: string; gameId: string }) {
    try {
      this.gameManager.delete(this.getUserId(req), params.gameId, params.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('game/:clubId/:gameId/:direction')
  updateSortIndex(@Request() req: any, @Param() params: { clubId: string; gameId: string; direction: number }) {
    try {
      return this.gameManager.updateSortIndex(this.getUserId(req), params.gameId, params.clubId, +params.direction);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  /// --------------------------------------------------------------------------------
  /// Player
  /// --------------------------------------------------------------------------------
  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put('player')
  addPlayer(@Request() req: any, @Body() entity: PlayerEntity) {
    try {
      return this.playerManager.put(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('player')
  updatePlayer(@Request() req: any, @Body() entity: PlayerEntity) {
    try {
      return this.playerManager.patch(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('player/:clubId/:playerId')
  deletePlayer(@Request() req: any, @Param() params: { clubId: string; playerId: string }) {
    try {
      this.playerManager.delete(this.getUserId(req), params.playerId, params.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }

  /// --------------------------------------------------------------------------------
  /// BoardGame
  /// --------------------------------------------------------------------------------
  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put('board-game')
  addBoardGame(@Request() req: any, @Body() entity: BoardGameEntity) {
    try {
      return this.boardGameManager.put(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('board-game')
  updateBoardGame(@Request() req: any, @Body() entity: BoardGameEntity) {
    try {
      return this.boardGameManager.patch(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('board-game/:clubId/:boardGameId')
  deleteBoardGame(@Request() req: any, @Param() params: { clubId: string; boardGameId: string }) {
    try {
      this.boardGameManager.delete(this.getUserId(req), params.boardGameId, params.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }
}
