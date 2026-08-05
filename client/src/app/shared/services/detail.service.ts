import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardGameEntity, GameEntity, PlayerEntity } from 'libs/index';
import { BehaviorSubject, take } from 'rxjs';
import { ApiService } from './api.service';

type EntityOptions = BoardGameEntity | GameEntity | PlayerEntity | null;

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  private _detailView$ = new BehaviorSubject<'boardGame' | 'game' | 'player' | null>(null);
  private _detailEntity: EntityOptions = null;

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

  constructor() {
    this.api.dataUpdate$.pipe(take(2)).subscribe(() => {
      console.log('data update');
      const detailId = this.route.snapshot.queryParamMap.get('detail');
      console.log(detailId);
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

  showDetail(detailEntity: object) {
    if (detailEntity instanceof BoardGameEntity) {
      this._detailView$.next('boardGame');
      this.setParams(detailEntity.BoardGameId);
    } else if (detailEntity instanceof GameEntity) {
      this._detailView$.next('game');
      this.setParams(detailEntity.GameId);
    } else if (detailEntity instanceof PlayerEntity) {
      this._detailView$.next('player');
      this.setParams(detailEntity.PlayerId);
    } else {
      this.clearParams();
      throw new TypeError('Unknown entity', detailEntity);
    }
    this._detailEntity = detailEntity;
    console.log(detailEntity)
  }

  hideDetail() {
    this._detailView$.next(null);
    this._detailEntity = null;
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
