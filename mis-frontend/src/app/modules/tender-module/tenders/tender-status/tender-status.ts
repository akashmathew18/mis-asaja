
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {TenderService} from '../../../../core/services/tender-services';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-tenders-tender-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tender-status.html',
  styleUrl: './tender-status.css'
})
export class TenderStatus implements OnInit {

  tenderId!: string;
  tender: any = {};

  firmCode!: string;

  statusLog: any[] = [];
  latestDeliveryDueDate: string = '';

  pendingItems: any[] = [];
  billingItems: any[] = [];

  //--------------- ITEM SUMMARY ------------------
  totalItemsText: string = '';
  deliveredSummary: string = '';
  pendingSummary: string = '';

  totalExpenses: number = 0;

  statuses: any[] = [];
  allowedStatuses: any[] = [];

  //--------------- FORM MODEL ------------------
  form: any = {

    status_code: '',
    remarks: '',

    rejection_reason: '',
    tender_confirmed_date: '',
    sample_due_date: '',
    sample_submission_date: '',
    sample_expense: 0,

    negotiated_amount: '',
    negotiation_date: '',

    negotiation_rejected_date: '',
    negotiation_rejection_reason: '',
    negotiation_confirmed_date: '',

    supply_issue_datetime: '',
    item_delivery_due_date: '',
    secondary_agreement_option: 'No',
    secondary_agreement_date: '',

    billed_date: '',
    delivery_date: '',
    supply_expense: 0,

    supplied_status: '',


    payment_received_date: '',
    payment_received_amount: '',
    tds_amount: '',
    emd_rd_option: 'null',
    emd_rd_holder: '',
    emd_rd_amount: '',
    emd_expiry_date: '',
    payment_status: 'Complete',

    total_amount: 0,
    balance_amount: 0
  };

  constructor(
    private route: ActivatedRoute,
    private backend: TenderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService
  ) { }


  todayMaxDate(): string {

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const dd = ('0' + d.getDate()).slice(-2);

    return `${yyyy}-${mm}-${dd}`;
  }
  //--------------- INIT ------------------
  ngOnInit() {
    this.tenderId = this.route.snapshot.paramMap.get('tenderId')!;
    this.firmCode = this.route.parent?.snapshot.paramMap.get('firmCode')!;
    this.loadTender();
  }

  /* =========================================================
    NAVIGATION
 ========================================================= */
  goEntry() {

    const firmCode = this.route.parent?.snapshot.paramMap.get('firmCode');

    this.router.navigate([
      `/firms/${firmCode}/tender-module/tender-entry`
    ]);
  }

  golist() {

    const firmCode = this.route.parent?.snapshot.paramMap.get('firmCode');
    this.router.navigate([
      `/firms/${firmCode}/tender-module/tender-list`
    ]);
  }


  //--------------- LOAD HEADER ------------------
  loadTender() {
    this.backend.getTenderOne({
      tender_id: this.tenderId,
      firm_code: this.firmCode
    })
      .subscribe((r: any) => {

        if (!r.success) return;

        this.tender = r.data;

        this.backend.getTenderItems({
          tender_id: this.tenderId,
          firm_code: this.firmCode
        }).subscribe((res: any) => {

          this.form.items = (res.data || []).map((x: any) => ({
            item_name: x.item_name,
            quantity: Number(x.quantity || 0),
            rate_per_piece: Number(x.rate_per_piece || 0),
            purchase_price: 0
          }));

          this.calcSupplyTotals();
        });

        //--------------- IMPORTANT ORDER FIX ------------------
        this.loadPendingItems();
        this.loadLog();
        this.loadStatuses();

        this.cdr.markForCheck();
      });
  }

