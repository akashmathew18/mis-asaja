import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common';
import { AnyARecord } from 'dns';

@Injectable({
  providedIn: 'root'
})

export class Pmu {


  private baseUrl = '';

  constructor(private http: HttpClient, private common: CommonService) {
    this.baseUrl = common.baseUrl;
  }


  // DIVISIONS

  // SEARCH DIVISIONS
  searchDivisions(data: { keyword: string }) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/masters/divisions/search.php`,
      data
    );
  }

  // ---------- PMU TEAMS ----------
  getPmuTeams(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/teams/list.php`,
      { firm_code: firmCode }
    );
  }

  /* ================= TEAM LEDGER (Payments + Labour Credits) ================= */

  getTeamLedger(payload: {
    firm_code: string;
    team_name?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
  }) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/reports/team-ledger.php`,
      payload
    );
  }


  // SEARCH DIVISIONS



  // ---------- PMU TEAMS ----------
  /* Expense Title Dropdown */
  getExpenseTitleList(firmCode: string) {
    return this.http.post<any>(
      `${this.baseUrl}/modules/pmu/other-expense/expense_master.php`,
      {
        firm_code: firmCode
      }
    );
  }

  // ---------- PMU REPORTS ----------
  post(endpoint: string, firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/reports/${endpoint}`,
      { firm_code: firmCode }
    );
  }


  // ---------- PMU WOOD ----------
  addPmuWood(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/wood/add.php`,
      data
    );
  }

  getPmuWoodList(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/wood/list.php`,
      data
    );
  }


  // UPDATE
  updatePmuWood(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/wood/update.php`,
      data
    );
  }

  deletePmuWood(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/wood/delete.php`,
      data
    );
  }

  // ---------- PMU PLYWOOD ----------
  addPmuPlywood(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/plywood/add.php`,
      data
    );
  }

  getPmuPlywoodList(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/plywood/list.php`,
      { firm_code: firmCode }
    );
  }

  updatePmuPlywood(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/plywood/update.php`, data);
  }

  deletePmuPlywood(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/plywood/delete.php`, data);
  }


  // ---------- PMU TEAM LEDGER ----------
  addPmuTeamLedger(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/team-payments/add.php`,
      data
    );
  }

  getPmuTeamLedgerList(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/team-payments/list.php`,
      { firm_code: firmCode }
    );
  }

  // ---------- CRUD OPERATIONS----------
  updatePmuTeamLedger(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/team-payments/update.php`, data);
  }

  deletePmuTeamLedger(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/team-payments/delete.php`, data);
  }

  // ---------- PMU ACCESSORIES ----------
  addPmuAccessories(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/accessories/add.php`,
      data
    );
  }

  getPmuAccessoriesList(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/accessories/list.php`,
      { firm_code: firmCode }
    );
  }

  // ---------- CRUD OPERATIONS----------
  updatePmuAccessories(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/accessories/update.php`, data);
  }

  deletePmuAccessories(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/accessories/delete.php`, data);
  }


  // ---------- PMU ASSET LEDGER ----------
  addPmuAsset(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/asset-ledger/add.php`,
      data
    );
  }

  getPmuAssetList(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/asset-ledger/list.php`,
      { firm_code: firmCode }
    );
  }

  // ----------- CRUD OPERATIONS----------
  updatePmuAsset(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/asset-ledger/update.php`, data);
  }

  deletePmuAsset(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/asset-ledger/delete.php`, data);
  }

  // ---------- PMU LABOUR ----------
  addPmuLabour(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/labour/add.php`,
      data
    );
  }

  getPmuLabourList(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/labour/list.php`,
      { firm_code: firmCode }
    );
  }


  // UPDATE
  updatePmuLabour(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/labour/update.php`,
      data
    );
  }

  // DELETE
  deletePmuLabour(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/labour/delete.php`, data
    );
  }



  // ---------- PMU OTHER EXPENSE ----------
  addPmuOtherExpense(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/other-expense/add.php`,
      data
    );
  }

  getPmuOtherExpenseList(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/other-expense/list.php`,
      { firm_code: firmCode }
    );
  }


  updatePmuOtherExpense(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/other-expense/update.php`, data);
  }

  deletePmuOtherExpense(data: any) {
    return this.http.post(`${this.baseUrl}/modules/pmu/other-expense/delete.php`, data);
  }


  // ---------- PMU REPORTS METHODS ----------
  /* ===================== REPORTS ===================== */

  getAccessoriesReport(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/accessories.php`,
      { firm_code: firmCode });
  }

  getAssetReport(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/assets.php`,
      { firm_code: firmCode });
  }

  getLabourReport(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/labour.php`,
      { firm_code: firmCode });
  }

  getWoodReport(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/wood.php`,
      { firm_code: firmCode });
  }

  getPlywoodReport(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/plywood.php`,
      { firm_code: firmCode });
  }

  getTeamLedgerReport(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/team.php`,
      { firm_code: firmCode });
  }

  getOtherExpenseReport(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/other-expense.php`, { firm_code: firmCode });
  }

  getAllExpenseSummary(firmCode: string) {
    return this.http.post(`${this.baseUrl}/modules/pmu/reports/all-expenses.php`,
      { firm_code: firmCode });
  }


  // PMU COT DELIVERY




  addPmuCotDelivery(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/cot_delivery/add.php`,
      data
    );
  }

  getPmuCotDeliveryList(firmCode: string) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/cot_delivery/list.php`,
      { firm_code: firmCode }
    );
  }

  updatePmuCotDelivery(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/cot_delivery/update.php`,
      data
    );
  }

  deletePmuCotDelivery(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/cot_delivery/delete.php`,
      data
    );
  }



  // PMU TEAMS
  addPmuTeam(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/teams/add.php`,
      data
    )
  }


  updatePmuTeam(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/teams/update.php`,
      data
    )

  }


  deletePmuTeam(data: any ) {
    return this.http.post(
      `${this.baseUrl}/modules/pmu/teams/delete.php`,
      data
    )
  }
}