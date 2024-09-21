import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MessageService, SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import {
    DialogService,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AdminBuildingInventoryViewBuildingComponent } from './admin-building-inventory-view-building/admin-building-inventory-view-building.component';
import { Router } from '@angular/router';
import { AdminMasterBuildingComponent } from '../admin-master-building/admin-master-building.component';
import { GeomEditType } from 'src/app/core/constants';
import { BuildingGeometryDataService } from 'src/app/core/services/geometry/building.geometry.dataservice';

interface BuildingPoint {
    lat: number;
    lng: number;
    plotId: string;
    dzongkhagId: number;
}

interface BuildingGeom {
    geometry: string;
    dzoid: number;
    admid: number;
    subadmid: number;
    buildingid: number;
    areaSqFt: number;
}

interface BuildingPlot {
    buildingId: number;
    plotId: string;
    overlapPercentage: number;
}

@Component({
    selector: 'app-admin-building-inventory',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        CardModule,
        ButtonModule,
        DividerModule,
        DynamicDialogModule,
    ],
    providers: [DialogService, MessageService],
    templateUrl: './admin-building-inventory.component.html',
    styleUrl: './admin-building-inventory.component.scss',
})
export class AdminBuildingInventoryComponent implements OnInit {
    constructor(
        private locationDataService: LocationDataService,
        private geometryDataService: GeometryDataService,
        private buildingGeometryDataService: BuildingGeometryDataService,
        public dialogService: DialogService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ref: DynamicDialogRef | undefined;

    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;
    buildingGeojson!: L.GeoJSON;
    plotsGeojson!: L.GeoJSON;
    boundary = {} as L.GeoJSON;

    dzongkhags: any[] = [];
    administrativeZones: any[] = [];
    subadministrativeZones: any[] = [];

    selectedDzongkhag: any;
    selectedAdministrativeZone: any;
    selectedSubAdministrativeZone: any;
    selected = false;
    mapStateStored = localStorage.getItem('mapState');

    buildingGeom: BuildingGeom = {
        geometry: '',
        dzoid: 0,
        admid: 0,
        subadmid: 0,
        buildingid: 0,
        areaSqFt: 0,
    };
    buildingPoint: BuildingPoint = {
        lat: 0,
        lng: 0,
        plotId: '',
        dzongkhagId: 0,
    };

    buildingPlot: BuildingPlot = {
        buildingId: 0,
        plotId: '',
        overlapPercentage: 0,
    };

    ngOnInit(): void {
        this.renderMap();
        this.loadDzongkhags();
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
    }

    onDzongkahgChange(event) {
        this.loadAdministrativeZonesByDzongkhag(event.id);
    }

    loadDzongkhags() {
        this.locationDataService.GetAllDzonghags().subscribe((res: any) => {
            this.dzongkhags = res;
            // this.selectedDzongkhag = res[0];
        });
    }
    loadAdministrativeZonesByDzongkhag(dzongkhagId: number) {
        this.selected = true;
        this.locationDataService
            .GetAllAdministrativeZonesByDzongkhag(dzongkhagId)
            .subscribe((res: any) => {
                this.administrativeZones = res;
                this.selectedAdministrativeZone = res[0];
            });
    }
    loadSubadministrativeZonesByAdministrativeZone(admZoneId: number) {
        this.locationDataService
            .GetAllSubAdministrativeZonesByAdministrativeZone(admZoneId)
            .subscribe((res: any) => {
                this.subadministrativeZones = res;
                this.selectedSubAdministrativeZone = res[0];
            });
    }

    onAdministrativeZoneChange(event) {
        this.loadSubadministrativeZonesByAdministrativeZone(event.id);
    }

    loadPlotsAndBuildings() {
        this.clearMapState();
        this.geometryDataService
            .GetSubAdministrativeBoundary(this.selectedSubAdministrativeZone.id)
            .subscribe((res: any) => {
                this.boundary = L.geoJSON(res, {
                    style: function (feature) {
                        return {
                            fillColor: 'transparent',
                            weight: 3,
                            opacity: 1,
                            color: 'yellow',
                        };
                    },
                });

                this.geometryDataService
                    .GetPlotsGeomBySubAdministrativeBoundary(
                        this.selectedSubAdministrativeZone.id
                    )
                    .subscribe((res: any) => {
                        this.plotsGeojson = L.geoJSON(res, {
                            style: function (feature) {
                                return {
                                    fillColor: 'transparent',
                                    weight: 1,
                                    opacity: 1,
                                    color: 'red',
                                };
                            },
                            onEachFeature: (feature, layer) => {
                                layer.on({
                                    click: (e: any) => {
                                        this.showAddBuilding(
                                            feature.properties['plotid'],
                                            feature.properties['dzongkhagi'],
                                            feature.properties['subadmid']
                                        );
                                    },
                                });
                            },
                        }).addTo(this.map);

                        this.buildingGeometryDataService
                            .GetBuildingFootprintsBySubAdminZone(
                                this.selectedSubAdministrativeZone.id
                            )
                            .subscribe((res: any) => {
                                this.buildingGeojson = L.geoJSON(res, {
                                    style: function (feature) {
                                        return {
                                            fillColor: 'transparent',
                                            weight: 3,
                                            opacity: 1,
                                            color: 'white',
                                        };
                                    },
                                    onEachFeature: (feature, layer) => {
                                        layer.on({
                                            click: (e: any) => {
                                                console.log(
                                                    'ONLCICK BUILDING',
                                                    feature.properties
                                                );
                                                this.saveMapState();
                                                this.showBuilding(
                                                    feature.properties
                                                        .buildingId,
                                                    feature.properties.id
                                                );
                                            },
                                        });
                                    },
                                }).addTo(this.map);
                            });

                        this.fitMapBounds();
                    });
            });
    }
    showAddBuilding(plotId, dzongkhagId, subadmId) {
        this.ref = this.dialogService.open(AdminMasterBuildingComponent, {
            header: 'Building Menu for plot: ' + plotId,
            data: {
                type: GeomEditType.ADD,
                plotId: plotId,
            },
            width: '90%',
            height: '90%',
        });

        this.ref.onClose.subscribe((res) => {
            console.log('Add building dialog close', res);
            this.buildingPoint.lat = res.lat;
            this.buildingPoint.lng = res.lng;
            this.buildingPoint.dzongkhagId = dzongkhagId;
            this.buildingPoint.lat;
            this.buildingPoint.plotId = `New Building Added on ${plotId}`;
            this.buildingGeom.areaSqFt = res.area;

            res.geom['features'][0]['geometry']['type'] = 'MultiPolygon';
            res.geom['features'][0]['geometry']['coordinates'] = [
                res.geom['features'][0]['geometry']['coordinates'],
            ];
            var jsonData = JSON.stringify(res.geom['features'][0]['geometry']);
            this.buildingGeom.geometry = jsonData;

            this.insertBuildingPoint(this.buildingPoint).then((res: any) => {
                console.log('building id new ', res.id);

                this.buildingGeom.buildingid = res.id;
                this.buildingGeom.subadmid = subadmId;

                //building plot data
                this.buildingPlot.buildingId = res.id;
                this.buildingPlot.plotId = plotId.trim();
                this.buildingPlot.overlapPercentage = 100.0;

                this.insertBuildingGeom(this.buildingGeom).then((result) => {
                    if (result[1]) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Message',
                            detail: 'Building added Successfully!!!',
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Building could not be added!!!',
                        });
                    }
                });
                this.insertBuildingPlots(this.buildingPlot).then((result) => {
                    if (result) {
                        this.loadBuildings();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Message',
                            detail: 'Building Plot added Successfully!!!',
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Building could not be added!!!',
                        });
                    }
                });
            });
        });
    }

    showBuilding(buildingId: number, geomId: number) {
        console.log({
            header: 'Building ID: ' + buildingId,
            data: {
                buildingId: buildingId,
                geomId: geomId,
                showZhicharPoints: false,
                showRedrawBuilding: false,
            },
            width: 'max-content',
        });
        this.ref = this.dialogService.open(
            AdminBuildingInventoryViewBuildingComponent,
            {
                header: 'Building ID: ' + buildingId,
                data: {
                    buildingId: buildingId,
                    geomId: geomId,
                    showZhicharPoints: false,
                    showRedrawBuilding: false,
                },
                width: 'max-content',
            }
        );
        this.ref.onClose.subscribe((res) => {
            if (res && res.delete) {
                this.loadBuildings();
            }
        });
    }

    saveMapState() {
        const mapState = {
            zoom: this.map.getZoom(),
            center: this.map.getCenter(),
        };
        localStorage.setItem('mapState', JSON.stringify(mapState));
    }

    restoreMapState() {}

    clearMapState() {
        localStorage.removeItem('mapState');
        if (this.plotsGeojson) {
            this.map.removeLayer(this.plotsGeojson);
        }
        if (this.boundary) {
            this.map.removeLayer(this.boundary);
        }
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
    }

    loadAdministrativeData() {
        this.clearMapState();
        this.geometryDataService
            .GetSubAdministrativeBoundary(this.selectedSubAdministrativeZone.id)
            .subscribe((res: any) => {
                this.boundary = L.geoJSON(res, {
                    style: function (feature) {
                        return {
                            fillColor: 'transparent',
                            weight: 3,
                            opacity: 1,
                            color: 'yellow',
                        };
                    },
                });

                this.geometryDataService
                    .GetPlotsGeomBySubAdministrativeBoundary(
                        this.selectedSubAdministrativeZone.id
                    )
                    .subscribe((res: any) => {
                        this.plotsGeojson = L.geoJSON(res, {
                            style: function (feature) {
                                return {
                                    fillColor: 'transparent',
                                    weight: 1,
                                    opacity: 1,
                                    color: 'red',
                                };
                            },
                            onEachFeature: (feature, layer) => {
                                layer.on({
                                    click: (e: any) => {
                                        alert(feature.properties.plotId);
                                    },
                                });
                            },
                        }).addTo(this.map);

                        this.geometryDataService
                            .GetBuildingFootprintsBySubAdministrativeBoundary(
                                this.selectedSubAdministrativeZone.id
                            )
                            .subscribe((res: any) => {
                                this.buildingGeojson = L.geoJSON(res, {
                                    style: function (feature) {
                                        return {
                                            fillColor: 'transparent',
                                            weight: 3,
                                            opacity: 1,
                                            color: 'white',
                                        };
                                    },
                                    onEachFeature: (feature, layer) => {
                                        layer.on({
                                            click: (e: any) => {
                                                console.log(
                                                    'lskdjf;alksjdflkj',
                                                    feature
                                                );
                                                this.saveMapState();
                                                this.showBuilding(
                                                    feature.properties
                                                        .buildingid,
                                                    feature.properties.id_0
                                                );
                                            },
                                        });
                                    },
                                }).addTo(this.map);
                            });

                        this.fitMapBounds();
                    });
            });
    }

    fitMapBounds() {
        this.map.fitBounds(this.plotsGeojson.getBounds());
        this.boundary.bringToBack();
    }

    loadBuildings() {
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
        this.geometryDataService
            .GetBuildingFootprintsBySubAdministrativeBoundary(
                this.selectedSubAdministrativeZone.id
            )
            .subscribe((res: any) => {
                this.buildingGeojson = L.geoJSON(res, {
                    style: function (feature) {
                        return {
                            fillColor: 'transparent',
                            weight: 3,
                            opacity: 1,
                            color: 'white',
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        // console.log(feature);
                        layer.on({
                            click: (e: any) => {
                                console.log('lskdjf;alksjdflkj', feature);
                                this.saveMapState();
                                this.showBuilding(
                                    feature.properties.buildingid,
                                    feature.properties.id_0
                                );
                            },
                        });
                    },
                }).addTo(this.map);
            });
    }

    async updateBuildingGeom(buildingId, data) {
        return await this.geometryDataService
            .updateBuildingGeom(buildingId, data)
            .toPromise();
    }

    async insertBuildingPoint(data) {
        return await this.geometryDataService
            .postBuildingPoint(data)
            .toPromise();
    }

    async insertBuildingGeom(data) {
        return await this.geometryDataService
            .postBuildingGeom(data)
            .toPromise();
    }

    async insertBuildingPlots(data) {
        return await this.geometryDataService
            .postBuildingPlot(data)
            .toPromise();
    }
}
