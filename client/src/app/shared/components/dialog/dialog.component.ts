import { Component, computed, EventEmitter, inject, input, model, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-dialog',
  imports: [DialogModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  confirmationService = inject(ConfirmationService);

  readonly title = input('Title');
  readonly visible = model(true);
  readonly editor = input(false);
  readonly closeIcon = input<string>();
  readonly appendTo = input<string>();
  readonly form = input<FormGroup>();

  @Output() closeDialog = new EventEmitter<void>();

  isEditor = computed(() => this.editor() || this.form());

  tryCloseEditor() {
    if (this.form()?.dirty) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to code editor? Changes will be lost',
        header: 'Usaved Changes',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: 'none',
        rejectIcon: 'none',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
          this.closeDialog.emit();
        },
        reject: () => {
          this.visible.update(() => true);
        },
      });
    } else {
      this.closeDialog.emit();
    }
  }
}
