

import { ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-pmu-cot-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cot-delivery.html',
  styleUrl: './cot-delivery.css'
})
export class PmuCotDelivery implements OnInit {

  firmCode!: string;

  /* ===== AUTOCOMPLETE VARIABLES ===== */
  divisionSuggestions: any[] = [];
  showDropdown = false;


  @ViewChild('formSection')
  formSection!: ElementRef;

  teams: any[] = [];

  form: any = {
    delivery_date: '',
    div_id: '',
    dist_id: '',
    panchayath_name: '',
    district_name: '',
    cot_type: '',
    no_of_cots: null,
    sale_rate_per_cot: null,
    total_sale_amount: 0,
    total_team_purchase: 0,

    transportation: 0,
    fitting_charge: 0,
    loading_unloading: 0,
    other_charges: 0,
    remarks: ''
  };

  teamsData: any[] = [
    {
      team_id: '',
      no_of_cots: null,
      rate_per_cot: null,
      total: 0
    }
  ];

  netAmount = 0;
  list: any[] = [];

  saving = false;
  successMsg = false;
  editMode = false;
  editId: number | null = null;
  lastAction: 'create' | 'update' = 'create';

  totalExpense = 0;

  filteredList: any[] = [];

  search = '';
  selectedPanchayath = '';
  selectedDistrict = '';

  singleDate = '';
  dateFrom = '';
  dateTo = '';

  currentPage = 1;
  itemsPerPage = 10;

  totalPages = 1;
  totalRecords = 0;


  footerTotals: any = {

    total_cots: 0,
    total_cot_purchase: 0,
    total_expense: 0,

    total_transport: 0,
    total_fitting: 0,
    total_loading: 0,
    total_others: 0,

    total_sale: 0,
    total_profit: 0
  };


  profit_loss = 0;


  constructor(
    private route: ActivatedRoute,
    private backend: Pmu,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;
    this.loadList();
    this.loadTeams();
  }

