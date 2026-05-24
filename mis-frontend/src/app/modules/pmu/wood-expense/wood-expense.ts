import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-pmu-wood-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wood-expense.html',
  styleUrl: './wood-expense.css'
})
export class PmuWood implements OnInit {

  firmCode!: string;

  form: any = {
    expense_date: '',
    wood_type: '',
    cubic: null,
    rate_per_cubic: null,
    cutting_expense: null,
    planing_expense: null,
    transportation_expense: null,
    team_id: '',
    remarks: ''
  };

  totalExpense = 0;

  list: any[] = [];
  teams: any[] = [];

  /* ---------- PAGINATION ---------- */
  currentPage = 1;
  limit = 10;
  totalRecords = 0;
  totalPages = 0;

  grandTotal = 0;

  footerTotals: any = {
    total_cubic: 0,
    total_cutting: 0,
    total_planing: 0,
    total_transport: 0,
    grand_total: 0
  };

  /* ---------- SEARCH / FILTER ---------- */
  search = '';

  selectedTeam = '';
  selectedTeamText = '';

  teamSearchText = '';

  dateFrom = '';
  dateTo = '';
  singleDate = '';

  private searchSubject = new Subject<void>();

  saving = false;
  successMsg = false;
  teamInvalid = false;

  editMode = false;
  editId: number | null = null;
  lastAction: 'create' | 'update' = 'create';

