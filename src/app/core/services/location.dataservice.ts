import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { API_URL } from '../constants/constants';
import { Observable } from 'rxjs';
import { DzongkhagDTO } from '../models/location/dzongkhag.dto';
import { AdminZoneDTO } from '../models/location/adminstrative-zone.dto';
import { SubAdminZoneDTO } from '../models/location/subadministrative-zone.dto';

@Injectable({
    providedIn: 'root',
})
export class LocationDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    GetAllDzonghags(): Observable<DzongkhagDTO[]> {
        return this.http.get<DzongkhagDTO[]>(`${this.apiUrl}/dzongkhag`);
    }

    UpdateDzongkhag(dzongkhagId: number, data) {
        return this.http.patch(`${this.apiUrl}/dzongkhag/${dzongkhagId}`, data);
    }

    GetAllAdministrativeZonesByDzongkhag(
        dzongkhagId: number
    ): Observable<AdminZoneDTO[]> {
        return this.http.get<AdminZoneDTO[]>(
            `${this.apiUrl}/administrative-zone/dzongkhag/${dzongkhagId}`
        );
    }
    GetAllSubAdministrativeZonesByAdministrativeZone(
        administrativeZoneId: number
    ): Observable<SubAdminZoneDTO[]> {
        return this.http.get<SubAdminZoneDTO[]>(
            `${this.apiUrl}/sub-administrative-zone/adm-zone/${administrativeZoneId}`
        );
    }
}
