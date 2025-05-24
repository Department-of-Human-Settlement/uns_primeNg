import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-enumerator-load-building',
    templateUrl: './enumerator-load-building.component.html',
    styleUrls: ['./enumerator-load-building.component.css'],
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, DividerModule],
})
export class EnumeratorLoadBuildingComponent implements OnInit {
    selectedDzongkhag: any;
    selectedAdministrativeZone: any;
    selectedSubAdministrativeZone: any;
    selectedSubzone!: any;
    selectedSubzoneId: number;

    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';

    selectedBuildingId!: number;
    selectedLatLng!: L.LatLng;

    buildingGeojson!: L.GeoJSON;
    plotsGeojson!: L.GeoJSON;
    boundary = {} as L.GeoJSON;

    map!: L.Map;

    locationMarker!: L.CircleMarker;
    mapStateStored = localStorage.getItem('mapState');

    loading: boolean = true; // Loading state

    selectedPlot: any = null; // Selected plot details
    selectedBuilding: any = null; // Selected building details

    plotSelectionStyle = {
        weight: 3,
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.5,
    };

    buildingSelectionStyle = {
        weight: 3,
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.5,
    };

    defaultPlotStyle = {
        weight: 1,
        color: 'red',
        fillColor: 'transparent',
        fillOpacity: 0.5,
    };

    defaultBuildingStyle = {
        weight: 3,
        color: 'white',
        fillColor: 'transparent',
        fillOpacity: 0.5,
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private locationService: LocationDataService,
        private geometryDataService: GeometryDataService
    ) {}

    async ngOnInit(): Promise<void> {
        const locationDetails = sessionStorage.getItem('selectedLocationJson');
        if (locationDetails) {
            const parsedLocation = JSON.parse(locationDetails);
            this.selectedDzongkhag = parsedLocation.dzongkhag;
            this.selectedAdministrativeZone = parsedLocation.zone;
            this.selectedSubAdministrativeZone = parsedLocation.subZone;
            this.selectedSubzoneId = this.selectedSubAdministrativeZone.id;
        } else {
            this.router.navigate(['/enum']);
            return;
        }

        const mapState = sessionStorage.getItem('mapState');
        const selectedBuilding = sessionStorage.getItem('selectedBuilding');

        if (mapState && selectedBuilding) {
            const { center, zoom } = JSON.parse(mapState);
            const buildingState = JSON.parse(selectedBuilding);

            this.renderMap(center, zoom, buildingState);
        } else {
            this.renderMap();
        }
    }

