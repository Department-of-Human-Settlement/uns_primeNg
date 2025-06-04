import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AdminQrMappingModalComponent } from '../admin-qr-mapping-modal/admin-qr-mapping-modal.component';

@Component({
    selector: 'app-admin-building-card',
    standalone: true,
    imports: [
        CardModule,
        CommonModule,
        QRCodeModule,
        ButtonModule,
        ConfirmDialogModule,
    ],
    providers: [DialogService, ConfirmationService],
    templateUrl: './admin-building-card.component.html',
    styleUrls: ['./admin-building-card.component.css'],
})
export class AdminBuildingCardComponent implements OnChanges {
    building!: BuildingDTO;
    @Input() buildingId;

    constructor(
        private buildingDataService: BuildingDataService,
        public messageService: MessageService,
        private confirmationService: ConfirmationService,
        private dialogService: DialogService
    ) {}

    ngOnChanges() {
        this.getBulding();
    }

    getBulding() {
        this.buildingDataService
            .GetBuildingById(this.buildingId)
            .subscribe((res) => {
                if (res) {
                    this.building = res;
                } else {
                    this.building = null;
                }
            });
    }

    getQr(val) {
        return val;
    }

    async toggleIsProtected() {
        if (this.buildingId) {
            this.buildingDataService
                .updateBuilding(this.building.id, {
                    isProtected: !this.building.isProtected,
                })
                .subscribe((res) => {
                    this.messageService.add({
                        severity: 'Success',
                        summary: 'Building Updated',
                        detail: 'Building Updated',
                    });
                    this.getBulding();
                });
        }
    }

    // QR Code Actions
    startScan(): void {
        const ref = this.dialogService.open(AdminQrMappingModalComponent, {
            header: 'Map QR Code',
            width: '450px',
            contentStyle: { overflow: 'visible' },
            dismissableMask: true,
            closeOnEscape: true,
            baseZIndex: 10000,
            data: {
                building: this.building,
                isRemapping: false,
            },
        });

        ref.onClose.subscribe((result) => {
            if (result && result.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'QR code mapped successfully',
                });
                this.getBulding();
            }
        });
    }

    startRescan(): void {
        const ref = this.dialogService.open(AdminQrMappingModalComponent, {
            header: 'Remap QR Code',
            width: '450px',
            contentStyle: { overflow: 'visible' },
            dismissableMask: true,
            closeOnEscape: true,
            baseZIndex: 10000,
            data: {
                building: this.building,
                isRemapping: true,
            },
        });

        ref.onClose.subscribe((result) => {
            if (result && result.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'QR code remapped successfully',
                });
                this.getBulding();
            }
        });
    }

    unMapQr(): void {
        if (!this.building) return;

        this.confirmationService.confirm({
            message:
                'Are you sure you want to unmap the QR code from this building?',
            header: 'Confirm Unmap',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.buildingDataService
                    .updateBuilding(this.buildingId, {
                        qrUuid: null,
                    })
                    .subscribe({
                        next: (res) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'QR code unmapped successfully',
                            });
                            this.building.qrUuid = null;
                            this.getBulding();
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
