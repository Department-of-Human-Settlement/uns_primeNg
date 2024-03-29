import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_URL } from '../constants/constants';
import { BuildingDTO } from '../models/buildings/building.dto';

@Injectable({
    providedIn: 'root',
})
export class BuildingDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) { }

    GetBuildingById(buildingId: number): Observable<BuildingDTO> {
        return this.http.get<BuildingDTO>(
            `${this.apiUrl}/building/${buildingId}`
        );
    }

    UpdateBuildingPlotByPlot(
        plotId: string,
        buildingId: number,
        polygonId: number
    ) {
        return this.http.patch(
            `${this.apiUrl}/building-plots/plotId/${plotId}`,
            {
                buildingId: buildingId,
                polygonId: polygonId,
            }
        );
    }

    assignBuildingToPlot(buildingId, plotId) {
        return this.http.patch(`${this.apiUrl}/building-plots/plot-assign/${buildingId}/${plotId}`,{});
    }

    decoupleBuilding(buildingId, plotId) {
        return this.http.delete(`${this.apiUrl}/building-plots/plot/${buildingId}/${plotId}`);
    }

    DeleteBuilding(buildingId: number) {
        return this.http.delete(`${this.apiUrl}/building/${buildingId}`);
    }

    updateBuilding(buildingId:number,data:any){
        return this.http.patch(`${this.apiUrl}/building/${buildingId}`,data);
    }
}
