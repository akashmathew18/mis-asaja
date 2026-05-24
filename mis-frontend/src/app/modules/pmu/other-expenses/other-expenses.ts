import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-pmu-other-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './other-expenses.html',
  styleUrl: './other-expenses.css'
})
export class PmuOtherExpense implements OnInit {

  firmCode!: string;

  form: any = this.defaultForm();
  list: any[] = [];

  expenseTitles: any[] = [];

  saving = false;
  successMsg = false;

  editMode = false;
  editId: number | null = null;
  lastAction: 'create' | 'update' = 'create';

  filteredList: any[] = [];
  search = '';
  selectedExpenseTitle = '';
  singleDate = '';
  dateFrom = '';
  dateTo = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalRecords = 0;
  grandTotal = 0;
  footerTotals: any = {
    grand_total: 0
  };

  expenseSearchText = '';

  constructor(
    private route: ActivatedRoute,
    private backend: Pmu,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }



  ngOnInit(): void {
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;
    this.loadExpenseTitles();
    this.loadList();
  }

  loadExpenseTitles() {
    this.backend.getExpenseTitleList(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.expenseTitles = res.data;
      }
    });
  }


  defaultForm() {

    return {
      expense_date: '',
      expense_title_code: '',
      expense_title: '',
      amount: null,
      remarks: ''
    };
  }

  save(formRef: NgForm) {
    if (formRef.invalid || this.saving) return;

    this.saving = true;
    this.successMsg = false;

    const payload = {
      firm_code: this.firmCode,
      created_by: this.auth.getUserid(),
      expense_date: this.form.expense_date,
      expense_title_code: this.form.expense_title_code,
      expense_title: this.form.expense_title,
      amount: this.form.amount,
      remarks: this.form.remarks
    };

    if (this.editMode && this.editId) {
      this.lastAction = 'update';
      this.backend.updatePmuOtherExpense({
        id: this.editId,
        ...payload
      }).subscribe(() => this.afterSuccess(formRef));
    } else {
      this.lastAction = 'create';
      this.backend.addPmuOtherExpense(payload)
        .subscribe(() => this.afterSuccess(formRef));
    }
  }

  afterSuccess(formRef: NgForm) {
    this.loadList();
    this.form = this.defaultForm();
    this.expenseSearchText = '';
    formRef.resetForm(this.form);

    this.successMsg = true;
    this.saving = false;
    this.editMode = false;
    this.editId = null;

    setTimeout(() => (this.successMsg = false), 2000);
  }

  loadList() {
    this.backend
      .getPmuOtherExpenseList(this.firmCode)
      .subscribe((res: any) => {
        if (res.success) {
          this.list = res.data || [];
          this.grandTotal =
            this.list.reduce(
              (sum: number, x: any) =>
                sum + Number(x.amount || 0),
              0
            );
          this.applyFilters();
          this.cdr.markForCheck();
        }
      });
  }


  // ================= FILTERS =================

  applyFilters() {

    let data = [...this.list];
    // SEARCH

    if (this.search.trim()) {
      const s =
        this.search.toLowerCase();
      data = data.filter((x: any) =>
        (x.expense_title || '')
          .toLowerCase()
          .includes(s)
        ||

        (x.remarks || '')
          .toLowerCase()
          .includes(s)
      );
    }

    // EXPENSE TITLE FILTER

    if (this.selectedExpenseTitle.trim()) {
      data = data.filter((x: any) =>
        (x.expense_title || '')
          .toLowerCase()
          .includes(
            this.selectedExpenseTitle
              .toLowerCase()
          )
      );
    }

    // SINGLE DATE

    if (this.singleDate) {

      data = data.filter(

        (x: any) =>

          x.expense_date ===
          this.singleDate
      );
    }

    // FROM

    if (this.dateFrom) {

      data = data.filter(

        (x: any) =>

          x.expense_date >=
          this.dateFrom
      );
    }

    // TO

    if (this.dateTo) {

      data = data.filter(

        (x: any) =>

          x.expense_date <=
          this.dateTo
      );
    }

    this.totalRecords = data.length;

    this.totalPages = Math.ceil(

      this.totalRecords /
      this.itemsPerPage
    );

    // FOOTER TOTALS

    this.footerTotals = {

      grand_total:

        data.reduce(

          (a: number, b: any) =>

            a + Number(b.amount || 0),

          0
        )
    };

    // PAGINATION

    const start =

      (this.currentPage - 1)
      * this.itemsPerPage;

    const end =
      start + this.itemsPerPage;
    this.filteredList =
      data.slice(start, end);
  }

  // ================= LIVE FILTER =================

  triggerLiveFilter() {
    this.currentPage = 1;
    this.applyFilters();
  }

  // ================= PAGE =================

  changePage(page: number) {
    if (
      page < 1 ||
      page > this.totalPages
    ) return;
    this.currentPage = page;
    this.applyFilters();
  }

  // ================= RESET FILTER =================

  resetFilters() {
    this.search = '';
    this.selectedExpenseTitle = '';
    this.singleDate = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  editRow(row: any) {

    this.form = {
      expense_date: row.expense_date,
      expense_title_code: row.expense_title_code,
      expense_title: row.expense_title,
      amount: row.amount,
      remarks: row.remarks
    };

    this.expenseSearchText = row.expense_title;
    this.editMode = true;
    this.editId = row.id;
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  deleteRow(id: number) {
    if (!confirm('Delete this expense?')) return;

    this.backend.deletePmuOtherExpense({
      id,
      firm_code: this.firmCode
    }).subscribe(() => this.loadList());
  }



  onExpenseTitleChange(value: string) {
    this.expenseSearchText = value;
    const selected = this.expenseTitles.find(
      (x: any) =>
        x.exp_name === value ||
        x.name === value
    );

    if (selected) {
      this.form.expense_title_code =
        selected.exp_id || selected.list_code;
      this.form.expense_title =
        selected.exp_name || selected.name;

    } else {
      this.form.expense_title_code = '';
      this.form.expense_title = value;
    }
  }



}