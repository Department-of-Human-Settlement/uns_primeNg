import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './presentation/layout/admin/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'admin',
                    component: AdminLayoutComponent,
                    canActivate: [() => authGuard(['admin'])],
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-advancedsearch/admin-advancedsearch.module'
                                ).then((m) => m.AdminAdvancedsearchModule),
                        },
                        {
                            path: 'building-inventory',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-building-inventory/admin-building-inventory.module'
                                ).then((m) => m.AdminBuildingInventoryModule),
                        },
                        {
                            path: 'correction-requests',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/building-information-corrections/admin-building-information-corrections-routing.module'
                                ).then(
                                    (m) =>
                                        m.AdminBuildingInformationCorrectionsRoutingModule
                                ),
                        },
                        {
                            path: 'taxation',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/taxation/admin-building-information-corrections-routing.module'
                                ).then(
                                    (m) => m.AdminBuildingTaxationRoutingModule
                                ),
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
                    ],
                },
                {
                    path: 'enum',
                    canActivate: [() => authGuard(['enumerator'])],
                    loadChildren: () =>
                        import(
                            './presentation/enumerator/enumerator.routing.module'
                        ).then((m) => m.EnumeratorRoutingModule),
                },

                {
                    path: '',
                    redirectTo: 'login',
                    pathMatch: 'full',
                },
                {
                    path: 'public',
                    loadChildren: () =>
                        import(
                            './presentation/public/public.routing.module'
                        ).then((m) => m.PublicRoutingModule),
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
