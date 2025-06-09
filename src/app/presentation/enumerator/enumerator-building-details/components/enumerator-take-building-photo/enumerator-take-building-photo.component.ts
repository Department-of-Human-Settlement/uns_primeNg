import { CommonModule } from '@angular/common';
import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    HostListener,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
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
        TooltipModule,
    ],
    providers: [MessageService],
})
export class EnumeratorTakeBuildingPhotoComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    capturedImage: string | null = null;
    buildingId: string = '';
    errorMessage: string | null = null;

    // Camera state
    public stream: MediaStream | null = null;
    public canSwitchCamera = false;
    public currentFacingMode: 'user' | 'environment' = 'environment';

    // Captured image

    // Upload state
    public isUploading = false;
    public uploadProgress = 0;

    // Building ID from dialog config

    constructor(
        private buildingService: BuildingDataService,
        private config: DynamicDialogConfig,
        private messageService: MessageService,
        private ref: DynamicDialogRef
    ) {
        this.buildingId = this.config.data.buildingId;
    }

    public ngOnInit(): void {
        // Prevent body scrolling when camera is open
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';

        this.startCamera();
    }

    public ngOnDestroy(): void {
        // Restore body scrolling when component is destroyed
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';

        this.stopCamera();
    }

    public async startCamera(): Promise<void> {
        try {
            this.errorMessage = null;

            // Check if we can switch cameras by getting available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === 'videoinput'
            );
            this.canSwitchCamera = videoDevices.length > 1;

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            };

            this.stream = await navigator.mediaDevices.getUserMedia(
                constraints
            );

            if (this.videoElement) {
                this.videoElement.nativeElement.srcObject = this.stream;
            }
        } catch (error: any) {
            console.error('Error starting camera:', error);
            this.errorMessage = this.getErrorMessage(error);
        }
    }

    public stopCamera(): void {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
    }

    public async switchCamera(): Promise<void> {
        if (!this.canSwitchCamera) return;

        this.currentFacingMode =
            this.currentFacingMode === 'environment' ? 'user' : 'environment';

        this.stopCamera();
        await this.startCamera();

        const cameraType =
            this.currentFacingMode === 'environment' ? 'Back' : 'Front';
        this.messageService.add({
            severity: 'info',
            summary: 'Camera Switched',
            detail: `Switched to ${cameraType} Camera`,
            life: 2000,
        });
    }

    public capturePhoto(): void {
        if (!this.videoElement || !this.stream) return;

        const video = this.videoElement.nativeElement;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        this.capturedImage = canvas.toDataURL('image/png');

        this.messageService.add({
            severity: 'success',
            summary: 'Photo Captured',
            detail: 'Photo captured successfully!',
            life: 2000,
        });
    }

    public retakePhoto(): void {
        this.capturedImage = null;
        this.startCamera();
    }

    public async uploadImage(): Promise<void> {
        if (!this.capturedImage) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Image',
                detail: 'Please capture an image first',
            });
            return;
        }

        this.isUploading = true;
        this.uploadProgress = 0;

        try {
            // Convert base64 to blob
            const blob = this.dataURItoBlob(this.capturedImage);
            const file = new File([blob], 'captured-image.png', {
                type: 'image/png',
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('buildingId', this.buildingId.toString());

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                if (this.uploadProgress < 90) {
                    this.uploadProgress += 10;
                }
            }, 200);

            await this.buildingService
                .CreateBuildingImage(formData, Number(this.buildingId))
                .toPromise();

            clearInterval(progressInterval);
            this.uploadProgress = 100;

            setTimeout(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Image uploaded successfully!',
                });
                this.ref.close({ status: 200 });
            }, 500);
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Upload Failed',
                detail: 'Failed to upload image. Please try again.',
            });
            console.error('Upload error:', error);
        } finally {
            this.isUploading = false;
        }
    }

    public closeModal(): void {
        // Restore body scrolling before closing
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';

        this.stopCamera();
        this.ref.close();
    }

    private getErrorMessage(error: any): string {
        if (error.name === 'NotAllowedError') {
            return 'Camera access was denied. Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
            return 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
            return 'Camera is not supported on this device.';
        } else if (error.name === 'OverconstrainedError') {
            return 'Camera constraints could not be satisfied. Trying with basic settings...';
        } else {
            return 'An error occurred while accessing the camera. Please try again.';
        }
    }

    // Keyboard event handling
    @HostListener('keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        // Prevent default if we're handling the key
        if (
            event.key === ' ' ||
            event.key === 'Enter' ||
            event.key === 'c' ||
            event.key === 'C'
        ) {
            event.preventDefault();
        }

        // Only handle keyboard events when webcam is visible (not in preview mode)
        if (!this.capturedImage) {
            // Space or Enter: Take photo
            if (event.key === ' ' || event.key === 'Enter') {
                this.capturePhoto();
            }
            // C: Switch camera (if multiple cameras available)
            else if (
                (event.key === 'c' || event.key === 'C') &&
                this.canSwitchCamera
            ) {
                this.switchCamera();
            }
        }
        // Handle keyboard events in preview mode
        else if (this.capturedImage) {
            // R: Retake photo
            if (event.key === 'r' || event.key === 'R') {
                this.retakePhoto();
            }
            // U: Upload photo
            else if (
                (event.key === 'u' || event.key === 'U') &&
                !this.isUploading
            ) {
                this.uploadImage();
            }
        }

        // Escape: Close modal (available in both modes)
        if (event.key === 'Escape') {
            this.closeModal();
        }
    }

    // Touch event handling for mobile gestures
    private touchStartY = 0;
    private touchStartX = 0;
    private lastTapTime = 0;

    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent): void {
        if (event.touches.length === 1) {
            this.touchStartY = event.touches[0].clientY;
            this.touchStartX = event.touches[0].clientX;
        }
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd(event: TouchEvent): void {
        if (this.capturedImage || event.changedTouches.length !== 1) return;

        const touchEndY = event.changedTouches[0].clientY;
        const touchEndX = event.changedTouches[0].clientX;
        const deltaY = touchEndY - this.touchStartY;
        const deltaX = touchEndX - this.touchStartX;

        // Detect swipe gestures (minimum 50px movement)
        const minSwipeDistance = 50;

        // Horizontal swipe to switch camera
        if (
            Math.abs(deltaX) > minSwipeDistance &&
            Math.abs(deltaX) > Math.abs(deltaY)
        ) {
            if (this.canSwitchCamera) {
                this.switchCamera();
            }
        }

        // Check for double tap
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTapTime;

        if (tapLength < 500 && tapLength > 0) {
            // Double tap detected - capture photo
            event.preventDefault();
            this.capturePhoto();
            this.messageService.add({
                severity: 'success',
                summary: 'Photo Captured',
                detail: 'Double tap detected!',
                life: 1500,
            });
        }

        this.lastTapTime = currentTime;
    }

    // Convert data URI to Blob
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
