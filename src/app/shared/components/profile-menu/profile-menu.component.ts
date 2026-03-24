import {
  Component,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../../core';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-profile-menu',
  imports: [RouterLink, TranslatePipe, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isOpen = signal(false);

  logout(): void {
    this.authService.logout();
    this.isOpen.set(false);
    this.router.navigate(['/']);
  }

  menuOpened(): void {
    this.isOpen.set(true);
  }

  menuClosed(): void {
    this.isOpen.set(false);
  }
}
