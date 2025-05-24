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
import { BuildingDataService } from 'src/app/core/services/building.dataservice';

@Component({
    selector: 'app-enumerator-take-building-photo',
    templateUrl: './enumerator-take-building-photo.component.html',
    styleUrls: ['./enumerator-take-building-photo.component.css'],
    standalone: true,
    imports: [DialogModule, CommonModule, ButtonModule, ToastModule],
    providers: [MessageService],
})
export class EnumeratorTakeBuildingPhotoComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement', { static: true })
    videoElement!: ElementRef<HTMLVideoElement>;

    private mediaStream!: MediaStream;
    public capturedImage: string | null = null;

    buildingId: number;

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
                video: { facingMode: 'environment' },
            });
            this.videoElement.nativeElement.srcObject = this.mediaStream;
        } catch (error) {
            console.error('Error accessing camera:', error);
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

        const blob = this.dataURItoBlob(this.capturedImage);
        const file = new File([blob], 'captured-image.png', {
            type: 'image/png',
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('buildingId', this.buildingId.toString());

        try {
            await this.buildingService
                .CreateBuildingImage(formData, this.buildingId)
                .toPromise();
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Image uploaded successfully!',
            });
            this.capturedImage = null;
            this.ref.close({
                status: 200,
            });
        } catch (error) {
            this.messageService.add({});
            console.error('Upload failed:', error);
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
