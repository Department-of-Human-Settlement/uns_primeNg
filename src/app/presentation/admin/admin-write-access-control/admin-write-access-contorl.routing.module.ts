import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminWriteAccessControlComponent } from './admin-write-access-control.component';

const routes: Routes = [
    { path: '', component: AdminWriteAccessControlComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminWriteAccessControlRoutingModule {}
