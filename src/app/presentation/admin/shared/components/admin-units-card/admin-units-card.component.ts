import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import {
    DialogService,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { QRCodeModule } from 'angularx-qrcode';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { GETBUILDINGFLOORLABEL } from 'src/app/core/helper-function';
import { EditUnitModalComponent } from '../../admin-view-plot-buildings/edit-unit-modal/edit-unit-modal.component';
import { AdminEditUnitComponent } from '../crud-modals/units/admin-edit-unit/admin-edit-unit.component';
import { AdminUnitQrMappingModalComponent } from '../admin-unit-qr-mapping-modal/admin-unit-qr-mapping-modal.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { BuildingOwnershipDto } from 'src/app/core/models/ownership/owner.dto';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-admin-units-card',
    templateUrl: './admin-units-card.component.html',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TableModule,
        DynamicDialogModule,
        ConfirmDialogModule,
        QRCodeModule,
        ToastModule,
    ],
    providers: [DialogService, ConfirmationService, MessageService],
    styleUrls: ['./admin-units-card.component.css'],
})
export class AdminUnitsCardComponent implements OnChanges, OnInit {
    @Input() buildingId;

    ref: DynamicDialogRef | undefined;
    units: UnitDto[];
    noUnitsRented: number = 0;
    noUnitsSelfOccupied: number = 0;
    getBuildingFloorLabel = GETBUILDINGFLOORLABEL;

    buildingDetails!: BuildingDetailDto;
    buildingOwnerships: BuildingOwnershipDto[];

    constructor(
        private unitDataService: UnitDataService,
        private dialogService: DialogService,
        private buildingDetailService: BuildingDetailDataService,
        private confirmationService: ConfirmationService,
        private ownershipDataService: OwnershipDataService,
        private messageService: MessageService
    ) {}
    ngOnInit(): void {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(this.buildingId)
            .subscribe((res) => {
                this.buildingDetails = res;
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.getUnitDetails();
    }

    getUnitDetails() {
        this.unitDataService
            .GetAllUnitsByBuilding(this.buildingId)
            .subscribe((res) => {
                this.units = res;
                this.units.forEach((unit) => {
                    if ((unit as any).unitDetail?.occupancyStatus == "OwnerOccupied") {
                        this.noUnitsSelfOccupied++;
                    }else{
                        this.noUnitsRented++;
                    }
                });
                this.ownershipDataService
                    .GetAllBuildingOwnerships(this.buildingId)
                    .subscribe((res) => {
                        console.log(res);
                        console.log('BUILDing OWNerSHIP');
                        this.buildingOwnerships = res;
                    });
            });
    }

    getQr(val) {
        return val;
    }

    deleteUnit(unit) {
        console.log('Delete Unit');
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to this unit and its details?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',
            accept: () => {
                this.unitDataService
                    .DeleteUnitAndDetails(unit.id)
                    .subscribe((res) => {
                        this.getUnitDetails();
                    });
            },
            reject: () => {},
        });
    }

    addUnit() {
        this.ref = this.dialogService.open(EditUnitModalComponent, {
            data: {
                buildingId: this.buildingId,
                isEditUnit: false,
                isEditUnitDetails: false,
            },
            width: '40vw',
        });
        this.ref.onClose.subscribe((res) => {
            this.getUnitDetails();
        });
    }

    editUnit(unit) {
        this.ref = this.dialogService.open(AdminEditUnitComponent, {
            data: {
                buildingId: this.buildingId,
                unitId: unit.id,
                unit: unit,
                buildingDetails: this.buildingDetails,
            },
            header:
                'Editing BuildingID:' + this.buildingId + ', unitId:' + unit.id,
            width: 'max-content',
        });
        this.ref.onClose.subscribe((res) => {
            if (res.dataChanged) {
                console.log(res, 'DATA CHANGED UPDATING UNITS CARD');
                this.getUnitDetails();
            }
        });
        this.ref.onClose;
    }

    editUnitDetail(unit) {
        if (unit.unitDetail == null) {
            this.ref = this.dialogService.open(EditUnitModalComponent, {
                data: {
                    buildingId: this.buildingId,
                    unit: unit,
                    isEditUnit: false,
                    isEditUnitDetails: false,
                    isCreateUnitDetails: true,
                },
                width: 'max-content',
                height: '70vh',
            });
        } else {
            this.ref = this.dialogService.open(EditUnitModalComponent, {
                data: {
                    buildingId: this.buildingId,
                    unit: unit,
                    isEditUnit: false,
                    isEditUnitDetails: true,
                    isCreateUnitDetails: false,
                },
                width: 'max-content',
                height: '70vh',
            });
        }
        this.ref.onClose.subscribe((res) => {
            this.getUnitDetails();
        });
    }

    startQrScan(unit: UnitDto): void {
        const ref = this.dialogService.open(AdminUnitQrMappingModalComponent, {
            header: unit.qrUuid ? 'Remap QR Code' : 'Map QR Code',
            width: '450px',
            contentStyle: { overflow: 'visible' },
            dismissableMask: true,
            closeOnEscape: true,
            baseZIndex: 10000,
            data: {
                unit: unit,
                isRemapping: !!unit.qrUuid,
            },
        });

        ref.onClose.subscribe((result) => {
            if (result && result.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `QR code ${
                        unit.qrUuid ? 'remapped' : 'mapped'
                    } successfully`,
                });
                this.getUnitDetails();
            }
        });
    }

    unMapQr(unit: UnitDto): void {
        if (!unit || !unit.qrUuid) return;

        this.confirmationService.confirm({
            message:
                'Are you sure you want to unmap the QR code from this unit?',
            header: 'Confirm Unmap',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.unitDataService
                    .UpdateUnit({ qrUuid: null }, unit.id)
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'QR code unmapped successfully',
                            });
                            this.getUnitDetails();
                        },
                        error: (err) => {
                            console.error('Failed to unmap QR code:', err);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to unmap QR code',
                            });
                        },
                    });
            },
        });
    }
}
