import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Messages } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import {
    CreateSubAdminZoneRightsByAdminZoneDTO,
    CreateSubAdminZoneRightsByDzongkhagDTO,
    CreateSubAdminZoneRightsBySubAdminZoneDTO,
    SubAdminZoneRightDTO,
} from 'src/app/core/models/access-control.dto';
import { AdminZoneDTO } from 'src/app/core/models/location/adminstrative-zone.dto';
import { DzongkhagDTO } from 'src/app/core/models/location/dzongkhag.dto';
import { UserDTO } from 'src/app/core/models/users/user.dto';
import { SubAdminZoneRightsDataService } from 'src/app/core/services/access-control.dataservice';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { AdminCreateSubadminRightsResultsModalComponent } from '../admin-create-subadmin-rights-results-modal/admin-create-subadmin-rights-results-modal.component';
import { SubAdminZoneDTO } from 'src/app/core/models/location/subadministrative-zone.dto';

@Component({
    selector: 'app-admin-assign-subadminzone-rights-modal',
    templateUrl: './admin-assign-subadminzone-rights-modal.component.html',
    styleUrls: ['./admin-assign-subadminzone-rights-modal.component.css'],
    standalone: true,
    imports: [
        TabViewModule,
        DividerModule,
        TableModule,
        CommonModule,
        ButtonModule,
        ConfirmDialogModule,
        DropdownModule,
        FormsModule,
    ],
    providers: [ConfirmationService],
})
export class AdminAssignSubadminzoneRightsModalComponent implements OnInit {
    user: UserDTO;

    ref: DynamicDialogRef;

    dzongkhags: DzongkhagDTO[];
    selectedDzongkhags: DzongkhagDTO[] = [];
    selectedDzongkhag: DzongkhagDTO;

    adminZones: AdminZoneDTO[] = [];
    selectedAdminZones: AdminZoneDTO[] = [];
    selectedAdminZone: AdminZoneDTO;

    subAdminZones: SubAdminZoneDTO[] = [];
    selectedSubAdminZones: SubAdminZoneDTO[] = [];

    subAdminZoneRights: SubAdminZoneRightDTO[] = [];

    constructor(
        private config: DynamicDialogConfig,
        private locationDataService: LocationDataService,
        private subAdminZoneRightsDataService: SubAdminZoneRightsDataService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private dialogService: DialogService
    ) {
        this.user = this.config.data;
    }

    ngOnInit() {
        this.loadAllDzongkhags();
        this.getSubAdminRightsByUser();
    }

    loadAllDzongkhags() {
        this.locationDataService.GetAllDzonghags().subscribe({
            next: (res) => {
                this.dzongkhags = res;
            },
            error: (err) => {
                console.log(err);
            },
        });
    }

    loadAdminZonesByDzongkhag() {
        this.locationDataService
            .GetAllAdministrativeZonesByDzongkhag(this.selectedDzongkhag.id)
            .subscribe({
                next: (res) => {
                    this.adminZones = res;
                },
            });
    }

    selectedSubAdminZone() {
        this.locationDataService
            .GetAllSubAdministrativeZonesByAdministrativeZone(
                this.selectedAdminZone.id
            )
            .subscribe({
                next: (res) => {
                    this.subAdminZones = res;
                },
            });
    }
    onDzongkahgChange() {
        this.locationDataService
            .GetAllAdministrativeZonesByDzongkhag(this.selectedDzongkhag.id)
            .subscribe({
                next: (res) => {
                    this.adminZones = res;
                },
            });
    }
    onAdminZoneChange() {
        this.locationDataService
            .GetAllSubAdministrativeZonesByAdministrativeZone(
                this.selectedAdminZone.id
            )
            .subscribe({
                next: (res) => {
                    this.subAdminZones = res;
                },
            });
    }

    getSubAdminRightsByUser() {
        this.subAdminZoneRightsDataService
            .GetSubAdminRightsByUser(this.user.id)
            .subscribe({
                next: (res) => {
                    console.log(res);
                    this.subAdminZoneRights = res;
                },
            });
    }
    assignRightsByDzongkhag() {
        let data: CreateSubAdminZoneRightsByDzongkhagDTO = {
            userId: this.user.id,
            dzongkhags: this.selectedDzongkhags,
        };
        this.subAdminZoneRightsDataService
            .CreateSubAdminZoneRightsByDzongkhag(data)
            .subscribe({
                next: (res) => {
                    this.ref = this.dialogService.open(
                        AdminCreateSubadminRightsResultsModalComponent,
                        {
                            header: 'Results',
                            data: { ...res },
                        }
                    );
                    this.getSubAdminRightsByUser();
                },
                error: (err) => {
                    console.log(err);
                },
            });
    }
    assignRightsByAdminZone() {
        console.log(this.selectedAdminZones);
        let data: CreateSubAdminZoneRightsByAdminZoneDTO = {
            userId: this.user.id,
            adminZones: this.selectedAdminZones,
        };
        this.subAdminZoneRightsDataService
            .CreateSubAdminZoneRightsByAdminZones(data)
            .subscribe({
                next: (res) => {
                    console.log(res);
                    this.ref = this.dialogService.open(
                        AdminCreateSubadminRightsResultsModalComponent,
                        {
                            header: 'Results',
                            data: { ...res },
                        }
                    );
                    this.getSubAdminRightsByUser();
                },
                error: (err) => {
                    console.log(err);
                },
            });
    }

    assignRightsBySubAdminZone() {
        let data: CreateSubAdminZoneRightsBySubAdminZoneDTO = {
            userId: this.user.id,
            subAdminZones: this.selectedSubAdminZones,
        };
        this.subAdminZoneRightsDataService
            .CreateSubAdminZoneRightsBySubAdminZones(data)
            .subscribe({
                next: (res) => {
                    console.log(res);
                    this.ref = this.dialogService.open(
                        AdminCreateSubadminRightsResultsModalComponent,
                        {
                            header: 'Results',
                            data: { ...res },
                        }
                    );
                    this.getSubAdminRightsByUser();
                },
                error: (err) => {
                    console.log(err);
                },
            });
    }

    confirmUnMapRights(item: SubAdminZoneRightDTO) {
        console.log('UNMAP FOR ', item);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',

            accept: () => {
                this.subAdminZoneRightsDataService
                    .DeleteSubAdminRight(item.id)
                    .subscribe((res) => {
                        if (res) {
                            this.messageService.add({
                                severity: 'info',
                                summary: 'Confirmed',
                                detail: 'Sub Admin Zone Unmapped',
                            });
                            this.getSubAdminRightsByUser();
                        }
                    });
            },
            reject: () => {},
        });
    }
}
