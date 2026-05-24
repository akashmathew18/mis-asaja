import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-pmu-team-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css']
})
export class PmuPayments implements OnInit {

  firmCode!: string;

  entryTypes = ['PAYMENT'];

  form: any = {
    entry_date: '',
    team_id: '',
    team_name: '',
    entry_type: 'PAYMENT',
    amount: null,
    remarks: ''
  };

  list: any[] = [];
  filteredList: any[] = [];

  teams: any[] = [];

  teamSearchText = '';
  selectedTeamText = '';

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
    grand_total: 0
  };

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

    this.firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode')!;

    if (!this.firmCode) {
      console.error('❌ firmCode missing in payments');
      return;
    }

    this.loadTeams();
    this.loadList();
  }

  // ---------------- LOAD TEAMS ----------------

  loadTeams() {

    this.backend.getPmuTeams(this.firmCode)
      .subscribe((res: any) => {

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

  // ---------------- SAVE ----------------

  save(formRef: NgForm) {

    if (formRef.invalid || this.saving) return;

    this.saving = true;

    this.successMsg = false;

    const payload = {

      firm_code: this.firmCode,

      created_by: this.auth.getUserid(),

      entry_date: this.form.entry_date,

      team_id: this.form.team_id,

      team_name: this.form.team_name,

      entry_type: this.form.entry_type,

      amount: this.form.amount,

      remarks: this.form.remarks
    };

    // UPDATE
    if (this.editMode && this.editId) {

      this.lastAction = 'update';

      this.backend.updatePmuTeamLedger({
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

    } else {

      // CREATE
      this.lastAction = 'create';

      this.backend.addPmuTeamLedger(payload)
        .subscribe({

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

  // ---------------- LOAD LIST ----------------

  loadList() {

    this.backend.getPmuTeamLedgerList(this.firmCode)
      .subscribe((res: any) => {

        if (res.success) {

          this.list = res.data || [];

          this.grandTotal = this.list.reduce(
            (sum: number, x: any) =>
              sum + Number(x.amount || 0),
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

        (x.entry_type || '').toLowerCase().includes(s) ||

        (x.remarks || '').toLowerCase().includes(s)
      );
    }

    // TEAM
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
        (x: any) => x.entry_date === this.singleDate
      );
    }

    // FROM
    if (this.dateFrom) {

      data = data.filter(
        (x: any) => x.entry_date >= this.dateFrom
      );
    }

    // TO
    if (this.dateTo) {

      data = data.filter(
        (x: any) => x.entry_date <= this.dateTo
      );
    }

    this.totalRecords = data.length;

    this.totalPages = Math.ceil(
      this.totalRecords / this.itemsPerPage
    );

    // FOOTER TOTAL
    this.footerTotals = {

      grand_total: data.reduce(
        (a: number, b: any) =>
          a + Number(b.amount || 0),
        0
      )
    };

    // PAGINATION
    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    const end = start + this.itemsPerPage;

    this.filteredList = data.slice(start, end);
  }

  // ---------------- LIVE FILTER ----------------

  triggerLiveFilter() {

    this.currentPage = 1;

    this.applyFilters();
  }

  // ---------------- PAGE ----------------

  changePage(page: number) {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    this.applyFilters();
  }

  // ---------------- RESET FILTERS ----------------

  resetFilters() {

    this.search = '';

    this.selectedTeamText = '';

    this.singleDate = '';

    this.dateFrom = '';

    this.dateTo = '';

    this.currentPage = 1;

    this.applyFilters();
  }

  // ---------------- RESET FORM ----------------

  resetForm() {

    this.form = {

      entry_date: '',

      team_id: '',

      team_name: '',

      entry_type: 'PAYMENT',

      amount: null,

      remarks: ''
    };

    this.teamSearchText = '';

    this.editMode = false;

    this.editId = null;

    this.lastAction = 'create';
  }

  // ---------------- EDIT ----------------

  editRow(row: any) {

    this.form = {

      entry_date: row.entry_date,

      team_id: row.team_id,

      team_name: row.team_name,

      entry_type: row.entry_type,

      amount: row.amount,

      remarks: row.remarks
    };

    this.teamSearchText = row.team_name;

    this.editMode = true;

    this.editId = row.id;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ---------------- DELETE ----------------

  deleteRow(id: number) {

    if (!confirm('Delete this record?')) return;

    this.backend.deletePmuTeamLedger({

      id: id,

      firm_code: this.firmCode

    }).subscribe(() => this.loadList());
  }
}