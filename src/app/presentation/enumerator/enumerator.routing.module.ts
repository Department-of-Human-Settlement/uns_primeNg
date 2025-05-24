import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnumeratorSelectZoneComponent } from './enumerator-select-zone/enumerator-select-zone.component';
import { EnumeratorLoadBuildingComponent } from './enumerator-load-building/enumerator-load-building.component';
import { EnumeratorBuildingDetailsComponent } from './enumerator-building-details/enumerator-building-details.component';

const routes: Routes = [
    { path: '', component: EnumeratorSelectZoneComponent },
    {
        path: 'load-buildings/:subZoneId',
        component: EnumeratorLoadBuildingComponent,
    },
    {
        path: 'building-details/:buildingId',
        component: EnumeratorBuildingDetailsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EnumeratorRoutingModule {}
