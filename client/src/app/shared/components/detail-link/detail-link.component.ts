import { Component, inject, input } from '@angular/core';
import { MapPipe } from '../../pipes/map.pipe';
import { DetailService } from '../../services/detail.service';

@Component({
  selector: 'app-detail-link',
  imports: [MapPipe],
  templateUrl: './detail-link.component.html',
  styleUrl: './detail-link.component.scss',
})
export class DetailLinkComponent {
  detailService = inject(DetailService);

  objects = input<unknown[]>();
  keys = input.required<string | string[]>();
  hasLinks = input<boolean>(false);

  showLink(object: unknown) {
    return this.hasLinks() && this.detailService.canShowDetail(object as object);
  }

  linkClick(object: unknown, event: MouseEvent) {
    if (this.detailService.showDetail(object as object)) {
      event.stopImmediatePropagation();
    } else {
      // Continue
    }
  }
}