  //--------------- LOAD PENDING ITEMS ------------------
  loadPendingItems() {

    this.backend.getPendingItems({
      tender_id: this.tenderId,
      firm_code: this.firmCode
    })
      .subscribe((r: any) => {

        // ✅ VERY IMPORTANT FIX
        if (!r || !r.success || !Array.isArray(r.data)) {

          // Prevent UI break if API returns null
          this.pendingItems = [];
          this.billingItems = [];
          this.totalItemsText = '';
          this.deliveredSummary = '';
          this.pendingSummary = '';

          this.cdr.markForCheck();
          return;
        }

        this.pendingItems = r.data || [];

        // ================= SUPPLY ACCURACY =================
        let totalOrdered = 0;
        let totalDelivered = 0;

        this.pendingItems.forEach((it: any) => {
          totalOrdered += Number(it.pending_qty || 0) + Number(it.delivered_qty || 0);
          totalDelivered += Number(it.delivered_qty || 0);
        });

        this.tender.total_ordered_qty = totalOrdered;
        this.tender.total_delivered_qty = totalDelivered;
        this.tender.supply_completion =
          totalOrdered > 0 ? ((totalDelivered / totalOrdered) * 100).toFixed(1) : 0;

        this.billingItems = this.pendingItems.map((it: any) => ({
          item_name: it.item_name,
          pending_qty: Number(it.pending_qty || 0),
          delivered_qty: Number(it.delivered_qty || 0),
          total_qty: Number(it.pending_qty || 0) + Number(it.delivered_qty || 0),
          supply_qty: 0
        }));



        this.rebuildItemHeader();
        this.cdr.markForCheck();
      });
  }


  //--------------- STATUS LOG ------------------
  loadLog() {

    this.backend.getTenderStatusLog({
      tender_id: this.tenderId,
      firm_code: this.firmCode
    })
      .subscribe((r: any) => {

        if (!r.success) return;

        this.statusLog = r.data || [];

        let totalReceived = 0;
        let totalTDS = 0;
        let totalEMD = 0;

        let emdOption = 'No';
        let emdHolder = '';
        let emdExpiry = '';

        //--------------- PAYMENT AGGREGATION ------------------
        for (const x of this.statusLog) {

          totalReceived += Number(x.payment_received_amount || 0);
          totalTDS += Number(x.tds_amount || 0);

          if (x.emd_rd_option === 'Yes') {
            emdOption = 'Yes';
            emdHolder = x.emd_rd_holder || emdHolder;
            emdExpiry = x.emd_expiry_date || emdExpiry;
            totalEMD += Number(x.emd_rd_amount || 0);
          }
        }

        this.tender.payment_received_amount = totalReceived;
        this.tender.tds_amount = totalTDS;
        this.tender.emd_rd_option = emdOption;
        this.tender.emd_rd_holder = emdHolder;
        this.tender.emd_rd_amount = totalEMD;
        this.tender.emd_expiry_date = emdExpiry;

        //====================================================
        // ✅ PRO TOTAL EXPENSE ENGINE
        //====================================================

        const doc = Number(this.tender.documentation_fee || 0);
        const proc = Number(this.tender.processing_fee || 0);
        const stamp = Number(this.tender.stamp_paper_fee || 0);
        const misc = Number(this.tender.expense_amount || 0);

        let sampleTotal = 0;
        let supplyTotal = 0;

        for (const x of this.statusLog) {
          sampleTotal += Number(x.sample_expense || 0);
          supplyTotal += Number(x.supply_expense || 0);
        }

        this.totalExpenses =
          doc + proc + stamp + misc + sampleTotal + supplyTotal;

        //====================================================
        // BALANCE ENGINE
        //====================================================

        const receivable =
          Number(this.tender.final_total) > 0
            ? Number(this.tender.final_total)
            : Number(this.tender.negotiated_amount) > 0
              ? Number(this.tender.negotiated_amount)
              : Number(this.tender.quoted_amount);

        this.tender.balance_amount =
          receivable - (totalReceived + totalTDS + totalEMD);

        for (const x of this.statusLog) {

          if (x.billed_date && !this.form.billed_date) {
            this.form.billed_date = x.billed_date;
          }
        }

        if (this.tender.balance_amount < 0) {
          this.tender.balance_amount = 0;
        }

        this.cdr.markForCheck();

      });
  }

