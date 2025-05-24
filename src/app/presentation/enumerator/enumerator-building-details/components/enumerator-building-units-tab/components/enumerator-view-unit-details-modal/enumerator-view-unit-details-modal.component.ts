import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { PrimaryUses, UnitOccupancyOption } from 'src/app/core/constants';
import { UnitDetailDto } from 'src/app/core/models/units/unit-detail.dto';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';

@Component({
    selector: 'app-enumerator-view-unit-details-modal',
    templateUrl: './enumerator-view-unit-details-modal.component.html',
    styleUrls: ['./enumerator-view-unit-details-modal.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ButtonModule,
        ReactiveFormsModule,
    ],
})
export class EnumeratorViewUnitDetailsModalComponent implements OnInit {
    unit: UnitDto;
    unitDetails: UnitDetailDto | null = null;
    unitDetailsForm: FormGroup;

    unitUses = PrimaryUses;
    unitOccupancyTypes = UnitOccupancyOption;

    constructor(
        private fb: FormBuilder,
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private unitDetailsService: UnitDataService
    ) {
        this.unit = this.config.data.unit;
        this.unitDetailsForm = this.fb.group({
            occupancyStatus: [],
            use: [],
            name: [],
            contact: [],
            numberOfBedrooms: [],
            totalFemale: [],
            totalMale: [],
            isRented: [],
            rent: [],
        });
    }

    ngOnInit(): void {
        this.unitDetailsService.GetUnitDetails(this.unit.id).subscribe({
            next: (res: UnitDetailDto) => {
                if (res) {
                    this.unitDetails = res;
                    console.log('UNIT DETAILS EXISTS');
                    this.unitDetailsForm.patchValue(this.unitDetails); // Patch the form with existing details
                } else {
                    console.log('UNIT DOES NOT EXIST');
                }
            },
            error: (err) => {
                console.error('Error fetching unit details:', err);
            },
        });
    }

    addOrUpdate(): void {
        if (this.unitDetails) {
            const updatedDetails: UnitDetailDto = this.unitDetailsForm.value;
            console.log(updatedDetails);
            this.unitDetailsService
                .UpdateUnitDetails(this.unit.id, updatedDetails)
                .subscribe({
                    next: (res: any) => {
                        console.log('Unit details updated successfully:', res);
                        this.unitDetails = res;
                        this.ref.close({ status: 200, data: res });
                    },
                    error: (err) => {
                        console.error('Failed to update unit details:', err);
                    },
                });
        } else {
            const newDetails: UnitDetailDto = {
                ...this.unitDetailsForm.value,
                unitId: this.unit.id,
            };
            console.log(newDetails);

            this.unitDetailsService.CreateUnitDetail(newDetails).subscribe({
                next: (res: any) => {
                    console.log('Unit details created successfully:', res);
                    this.unitDetails = res;
                    this.ref.close({ status: 201, data: res });
                },
                error: (err) => {
                    console.error('Failed to create unit details:', err);
                },
            });
        }
    }

    close(): void {
        this.ref.close({ status: 0 }); // Close the modal without making changes
    }
}