    renderMap(center?: L.LatLng, zoom?: number, buildingState?: any) {
        const satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });

        this.map = L.map('map', {
            layers: [satelliteMap],
            attributionControl: false,
            zoomControl: false, // Disable zoom control
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView(center || [27.4712, 89.64191], zoom || 12);

        this.loadPlotsAndBuildings(buildingState);
    }

    loadPlotsAndBuildings(buildingState?: any) {
        this.clearMapState();

        forkJoin({
            boundary: this.geometryDataService.GetSubAdministrativeBoundary(
                this.selectedSubzoneId
            ) as Observable<GeoJSON.GeoJsonObject>,
            plots: this.geometryDataService.GetPlotsGeomBySubAdministrativeBoundary(
                this.selectedSubzoneId
            ),
            buildings:
                this.geometryDataService.GetBuildingFootprintsBySubAdministrativeBoundary(
                    this.selectedSubzoneId
                ),
        }).subscribe(({ boundary, plots, buildings }) => {
            this.boundary = L.geoJSON(boundary, {
                style: () => ({
                    fillColor: 'transparent',
                    weight: 3,
                    opacity: 1,
                    color: 'yellow',
                }),
            }).addTo(this.map);

            this.plotsGeojson = L.geoJSON(plots as GeoJSON.GeoJsonObject, {
                style: () => this.defaultPlotStyle,
                onEachFeature: (feature, layer) => {
                    layer.on({
                        click: (e: any) => {
                            this.selectPlot(feature, layer);
                            if (
                                layer instanceof L.Polygon ||
                                layer instanceof L.Polyline
                            ) {
                                this.map.fitBounds(layer.getBounds());
                            }
                        },
                    });
                },
            }).addTo(this.map);

            this.buildingGeojson = L.geoJSON(
                buildings as GeoJSON.GeoJsonObject,
                {
                    style: () => this.defaultBuildingStyle,
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            click: (e: any) => {
                                this.selectBuilding(feature, layer);
                                console.log(
                                    'Selected Building ID:',
                                    feature.properties
                                );
                                if (
                                    layer instanceof L.Polygon ||
                                    layer instanceof L.Polyline
                                ) {
                                    this.map.fitBounds(layer.getBounds(), {
                                        padding: [100, 100],
                                    });
                                }
                            },
                        });

                        // If buildingState exists, select the saved building
                        if (
                            buildingState &&
                            feature.properties.buildingid ===
                                buildingState.buildingid
                        ) {
                            this.selectBuilding(feature, layer);
                        }
                    },
                }
            ).addTo(this.map);

            this.loading = false;
            this.fitInitialBound();
        });
    }

    selectPlot(feature: any, layer: any) {
        if (this.selectedPlot) {
            this.plotsGeojson.resetStyle(this.selectedPlot.layer);
        }
        if (this.selectedBuilding) {
            this.buildingGeojson.resetStyle(this.selectedBuilding.layer);
            this.selectedBuilding = null;
        }
        this.selectedPlot = { feature, layer };
        layer.setStyle(this.plotSelectionStyle);
    }

    selectBuilding(feature: any, layer: any) {
        this.selectedBuildingId = feature.properties.buildingid;
        if (this.selectedBuilding) {
            this.buildingGeojson.resetStyle(this.selectedBuilding.layer);
        }

        if (this.selectedPlot) {
            this.plotsGeojson.resetStyle(this.selectedPlot.layer);
            this.selectedPlot = null;
        }

        this.selectedBuilding = { feature, layer };

        sessionStorage.setItem(
            'selectedBuilding',
            JSON.stringify(feature.properties)
        );

        const mapState = {
            center: this.map.getCenter(),
            zoom: this.map.getZoom(),
        };
        sessionStorage.setItem('mapState', JSON.stringify(mapState));

        layer.setStyle(this.buildingSelectionStyle);
    }

    checkLoadingComplete(
        boundaryLoaded: boolean,
        plotsLoaded: boolean,
        buildingsLoaded: boolean
    ) {
        if (boundaryLoaded && plotsLoaded && buildingsLoaded) {
            this.loading = false; // Hide loading dialog
            this.fitMapBounds();
        }
    }

    fitMapBounds() {
        const bounds = L.featureGroup([
            this.boundary,
            this.plotsGeojson,
            this.buildingGeojson,
        ]).getBounds();

        const center = bounds.getCenter();
        const zoomLevel = this.selectedBuilding ? 18 : 12;
        this.map.setView(center, zoomLevel);

        this.boundary.bringToBack();
    }

    fitInitialBound() {
        const bounds = L.featureGroup([
            this.boundary,
            this.plotsGeojson,
            this.buildingGeojson,
        ]).getBounds();

        const center = bounds.getCenter();
        const zoomLevel = this.selectedBuilding ? 18 : 12;
        this.map.setView(center, zoomLevel);

        this.boundary.bringToBack();
    }

    clearMapState() {
        localStorage.removeItem('mapState');
    }

    locate() {
        this.map.locate({ setView: true, maxZoom: 18 });
        this.map.on('locationfound', (e) => {
            if (this.locationMarker) {
                this.map.removeLayer(this.locationMarker);
            }
            this.locationMarker = L.circleMarker(e.latlng, {
                radius: 10,
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.5,
            }).addTo(this.map);
        });
    }
    zoomToLayerExtent() {
        this.fitMapBounds();
    }
    backToZoneSelection() {
        this.clearMapState();
        this.router.navigate(['/enum']);
    }
    goToBuildingDetails() {
        this.router.navigate([
            `/enum/building-details/${this.selectedBuildingId}`,
        ]);
    }
}
