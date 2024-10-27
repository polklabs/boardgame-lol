import { Component, Input } from '@angular/core';
import { StatsModel } from '../../shared/models/stats.model';
import { CommonModule } from '@angular/common';
import { PipeModule } from '../../shared/pipes/pipe.module';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [PipeModule, CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  @Input() stats?: StatsModel;
}
