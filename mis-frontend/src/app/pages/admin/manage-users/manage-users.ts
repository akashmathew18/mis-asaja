import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin';
import { DialogService } from '../../../core/services/admin-dialog.service';

import { DialogComponent } from '../dialog/dialog';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsers implements OnInit {

  users: any[] = [];
  firms: any[] = [];
  editing = false;



  form: any = {
    userid: '',
    username: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    firms: []
  };

  constructor(
    private admin: AdminService,
    private cdr: ChangeDetectorRef,
    private dialog: DialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadFirms();
  }



  loadUsers() {
    this.admin.getUsers().subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.dialog.error(
            'Load Failed',
            res.message || 'Unable to load users'
          );
          return;
        }
        this.users = res.data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.dialog.error(
          'Server Error',
          'Failed to fetch users'
        );
      }
    });
  }


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

  toggleFirm(code: string) {
    const index = this.form.firms.indexOf(code);
    index > -1
      ? this.form.firms.splice(index, 1)
      : this.form.firms.push(code);
  }


  edit(u: any) {

    this.editing = true;

    this.form.userid = u.userid;
    this.form.username = u.username;
    this.form.full_name = u.full_name;
    this.form.password = '';
    this.form.confirmPassword = '';
    this.form.role = u.role;

    // 🔥 THIS IS THE IMPORTANT LINE
    this.form.firms = u.firm_codes ? [...u.firm_codes] : [];

    this.cdr.markForCheck();
  }

  save() {
    if (!this.form.full_name?.trim()) {
      this.dialog.warning(
        'Validation Error',
        'Full name is required'
      );
      this.cdr.detectChanges();
      return;
    }
    if (!this.form.username?.trim()) {
      this.dialog.warning(
        'Validation Error',
        'Username is required'
      );
      this.cdr.detectChanges();
      return;
    }
    if (
      !this.editing &&
      !this.form.password
    ) {
      this.dialog.warning(
        'Validation Error',
        'Password is required'
      );
      this.cdr.detectChanges();
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.dialog.warning(
        'Password Mismatch',
        'Passwords do not match'
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
    const api = this.editing
      ? this.admin.updateUser(this.form)
      : this.admin.addUser(this.form);
    api.subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.dialog.error(
            'Operation Failed',
            res.message || 'Unable to save user'
          );
          this.cdr.detectChanges();
          return;
        }
        this.loadUsers();
        this.dialog.success(
          this.editing
            ? 'User Updated'
            : 'User Created',
          this.editing
            ? 'User updated successfully'
            : 'User added successfully',
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
      error: (err) => {
        console.error(err);
        this.dialog.error(
          'Server Error',
          'Server error occurred'
        );
      }
    });
  }


  cancelEdit() {

    this.editing = false;

    this.form = {
      userid: '',
      full_name: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      firms: []
    };

  }



  reset() {
    this.editing = false;

    this.form.userid = '';
    this.form.username = '';
    this.form.full_name = '';
    this.form.password = '';
    this.form.confirmPassword = '';
    this.form.role = 'user';
    this.form.firms = [];

    this.cdr.markForCheck();
  }

  toggleStatus(u: any) {
    const action =
      u.status === 'Active'
        ? 'Deactivate'
        : 'Activate';
    this.dialog.warning(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} this user?`,
      {
        okText: action,
        onOk: () => {
          this.admin.toggleUserStatus(u.userid)
            .subscribe({
              next: () => {
                this.loadUsers();
                this.cdr.markForCheck();
                this.dialog.success(
                  'Success',
                  `User ${action.toLowerCase()}d successfully`
                );
              },
              error: () => {
                this.dialog.error(
                  'Failed',
                  'Failed to update user status'
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

}