import { Routes } from '@angular/router';

import { AdminRoute } from './pages/admin/admin.route';

import { LoginComponent } from './pages/login/login';
import { LandingComponent } from './pages/landing/landing';
import { FirmLayoutComponent } from './layout/firm-layout/firm-layout';

import { PmuDashboard } from './modules/pmu/dashboard/dashboard';
import { PmuWood } from './modules/pmu/wood-expense/wood-expense';
import { PmuPlywood } from './modules/pmu/plywood-purchase/plywood-purchase';
import { PmuAccessories } from './modules/pmu/accessories/accessories';
import { PmuLabour } from './modules/pmu/labour/labour';
import { PmuTeamLedger } from './modules/pmu/team-ledger/team-ledger';
import { PmuTeams } from './modules/pmu/teams/teams';
import { PmuCotDelivery } from './modules/pmu/cot-delivery/cot-delivery';
import { PmuAssetLedger } from './modules/pmu/asset-ledger/asset-ledger';
import { PmuOtherExpense } from './modules/pmu/other-expenses/other-expenses';
import { PmuReports } from './modules/pmu/reports/reports';
import { PmuPayments } from './modules/pmu/payments/payments';



// TENDER MODULE
import { TenderDashboard } from './modules/tender-module/dashboard/dashboard';
import { UpcomingTenders } from './modules/tender-module/tenders/upcoming-tenders/upcoming-tenders';
import { TenderStatus } from './modules/tender-module/tenders/tender-status/tender-status';
import { TenderList } from './modules/tender-module/tenders/tender-list/tender-list';
import { TenderEntry } from './modules/tender-module/tenders/tender-entry/tender-entry';
import { TenderOtherExpenses } from './modules/tender-module/other-expenses/other-expenses';
import { TenderSupplyOrder } from './modules/tender-module/supply-order/supply-order';
import { TenderExpenseLedger } from './modules/tender-module/expense-ledger/expense-ledger';
import { TenderReceivables } from './modules/tender-module/receivables/receivables';

export const routes: Routes = [

    // ---------- DEFAULT ----------
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // ---------- AUTH ----------
    { path: 'login', component: LoginComponent },

    {
        path: 'admin',
        children: AdminRoute
    },

    { path: 'landing', component: LandingComponent },


    // ---------- FIRM + PMU ----------
    {
        path: 'firms/:firmCode/pmu',
        component: FirmLayoutComponent,
        data: { module: 'pmu' },
        children: [

            // PMU HOME
            { path: 'dashboard', component: PmuDashboard },
            { path: 'reports', component: PmuReports },

            // PMU MODULES
            { path: 'wood-expense', component: PmuWood },
            { path: 'plywood-purchase', component: PmuPlywood },
            { path: 'accessories', component: PmuAccessories },
            { path: 'labour', component: PmuLabour },
            { path: 'team-ledger', component: PmuTeamLedger },
            { path: 'teams', component: PmuTeams },
            { path: 'cot-delivery', component: PmuCotDelivery },
            { path: 'asset-ledger', component: PmuAssetLedger },
            { path: 'other-expense', component: PmuOtherExpense },
            { path: 'payments', component: PmuPayments },

            // DEFAULT INSIDE PMU
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },


    // ---------- FIRM + PMU ----------
    {
        path: 'firms/:firmCode/tender-module',
        component: FirmLayoutComponent,
        data: { module: 'tender-module' },
        children: [
            { path: 'dashboard', component: TenderDashboard },
            { path: 'upcoming-tenders', component: UpcomingTenders },
            { path: 'tender-entry', component: TenderEntry },
            { path: 'tender-list', component: TenderList },
            { path: 'tender-status/:tenderId', component: TenderStatus },
            { path: 'tender-other-expense', component: TenderOtherExpenses },
            { path: 'tender-supply-order', component: TenderSupplyOrder },
            { path: 'tender-expense-ledger', component: TenderExpenseLedger },
            { path: 'tender-receivables', component: TenderReceivables },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

        ]
    },

    // ---------- FALLBACK ----------
    { path: '**', redirectTo: 'login' }
];