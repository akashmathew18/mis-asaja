import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Pmu } from '../../../core/services/pmu';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-pmu-team-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './team-ledger.html',
  styleUrl: './team-ledger.css',
})

export class PmuTeamLedger implements OnInit {

  firmCode!: string;

  teamName = '';
  search = '';
  fromDate = '';
  toDate = '';

  teams: any[] = [];
  ledger: any[] = [];


  filteredLedger: any[] = [];
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  totalRecords = 0;

  teamSearchText = '';

  constructor(
    private route: ActivatedRoute,
    private pmu: Pmu,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;
    this.loadTeams();
    this.loadLedger();
  }

  loadTeams() {
    this.pmu.getPmuTeams(this.firmCode).subscribe((r: any) => {
      if (r.success) this.teams = r.data;
      this.cdr.markForCheck();
    });
  }

  loadLedger() {
    this.pmu.getTeamLedger({
      firm_code: this.firmCode,
      team_name: this.teamName || undefined,
      search: this.search || undefined,
      from_date: this.fromDate || undefined,
      to_date: this.toDate || undefined
    }).subscribe((r: any) => {
      if (r.success) {
        this.ledger = r.data || [];
        this.applyPagination();
      }
      this.cdr.markForCheck();
    });
  }

  clearFilters() {
    this.teamName = '';
    this.teamSearchText = '';
    this.search = '';
    this.fromDate = '';
    this.toDate = '';
    this.loadLedger();
  }

  hasFilters(): boolean {
    return !!(this.teamName || this.search || this.fromDate || this.toDate);
  }


  finalBalance(): number {
    if (!this.ledger.length) return 0;
    return Number(this.ledger[this.ledger.length - 1].balance || 0);
  }



  applyPagination() {
    this.totalRecords = this.ledger.length;
    this.totalPages = Math.ceil(
      this.totalRecords / this.itemsPerPage
    );

    const start =
      (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredLedger =
      this.ledger.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }



  onTeamFilterChange(value: string) {
    this.teamSearchText = value;
    this.teamName = value;
    this.loadLedger();
  }

  exportExcel() {

    const data = this.ledger.map((x: any) => ({

      Date: x.entry_date,

      Transaction_ID: x.transaction_id,

      Team: x.team_name,

      Particulars: x.particulars,

      Remarks: x.remarks,

      Credit: x.credit,

      Debit: x.debit,

      Balance: x.balance
    }));

    const ws: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(data);

    const wb: XLSX.WorkBook = {
      Sheets: { Ledger: ws },
      SheetNames: ['Ledger']
    };

    const excelBuffer =
      XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array'
      });

    const blob = new Blob(
      [excelBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

    saveAs(blob, 'team-ledger.xlsx');
  }


  exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Team Ledger Report', 14, 15);
    autoTable(doc, {
      startY: 25,

      head: [[
        'Date',
        'Txn ID',
        'Team',
        'Particulars',
        'Remarks',
        'Credit',
        'Debit',
        'Balance'
      ]],
      body: this.ledger.map((x: any) => [
        x.entry_date,
        x.transaction_id,
        x.team_name,
        x.particulars,
        x.remarks,
        x.credit,
        x.debit,
        x.balance
      ])
    });

    doc.save('team-ledger.pdf');
  }


}