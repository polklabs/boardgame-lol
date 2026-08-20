import { Component, inject, input } from '@angular/core';
import { TagEntity } from 'libs/index';
import { TagModule } from 'primeng/tag';
import { DetailService } from '../../services/detail.service';

@Component({
  selector: 'app-tag',
  imports: [TagModule],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
})
export class TagComponent {
  detailService = inject(DetailService);

  tag = input.required<TagEntity>();
  detail = input(true);

  tagClick(event: MouseEvent) {
    if (this.detail() && this.detailService.showDetail(this.tag())) {
      event.stopImmediatePropagation();
    } else {
      // Continue
    }
  }
}
