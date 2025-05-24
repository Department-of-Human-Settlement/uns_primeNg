import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import {
    BuildingAssociativePositions,
    BuildingExistancyStatus,
    BuildingTypologies,
    NumberedDropDownOptions,
    PrimaryUses,
} from 'src/app/core/constants';
import { PARSEBUILDINGFLOORS } from 'src/app/core/helper-function';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';

@Component({
    selector: 'app-enumerator-building-details-tab',
    templateUrl: './enumerator-building-details-tab.component.html',
    styleUrls: ['./enumerator-building-details-tab.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        DividerModule,
        DropdownModule,
        InputTextModule,
        ButtonModule,
        ToastModule,
        InputNumberModule,
    ],
    providers: [MessageService],
})
export class EnumeratorBuildingDetailsTabComponent implements OnInit {
    @Input({
        required: true,
    })
    buildingDetails: BuildingDetailDto = {} as BuildingDetailDto;

    @Input({
        required: true,
    })
    buildingDetailsExists: boolean = false;

    @Output()
    buildingDetailsUpdated = new EventEmitter<BuildingDetailDto>();

    buildingExistancyOptions = BuildingExistancyStatus;
    buildingAssociativePositionOptions = BuildingAssociativePositions;
    buildingTypologies = BuildingTypologies;
    buildingUseOptions = PrimaryUses;
    buildingFloorOptions = NumberedDropDownOptions;

    buildingDetailsForm!: FormGroup;
    buildingId!: number;
    totalFloorCount: number = 0;

    floorConfig = PARSEBUILDINGFLOORS;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private buildingService: BuildingDetailDataService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.buildingId = Number(this.route.snapshot.params['buildingId']);
        this.initializeForm();
        this.fetchBuildingDetails();
    }

    initializeForm(): void {
        this.buildingDetailsForm = this.fb.group({
            existancyStatus: [''],
            associativePosition: [''],
            type: [''],
            typology: [''],
            use: [''],
            buildingName: [''],
            yearOfConstruction: [''],
            contact: [],
            jamthogCount: [0],
            atticCount: [0],
            regularFloorCount: [0],
            stiltCount: [0],
            basementCount: [0],
        });
    }

    fetchBuildingDetails(): void {
        this.buildingService
            .GetBuildingDetailsByBuildingId(this.buildingId)
            .subscribe({
                next: (details: BuildingDetailDto) => {
                    if (details) {
                        this.buildingDetails = details;
                        this.buildingDetailsExists = true;
                        console.log(details);
                        this.patchForm(details);
                    }
                },
                error: () => {
                    this.buildingDetailsExists = false;
                },
            });
    }

    patchForm(details: BuildingDetailDto): void {
        if (details) {
            this.buildingDetailsForm.patchValue({
                existancyStatus: details.existancyStatus,
                associativePosition: details.associativePosition,
                type: details.type,
                typology: details.typology,
                use: details.use,
                buildingName: details.buildingName,
                yearOfConstruction: details.yearOfConstruction,
                contact: details.contact,
                jamthogCount: details.jamthogCount,
                atticCount: details.atticCount,
                regularFloorCount: details.floorCount,
                stiltCount: details.stiltCount,
                basementCount: details.basementCount,
            });
        }

        this.updateTotalFloorCount();
    }

    updateTotalFloorCount(): void {
        const {
            jamthogCount,
            atticCount,
            regularFloorCount,
            stiltCount,
            basementCount,
        } = this.buildingDetailsForm.value;
        this.totalFloorCount =
            (jamthogCount || 0) +
            (atticCount || 0) +
            (regularFloorCount || 0) +
            (stiltCount || 0) +
            (basementCount || 0);
    }

    submitData(): void {
        if (this.buildingDetailsForm.invalid) {
            return;
        }

        const formData = this.buildingDetailsForm.value;
        const buildingDetails: BuildingDetailDto = {
            buildingId: this.buildingId,
            existancyStatus: formData.existancyStatus,
            associativePosition: formData.associativePosition,
            type: formData.type,
            typology: formData.typology,
            use: formData.use,
            buildingName: formData.buildingName,
            yearOfConstruction: Number(formData.yearOfConstruction || null),
            contact: Number(formData.contact || null),
            jamthogCount: Number(formData.jamthogCount || 0),
            atticCount: Number(formData.atticCount || 0),
            floorCount: Number(formData.regularFloorCount || 0),
            stiltCount: Number(formData.stiltCount || 0),
            basementCount: Number(formData.basementCount || 0),
        };
        console.log(buildingDetails);
        if (this.buildingDetailsExists) {
            this.buildingService
                .updateBuildingDetail(this.buildingId, buildingDetails)
                .subscribe({
                    next: (res) => {
                        this.buildingDetails = res;
                        this.buildingDetailsUpdated.emit(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Building details updated successfully!',
                        });
                    },
                });
        } else {
            this.buildingService
                .createBuildingDetail(buildingDetails)
                .subscribe({
                    next: (res) => {
                        this.buildingDetails = res;
                        this.buildingDetailsUpdated.emit(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Building details created successfully!',
                        });
                    },
                });
        }
    }
}
