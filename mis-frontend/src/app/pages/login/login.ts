import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  username = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(private auth: AuthService) { }

  login() {

    this.errorMessage = '';

    if (!this.username || !this.password) {

      this.errorMessage =
        'Enter username and password';

      return;

    }

    this.loading = true;

    this.auth.login(
      this.username.trim(),
      this.password.trim()
    ).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {

          this.errorMessage = res.message;

        }

      },

      error: () => {

        this.loading = false;

        this.errorMessage = 'Server error';

      }

    });

  }

}