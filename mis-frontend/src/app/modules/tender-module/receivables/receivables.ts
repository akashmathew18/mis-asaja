// receivables.ts

import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { TenderService } from '../../../core/services/tender-services';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-receivables',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './receivables.html',
  styleUrl: './receivables.css',
})
export class TenderReceivables implements OnInit {

  /* =====================================================
     DATA
  ====================================================== */

  receivables: any[] = [];

  loading = false;

  /* =====================================================
     FIRM
  ====================================================== */

  firm_code = '';

  /* =====================================================
     CONSTRUCTOR
  ====================================================== */

  constructor(

    private backend: TenderService,

    private auth: AuthService,

    private router: Router,

    private route: ActivatedRoute,

    private cdr: ChangeDetectorRef

  ) { }

  /* =====================================================
     INIT
  ====================================================== */

  ngOnInit(): void {

    this.firm_code =

      this.route.parent
        ?.snapshot.paramMap
        .get('firmCode')

      ||

      localStorage.getItem('firm_code')

      ||

      '';

    this.loadReceivables();

  }

  /* =====================================================
     LOAD
  ====================================================== */

  loadReceivables(): void {

    this.loading = true;

    this.backend.getReceivables({

      firm_code:
        this.firm_code,

      created_by:
        this.auth.getUserid()

    }).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {
          return;
        }

        this.receivables =
          res.data || [];

        this.cdr.markForCheck();

      },

      error: (err: any) => {

        this.loading = false;

        console.error(err);

      }

    });

  }

  /* =====================================================
     OPEN TENDER
  ====================================================== */

  openTender(tenderId: string): void {

    const firmCode =

      this.route.parent
        ?.snapshot.paramMap
        .get('firmCode');

    this.router.navigate([

      `/firms/${firmCode}/tender-module/tender-status`,
      tenderId

    ]);

  }

  /* =====================================================
     FORMAT
  ====================================================== */

  formatAmount(v: any): string {

    return Number(v || 0)
      .toLocaleString('en-IN', {

        minimumFractionDigits: 2,
        maximumFractionDigits: 2

      });

  }

  /* =====================================================
     ROW COLORS
  ====================================================== */

  getRowClass(row: any): string {

    const pending =
      Number(row.balance_amount || 0);

    const status =
      row.final_status || '';

    // CLOSED
    if (status === 'TS-19') {

      return 'row-closed';

    }

    // HIGH PENDING
    if (pending > 100000) {

      return 'row-danger';

    }

    // MEDIUM
    if (pending > 0) {

      return 'row-warning';

    }

    // CLEARED
    return 'row-clear';

  }

}