import { Routes } from '@angular/router';

/* ADMIN PAGES */
import { AdminDashboard } from './dashboard/dashboard';
import { ManageUsers } from './manage-users/manage-users';
import { ManageExecutives } from './manage-executives/manage-executives';
import { ManageFirms } from './manage-firms/manage-firms';
import { ManageOrganizations } from './manage-organizations/manage-organizations';
import { ManageDivisions } from './manage-divisions/manage-divisions';
import { ManageDepartments } from './manage-departments/manage-departments';

export const AdminRoute: Routes = [

  { path: 'dashboard', component: AdminDashboard },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'users', component: ManageUsers },
  { path: 'executives', component: ManageExecutives },
  { path: 'firms', component: ManageFirms },
  { path: 'organizations', component: ManageOrganizations },
  { path: 'divisions', component: ManageDivisions },
  {path: 'departments', component: ManageDepartments},
  { path: '**', redirectTo: '' }
];