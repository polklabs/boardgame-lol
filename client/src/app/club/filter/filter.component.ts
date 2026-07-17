import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { Popover, PopoverModule } from 'primeng/popover';
import { Observable, Subscription } from 'rxjs';
import { SortPipe } from '../../shared/pipes/sort.pipe';
import { ApiService } from '../../shared/services/api.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AsyncPipe } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { DAYS_OF_WEEK, FilterModel } from '../../shared/models/filter.mode';
import { buildForm } from '../../shared/form.utils';
import { MultiSelectComponent } from '../../shared/components/multi-select/multi-select.component';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-filter',
  imports: [
    PopoverModule,
    BadgeModule,
    SortPipe,
    FloatLabelModule,
    MultiSelectModule,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    CalendarComponent,
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  ogBoardGames$ = this.apiService.boardGameList$;
  ogPlayers$ = this.apiService.playerList$;
  tags$ = this.apiService.tagList$;

  dow = DAYS_OF_WEEK;

  entityType = FilterModel;
  formGroup!: FormGroup;

  filterEnabled$: Observable<boolean> = this.apiService.filterEnabled$;

  subscriptions = new Subscription();

  ngOnInit(): void {
    this.formGroup = buildForm(this.fb, this.entityType, new FilterModel({}));

    this.subscriptions.add(
      this.apiService.dataUpdate$.subscribe(() => {
        this.formGroup.patchValue({
          boardGameIds: this.apiService.boardGameList.map((x) => x.BoardGameId),
          playerIds: this.apiService.playerList.map((x) => x.PlayerId),
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  enableFilter(po: Popover) {
    po.hide();
    const filter = this.formGroup.getRawValue();
    filter.enabled = this.formGroup.valid && this.formGroup.dirty;
    this.apiService.filter(filter);
  }

  disableFilter(filter: Popover) {
    filter.hide();
    this.apiService.filter({});
  }
}