  constructor(
    private route: ActivatedRoute,
    private backend: Pmu,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  // ---------------- INIT ----------------
  ngOnInit(): void {
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;

    if (!this.firmCode) {
      console.error('❌ firmCode missing in wood-expense');
      return;
    }

    this.loadTeams();
    this.loadList();

    /* ---------- LIVE FILTER ---------- */

    this.searchSubject
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadList(1);
      });
  }


  loadTeams() {
    this.backend.getPmuTeams(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.teams = res.data;
        this.cdr.markForCheck();
      }
    });
  }


  // ---------------- TEAM SEARCH (FORM) ----------------
  onTeamSearchChange(value: string) {

    this.teamSearchText = value;

    const selected = this.teams.find(
      (t: any) =>
        t.team_name.trim().toLowerCase()
        === value.trim().toLowerCase()
    );

    if (selected) {

      this.form.team_id = selected.team_id;

      this.teamInvalid = false;

    } else {

      this.form.team_id = '';

      this.teamInvalid = true;
    }
  }


  // ---------------- TEAM SEARCH (FILTER) ----------------
  onFilterTeamChange(value: string) {

    this.selectedTeamText = value;

    const searchText = value.trim().toLowerCase();

    // EMPTY = RESET
    if (!searchText) {

      this.selectedTeam = '';

      this.triggerLiveFilter();

      return;
    }

    // EXACT MATCH ONLY
    const selected = this.teams.find(
      (t: any) =>
        t.team_name.trim().toLowerCase() === searchText
    );

    // VALID TEAM
    if (selected) {

      this.selectedTeam = String(selected.team_id);

    } else {

      this.selectedTeam = '';
    }

    this.triggerLiveFilter();
  }


  // ---------------- TOTAL CALCULATION ----------------
  calculateTotal() {
    const cubic = Number(this.form.cubic) || 0;
    const rate = Number(this.form.rate_per_cubic) || 0;
    const cut = Number(this.form.cutting_expense) || 0;
    const plan = Number(this.form.planing_expense) || 0;
    const trans = Number(this.form.transportation_expense) || 0;

    this.totalExpense = (cubic * rate) + cut + plan + trans;
    this.totalExpense = parseFloat(this.totalExpense.toFixed(2));
  }

  // ---------------- SAVE / UPDATE ----------------
  save(formRef: NgForm) {
    if (formRef.invalid || this.saving) return;

    /* ---------- TEAM VALIDATION ---------- */

    if (!this.form.team_id) {

      alert('Please select a valid team from the list');

      return;
    }

    this.saving = true;
    this.successMsg = false;


    const payload = {
      firm_code: this.firmCode,
      created_by: this.auth.getUser().userid,
      total_expense: this.totalExpense,
      ...this.form
    };

    // ---------- UPDATE ----------
    if (this.editMode && this.editId) {

      this.lastAction = 'update';

      this.backend.updatePmuWood({
        id: this.editId,
        ...payload
      }).subscribe({
        next: (res: any) => {
          if (!res.success) {
            alert(res.message || 'Update failed');
            this.saving = false;
            return;
          }
          this.afterSuccess(formRef);
        },
        error: () => {
          alert('Server error');
          this.saving = false;
        }
      });

    }
    // ---------- ADD ----------
    else {

      this.lastAction = 'create';

      this.backend.addPmuWood(payload).subscribe({
        next: (res: any) => {
          if (!res.success) {
            alert(res.message || 'Save failed');
            this.saving = false;
            return;
          }
          this.afterSuccess(formRef);
        },
        error: () => {
          alert('Server error');
          this.saving = false;
        }
      });

    }
  }

  // ---------------- AFTER SUCCESS ----------------
  afterSuccess(formRef: NgForm) {

    this.loadList(this.currentPage);
    this.resetForm();
    formRef.resetForm();

    this.successMsg = true;

    setTimeout(() => {
      this.successMsg = false;
      this.editMode = false;
      this.editId = null;
    }, 2000);

    this.saving = false;
  }

  // ---------------- LOAD LIST ----------------
  loadList(page: number = 1) {

    this.currentPage = page;

    const payload = {
      firm_code: this.firmCode,
      page: this.currentPage,
      limit: this.limit,

      search: this.search,
      team_id: this.selectedTeam,

      single_date: this.singleDate,
      date_from: this.dateFrom,
      date_to: this.dateTo
    };

    this.backend.getPmuWoodList(payload).subscribe((res: any) => {

      if (res.success) {

        this.list = res.data;
        this.totalRecords = res.totalRecords || 0;

        this.totalPages = Math.ceil(this.totalRecords / this.limit);

        /* ---------- TOTALS ---------- */

        this.footerTotals = res.totals || {};

        this.grandTotal = Number(
          this.footerTotals.grand_total || 0
        );

        this.cdr.markForCheck();
      }

    });

  }


  applyFilters() {
    this.currentPage = 1;
    this.loadList(1);
  }

  /* ---------- LIVE FILTER ---------- */

  triggerLiveFilter() {

    /* ---------- SINGLE DATE PRIORITY ---------- */

    if (this.singleDate) {
      this.dateFrom = '';
      this.dateTo = '';
    }

    /* ---------- RANGE DATE PRIORITY ---------- */

    if (this.dateFrom || this.dateTo) {
      this.singleDate = '';
    }

    this.searchSubject.next();
  }


  resetFilters() {

    this.search = '';
    this.selectedTeam = '';
    this.selectedTeamText = '';

    this.singleDate = '';
    this.dateFrom = '';
    this.dateTo = '';

    this.currentPage = 1;

    this.loadList(1);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadList(page);
  }

  // ---------------- RESET ----------------
  resetForm() {

    this.form = {
      expense_date: '',
      wood_type: '',
      cubic: null,
      rate_per_cubic: null,
      cutting_expense: null,
      planing_expense: null,
      transportation_expense: null,
      team_id: '',
      remarks: ''
    };

    this.teamSearchText = '';
    this.teamInvalid = false;

    this.totalExpense = 0;
  }

  // ---------------- EDIT ----------------
  editRow(row: any) {
    this.form = {
      expense_date: row.expense_date,
      wood_type: row.wood_type,
      cubic: row.cubic,
      rate_per_cubic: row.rate_per_cubic,
      cutting_expense: row.cutting_expense,
      planing_expense: row.planing_expense,
      transportation_expense: row.transportation_expense,
      team_id: row.team_id,
      remarks: row.remarks
    };
    this.teamSearchText = row.team_name;


    this.totalExpense = row.total_expense;
    this.editMode = true;
    this.editId = row.id;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------- DELETE ----------------
  deleteRow(id: number) {
    if (!confirm('Delete this record?')) return;

    this.backend.deletePmuWood({
      id: id,
      firm_code: this.firmCode
    }).subscribe(() => this.loadList());
  }

}