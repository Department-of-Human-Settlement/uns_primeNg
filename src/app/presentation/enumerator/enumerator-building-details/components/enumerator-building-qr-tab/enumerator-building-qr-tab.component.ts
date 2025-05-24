import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-enumerator-building-qr-tab',
    templateUrl: './enumerator-building-qr-tab.component.html',
    styleUrls: ['./enumerator-building-qr-tab.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ZXingScannerModule,
        QRCodeModule,
        ConfirmDialogModule,
    ],
    providers: [DialogService, ConfirmationService],
})
export class EnumeratorBuildingQrTabComponent implements OnInit {
    buildingId!: number;

    @Input({
        required: true,
    })
    building: BuildingDTO | null = null;

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
        private route: ActivatedRoute
    ) {
        this.buildingId = Number(this.route.snapshot.params['buildingId']);
    }

    ngOnInit(): void {
        // Check if the scanner is available before subscribing
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
        // Validate the QR code
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

    unMapQr(): void {
        if (!this.building) return;

        this.confirmationService.confirm({
            message:
                'Are you sure you want to unmap the QR code from this building?',
            header: 'Confirm Unmap',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Proceed with unmapping the QR code
                console.log(
                    'Unmapping QR from building:',
                    this.building?.qrUuid
                );
                this.building.qrUuid = null;
                this.buildingDataService
                    .updateBuilding(this.buildingId, {
                        qrUuid: null,
                    })
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
                // Proceed with mapping the QR code
                console.log(
                    'Mapping QR code to building:',
                    this.qrResultString
                );
                this.buildingDataService
                    .MapBuildingQr({
                        qrUuid: this.qrResultString,
                        buildingId: this.buildingId,
                    })
                    .subscribe({
                        next: (res) => {
                            this.building.qrUuid = this.qrResultString; // Update the building's QR UUID
                            this.qrVerificationResultMessage =
                                'QR Code successfully mapped!';
                            this.isQrValid = true;
                            this.buildingDataService
                                .GetBuildingById(this.buildingId)
                                .subscribe({
                                    next: (res) => {
                                        this.building = res;
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
            reject: () => {
                console.log('QR mapping canceled.');
            },
        });
    }
}
