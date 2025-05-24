import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';

@Component({
    selector: 'app-enumerator-unit-qr-view-modal',
    templateUrl: './enumerator-unit-qr-view-modal.component.html',
    styleUrls: ['./enumerator-unit-qr-view-modal.component.css'],
    standalone: true,
    imports: [CommonModule, ConfirmDialogModule, ZXingScannerModule],
    providers: [ConfirmationService],
})
export class EnumeratorUnitQrViewModalComponent implements OnInit {
    unit: UnitDto;
    unitId: number;

    qrResultString: string | null = null;
    qrVerificationOngoing: boolean = true;
    isQrValid: boolean = false;
    isQrMapped: boolean = false;
    qrVerificationResultMessage: string = '';
    currentDevice: MediaDeviceInfo | null = null;

    availableDevices: MediaDeviceInfo[] = [];
    hasDevices: boolean = false;
    hasPermission: boolean = false;

    @ViewChild('scanner') scanner!: ZXingScannerComponent;

    constructor(
        private unitDataService: UnitDataService,
        private confirmationService: ConfirmationService,
        private config: DynamicDialogConfig
    ) {
        this.unit = this.config.data;
        this.unitId = this.unit.id;
    }

    ngOnInit(): void {
        if (this.scanner) {
            this.scanner.camerasFound.subscribe(
                (devices: MediaDeviceInfo[]) => {
                    this.hasDevices = true;
                    this.availableDevices = devices;

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
        if (!this.qrResultString || !this.unit) {
            console.error('No QR code detected or unit is not defined.');
            return;
        }

        this.confirmationService.confirm({
            message: 'Are you sure you want to map this QR code to the unit?',
            header: 'Confirm QR Mapping',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.unitDataService
                    .MapUnitQr({
                        qrUuid: this.qrResultString,
                        unitId: this.unitId,
                    })
                    .subscribe({
                        next: (res) => {
                            this.unit.qrUuid = this.qrResultString;
                            this.qrVerificationResultMessage =
                                'QR Code successfully mapped!';
                            this.isQrValid = true;
                            this.isQrMapped = true;
                        },
                        error: (err) => {
                            console.error('Failed to map QR code:', err);
                            this.qrVerificationResultMessage =
                                'Failed to map QR code. Please try again.';
                            this.isQrValid = false;
                        },
                    });
            },
            reject: () => {
                console.log('QR mapping canceled.');
            },
        });
    }

    rescan(): void {
        this.qrResultString = null;
        this.isQrValid = false;
        this.qrVerificationResultMessage = '';
        this.qrVerificationOngoing = true;
    }

    unMapQr(): void {
        if (!this.unit) return;

        this.confirmationService.confirm({
            message:
                'Are you sure you want to unmap the QR code from this unit?',
            header: 'Confirm Unmap',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.unit.qrUuid = null;
                this.unitDataService
                    .UpdateUnit({ qrUuid: null }, this.unitId)
                    .subscribe({
                        next: (res) => {
                            console.log('QR code unmapped successfully:', res);
                        },
                        error: (err) => {
                            console.error('Failed to unmap QR code:', err);
                        },
                    });
            },
            reject: () => {
                console.log('Unmap action canceled.');
            },
        });
    }
}
