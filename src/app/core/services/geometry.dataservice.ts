import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { API_URL } from '../constants/constants';

@Injectable({
    providedIn: 'root',
})
export class GeometryDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    postBuildingPoint(data) {
        return this.http.post(`${this.apiUrl}/building`, data);
    }

    postBuildingGeom(data) {
        return this.http.post(`${this.apiUrl}/building-footprint`, data);
    }

    updateBuildingGeom(buildingId: number, data) {
        return this.http.patch(
            `${this.apiUrl}/building-footprint/geometry/${buildingId}`,
            data
        );
    }

    deleteBuildingFootPrint(id: number) {
        return this.http.delete(`${this.apiUrl}/building-footprint/${id}`);
    }

    updateBuildingGeomBuildingId(buildingId: number, polygonId: number) {
        let data = {
            polygonId: polygonId,
            buildingId: buildingId,
        };
        return this.http.patch(`${this.apiUrl}/building-footprint/bid`, data);
    }

    postBuildingPlot(data) {
        return this.http.post(`${this.apiUrl}/building-plots`, data);
    }

    GetPlotGeom(plotId) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/plots/${plotId}`
        );
    }

    GetBuildingPointNearHash(hash) {
        return this.http.get(`${this.apiUrl}/building/near?hash=${hash}`);
    }

    GetDzongkhagsGeom() {
        return this.http.get(`${this.apiUrl}/dzongkhag/geom/all`);
    }
    GetAdministrativeZonesGeom() {
        return this.http.get(`${this.apiUrl}/administrative-zone/geom/all`);
    }

    GetSubAdminsitrativeZonesGeom(id) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/geom/${id}`
        );
    }

    GetAdministrativeBoundary(administrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/geom/${administrativeZoneId}`
        );
    }

    GetBuildingFootprintsByAdministrativeBoundary(
        administrativeZoneId: number
    ) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/buildings/geom/${administrativeZoneId}`
        );
    }

    GetPlotsGeomBySubAdministrativeBoundary(subadmId: number) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/plots/geom/${subadmId}`
        );
    }

    GetPlotsGeomByAdministrativeBoundary(administrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/plots/geom/${administrativeZoneId}`
        );
    }

    GetSubAdministrativeBoundary(subAdministrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/subzone/boundary/${subAdministrativeZoneId}`
        );
    }
    GetBuildingFootprintsBySubAdministrativeBoundary(
        subAdministrativeZoneId: number
    ) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/buildings/geom/${subAdministrativeZoneId}`
        );
    }

    GetBuildingFootprintById(buildingId: number) {
        return this.http.get(
            `${this.apiUrl}/building-footprint/bid/${buildingId}`
        );
    }

    GetPlotsGeomByPlotIdCsv(plotIds: string) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/plots/${plotIds}`
        );
    }
}
