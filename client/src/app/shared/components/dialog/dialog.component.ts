import { Component, EventEmitter, input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-dialog',
  imports: [DialogModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  readonly title = input('Title');
  readonly visible = input(true);
  readonly editor = input(false);
  readonly closeIcon = input<string>();
  readonly appendTo = input<string>();

  @Output() visibleChange = new EventEmitter<void>();
}
