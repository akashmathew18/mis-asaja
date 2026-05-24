import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-labour',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labour.html',
  styleUrl: './labour.css'
})
export class PmuLabour implements OnInit {

  firmCode!: string;

  basisOptions = ['COT', 'Daily'];
  paidOptions = ['Yes', 'No'];

  form: any = {
    work_date: '',
    team_id: '',
    team_name: '',
    basis: 'COT',

    cot_count: null,
    rate_per_cot: null,

    labour_count: null,
    rate_per_labour: null,

    // paid: 'No',
    remarks: ''
  };

  totalAmount = 0;
  list: any[] = [];

  filteredList: any[] = [];

  search = '';

  singleDate = '';
  dateFrom = '';
  dateTo = '';

  currentPage = 1;
  itemsPerPage = 10;

  totalPages = 1;
  totalRecords = 0;

  grandTotal = 0;

  footerTotals: any = {
    total_cot: 0,
    total_labour: 0,
    grand_total: 0
  };

  teams: any[] = [];
  teamSearchText = '';
  selectedTeamText = '';

  isEditingPrefill = false;


  saving = false;
  successMsg = false;

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
    // ✅ firmCode lives on PARENT route
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;

    if (!this.firmCode) {
      console.error('❌ firmCode missing in wood-expense');
      return;
    }
    this.loadTeams();
    this.loadList();
  }

  loadTeams() {
    this.backend.getPmuTeams(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.teams = res.data;
        this.cdr.markForCheck();
      }
    });
  }



  // ---------------- TEAM SEARCH ----------------

  onTeamSearchChange(value: string) {

    this.teamSearchText = value;

    const selected = this.teams.find(
      (t: any) => t.team_name === value
    );

    if (selected) {

      this.form.team_id = selected.team_id;
      this.form.team_name = selected.team_name;

    } else {

      this.form.team_id = '';
      this.form.team_name = value;
    }
  }

  // ---------------- FILTER TEAM ----------------

  onFilterTeamChange(value: string) {

    this.selectedTeamText = value;

    this.triggerLiveFilter();
  }





  /* ---------------- BASIS CHANGE ---------------- */
  onBasisChange() {

    if (this.form.basis === 'COT') {

      this.form.labour_count = null;
      this.form.rate_per_labour = null;
    }

    if (this.form.basis === 'Daily') {

      this.form.rate_per_cot = null;
    }

    this.totalAmount = 0;
  }


  // -------- TOTAL CALC --------
  calculateTotal() {
    // COT BASIS
    if (this.form.basis === 'COT') {
      const cot = Number(this.form.cot_count) || 0;
      const rate = Number(this.form.rate_per_cot) || 0;
      this.totalAmount = cot * rate;
    }

    // DAILY BASIS
    if (this.form.basis === 'Daily') {
      const labour = Number(this.form.labour_count) || 0;
      const rate = Number(this.form.rate_per_labour) || 0;
      this.totalAmount = labour * rate;
    }
    this.totalAmount = Number(this.totalAmount.toFixed(2));
  }

  // -------- SAVE --------
  save(formRef: NgForm) {

    if (formRef.invalid || this.saving) return;

    this.saving = true;
    this.successMsg = false;

    const payload = {
      firm_code: this.firmCode,
      created_by: this.auth.getUserid
        (),
      work_date: this.form.work_date,
      team_id: this.form.team_id,
      team_name: this.form.team_name,
      basis: this.form.basis,

      cot_count: this.form.basis === 'COT' ? this.form.cot_count : null,
      rate_per_cot: this.form.basis === 'COT' ? this.form.rate_per_cot : null,

      labour_count: this.form.basis === 'Daily' ? this.form.labour_count : null,
      rate_per_labour: this.form.basis === 'Daily' ? this.form.rate_per_labour : null,

      total_amount: this.totalAmount,
      paid: this.form.paid,
      remarks: this.form.remarks
    };

    // ---------- UPDATE ----------
    if (this.editMode && this.editId) {

      this.lastAction = 'update';

      this.backend.updatePmuLabour({
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
    else {

      this.lastAction = 'create';

      this.backend.addPmuLabour(payload).subscribe({
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


  afterSuccess(formRef: NgForm) {

    this.loadList();
    this.resetForm();
    formRef.resetForm();

    this.successMsg = true;

    setTimeout(() => {
      this.successMsg = false;
      this.editMode = false;
      this.editId = null;
      this.lastAction = 'create';
    }, 2000);
    this.saving = false;
  }

  // -------- LIST --------
  loadList() {

    this.backend.getPmuLabourList(this.firmCode).subscribe((res: any) => {

      if (res.success) {

        this.list = res.data || [];

        this.grandTotal = this.list.reduce(
          (sum: number, x: any) =>
            sum + Number(x.total_amount || 0),
          0
        );

        this.applyFilters();

        this.cdr.markForCheck();
      }
    });
  }


  // ---------------- FILTERS ----------------

  applyFilters() {

    let data = [...this.list];

    // SEARCH
    if (this.search.trim()) {

      const s = this.search.toLowerCase();

      data = data.filter((x: any) =>

        (x.team_name || '').toLowerCase().includes(s) ||

        (x.remarks || '').toLowerCase().includes(s) ||

        (x.basis || '').toLowerCase().includes(s)
      );
    }

    // TEAM FILTER
    if (this.selectedTeamText.trim()) {

      data = data.filter((x: any) =>

        (x.team_name || '')
          .toLowerCase()
          .includes(this.selectedTeamText.toLowerCase())
      );
    }

    // SINGLE DATE
    if (this.singleDate) {

      data = data.filter(
        (x: any) => x.work_date === this.singleDate
      );
    }

    // FROM
    if (this.dateFrom) {

      data = data.filter(
        (x: any) => x.work_date >= this.dateFrom
      );
    }

    // TO
    if (this.dateTo) {

      data = data.filter(
        (x: any) => x.work_date <= this.dateTo
      );
    }

    this.totalRecords = data.length;

    this.totalPages = Math.ceil(
      this.totalRecords / this.itemsPerPage
    );

    // FOOTER
    this.footerTotals = {

      total_cot: data.reduce(
        (a: number, b: any) =>
          a + Number(b.cot_count || 0),
        0
      ),

      total_labour: data.reduce(
        (a: number, b: any) =>
          a + Number(b.labour_count || 0),
        0
      ),

      grand_total: data.reduce(
        (a: number, b: any) =>
          a + Number(b.total_amount || 0),
        0
      )
    };

    // PAGINATION
    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    const end = start + this.itemsPerPage;

    this.filteredList = data.slice(start, end);
  }

  // LIVE
  triggerLiveFilter() {

    this.currentPage = 1;

    this.applyFilters();
  }

  // PAGE
  changePage(page: number) {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    this.applyFilters();
  }

  // RESET
  resetFilters() {

    this.search = '';

    this.selectedTeamText = '';

    this.singleDate = '';
    this.dateFrom = '';
    this.dateTo = '';

    this.currentPage = 1;

    this.applyFilters();
  }

  // -------- RESET --------
  resetForm() {
    this.form = {
      work_date: '',
      team_id: '',
      team_name: '',
      basis: 'COT',
      cot_count: null,
      rate_per_cot: null,
      labour_count: null,
      rate_per_labour: null,
      paid: 'No',
      remarks: ''
    };

    this.totalAmount = 0;
    this.editMode = false;
    this.editId = null;
    this.lastAction = 'create';
  }


  editRow(row: any) {
    this.isEditingPrefill = true; // ✅ IMPORTANT

    this.form = {
      work_date: row.work_date,
      team_id: row.team_id,
      team_name: row.team_name,
      basis: row.basis,
      cot_count: row.cot_count,
      rate_per_cot: row.rate_per_cot,
      labour_count: row.labour_count,
      rate_per_labour: row.rate_per_labour,
      paid: row.paid,
      remarks: row.remarks
    };

    this.totalAmount = row.total_amount;
    this.editMode = true;
    this.editId = row.id;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  // ---------------- DELETE ----------------
  deleteRow(id: number) {
    if (!confirm('Delete this record?')) return;

    this.backend.deletePmuLabour({
      id: id,
      firm_code: this.firmCode
    }).subscribe(() => this.loadList());
  }
}