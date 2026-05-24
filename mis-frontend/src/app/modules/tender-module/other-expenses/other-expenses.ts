import {
  Component,
  OnInit,
  HostListener,
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
  selector: 'app-other-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './other-expenses.html',
  styleUrl: './other-expenses.css',
})
export class TenderOtherExpenses implements OnInit {

  /* =====================================================
     ROUTING
  ===================================================== */

  firm_code: string = '';

  /* =====================================================
     EXPENSE TITLES
     NO FIRM MAPPING REQUIRED
  ===================================================== */

  expenseTitles: any[] = [];

  filteredExpenseTitles: any[] = [];

  showExpenseDropdown = false;

  expenseSearch = '';

  /* =====================================================
     TABLE
  ===================================================== */

  expenses: any[] = [];

  loading = false;

  /* =====================================================
     FORM
  ===================================================== */

  form: any = {

    id: '',

    expense_date: '',

    expense_title_code: '',

    amount: '',

    remarks: ''

  };

  isEdit = false;

  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor(

    private tenderService: TenderService,

    private auth: AuthService,

    private route: ActivatedRoute,

    private cdr: ChangeDetectorRef

  ) { }

  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    this.loadFirmCode();

    this.loadExpenseTitles();

    this.loadExpenses();

  }

  /* =====================================================
     FIRM CODE
  ===================================================== */

  loadFirmCode(): void {

    this.firm_code =

      this.route.parent
        ?.snapshot.paramMap
        .get('firmCode')

      ||

      localStorage.getItem('firm_code')

      ||

      '';

  }

  /* =====================================================
     LOAD EXPENSE TITLES
     KEEP GLOBAL / NO FIRM FILTER
  ===================================================== */

  loadExpenseTitles(): void {

    this.tenderService
      .getExpenseTitleList(this.firm_code)
      .subscribe({

        next: (res: any) => {

          if (!res.success) {
            return;
          }

          this.expenseTitles =
            res.data || [];

          this.filteredExpenseTitles =
            [...this.expenseTitles];

          this.cdr.markForCheck();

        },

        error: (err: any) => {

          console.error(err);

        }

      });

  }

  /* =====================================================
     FILTER EXPENSE TITLES
  ===================================================== */

  filterExpenseTitles(): void {

    const search =
      (this.expenseSearch || '')
        .toLowerCase()
        .trim();

    this.filteredExpenseTitles =
      this.expenseTitles.filter((x: any) =>

        (x.exp_name || '')
          .toLowerCase()
          .includes(search)

      );

    this.showExpenseDropdown = true;

  }

  /* =====================================================
     SELECT TITLE
  ===================================================== */

  selectExpenseTitle(item: any): void {

    this.form.expense_title_code =
      item.exp_id;

    this.expenseSearch =
      item.exp_name;

    this.showExpenseDropdown = false;

  }

  /* =====================================================
     CLOSE DROPDOWN
  ===================================================== */

  @HostListener('document:click')
  closeDropdown(): void {

    this.showExpenseDropdown = false;

  }

  preventClose(event: Event): void {

    event.stopPropagation();

  }

  /* =====================================================
     LOAD EXPENSES
     FIRM MAPPED
  ===================================================== */

  loadExpenses(): void {

    this.loading = true;

    this.tenderService.getOtherExpenses({

      firm_code: this.firm_code,

      created_by:
        this.auth.getUserid()

    }).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {
          return;
        }

        this.expenses =
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
     SAVE
  ===================================================== */

  saveExpense(): void {

    if (

      !this.form.expense_date ||

      !this.form.expense_title_code ||

      !this.form.amount

    ) {

      alert('Fill required fields');

      return;

    }

    const payload = {

      ...this.form,

      firm_code:
        this.firm_code,

      created_by:
        this.auth.getUserid()

    };

    /* =================================================
       UPDATE
    ================================================= */

    if (this.isEdit) {

      this.tenderService
        .updateOtherExpense(payload)
        .subscribe({

          next: (res: any) => {

            if (!res.success) {

              alert(
                res.message ||
                'Update failed'
              );

              return;

            }

            alert('Updated');

            this.resetForm();

            this.loadExpenses();

          },

          error: (err: any) => {

            console.error(err);

            alert('Server error');

          }

        });

    }

    /* =================================================
       ADD
    ================================================= */

    else {

      this.tenderService
        .addOtherExpense(payload)
        .subscribe({

          next: (res: any) => {

            if (!res.success) {

              alert(
                res.message ||
                'Save failed'
              );

              return;

            }

            alert('Saved');

            this.resetForm();

            this.loadExpenses();

          },

          error: (err: any) => {

            console.error(err);

            alert('Server error');

          }

        });

    }

  }

  /* =====================================================
     EDIT
  ===================================================== */

  editExpense(row: any): void {

    this.isEdit = true;

    this.form = {

      id:
        row.id,

      expense_date:
        row.expense_date,

      expense_title_code:
        row.expense_title_code,

      amount:
        row.amount,

      remarks:
        row.remarks

    };

    this.expenseSearch =
      row.expense_title;

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  }

  /* =====================================================
     DELETE
  ===================================================== */

  deleteExpense(row: any): void {

    if (!confirm('Delete this expense?')) {
      return;
    }

    this.tenderService
      .deleteOtherExpense({

        id:
          row.id,

        firm_code:
          this.firm_code,

        created_by:
          this.auth.getUserid()

      })

      .subscribe({

        next: (res: any) => {

          if (!res.success) {

            alert(
              res.message ||
              'Delete failed'
            );

            return;

          }

          alert('Deleted');

          this.loadExpenses();

        },

        error: (err: any) => {

          console.error(err);

          alert('Server error');

        }

      });

  }

  /* =====================================================
     RESET
  ===================================================== */

  resetForm(): void {

    this.isEdit = false;

    this.expenseSearch = '';

    this.showExpenseDropdown = false;

    this.form = {

      id: '',

      expense_date: '',

      expense_title_code: '',

      amount: '',

      remarks: ''

    };

  }

}