import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin';
import { DialogService } from '../../../core/services/admin-dialog.service';
import { DialogComponent } from '../dialog/dialog';

@Component({
  selector: 'app-manage-divisions',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent, NgSelectModule],
  templateUrl: './manage-divisions.html',
  styleUrl: './manage-divisions.css'
})

export class ManageDivisions implements OnInit {

  divisions: any[] = [];

  districts: any[] = [];

  organizations: any[] = [];

  editing = false;

  form: any = {
    div_id: '',
    div_name: '',
    org_id: '',
    dist_id: ''
  };

  constructor(
    private admin: AdminService,
    private cdr: ChangeDetectorRef,
    private dialog: DialogService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.loadDivisions();
    this.loadOrganizations();
    this.loadDistricts();
  }

  /* ================= LOAD DIVISIONS ================= */

  loadDivisions() {

    this.admin.getDivisions().subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Load Failed',
            res.message || 'Unable to load divisions'
          );

          return;
        }

        this.divisions = res.data;

        this.cdr.markForCheck();
      },

      error: () => {

        this.dialog.error(
          'Server Error',
          'Unable to connect to server'
        );
      }
    });
  }


  /* ================= LOAD DISTRICTS ================= */

  loadDistricts() {
    this.admin.getDistricts().subscribe({
      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Load Failed',
            res.message || 'Unable to load districts'
          );
          return;
        }
        this.districts = res.data;

        this.cdr.markForCheck();
      },

      error: () => {

        this.dialog.error(
          'Server Error',
          'Unable to connect to server'
        );
      }
    });
  }

  /* ================= LOAD ORGANIZATIONS ================= */

  loadOrganizations() {

    this.admin.getOrganizations().subscribe({

      next: (res: any) => {

        if (!res.success) return;

        this.organizations = res.data;

        this.cdr.markForCheck();
      }
    });
  }

  /* ================= EDIT ================= */

  edit(d: any) {

    this.editing = true;

    this.form = {
      div_id: d.div_id,
      div_name: d.div_name,
      org_id: d.org_id,
      dist_id: d.dist_id
    };

    this.cdr.markForCheck();
  }

  /* ================= SAVE ================= */

  save() {

    if (!this.form.div_name?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Division name is required'
      );

      return;
    }

    if (!this.form.org_id?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Please select an organization'
      );

      return;
    }

    if (!this.form.dist_id?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'District ID is required'
      );

      return;
    }

    const api = this.editing
      ? this.admin.updateDivision(this.form)
      : this.admin.addDivision(this.form);

    api.subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Operation Failed',
            res.message || 'Unable to save division'
          );

          return;
        }

        this.loadDivisions();

        this.dialog.success(
          this.editing
            ? 'Division Updated'
            : 'Division Created',

          this.editing
            ? 'Division updated successfully'
            : 'Division created successfully'
        );

        this.reset();
      },

      error: () => {

        this.dialog.error(
          'Server Error',
          'Unable to connect to server'
        );
      }
    });
  }

  /* ================= TOGGLE STATUS ================= */

  toggleStatus(d: any) {

    const action =
      d.data_status === 'Active'
        ? 'Deactivate'
        : 'Activate';

    this.dialog.warning(
      `${action} Division`,
      `Are you sure you want to ${action.toLowerCase()} this division?`,
      {

        okText: action,

        onOk: () => {

          this.admin
            .toggleDivisionStatus(d.div_id)
            .subscribe({

              next: () => {

                this.loadDivisions();

                this.dialog.success(
                  'Success',
                  `Division ${action.toLowerCase()}d successfully`
                );
              },

              error: () => {

                this.dialog.error(
                  'Server Error',
                  'Unable to update division status'
                );
              }
            });
        }
      }
    );
  }

  /* ================= RESET ================= */

  reset() {

    this.editing = false;

    this.form = {
      div_id: '',
      div_name: '',
      org_id: '',
      dist_id: ''
    };

    this.cdr.markForCheck();
  }

  /* ================= DASHBOARD ================= */

  backToDashboard() {

    this.router.navigate(['/admin/dashboard']);
  }

}