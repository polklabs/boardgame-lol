import { Component, computed, input } from '@angular/core';
import { TagComponent } from '../tag/tag.component';
import { PopoverModule } from 'primeng/popover';
import { DecimalPipe, NgClass, NgStyle } from '@angular/common';
import { TagEntity } from 'libs/index';
import { DetailLinkComponent } from "../detail-link/detail-link.component";

export type StatsTableItem = {
  emoji?: string;
  tooltip?: string;
  title: string;
  subtitle?: string;
  content?: unknown[];
  value?: number;
};

@Component({
  selector: 'app-stats-table',
  imports: [TagComponent, PopoverModule, DecimalPipe, NgClass, NgStyle, DetailLinkComponent],
  templateUrl: './stats-table.component.html',
  styleUrl: './stats-table.component.scss',
})
export class StatsTableComponent {
  readonly header = input.required<string>();
  readonly headerIcon = input<string>();
  readonly items = input.required<StatsTableItem[]>();
  readonly smallHeader = input<boolean>(false);
  
  readonly customHeight = input<number>(67);
  readonly customTitleWidth = input<number>(150);

  hasIcons = computed(() => this.items().some(x => x.emoji));

  isTag(item: unknown) {
    return item instanceof TagEntity;
  }
}
