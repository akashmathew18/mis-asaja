import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../../core/services/admin';
import { DialogService } from '../../../core/services/admin-dialog.service';
import { Router } from '@angular/router';

import { DialogComponent } from '../dialog/dialog';

@Component({
  selector: 'app-manage-organizations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent
  ],
  templateUrl: './manage-organizations.html',
  styleUrl: './manage-organizations.css'
})
export class ManageOrganizations implements OnInit {

  organizations: any[] = [];

  editing = false;

  form: any = {
    org_id: '',
    org_name: ''
  };

  constructor(
    private admin: AdminService,
    private cdr: ChangeDetectorRef,
    private dialog: DialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  /* ================= LOAD ================= */

  loadOrganizations() {

    this.admin.getOrganizations().subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Load Failed',
            res.message || 'Unable to load organizations'
          );

          return;
        }

        this.organizations = res.data;

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

  /* ================= EDIT ================= */

  edit(o: any) {

    this.editing = true;

    this.form = { ...o };

    this.cdr.markForCheck();
  }

  /* ================= SAVE ================= */

  save() {

    if (!this.form.org_name?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Organization name is required'
      );

      return;
    }

    const api = this.editing
      ? this.admin.updateOrganization(this.form)
      : this.admin.addOrganization(this.form);

    api.subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Operation Failed',
            res.message || 'Unable to save organization'
          );

          return;
        }

        this.loadOrganizations();

        this.dialog.success(
          this.editing
            ? 'Organization Updated'
            : 'Organization Created',

          this.editing
            ? 'Organization updated successfully'
            : 'Organization created successfully'
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

  toggleStatus(o: any) {

    const action =
      o.data_status === 'Active'
        ? 'Deactivate'
        : 'Activate';

    this.dialog.warning(
      `${action} Organization`,
      `Are you sure you want to ${action.toLowerCase()} this organization?`,
      {

        okText: action,

        onOk: () => {

          this.admin
            .toggleOrganizationStatus(o.org_id)
            .subscribe({

              next: () => {

                this.loadOrganizations();

                this.dialog.success(
                  'Success',
                  `Organization ${action.toLowerCase()}d successfully`
                );
              },

              error: () => {

                this.dialog.error(
                  'Server Error',
                  'Unable to update organization status'
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
      org_id: '',
      org_name: ''
    };

    this.cdr.markForCheck();
  }


  backToDashboard() {

    this.router.navigate(['/admin/dashboard']);

  }


}