import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
    BuildingDataService,
    BuildingSketchDTO,
} from 'src/app/core/services/building.dataservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-enumerator-building-sketches-tab',
    templateUrl: './enumerator-building-sketches-tab.component.html',
    styleUrls: ['./enumerator-building-sketches-tab.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FileUploadModule,
        ConfirmDialogModule,
        ToastModule,
    ],
    providers: [MessageService, ConfirmationService],
})
export class EnumeratorBuildingSketchesTabComponent implements OnInit {
    selectedFile: File | null = null;
    uploadSuccess: boolean = false;
    uploadError: boolean = false;
    buildingId!: number;

    buildingSketches: BuildingSketchDTO[] = [];

    constructor(
        private buildingService: BuildingDataService,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.buildingId = Number(this.route.snapshot.params['buildingId']);
        this.getAllImagesByBuilding();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.uploadSuccess = false;
            this.uploadError = false;
        }
    }

    uploadFile(): void {
        if (!this.selectedFile) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No file selected',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('buildingId', this.buildingId.toString());

        this.buildingService
            .CreateBuildingSketch(formData, this.buildingId)
            .subscribe({
                next: () => {
                    this.uploadSuccess = true;
                    this.uploadError = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'File uploaded successfully!',
                    });
                    this.selectedFile = null;
                    this.getAllImagesByBuilding();
                },
                error: (err) => {
                    this.uploadSuccess = false;
                    this.uploadError = true;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to upload file. Please try again.',
                    });
                    console.error('Upload failed:', err);
                },
            });
    }

    getAllImagesByBuilding(): void {
        this.buildingService
            .GetAllSketchesByBuilding(this.buildingId)
            .subscribe((res) => {
                this.buildingSketches = res;
            });
    }

    getImageUri(uri: string): string {
        return `http://localhost:4322/images/building-sketch/${uri}`;
    }

    deletePhoto(item: BuildingSketchDTO): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this sketch?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.buildingService.DeleteBuildingSketch(item.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Sketch deleted successfully!',
                        });
                        this.getAllImagesByBuilding();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete sketch. Please try again.',
                        });
                        console.error('Delete failed:', err);
                    },
                });
            },
        });
    }
}
