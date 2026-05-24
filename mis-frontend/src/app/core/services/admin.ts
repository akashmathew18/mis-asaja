import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = '';

  constructor(
    private http: HttpClient,
    private common: CommonService,
    private auth: AuthService
  ) {
    this.baseUrl = this.common.baseUrl;
  }



  getDistricts() {

    return this.http.get(
      `${this.baseUrl}/admin/district/list.php`
    );
  }

  /* =====================================================
     USERS
  ===================================================== */

  getUsers() {

    return this.http.post(
      `${this.baseUrl}/admin/users/list.php`,
      {
        userid: this.auth.getUserid()
      }
    );

  }

  addUser(data: any) {

    return this.http.post(
      `${this.baseUrl}/admin/users/add.php`,
      {
        ...data,
        created_by: this.auth.getUserid()
      }
    );

  }

  updateUser(data: any) {

    return this.http.post(
      `${this.baseUrl}/admin/users/update.php`,
      {
        ...data,
        updated_by: this.auth.getUserid()
      }
    );

  }

  toggleUserStatus(userid: string) {
    return this.http.post(
      `${this.baseUrl}/admin/users/toggle-status.php`,
      { userid }
    );
  }

  assignUserFirms(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/users/assign_firms.php`,
      data
    );
  }


  /* =====================================================
     EXECUTIVES
  ===================================================== */

  getExecutives() {

    return this.http.post(
      `${this.baseUrl}/admin/executives/list.php`,
      {
        userid: this.auth.getUserid()
      }
    );

  }

  addExecutive(data: any) {

    return this.http.post(
      `${this.baseUrl}/admin/executives/add.php`,
      {
        ...data,
        created_by: this.auth.getUserid()
      }
    );

  }

  updateExecutive(data: any) {

    return this.http.post(
      `${this.baseUrl}/admin/executives/update.php`,
      {
        ...data,
        updated_by: this.auth.getUserid()
      }
    );

  }

  toggleExecutiveStatus(exec_id: string) {
    return this.http.post(
      `${this.baseUrl}/admin/executives/toggle-status.php`,
      { exec_id }
    );
  }


  /* =====================================================
     FIRMS
  ===================================================== */

  getFirms() {
    return this.http.post(
      `${this.baseUrl}/admin/firms/list.php`,
      {
        userid: this.auth.getUserid()
      }
    );
  }

  addFirm(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/firms/add.php`,
      {
        ...data,
        created_by: this.auth.getUserid()
      }
    );
  }

  updateFirm(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/firms/update.php`,
      {
        ...data,
        created_by: this.auth.getUserid()
      }
    );
  }

  toggleFirmStatus(firm_code: string, created_by: string) {
    return this.http.post(
      `${this.baseUrl}/admin/firms/toggle-status.php`,
      {
        firm_code,
        created_by
      }
    );
  }


  /* =====================================================
     ORGANIZATIONS
  ===================================================== */

  getOrganizations() {
    return this.http.post(
      `${this.baseUrl}/admin/organizations/list.php`,
      {}
    );
  }

  addOrganization(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/organizations/add.php`,
      data
    );
  }

  updateOrganization(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/organizations/update.php`,
      data
    );
  }

  toggleOrganizationStatus(org_id: string) {
    return this.http.post(
      `${this.baseUrl}/admin/organizations/toggle-status.php`,
      { org_id }
    );
  }


  /* =====================================================
     DIVISIONS
  ===================================================== */

  getDivisions() {
    return this.http.post(
      `${this.baseUrl}/admin/divisions/list.php`,
      {}
    );
  }

  addDivision(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/divisions/add.php`,
      data
    );
  }

  updateDivision(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/divisions/update.php`,
      data
    );
  }

  toggleDivisionStatus(div_id: string) {
    return this.http.post(
      `${this.baseUrl}/admin/divisions/toggle-status.php`,
      { div_id }
    );
  }



  /* ================= DEPARTMENTS ================= */

  getDepartments() {
    return this.http.get(
      `${this.baseUrl}/admin/departments/list.php`
    );
  }

  addDepartment(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/departments/add.php`,
      data
    );
  }

  updateDepartment(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/departments/update.php`,
      data
    );
  }

  deleteDepartment(data: any) {
    return this.http.post(
      `${this.baseUrl}/admin/departments/delete.php`,
      data
    );
  }

}