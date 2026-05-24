import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { TenderService } from '../../../../core/services/tender-services';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-tenders-tender-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tender-entry.html',
  styleUrl: './tender-entry.css'
})
export class TenderEntry implements OnInit {

  /* =========================================================
     FORM MODEL
  ========================================================= */
  form: any = {
    tender_type: 'Online',

    org_id: '',
    div_id: '',
    dist_id: '',
    dist_name: '',
    div_name: '',

    department: '',
    department_id: '',

    project_name: '',

    t_official_id: '',
    reference_id: '',

    tender_date: '',
    tender_opening_date: '',

    processing_fee: 0,
    stamp_paper_fee: 0,
    documentation_fee: 0,

    estimate_amount: '',
    quoted_amount: '',

    exec_id: '',
    expense_amount: 0,

    tender_submission_date: '',

    status_code: 'TS-01',
    remarks: ''
  };

  /* =========================================================
     MASTER DATA
  ========================================================= */
  orgs: any[] = [];
  executives: any[] = [];
  statuses: any[] = [];

  /* =========================================================
     DIVISION SEARCH
  ========================================================= */
  divisionSuggestions: any[] = [];
  showDivDropdown = false;

  /* =========================================================
     DEPARTMENT SEARCH
  ========================================================= */
  departmentSuggestions: any[] = [];
  showDeptDropdown = false;

  /* =========================================================
     FILE UPLOAD
  ========================================================= */
  selectedFile: File | null = null;
  selectedFileName: string = '';

  /* =========================================================
     ITEMS
  ========================================================= */
  items: any[] = [
    {
      item_name: '',
      quantity: '',
      rate_per_piece: ''
    }
  ];

  itemsTotal = 0;

  /* =========================================================
     OFFICIALS
  ========================================================= */
  officials: any[] = [
    {
      name: '',
      designation: '',
      contacts: [
        {
          phone: ''
        }
      ]
    }
  ];

  /* =========================================================
     ACTIVATED TENDERS
  ========================================================= */
  activatedTenders: any[] = [];
  showActivatedDialog = false;
  selectedActivatedId: number | null = null;

  constructor(
    private backend: TenderService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadMasters();
  }

  /* =========================================================
     LOAD MASTER DATA
  ========================================================= */
  loadMasters(): void {

    this.backend.getOrganizations().subscribe((r: any) => {
      if (r.success) {
        this.orgs = r.data;
      }
      this.cdr.markForCheck();
    });

    this.backend.getExecutives().subscribe((r: any) => {
      if (r.success) {
        this.executives = r.data;
      }
      this.cdr.markForCheck();
    });

    this.backend.getTenderStatuses().subscribe((r: any) => {

      if (r.success) {

        this.statuses = r.data.filter((s: any) =>
          s.status_code === 'TS-01' ||
          s.status_code === 'TS-02'
        );

      }

      this.cdr.markForCheck();

    });

  }

  /* =========================================================
     NAVIGATION
  ========================================================= */
  golist(): void {

    const firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode');

    this.router.navigate([
      `/firms/${firmCode}/tender-module/tender-list`
    ]);

  }

  /* =========================================================
     DIVISION SEARCH
  ========================================================= */
  searchDivision(): void {

    const keyword = this.form.div_name;

    if (!this.form.org_id) {
      this.showDivDropdown = false;
      return;
    }

    if (!keyword || keyword.length < 2) {
      this.showDivDropdown = false;
      return;
    }

    this.backend.searchDivisions({
      keyword,
      org_id: this.form.org_id
    }).subscribe((r: any) => {

      if (r.success) {

        this.divisionSuggestions = r.data;
        this.showDivDropdown = true;

      }

      this.cdr.markForCheck();

    });

  }

  selectDivision(d: any): void {

    this.form.div_id = d.div_id;
    this.form.div_name = d.div_name;

    this.form.dist_id = d.dist_id;
    this.form.dist_name = d.dist_name;

    this.showDivDropdown = false;

  }

  /* =========================================================
     DEPARTMENT SEARCH
  ========================================================= */
  searchDepartment(): void {

    const keyword = this.form.department;

    if (!keyword || keyword.length < 2) {
      this.showDeptDropdown = false;
      return;
    }

    this.backend.searchDepartments({ keyword })
      .subscribe((r: any) => {

        if (r.success) {

          this.departmentSuggestions = r.data;
          this.showDeptDropdown = true;

        }

        this.cdr.markForCheck();

      });

  }

  selectDepartment(d: any): void {

    this.form.department = d.dept_name;
    this.form.department_id = d.dept_id;

    this.showDeptDropdown = false;

  }

  /* =========================================================
     FILE SELECT
  ========================================================= */
  onFileSelected(event: any): void {

    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF allowed');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;

  }

  /* =========================================================
     ITEMS
  ========================================================= */
  addItem(): void {

    this.items.push({
      item_name: '',
      quantity: '',
      rate_per_piece: ''
    });

  }

  removeItem(index: number): void {

    this.items.splice(index, 1);

    this.recalculateItems();

  }

  recalculateItems(): void {

    let total = 0;

    this.items.forEach((it: any) => {

      const qty = Number(it.quantity) || 0;
      const rate = Number(it.rate_per_piece) || 0;

      total += qty * rate;

    });

    this.itemsTotal = total;

  }

  /* =========================================================
     OFFICIALS
  ========================================================= */
  addOfficial(): void {

    this.officials.push({
      name: '',
      designation: '',
      contacts: [
        {
          phone: ''
        }
      ]
    });

  }

