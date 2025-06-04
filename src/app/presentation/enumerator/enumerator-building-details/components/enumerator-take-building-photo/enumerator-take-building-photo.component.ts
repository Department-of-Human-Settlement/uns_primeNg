import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    OnDestroy,
    inject,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';

@Component({
    selector: 'app-enumerator-take-building-photo',
    templateUrl: './enumerator-take-building-photo.component.html',
    styleUrls: ['./enumerator-take-building-photo.component.css'],
    standalone: true,
    imports: [
        DialogModule,
        CommonModule,
        ButtonModule,
        ToastModule,
        ProgressSpinnerModule,
        ProgressBarModule,
    ],
    providers: [MessageService],
})
export class EnumeratorTakeBuildingPhotoComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement', { static: true })
    videoElement!: ElementRef<HTMLVideoElement>;

    private mediaStream!: MediaStream;
    public capturedImage: string | null = null;

    buildingId: number;
    loading: boolean = false;
    uploadProgress: number = 0;
    cameraError: string | null = null;
    isCameraReady: boolean = false;
    isUploading: boolean = false;

    constructor(
        private buildingService: BuildingDataService,
        private config: DynamicDialogConfig,
        private messageService: MessageService,
        private ref: DynamicDialogRef
    ) {
        this.buildingId = this.config.data.buildingId;
    }

    ngOnInit(): void {
        this.startCamera();
    }

    ngOnDestroy(): void {
        this.stopCamera();
    }

    async startCamera(): Promise<void> {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });
            this.videoElement.nativeElement.srcObject = this.mediaStream;
            this.videoElement.nativeElement.onloadedmetadata = () => {
                this.isCameraReady = true;
                this.cameraError = null;
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.cameraError =
                'Failed to access camera. Please make sure you have granted camera permissions.';
            this.messageService.add({
                severity: 'error',
                summary: 'Camera Error',
                detail: this.cameraError,
            });
        }
    }

    stopCamera(): void {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
        }
    }

    capturePhoto(): void {
        const video = this.videoElement.nativeElement;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            this.capturedImage = canvas.toDataURL('image/png');
        }
    }

    async uploadImage(): Promise<void> {
        if (!this.capturedImage) {
            return;
        }

        this.isUploading = true;
        this.uploadProgress = 0;

        const blob = this.dataURItoBlob(this.capturedImage);
        const file = new File([blob], 'captured-image.png', {
            type: 'image/png',
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('buildingId', this.buildingId.toString());

        try {
            // Simulate upload progress (since actual API doesn't provide progress)
            const progressInterval = setInterval(() => {
                if (this.uploadProgress < 90) {
                    this.uploadProgress += 10;
                }
            }, 200);

            await this.buildingService
                .CreateBuildingImage(formData, this.buildingId)
                .toPromise();

            clearInterval(progressInterval);
            this.uploadProgress = 100;

            setTimeout(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Image uploaded successfully!',
                });
                this.capturedImage = null;
                this.ref.close({
                    status: 200,
                });
            }, 500); // Give time to see 100% progress
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to upload image',
            });
            console.error('Upload failed:', error);
        } finally {
            this.isUploading = false;
        }
    }

    closeModal(): void {
        this.stopCamera();
        this.ref.close();
    }

    private dataURItoBlob(dataURI: string): Blob {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }
}
