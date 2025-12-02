import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import {
    BuildingAssociativePositions,
    BuildingExistancyStatus,
    BuildingType,
    NumberedDropDownOptions,
    PrimaryUses,
} from 'src/app/core/constants';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { InputTextModule } from 'primeng/inputtext';

interface BuildingDetails {
    buildingName: any;
    buildingId: number;
    existancyStatus: string;
    associativePosition: string;
    type: string;
    use: string;
    floorCount: number;
    basementCount: number;
    stiltCount: number;
    atticCount: number;
    jamthogCount: number;
}

@Component({
    selector: 'app-edit-building-modal',
    standalone: true,
    imports: [
        ToastModule,
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        DropdownModule,
        InputTextModule,
    ],
    templateUrl: './edit-building-modal.component.html',
    styleUrl: './edit-building-modal.component.scss',
})
export class EditBuildingModalComponent implements OnInit {
    isEdit: boolean = false;
    buildingExistancyStatus: any[];
    selectedBuildingExistancy: any;
    buildingName: string;

    casId: string;
    buildingAssociativePositionOptions: any[];
    selectedAssociativePosition: any;

    buildingUseOptions: any[];
    selectedUse: any;

    buildingFloorOptions: any[];
    selectedBuildingFloor: any;

    buildingTypeOptions: any[];
    selectedBuildingType: any;

    jamthogCount: number = 0;
    atticCount: number = 0;
    stiltCount: number = 0;
    basementCount: number = 0;
    regularFloorCount: number = 0;
    totalFloorCount: number = 0;

    buildingDetails: BuildingDetails;
    buildingId: number;

    isButtonPressed: boolean = false;

    instance: DynamicDialogComponent | undefined;

    constructor(
        private dialogService: DialogService,
        public ref: DynamicDialogRef,
        private buildingDetailService: BuildingDetailDataService,
        public messageService: MessageService
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
            this.isEdit = this.instance.data.isEdit;
            if (this.isEdit) {
                this.buildingDetails = this.instance.data.buildingDetails;
            }
        }
    }

    ngOnInit(): void {
        this.buildingExistancyStatus = BuildingExistancyStatus;
        this.buildingAssociativePositionOptions = BuildingAssociativePositions;
        this.buildingUseOptions = PrimaryUses;
        this.buildingFloorOptions = NumberedDropDownOptions;
        this.buildingTypeOptions = BuildingType;

        if (this.isEdit) {
            this.updateExisting();
        }
    }

    updateExisting() {
        this.selectedBuildingExistancy = this.buildingDetails.existancyStatus;
        this.selectedAssociativePosition =
            this.buildingDetails.associativePosition;
        this.selectedBuildingType = this.buildingDetails.type;
        this.selectedUse = this.buildingDetails.use;
        this.buildingName = this.buildingDetails.buildingName;
        this.jamthogCount = this.buildingDetails.jamthogCount;
        this.atticCount = this.buildingDetails.atticCount;
        this.regularFloorCount = this.buildingDetails.floorCount;
        this.stiltCount = this.buildingDetails.stiltCount;
        this.basementCount = this.buildingDetails.basementCount;
    }

    async create() {
        this.ref.close({
            casId: this.casId,
        });
        this.isButtonPressed = true;
        this.buildingDetails = {
            buildingId: this.buildingId,
            existancyStatus: this.selectedBuildingExistancy,
            associativePosition: this.selectedAssociativePosition,
            type: this.selectedBuildingType,
            use: this.selectedUse,
            buildingName: this.buildingName,
            floorCount: this.regularFloorCount,
            basementCount: this.basementCount,
            stiltCount: this.stiltCount,
            atticCount: this.atticCount,
            jamthogCount: this.jamthogCount,
        };
        const result = await this.buildingDetailService
            .createBuildingDetail(this.buildingDetails)
            .toPromise();

        if (result) {
            this.ref.close({
                dataChanged: true,
            });
        } else {
            this.isButtonPressed = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Building Details could not be created',
                detail: 'Building Details could not be created',
            });
        }
    }

    async update() {
        this.ref.close({
            casId: this.casId,
        });
        this.buildingDetails = {
            buildingId: this.buildingId,
            existancyStatus: this.selectedBuildingExistancy,
            associativePosition: this.selectedAssociativePosition,
            type: this.selectedBuildingType,
            use: this.selectedUse,
            floorCount: this.regularFloorCount,
            basementCount: this.basementCount,
            stiltCount: this.stiltCount,
            buildingName: this.buildingName,
            atticCount: this.atticCount,
            jamthogCount: this.jamthogCount,
        };
        const result = await this.buildingDetailService
            .updateBuildingDetail(this.buildingId, this.buildingDetails)
            .toPromise();

        if (result) {
            this.ref.close({
                dataChanged: true,
                casId: this.casId,
            });
        } else {
            this.isButtonPressed = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Building Details could not be created',
                detail: 'Building Details could not be created',
            });
        }
    }
}