  removeOfficial(index: number): void {

    this.officials.splice(index, 1);

  }

  addContact(index: number): void {

    this.officials[index].contacts.push({
      phone: ''
    });

  }

  removeContact(i: number, j: number): void {

    this.officials[i].contacts.splice(j, 1);

  }

  /* =========================================================
     VALIDATION
  ========================================================= */
  isFormValid(): boolean {

    return !!(

      this.form.org_id &&
      this.form.dist_id &&
      this.form.div_id &&
      this.form.project_name &&
      this.form.t_official_id &&
      this.form.reference_id &&
      this.form.estimate_amount &&
      this.form.quoted_amount &&
      this.form.exec_id &&
      this.form.status_code &&
      this.form.tender_date

    );

  }

  /* =========================================================
     SAVE
  ========================================================= */
  save(f: NgForm): void {

    if (!this.isFormValid()) {
      alert('Please fill all required fields');
      return;
    }

    const firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode');

    const formData = new FormData();

    Object.keys(this.form).forEach((key: any) => {

      formData.append(
        key,
        this.form[key] ?? ''
      );

    });

    formData.append(
      'firm_code',
      firmCode || ''
    );

    formData.append(
      'created_by',
      this.auth.getUserid()
    );

    formData.append(
      'items',
      JSON.stringify(this.items)
    );

    formData.append(
      'officials',
      JSON.stringify(this.officials)
    );

    if (this.selectedFile) {

      formData.append(
        'tender_notice',
        this.selectedFile
      );

    }

    this.backend.addTender(formData)
      .subscribe({

        next: (res: any) => {

          if (!res.success) {

            alert(res.message || 'Save failed');
            return;

          }

          alert('Tender Saved : ' + res.tender_id);

          /* =========================================
             UPDATE ACTIVATED
          ========================================= */
          if (this.selectedActivatedId) {

            this.backend.updateActivatedTender({
              id: this.selectedActivatedId,
              action: 'select'
            }).subscribe();

          }

          this.resetForm(f);

        },

        error: (err: any) => {

          console.error(err);

          alert('Server error occurred');

        }

      });

  }

  /* =========================================================
     RESET
  ========================================================= */
  resetForm(f: NgForm): void {

    f.resetForm({
      tender_type: 'Online',
      status_code: 'TS-01'
    });

    this.items = [
      {
        item_name: '',
        quantity: '',
        rate_per_piece: ''
      }
    ];

    this.officials = [
      {
        name: '',
        designation: '',
        contacts: [
          {
            phone: ''
          }
        ]
      }
    ];

    this.itemsTotal = 0;

    this.selectedFile = null;
    this.selectedFileName = '';

    this.selectedActivatedId = null;

    this.showDivDropdown = false;
    this.showDeptDropdown = false;

  }

  /* =========================================================
     ACTIVATED TENDERS
  ========================================================= */
  loadActivatedTenders(): void {

    const firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode');

    this.backend.getActivatedTenders({
      firm_code: firmCode
    }).subscribe((r: any) => {

      if (r.success) {

        this.activatedTenders = r.data;
        this.showActivatedDialog = true;

      }

      this.cdr.markForCheck();

    });

  }

  selectActivated(t: any): void {

    this.backend.getActivatedDetail({
      id: t.id
    }).subscribe((r: any) => {

      if (!r.success) return;

      const d = r.data;

      this.form.org_id = d.org_id;
      this.form.div_id = d.div_id;
      this.form.div_name = d.div_name;

      this.form.dist_id = d.dist_id;
      this.form.dist_name = d.dist_name;

      this.form.department = d.department;
      this.form.department_id = d.department_id;

      this.form.project_name = d.project_name;

      this.form.t_official_id = d.t_official_id;
      this.form.reference_id = d.reference_id;

      this.form.tender_date = d.tender_date;

      this.form.estimate_amount = d.estimate_amount;
      this.form.remarks = d.remarks;

      this.items = d.items?.length
        ? d.items
        : [{
          item_name: '',
          quantity: '',
          rate_per_piece: ''
        }];

      this.officials = d.officials?.length
        ? d.officials
        : [{
          name: '',
          designation: '',
          contacts: [{ phone: '' }]
        }];

      this.recalculateItems();

      this.selectedActivatedId = t.id;

      this.showActivatedDialog = false;

      this.cdr.markForCheck();

    });

  }

  removeActivated(t: any): void {

    if (!confirm('Remove this tender?')) return;

    this.backend.updateActivatedTender({
      id: t.id,
      action: 'remove'
    }).subscribe(() => {

      this.loadActivatedTenders();

      this.cdr.markForCheck();

    });

  }


  /* =========================================================
   TIME LEFT BADGE
========================================================= */
  getTimeLeft(dateString: string): any {

    if (!dateString) return null;

    const now = new Date().getTime();
    const target = new Date(dateString).getTime();

    const diff = target - now;

    // EXPIRED
    if (diff <= 0) {
      return {
        text: 'Expired',
        class: 'bg-danger'
      };
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    // LESS THAN 1 HOUR
    if (minutes < 60) {

      return {
        text: `${minutes} min left`,
        class: 'bg-danger'
      };

    }

    // LESS THAN 24 HOURS
    if (hours < 24) {

      return {
        text: `${hours} hrs left`,
        class: 'bg-warning text-dark'
      };

    }

    // MORE THAN 1 DAY
    return {

      text: `${days} days left`,
      class: 'bg-success'

    };

  }

}