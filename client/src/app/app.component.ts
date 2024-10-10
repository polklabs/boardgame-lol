import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpService } from './shared/services/http.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ProgressSpinnerModule, ToastModule, ConfirmDialogModule],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'BoardGame.lol';

  showSpinner$: Observable<boolean>;

  constructor(httpService: HttpService) {
    this.showSpinner$ = httpService.loadingSpinner$;
  }
}
