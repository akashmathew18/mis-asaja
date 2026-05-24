import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackendconnectionService } from '../../../core/services/backendconnection';

@Component({
  selector: 'app-pmu-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class PmuDashboard implements OnInit {

  firmCode!: string;

  totalWoodExpense = 0;
  totalPlywoodPurchase = 0;
  totalAccessories = 0;
  totalLabourCost = 0;
  totalOtherExpenses = 0;

  // Date filter state
  activeDays: number = 30;   // default "Last 30 Days"
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backend: BackendconnectionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const code = params.get('firmCode');
      if (!code) {
        console.error('firmCode missing');
        return;
      }
      this.firmCode = code;
      this.loadTotals(this.activeDays);
    });
  }

  // Called when a date filter button is clicked
  setDateFilter(days: number): void {
    this.activeDays = days;
    this.loadTotals(days);
  }

  loadTotals(days: number): void {
    if (!this.firmCode) return;
    this.isLoading = true;

    // Pass the date range (days) to the backend service
    // Adjust the method name if your actual backend expects a different signature
    this.backend.getPmuDashboardTotals(this.firmCode, days)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (!res?.success) return;

          this.totalWoodExpense = res.wood || 0;
          this.totalPlywoodPurchase = res.plywood || 0;
          this.totalAccessories = res.accessories || 0;
          this.totalLabourCost = res.labour || 0;
          this.totalOtherExpenses = res.other_expense || 0;

          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading dashboard totals:', err);
        }
      });
  }

  // Helper method to format numbers as INR currency without using a pipe
  // (keeps the component self-contained)
  formatAmount(value: number): string {
    if (value === undefined || value === null) return '₹ 0';
    return '₹ ' + value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  goTo(module: string): void {
    this.router.navigate([module], {
      relativeTo: this.route.parent
    });
  }
}