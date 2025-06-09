import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import {
    WebcamImage,
    WebcamInitError,
    WebcamModule,
    WebcamUtil,
} from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
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
        WebcamModule,
    ],
    providers: [MessageService],
})
export class EnumeratorTakeBuildingPhotoComponent implements OnInit, OnDestroy {
    // Camera configuration
    public showWebcam = true;
    public allowCameraSwitch = true;
    public multipleWebcamsAvailable = false;
    public deviceId: string = '';
    public videoOptions: MediaTrackConstraints = {};
    public errors: WebcamInitError[] = [];

    // Captured image
    public webcamImage: WebcamImage | null = null;
    public capturedImageDataUrl: string | null = null;

    // Upload state
    public isUploading = false;
    public uploadProgress = 0;

    // Building ID from dialog config
    public buildingId: number;

    // Trigger for photo capture
    private trigger: Subject<void> = new Subject<void>();
    // Switch camera
    private nextWebcam: Subject<boolean | string> = new Subject<
        boolean | string
    >();

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

        // Set mobile-optimized video options with aspect ratio constraints
        this.videoOptions = {
            width: { ideal: 1280, max: 1920, min: 640 },
            height: { ideal: 720, max: 1080, min: 480 },
            aspectRatio: { ideal: 16 / 9, min: 4 / 3, max: 21 / 9 },
            facingMode: 'environment', // Start with back camera on mobile
            frameRate: { ideal: 30, max: 60 },
        };

        WebcamUtil.getAvailableVideoInputs().then(
            (mediaDevices: MediaDeviceInfo[]) => {
                this.multipleWebcamsAvailable =
                    mediaDevices && mediaDevices.length > 1;
            }
        );
    }

    public ngOnDestroy(): void {
        // Restore body scrolling when component is destroyed
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';

        this.trigger.complete();
        this.nextWebcam.complete();
    }

    public triggerSnapshot(): void {
        this.trigger.next();
    }

    public toggleWebcam(): void {
        this.showWebcam = !this.showWebcam;
    }

    public handleInitError(error: WebcamInitError): void {
        this.errors.push(error);
        this.messageService.add({
            severity: 'error',
            summary: 'Camera Error',
            detail: `Failed to initialize camera: ${error.message}`,
        });
    }

    public showNextWebcam(directionOrDeviceId: boolean | string): void {
        this.nextWebcam.next(directionOrDeviceId);
    }

    public handleImage(webcamImage: WebcamImage): void {
        this.webcamImage = webcamImage;
        this.capturedImageDataUrl = webcamImage.imageAsDataUrl;
        this.showWebcam = false;

        this.messageService.add({
            severity: 'success',
            summary: 'Photo Captured',
            detail: 'Photo captured successfully!',
            life: 2000,
        });
    }

    public cameraWasSwitched(deviceId: string): void {
        this.deviceId = deviceId;
        this.messageService.add({
            severity: 'info',
            summary: 'Camera Switched',
            detail: 'Camera switched successfully!',
            life: 2000,
        });
    }

    public get triggerObservable(): Observable<void> {
        return this.trigger.asObservable();
    }

    public get nextWebcamObservable(): Observable<boolean | string> {
        return this.nextWebcam.asObservable();
    }

    // Switch between front and back camera
    public switchCamera(): void {
        this.showNextWebcam(true);
    }

    // Retake photo
    public retakePhoto(): void {
        this.webcamImage = null;
        this.capturedImageDataUrl = null;
        this.showWebcam = true;
    }

    // Upload the captured image
    public async uploadImage(): Promise<void> {
        if (!this.webcamImage) {
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
            const blob = this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
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

    // Close the dialog
    public closeModal(): void {
        // Restore body scrolling before closing
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';

        this.ref.close();
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
        if (this.showWebcam) {
            // Space or Enter: Take photo
            if (event.key === ' ' || event.key === 'Enter') {
                this.triggerSnapshot();
            }
            // C: Switch camera (if multiple cameras available)
            else if (
                (event.key === 'c' || event.key === 'C') &&
                this.multipleWebcamsAvailable
            ) {
                this.switchCamera();
            }
        }
        // Handle keyboard events in preview mode
        else if (this.capturedImageDataUrl) {
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
        if (!this.showWebcam || event.changedTouches.length !== 1) return;

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
            if (this.multipleWebcamsAvailable) {
                this.switchCamera();
                this.messageService.add({
                    severity: 'info',
                    summary: 'Camera Switched',
                    detail: 'Swipe detected - camera switched!',
                    life: 2000,
                });
            }
        }

        // Check for double tap
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTapTime;

        if (tapLength < 500 && tapLength > 0) {
            // Double tap detected - capture photo
            event.preventDefault();
            this.triggerSnapshot();
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
