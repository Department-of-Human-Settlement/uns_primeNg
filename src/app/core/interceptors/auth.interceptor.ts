import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.data.service';
import { PUBLIC_ROUTES } from '../constants/auth.constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private messageService: MessageService,
        private authService: AuthService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        // Skip authentication for public routes
        const isPublicRoute = PUBLIC_ROUTES.some(
            (route) =>
                request.url.includes(route) || request.url.includes('assets/')
        );

        if (isPublicRoute) {
            return next.handle(request);
        }

        // Get the auth token from the service
        const authToken = this.authService.getToken();

        // Clone the request and add the Authorization header
        const authRequest = request.clone({
            headers: request.headers.set(
                'Authorization',
                `Bearer ${authToken}`
            ),
        });

        // Pass the cloned request instead of the original request to the next handle
        return next.handle(authRequest).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Token expired or invalid
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Session Expired',
                        detail: 'Your session has expired. Please log in again.',
                    });
                    this.authService.removeToken();
                    this.router.navigate(['/login']);
                } else if (error.status === 403) {
                    // Forbidden - user doesn't have required permissions
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Access Denied',
                        detail: 'You do not have permission to perform this action',
                    });
                    const decodedToken = this.authService.decodeToken();
                    if (decodedToken?.role === 'admin') {
                        this.router.navigate(['/admin']);
                    } else if (decodedToken?.role === 'enumerator') {
                        this.router.navigate(['/enum']);
                    }
                }
                return throwError(() => error);
            })
        );
    }
}