  //--------------- STATUS FLOW ENGINE ------------------
  loadStatuses() {

    this.backend.getTenderStatuses().subscribe((r: any) => {

      if (!r.success) return;

      const selectable = [
        'TS-03', 'TS-04', 'TS-05', 'TS-06', 'TS-07',
        'TS-10', 'TS-11',
        'TS-13', 'TS-15', 'TS-17', 'TS-20'
      ];

      this.statuses = r.data.filter((s: any) => selectable.includes(s.status_code));

      const flowMap: any = {

        'TS-01': ['TS-03', 'TS-04'],
        'TS-02': ['TS-03', 'TS-04'],

        'TS-04': ['TS-05', 'TS-06', 'TS-07'],
        'TS-05': ['TS-06', 'TS-20'],
        'TS-06': ['TS-07', 'TS-20'],

        // negotiation directly goes to supply
        'TS-07': ['TS-10'],

        // supply
        'TS-10': ['TS-11', 'TS-13', 'TS-15'],
        'TS-11': ['TS-13', 'TS-14'],

        'TS-13': ['TS-15'],
        'TS-14': ['TS-15'],

        'TS-15': ['TS-17'],
        'TS-16': ['TS-17']
      };

      const allowedCodes = flowMap[this.tender.status_code] || [];
      this.allowedStatuses = this.statuses.filter((s: any) =>
        allowedCodes.includes(s.status_code)
      );

      this.cdr.markForCheck();
    });
  }





  //====================================================
  // ITEM HEADER (LIVE CALCULATION)
  //====================================================
  rebuildItemHeader() {

    const totalArr: string[] = [];
    const deliveredArr: string[] = [];
    const pendingArr: string[] = [];

    for (const it of this.billingItems) {

      const total = Number(it.total_qty || 0);

      // existing delivered from DB
      const deliveredBase = Number(it.delivered_qty || 0);

      // new typing qty
      const newSupply = Number(it.supply_qty || 0);

      const deliveredNow = deliveredBase + newSupply;
      const pendingNow = total - deliveredNow;

      if (total > 0) {
        totalArr.push(`${it.item_name} - ${total}`);
      }

      if (deliveredNow > 0) {
        deliveredArr.push(`${it.item_name} - ${deliveredNow}`);
      }

      if (pendingNow > 0) {
        pendingArr.push(`${it.item_name} - ${pendingNow}`);
      }
    }

    this.totalItemsText = totalArr.join(', ');
    this.deliveredSummary = deliveredArr.join(', ');
    this.pendingSummary = pendingArr.join(', ');

    this.cdr.markForCheck();
  }


  //--------------- PAYMENT CALCULATION ENGINE ------------------
  calculatePayment() {

    const lastPaymentLog = this.statusLog.find((x: any) =>
      ['TS-13', 'TS-14', 'TS-15', 'TS-16'].includes(x.final_status)
    );

    let baseAmount = 0;

    if (lastPaymentLog && Number(lastPaymentLog.balance_amount) > 0) {
      baseAmount = Number(lastPaymentLog.balance_amount);
    } else {
      const baseAmount =
        Number(this.tender.balance_amount) > 0
          ? Number(this.tender.balance_amount)
          : Number(this.tender.final_total) > 0
            ? Number(this.tender.final_total)
            : Number(this.tender.negotiated_amount) > 0
              ? Number(this.tender.negotiated_amount)
              : Number(this.tender.quoted_amount);
    }

    const received = Number(this.form.payment_received_amount) || 0;
    const tds = Number(this.form.tds_amount) || 0;

    let emd = 0;
    if (this.form.emd_rd_option === 'Yes') {
      emd = Number(this.form.emd_rd_amount) || 0;
    }

    const deduct = received + tds + emd;

    this.form.total_amount = baseAmount;
    this.form.balance_amount = baseAmount - deduct;
    this.form.payment_status = this.form.balance_amount > 0 ? 'Partial' : 'Complete';

    this.cdr.markForCheck();
  }


