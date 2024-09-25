import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AdminLayoutService } from '../service/admin-layout.service';

@Component({
    selector: 'app-admin-menu',
    templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit {
    model: any[] = [];

    constructor(public layoutService: AdminLayoutService) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/admin'],
                    },
                ],
            },
            {
                label: 'Search',
                items: [
                    {
                        label: 'Search',
                        icon: 'pi pi-fw pi-search',
                        routerLink: ['/admin/search'],
                    },
                ],
            },
            {
                label: 'Database',
                items: [
                    {
                        label: 'Buildings Inventory',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/building-inventory'],
                    },
                ],
            },
            {
                label: 'Master',
                items: [
                    {
                        label: 'Dzongkhags',
                        icon: 'pi pi-fw pi-th-large',
                        routerLink: ['/admin/master-dzongkhags'],
                    },
                    {
                        label: 'Admnistrative Zones',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/master-admzones'],
                    },
                    {
                        label: 'Sub Adminstrative Zones',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/master-subadmzones'],
                    },
                    {
                        label: 'Median Rents',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/master-medianrents'],
                    },
                    {
                        label: 'Owners',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/master-owners'],
                    },
                ],
            },
            {
                label: 'System',
                items: [
                    {
                        label: 'Write Access',
                        icon: 'pi pi-fw pi-th-large',
                        routerLink: ['/admin/write-access'],
                    },
                    {
                        label: 'Audit Logs',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/master-admzones'],
                    },
                ],
            },
        ];
    }
}
