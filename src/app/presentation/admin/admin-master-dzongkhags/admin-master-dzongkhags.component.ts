import { Component, OnInit } from '@angular/core';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { TableModule } from 'primeng/table';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { TabViewModule } from 'primeng/tabview';
import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AdminDzongkhagUpdateModalComponent } from './components/admin-dzongkhag-update-modal/admin-dzongkhag-update-modal.component';
import { DzongkhagDTO } from 'src/app/core/models/location/dzongkhag.dto';

@Component({
    selector: 'app-admin-master-dzongkhags',
    standalone: true,
    imports: [TableModule, ButtonModule, TabViewModule],
    templateUrl: './admin-master-dzongkhags.component.html',
    styleUrl: './admin-master-dzongkhags.component.scss',
    providers: [DialogService],
})
export class AdminMasterDzongkhagsComponent implements OnInit {
    dzongkhags: any[] = [];
    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;
    dzongkhagsGeojson!: L.GeoJSON;
    ref: DynamicDialogRef;

    constructor(
        private locationDataService: LocationDataService,
        private geometryDataService: GeometryDataService,
        private dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.getAllDzongkhags();

        this.renderMap();
        this.loadDzongkhagsGeom();
    }

    getAllDzongkhags() {
        this.locationDataService.GetAllDzonghags().subscribe((res: any) => {
            this.dzongkhags = res;
        });
    }

    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('dzongkhagmap', {
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }

    loadDzongkhagsGeom() {
        this.geometryDataService.GetDzongkhagsGeom().subscribe((res: any) => {
            this.dzongkhagsGeojson = L.geoJSON(res, {
                style: function (feature) {
                    return {
                        fillColor: 'white',
                        weight: 1,
                        fillOpacity: 1,
                        opacity: 1,
                        color: 'black',
                    };
                },
            });
            this.map.addLayer(this.dzongkhagsGeojson);
            this.map.fitBounds(this.dzongkhagsGeojson.getBounds());
        });
    }

    openUpdateDzongkhagModal(item: DzongkhagDTO) {
        this.ref = this.dialogService.open(AdminDzongkhagUpdateModalComponent, {
            header: 'Update Dzongkhag',
            data: {
                ...item,
            },
        });
        this.ref.onClose.subscribe((res) => {
            if (res && res.status === 200) {
                this.getAllDzongkhags();
            }
        });
    }
}
