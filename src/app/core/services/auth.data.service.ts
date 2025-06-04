import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL, AUTHTOKENKEY } from '../constants/constants';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';

export interface AuthenticatedUserDTO {
    userId: number;
    cid: string;
    fullName: string;
    role: string;
}
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    apiUrl = API_URL;
    tokenName = AUTHTOKENKEY;
    private currentUserSubject: BehaviorSubject<AuthenticatedUserDTO>;
    public currentUser: Observable<AuthenticatedUserDTO>;
    private tokenExpirationTimer: any;

    constructor(
        private http: HttpClient,
        private router: Router,
        private messageService: MessageService
    ) {
        this.currentUserSubject = new BehaviorSubject<AuthenticatedUserDTO>(
            this.decodeToken()
        );
        this.currentUser = this.currentUserSubject.asObservable();
        this.autoLogout();
    }

    Login(data) {
        return this.http.post(`${this.apiUrl}/auth/login`, data);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenName);
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenName, token);
        const decodedToken = this.decodeToken();
        if (decodedToken) {
            this.currentUserSubject.next(decodedToken);
            this.autoLogout();
        }
    }

    removeToken(): void {
        localStorage.removeItem(this.tokenName);
        this.currentUserSubject.next(null);
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.messageService.add({
            severity: 'info',
            summary: 'Logged Out',
            detail: 'You have been logged out successfully',
        });
    }

    decodeToken(): AuthenticatedUserDTO {
        const token = this.getToken();
        if (token) {
            try {
                const decoded = jwt_decode.jwtDecode(token);
                return decoded as AuthenticatedUserDTO;
            } catch (error) {
                this.removeToken();
                return null;
            }
        }
        return null;
    }

    getCurrentUser(): AuthenticatedUserDTO {
        return this.currentUserSubject.value;
    }

    isLoggedIn(): boolean {
        return !!this.getCurrentUser();
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    private autoLogout(): void {
        const token = this.getToken();
        if (!token) return;

        try {
            const decoded: any = jwt_decode.jwtDecode(token);
            const expirationTime = decoded.exp * 1000; // Convert to milliseconds
            const timeUntilExpiration = expirationTime - Date.now();

            if (timeUntilExpiration <= 0) {
                this.removeToken();
                return;
            }

            // Set auto logout when token expires
            this.tokenExpirationTimer = setTimeout(() => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Session Expired',
                    detail: 'Your session has expired. Please log in again.',
                });
                this.removeToken();
                this.router.navigate(['/login']);
            }, timeUntilExpiration);

            // Show warning 5 minutes before expiration
            if (timeUntilExpiration > 5 * 60 * 1000) {
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Session Ending Soon',
                        detail: 'Your session will expire in 5 minutes',
                    });
                }, timeUntilExpiration - 5 * 60 * 1000);
            }
        } catch (error) {
            this.removeToken();
        }
    }

    handleLoginRouting(role: string) {
        if (role === 'admin') {
            this.router.navigate(['/admin']);
        } else if (role === 'enumerator') {
            this.router.navigate(['/enum']);
        } else {
            this.router.navigate(['/login']);
        }
    }
}
