// supply-order.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenderService } from '../../../core/services/tender-services';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-supply-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './supply-order.html',
  styleUrl: './supply-order.css'
})
export class TenderSupplyOrder implements OnInit {

  loading = false;

  tenders: any[] = [];
  filteredTenders: any[] = [];

  selectedTender: any = null;

  search = '';

  constructor(
    private backend: TenderService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.loadSupplyOrders();

  }

  /* =========================================================
     LOAD
  ========================================================= */

  loadSupplyOrders(): void {

    this.loading = true;

    const firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode');

    this.backend.getSupplyOrders({

      firm_code: firmCode,

      created_by:
        this.auth.getUserid()

    }).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (res.success) {

          this.tenders =
            res.data || [];

          this.filteredTenders =
            [...this.tenders];

        }

        this.cdr.markForCheck();

      },

      error: (err: any) => {

        console.error(err);

        this.loading = false;

      }

    });

  }

  /* =========================================================
     SEARCH
  ========================================================= */

  filterTenders(): void {

    const s =
      this.search.toLowerCase();

    this.filteredTenders =
      this.tenders.filter((t: any) => {

        return (

          (t.project_name || '')
            .toLowerCase()
            .includes(s)

          ||

          (t.div_name || '')
            .toLowerCase()
            .includes(s)

          ||

          (t.exec_name || '')
            .toLowerCase()
            .includes(s)

          ||

          (t.tender_id || '')
            .toLowerCase()
            .includes(s)

        );

      });

  }

  /* =========================================================
     OPEN DIALOG
  ========================================================= */

  openTender(t: any): void {

    this.selectedTender = t;

  }

  closeDialog(): void {

    this.selectedTender = null;

  }

  /* =========================================================
     WORKFLOW
  ========================================================= */

  openWorkflow(tenderId: string): void {

    const firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode');

    this.router.navigate([

      `/firms/${firmCode}/tender-module/tender-status`,
      tenderId

    ]);

  }

  /* =========================================================
     FORMAT
  ========================================================= */

  formatAmount(v: any): string {

    if (
      v === null ||
      v === undefined ||
      v === ''
    ) {

      return 'N/A';

    }

    return Number(v)
      .toLocaleString('en-IN', {

        minimumFractionDigits: 0,
        maximumFractionDigits: 2

      });

  }

}