import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardGameEntity, GameEntity, PlayerEntity, PlayerGameEntity, TagEntity } from 'libs/index';
import { BehaviorSubject, take } from 'rxjs';
import { ApiService } from './api.service';

type EntityOptions = BoardGameEntity | GameEntity | PlayerEntity | TagEntity | null;

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  private _detailView$ = new BehaviorSubject<'boardGame' | 'game' | 'player' | 'tag' | null>(null);
  private _detailEntity: EntityOptions = null;
  private _detailHistory: EntityOptions[] = [];

  get hasHistory() {
    return this._detailHistory.length > 0;
  }

  get detailView$() {
    return this._detailView$.asObservable();
  }

  get detailView() {
    return this._detailView$.value;
  }

  get detailBoardGame() {
    return this._detailEntity as BoardGameEntity;
  }
  get detailGame() {
    return this._detailEntity as GameEntity;
  }
  get detailPlayer() {
    return this._detailEntity as PlayerEntity;
  }
  get detailTag() {
    return this._detailEntity as TagEntity;
  }

  constructor() {
    this.api.dataUpdate$.pipe(take(2)).subscribe(() => {
      const detailId = this.route.snapshot.queryParamMap.get('detail');
      if (detailId) {
        // Continue
      } else {
        return;
      }

      let entity: EntityOptions = this.api.boardGames.getOne(detailId);
      if (entity) {
        this.showDetail(entity);
        return;
      } else {
        // Continue
      }

      entity = this.api.games.getOne(detailId);
      if (entity) {
        this.showDetail(entity);
        return;
      } else {
        // Continue
      }

      entity = this.api.players.getOne(detailId);
      if (entity) {
        this.showDetail(entity);
      } else {
        // Continue
      }
    });
  }

  canShowDetail(detailEntity: object) {
    return (
      detailEntity instanceof BoardGameEntity ||
      detailEntity instanceof GameEntity ||
      detailEntity instanceof PlayerEntity ||
      detailEntity instanceof TagEntity ||
      (detailEntity instanceof PlayerGameEntity && detailEntity.Players.length === 1)
    );
  }

  showDetail(detailEntity: object) {
    if (detailEntity === this._detailEntity) {
      return;
    } else if (detailEntity instanceof BoardGameEntity) {
      this._detailView$.next('boardGame');
      this.setParams(detailEntity.BoardGameId);
    } else if (detailEntity instanceof GameEntity) {
      this._detailView$.next('game');
      this.setParams(detailEntity.GameId);
    } else if (detailEntity instanceof PlayerEntity) {
      this._detailView$.next('player');
      this.setParams(detailEntity.PlayerId);
    } else if (detailEntity instanceof PlayerGameEntity && detailEntity.Players.length === 1) {
      this._detailView$.next('player');
      this.setParams(detailEntity.Players[0].PlayerId);
      detailEntity = detailEntity.Players[0];
    } else if (detailEntity instanceof TagEntity) {
      this._detailView$.next('tag');
      this.setParams(detailEntity.TagId);
    } else {
      this.clearParams();
      console.warn('Unknown entity', detailEntity);
      return false;
    }
    if (this._detailEntity) {
      this._detailHistory.push(this._detailEntity);
    } else {
      // Nothing to store
    }
    this._detailEntity = detailEntity as EntityOptions;
    return true;
  }

  goBack() {
    if (this._detailHistory.length > 0) {
      this._detailEntity = null;
      this.showDetail(this._detailHistory.pop()!);
    } else {
      // Skip
    }
  }

  hideDetail() {
    this._detailView$.next(null);
    this._detailEntity = null;
    this._detailHistory = [];
    this.clearParams();
  }

  clearParams() {
    this.router.navigate([], {
      queryParams: {},
      queryParamsHandling: 'replace',
      preserveFragment: true,
    });
  }

  setParams(id: string) {
    this.router.navigate([], {
      queryParams: { detail: id },
      queryParamsHandling: 'replace',
      preserveFragment: true,
    });
  }
}
