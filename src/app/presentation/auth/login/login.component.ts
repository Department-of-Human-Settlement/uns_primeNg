import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.data.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        PasswordModule,
        RouterModule,
        ToastModule,
        CommonModule,
        DividerModule,
        RippleModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: [MessageService],
})
export class LoginComponent implements OnInit {
    valCheck: string[] = ['remember'];

    password!: string;
    username!: string;
    remember: boolean = true;
    isLoading: boolean = false;
    token!: string;

    decodedToken: any;

    constructor(
        private authDataService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) {}
    ngOnInit(): void {
        this.token = this.authDataService.getToken();

        if (this.token) {
            this.decodedToken = this.authDataService.decodeToken();
            // setTimeout(() => {
            //     this.messageService.add({
            //         severity: 'info',
            //         summary: 'Checking for saved User Credentials',
            //     });
            // }, 0);
            // setTimeout(() => {
            //     this.messageService.add({
            //         severity: 'success',
            //         summary: 'Credentials saved for this session',
            //     });
            // }, 1000);
            // setTimeout(() => {
            //     this.router.navigate(['/admin']);
            // }, 2000);
        }
    }

    login() {
        this.isLoading = true;
        if (!this.username || !this.password) {
            this.isLoading = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter both username and password',
            });
            return;
        }

        this.authDataService
            .Login({
                cid: this.username,
                password: this.password,
            })
            .subscribe({
                next: (res: any) => {
                    if (res.statusCode === 200 && res.token) {
                        this.authDataService.setToken(res.token);
                        this.token = res.token;
                        this.decodedToken = this.authDataService.decodeToken();

                        if (this.decodedToken?.role) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Welcome to Zhichar.bt',
                                detail: `Successfully logged in as ${this.decodedToken.role}`,
                            });
                            this.authDataService.handleLoginRouting(
                                this.decodedToken.role
                            );
                        }
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Login Failed',
                            detail: 'Invalid response from server',
                        });
                    }
                },
                error: (error) => {
                    console.error('Login error:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Login Failed',
                        detail:
                            error.error?.message ||
                            'Unable to login. Please try again.',
                    });
                },
            });
    }

    tokenExistsContinue() {
        this.decodedToken = this.authDataService.decodeToken();

        this.navigate(this.decodedToken.role);
    }
    navigate(role: string) {
        if (role === 'enumerator') {
            this.router.navigate(['/enum']);
        } else if (role === 'admin') {
            this.router.navigate(['/admin']);
        }
    }

    removeToken() {
        this.authDataService.removeToken();
        this.token = null;
    }

    navigateToBuildingInformationCorrectionPage() {
        this.router.navigate(['/public']);
    }
    navigateToQrCodeScan() {
        this.router.navigate(['/public/scan']);
    }
}
