import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { TenderService } from '../../../../core/services/tender-services';

@Component({
  selector: 'app-upcoming-tenders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './upcoming-tenders.html',
  styleUrl: './upcoming-tenders.css'
})

export class UpcomingTenders implements OnInit {

  tenders: any[] = [];

  orgs: any[] = [];

  divisionSuggestions: any[] = [];
  departmentSuggestions: any[] = [];

  showDivDropdown = false;
  showDeptDropdown = false;

  showDialog = false;
  showViewDialog = false;

  showItems = false;

  isSaving = false;
  isEditMode = false;

  selectedTender: any = null;

  form: any = {};

  items: any[] = [];

  officials: any[] = [];

  constructor(
    private backend: TenderService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private auth: AuthService
  ) { }

  ngOnInit(): void {

    this.resetForm();

    this.load();
    this.loadMasters();
  }

  /* =========================================================
      LOADERS
  ========================================================= */

  load() {

    const company_id = this.auth.getCompanyId();

    this.backend.getUpcoming({ company_id })
      .subscribe((r: any) => {

        if (r.success) {
          this.tenders = r.data || [];
        }

        this.cdr.markForCheck();
      });
  }

  loadMasters() {

    this.backend.getOrganizations()
      .subscribe((r: any) => {

        if (r.success) {
          this.orgs = r.data || [];
        }
      });
  }

  /* =========================================================
      DIVISION
  ========================================================= */

