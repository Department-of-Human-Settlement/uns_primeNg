import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_URL } from './constants';

@Injectable({
    providedIn: 'root',
})
export class BuildingDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    GetBuildingById(buildingId: number) {
        return this.http.get(`${this.apiUrl}/building/${buildingId}`);
    }

    DeleteBuilding(buildingId: number) {
        return this.http.delete(`${this.apiUrl}/building/${buildingId}`);
    }
}