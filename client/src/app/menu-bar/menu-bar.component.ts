import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { ApiService } from '../shared/services/api.service';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { LoginComponent } from '../login/login.component';
import { PasswordUpdateComponent } from '../password-update/password-update.component';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, ButtonModule, SplitButtonModule, MenuModule, LoginComponent, PasswordUpdateComponent],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss',
})
export class MenuBarComponent implements OnInit, OnDestroy {
  @Input() page: 'home' | 'club' | 'player' | 'board-game' = 'home';

  @Output() editClub = new EventEmitter();
  @Output() newClub = new EventEmitter();

  @Output() editPlayer = new EventEmitter();
  @Output() newPlayer = new EventEmitter();

  @Output() editBoardGame = new EventEmitter();
  @Output() newBoardGame = new EventEmitter();

  @Output() newGame = new EventEmitter();

  canEdit = false;
  loggedIn$: Observable<boolean> = of(false);

  showLogin = false;
  showPassword = false;

  items = [
    {
      label: 'Club',
      icon: 'pi pi-pencil',
      command: () => {
        this.editClub.emit();
      },
    },
  ];

  userItems = [
    {
      label: 'Change Password',
      icon: 'pi pi-key',
      command: () => {
        this.showPassword = true;
      },
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        this.userService.logout();
      },
    },
  ];

  editClubItems = [
    {
      label: 'Game',
      icon: 'pi pi-plus',
      command: () => {
        this.newGame.emit();
      },
    },
    {
      label: 'BoardGame',
      icon: 'pi pi-plus',
      command: () => {
        this.newBoardGame.emit();
      },
    },
    {
      label: 'Player',
      icon: 'pi pi-plus',
      command: () => {
        this.newPlayer.emit();
      },
    },
    {
      label: 'Club',
      icon: 'pi pi-pencil',
      command: () => {
        this.editClub.emit();
      },
    },
  ];

  editPlayerItems = [
    {
      label: 'Player',
      icon: 'pi pi-pencil',
      command: () => {
        this.editPlayer.emit();
      },
    },
    {
      label: 'Club',
      icon: 'pi pi-pencil',
      command: () => {
        this.editClub.emit();
      },
    },
  ];

  editBoardGameItems = [
    {
      label: 'BoardGame',
      icon: 'pi pi-pencil',
      command: () => {
        this.editBoardGame.emit();
      },
    },
    {
      label: 'Club',
      icon: 'pi pi-pencil',
      command: () => {
        this.editClub.emit();
      },
    },
  ];

  editHomeItems = [
    {
      label: 'Club',
      icon: 'pi pi-plus',
      command: () => {
        this.newClub.emit();
      },
    },
  ];

  subscriptions = new Subscription();

  constructor(
    private router: Router,
    private apiService: ApiService,
    private userService: UserService,
  ) {}

  async ngOnInit() {
    if (this.page === 'home') {
      this.subscriptions.add(
        this.userService.canEdit$.subscribe((canEdit) => {
          this.canEdit = canEdit;
        }),
      );
    } else {
      this.subscriptions.add(
        combineLatest([this.apiService.club$, this.userService.accessIds$]).subscribe(([club, access]) => {
          this.canEdit = access.find((x) => x.id === club?.ClubId ?? '') !== undefined;
        }),
      );
    }

    this.loggedIn$ = this.userService.loggedIn$;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  navigateHome() {
    this.router.navigateByUrl('/home');
  }

  username() {
    return this.userService.username;
  }
}
