import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_URL } from '../constants/constants';
import { Observable } from 'rxjs';
import { UnitDto } from '../models/units/unit.dto';

@Injectable({
    providedIn: 'root',
})
export class UnitDataService {
    apiUrl = API_URL;
    constructor(private http: HttpClient) {}

    CreateUnit(data: any) {
        return this.http.post(`${this.apiUrl}/unit`, data);
    }

    CreateUnitDetail(data: any) {
        return this.http.post(`${this.apiUrl}/unit-detail`, data);
    }

    UpdateUnitByUnitId(data: any, unitId: number) {
        return this.http.patch(`${this.apiUrl}/unit/${unitId}`, data);
    }

    GetAllUnitsByBuilding(buildingId: number): Observable<UnitDto[]> {
        return this.http.get<UnitDto[]>(
            `${this.apiUrl}/unit/bid/${buildingId}`
        );
    }

    GetUnitById(unitId: number) {
        return this.http.get(`${this.apiUrl}/unit/${unitId}`);
    }

    GetUnitDetails(unitId: number) {
        return this.http.get(`${this.apiUrl}/unit-detail/uid/${unitId}`);
    }

    DeleteUnitAndDetails(unitId: number) {
        return this.http.delete(`${this.apiUrl}/unit/${unitId}`);
    }

    UpdateUnitDetails(unitId: number, data) {
        return this.http.patch(
            `${this.apiUrl}/unit-detail/uid/${unitId}`,
            data
        );
    }

    UpdateUnit(data: any, unitId: number) {
        return this.http.patch(`${this.apiUrl}/unit/${unitId}`, data);
    }

    GetUnitsByFloorLevelAndBuildingPoints(
        buildingPointId: number,
        level: string
    ) {
        return this.http.get<UnitDto[]>(
            `${this.apiUrl}/unit/by-building-level/${buildingPointId}/${level}`
        );
    }

    ValidateUnitQr(qrUuid: string) {
        return this.http.get(`${this.apiUrl}/unit/validate-qr/${qrUuid}`);
    }

    MapUnitQr(data: any) {
        return this.http.post(`${this.apiUrl}/unit/map-qr`, data);
    }
}
