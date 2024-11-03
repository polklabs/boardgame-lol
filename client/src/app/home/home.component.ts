import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { AccessIds, UserService } from '../shared/services/user.service';
import { Observable, of } from 'rxjs';
import { ClubEntity } from 'libs/index';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, MenuBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  clubList$: Observable<AccessIds[]> = of([]);
  publicClubList$: Observable<ClubEntity[]> = of([]);

  editorClubVisible = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private userService: UserService,
  ) {}

  async ngOnInit() {
    this.clubList$ = this.userService.accessIds$;
    this.publicClubList$ = this.apiService.publicClubs$;
    this.apiService.unloadClub();
    this.apiService.fetchPublicClubs();
  }

  async navigateToClub(clubId: string | null) {
    if (clubId) {
      await this.router.navigateByUrl(`/club/${clubId}`);
    } else {
      // No club id
    }
  }
}
