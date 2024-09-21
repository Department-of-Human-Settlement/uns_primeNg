import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { UserRoles } from 'src/app/core/constants';
import { UpdateUserDTO, UserDTO } from 'src/app/core/models/users/user.dto';
import { UserDataService } from 'src/app/core/services/user.dataservice';

@Component({
    selector: 'app-admin-edit-user-modal',
    templateUrl: './admin-edit-user-modal.component.html',
    styleUrls: ['./admin-edit-user-modal.component.css'],
    standalone: true,
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
})
export class AdminEditUserModalComponent implements OnInit {
    updateUserForm: FormGroup;

    user: UserDTO;

    constructor(
        private fb: FormBuilder,
        private ref: DynamicDialogRef,
        private config: DynamicDialogConfig,
        private userDataService: UserDataService
    ) {
        this.updateUserForm = this.fb.group({
            fullName: [],
            cid: [],
            designation: [],
            workingAgency: [],
            role: [],
        });
    }

    ngOnInit() {
        this.user = this.config.data;

        this.updateUserForm.patchValue({
            ...this.user,
        });
    }
    updateUser() {
        const updateData: UpdateUserDTO = {
            cid: this.updateUserForm.controls['cid'].value,
            fullName: this.updateUserForm.controls['fullName'].value,
            role: UserRoles.ENUMERATORS,
            designation: this.updateUserForm.controls['designation'].value,
            workingAgency: this.updateUserForm.controls['workingAgency'].value,
        };

        console.log('UDPATING USER', updateData);
        this.userDataService.UpdateUser(this.user.id, updateData).subscribe({
            next: (res) => {
                console.log(res);
                if (res) {
                    this.ref.close({
                        status: 200,
                    });
                }
            },
            error: (err) => {
                console.log(err);
            },
        });
    }
}