  //--------------- SUPPLY CALCULATION ENGINE ------------------
  calculateSupplyStatus() {

    let totalQty = 0;
    let deliveredQty = 0;

    for (const it of this.billingItems) {

      const baseTotal = Number(it.total_qty || 0);
      const existingDelivered = Number(it.delivered_qty || 0);
      const newSupply = Number(it.supply_qty || 0);

      totalQty += baseTotal;
      deliveredQty += existingDelivered + newSupply;
    }

    //--------------- AUTO SUPPLIED STATUS ------------------
    this.form.supplied_status =
      deliveredQty >= totalQty ? 'Complete' : 'Partial';

    this.cdr.markForCheck();
  }



  validateSupplyQty(it: any) {

    const entered = Number(it.supply_qty || 0);
    const pending = Number(it.pending_qty || 0);

    if (entered < 0) {
      it.supply_qty = 0;
    }

    if (entered > pending) {
      alert(`Quantity for ${it.item_name} must not exceed ${pending}`);
      it.supply_qty = pending;
    }

    // VERY IMPORTANT
    this.calculateSupplyStatus();
    this.rebuildItemHeader();

    this.cdr.markForCheck();
  }


  resetForm() {

    this.form.status_code = '';
    this.form.remarks = '';

    this.form.items_total = 0;
    this.form.work_total = 0;
    this.form.grand_total = 0;

    this.form.payment_received_amount = '';
    this.form.tds_amount = '';
    this.form.emd_rd_option = 'null';
    this.form.emd_rd_holder = '';
    this.form.emd_rd_amount = '';
    this.form.emd_expiry_date = '';

  }


  //--------------- SAVE ------------------
  save() {

    if (!this.form.status_code) {
      alert('Select status');
      return;
    }

    const payload: any = {
      tender_id: this.tenderId,
      firm_code: this.firmCode,
      created_by: this.auth.getUserid(),
      ...this.form
    };


    if (this.form.status_code === 'TS-10') {

      payload.items = this.form.items || [];
      payload.additionalWorks = this.form.additionalWorks || [];
      payload.final_total = this.form.final_total;
    }

    //--------------- BILLING ENGINE ------------------
    if (this.form.status_code === 'TS-15') {

      const supplied: any[] = [];
      let allCompleted = true;
      let hasSupply = false;

      for (const it of this.billingItems) {

        const qty = Number(it.supply_qty);

        if (qty > 0) {
          hasSupply = true;
          supplied.push({
            item_name: it.item_name,
            supplied_qty: qty
          });
        }

        const actual = Number(it.pending_qty) + Number(it.delivered_qty);
        const newDelivered = Number(it.delivered_qty) + qty;

        if (newDelivered < actual) {
          allCompleted = false;
        }
      }

      if (!hasSupply) {
        alert('Enter supply quantity');
        return;
      }

      //--------------- AUTO SUPPLY STATUS ------------------
      this.form.supplied_status = allCompleted ? 'Complete' : 'Partial';

      payload.billingItems = supplied;
      payload.remarks = JSON.stringify(supplied);

      if (!this.form.billed_date && this.tender.billed_date) {
        this.form.billed_date = this.tender.billed_date;
      }
    }


    //--------------- PAYMENT VALIDATION ------------------
    if (this.form.status_code === 'TS-17') {

      const baseAmount = Number(this.form.total_amount) || 0;

      const received = Number(this.form.payment_received_amount) || 0;
      const tds = Number(this.form.tds_amount) || 0;
      const emd = this.form.emd_rd_option === 'Yes'
        ? Number(this.form.emd_rd_amount) || 0
        : 0;

      const total = received + tds + emd;

      if (total > baseAmount) {
        alert('Received + TDS + EMD cannot exceed Pending Amount');
        return;
      }
    }

    //--------------- SAVE CALL ------------------
    this.backend.updateTenderStatus(payload)
      .subscribe((res: any) => {

        if (!res.success) {
          alert(res.message || 'Update failed');
          return;
        }

        this.loadTender();
        this.loadLog();
        this.loadPendingItems();

        this.resetForm();

        this.cdr.markForCheck();
      });
  }


