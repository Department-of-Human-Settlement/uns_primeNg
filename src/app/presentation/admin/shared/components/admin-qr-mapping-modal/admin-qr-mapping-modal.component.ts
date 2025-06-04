import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { ButtonModule } from 'primeng/button';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
    selector: 'app-admin-qr-mapping-modal',
    templateUrl: './admin-qr-mapping-modal.component.html',
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
export class AdminQrMappingModalComponent implements OnInit {
    building: BuildingDTO;
    buildingId: number;

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
        private buildingDataService: BuildingDataService,
        private confirmationService: ConfirmationService,
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef
    ) {
        this.building = this.config.data.building;
        this.buildingId = this.building.id;
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

        this.buildingDataService
            .ValidateBuildingQr(this.qrResultString)
            .subscribe({
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

    rescan(): void {
        if (!this.scanner) return;
        this.qrResultString = null;
        this.isQrValid = false;
        this.qrVerificationResultMessage = '';
        this.qrVerificationOngoing = true;
        this.scanner.scanStart();
    }

    confirmMapQrcode(): void {
        if (!this.qrResultString || !this.building) {
            console.error('No QR code detected or building is not defined.');
            return;
        }

        this.confirmationService.confirm({
            message:
                'Are you sure you want to map this QR code to the building?',
            header: 'Confirm QR Mapping',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.buildingDataService
                    .MapBuildingQr({
                        qrUuid: this.qrResultString,
                        buildingId: this.buildingId,
                    })
                    .subscribe({
                        next: (res) => {
                            this.building.qrUuid = this.qrResultString;
                            this.qrVerificationResultMessage =
                                'QR Code successfully mapped!';
                            this.isQrValid = true;
                            this.buildingDataService
                                .GetBuildingById(this.buildingId)
                                .subscribe({
                                    next: (res) => {
                                        // Close the dialog with success status
                                        this.ref.close({ success: true });
                                    },
                                });
                        },
                        error: (err) => {
                            console.error('Failed to map QR code:', err);
                            this.qrVerificationResultMessage =
                                'Failed to map QR code. Please try again.';
                            this.isQrValid = false;
                        },
                    });
            },
        });
    }
}
