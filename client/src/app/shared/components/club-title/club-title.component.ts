import { Component, Input } from '@angular/core';
import { ClubEntity } from 'libs/index';

@Component({
  selector: 'app-club-title',
  imports: [],
  templateUrl: './club-title.component.html',
  styleUrl: './club-title.component.scss',
})
export class ClubTitleComponent {
  @Input() club?: ClubEntity;

  @Input() color?: string;
  @Input() bgColor?: string;
  @Input() name?: string;
  @Input() font?: string;
  @Input() fontSize?: string;

  getTextStroke() {
    const color = this.bgColor ?? this.club?.BackgroundColor;
    if (color) {
      return `1px ${color}`;
    } else {
      return 'unset';
    }
  }
}
