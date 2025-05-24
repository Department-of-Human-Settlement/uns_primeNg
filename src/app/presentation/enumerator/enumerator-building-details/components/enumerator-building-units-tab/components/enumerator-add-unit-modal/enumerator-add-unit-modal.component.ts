import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { UnitNumbers } from 'src/app/core/constants';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';

@Component({
    selector: 'app-enumerator-add-unit-modal',
    templateUrl: './enumerator-add-unit-modal.component.html',
    styleUrls: ['./enumerator-add-unit-modal.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        DividerModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ReactiveFormsModule,
    ],
})
export class EnumeratorAddUnitModalComponent implements OnInit {
    data;
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
        this.floorsArray = this.data.floorsArray;

        this.addUnitForm = this.fb.group({
            unitNumberPrefix: [],
            unitNumber: [],
            isLocked: [0],
            isLegal: [1],
            unitSpan: [1],
        });
    }

    ngOnInit(): void {
        this.addUnitForm.patchValue({
            unitNumberPrefix: this.data.selectedFloor,
            unitNumber: this.unitNumbers[0],
        });
    }

    addNewUnit(): void {
        const data = {
            buildingId: this.data.buildingId,
            unitNumberPrefix:
                this.addUnitForm.controls['unitNumberPrefix'].value!,
            unitNumber: this.addUnitForm.controls['unitNumber'].value!,
            isLocked: Boolean(this.addUnitForm.controls['isLocked'].value!),
            isLegal: Boolean(this.addUnitForm.controls['isLegal'].value!),
            unitSpan: this.addUnitForm.controls['unitSpan'].value!,
        };

        this.unitService.CreateUnit(data).subscribe({
            next: () => {
                this.ref.close({ status: 201 });
            },
            error: () => {},
        });
    }

    close(): void {
        this.ref.close({ status: 0 });
    }
}
