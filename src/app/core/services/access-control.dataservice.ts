import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL, AUTHTOKENKEY } from '../constants/constants';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';
import { UserDTO } from '../models/users/user.dto';
import {
    CreateSubAdminZoneRightsByAdminZoneDTO,
    CreateSubAdminZoneRightsByDzongkhagDTO,
    CreateSubAdminZoneRightsBySubAdminZoneDTO,
    ResultCreateByDzongkhagAndAdminDTO,
    SubAdminZoneRightDTO,
} from '../models/access-control.dto';

@Injectable({
    providedIn: 'root',
})
export class SubAdminZoneRightsDataService {
    apiUrl = API_URL;
    tokenName = AUTHTOKENKEY;

    constructor(private http: HttpClient, private router: Router) {}

    CreateSubAdminZoneRightsByDzongkhag(
        data: CreateSubAdminZoneRightsByDzongkhagDTO
    ): Observable<ResultCreateByDzongkhagAndAdminDTO> {
        return this.http.post<ResultCreateByDzongkhagAndAdminDTO>(
            `${this.apiUrl}/sub-admin-zone-right/by-dzongkhags`,
            data
        );
    }

    CreateSubAdminZoneRightsByAdminZones(
        data: CreateSubAdminZoneRightsByAdminZoneDTO
    ): Observable<ResultCreateByDzongkhagAndAdminDTO> {
        return this.http.post<ResultCreateByDzongkhagAndAdminDTO>(
            `${this.apiUrl}/sub-admin-zone-right/by-admin-zones`,
            data
        );
    }

    CreateSubAdminZoneRightsBySubAdminZones(
        data: CreateSubAdminZoneRightsBySubAdminZoneDTO
    ): Observable<ResultCreateByDzongkhagAndAdminDTO> {
        return this.http.post<ResultCreateByDzongkhagAndAdminDTO>(
            `${this.apiUrl}/sub-admin-zone-right/by-sub-admin-zones`,
            data
        );
    }

    GetSubAdminRightsByUser(
        userId: number
    ): Observable<SubAdminZoneRightDTO[]> {
        return this.http.get<SubAdminZoneRightDTO[]>(
            `${this.apiUrl}/sub-admin-zone-right/user/${userId}`
        );
    }

    DeleteSubAdminRight(subAdminRightId: number) {
        return this.http.delete(
            `${this.apiUrl}/sub-admin-zone-right/${subAdminRightId}`
        );
    }
}
