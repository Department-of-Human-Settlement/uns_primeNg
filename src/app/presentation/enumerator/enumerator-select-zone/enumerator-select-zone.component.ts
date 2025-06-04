import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { firstValueFrom } from 'rxjs';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { selectedLocationJson } from '../enumerator.constants';
import { EnumeratorSessionStateService } from '../enumerator-session-state.service';

@Component({
    selector: 'app-enumerator-select-zone',
    templateUrl: './enumerator-select-zone.component.html',
    styleUrls: ['./enumerator-select-zone.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        ButtonModule,
        FormsModule,
    ],
})
export class EnumeratorSelectZoneComponent implements OnInit {
    dzongkhags: any[] = [];
    zones: any[] = [];
    subzones: any[] = [];
    selectedDzongkhag!: any;
    selectedZone: any | undefined;
    selectedSubZone: any | undefined;
    selectZoneForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private locationService: LocationDataService,
        private sessionState: EnumeratorSessionStateService
    ) {}

    ngOnInit(): void {
        // Clear all session states when initializing zone selection
        this.sessionState.clearMapState();
        this.sessionState.clearSelectedBuilding();
        sessionStorage.removeItem(selectedLocationJson);

        // Load dzongkhags
        this.locationService.GetAllDzonghags().subscribe((res: any[]) => {
            this.dzongkhags = res;
        });
    }

    async handleDzongkhagChange(selectedOption: any) {
        console.log('Selected Dzongkhag:', selectedOption);
        this.locationService
            .GetAllAdministrativeZonesByDzongkhag(selectedOption.id)
            .subscribe({
                next: (res: any[]) => {
                    this.zones = res;
                },
            });
    }

    async handleZoneChange(selectedOption: any) {
        this.locationService
            .GetAllSubAdministrativeZonesByAdministrativeZone(selectedOption.id)
            .subscribe({
                next: (res: any[]) => {
                    this.subzones = res;
                },
            });
    }

    loadBuildings() {
        this.router.navigate([
            `/enum/load-buildings/${this.selectedSubZone.id}`,
        ]);
        sessionStorage.setItem(
            selectedLocationJson,
            JSON.stringify({
                dzongkhag: this.selectedDzongkhag,
                zone: this.selectedZone,
                subZone: this.selectedSubZone,
            })
        );
    }
}
