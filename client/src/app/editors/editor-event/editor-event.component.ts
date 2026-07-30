import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { buildForm } from '../../shared/form.utils';
import { EventEntity } from 'libs/index';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../shared/services/api.service';
import { TableComponent } from '../../shared/components/table/table.component';
import { Column } from '../../shared/models/column.model';
import { format } from 'date-fns';
import { TextInputComponent } from '../../shared/components/form-components/textinput/textinput.component';
import { CalendarComponent } from '../../shared/components/form-components/calendar/calendar.component';
import { HideDirective } from '../../shared/directives/hide.directive';

type EntityType = EventEntity;

@Component({
  selector: 'app-editor-event',
  imports: [
    DialogModule,
    TextInputComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    TableComponent,
    HideDirective,
  ],
  templateUrl: './editor-event.component.html',
  styleUrl: './editor-event.component.scss',
})
export class EditorEventComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() editorVisible = false;
  @Output() closeEditor = new EventEmitter<EventEntity>();
  @Output() deleteEntity = new EventEmitter<EventEntity>();

  columns: Column<EventEntity>[] = [
    { id: 'Name', sort: true, dataType: 'text' },
    { id: 'StartDate', sort: true, name: 'Start Date', dataType: 'date' },
    { id: 'EndDate', sort: true, name: 'End Date', dataType: 'date' },
  ];

  title = 'Manage Events';
  isNew = false;

  events: EventEntity[] = [];

  event?: EventEntity;
  entityType = EventEntity;

  formGroup!: FormGroup;
  hideFields: Set<keyof EntityType> = new Set();

  subtypes: string[] = [];

  ngOnInit(): void {
    this.apiService.events.raw$.subscribe((events) => {
      this.events = events;
    });
  }

  editEvent(event: EventEntity) {
    this.buildForm(event);
  }

  newEvent() {
    this.buildForm(new EventEntity({ ClubId: this.apiService.clubId }));
  }

  buildForm(event: EventEntity): void {
    this.event = event;
    if (this.event.EventId === '') {
      this.title = 'New Event';
      this.isNew = true;
    } else {
      this.title = 'Edit Event';
      this.isNew = false;
    }

    this.hideFields = new Set();
    this.formGroup = buildForm(this.fb, this.entityType, new EventEntity());

    const instance = new EventEntity(this.event);
    this.formGroup.patchValue(instance);

    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.event = undefined;
    this.title = 'Manage Events';
  }

  getControl(key: keyof EntityType) {
    return this.formGroup.get(key);
  }

  async submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.event) {
      return;
    } else {
      const eventData = this.formGroup.getRawValue();

      eventData.StartDate = format(eventData.DateObj[0], 'yyyy-MM-dd');
      eventData.EndDate = eventData.DateObj[1] ? format(eventData.DateObj[1], 'yyyy-MM-dd') : eventData.StartDate;

      const result = await this.apiService.postEvent(this.event.EventId === '', new EventEntity(eventData));
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Event' });
        this.event = undefined;
        this.title = 'Manage Events';
      } else {
        // Do nothing
      }
    }
  }

  toDeleteEntity() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Deleting Event',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        const result = await this.apiService.deleteEvent(this.event!.EventId);
        if (result) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted Event' });
          this.event = undefined;
          this.title = 'Manage Events';
        } else {
          // Do nothing
        }
      },
    });
  }
}
