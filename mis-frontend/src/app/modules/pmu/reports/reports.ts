import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Pmu } from '../../../core/services/pmu';

// PDF & Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-pmu-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html'
})
export class PmuReports implements OnInit {

  firmCode!: string;

  wood: any[] = [];
  plywood: any[] = [];
  labour: any[] = [];
  accessories: any[] = [];
  assets: any[] = [];
  teamLedger: any[] = [];
  otherExpense: any[] = [];

  grandTotal = 0;

  constructor(
    private route: ActivatedRoute,
    private pmu: Pmu,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;
    this.loadAll();

  }

  /* ---------- LOAD ALL REPORTS ---------- */
  /* ---------- LOAD ALL REPORTS ---------- */
  loadAll() {

    // -------- WOOD --------
    this.pmu.getWoodReport(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.wood = res.data;
        this.cdr.markForCheck();
      }
    });

    // -------- PLYWOOD --------
    this.pmu.getPlywoodReport(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.plywood = res.data;
        this.cdr.markForCheck();
      }
    });

    // -------- LABOUR --------
    this.pmu.getLabourReport(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.labour = res.data;
        this.cdr.markForCheck();
      }
    });

    // -------- ACCESSORIES --------
    this.pmu.getAccessoriesReport(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.accessories = res.data;
        this.cdr.markForCheck();
      }
    });

    // -------- ASSETS --------
    this.pmu.getAssetReport(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.assets = res.data;
        this.cdr.markForCheck();
      }
    });

    // -------- TEAM LEDGER --------
    this.pmu.getTeamLedgerReport(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.teamLedger = res.data;
        this.cdr.markForCheck();
      }
    });

    // -------- OTHER EXPENSE --------
    this.pmu.getOtherExpenseReport(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.otherExpense = res.data;
        this.cdr.markForCheck();
      }
    });

    // -------- GRAND TOTAL --------
    this.pmu.getAllExpenseSummary(this.firmCode).subscribe((res: any) => {
      if (res.success) {
        this.grandTotal = res.data.grand_total;
        this.cdr.markForCheck();
      }
    });

  }


  /* ---------- UTIL ---------- */
  sum(list: any[], key: string): number {
    const total = list.reduce((a, b) => a + Number(b[key] || 0), 0);
    return Math.round(total * 100) / 100;
  }

  /* ---------- EXPORT HELPERS ---------- */
  private exportPDF(title: string, data: any[]) {
    const doc = new jsPDF();
    doc.text(title, 14, 10);

    if (data.length) {
      autoTable(doc, {
        startY: 20,
        head: [Object.keys(data[0])],
        body: data.map(o => Object.values(o))
      });
    }

    doc.save(`${title}.pdf`);
  }

  private exportExcel(sheetName: string, data: any[]) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}.xlsx`);
  }

  /* ---------- EXPORT ALL ---------- */
  exportAllPDF() {
    this.exportPDF('PMU-All-Reports', [
      ...this.wood,
      ...this.plywood,
      ...this.labour,
      ...this.accessories,
      ...this.assets,
      ...this.teamLedger,
      ...this.otherExpense
    ]);
  }

  /* ---------- INDIVIDUAL EXPORTS ---------- */
  exportWoodPDF() { this.exportPDF('Wood-Expense', this.wood); }
  exportWoodExcel() { this.exportExcel('Wood-Expense', this.wood); }

  exportPlywoodPDF() { this.exportPDF('Plywood-Purchase', this.plywood); }
  exportPlywoodExcel() { this.exportExcel('Plywood-Purchase', this.plywood); }

  exportLabourPDF() { this.exportPDF('Labour-Cost', this.labour); }
  exportLabourExcel() { this.exportExcel('Labour-Cost', this.labour); }

  exportAccessoriesPDF() { this.exportPDF('Accessories-Purchase', this.accessories); }
  exportAccessoriesExcel() { this.exportExcel('Accessories-Purchase', this.accessories); }

  exportAssetsPDF() { this.exportPDF('Asset-Ledger', this.assets); }
  exportAssetsExcel() { this.exportExcel('Asset-Ledger', this.assets); }

  exportTeamLedgerPDF() { this.exportPDF('Team-Ledger', this.teamLedger); }
  exportTeamLedgerExcel() { this.exportExcel('Team-Ledger', this.teamLedger); }

  exportOtherExpensePDF() { this.exportPDF('Other-Expense', this.otherExpense); }
  exportOtherExpenseExcel() { this.exportExcel('Other-Expense', this.otherExpense); }
}