import { Component, Input, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { QRCodeModule } from 'angularx-qrcode';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EnumeratorEditUnitModalComponent } from './components/enumerator-edit-unit-modal/enumerator-edit-unit-modal.component';
import { EnumeratorAddUnitModalComponent } from './components/enumerator-add-unit-modal/enumerator-add-unit-modal.component';
import { PARSEBUILDINGFLOORS } from 'src/app/core/helper-function';
import { EnumeratorViewUnitDetailsModalComponent } from './components/enumerator-view-unit-details-modal/enumerator-view-unit-details-modal.component';
import { EnumeratorUnitQrViewModalComponent } from './components/enumerator-unit-qr-view-modal/enumerator-unit-qr-view-modal.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-enumerator-building-units-tab',
    templateUrl: './enumerator-building-units-tab.component.html',
    styleUrls: ['./enumerator-building-units-tab.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        DropdownModule,
        ButtonModule,
        DividerModule,
        RouterModule,
        QRCodeModule,
        ConfirmDialogModule,
        DividerModule,
    ],
    providers: [DialogService, ConfirmationService],
})
export class EnumeratorBuildingUnitsTabComponent implements OnInit {
    @Input() buildingDetails: BuildingDetailDto = {} as BuildingDetailDto;
    @Input() buildingId: number = 1;

    floorsArray: string[] = [];
    units: UnitDto[] = [];

    selectedFloor: string = '';

    ref: DynamicDialogRef;

    getFloorConfig = PARSEBUILDINGFLOORS;
    totalFloorCount: number = 0;

    constructor(
        private unitService: UnitDataService,
        private router: Router,
        private dialogService: DialogService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {}
    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes['buildingDetails'] &&
            changes['buildingDetails'].currentValue
        ) {
            if (this.buildingDetails.floorCount) {
                this.floorsArray = this.initalizeFloorsArray(
                    this.buildingDetails
                );
                this.totalFloorCount = this.floorsArray.length;
                this.selectedFloor = this.floorsArray[0].toString();

                this.getUnitsByFloorLevel();
            }
        }
    }

    openAddUnitsModal(): void {
        this.ref = this.dialogService.open(EnumeratorAddUnitModalComponent, {
            header: 'Add Unit',
            data: {
                buildingId: this.buildingId,
                buildingDetails: this.buildingDetails,
                selectedFloor: this.selectedFloor,
                floorsArray: this.floorsArray,
            },
        });
        this.ref.onClose.subscribe((res) => {
            if (res && res.status === 200) {
                this.getUnitsByFloorLevel();
            }
        });
    }

    getUnitsByFloorLevel(): void {
        this.unitService
            .GetUnitsByFloorLevelAndBuildingPoints(
                this.buildingId,
                this.selectedFloor
            )
            .subscribe((res) => {
                console.log(res, 'UNITBY FLOOR');
                this.units = res;
            });
    }

    initalizeFloorsArray(buildingDetails: any): string[] {
        const arr: string[] = [];
        for (let i = buildingDetails.basementCount; i >= 1; i--) {
            arr.push(i === 1 ? 'B' : `${i}B`);
        }
        const maxFloor =
            buildingDetails.floorCount +
            buildingDetails.stiltCount +
            buildingDetails.atticCount +
            buildingDetails.jamthogCount;
        for (let i = 1; i <= maxFloor; i++) {
            arr.push(i.toString());
        }

        return arr;
    }

    openEditUnitModal(unit: UnitDto): void {
        this.ref = this.dialogService.open(EnumeratorEditUnitModalComponent, {
            header: 'Edit Unit',
            data: {
                unit: unit,
                buildingDetails: this.buildingDetails,
                selectedFloor: this.selectedFloor,
                floorsArray: this.floorsArray,
            },
        });
        this.ref.onClose.subscribe((res) => {
            if (res && res.status === 200) {
                this.getUnitsByFloorLevel();
            }
        });
    }

    openViewUnitDetails(unit: UnitDto): void {
        this.ref = this.dialogService.open(
            EnumeratorViewUnitDetailsModalComponent,
            {
                header: 'Unit Details',
                data: {
                    unit: unit,
                },
            }
        );
        this.ref.onClose.subscribe((res) => {
            if (res && res.status === 200) {
                this.getUnitsByFloorLevel();
            }
        });
    }

    openViewUnitQR(unit: UnitDto) {
        this.ref = this.dialogService.open(EnumeratorUnitQrViewModalComponent, {
            header: 'Unit QR',
            width: '100%',
            data: unit,
        });
        this.ref.onClose.subscribe((res) => {
            if (res && res.success) {
                this.getUnitsByFloorLevel();
            }
        });
    }

    confirmDeleteUnit(unit: UnitDto): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this unit?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.unitService.DeleteUnitAndDetails(unit.id).subscribe({
                    next: (res) => {
                        console.log('Unit deleted successfully:', res);
                        this.getUnitsByFloorLevel();
                    },
                    error: (err) => {
                        console.error('Failed to delete unit:', err);
                    },
                });
            },
            reject: () => {
                console.log('Delete action canceled.');
            },
        });
    }
}
