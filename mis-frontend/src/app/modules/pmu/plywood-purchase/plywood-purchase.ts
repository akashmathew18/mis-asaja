import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-pmu-plywood-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plywood-purchase.html',
  styleUrl: './plywood-purchase.css'
})
export class PmuPlywood implements OnInit {

  firmCode!: string;

  form: any = {
    purchase_date: '',
    square_feet: null,
    rate_per_sqft: null,
    transportation: 0,
    paid: 'No',
    remarks: ''
  };

  sqftAmount = 0;
  totalExpense = 0;

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
    total_ply: 0,
    total_plywood_amount: 0,
    total_transport: 0,
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
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;

    if (!this.firmCode) {
      console.error('❌ firmCode missing in plywood-purchase');
      return;
    }

    this.loadList();
  }

  // ---------------- TOTAL CALCULATION ----------------
  calculateTotal() {
    const sqft = Number(this.form.square_feet) || 0;
    const rate = Number(this.form.rate_per_sqft) || 0;
    const transport = Number(this.form.transportation) || 0;

    this.sqftAmount = sqft * rate;
    this.totalExpense = this.sqftAmount + transport;
    this.totalExpense = Number(this.totalExpense.toFixed(2));
  }

  // ---------------- SAVE / UPDATE ----------------
  save(formRef: NgForm) {
    if (formRef.invalid || this.saving) return;

    this.saving = true;
    this.successMsg = false;

    const payload = {
      firm_code: this.firmCode,
      purchase_date: this.form.purchase_date,
      square_feet: this.form.square_feet,
      rate_per_sqft: this.form.rate_per_sqft,
      sqft_amount: this.sqftAmount,
      transportation: this.form.transportation,
      paid: this.form.paid,
      total_expense: this.totalExpense,
      created_by: this.auth.getUserid
        (),
      remarks: this.form.remarks
    };

    // ---------- UPDATE ----------
    if (this.editMode && this.editId) {

      this.lastAction = 'update';

      this.backend.updatePmuPlywood({
        id: this.editId,
        ...payload
      }).subscribe({
        next: () => this.afterSuccess(formRef),
        error: () => {
          alert('Server error');
          this.saving = false;
        }
      });

    }
    // ---------- ADD ----------
    else {

      this.lastAction = 'create';

      this.backend.addPmuPlywood(payload).subscribe({
        next: () => this.afterSuccess(formRef),
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
    }, 2000);

    this.saving = false;
  }

  // ---------------- LOAD LIST ----------------
  loadList() {

    this.backend.getPmuPlywoodList(this.firmCode).subscribe((res: any) => {

      if (res.success) {

        this.list = res.data || [];

        // TOP GRAND TOTAL
        this.grandTotal = this.list.reduce(
          (sum: number, x: any) => sum + Number(x.total_expense || 0),
          0
        );

        this.applyFilters();

        this.cdr.markForCheck();
      }
    });
  }


  applyFilters() {

    let data = [...this.list];

    // SEARCH
    if (this.search.trim()) {

      const s = this.search.toLowerCase();

      data = data.filter((x: any) =>
        (x.remarks || '').toLowerCase().includes(s) ||
        (x.purchase_date || '').toLowerCase().includes(s)
      );
    }

    // SINGLE DATE
    if (this.singleDate) {
      data = data.filter((x: any) => x.purchase_date === this.singleDate);
    }

    // DATE RANGE
    if (this.dateFrom) {
      data = data.filter((x: any) => x.purchase_date >= this.dateFrom);
    }

    if (this.dateTo) {
      data = data.filter((x: any) => x.purchase_date <= this.dateTo);
    }

    this.totalRecords = data.length;

    this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);

    // FOOTER TOTALS
    this.footerTotals = {

      total_ply:  data.reduce((a: number, b: any) => a + Number(b.square_feet || 0),0),

      total_plywood_amount: data.reduce((a: number, b: any) => a + Number(b.sqft_amount || 0), 0),

      total_transport: data.reduce((a: number, b: any) => a + Number(b.transportation || 0), 0),

      grand_total: data.reduce((a: number, b: any) => a + Number(b.total_expense || 0), 0)
    };

    // PAGINATION
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.filteredList = data.slice(start, end);
  }

  triggerLiveFilter() {
    this.currentPage = 1;
    this.applyFilters();
  }

  changePage(page: number) {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    this.applyFilters();
  }

  resetFilters() {

    this.search = '';
    this.singleDate = '';
    this.dateFrom = '';
    this.dateTo = '';

    this.currentPage = 1;

    this.applyFilters();
  }


  // ---------------- RESET ----------------
  resetForm() {
    this.form = {
      purchase_date: '',
      square_feet: null,
      rate_per_sqft: null,
      transportation: 0,
      paid: 'No',
      remarks: ''
    };
    this.sqftAmount = 0;
    this.totalExpense = 0;
  }

  // ---------------- EDIT ----------------
  editRow(row: any) {

    this.form = {
      purchase_date: row.purchase_date,
      square_feet: row.square_feet,
      rate_per_sqft: row.rate_per_sqft,
      transportation: row.transportation,
      paid: row.paid,
      remarks: row.remarks
    };

    this.sqftAmount = row.sqft_amount;
    this.totalExpense = row.total_expense;

    this.editMode = true;
    this.editId = row.id;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------- DELETE ----------------
  deleteRow(id: number) {
    if (!confirm('Delete this record?')) return;

    this.backend.deletePmuPlywood({
      id: id,
      firm_code: this.firmCode
    }).subscribe(() => this.loadList());
  }

}