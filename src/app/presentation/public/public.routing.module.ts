import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicHomeComponent } from './public-home/public-home.component';
import { PublicScanQrCodeComponent } from './components/public-scan-qr-code/public-scan-qr-code.component';

const routes: Routes = [
    {
        path: '',
        component: PublicHomeComponent,
    },
    {
        path: 'scan',
        component: PublicScanQrCodeComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PublicRoutingModule {}
