import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BackendconnectionService } from '../../core/services/backendconnection';

@Component({
  selector: 'app-firm-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './firm-layout.html',
  styleUrl: './firm-layout.css'
})
export class FirmLayoutComponent implements OnInit {

  firmCode!: string;
  module!: string;
  firmName: string = '';
  firmDetails: any = null;

  // Toggle state for navbar visibility
  isNavbarVisible: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private backend: BackendconnectionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.firmCode = params.get('firmCode')!;
      const segments = this.router.url.split('/');
      this.module = segments[3];
      this.loadFirmDetails();
    });
  }

  loadFirmDetails() {
    const userid = this.auth.getUserid();
    this.backend.getFirmByCode({
      firm_code: this.firmCode,
      userid: userid
    })
      .subscribe((res: any) => {
        if (!res.success) {
          alert('Access denied');
          this.router.navigate(['/landing']);
          return;
        }
        this.firmName = res.data.firm_name;
        if (res.data.module !== this.module) {
          this.router.navigate(['/landing']);
          return;
        }
      });
  }

  // Toggle navbar visibility
  toggleNavbar(): void {
    this.isNavbarVisible = !this.isNavbarVisible;
  }

  goDashboard() {
    this.router.navigate([`/firms/${this.firmCode}/${this.module}/dashboard`]);
  }

  goReports() {
    if (this.module === 'pmu') {
      this.router.navigate([`/firms/${this.firmCode}/pmu/reports`]);
    }
  }

  backToFirms() {
    this.router.navigate(['/landing']);
  }

  logout() {
    this.auth.logout();
  }
}