import { BuildingDetailDto } from './models/buildings/building-detail.dto';

export function PARSEDATE(date: string) {
    const dateObject = new Date(date);

    // Format the Date object to a human-readable string
    return dateObject.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}

export function GETBUILDINGFLOORLABEL(
    floorLevel: number,
    basementCount: number,
    stiltCount: number,
    totalFloors: number,
    atticCount: number,
    jamthogCount: number
) {
    return 'Ground';
}

export function PARSEBUILDINGFLOORS(
    building: BuildingDetailDto | null
): string {
    if (!building) {
        return 'NA';
    }
    const basementCount = building.basementCount || 0;
    const stiltCount = building.stiltCount || 0;
    const floorCount = building.floorCount || 0;
    const atticCount = building.atticCount || 0;
    const jamthogCount = building.jamthogCount || 0;

    const basementLabel = basementCount
        ? basementCount === 1
            ? 'B+'
            : `${basementCount}B+`
        : '';
    const stiltLabel = stiltCount
        ? stiltCount === 1
            ? 'S+'
            : `${stiltCount}S+`
        : '';
    const regularFloorLabel =
        floorCount > 1 ? `G+${floorCount - 1}` : floorCount === 1 ? `G` : '';

    const atticLabel = atticCount
        ? atticCount === 1
            ? 'A'
            : `${atticCount}A`
        : '';
    const jamthogLabel = jamthogCount
        ? jamthogCount === 1
            ? 'J'
            : `${jamthogCount}J`
        : '';

    return `${basementLabel}${stiltLabel}${regularFloorLabel}${
        atticLabel ? `+${atticLabel}` : ''
    }${jamthogLabel ? `+${jamthogLabel}` : ''}`;
}
