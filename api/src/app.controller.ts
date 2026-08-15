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
  Inject,
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
import { BoardGameEntity, ClubEntity, PlayerEntity, TagEntity, ClubReturn, GameEntity, EventEntity } from 'libs/index';
import { TagManager } from './managers/Tag.manager';
import { PlayerGamePlayerManager } from './managers/PlayerGamePlayer.manager';
import { EventManager } from './managers/Event.manager';
import { AuthCheckGuard } from './auth/auth-check.guard';
import { ClubUserManager } from './managers/ClubUser.manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const publicThrottle = { default: { limit: 60, ttl: 600000 } };
const authThrottle = { default: { limit: 30, ttl: 30000 } };

@Controller('api')
@UseGuards(ThrottlerBehindProxyGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private clubManager: ClubManager,
    private clubUserManager: ClubUserManager,
    private gameManager: GameManager,
    private boardGameManager: BoardGameManager,
    private playerGameManager: PlayerGameManager,
    private playerGamePlayerManager: PlayerGamePlayerManager,
    private playerManager: PlayerManager,
    private tagManager: TagManager,
    private eventManager: EventManager,
  ) {}

  getUserId(request: any): string {
    if (request['user']) {
      return request['user'].userId;
    } else {
      throw new UnauthorizedException();
    }
  }

  getClubAccess(request: any, params: { clubId?: string; ClubId?: string }, admin = false) {
    const userId = this.getUserId(request);
    const clubId = params.clubId ?? params.ClubId;
    if (!clubId) {
      throw new AuthorizationError('You do not have acced to edit this club');
    } else if (admin) {
      this.clubUserManager.hasAdminAccess(userId, clubId);
    } else {
      this.clubUserManager.hasAccess(userId, clubId);
    }
    return { userId, clubId };
  }

  tryGetUserId(request: any) {
    try {
      return this.getUserId(request);
    } catch {
      return undefined;
    }
  }

  bustCache() {
    this.cacheManager.del('clubs');
  }

  handleErrors(e: any) {
    if (e instanceof ValidationError) {
      throw new HttpException(e.message, HttpStatus.UNPROCESSABLE_ENTITY);
    } else if (e instanceof AuthorizationError) {
      throw new HttpException(e.message, HttpStatus.FORBIDDEN);
    } else {
      console.error(e);
      throw new HttpException(e.toString(), HttpStatus.BAD_REQUEST);
    }
  }

  /// --------------------------------------------------------------------------------
  /// Club
  /// --------------------------------------------------------------------------------
  @Throttle(publicThrottle)
  @UseGuards(AuthCheckGuard)
  @Get('clubs')
  async getPublicClubs(@Request() req: any) {
    const userId = this.tryGetUserId(req);
    if (userId) {
      return this.clubManager.loadManyWithAuth(userId);
    } else {
      const cachedClubs = await this.cacheManager.get<ClubEntity[]>('clubs');
      if (cachedClubs) {
        return cachedClubs;
      } else {
        const toReturn = this.clubManager.loadManyWithAuth(userId);
        await this.cacheManager.set('clubs', toReturn, 1000 * 60 * 60);
        return toReturn;
      }
    }
  }

  @Throttle(publicThrottle)
  @UseGuards(AuthCheckGuard)
  @Get('club/:clubId')
  getClub(@Request() req: any, @Param() params: { clubId: string }): ClubReturn {
    const clubId = params.clubId;
    const userId = this.tryGetUserId(req);
    const Club = this.clubManager.loadOneWithAuth(clubId, userId);
    if (Club) {
      return {
        Club,
        ClubUsers: !!userId && Club.CanEdit ? this.clubUserManager.loadManyWithUsername(clubId) : [],
        Games: this.gameManager.loadMany(ClubEntity, clubId),
        PlayerGamePlayers: this.playerGamePlayerManager.loadMany(ClubEntity, clubId),
        PlayerGames: this.playerGameManager.loadMany(ClubEntity, clubId),
        BoardGames: this.boardGameManager.loadMany(ClubEntity, clubId),
        Players: this.playerManager.loadMany(ClubEntity, clubId),
        Tags: this.tagManager.loadMany(ClubEntity, clubId),
        TagBoardGames: this.tagManager.tagBoardGame.loadMany(ClubEntity, clubId),
        TagGames: this.tagManager.tagGame.loadMany(ClubEntity, clubId),
        TagPlayers: this.tagManager.tagPlayer.loadMany(ClubEntity, clubId),
        TagPlayerGames: this.tagManager.tagPlayerGame.loadMany(ClubEntity, clubId),
        Events: this.eventManager.loadMany(ClubEntity, clubId),
      };
    } else {
      throw new NotFoundException();
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Put('club')
  addClub(@Request() req: any, @Body() entity: ClubEntity) {
    try {
      const id = this.getUserId(req);
      this.bustCache();
      return this.clubManager.put(id, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Patch('club')
  updateClub(@Request() req: any, @Body() entity: ClubEntity) {
    try {
      const ids = this.getClubAccess(req, entity);
      this.bustCache();
      return this.clubManager.patch(ids.userId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Delete('club/:clubId')
  deleteClub(@Request() req: any, @Param() params: { clubId: string }) {
    try {
      const ids = this.getClubAccess(req, params, true);
      this.bustCache();
      this.clubManager.delete(ids.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }

  /// --------------------------------------------------------------------------------
  /// Game
  /// --------------------------------------------------------------------------------
  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Put('game/:clubId')
  addGame(@Request() req: any, @Param() params: { clubId: string }, @Body() wrapper: GameEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      this.bustCache();
      return this.gameManager.put(ids.userId, ids.clubId, wrapper);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Patch('game/:clubId')
  updateGame(@Request() req: any, @Param() params: { clubId: string }, @Body() wrapper: GameEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.gameManager.patch(ids.userId, ids.clubId, wrapper);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Delete('game/:clubId/:gameId')
  deleteGame(@Request() req: any, @Param() params: { clubId: string; gameId: string }) {
    try {
      const ids = this.getClubAccess(req, params);
      this.bustCache();
      this.gameManager.delete(params.gameId, ids.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Patch('game/:clubId/:gameId/:direction')
  updateSortIndex(@Request() req: any, @Param() params: { clubId: string; gameId: string; direction: number }) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.gameManager.updateSortIndex(ids.userId, ids.clubId, params.gameId, +params.direction);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  /// --------------------------------------------------------------------------------
  /// Player
  /// --------------------------------------------------------------------------------
  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Put('player/:clubId')
  addPlayer(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: PlayerEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      this.bustCache();
      return this.playerManager.put(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Patch('player/:clubId')
  updatePlayer(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: PlayerEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.playerManager.patch(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Delete('player/:clubId/:playerId')
  deletePlayer(@Request() req: any, @Param() params: { clubId: string; playerId: string }) {
    try {
      const ids = this.getClubAccess(req, params);
      this.bustCache();
      this.playerManager.delete(params.playerId, ids.clubId);
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
  @Put('board-game/:clubId')
  addBoardGame(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: BoardGameEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      this.bustCache();
      return this.boardGameManager.put(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Patch('board-game/:clubId')
  updateBoardGame(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: BoardGameEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.boardGameManager.patch(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Delete('board-game/:clubId/:boardGameId')
  deleteBoardGame(@Request() req: any, @Param() params: { clubId: string; boardGameId: string }) {
    try {
      const ids = this.getClubAccess(req, params);
      this.bustCache();
      this.boardGameManager.delete(params.boardGameId, ids.clubId);
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
  @Put('tag/:clubId')
  addTag(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: TagEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.tagManager.put(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Patch('tag/:clubId')
  updateTag(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: TagEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.tagManager.patch(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Delete('tag/:clubId/:tagId')
  deleteTag(@Request() req: any, @Param() params: { clubId: string; tagId: string }) {
    try {
      const ids = this.getClubAccess(req, params);
      this.tagManager.delete(params.tagId, ids.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }

  /// --------------------------------------------------------------------------------
  /// Event
  /// --------------------------------------------------------------------------------
  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Put('event/:clubId')
  addEvent(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: EventEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.eventManager.put(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Patch('event/:clubId')
  updateEvent(@Request() req: any, @Param() params: { clubId: string }, @Body() entity: EventEntity) {
    try {
      const ids = this.getClubAccess(req, params);
      return this.eventManager.patch(ids.userId, ids.clubId, entity);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(authThrottle)
  @UseGuards(AuthGuard)
  @Delete('event/:clubId/:eventId')
  deleteEvent(@Request() req: any, @Param() params: { clubId: string; eventId: string }) {
    try {
      const ids = this.getClubAccess(req, params);
      this.eventManager.delete(params.eventId, ids.clubId);
    } catch (e) {
      this.handleErrors(e);
    }
    return HttpStatus.OK;
  }
}
