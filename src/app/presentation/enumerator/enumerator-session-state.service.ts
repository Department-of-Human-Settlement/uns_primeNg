import { Injectable } from '@angular/core';

export interface EnumeratorMapState {
    center: { lat: number; lng: number };
    zoom: number;
}

@Injectable({
    providedIn: 'root',
})
export class EnumeratorSessionStateService {
    private readonly MAP_STATE_KEY = 'mapState';
    private readonly SELECTED_BUILDING_KEY = 'selectedBuilding';

    setMapState(center: { lat: number; lng: number }, zoom: number): void {
        const state: EnumeratorMapState = { center, zoom };

        sessionStorage.setItem(this.MAP_STATE_KEY, JSON.stringify(state));
    }

    getMapState(): EnumeratorMapState | null {
        const state = sessionStorage.getItem(this.MAP_STATE_KEY);
        if (!state) return null;
        try {
            return JSON.parse(state);
        } catch {
            return null;
        }
    }

    clearMapState(): void {
        sessionStorage.removeItem(this.MAP_STATE_KEY);
    }

    setSelectedBuilding(building: any): void {
        sessionStorage.setItem(
            this.SELECTED_BUILDING_KEY,
            JSON.stringify(building)
        );
    }

    getSelectedBuilding(): any {
        const building = sessionStorage.getItem(this.SELECTED_BUILDING_KEY);
        if (!building) return null;
        try {
            return JSON.parse(building);
        } catch {
            return null;
        }
    }

    clearSelectedBuilding(): void {
        sessionStorage.removeItem(this.SELECTED_BUILDING_KEY);
    }
}
