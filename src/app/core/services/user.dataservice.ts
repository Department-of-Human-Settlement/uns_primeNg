import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL, AUTHTOKENKEY } from '../constants/constants';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';
import { UserDTO } from '../models/users/user.dto';

@Injectable({
    providedIn: 'root',
})
export class UserDataService {
    apiUrl = API_URL;
    tokenName = AUTHTOKENKEY;

    constructor(private http: HttpClient, private router: Router) {}

    GetAllUsers(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.apiUrl}/users`);
    }

    UpdateUser(id, data) {
        return this.http.patch(`${this.apiUrl}/users/${id}`, data);
    }
}
