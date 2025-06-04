import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.data.service';

export const authGuard = (allowedRoles: string[]) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const messageService = inject(MessageService);

    const token = authService.getToken();
    if (!token) {
        messageService.add({
            severity: 'error',
            summary: 'Access Denied',
            detail: 'Please log in to access this page',
        });
        router.navigate(['/login']);
        return false;
    }

    const decodedToken = authService.decodeToken();
    if (!decodedToken || !decodedToken.role) {
        messageService.add({
            severity: 'error',
            summary: 'Invalid Session',
            detail: 'Your session has expired. Please log in again',
        });
        authService.removeToken();
        router.navigate(['/login']);
        return false;
    }

    if (!allowedRoles.includes(decodedToken.role)) {
        messageService.add({
            severity: 'error',
            summary: 'Access Denied',
            detail: 'You do not have permission to access this page',
        });

        // Redirect to appropriate page based on role
        if (decodedToken.role === 'admin') {
            router.navigate(['/admin']);
        } else if (decodedToken.role === 'enumerator') {
            router.navigate(['/enum']);
        } else {
            router.navigate(['/login']);
        }
        return false;
    }

    return true;
};