  loadTeams() {
    this.backend.getPmuTeams(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.teams = res.data;
        this.cdr.markForCheck();
      }
    });
  }

  /* ================= PANCHAYAT SEARCH ================= */
  searchDivision() {

    if (!this.form.panchayath_name || this.form.panchayath_name.length < 2) {
      this.showDropdown = false;
      return;
    }

    this.backend.searchDivisions({
      keyword: this.form.panchayath_name
    }).subscribe((res: any) => {
      if (res.success) {
        this.divisionSuggestions = res.data;
        this.showDropdown = true;
        this.cdr.markForCheck();
      }
    });
  }

  selectDivision(d: any) {

    this.form.panchayath_name = d.div_name;
    this.form.div_id = d.div_id;
    this.form.dist_id = d.dist_id;
    this.form.district_name = d.dist_name;

    this.showDropdown = false;
  }

  /* ================= TOTAL ================= */
  calculateTotal() {

    const totalCots = Number(this.form.no_of_cots) || 0;
    const saleRate = Number(this.form.sale_rate_per_cot) || 0;
    const transport = Number(this.form.transportation) || 0;
    const fitting = Number(this.form.fitting_charge) || 0;
    const loading = Number(this.form.loading_unloading) || 0;
    const other = Number(this.form.other_charges) || 0;

    // SALE TOTAL

    this.form.total_sale_amount = totalCots * saleRate;



    // TEAM PURCHASE TOTAL

    const purchaseTotal =
      this.teamsData.reduce((sum, t) => {
        const qty = Number(t.no_of_cots) || 0;
        const rate = Number(t.rate_per_cot) || 0;
        t.total = qty * rate;
        return sum + t.total;
      }, 0);

    this.form.total_team_purchase =
      Number(purchaseTotal.toFixed(2));

    // FINAL EXPENSE
    this.totalExpense = this.form.total_team_purchase + transport + fitting + loading + other;
    this.netAmount = Number(this.totalExpense.toFixed(2));

    //profit Loss

    // PROFIT / LOSS

    this.profit_loss = this.form.total_sale_amount - this.netAmount;
  }

  /* ================= SAVE ================= */
  save(formRef: NgForm) {

    if (formRef.invalid || this.saving) return;

    this.saving = true;
    this.successMsg = false;

    const duplicate =
      this.teamsData.some((x, i) =>
        this.teamsData.findIndex(
          y => y.team_id === x.team_id
        ) !== i
      );

    if (duplicate) {
      alert('Duplicate teams not allowed');
      return;
    }


    if (this.form.no_of_cots <= 0) {
      alert('Invalid total cots');
      return;
    }

    const payload = {
      firm_code: this.firmCode,
      created_by: this.auth.getUser().userid,
      total_sale_amount: this.form.no_of_cots * this.form.sale_rate_per_cot,
      net_amount: this.netAmount,
      teams: this.teamsData, // 
      ...this.form
    };

    if (this.editMode && this.editId) {

      this.lastAction = 'update';

      this.backend.updatePmuCotDelivery({

        ...payload,
        id: this.editId
      }).subscribe(() => this.afterSuccess(formRef));

    } else {

      this.lastAction = 'create';

      this.backend.addPmuCotDelivery(payload)
        .subscribe(() => this.afterSuccess(formRef));
    }
  }

  afterSuccess(formRef: NgForm) {

    this.loadList();

    formRef.resetForm();
    this.resetForm();

    this.successMsg = true;
    this.editMode = false;
    this.editId = null;
    this.saving = false;

    setTimeout(() => this.successMsg = false, 2000);
  }

  /* ================= LOAD LIST ================= */
  loadList() {
    this.backend.getPmuCotDeliveryList(this.firmCode)
      .subscribe((res: any) => {
        if (res.success) {
          this.list = res.data || [];
          this.applyFilters();
          this.cdr.markForCheck();
        }
      });
  }

  /* ================= EDIT ================= */
  editRow(row: any) {

    this.form = {
      delivery_date: row.delivery_date,
      div_id: row.div_id,
      dist_id: row.dist_id,
      panchayath_name: row.div_name,
      district_name: row.dist_name,
      cot_type: row.cot_type,
      no_of_cots: row.no_of_cots,
      sale_rate_per_cot: row.sale_rate_per_cot,
      total_sale_amount: row.total_sale_amount,
      total_team_purchase: row.total_team_purchase,
      transportation: row.transportation,
      fitting_charge: row.fitting_charge,
      loading_unloading: row.loading_unloading,
      other_charges: row.other_charges,
      remarks: row.remarks
    };

    this.editId = row.id;
    this.editMode = true;

    this.teamsData = Array.isArray(row.teams)
      ? row.teams.map((t: any) => ({
        team_id: t.team_id,
        no_of_cots: t.no_of_cots,
        rate_per_cot: t.rate_per_cot,
        total:
          Number(t.no_of_cots) *
          Number(t.rate_per_cot)
      }))
      : [];

    this.calculateTotalCots();


    setTimeout(() => {

      this.formSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    }, 100);
  }


  cancelEdit(formRef: NgForm) {
    this.editMode = false;
    this.editId = null;
    formRef.resetForm();
    this.resetForm();
  }

  /* ================= DELETE ================= */
  deleteRow(id: number) {
    if (!confirm('Delete this entry?')) return;

    this.backend.deletePmuCotDelivery({
      id,
      firm_code: this.firmCode
    }).subscribe(() => this.loadList());
  }

  resetForm() {
    this.form = {
      delivery_date: '',
      div_id: '',
      dist_id: '',
      panchayath_name: '',
      district_name: '',
      cot_type: '',
      no_of_cots: null,
      sale_rate_per_cot: null,
      total_sale_amount: 0,
      transportation: 0,
      fitting_charge: 0,
      loading_unloading: 0,
      other_charges: 0,
      remarks: ''
    };

    this.teamsData = [
      { team_id: '', no_of_cots: null }
    ];

    this.netAmount = 0;
  }


  addTeamRow() {
    this.teamsData.push({ team_id: '', no_of_cots: null });
  }

  removeTeamRow(i: number) {
    this.teamsData.splice(i, 1);
    this.calculateTotalCots();
  }

  calculateTotalCots() {
    const total = this.teamsData.reduce((sum, t) => {
      return sum + (Number(t.no_of_cots) || 0);
    }, 0);

    this.form.no_of_cots = total;
    this.calculateTotal();
  }


  applyFilters() {

    let data = [...this.list];

    // SEARCH

    if (this.search.trim()) {

      const s = this.search.toLowerCase();

      data = data.filter((x: any) =>

        (x.cot_type || '')
          .toLowerCase()
          .includes(s)

        ||

        (x.remarks || '')
          .toLowerCase()
          .includes(s)
      );
    }

    // PANCHAYATH

    if (this.selectedPanchayath.trim()) {

      data = data.filter((x: any) =>

        (x.div_name || '')
          .toLowerCase()
          .includes(
            this.selectedPanchayath.toLowerCase()
          )
      );
    }

    // DISTRICT

    if (this.selectedDistrict.trim()) {

      data = data.filter((x: any) =>

        (x.dist_name || '')
          .toLowerCase()
          .includes(
            this.selectedDistrict.toLowerCase()
          )
      );
    }

    // SINGLE DATE

    if (this.singleDate) {

      data = data.filter((x: any) =>

        x.delivery_date === this.singleDate
      );
    }

    // FROM

    if (this.dateFrom) {

      data = data.filter((x: any) =>

        x.delivery_date >= this.dateFrom
      );
    }

    // TO

    if (this.dateTo) {

      data = data.filter((x: any) =>

        x.delivery_date <= this.dateTo
      );
    }

    // TOTALS

    this.totalRecords = data.length;

    this.totalPages = Math.max(
      1,
      Math.ceil(
        this.totalRecords / this.itemsPerPage
      )
    );

    // FIX PAGE OVERFLOW

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    // FOOTER TOTALS

    this.footerTotals = {

      total_cots:
        data.reduce(
          (a: number, b: any) =>
            a + Number(b.no_of_cots || 0),
          0
        ),

      total_cot_purchase:
        data.reduce(
          (a: number, b: any) =>
            a + Number(b.total_team_purchase || 0),
          0
        ),

      total_expense:
        data.reduce(
          (a: number, b: any) =>
            a + Number(b.net_amount || 0),
          0
        ),

      total_sale:
        data.reduce(
          (a: number, b: any) =>
            a + Number(b.total_sale_amount || 0),
          0
        ),

      total_transport:
        data.reduce(
          (a: number, b: any) =>
            a + Number(b.transportation || 0),
          0
        ),


      total_fitting:

        data.reduce(
          (a: number, b: any) =>
            a + Number(b.fitting_charge || 0),
          0
        ),

      total_loading:

        data.reduce(
          (a: number, b: any) =>
            a + Number(b.loading_unloading || 0),
          0
        ),


      total_others:

        data.reduce(
          (a: number, b: any) =>
            a + Number(b.other_charges || 0),
          0
        ),

      total_profit:
        data.reduce(
          (a: number, b: any) =>
            a + (Number(b.total_sale_amount || 0) - Number(b.net_amount || 0)),
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


  triggerLiveFilter() {

    this.currentPage = 1;
    this.applyFilters();
  }


  changePage(page: number) {

    if (
      page < 1 ||
      page > this.totalPages
    ) return;

    this.currentPage = page;

    this.applyFilters();
  }


  resetFilters() {

    this.search = '';
    this.selectedPanchayath = '';
    this.selectedDistrict = '';

    this.singleDate = '';
    this.dateFrom = '';
    this.dateTo = '';

    this.currentPage = 1;

    this.applyFilters();
  }


}
