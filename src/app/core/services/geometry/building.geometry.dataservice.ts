import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { API_URL } from '../../constants/constants';
import { BuildingGeomDTO } from '../../models/geometry/building-geom.dto';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BuildingGeometryDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    GetBuildingFootprintByBuilding(
        buildingId: number
    ): Observable<BuildingGeomDTO> {
        return this.http.get<BuildingGeomDTO>(
            `${this.apiUrl}/building-geom/building/${buildingId}`
        );
    }

    GetBuildingFootprintsBySubAdminZone(
        subAdminZoneId: number
    ): Observable<BuildingGeomDTO> {
        return this.http.get<BuildingGeomDTO>(
            `${this.apiUrl}/building-geom/sub-admin/${subAdminZoneId}`
        );
    }
}
