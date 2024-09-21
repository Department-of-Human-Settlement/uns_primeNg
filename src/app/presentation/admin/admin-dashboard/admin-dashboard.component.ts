import { Component } from '@angular/core';
import * as L from 'leaflet';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { BuildingGeometryDataService } from 'src/app/core/services/geometry/building.geometry.dataservice';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    buildingGeojson!: L.GeoJSON;
    map!: L.Map;

    constructor(
        private buildingGeometryDataService: BuildingGeometryDataService
    ) {}

    ngOnInit() {
        this.renderMap();
    }

    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('map', {
            layers: [satelliteMap],
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
        this.getBuildingFootprint(2);
    }

    getBuildingFootprint(buildingId) {
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
        this.buildingGeometryDataService
            .GetBuildingFootprintsBySubAdminZone(1013)
            .subscribe((res: any) => {
                this.buildingGeojson = L.geoJSON(res, {
                    style: (feature) => {
                        console.log(res.building);
                        return {
                            fillColor: 'red',
                            weight: 2,
                            fillOpacity: 0.3,
                            opacity: 1,
                            color: 'red',
                        };
                    },
                }).addTo(this.map);
                this.map.fitBounds(this.buildingGeojson.getBounds());
            });
    }
}
