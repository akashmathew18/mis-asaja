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
  selector: 'app-manage-executives',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent
  ],
  templateUrl: './manage-executives.html',
  styleUrl: './manage-executives.css'
})
export class ManageExecutives implements OnInit {

  executives: any[] = [];
  firms: any[] = [];

  editing = false;
  loading = false;

  form: any = {
    exec_id: '',
    exec_name: '',
    mobile: '',
    firms: []
  };

  constructor(
    private admin: AdminService,
    private dialog: DialogService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExecutives();
    this.loadFirms();
  }

  /* ================= LOAD EXECUTIVES ================= */

  loadExecutives() {

    this.admin.getExecutives().subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Load Failed',
            res.message || 'Unable to load executives'
          );

          return;
        }

        this.executives = res.data;

        this.cdr.markForCheck();
      },

      error: () => {

        this.dialog.error(
          'Server Error',
          'Failed to fetch executives'
        );
      }
    });
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
          'Failed to fetch firms'
        );
      }
    });
  }

  /* ================= TOGGLE FIRM ================= */

  toggleFirm(code: string) {

    const index = this.form.firms.indexOf(code);

    index > -1
      ? this.form.firms.splice(index, 1)
      : this.form.firms.push(code);
  }

  /* ================= EDIT ================= */

  edit(e: any) {

    this.editing = true;

    this.form.exec_id = e.exec_id;
    this.form.exec_name = e.exec_name;
    this.form.mobile = e.mobile;

    this.form.firms = e.firm_codes
      ? [...e.firm_codes]
      : [];

    this.cdr.markForCheck();
  }

  /* ================= SAVE ================= */

  save() {

    if (!this.form.exec_name?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Executive name is required'
      );

      this.cdr.detectChanges();

      return;
    }

    if (
      !this.form.firms ||
      this.form.firms.length === 0
    ) {

      this.dialog.warning(
        'Validation Error',
        'Please assign at least one firm'
      );

      this.cdr.detectChanges();

      return;
    }

    this.loading = true;

    const api = this.editing
      ? this.admin.updateExecutive(this.form)
      : this.admin.addExecutive(this.form);

    api.subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {

          this.dialog.error(
            'Operation Failed',
            res.message || 'Unable to save executive'
          );

          this.cdr.detectChanges();

          return;
        }

        this.loadExecutives();

        this.dialog.success(
          this.editing
            ? 'Executive Updated'
            : 'Executive Created',

          this.editing
            ? 'Executive updated successfully'
            : 'Executive added successfully',

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

        this.loading = false;

        this.dialog.error(
          'Server Error',
          'Unable to connect to server'
        );
      }
    });
  }

  /* ================= TOGGLE STATUS ================= */

  toggleStatus(e: any) {

    const action =
      e.data_status === 'Active'
        ? 'Deactivate'
        : 'Activate';

    this.dialog.warning(
      `${action} Executive`,
      `Are you sure you want to ${action.toLowerCase()} this executive?`,
      {
        okText: action,

        onOk: () => {

          this.admin.toggleExecutiveStatus(e.exec_id)
            .subscribe({

              next: (res: any) => {

                if (!res.success) {

                  this.dialog.error(
                    'Failed',
                    res.message || 'Unable to update status'
                  );

                  return;
                }

                this.loadExecutives();

                this.cdr.markForCheck();

                this.dialog.success(
                  'Success',
                  `Executive ${action.toLowerCase()}d successfully`
                );
              },

              error: () => {

                this.dialog.error(
                  'Server Error',
                  'Failed to update executive status'
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
      exec_id: '',
      exec_name: '',
      mobile: '',
      firms: []
    };

    this.cdr.markForCheck();
  }

  /* ================= BACK TO DASHBOARD ================= */

  backToDashboard() {

    this.router.navigate(['/admin/dashboard']);

  }

}