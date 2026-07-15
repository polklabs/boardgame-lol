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
  NotFoundException,
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
import { BoardGameEntity, ClubEntity, PlayerEntity, TagEntity, ClubReturn, GameEntity } from 'libs/index';
import { TagManager } from './managers/Tag.manager';
import { PlayerGamePlayerManager } from './managers/PlayerGamePlayer.manager';

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
    private playerGamePlayerManager: PlayerGamePlayerManager,
    private playerManager: PlayerManager,
    private tagManager: TagManager,
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
    return this.clubManager.loadMany('Public', ['1']);
  }

  @Throttle(publicThrottle)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('club/:clubId')
  getClub(@Param() params: { clubId: string }): ClubReturn {
    const clubId = params.clubId;
    const Club = this.clubManager.loadOne(clubId);
    if (Club) {
      return {
        Club,
        Games: this.gameManager.loadMany('ClubId', clubId),
        PlayerGamePlayers: this.playerGamePlayerManager.loadMany('ClubId', clubId),
        PlayerGames: this.playerGameManager.loadMany('ClubId', clubId),
        BoardGames: this.boardGameManager.loadMany('ClubId', clubId),
        Players: this.playerManager.loadMany('ClubId', clubId),
        Tags: this.tagManager.loadMany('ClubId', clubId),
        TagBoardGames: this.tagManager.tagBoardGame.loadMany('ClubId', clubId),
        TagGames: this.tagManager.tagGame.loadMany('ClubId', clubId),
        TagPlayers: this.tagManager.tagPlayer.loadMany('ClubId', clubId),
        TagPlayerGames: this.tagManager.tagPlayerGame.loadMany('ClubId', clubId),
      };
    } else {
      throw new NotFoundException();
    }
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
  addGame(@Request() req: any, @Body() wrapper: GameEntity) {
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
  updateGame(@Request() req: any, @Body() wrapper: GameEntity) {
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

  /// --------------------------------------------------------------------------------
  /// Tags
  /// --------------------------------------------------------------------------------
  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put('tag')
  addTag(@Request() req: any, @Body() entity: TagEntity) {
    try {
      return this.tagManager.put(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('tag')
  updateTag(@Request() req: any, @Body() entity: TagEntity) {
    try {
      return this.tagManager.patch(this.getUserId(req), entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('tag/:clubId/:tagId')
  deleteTag(@Request() req: any, @Param() params: { clubId: string; tagId: string }) {
    try {
      this.tagManager.delete(this.getUserId(req), params.tagId, params.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }
}