  searchDivision() {

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
    })
      .subscribe((r: any) => {

        if (r.success) {
          this.divisionSuggestions = r.data || [];
          this.showDivDropdown = true;
        }
      });
  }

  selectDivision(d: any) {

    this.form.div_id = d.div_id;
    this.form.div_name = d.div_name;

    this.form.dist_id = d.dist_id;
    this.form.dist_name = d.dist_name;

    this.showDivDropdown = false;
  }

  /* =========================================================
      DEPARTMENT
  ========================================================= */

  searchDepartment() {

    const keyword = this.form.department;

    if (!keyword || keyword.length < 2) {
      this.showDeptDropdown = false;
      return;
    }

    this.backend.searchDepartments({ keyword })
      .subscribe((r: any) => {

        if (r.success) {
          this.departmentSuggestions = r.data || [];
          this.showDeptDropdown = true;
        }

        this.cdr.markForCheck();
      });
  }

  selectDepartment(d: any) {

    this.form.department = d.dept_name;
    this.form.department_id = d.dept_id;

    this.showDeptDropdown = false;
  }

  /* =========================================================
      DIALOGS
  ========================================================= */

  openAddDialog() {

    this.resetForm();

    this.showDialog = true;
    this.showItems = false;
  }

  closeDialog() {
    this.showDialog = false;
  }

  closeViewDialog() {

    this.showViewDialog = false;
    this.selectedTender = null;

    this.isEditMode = false;
  }

  /* =========================================================
      ITEMS
  ========================================================= */

  toggleItems() {
    this.showItems = !this.showItems;
  }

  addItem() {

    this.items.push({
      item_name: '',
      quantity: '',
      rate_per_piece: ''
    });
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
  }

  /* =========================================================
      OFFICIALS
  ========================================================= */

  addOfficial() {

    this.officials.push({
      name: '',
      designation: '',
      contacts: [
        { phone: '' }
      ]
    });
  }

  removeOfficial(i: number) {
    this.officials.splice(i, 1);
  }

  addContact(o: any) {
    o.contacts.push({ phone: '' });
  }

  removeContact(o: any, i: number) {
    o.contacts.splice(i, 1);
  }

  /* =========================================================
      SAVE
  ========================================================= */

  saveUpcoming(f: NgForm) {

    if (this.isSaving) return;

    if (!f.valid) {
      alert('Fill required fields');
      return;
    }

    if (!this.form.div_id) {
      alert('Please select division from dropdown');
      return;
    }

    const firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode');

    const cleanItems = this.items.filter((i: any) =>
      i.item_name?.trim() ||
      i.quantity ||
      i.rate_per_piece
    );

    const cleanOfficials = this.officials.filter((o: any) =>
      o.name?.trim()
    );

    const payload = {

      ...this.form,

      firm_code: firmCode,

      company_id: this.auth.getCompanyId(),

      created_by: this.auth.getUserid(),

      items: cleanItems,

      officials: cleanOfficials
    };

    this.isSaving = true;

    this.backend.saveUpcoming(payload)
      .subscribe({

        next: (r: any) => {

          this.isSaving = false;

          if (r.success) {

            alert('Saved successfully');

            this.closeDialog();

            this.resetForm();

            this.load();

          } else {

            alert(r.message || 'Save failed');
          }
        },

        error: () => {

          this.isSaving = false;

          alert('Server error');
        }
      });
  }

  /* =========================================================
      VIEW
  ========================================================= */

  viewTender(t: any) {

    this.backend.getUpcomingDetails({
      upcoming_id: t.upcoming_id
    })
      .subscribe((r: any) => {

        if (r.success) {

          this.selectedTender = r.data;

          if (!this.selectedTender.items) {
            this.selectedTender.items = [];
          }

          if (!this.selectedTender.officials) {
            this.selectedTender.officials = [];
          }

          this.showViewDialog = true;

          this.isEditMode = false;

          this.cdr.markForCheck();
        }
      });
  }


  /* =========================================================
    VIEW EDIT HELPERS
========================================================= */

  addViewOfficial() {

    if (!this.selectedTender.officials) {
      this.selectedTender.officials = [];
    }

    this.selectedTender.officials.push({
      name: '',
      designation: '',
      contacts: [
        { phone: '' }
      ]
    });
  }

  removeViewOfficial(i: number) {

    this.selectedTender.officials.splice(i, 1);
  }

  addViewContact(o: any) {

    if (!o.contacts) {
      o.contacts = [];
    }

    o.contacts.push({
      phone: ''
    });
  }

  removeViewContact(o: any, i: number) {

    o.contacts.splice(i, 1);
  }

  addViewItem() {

    if (!this.selectedTender.items) {
      this.selectedTender.items = [];
    }

    this.selectedTender.items.push({
      item_name: '',
      quantity: '',
      rate_per_piece: ''
    });
  }

  removeViewItem(i: number) {

    this.selectedTender.items.splice(i, 1);
  }

  /* =========================================================
      UPDATE
  ========================================================= */

  updateTender() {

    this.backend.updateUpcoming(this.selectedTender)
      .subscribe((r: any) => {

        if (r.success) {

          alert('Updated successfully');

          this.closeViewDialog();

          this.load();

        } else {

          alert(r.message || 'Update failed');
        }
      });
  }

  /* =========================================================
      TERMINATE
  ========================================================= */

  terminate(t: any) {

    const reason = prompt('Enter termination reason');

    if (!reason) return;

    this.backend.terminateUpcoming({
      upcoming_id: t.upcoming_id,
      reason
    })
      .subscribe(() => this.load());
  }

  /* =========================================================
      ACTIVATE
  ========================================================= */

  activate(t: any) {

    this.backend.activateUpcoming({
      upcoming_id: t.upcoming_id
    })
      .subscribe(() => {

        alert('Moved to tender entry');

        this.load();
      });
  }

  /* =========================================================
      RESET
  ========================================================= */

  resetForm() {

    this.form = {

      project_name: '',

      org_id: '',

      div_id: '',
      div_name: '',

      dist_id: '',
      dist_name: '',

      department: '',
      department_id: '',

      t_official_id: '',

      reference_id: '',

      tender_date: '',

      tender_type: '',

      estimate_amount: '',

      remarks: ''
    };

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
          { phone: '' }
        ]
      }
    ];

    this.showDivDropdown = false;
    this.showDeptDropdown = false;
  }
}