import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BackendconnectionService } from '../../core/services/backendconnection';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})


export class LandingComponent implements OnInit {

  role = '';
  firms: any[] = [];
  loading = true;
  fullName = '';

  constructor(
    public auth: AuthService,
    private backend: BackendconnectionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.role = this.auth.getRole();
    this.fullName = this.auth.getFullName();
    this.loadFirms();

  }

  // =========================================
  // LOAD FIRMS
  // =========================================
  loadFirms() {

    this.loading = true;
    this.backend.getFirmsByUser({
      userid: this.auth.getUserid(),
      company_id: this.auth.getCompanyId()
    }).subscribe({

      next: (res: any) => {
        if (res.success) {
          this.firms = res.data;
        } else {
          alert('Failed to load firms');
        }

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: () => {
        this.loading = false;
        alert('Server error');
      }
    });
  }

  // =========================================
  // OPEN FIRM
  // =========================================
  openFirm(firm: any) {
    if (!firm?.firm_code || !firm?.module) {
      alert('Invalid firm configuration');
      return;
    }
    this.router.navigate([
      `/firms/${firm.firm_code}/${firm.module}/dashboard`
    ]);
  }

  goAdmin() {
    this.router.navigate(['/admin']);
  }

  // =========================================
  // LOGOUT
  // =========================================
  logout() {
    this.auth.logout();
  }

}