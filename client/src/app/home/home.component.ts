import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { UserService } from '../shared/services/user.service';
import { Observable, of } from 'rxjs';
import { ClubEntity } from 'libs/index';
import { EditorClubComponent } from '../editors/editor-club/editor-club.component';
import { ClubTitleComponent } from '../shared/components/club-title/club-title.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, MenuBarComponent, EditorClubComponent, ClubTitleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private userService = inject(UserService);

  clubList$: Observable<ClubEntity[]> = of([]);
  publicClubList$: Observable<ClubEntity[]> = of([]);

  editorClubVisible = false;
  editClub?: ClubEntity;

  ngOnInit() {
    this.clubList$ = this.userService.accessIds$;
    this.publicClubList$ = this.apiService.publicClubs$;
    void this.loadData();
  }

  async loadData() {
    this.apiService.unloadClub();
    await this.apiService.fetchPublicClubs();
  }

  async navigateToClub(clubId: string | null) {
    if (clubId) {
      await this.router.navigateByUrl(`/club/${clubId}`);
    } else {
      // No club id
    }
  }

  newClub() {
    this.editClub = new ClubEntity();
    this.editorClubVisible = true;
  }
}
