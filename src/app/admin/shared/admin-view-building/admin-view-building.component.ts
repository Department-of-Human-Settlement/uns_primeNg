import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import * as L from 'leaflet';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { PARSEDATE } from 'src/app/api/helper-function';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { BuildingDataService } from 'src/app/dataservice/building.dataservice';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';
import { UnitDataService } from 'src/app/dataservice/unit.dataservice';
import { AdminViewUnitModalComponent } from './modals/admin-view-unit-modal/admin-view-unit-modal.component';

@Component({
    selector: 'app-admin-view-building',
    standalone: true,
    imports: [
        ButtonModule,
        CommonModule,
        InputGroupAddonModule,
        InputGroupModule,
        InputTextModule,
        InputNumberModule,
        FormsModule,
        ToastModule,
        MessagesModule,
        CardModule,
        TableModule,
        ToastModule,
        QRCodeModule,
    ],
    templateUrl: './admin-view-building.component.html',
    styleUrl: './admin-view-building.component.scss',
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [DialogService, ConfirmationService],
})
export class AdminViewBuildingComponent implements OnInit, OnChanges {
    constructor(
        private buildingPlotDataService: BuildingPlotDataService,
        private buildingDataService: BuildingDataService,
        private buildingDetailService: BuildingDetailService,
        private messageService: MessageService,
        private unitDataService: UnitDataService,
        private geometryDataService: GeometryDataService,
        private dialogService: DialogService
    ) { }
    @Input() buildingId: number;
    ref: DynamicDialogRef | undefined;

    building: any;
    buildingDetails: any;
    units: any[];
    plots: any[];

    parseDate = PARSEDATE;

    messages: Message[] | undefined;

    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;
    buildingGeojson!: L.GeoJSON;
    plotsGeojson!: L.GeoJSON;

    plotIdsCsv: string;

    ngOnInit(): void {
        this.renderMap();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.search();
    }

    roundDecimal(number: number) {
        return Math.round(number);
    }
    getQr(value) {
        return value;
    }
    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('buildingMap', {
            layers: [satelliteMap],
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }

    search() {
        this.getBuilding(Number(this.buildingId));
        this.getBuildingDetails(Number(this.buildingId));
        this.getBuildingPlots(Number(this.buildingId));
        this.getBuildingUnits(Number(this.buildingId));
        this.getBuildingFootprint(this.buildingId);
    }

    getBuilding(buildingId: number) {
        this.buildingDataService
            .GetBuildingById(buildingId)
            .subscribe((res) => {
                this.building = res;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Building Found',
                    detail: 'details loaded for Building ID: ' + buildingId,
                });
            });
    }

    getBuildingDetails(buildingId: number) {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(buildingId)
            .subscribe((res) => {
                this.buildingDetails = res;
            });
    }

    getBuildingUnits(buildingId) {
        this.unitDataService
            .GetAllUnitsByBuilding(buildingId)
            .subscribe((res: any) => {
                this.units = res;
            });
    }

    getBuildingFootprint(buildingId) {
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
        this.geometryDataService
            .GetBuildingFootprintById(buildingId)
            .subscribe((res: any) => {
                console.log(res['features'])
                if (res['features'] !== null) {
                    this.buildingGeojson = L.geoJSON(res, {
                        style: (feature) => {
                            return {
                                fillColor: 'white',
                                weight: 1,
                                fillOpacity: 0.3,
                                opacity: 1,
                                color: 'white',
                            };
                        },
                    }).addTo(this.map);
                    this.map.fitBounds(this.buildingGeojson.getBounds());
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Building Footprint data found',
                        detail: 'Footprint added to the map',
                    });
                }else{
                    this.messageService.add({
                        severity: 'error',
                        summary: 'No Footprint Data Found for Building ID',
                        detail: 'No Footprint Data Found for Building ID',
                    });

                }
            });
    }

    getPlotGeom(plotsCsv: string, buildingId: number) {
        if (this.plotsGeojson) {
            this.map.removeLayer(this.plotsGeojson);
        }
        this.geometryDataService
            .GetPlotsGeomByPlotIdCsv(plotsCsv)
            .subscribe((res: any) => {
                this.plotsGeojson = L.geoJSON(res, {
                    style: (feature) => {
                        return {
                            fillColor: 'transparent',
                            weight: 1,
                            opacity: 1,
                            color: 'red',
                        };
                    },
                }).addTo(this.map);
                this.map.fitBounds(this.plotsGeojson.getBounds());

                this.messageService.add({
                    key: 'maptoast',
                    severity: 'success',
                    summary: 'Plot Geometry Found',
                    detail: 'Successfully added to the map',
                });

                this.getBuildingFootprint(buildingId);
            });
    }

    getBuildingPlots(buildngId: number) {
        this.buildingPlotDataService
            .GetPlotsOfBuilding(buildngId)
            .subscribe((res: any) => {
                this.plots = res;
                this.plotIdsCsv = this.plots.map((obj) => obj.plotId).join(',');
                // this.getPlotGeom(this.plotIdsCsv, buildngId);
            });
    }

    getArrFromObject(obj) {
        return Object.entries(obj);
    }

    openEditUnitModal(unitId: number) {
        this.ref = this.dialogService.open(AdminViewUnitModalComponent, {
            header: 'unit: ' + unitId,
            data: {
                unitId: unitId,
            },
            width: 'max-content',
        });
        this.ref.onClose.subscribe((res) => {
            if (res.updated) {
                this.getBuildingUnits(this.buildingId);
            }
        });
    }
}
