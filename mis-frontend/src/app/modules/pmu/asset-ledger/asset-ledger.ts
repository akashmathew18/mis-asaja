import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-pmu-asset-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-ledger.html',
  styleUrl: './asset-ledger.css'
})
export class PmuAssetLedger implements OnInit {

  firmCode!: string;
  form: any = this.defaultForm();
  list: any[] = [];
  filteredList: any[] = [];
  search = '';
  companyFilter = '';
  warrantyFilter = '';
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

  // ================= INIT =================

  ngOnInit(): void {

    this.firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode') || '';

    if (this.firmCode) {

      this.loadList();
    }
  }

  // ================= DEFAULT FORM =================

  defaultForm() {

    return {
      asset_name: '',
      company_name: '',
      purchase_date: '',
      warranty: 'No',
      warranty_expiry: '',
      asset_amount: null,
      remarks: ''
    };
  }

  // ================= WARRANTY =================

  onWarrantyChange() {

    if (this.form.warranty === 'No') {

      this.form.warranty_expiry = '';
    }
  }

  // ================= SAVE =================

  save(formRef: NgForm) {

    if (formRef.invalid || this.saving)
      return;

    this.saving = true;

    this.successMsg = false;

    const payload = {

      firm_code: this.firmCode,

      created_by:
        this.auth.getUserid(),

      asset_name:
        this.form.asset_name,

      company_name:
        this.form.company_name,

      purchase_date:
        this.form.purchase_date,

      warranty:
        this.form.warranty,

      warranty_expiry:

        this.form.warranty === 'Yes'

          ? this.form.warranty_expiry

          : null,

      asset_amount:
        this.form.asset_amount,

      remarks:
        this.form.remarks
    };

    // UPDATE
    if (this.editMode && this.editId) {

      this.lastAction = 'update';

      this.backend.updatePmuAsset({

        asset_id: this.editId,

        ...payload

      }).subscribe({

        next: (res: any) => {

          if (!res.success) {

            alert(
              res.message || 'Update failed'
            );

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

      this.backend.addPmuAsset(payload)
        .subscribe({

          next: (res: any) => {

            if (!res.success) {

              alert(
                res.message || 'Save failed'
              );

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

  // ================= AFTER SUCCESS =================

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

  // ================= LOAD LIST =================

  loadList() {

    this.backend.getPmuAssetList(this.firmCode)
      .subscribe((res: any) => {

        if (res.success) {

          this.list = res.data || [];

          this.grandTotal =
            this.list.reduce(

              (sum: number, x: any) =>

                sum + Number(
                  x.asset_amount || 0
                ),

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

        (x.asset_name || '')
          .toLowerCase()
          .includes(s)

        ||

        (x.company_name || '')
          .toLowerCase()
          .includes(s)

        ||

        (x.remarks || '')
          .toLowerCase()
          .includes(s)
      );
    }

    // COMPANY

    if (this.companyFilter.trim()) {

      data = data.filter((x: any) =>

        (x.company_name || '')
          .toLowerCase()
          .includes(
            this.companyFilter
              .toLowerCase()
          )
      );
    }

    // WARRANTY

    if (this.warrantyFilter) {

      data = data.filter(

        (x: any) =>

          x.warranty ===
          this.warrantyFilter
      );
    }

    // SINGLE DATE

    if (this.singleDate) {

      data = data.filter(

        (x: any) =>

          x.purchase_date ===
          this.singleDate
      );
    }

    // FROM

    if (this.dateFrom) {

      data = data.filter(

        (x: any) =>

          x.purchase_date >=
          this.dateFrom
      );
    }

    // TO

    if (this.dateTo) {

      data = data.filter(

        (x: any) =>

          x.purchase_date <=
          this.dateTo
      );
    }

    this.totalRecords = data.length;

    this.totalPages = Math.ceil(

      this.totalRecords /
      this.itemsPerPage
    );

    // FOOTER

    this.footerTotals = {

      grand_total:

        data.reduce(

          (a: number, b: any) =>

            a + Number(
              b.asset_amount || 0
            ),

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

    this.companyFilter = '';

    this.warrantyFilter = '';

    this.singleDate = '';

    this.dateFrom = '';

    this.dateTo = '';

    this.currentPage = 1;

    this.applyFilters();
  }

  // ================= RESET FORM =================

  resetForm() {

    this.form = this.defaultForm();

    this.editMode = false;

    this.editId = null;

    this.lastAction = 'create';
  }

  // ================= EDIT =================

  editRow(row: any) {

    this.form = {

      asset_name:
        row.asset_name,

      company_name:
        row.company_name,

      purchase_date:
        row.purchase_date,

      warranty:
        row.warranty,

      warranty_expiry:
        row.warranty_expiry,

      asset_amount:
        row.asset_amount,

      remarks:
        row.remarks
    };

    this.editMode = true;

    this.editId = row.asset_id;

    this.onWarrantyChange();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ================= DELETE =================

  deleteRow(asset_id: number) {

    if (!confirm('Delete this asset?'))
      return;

    this.backend.deletePmuAsset({

      asset_id,

      firm_code: this.firmCode

    }).subscribe(() =>
      this.loadList()
    );
  }
}