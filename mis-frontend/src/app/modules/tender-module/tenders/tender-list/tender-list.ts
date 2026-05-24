
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TenderService } from '../../../../core/services/tender-services';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tenders-tender-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tender-list.html',
  styleUrl: './tender-list.css'
})
export class TenderList implements OnInit {

  tenders: any[] = [];
  loading = false;


  selectedTender: any;
  officials: any[] = [];
  items: any[] = [];

  isEditMode = false;
  originalTender: any = null;

  timeline: any[] = [];


  tenderLogs: any[] = [];
  showViewCard = false;


  activeTab: string = 'awaiting';

  objectKeys = Object.keys;

  isAmount(key: string): boolean {
    return key.toLowerCase().includes('amount');
  }

  constructor(
    private backend: TenderService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  //--------------- INIT ------------------
  ngOnInit() {
    this.load();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  getCurrentList() {
    switch (this.activeTab) {

      case 'ongoing':
        return this.getOngoing();

      case 'awaiting':
        return this.getAwaiting();

      case 'accepted':
        return this.getAccepted();

      case 'sample':
        return this.getSampleSubmission();

      case 'closed':
        return this.getClosed();

      case 'emd':
        return this.getEmdHold();

      case 'sampleRejected':
        return this.getSampleRejected();

      case 'rejected':
        return this.getRejected();

      default:
        return [];
    }
  }

  //--------------- LOAD LIST ------------------
  //--------------- LOAD LIST ------------------
  load() {

    this.loading = true;

    const firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode') || '';

    this.backend.getTenderList({
      firm_code: firmCode
    })
      .subscribe((res: any) => {

        this.loading = false;

        if (!res.success) return;

        this.tenders =
          (res.data || []).filter(
            (t: any) => t?.final_status
          );

        this.cdr.markForCheck();
      });
  }

  //--------------- NAVIGATION ------------------
  goEntry() {

    const firmCode = this.route.parent?.snapshot.paramMap.get('firmCode');

    this.router.navigate([
      `/firms/${firmCode}/tender-module/tender-entry`
    ]);
  }

  goUpcomingTenders() {

    const firmCode = this.route.parent?.snapshot.paramMap.get('firmCode');

    this.router.navigate([
      `/firms/${firmCode}/tender-module/upcoming-tenders`
    ]);
  }

  goStatus(tenderId: string) {
    const firmCode = this.route.parent?.snapshot.paramMap.get('firmCode');
    this.router.navigate([
      `/firms/${firmCode}/tender-module/tender-status`,
      tenderId
    ]);
  }

  //--------------- DELETE ------------------
  deleteTender(tenderId: string) {

    if (!confirm('Delete this tender ?')) return;

    this.backend.deleteTender({ tender_id: tenderId })
      .subscribe((r: any) => {

        if (!r.success) {
          alert('Delete failed');
          return;
        }

        this.load();
      });
  }

  viewTender(id: string) {
    this.backend.viewTender({ tender_id: id })
      .subscribe((res: any) => {

        if (!res.success) return;


        this.selectedTender = { ...res.tender };

        // deep copy for cancel
        this.originalTender = JSON.parse(JSON.stringify(this.selectedTender));

        this.officials = res.officials;
        this.items = res.items;

        this.timeline = res.timeline;

        this.originalTender = JSON.parse(JSON.stringify(res.tender));
        this.isEditMode = false;
        this.showViewCard = true;
        this.cdr.markForCheck();
      });
  }

  closeView() {
    this.showViewCard = false;
    this.selectedTender = null;
    this.tenderLogs = [];
  }

  addOfficial() {
    this.officials.push({
      official_name: '',
      designation: '',
      phone_number: ''
    });
  }

  addItem() {
    this.items.push({
      item_name: '',
      quantity: '',
      rate_per_piece: ''
    });
  }

  cancelEdit() {
    this.selectedTender = JSON.parse(JSON.stringify(this.originalTender));
    this.isEditMode = false;
  }

  editTimeline(index: number) {
    this.timeline[index].isEditing = true;
  }


  updateTender() {

    const payload = {
      ...this.selectedTender,
      officials: this.officials,
      items: this.items,
      timeline: this.timeline
    };

    this.backend.updateTender(payload)
      .subscribe((r: any) => {

        if (r.success) {
          alert("Updated successfully");
          this.closeView();
          this.load();
        } else {
          alert("Update failed");
        }

      });
  }


  getStatusNumber(status: string): number | null {

    if (!status || !status.includes('-')) return null;

    const num = parseInt(status.split('-')[1], 10);

    return isNaN(num) ? null : num;
  }


  getOngoing() {
    return this.tenders.filter(t => {
      const s = this.getStatusNumber(t.final_status);
      return s !== null && s >= 7 && s <= 17;
    });
  }



  getAwaiting() {
    return this.tenders.filter(t =>
      ['TS-01', 'TS-02'].includes(t.final_status)
    );
  }



  getAccepted() {
    return this.tenders.filter(t =>
      t.final_status === 'TS-04'
    );
  }

  getSampleSubmission() {
    return this.tenders.filter(t =>
      ['TS-05', 'TS-06'].includes(t.final_status)
    );
  }

  getClosed() {
    return this.tenders.filter(t =>
      t.final_status === 'TS-19'
    );
  }

  getEmdHold() {
    return this.tenders.filter(t =>
      t.final_status === 'TS-18'
    );
  }


  getSampleRejected() {
    return this.tenders.filter(t =>
      t.final_status === 'TS-20'
    );
  }

  getRejected() {
    return this.tenders.filter(t =>
      t.final_status === 'TS-03'
    );
  }

}