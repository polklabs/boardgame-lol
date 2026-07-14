import { Component, Input } from '@angular/core';
import { TagEntity } from 'libs/index';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-tag',
  imports: [TagModule],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
})
export class TagComponent {
  @Input() tag!: TagEntity;
  @Input() icon?: string;
}
