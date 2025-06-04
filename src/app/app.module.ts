import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AdminLayoutModule } from './presentation/layout/admin/admin-layout.module';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
    declarations: [AppComponent],
    imports: [
        AppRoutingModule,
        AdminLayoutModule,
        ToastModule,
        HttpClientModule,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        MessageService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private messageService: MessageService) {}
}
