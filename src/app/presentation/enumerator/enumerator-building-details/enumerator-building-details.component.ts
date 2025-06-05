import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { EnumeratorBuildingDetailsTabComponent } from './components/enumerator-building-details-tab/enumerator-building-details-tab.component';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { EnumeratorBuildingPhotosTabComponent } from './components/enumerator-building-photos-tab/enumerator-building-photos-tab.component';
import { EnumeratorBuildingUnitsTabComponent } from './components/enumerator-building-units-tab/enumerator-building-units-tab.component';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { PARSEBUILDINGFLOORS } from 'src/app/core/helper-function';
import { selectedLocationJson } from '../enumerator.constants';
import { EnumeratorBuildingQrTabComponent } from './components/enumerator-building-qr-tab/enumerator-building-qr-tab.component';
import { EnumeratorSessionStateService } from '../enumerator-session-state.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
        EnumeratorBuildingUnitsTabComponent,
        EnumeratorBuildingQrTabComponent,
        ConfirmDialogModule,
    ],
    providers: [ConfirmationService, MessageService],
})
export class EnumeratorBuildingDetailsComponent implements OnInit {
    buildingId: number;
    building: BuildingDetailDto;
    buildingDetails: any;
    buildingDetailsExists: boolean = false;

    getFloorConfig = PARSEBUILDINGFLOORS;
    floorConfig: string = '';

    buildingGeojson: any;

    constructor(
        private route: ActivatedRoute,
        private buildingDataService: BuildingDataService,
        private buildingDetailService: BuildingDetailDataService,
        private router: Router,
        private sessionState: EnumeratorSessionStateService,
        private confirmationService: ConfirmationService
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
        this.buildingGeojson = this.sessionState.getSelectedBuilding();
        console.log('Building GeoJSON:', this.buildingGeojson);
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

    confirmMarkBuildingComplete() {
        this.confirmationService.confirm({
            header: 'Mark Building as Complete',
            message: 'Are you sure you want to mark this building as complete?',
            accept: () => {
                this.buildingDataService
                    .MarkBuildingAsComplete(this.buildingId)
                    .subscribe({
                        next: (res) => {
                            if (res) {
                                this.buildingDetailService
                                    .GetBuildingDetailsByBuildingId(
                                        this.buildingId
                                    )
                                    .subscribe((res: any) => {
                                        if (res) {
                                            this.buildingDetailsExists = true;
                                            this.buildingDetails = res;
                                            this.floorConfig =
                                                this.getFloorConfig(
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
                            }
                        },
                        error: (err) => {
                            console.error(
                                'Error marking building as complete',
                                err
                            );
                        },
                    });
            },
            reject: () => {
                // User rejected the confirmation
                console.log('User rejected the confirmation');
            },
        });
    }

    confirmMarkBuildingIncomplete() {
        this.confirmationService.confirm({
            header: 'Mark Building as InComplete',
            message:
                'Are you sure you want to mark this building as InComplete?',
            accept: () => {
                this.buildingDataService
                    .MarkBuildingAsIncomplete(this.buildingId)
                    .subscribe({
                        next: (res) => {
                            if (res) {
                                this.buildingDetailService
                                    .GetBuildingDetailsByBuildingId(
                                        this.buildingId
                                    )
                                    .subscribe((res: any) => {
                                        if (res) {
                                            this.buildingDetailsExists = true;
                                            this.buildingDetails = res;
                                            this.floorConfig =
                                                this.getFloorConfig(
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
                            }
                        },
                        error: (err) => {
                            console.error(
                                'Error marking building as complete',
                                err
                            );
                        },
                    });
            },
            reject: () => {
                // User rejected the confirmation
                console.log('User rejected the confirmation');
            },
        });
    }
}
