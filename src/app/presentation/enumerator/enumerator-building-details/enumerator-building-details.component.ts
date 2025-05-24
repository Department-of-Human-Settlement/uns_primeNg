import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { EnumeratorBuildingDetailsTabComponent } from './components/enumerator-building-details-tab/enumerator-building-details-tab.component';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { EnumeratorBuildingPhotosTabComponent } from './components/enumerator-building-photos-tab/enumerator-building-photos-tab.component';
import { EnumeratorBuildingSketchesTabComponent } from './components/enumerator-building-sketches-tab/enumerator-building-sketches-tab.component';
import { EnumeratorBuildingUnitsTabComponent } from './components/enumerator-building-units-tab/enumerator-building-units-tab.component';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { PARSEBUILDINGFLOORS } from 'src/app/core/helper-function';
import { selectedLocationJson } from '../enumerator.constants';
import { EnumeratorBuildingQrTabComponent } from './components/enumerator-building-qr-tab/enumerator-building-qr-tab.component';

@Component({
    selector: 'app-enumerator-building-details',
    templateUrl: './enumerator-building-details.component.html',
    styleUrls: ['./enumerator-building-details.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        TabViewModule,
        ButtonModule,
        EnumeratorBuildingDetailsTabComponent,
        EnumeratorBuildingPhotosTabComponent,
        EnumeratorBuildingSketchesTabComponent,
        EnumeratorBuildingUnitsTabComponent,
        EnumeratorBuildingQrTabComponent,
    ],
})
export class EnumeratorBuildingDetailsComponent implements OnInit {
    buildingId: number;
    building: BuildingDetailDto;
    buildingDetails: any;
    buildingDetailsExists: boolean = false;

    getFloorConfig = PARSEBUILDINGFLOORS;
    floorConfig: string = '';

    constructor(
        private route: ActivatedRoute,
        private buildingDataService: BuildingDataService,
        private buildingDetailService: BuildingDetailDataService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.buildingId = +params['buildingId']; // Convert to number
            this.buildingDetailService
                .GetBuildingDetailsByBuildingId(this.buildingId)
                .subscribe((res: any) => {
                    if (res) {
                        this.buildingDetailsExists = true;
                        this.buildingDetails = res;
                        this.floorConfig = this.getFloorConfig(
                            this.buildingDetails
                        );
                    } else {
                        this.buildingDetailsExists = false;
                    }
                });
            this.buildingDataService
                .GetBuildingById(this.buildingId)
                .subscribe({
                    next: (res) => {
                        this.building = res;
                    },
                });
        });
    }

    onBuildingDetailsUpdated(updatedDetails: BuildingDetailDto): void {
        console.log('RECEIVE EVENT from child');
        this.buildingDetails = updatedDetails;
        this.floorConfig = this.getFloorConfig(this.buildingDetails);
    }

    goToSelectZone() {
        this.router.navigate(['enum']);
    }

    goToMapView() {
        const location = JSON.parse(
            sessionStorage.getItem(selectedLocationJson)
        );

        this.router.navigate([`/enum/load-buildings/${location.subZone.id}`]);
    }
}
