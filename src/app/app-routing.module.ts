import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './presentation/layout/admin/admin-layout.component';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'admin',
                    component: AdminLayoutComponent,
                    children: [
                        // {
                        //     path: '',
                        //     loadChildren: () =>
                        //         import(
                        //             './presentation/admin/admin-advancedsearch/admin-advancedsearch.module'
                        //         ).then((m) => m.AdminAdvancedsearchModule),
                        // },
                        {
                            path: '',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-dashboard/admin-dashboard.module'
                                ).then((m) => m.AdminDashboardModule),
                        },
                        {
                            path: 'building-inventory',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-building-inventory/admin-building-inventory.module'
                                ).then((m) => m.AdminBuildingInventoryModule),
                        },
                        {
                            path: 'master-medianrents',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-master-medianrent/admin-master-medianrent-routing.module'
                                ).then(
                                    (m) => m.AdminMasterMedianrentRoutingModule
                                ),
                        },
                        {
                            path: 'master-dzongkhags',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-master-dzongkhags/admin-master-dzongkhags.module'
                                ).then((m) => m.AdminMasterDzongkhagsModule),
                        },
                        {
                            path: 'master-admzones',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-master-administrativezones/admin-master-administrativezones.module'
                                ).then(
                                    (m) =>
                                        m.AdminMasterAdministrativezonesModule
                                ),
                        },
                        {
                            path: 'master-building',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-master-building/admin-master-building.module'
                                ).then((m) => m.AdminMasterBuildingModule),
                        },
                        {
                            path: 'building-detailed/:buildingId',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-building-detailed-view/admin-building-detailed-view.module'
                                ).then(
                                    (m) => m.AdminBuildingDetailedViewModule
                                ),
                        },
                        {
                            path: 'master-owners',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-master-owner/admin-master-owner.module'
                                ).then((m) => m.AdminMasterOwnerModule),
                        },
                        {
                            path: 'write-access',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-write-access-control/admin-write-access-contorl.routing.module'
                                ).then(
                                    (m) =>
                                        m.AdminWriteAccessControlRoutingModule
                                ),
                        },
                    ],
                },

                // { path: '**', redirectTo: '/notfound' },
                {
                    path: '',
                    redirectTo: 'login',
                    pathMatch: 'full',
                },

                {
                    path: 'login',
                    loadChildren: () =>
                        import('./presentation/auth/login/login.module').then(
                            (m) => m.LoginModule
                        ),
                },
            ],

            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
