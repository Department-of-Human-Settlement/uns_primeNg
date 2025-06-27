import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { Result } from '@zxing/library';
import { MessageService } from 'primeng/api';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
    selector: 'app-public-scan-qr-code',
    templateUrl: './public-scan-qr-code.component.html',
    styleUrls: ['./public-scan-qr-code.component.css'],
    standalone: true,
    imports: [
        ZXingScannerModule,
        ToastModule,
        ButtonModule,
        CommonModule,
        QRCodeModule,
    ],
})
export class PublicScanQrCodeComponent implements OnInit {
    @ViewChild('scanner') scanner!: ZXingScannerComponent;

    // Scanner properties
    availableDevices: MediaDeviceInfo[] = [];
    currentDevice!: MediaDeviceInfo;
    hasDevices: boolean = false;
    hasPermission: boolean = false;

    // State properties
    buildingFound: boolean = false;
    unitFound: boolean = false;
    invalidQr: boolean = false;
    isScanning: boolean = true;

    // Data properties
    building: BuildingDTO = {} as BuildingDTO;
    unit: UnitDto = {} as UnitDto;

    // Error handling
    errorMessage: string = '';

    // Auth mode
    auth: boolean = false;

    constructor(
        private buildingService: BuildingDataService,
        private unitService: UnitDataService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.auth = params['auth'] === 'true';
        });
    }

    onCamerasFound(devices: MediaDeviceInfo[]): void {
        this.availableDevices = devices;
        this.hasDevices = Boolean(devices && devices.length);
    }

    onPermissionResponse(permission: boolean): void {
        this.hasPermission = permission;
    }

    handleQrCodeResult(resultString: string): void {
        this.scanner.scanStop();
        this.isScanning = false;
        this.fetchDetailsByQr(resultString);
    }

    fetchDetailsByQr(qrUuid: string): void {
        const firstLetter = qrUuid[0]?.toUpperCase();

        if (firstLetter === 'B') {
            this.fetchBuildingByQr(qrUuid);
        } else if (firstLetter === 'U') {
            this.fetchUnitByQr(qrUuid);
        } else {
            this.showInvalidQr('Invalid QR code format');
        }
    }

    async fetchBuildingByQr(qrUuid: string): Promise<void> {
        try {
            const building = await this.buildingService
                .GetBuildingByQr(qrUuid)
                .toPromise();
            if (building) {
                this.buildingFound = true;
                this.building = building;

                if (this.auth) {
                    // Use a default subzoneId since it's not in the basic BuildingDTO
                    this.redirectToAuth(1, building.id);
                }
            } else {
                this.showInvalidQr('Building not found');
            }
        } catch (error) {
            console.error('Error fetching building:', error);
            this.showInvalidQr('Could not load building information');
        }
    }

    async fetchUnitByQr(qrUuid: string): Promise<void> {
        try {
            const unit = await this.unitService.GetUnitByQr(qrUuid).toPromise();
            if (unit) {
                this.unitFound = true;
                this.unit = unit;

                // Fetch building details for the unit
                const building = await this.buildingService
                    .GetBuildingById(unit.buildingId)
                    .toPromise();
                if (building) {
                    this.building = building;

                    if (this.auth) {
                        // Use a default subzoneId since it's not in the basic BuildingDTO
                        this.redirectToAuth(1, building.id);
                    }
                }
            } else {
                this.showInvalidQr('Unit not found');
            }
        } catch (error) {
            console.error('Error fetching unit:', error);
            this.showInvalidQr('Could not load unit information');
        }
    }

    showInvalidQr(message: string): void {
        this.invalidQr = true;
        this.errorMessage = message;
        this.messageService.add({
            severity: 'error',
            summary: 'QR Code Error',
            detail: message,
        });
    }

    redirectToAuth(subzoneId: number, buildingId: number): void {
        this.router.navigate([`/enum/load-buildings/${subzoneId}`], {
            queryParams: { buildingId: buildingId },
        });
    }

    openLocationOnGoogle(): void {
        if (this.building.lat && this.building.lng) {
            window.open(
                `https://maps.google.com/?q=${this.building.lat},${this.building.lng}`
            );
        }
    }

    rescan(): void {
        this.buildingFound = false;
        this.unitFound = false;
        this.invalidQr = false;
        this.isScanning = true;
        this.errorMessage = '';
        this.scanner.scanStart();
    }

    switchCamera(): void {
        const deviceIndex = this.availableDevices.indexOf(this.currentDevice);
        const nextIndex = (deviceIndex + 1) % this.availableDevices.length;
        this.currentDevice = this.availableDevices[nextIndex];
    }
}
