import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerGameEntity } from 'libs/index';

@Component({
  selector: 'app-trophy-icon',
  imports: [NgStyle],
  templateUrl: './trophy-icon.component.html',
  styleUrl: './trophy-icon.component.scss',
})
export class TrophyIconComponent {
  @Input() score!: PlayerGameEntity;

  getTrophyColor(): string {
    if (this.score.Game?.BoardGame?.ScoreType === 'rank') {
      if (this.score.Points === 0) {
        return 'gold';
      } else if (this.score.Points === 1) {
        return 'silver';
      } else {
        return 'chocolate';
      }
    } else {
      return 'gold';
    }
  }
}
