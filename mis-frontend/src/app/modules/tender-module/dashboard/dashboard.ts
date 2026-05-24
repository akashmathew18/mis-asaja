import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { TenderService } from '../../../core/services/tender-services';

@Component({
  selector: 'app-tender-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class TenderDashboard implements OnInit {

  firmCode = '';

  firmName = 'Tender Module';

  totals: any = {

    total_tenders: 0,

    online: 0,

    offline: 0,

    confirmed_tenders: 0,

    rejected_tenders: 0,

    active_tenders: 0,

    closed_tenders: 0,

    waiting: 0,

    total_expense: 0
  };

  constructor(

    private route: ActivatedRoute,
    private router: Router,
    private tenderService: TenderService,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {

    // ===============================
    // GET FIRM CODE FROM PARENT ROUTE
    // ===============================

    this.firmCode =
      this.route.parent
        ?.snapshot
        .paramMap
        .get('firmCode') || '';

    console.log('Firm Code:', this.firmCode);

    if (this.firmCode) {

      this.loadDashboard();
    }
  }

  // =========================================
  // LOAD DASHBOARD
  // =========================================

  loadDashboard(): void {

    this.tenderService
      .getDashboardTotals({
        firm_code: this.firmCode
      })
      .subscribe({
        next: (res: any) => {
          console.log(res);
          if (res.success) {
            this.totals = res;
            this.firmName = res.firm_name || 'Tender Module';
            this.cdr.markForCheck();
          }
        },

        error: (err) => {

          console.error(err);
        }

      });
  }

  // =========================================
  // ROUTING
  // =========================================

  goTo(path: string): void {
    this.router.navigate([
      '/firms',
      this.firmCode,
      'tender-module',
      path
    ]);
  }

}