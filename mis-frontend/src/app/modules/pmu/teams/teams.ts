import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule,
  NgForm
} from '@angular/forms';

import {
  ActivatedRoute,
  RouterModule
} from '@angular/router';

import { Pmu } from '../../../core/services/pmu';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
})
export class PmuTeams implements OnInit {

  firmCode!: string;

  saving = false;

  editMode = false;

  successMsg = '';

  teams: any[] = [];

  form: any = {
    team_name: '',
    status: 'Active'
  };

  constructor(
    private route: ActivatedRoute,
    private backend: Pmu,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.firmCode =
      this.route.parent?.snapshot.paramMap.get('firmCode')!;

    this.loadTeams();
  }

  /* =====================================================
     LOAD
  ===================================================== */

  loadTeams() {

    this.backend.getPmuTeams(this.firmCode)
      .subscribe((res: any) => {

        if (res.success) {

          this.teams = res.data || [];

          this.cdr.markForCheck();
        }
      });
  }

  /* =====================================================
     SAVE
  ===================================================== */

  save(formRef: NgForm) {

    if (formRef.invalid || this.saving) {
      return;
    }



    this.saving = true;

    const payload = {
      team_name: this.form.team_name,
      status: this.form.status,
      firm_code: this.firmCode
    };

    /* ================= UPDATE ================= */

    if (this.editMode) {

      this.backend.updatePmuTeam(payload)
        .subscribe((res: any) => {

          this.saving = false;

          if (res.success) {

            this.successMsg =
              'Updated successfully';

            this.loadTeams();

            this.cancelEdit(formRef);
          }
        });

    }

    /* ================= CREATE ================= */

    else {

      this.backend.addPmuTeam(payload)
        .subscribe((res: any) => {

          this.saving = false;

          if (res.success) {

            this.successMsg =
              'Saved successfully';

            this.loadTeams();

            formRef.resetForm();

            this.resetForm();
          }
        });
    }

    setTimeout(() => {

      this.successMsg = '';

    }, 2500);
  }

  /* =====================================================
     EDIT
  ===================================================== */

  editRow(row: any) {

    this.editMode = true;
    this.form = {
      team_name: row.team_name,
      status: row.status
    };

    this.form.team_id = row.team_id;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /* =====================================================
     CANCEL
  ===================================================== */

  cancelEdit(formRef: NgForm) {

    this.editMode = false;

    formRef.resetForm();

    this.resetForm();
  }

  /* =====================================================
     RESET
  ===================================================== */

  resetForm() {

    this.form = {
      team_name: '',
      status: 'Active'
    };
  }

  /* =====================================================
     DELETE
  ===================================================== */

  deleteRow(teamId: string) {

    const ok =
      confirm('Delete this team?');

    if (!ok) return;

    this.backend.deletePmuTeam({

      team_id: teamId,
      firm_code: this.firmCode

    }).subscribe(() => {

      this.loadTeams();
    });
  }

}