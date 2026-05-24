import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AdminService } from '../../../core/services/admin';
import { DialogService } from '../../../core/services/admin-dialog.service';

import { DialogComponent } from '../dialog/dialog';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-manage-firms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent
  ],
  templateUrl: './manage-firms.html',
  styleUrl: './manage-firms.css'
})
export class ManageFirms implements OnInit {

  firms: any[] = [];

  editing = false;

  form: any = {
    firm_code: '',
    firm_name: '',
    short_name: '',
    module: '',
    address: '',
    contact_number: ''
  };

  constructor(
    private admin: AdminService,
    private cdr: ChangeDetectorRef,
    private dialog: DialogService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loadFirms();
  }

  /* ================= LOAD FIRMS ================= */

  loadFirms() {

    this.admin.getFirms().subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Load Failed',
            res.message || 'Unable to load firms'
          );

          return;
        }

        this.firms = res.data;

        this.cdr.markForCheck();
      },

      error: () => {

        this.dialog.error(
          'Server Error',
          'Unable to fetch firms'
        );
      }
    });
  }

  /* ================= EDIT ================= */

  edit(f: any) {

    this.editing = true;

    this.form = { ...f };

    this.cdr.markForCheck();
  }

  /* ================= SAVE ================= */

  save() {

    if (!this.form.firm_name?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Firm name is required'
      );

      return;
    }

    if (!this.form.short_name?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Short name is required'
      );

      return;
    }

    if (!this.form.module?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Please select a module'
      );

      return;
    }

    const api = this.editing
      ? this.admin.updateFirm(this.form)
      : this.admin.addFirm(this.form);

    api.subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Operation Failed',
            res.message || 'Unable to save firm'
          );

          return;
        }

        this.loadFirms();

        this.dialog.success(
          this.editing
            ? 'Firm Updated'
            : 'Firm Created',

          this.editing
            ? 'Firm updated successfully'
            : 'Firm added successfully',

          {
            showCreateAnother: !this.editing,

            onOk: () => {
              this.reset();
            },

            onCreateAnother: () => {
              this.reset();
              this.dialog.close();
            }
          }
        );

        if (this.editing) {
          this.reset();
        }
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

  toggleStatus(f: any) {

    const action =
      f.status === 'active'
        ? 'Deactivate'
        : 'Activate';

    this.dialog.warning(
      `${action} Firm`,
      `Are you sure you want to ${action.toLowerCase()} this firm?`,
      {
        okText: action,

        onOk: () => {

          this.admin.toggleFirmStatus(
            f.firm_code,
            this.auth.getUserid()
          )
            .subscribe({

              next: () => {

                this.loadFirms();

                this.dialog.success(
                  'Success',
                  `Firm ${action.toLowerCase()}d successfully`
                );
              },

              error: () => {

                this.dialog.error(
                  'Server Error',
                  'Unable to update firm status'
                );
              }
            });
        }
      }
    );
  }

  /* ================= BACK TO DASHBOARD ================= */

  backToDashboard() {

    this.router.navigate(['/admin/dashboard']);
  }

  /* ================= RESET ================= */

  reset() {

    this.editing = false;

    this.form = {
      firm_code: '',
      firm_name: '',
      short_name: '',
      module: '',
      address: '',
      contact_number: ''
    };

    this.cdr.markForCheck();
  }

}