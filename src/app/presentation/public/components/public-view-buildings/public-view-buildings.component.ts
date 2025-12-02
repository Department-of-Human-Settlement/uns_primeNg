import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { forkJoin } from 'rxjs';
import { BuildingDataService, PTSRETURNDTO } from 'src/app/core/services/building.dataservice';
import { BuildingPlotDataService } from 'src/app/core/services/buildingplot.dataservice';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { DialogService } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-public-view-buildings',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        PanelModule,
        ButtonModule,
        BadgeModule,
        DividerModule,
        DialogModule,
        TableModule,
        ProgressSpinnerModule
    ],
    providers: [DialogService],
    templateUrl: './public-view-buildings.component.html',
    styleUrls: ['./public-view-buildings.component.css'],
})
export class PublicViewBuildingsComponent implements OnInit, OnDestroy, AfterViewInit {
    map!: L.Map;
    plotGeojson!: L.GeoJSON;
    buildingGeojson!: L.GeoJSON;
    
    token: string | null = null;
    plotId: string | null = null;
    isAuthorized: boolean = false;
    isLoading: boolean = true;
    errorMessage: string = '';
    mapReady: boolean = false;
    
    buildings: PTSRETURNDTO[] = [];
    plotSidebarOpen: boolean = false;
    buildingSidebarOpen: boolean = false;
    selectedBuilding: PTSRETURNDTO | null = null;
    legendOpen: boolean = true;
    isMobile: boolean = false;
    
    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    
    plotStyle = {
        fillColor: '#fef3c7',
        fillOpacity: 0.6,
        weight: 3,
        opacity: 1,
        color: '#f59e0b',
    };
    
    buildingStyle = {
        fillColor: '#3b82f6',
        fillOpacity: 0.7,
        weight: 2,
        opacity: 1,
        color: '#1e40af',
    };
    
    constructor(
        private route: ActivatedRoute,
        private buildingDataService: BuildingDataService,
        private buildingPlotDataService: BuildingPlotDataService,
        private geometryDataService: GeometryDataService,
        private dialogService: DialogService,
        private cdr: ChangeDetectorRef
    ) {}
    
