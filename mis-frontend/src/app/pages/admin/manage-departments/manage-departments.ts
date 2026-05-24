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

@Component({
  selector: 'app-manage-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './manage-departments.html',
  styleUrl: './manage-departments.css',
})
export class ManageDepartments implements OnInit {

  departments: any[] = [];

  editing = false;

  form: any = {
    dept_id: '',
    dept_name: ''
  };

  constructor(
    private admin: AdminService,
    private cdr: ChangeDetectorRef,
    private dialog: DialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDepartments();
  }

  /* ================= LOAD ================= */

  loadDepartments() {

    this.admin.getDepartments().subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Load Failed',
            res.message || 'Unable to load departments'
          );

          return;
        }

        this.departments = res.data;

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

  edit(d: any) {

    this.editing = true;

    this.form = {
      dept_id: d.dept_id,
      dept_name: d.dept_name
    };

    this.cdr.markForCheck();
  }

  /* ================= SAVE ================= */

  save() {

    if (!this.form.dept_name?.trim()) {

      this.dialog.warning(
        'Validation Error',
        'Department name is required'
      );

      return;
    }

    const api = this.editing
      ? this.admin.updateDepartment(this.form)
      : this.admin.addDepartment(this.form);

    api.subscribe({

      next: (res: any) => {

        if (!res.success) {

          this.dialog.error(
            'Operation Failed',
            res.message || 'Unable to save department'
          );

          return;
        }

        this.loadDepartments();

        this.dialog.success(
          this.editing
            ? 'Department Updated'
            : 'Department Created',

          this.editing
            ? 'Department updated successfully'
            : 'Department created successfully'
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
      `${action} Department`,
      `Are you sure you want to ${action.toLowerCase()} this department?`,
      {

        okText: action,

        onOk: () => {

          this.admin
            .deleteDepartment(d.dept_id)
            .subscribe({

              next: () => {

                this.loadDepartments();

                this.dialog.success(
                  'Success',
                  `Department ${action.toLowerCase()}d successfully`
                );
              },

              error: () => {

                this.dialog.error(
                  'Server Error',
                  'Unable to update department status'
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
      dept_id: '',
      dept_name: ''
    };

    this.cdr.markForCheck();
  }

  /* ================= DASHBOARD ================= */

  backToDashboard() {

    this.router.navigate(['/admin/dashboard']);
  }

}