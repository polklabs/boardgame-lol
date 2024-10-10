import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { Observable, of } from 'rxjs';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, MenuBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  clubList$: Observable<{ id: string; name: string }[]> = of([]);

  editorClubVisible = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private userService: UserService,
  ) {}

  async ngOnInit() {
    this.clubList$ = this.userService.accessIds$;
    this.apiService.unloadClub();
  }

  async navigateToClub(clubId: string | null) {
    if (clubId) {
      await this.router.navigateByUrl(`/club/${clubId}`);
    } else {
      // No club id
    }
  }
}