    ngOnInit(): void {
        // Check if mobile device
        this.checkMobile();
        window.addEventListener('resize', () => this.checkMobile());
        
        // On mobile, sidebars start closed; on desktop, they're closed by default
        this.plotSidebarOpen = false;
        this.buildingSidebarOpen = false;
        
        // Read token from query parameters
        this.route.queryParams.subscribe((params) => {
            this.token = params['token'] || null;
            if (this.token) {
                this.verifyTokenAndLoadData();
            } else {
                this.isAuthorized = false;
                this.errorMessage = 'Token not provided';
                this.isLoading = false;
            }
        });
    }
    
    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
        window.removeEventListener('resize', () => this.checkMobile());
    }
    
    checkMobile(): void {
        this.isMobile = window.innerWidth < 768;
    }
    
    togglePlotSidebar(): void {
        this.plotSidebarOpen = !this.plotSidebarOpen;
    }
    
    toggleBuildingSidebar(): void {
        this.buildingSidebarOpen = !this.buildingSidebarOpen;
    }
    
    openBuildingSidebar(building: PTSRETURNDTO): void {
        this.selectedBuilding = building;
        this.buildingSidebarOpen = true;
    }
    
    toggleLegend(): void {
        this.legendOpen = !this.legendOpen;
    }
    
    ngAfterViewInit(): void {
        // Map will be initialized after authorization
    }
    
    verifyTokenAndLoadData(): void {
        if (!this.token) {
            this.isAuthorized = false;
            this.errorMessage = 'Token not provided';
            this.isLoading = false;
            return;
        }
        
        this.buildingDataService.verifyToken(this.token).subscribe({
            next: (response: any) => {
                // Handle different response structures
                // Could be: { plotId: string }, { data: { plotId: string } }, or just the plotId string
                let extractedPlotId: string | null = null;
                
                if (typeof response === 'string') {
                    extractedPlotId = response;
                } else if (response?.plotId) {
                    extractedPlotId = response.plotId;
                } else if (response?.data?.plotId) {
                    extractedPlotId = response.data.plotId;
                } else if (response?.statusCode === 200 && response?.plotId) {
                    extractedPlotId = response.plotId;
                }
                
                if (extractedPlotId) {
                    this.plotId = extractedPlotId;
                    this.isAuthorized = true;
                    // Ensure view is updated before initializing map
                    this.cdr.detectChanges();
                    // Wait for Angular to render the view, then initialize map
                    // Use double requestAnimationFrame to ensure DOM is ready
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            this.renderMap();
                            this.loadPlotData();
                        });
                    });
                } else {
                    this.isAuthorized = false;
                    this.errorMessage = 'NOT AUTHORIZED';
                    this.isLoading = false;
                }
            },
            error: (error) => {
                console.error('Token verification failed:', error);
                this.isAuthorized = false;
                this.errorMessage = 'NOT AUTHORIZED';
                this.isLoading = false;
            },
        });
    }
    
    renderMap(): void {
        // Check if map container exists
        const mapContainer = document.getElementById('publicViewMap');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        
        // Check if map already exists and remove it
        if (this.map) {
            this.map.remove();
        }
        
        const satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 25,
        });
        
        this.map = L.map('publicViewMap', {
            layers: [satelliteMap],
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
        
        this.mapReady = true;
    }
    
    loadPlotData(): void {
        if (!this.plotId) {
            return;
        }
        
        // Fetch building data with units
        this.buildingDataService
            .CalculateTaxByPlotId(this.plotId)
            .subscribe({
                next: (buildings: PTSRETURNDTO[]) => {
                    this.buildings = buildings;
                    this.loadGeometries();
                },
                error: (error) => {
                    console.error('Error loading buildings:', error);
                    this.isLoading = false;
                },
            });
    }
    
    loadGeometries(): void {
        if (!this.plotId || !this.buildings.length) {
            this.isLoading = false;
            return;
        }
        
        // Get plot geometry
        this.geometryDataService
            .GetPlotsGeomByPlotIdCsv(this.plotId)
            .subscribe({
                next: (plotGeom: any) => {
                    this.renderPlotGeometry(plotGeom);
                    this.loadBuildingGeometries();
                },
                error: (error) => {
                    console.error('Error loading plot geometry:', error);
                    this.loadBuildingGeometries();
                },
            });
    }
    
    renderPlotGeometry(plotGeom: any): void {
        if (!this.map || !this.mapReady) {
            console.warn('Map not ready, cannot render plot geometry');
            return;
        }
        
        if (this.plotGeojson) {
            this.map.removeLayer(this.plotGeojson);
        }
        
        // Handle different response structures
        let geoJsonData: any = null;
        
        if (Array.isArray(plotGeom) && plotGeom.length > 0) {
            // If it's an array, check if first element has features
            if (plotGeom[0] && plotGeom[0].features) {
                geoJsonData = plotGeom[0];
            } else if (plotGeom[0] && plotGeom[0].type === 'FeatureCollection') {
                geoJsonData = plotGeom[0];
            } else {
                // Try treating the whole array as features
                geoJsonData = {
                    type: 'FeatureCollection',
                    features: plotGeom,
                };
            }
        } else if (plotGeom && plotGeom.type === 'FeatureCollection') {
            geoJsonData = plotGeom;
        } else if (plotGeom && plotGeom.features) {
            geoJsonData = plotGeom;
        }
        
        if (geoJsonData && this.map) {
            this.plotGeojson = L.geoJSON(geoJsonData, {
                style: () => this.plotStyle,
                onEachFeature: (feature, layer) => {
                    layer.on({
                        click: () => {
                            this.togglePlotSidebar();
                        },
                    });
                }
            }).addTo(this.map);
            
            // Fit map to plot bounds
            if (this.plotGeojson.getBounds().isValid()) {
                this.map.fitBounds(this.plotGeojson.getBounds());
            }
        }
    }
    
    async loadBuildingGeometries(): Promise<void> {
        if (!this.buildings.length) {
            this.isLoading = false;
            return;
        }
        
        // Get building IDs from the buildings data
        const buildingIds = this.buildings.map((b) => b.buildingId);
        
        // Fetch all building geometries
        const geometryPromises = buildingIds.map((buildingId) =>
            this.geometryDataService
                .GetBuildingFootprintById(buildingId)
                .toPromise()
        );
        
        try {
            const buildingGeoms = await Promise.all(geometryPromises);
            
            // Process geometries - handle both single features and feature collections
            const features: any[] = [];
            buildingGeoms.forEach((geom: any) => {
                if (!geom) return;
                
                if (geom.type === 'FeatureCollection' && geom.features) {
                    features.push(...geom.features);
                } else if (geom.type === 'Feature') {
                    features.push(geom);
                } else if (geom.features && Array.isArray(geom.features)) {
                    features.push(...geom.features);
                }
            });
            
            const buildingFeature: any = {
                type: 'FeatureCollection',
                features: features,
            };
            
            this.renderBuildingGeometries(buildingFeature);
            this.isLoading = false;
        } catch (error) {
            console.error('Error loading building geometries:', error);
            this.isLoading = false;
        }
    }
    
    renderBuildingGeometries(buildingFeature: any): void {
        if (!this.map || !this.mapReady) {
            console.warn('Map not ready, cannot render building geometries');
            return;
        }
        
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
        
        if (!buildingFeature || !buildingFeature.features || buildingFeature.features.length === 0) {
            console.warn('No building features to render');
            return;
        }
        
        this.buildingGeojson = L.geoJSON(buildingFeature, {
            style: () => this.buildingStyle,
            onEachFeature: (feature, layer) => {
                const buildingId = feature.properties?.buildingid;
                if (buildingId) {
                    layer.on({
                        click: () => {
                            const building = this.getBuildingById(buildingId);
                            if (building) {
                                this.openBuildingSidebar(building);
                            }
                        },
                    });
                }
            },
        }).addTo(this.map);
        
        // Fit map to show both plot and buildings
        if (this.plotGeojson && this.plotGeojson.getBounds().isValid()) {
            const plotBounds = this.plotGeojson.getBounds();
            const buildingBounds = this.buildingGeojson.getBounds();
            if (buildingBounds.isValid()) {
                this.map.fitBounds(
                    plotBounds.extend(buildingBounds),
                    { padding: [20, 20] }
                );
            } else {
                this.map.fitBounds(plotBounds);
            }
        } else if (this.buildingGeojson.getBounds().isValid()) {
            this.map.fitBounds(this.buildingGeojson.getBounds());
        }
    }
    
    getBuildingById(buildingId: number): PTSRETURNDTO | undefined {
        return this.buildings.find((b) => b.buildingId === buildingId);
    }
}

