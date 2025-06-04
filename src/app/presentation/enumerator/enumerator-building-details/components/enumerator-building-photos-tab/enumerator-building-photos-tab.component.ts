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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GalleriaModule } from 'primeng/galleria';
import { API_URL } from 'src/app/core/constants/constants';

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
        ToastModule,
        ProgressSpinnerModule,
        GalleriaModule,
    ],
    providers: [DialogService, ConfirmationService, MessageService],
})
export class EnumeratorBuildingPhotosTabComponent implements OnInit {
    @Input() buildingId!: number;
    ref: DynamicDialogRef;
    buildingImages: BuildingImageDTO[] = [];
    selectedImage: BuildingImageDTO | null = null;
    isImageDialogVisible: boolean = false;
    loading: boolean = false;
    galleriaVisible: boolean = false;
    activeIndex: number = 0;
    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 5,
        },
        {
            breakpoint: '768px',
            numVisible: 3,
        },
        {
            breakpoint: '560px',
            numVisible: 1,
        },
    ];

    constructor(
        private buildingService: BuildingDataService,
        private route: ActivatedRoute,
        private dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.buildingId = Number(this.route.snapshot.params['buildingId']);
        this.getAllImagesByBuilding();
    }

    getAllImagesByBuilding(): void {
        this.loading = true;
        this.buildingService.GetAllImagesByBuilding(this.buildingId).subscribe({
            next: (res) => {
                this.buildingImages = res;
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load images',
                });
                this.loading = false;
            },
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
        return `${API_URL}/images/building-image/${uri}`;
    }

    deletePhoto(image: BuildingImageDTO): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this photo?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loading = true;
                this.buildingService.DeleteBuildingImage(image.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Photo deleted successfully',
                        });
                        this.getAllImagesByBuilding();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete photo',
                        });
                        this.loading = false;
                    },
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

    showGalleria(index: number): void {
        this.activeIndex = index;
        this.galleriaVisible = true;
    }

    closeGalleria(): void {
        this.galleriaVisible = false;
    }
}
