import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
    BuildingDataService,
    BuildingImageDTO,
} from 'src/app/core/services/building.dataservice';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EnumeratorTakeBuildingPhotoComponent } from '../enumerator-take-building-photo/enumerator-take-building-photo.component';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-enumerator-building-photos-tab',
    templateUrl: './enumerator-building-photos-tab.component.html',
    styleUrls: ['./enumerator-building-photos-tab.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        DialogModule,
        DividerModule,
        ConfirmDialogModule,
    ],
    providers: [DialogService, ConfirmationService],
})
export class EnumeratorBuildingPhotosTabComponent implements OnInit {
    @Input() buildingId!: number;
    ref: DynamicDialogRef;
    buildingImages: BuildingImageDTO[] = [];
    selectedImage: BuildingImageDTO | null = null;
    isImageDialogVisible: boolean = false;

    constructor(
        private buildingService: BuildingDataService,
        private route: ActivatedRoute,
        private dialogService: DialogService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.buildingId = Number(this.route.snapshot.params['buildingId']);
        this.getAllImagesByBuilding();
    }

    getAllImagesByBuilding(): void {
        this.buildingService
            .GetAllImagesByBuilding(this.buildingId)
            .subscribe((res) => {
                this.buildingImages = res;
            });
    }

    openTakePhotoModal(): void {
        this.ref = this.dialogService.open(
            EnumeratorTakeBuildingPhotoComponent,
            {
                header: 'Take Building Photo',
                width: '100%',
                height: '100dvh',
                data: {
                    buildingId: this.buildingId,
                },
            }
        );
        this.ref.onClose.subscribe((result) => {
            if (result && result.status === 200) {
                this.getAllImagesByBuilding();
            }
        });
    }

    getImageUri(uri: string): string {
        return `http://localhost:4322/images/building-image/${uri}`;
    }

    deletePhoto(image: BuildingImageDTO): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this photo?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.buildingService
                    .DeleteBuildingImage(image.id)
                    .subscribe(() => {
                        this.getAllImagesByBuilding();
                    });
            },
        });
    }

    viewImage(image: BuildingImageDTO): void {
        this.selectedImage = image;
        this.isImageDialogVisible = true;
    }

    closeImageDialog(): void {
        this.selectedImage = null;
        this.isImageDialogVisible = false;
    }
}
