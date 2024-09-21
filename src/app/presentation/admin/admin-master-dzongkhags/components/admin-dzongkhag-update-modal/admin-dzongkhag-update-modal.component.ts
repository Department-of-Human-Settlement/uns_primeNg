import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DzongkhagDTO } from 'src/app/core/models/location/dzongkhag.dto';
import { LocationDataService } from 'src/app/core/services/location.dataservice';

@Component({
    selector: 'app-admin-dzongkhag-update-modal',
    templateUrl: './admin-dzongkhag-update-modal.component.html',
    styleUrls: ['./admin-dzongkhag-update-modal.component.css'],
    standalone: true,
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
})
export class AdminDzongkhagUpdateModalComponent implements OnInit {
    dzongkhag: DzongkhagDTO;
    updateDzongkhagForm: FormGroup;
    constructor(
        private config: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private fb: FormBuilder,
        private locationDataService: LocationDataService
    ) {
        this.dzongkhag = this.config.data;

        this.updateDzongkhagForm = this.fb.group({
            name: [this.dzongkhag.name, [Validators.required]],
            nameDzongkha: [this.dzongkhag.nameDzongkha],
        });
    }

    ngOnInit() {
        this.patchValues();
    }

    patchValues() {
        const patchData: Partial<DzongkhagDTO> = {};
        if (this.dzongkhag.name) {
            patchData.name = this.dzongkhag.name;
        }
        if (this.dzongkhag.nameDzongkha) {
            patchData.nameDzongkha = this.dzongkhag.nameDzongkha;
        }

        this.updateDzongkhagForm.patchValue(patchData);
    }

    updateDzongkhag() {
        this.locationDataService
            .UpdateDzongkhag(this.dzongkhag.id, {
                name: this.updateDzongkhagForm.controls['name'].value,
                nameDzongkha:
                    this.updateDzongkhagForm.controls['nameDzongkha'].value,
            })
            .subscribe((res) => {
                console.log('UPDATED', res);
                this.ref.close({
                    status: 200,
                });
            });
    }
}
