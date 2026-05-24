import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { BackendconnectionService } from './backendconnection';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isBrowser: boolean;

  constructor(
    private router: Router,
    private backend: BackendconnectionService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {

    this.isBrowser = isPlatformBrowser(platformId);

  }

  // =========================================
  // LOGIN
  // =========================================
  login(username: string, password: string) {

    return this.backend.login({
      username,
      password
    }).pipe(

      tap((res: any) => {

        if (!res.success) return;

        if (this.isBrowser) {

          localStorage.setItem('loggedIn', 'true');

          localStorage.setItem(
            'user',
            JSON.stringify(res.user)
          );

        }

        this.router.navigate(['/landing']);

      })

    );

  }

  // =========================================
  // LOGOUT
  // =========================================
  logout() {

    if (this.isBrowser) {
      localStorage.clear();
    }

    this.router.navigate(['/login']);

  }

  // =========================================
  // USER
  // =========================================
  getUser() {

    if (!this.isBrowser) return null;

    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;

  }

  getRole(): string {

    return this.getUser()?.role || '';

  }

  getUserid(): string {

    return this.getUser()?.userid || '';

  }

  getCompanyId(): string {

    return this.getUser()?.company_id || '';

  }


  getFirmCode(): string {
    return this.getUser()?.firm_code || '';
  }

  getFullName(): string {

    return this.getUser()?.full_name || '';

  }

  isLoggedIn(): boolean {

    if (!this.isBrowser) return false;

    return localStorage.getItem('loggedIn') === 'true';

  }

}