import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { ApiService } from '../shared/services/api.service';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { LoginComponent } from '../login/login.component';
import { PasswordUpdateComponent } from '../password-update/password-update.component';
import { MenuItem } from 'primeng/api';
import { debounce } from 'lodash-es';

function actionToBtn(data: [string, string, EventEmitter<void>]) {
  return {
    label: data[0],
    icon: 'pi pi-' + data[1],
    command: () => {
      data[2].emit();
    },
  };
}

type Buttons =
  | 'clubEdit'
  | 'clubAdd'
  | 'tagEdit'
  | 'eventEdit'
  | 'playerEdit'
  | 'playerAdd'
  | 'gameAdd'
  | 'boardGameEdit'
  | 'boardGameAdd';

@Component({
  selector: 'app-menu-bar',
  imports: [CommonModule, ButtonModule, SplitButtonModule, MenuModule, LoginComponent, PasswordUpdateComponent],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss',
})
export class MenuBarComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('header', { static: true }) header!: ElementRef;

  private router = inject(Router);
  private apiService = inject(ApiService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  @Input() page: 'home' | 'club' = 'home';

  @Output() editClub = new EventEmitter();
  @Output() newClub = new EventEmitter();

  @Output() editPlayer = new EventEmitter();
  @Output() newPlayer = new EventEmitter();

  @Output() editBoardGame = new EventEmitter();
  @Output() newBoardGame = new EventEmitter();

  @Output() newGame = new EventEmitter();

  @Output() editTags = new EventEmitter();
  @Output() editEvents = new EventEmitter();

  collapseView = false;
  fullViewWidth = 0;
  collapseDebounce = debounce(this.calculateView.bind(this), 50);

  canEdit = false;
  loggedIn$: Observable<boolean> = of(false);

  showLogin = false;
  showPassword = false;

  actions: Record<Buttons, MenuItem> = {
    clubEdit: actionToBtn(['Club', 'pencil', this.editClub]),
    clubAdd: actionToBtn(['Club', 'plus', this.newClub]),
    tagEdit: actionToBtn(['Tags', 'th-large', this.editTags]),
    eventEdit: actionToBtn(['Events', 'calendar-plus', this.editEvents]),
    playerEdit: actionToBtn(['Player', 'pencil', this.editPlayer]),
    playerAdd: actionToBtn(['Player', 'plus', this.newPlayer]),
    gameAdd: actionToBtn(['Play', 'plus', this.newGame]),
    boardGameEdit: actionToBtn(['BoardGame', 'pencil', this.editBoardGame]),
    boardGameAdd: actionToBtn(['BoardGame', 'plus', this.newBoardGame]),
  };

  items = [this.actions.clubEdit, this.actions.tagEdit, this.actions.eventEdit];

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
    
    this.actions.gameAdd,
    this.actions.boardGameAdd,
    this.actions.playerAdd,
    this.actions.clubEdit,
    this.actions.tagEdit,
    this.actions.eventEdit,
  ];

  editItems = [this.actions.clubEdit, this.actions.tagEdit, this.actions.eventEdit];
  addItems = [this.actions.gameAdd, this.actions.boardGameAdd, this.actions.playerAdd];

  editHomeItems = [this.actions['clubAdd']];

  subscriptions = new Subscription();
  observer = new ResizeObserver(() => {});

  ngOnInit() {
    if (this.page === 'home') {
      this.subscriptions.add(
        this.userService.canEdit$.subscribe((canEdit) => {
          this.canEdit = canEdit;
        }),
      );
    } else {
      this.subscriptions.add(
        combineLatest([this.apiService.club$, this.userService.accessIds$]).subscribe(([club, access]) => {
          this.canEdit = access.some((x) => x.ClubId === club?.ClubId);
        }),
      );
    }

    this.loggedIn$ = this.userService.loggedIn$;
  }

  ngAfterViewInit(): void {
    this.observer = new ResizeObserver(() => {
      this.collapseDebounce();
    });
    this.observer.observe(this.header.nativeElement);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.observer.disconnect();
  }

  navigateHome() {
    this.router.navigateByUrl('/home');
  }

  username() {
    return this.userService.username;
  }

  calculateView() {
    const width = this.header.nativeElement.clientWidth;
    const scrollWidth = this.header.nativeElement.scrollWidth;
    if (width < scrollWidth) {
      this.collapseView = true;
      this.fullViewWidth = width;
    } else if (width < this.fullViewWidth) {
      if (this.collapseView || width < scrollWidth) {
        this.collapseView = true;
      } else {
        // Leave as is
      }
      this.fullViewWidth = width;
    } else if (width > this.fullViewWidth) {
      this.collapseView = false;
      this.fullViewWidth = width;
      setTimeout(() => this.calculateView(), 0);
    } else {
      // Keep
    }
    this.cdr.detectChanges();
  }
}
