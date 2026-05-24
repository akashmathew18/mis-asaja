import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class AdminDashboard implements OnInit {

  user: any = null;

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.auth.getUser();
  }

  go(path: string) {
    this.router.navigate([`/admin/${path}`]);
  }

  backToFirms() {
    this.router.navigate(['/landing']);
  }

  logout() {
    this.auth.logout();
  }

}