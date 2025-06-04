import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AdminLayoutService } from '../service/admin-layout.service';
import {
    AuthenticatedUserDTO,
    AuthService,
} from 'src/app/core/services/auth.data.service';

@Component({
    selector: 'app-admin-topbar',
    templateUrl: './admin-topbar.component.html',
    styleUrls: ['./admin-topbar.component.css'],
})
export class AdminTopbarComponent {
    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    authenticatedUser: AuthenticatedUserDTO;
    constructor(
        public layoutService: AdminLayoutService,
        private authService: AuthService
    ) {
        this.authenticatedUser = this.authService.decodeToken();
    }
}
