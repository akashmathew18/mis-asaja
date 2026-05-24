// expense-ledger.ts

import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import { TenderService } from '../../../core/services/tender-services';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-expense-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './expense-ledger.html',
  styleUrl: './expense-ledger.css',
})
export class TenderExpenseLedger implements OnInit {

  /* =====================================================
     MAIN DATA
  ====================================================== */

  ledger: any[] = [];

  groupedExpenses: any[] = [];

  loading = false;

  /* =====================================================
     DIALOG
  ====================================================== */

  showDialog = false;

  selectedTender: any = null;

  /* =====================================================
     FORM
  ====================================================== */

  expenseForm: any = {

    expense_type: '',

    amount: '',

    expense_date: '',

    remarks: ''

  };

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

    this.loadLedger();

  }

  /* =====================================================
     LOAD
  ====================================================== */

  loadLedger(): void {

    this.loading = true;

    this.backend.getExpenseLedger({

      firm_code: this.firm_code,

      created_by:
        this.auth.getUserid()

    }).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {
          return;
        }

        this.ledger =
          res.data || [];

        this.groupLedger();

        this.cdr.markForCheck();

      },

      error: (err: any) => {

        this.loading = false;

        console.error(err);

      }

    });

  }

  /* =====================================================
     GROUP
  ====================================================== */

  groupLedger(): void {

    const map: any = {};

    this.ledger.forEach((x: any) => {

      if (!map[x.tender_id]) {

        map[x.tender_id] = {

          tender_id:
            x.tender_id,

          project_name:
            x.project_name,

          exec_name:
            x.exec_name,

          expenses: [],

          total: 0

        };

      }

      map[x.tender_id]
        .expenses
        .push(x);

      map[x.tender_id]
        .total +=
        Number(x.amount || 0);

    });

    this.groupedExpenses =
      Object.values(map);

  }

  /* =====================================================
     TOTAL
  ====================================================== */

  getOverallTotal(): number {

    return this.groupedExpenses.reduce(

      (sum: number, t: any) =>

        sum + Number(t.total || 0),

      0

    );

  }

  /* =====================================================
     OPEN
  ====================================================== */

  openAddExpense(tender: any): void {

    this.selectedTender = tender;

    this.expenseForm = {

      expense_type: '',

      amount: '',

      expense_date:
        new Date()
          .toISOString()
          .split('T')[0],

      remarks: ''

    };

    this.showDialog = true;

  }

  /* =====================================================
     CLOSE
  ====================================================== */

  closeDialog(): void {

    this.showDialog = false;

    this.selectedTender = null;

  }

  /* =====================================================
     SAVE
  ====================================================== */

  saveExpense(): void {

    if (

      !this.expenseForm.expense_type ||

      !this.expenseForm.amount ||

      !this.expenseForm.expense_date

    ) {

      alert('Fill all required fields');

      return;

    }

    const payload = {

      tender_id:
        this.selectedTender.tender_id,

      firm_code:
        this.firm_code,

      expense_type:
        this.expenseForm.expense_type,

      amount:
        this.expenseForm.amount,

      expense_date:
        this.expenseForm.expense_date,

      remarks:
        this.expenseForm.remarks,

      created_by:
        this.auth.getUserid()

    };

    this.backend
      .addTenderExpense(payload)
      .subscribe({

        next: (res: any) => {

          if (!res.success) {

            alert(
              res.message ||
              'Save failed'
            );

            return;

          }

          alert('Expense added');

          this.closeDialog();

          this.loadLedger();

        },

        error: (err: any) => {

          console.error(err);

          alert('Server error');

        }

      });

  }

}