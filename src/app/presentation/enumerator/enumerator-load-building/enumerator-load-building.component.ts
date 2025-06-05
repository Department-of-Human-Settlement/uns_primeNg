import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { DividerModule } from 'primeng/divider';
import { EnumeratorSessionStateService } from '../enumerator-session-state.service';
import { feature } from '@turf/turf';

@Component({
    selector: 'app-enumerator-load-building',
    templateUrl: './enumerator-load-building.component.html',
    styleUrls: ['./enumerator-load-building.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        DialogModule,
        DividerModule,
        TooltipModule,
    ],
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
        color: 'white',
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
        private geometryDataService: GeometryDataService,
        private sessionState: EnumeratorSessionStateService
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

        const mapState = this.sessionState.getMapState();
        const selectedBuilding = this.sessionState.getSelectedBuilding();

        if (mapState) {
            console.log('Restoring map state:', mapState);
        } else {
            console.log('No map state found to restore.');
        }
        console.log('Map state from session:', mapState);
        if (mapState && selectedBuilding) {
            console.log('Restoring map state:', mapState);
            const { center, zoom } = mapState;
            const restoredCenter = L.latLng(center.lat, center.lng);
            console.log(
                'Restoring map to center:',
                restoredCenter,
                'zoom:',
                zoom
            );
            this.renderMap(restoredCenter, zoom, selectedBuilding);
        } else {
            console.log('No saved map state found, using default values');
            this.renderMap();
        }
    }

    renderMap(center?: L.LatLng, zoom?: number, buildingState?: any) {
        const satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });

        // Create map with default view - proper positioning will happen after layers load
        this.map = L.map('map', {
            layers: [satelliteMap],
            attributionControl: false,
            zoomControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);

        this.loadPlotsAndBuildings(buildingState, center, zoom);
    }

    loadPlotsAndBuildings(
        buildingState?: any,
        initialCenter?: L.LatLng,
        initialZoom?: number
    ) {
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
            // Add layers to map
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
            }).addTo(this.map);

            this.buildingGeojson = L.geoJSON(
                buildings as GeoJSON.GeoJsonObject,
                {
                    style: (feature) => ({
                        fillColor: 'transparent',
                        weight: 3,
                        opacity: 1,
                        color:
                            feature.properties.status === 'COMPLETE'
                                ? 'green'
                                : 'red',
                    }),
                    // style: () => this.defaultBuildingStyle,
                    onEachFeature: (feature, layer) => {
                        console.log('Adding building layer:', feature);
                        layer.on({
                            click: (e: any) => {
                                this.selectBuilding(feature, layer);
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

                        // If this is the previously selected building, select it again
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

            // Now that all layers are loaded, handle map positioning
            if (buildingState && this.selectedBuilding) {
                // If we have a selected building, find its layer and zoom to it
                const buildingLayer = this.buildingGeojson
                    .getLayers()
                    .find(
                        (layer) =>
                            (layer as any).feature?.properties.buildingid ===
                            buildingState.buildingid
                    );
                if (buildingLayer && 'getBounds' in buildingLayer) {
                    this.map.fitBounds(
                        (buildingLayer as L.Polygon).getBounds(),
                        {
                            padding: [100, 100],
                        }
                    );
                }
            } else if (initialCenter && initialZoom) {
                // Use saved map position if no building is selected
                console.log(
                    'Restoring map view to:',
                    initialCenter,
                    initialZoom
                );
                this.map.setView(initialCenter, initialZoom);
            } else {
                // No saved state, fit to bounds
                this.fitInitialBound();
            }

            // Always ensure boundary layer is at the back
            this.boundary.bringToBack();
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
        let center2 = this.map.getCenter();
        const zoom = this.map.getZoom();
        this.sessionState.setMapState(
            { lat: center2.lat, lng: center2.lng },
            zoom
        );
        console.log('Map state saved:', {
            lat: center2.lat,
            lng: center2.lng,
            zoom,
        });

        // Reset previously selected building style if exists
        if (this.selectedBuilding?.layer && this.buildingGeojson) {
            try {
                this.buildingGeojson.resetStyle(this.selectedBuilding.layer);
            } catch (error) {
                console.warn('Could not reset building style:', error);
            }
        }

        this.selectedBuilding = { feature, layer };

        this.sessionState.setSelectedBuilding(feature.properties);
        const center = this.map.getCenter();
        this.sessionState.setMapState(
            { lat: center.lat, lng: center.lng },
            this.map.getZoom()
        );

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
        const zoomLevel = 12;
        this.map.setView(center, zoomLevel);

        this.boundary.bringToBack();
    }

    clearMapState() {
        this.sessionState.clearMapState();
        this.sessionState.clearSelectedBuilding();
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
        if (this.buildingGeojson) {
            const bounds = this.buildingGeojson.getBounds();
            if (bounds.isValid()) {
                this.map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 19, // Prevent zooming in too close
                });
            }
        }
    }
    backToZoneSelection() {
        this.clearMapState();
        this.router.navigate(['/enum']);
    }
    goToBuildingDetails() {
        // Save current map state before navigating
        if (this.map) {
            const center = this.map.getCenter();
            const zoom = this.map.getZoom();
            this.sessionState.setMapState(
                { lat: center.lat, lng: center.lng },
                zoom
            );
            console.log('Map state saved:', {
                lat: center.lat,
                lng: center.lng,
                zoom,
            });
        }
        // Check if map state exists and log it

        this.router.navigate([
            `/enum/building-details/${this.selectedBuildingId}`,
        ]);
    }
}
