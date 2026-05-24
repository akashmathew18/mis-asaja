import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common';

@Injectable({
  providedIn: 'root'
})
export class BackendconnectionService {

  private baseUrl = '';



  constructor(private http: HttpClient, private common: CommonService) {
    this.baseUrl = common.baseUrl;
  }

  // ---------- AUTH ----------
  login(data: { username: string; password: string }) {
    return this.http.post(`${this.baseUrl}/auth/login.php`, data);
  }

  // ---------- FIRMS ----------
  getAllFirms() {
    return this.http.get(`${this.baseUrl}/firms/get_firms.php`);
  }


  // =========================================
  // FIRMS 
  // =========================================
  getFirmsByUser(data: {
    userid: string,
    company_id: string
  }) {

    return this.http.post<any>(
      `${this.baseUrl}/firms/get-firms-by-user.php`,
      data
    );

  }

  getFirmByCode(data: any) {
    return this.http.post<any>(
      `${this.baseUrl}/firms/get_firms.php`,
      data
    );
  }

  // ---------- PMU DASHBOARD TOTALS ----------

  getPmuDashboardTotals(firmCode: string, days: number) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/dashboard/totals.php`,
      {
        firm_code: firmCode,
        days: days
      }
    );
  }

}