import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { UserDTO } from 'src/app/core/models/users/user.dto';
import { UserDataService } from 'src/app/core/services/user.dataservice';
import { AdminEditUserModalComponent } from './components/admin-edit-user-modal/admin-edit-user-modal.component';
import { AdminAssignSubadminzoneRightsModalComponent } from './components/admin-assign-subadminzone-rights-modal/admin-assign-subadminzone-rights-modal.component';

@Component({
    selector: 'app-admin-write-access-control',
    templateUrl: './admin-write-access-control.component.html',
    styleUrls: ['./admin-write-access-control.component.css'],
    standalone: true,
    imports: [TableModule, ButtonModule],
    providers: [DialogService],
})
export class AdminWriteAccessControlComponent implements OnInit {
    usersWithSubAdminZoneRight: UserDTO[] = [];
    ref: DynamicDialogRef;

    constructor(
        private userDataService: UserDataService,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        this.getAllUsers();
    }

    getAllUsers() {
        this.userDataService.GetAllUsers().subscribe((res) => {
            console.log('ALL USERS', res);
            this.usersWithSubAdminZoneRight = res;
        });
    }

    openUpdateUserModal(user: UserDTO) {
        this.ref = this.dialogService.open(AdminEditUserModalComponent, {
            header: 'Update User',
            data: {
                ...user,
            },
        });
        this.ref.onClose.subscribe((res) => {
            if (res && res.status === 200) {
                this.getAllUsers();
            }
        });
    }

    deleteUser(user: UserDTO) {
        alert('DELETE ' + user.fullName);
    }
    openAssignSubAdminRightsModal(user: UserDTO) {
        this.ref = this.dialogService.open(
            AdminAssignSubadminzoneRightsModalComponent,
            {
                header: 'Update User',
                data: {
                    ...user,
                },
            }
        );
    }
}
