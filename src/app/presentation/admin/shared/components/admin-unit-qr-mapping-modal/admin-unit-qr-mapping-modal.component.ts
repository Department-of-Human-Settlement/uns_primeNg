import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { ButtonModule } from 'primeng/button';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
    selector: 'app-admin-unit-qr-mapping-modal',
    templateUrl: './admin-unit-qr-mapping-modal.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ConfirmDialogModule,
        ZXingScannerModule,
        QRCodeModule,
    ],
    providers: [ConfirmationService],
})
export class AdminUnitQrMappingModalComponent implements OnInit {
    unit: UnitDto;
    unitId: number;

    qrResultString: string | null = null;
    qrVerificationOngoing: boolean = true;
    isQrValid: boolean = false;
    qrVerificationResultMessage: string = '';
    currentDevice: MediaDeviceInfo | null = null;

    availableDevices: MediaDeviceInfo[] = [];
    hasDevices: boolean = false;
    hasPermission: boolean = false;

    @ViewChild('scanner') scanner!: ZXingScannerComponent;

    constructor(
        private unitDataService: UnitDataService,
        private confirmationService: ConfirmationService,
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef
    ) {
        this.unit = this.config.data.unit;
        this.unitId = this.unit.id;
    }

    ngOnInit(): void {
        if (this.scanner) {
            this.scanner.camerasFound.subscribe(
                (devices: MediaDeviceInfo[]) => {
                    this.hasDevices = true;
                    this.availableDevices = devices;

                    // Prefer back camera if available
                    for (const device of devices) {
                        if (/back|rear|environment/gi.test(device.label)) {
                            this.currentDevice = device;
                            break;
                        }
                    }

                    if (!this.currentDevice && devices.length > 0) {
                        this.currentDevice = devices[0];
                    }
                }
            );

            this.scanner.camerasNotFound.subscribe(() => {
                this.hasDevices = false;
            });

            this.scanner.permissionResponse.subscribe((perm: boolean) => {
                this.hasPermission = perm;
            });

            // If remapping, start with QR verification off to show current QR
            if (this.config.data?.isRemapping) {
                this.qrVerificationOngoing = false;
                this.qrResultString = this.unit.qrUuid;
                this.isQrValid = true;
                this.qrVerificationResultMessage = 'Current QR Code';
            }
        }
    }

    handleQrCodeResult(result: string): void {
        if (!this.scanner) return;

        this.scanner.scanStop();
        this.qrResultString = result;
        this.qrVerificationOngoing = false;

        this.unitDataService.ValidateUnitQr(this.qrResultString).subscribe({
            next: (res) => {
                this.qrVerificationResultMessage = 'QR Code Valid';
                this.isQrValid = true;
            },
            error: (err) => {
                this.isQrValid = false;
                this.qrVerificationResultMessage =
                    err.error.message || 'Invalid QR Code';
            },
        });
    }

    confirmMapQrcode(): void {
        const message = this.config.data?.isRemapping
            ? 'Are you sure you want to remap the QR code for this unit?'
            : 'Are you sure you want to map this QR code to the unit?';

        this.confirmationService.confirm({
            message: message,
            header: 'Confirm QR Mapping',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.unitDataService
                    .UpdateUnit({ qrUuid: this.qrResultString }, this.unit.id)
                    .subscribe({
                        next: () => {
                            this.ref.close({ success: true });
                        },
                        error: (err) => {
                            console.error('Failed to map QR code:', err);
                            this.ref.close({ success: false });
                        },
                    });
            },
        });
    }

    rescan(): void {
        this.qrResultString = null;
        this.isQrValid = false;
        this.qrVerificationResultMessage = '';
        this.qrVerificationOngoing = true;
        if (this.scanner) {
            this.scanner.scanStart();
        }
    }
}