  isFormValid(): boolean {

    if (!this.form.status_code) return false;

    const today = this.todayMaxDate();

    switch (this.form.status_code) {

      case 'TS-03':
        return !!this.form.tender_rejection_date &&
          !!this.form.rejection_reason;

      case 'TS-04':
        return !!this.form.tender_confirmed_date;

      case 'TS-05':
        return !!this.form.sample_due_date;

      case 'TS-06':
        return !!this.form.sample_submission_date &&
          this.form.sample_expense > 0;

      case 'TS-07':
        return !!this.form.negotiation_date &&
          !!this.form.negotiated_amount;


      case 'TS-10':
        return !!this.form.supply_issue_datetime;

      case 'TS-11':
        return !!this.form.secondary_agreement_date;


      case 'TS-13':
        return !!this.form.billed_date;

      case 'TS-15':
        return !!this.form.billed_date &&
          !!this.form.delivery_date;

      case 'TS-17':
        return !!this.form.payment_received_date &&
          this.form.payment_received_amount > 0;

      case 'TS-20':
        return !!this.form.sample_rejected_date &&
          !!this.form.sample_rejection_reason;

    }

    return true;
  }

  // ====================== TIMELINE SECTION =========================

  getTimelineData(l: any) {


    const initialExpense =
      Number(this.tender.documentation_fee || 0) +
      Number(this.tender.processing_fee || 0) +
      Number(this.tender.stamp_paper_fee || 0) +
      Number(this.tender.expense_amount || 0);


    switch (l.final_status) {

      case 'TS-01':
      case 'TS-02':
        return {
          title: 'Tender Submitted',
          lines: [
            'Submission Date: ' + this.tender.tender_date,
            'Type: ' + this.tender.tender_type,
            'Initial Expense: ₹' + initialExpense,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-03':
        return {
          title: 'Tender Rejected',
          lines: [
            'Rejection Date: ' + l.tender_rejection_date,
            'Reason: ' + l.rejection_reason,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-04':
        return {
          title: 'Tender Confirmed',
          lines: [
            'Confirmation Date: ' + l.tender_confirmed_date,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-05':
        return {
          title: 'Sample Submission Due',
          lines: [
            'Due Date: ' + l.tender_confirmed_date,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')]
        };

      case 'TS-06':
        return {
          title: 'Sample Submitted',
          lines: [
            'Submission Date: ' + l.sample_submission_date,
            'Expense: ₹' + l.sample_expense,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-07':
        return {
          title: 'Tender Negotiated',
          lines: [
            'Negotiation Date: ' + l.negotiation_date,
            'Quoted: ₹' + l.quoted_amount,
            'Negotiated: ₹' + l.negotiated_amount,
            'Remarks: ' + l.remarks,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-10':
        return {
          title: 'Supply Order Issued (Execution Started)',
          lines: [
            'Issued Date: ' + l.supply_issue_datetime,
            'Delivery Due: ' + l.item_delivery_due_date,
            'Final Total: ₹' + l.final_total,
            'Agreement: ' + (l.secondary_agreement_date ? 'Yes' : 'No'),
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-11':
        return {
          title: 'Secondary Agreement Submission',
          lines: [
            'Submission Date: ' + l.secondary_agreement_date,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-13':
        return {
          title: 'Billed- No Supply',
          lines: [
            'Billed Date: ' + l.billed_date,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-14':

        return {
          title: 'Billed, Item Supplied (Partially)',
          lines: [
            'Billed Date: ' + l.billed_date,
            'Delivery Date: ' + l.delivery_date,
            'Delivery Expense: ₹' + l.supply_expense,
            'Supply Type: ' + l.supplied_type,
            'Items Delivered: ' + l.deliveredSummary,
            'Items Pending: ' + (l.pendingSummary || 'None'),
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-15':
        return {
          title: 'Billed, Item Supplied (Complete)',
          lines: [
            'Billed Date: ' + l.billed_date,
            'Delivery Date: ' + l.delivery_date,
            'Delivery Expense: ₹' + l.supply_expense,
            'Supply Type: ' + l.supplied_type,
            'Items Delivered: ' + (l.deliveredSummary || 'Updated'),
            'Items Pending: ' + l.pendingSummary,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-16':
        return {
          title: 'Payment Received (Partial)',
          lines: [
            'Received Date: ' + l.payment_received_date,
            'Payment Type: ' + l.payment_type,
            'Total Amount: ₹' + (this.tender.final_total || this.tender.negotiated_amount),
            'Received: ₹' + l.payment_received_amount,
            'TDS: ₹' + l.tds_amount,
            'EMD/RD: ₹' + (l.emd_rd_option === 'Yes' ? l.emd_rd_amount : 'N/A'),
            'EMD/RD expiry: ' + (l.emd_rd_option === 'Yes' ? l.emd_expiry_date : 'N/A'),
            'EMD/RD Holder: ' + (l.emd_rd_option === 'Yes' ? l.emd_rd_holder : 'N/A'),
            'Pending: ₹' + l.balance_amount,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-17':
        return {
          title: 'Payment Received (Complete)',

          lines: [
            'Received Date: ' + l.payment_received_date,
            'Payment Type: ' + l.payment_type,
            'Total Amount: ₹' + (this.tender.final_total || this.tender.negotiated_amount),
            'Received: ₹' + l.payment_received_amount,
            'TDS: ₹' + l.tds_amount,
            'EMD/RD: ₹' + (l.emd_rd_option === 'Yes' ? l.emd_rd_amount : 'N/A'),
            'EMD/RD expiry: ' + (l.emd_rd_option === 'Yes' ? l.emd_expiry_date : 'N/A'),
            'EMD/RD Holder: ' + (l.emd_rd_option === 'Yes' ? l.emd_rd_holder : 'N/A'),
            'Pending: ₹' + l.balance_amount,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-18':
        return {
          title: 'ON Emd Hold',
          lines: [
            'EMD/RD: ₹' + (l.emd_rd_option === 'Yes' ? this.tender.emd_rd_amount : 'N/A'),
            'EMD/RD date: ' + l.payment_received_date,
            'EMD/RD expiry: ' + (l.emd_rd_option === 'Yes' ? l.emd_expiry_date : 'N/A'),
            'EMD/RD Holder: ' + (l.emd_rd_option === 'Yes' ? this.tender.emd_rd_holder : 'N/A'),
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };

      case 'TS-19':
        return {
          title: 'Project Closed',
          lines: [
          ]
        };

      case 'TS-20':
        return {
          title: 'Sample Rejected',
          lines: [
            'Rejection Date: ' + l.sample_rejected_date,
            'Reason: ' + l.sample_rejection_reason,
            'Entry Date: ' + (l.created_at ? l.created_at.split(' ')[0] : '')
          ]
        };


      default:
        return {
          title: l.final_status,
          lines: []
        };

    }
  }



  calcSupplyTotals() {

    let itemsTotal = 0;
    let workTotal = 0;

    (this.form.items || []).forEach((i: any) => {
      itemsTotal += (Number(i.quantity) || 0) * (Number(i.rate_per_piece) || 0);
    });

    (this.form.additionalWorks || []).forEach((w: any) => {
      workTotal += (Number(w.quantity) || 0) * (Number(w.rate) || 0);
    });

    this.form.grand_total = itemsTotal + workTotal;

    // AUTO FILL FINAL TOTAL
    this.form.final_total = this.form.grand_total;
  }


  addItem() {
    this.form.items.push({
      item_name: '',
      quantity: 0,
      rate_per_piece: 0,
      purchase_price: 0
    });
  }

  removeItem(i: number) {
    this.form.items.splice(i, 1);
  }

  addWork() {
    this.form.additionalWorks.push({
      work_name: '',
      quantity: 0,
      rate: 0
    });
  }

  removeWork(i: number) {
    this.form.additionalWorks.splice(i, 1);
  }

}