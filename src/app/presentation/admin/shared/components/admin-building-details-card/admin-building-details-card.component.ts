import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import {
    DialogService,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PARSEBUILDINGFLOORS, PARSEDATE } from 'src/app/core/helper-function';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { EditBuildingModalComponent } from '../crud-modals/buildings/edit-building-modal/edit-building-modal.component';

@Component({
    selector: 'app-admin-building-details-card',
    standalone: true,
    imports: [CardModule, CommonModule, ButtonModule, DynamicDialogModule],
    templateUrl: './admin-building-details-card.component.html',

    providers: [DialogService],
    styleUrls: ['./admin-building-details-card.component.css'],
})
export class AdminBuildingDetailsCardComponent implements OnChanges {
    @Input() buildingId;
    buildingDetails: BuildingDetailDto;
    parseDate = PARSEDATE;
    parseBuildingFloorLabel = PARSEBUILDINGFLOORS;
    ref: DynamicDialogRef | undefined;

    casId?: string;

    constructor(
        private buildingDetailDataService: BuildingDetailDataService,
        private dialogService: DialogService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.getBuildingDetails();
    }

    getBuildingDetails() {
        this.buildingDetailDataService
            .GetBuildingDetailsByBuildingId(this.buildingId)
            .subscribe((res) => {
                this.buildingDetails = res;
            });
    }

    addBuildingDetail() {
        if (this.buildingDetails) {
            this.ref = this.dialogService.open(EditBuildingModalComponent, {
                header: 'Editing Building Details',
                data: {
                    buildingId: this.buildingId,
                    buildingDetails: this.buildingDetails,
                    isEdit: true,
                },
                width: 'max-content',
            });
        } else {
            this.ref = this.dialogService.open(EditBuildingModalComponent, {
                header: 'Adding Building Details',
                data: {
                    buildingId: this.buildingId,
                    isEdit: false,
                },
                width: 'max-content',
            });
        }
        this.ref.onClose.subscribe((res) => {
            if (res.dataChanged) {
                console.log(res);
                this.getBuildingDetails();
            }
            this.casId = res.casId;
        });
    }
}
