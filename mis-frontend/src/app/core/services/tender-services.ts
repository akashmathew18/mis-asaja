import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from './common';

@Injectable({
  providedIn: 'root'
})
export class TenderService {

  // ================= BASE URL =================
  private baseUrl = '';

  constructor(private http: HttpClient, private common: CommonService) {
    this.baseUrl = common.baseUrl;
  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  getDashboardTotals(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/dashboard/dashboard-totals.php`,
      data
    )

  }


  getExpenseTitleList(firmCode: string) {
    return this.http.post<any>(
      `${this.baseUrl}/modules/pmu/other-expense/expense_master.php`,
      {
        firm_code: firmCode
      }
    );
  }

  // =========================================================
  // MASTERS
  // =========================================================

  getOrganizations(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/modules/tender-module/masters/organizations/list.php`
    );
  }

  getExecutives(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/modules/tender-module/masters/executives/list.php`
    );
  }


  searchDivisions(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/masters/divisions/search.php`,
      data
    );
  }


  searchDepartments(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/masters/departments/search.php`,
      data
    );
  }



  // =========================================================
  // TENDER ENTRY
  // =========================================================

  addTender(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/add.php`,
      data
    );
  }

  // =========================================================
  getTenderOne(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/status/get-one.php`,
      data
    );
  }



  getActivatedTenders(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/activated/list.php`,
      data
    );
  }

  updateActivatedTender(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/activated/action.php`,
      data
    );
  }

  getActivatedDetail(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/activated/detail.php`,
      data
    );
  }




  // tenders/get_tender_items.php
  // =========================================================
  getTenderItems(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/get_tender_items.php`,
      data
    );
  }


  // status/get-pending-items.php
  // =========================================================
  getPendingItems(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/status/get-pending-items.php`,
      data
    );
  }


  getTenderStatusLog(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/status/status-log.php`,
      data
    );
  }


  getTenderStatuses(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/modules/tender-module/status/list.php`
    );
  }


  updateTenderStatus(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/status/update-status.php`,
      data
    );
  }





  //================ UPCOMING TENDERS =================


  saveUpcoming(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/upcoming/add.php`, data);
  }


  getUpcoming(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/upcoming/list.php`,
      data
    );
  }

  getUpcomingDetails(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/upcoming/get-one.php`,
      data
    );
  }

  terminateUpcoming(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/upcoming/terminate.php`, data);
  }

  activateUpcoming(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/upcoming/activate.php`, data);
  }


  updateUpcoming(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/upcoming/update.php`,
      data
    );
  }


  //================ TENDERS  LIST=================

  getTenderList(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/list.php`,
      data
    )
  }

  viewTender(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/view.php`,
      data
    )
  }

  deleteTender(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/delete.php`,
      data
    )
  }


  updateTender(data: any) {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/update.php`,
      data
    )
  }

  // =========================================================
  // SUPPLY ORDERS
  // =========================================================

  getSupplyOrders(data: any) {

    return this.http.post(
      `${this.baseUrl}/modules/tender-module/tenders/get_supply_orders.php`,
      data
    );

  }

  // =========================================================
  // OTHER EXPENSES
  // =========================================================

  getExpenseTitles(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/modules/tender-module/masters/expense-title-master/list.php`
    );
  }

  getOtherExpenses(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/other-expense/list.php`,
      data
    );
  }

  addOtherExpense(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/other-expense/add.php`,
      data
    );
  }

  updateOtherExpense(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/other-expense/update.php`,
      data
    );
  }

  deleteOtherExpense(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modules/tender-module/other-expense/delete.php`,
      data
    );
  }


  /* =========================================================
     EXPENSE LEDGER
  ========================================================= */

  getExpenseLedger(data: any) {

    return this.http.post(

      `${this.baseUrl}/modules/tender-module/expenses/get_expense_ledger.php`,
      data

    );

  }

  /* =========================================================
     ADD TENDER EXPENSE
  ========================================================= */

  addTenderExpense(data: any) {

    return this.http.post(

      `${this.baseUrl}/modules/tender-module/expenses/add-expense.php`,
      data

    );

  }



  /* =========================================================
   RECEIVABLES
========================================================= */

  getReceivables(data: any) {

    return this.http.post(

      `${this.baseUrl}/modules/tender-module/finance/get_receivables.php`,
      data

    );

  }


}