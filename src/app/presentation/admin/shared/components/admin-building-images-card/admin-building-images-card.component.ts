import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import {
    BuildingDataService,
    BuildingImageDTO,
} from 'src/app/core/services/building.dataservice';
import { API_URL } from 'src/app/core/constants/constants';

@Component({
    selector: 'app-admin-building-images-card',
    templateUrl: './admin-building-images-card.component.html',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        FileUploadModule,
        ConfirmDialogModule,
        TooltipModule,
        ImageModule,
        DialogModule,
        CarouselModule,
    ],
    providers: [DialogService, MessageService, ConfirmationService],
    styleUrls: ['./admin-building-images-card.component.css'],
})
export class AdminBuildingImagesCardComponent implements OnChanges {
    @Input() buildingId: number;
    images: BuildingImageDTO[] = [];
    ref: DynamicDialogRef | undefined;
    uploadInProgress: boolean = false;

    displayImageDialog: boolean = false;
    selectedImage: BuildingImageDTO | null = null;

    constructor(
        private dialogService: DialogService,
        private messageService: MessageService,
        private buildingDataService: BuildingDataService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['buildingId']) {
            this.loadBuildingImages();
        }
    }
    getImageUri(uri: string): string {
        return `${API_URL}/images/building-image/${uri}`;
    }

    loadBuildingImages() {
        if (!this.buildingId) return;

        this.buildingDataService
            .GetAllImagesByBuilding(this.buildingId)
            .subscribe({
                next: (images) => {
                    this.images = images;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load building images',
                    });
                    console.error('Error loading images:', error);
                },
            });
    }

    viewImage(imageId: number) {
        this.selectedImage =
            this.images.find((img) => img.id === imageId) || null;
        if (this.selectedImage) {
            this.displayImageDialog = true;
        }
    }

    hideImageDialog() {
        this.displayImageDialog = false;
        this.selectedImage = null;
    }

    removeImage(imageId: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this image?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.buildingDataService
                    .DeleteBuildingImage(imageId)
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Image deleted successfully',
                            });
                            this.loadBuildingImages();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete image',
                            });
                            console.error('Delete error:', error);
                        },
                    });
            },
        });
    }
}
