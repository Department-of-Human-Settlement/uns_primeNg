import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ResultCreateByDzongkhagAndAdminDTO } from 'src/app/core/models/access-control.dto';

@Component({
    selector: 'app-admin-create-subadmin-rights-results-modal',
    templateUrl: './admin-create-subadmin-rights-results-modal.component.html',
    styleUrls: ['./admin-create-subadmin-rights-results-modal.component.css'],
    standalone: true,
    imports: [CommonModule],
})
export class AdminCreateSubadminRightsResultsModalComponent implements OnInit {
    ref: DynamicDialogRef;
    results: ResultCreateByDzongkhagAndAdminDTO;
    constructor(private config: DynamicDialogConfig) {
        this.results = this.config.data;
        console.log('PASSED REULTS', this.results);
    }

    ngOnInit() {}
}
