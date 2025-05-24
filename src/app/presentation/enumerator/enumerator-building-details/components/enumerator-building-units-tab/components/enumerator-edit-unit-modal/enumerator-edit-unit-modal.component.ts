import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { UnitNumbers } from 'src/app/core/constants';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';

@Component({
    selector: 'app-enumerator-edit-unit-modal',
    templateUrl: './enumerator-edit-unit-modal.component.html',
    styleUrls: ['./enumerator-edit-unit-modal.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DropdownModule,
        InputTextModule,
        InputNumberModule,
    ],
})
export class EnumeratorEditUnitModalComponent implements OnInit {
    data;
    unit: UnitDto;
    floorsArray: string[] = [];
    unitNumbers: string[] = UnitNumbers;
    updatedUnitNumbers: string[] = [];
    buildingFloorOptions: number[] = Array.from(
        { length: 10 },
        (_, i) => i + 1
    );

    addUnitForm: FormGroup;

    yesNoOptions = [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
    ];

    constructor(
        private unitService: UnitDataService,
        private fb: FormBuilder,
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef
    ) {
        this.data = this.config.data;
        this.unit = this.data.unit;
        this.floorsArray = this.data.floorsArray;
        this.addUnitForm = this.fb.group({
            unitNumberPrefix: [],
            unitNumber: [],
            isLocked: [],
            isLegal: [],
            unitSpan: [],
        });
    }

    ngOnInit(): void {
        this.addUnitForm.patchValue({
            ...this.unit,
        });
    }

    update(): void {
        this.unitService
            .UpdateUnit(
                {
                    unitNumberPrefix:
                        this.addUnitForm.controls['unitNumberPrefix'].value!,
                    unitNumber: this.addUnitForm.controls['unitNumber'].value!,
                    isLocked: this.addUnitForm.controls['isLocked'].value!,
                    isLegal: this.addUnitForm.controls['isLegal'].value!,
                    unitSpan: this.addUnitForm.controls['unitSpan'].value!,
                },
                this.unit.id
            )
            .subscribe({
                next: () => {
                    this.ref.close({ status: 200 });
                },
            });
    }

    close(): void {
        this.ref.close({ status: 0 });
    }
}
