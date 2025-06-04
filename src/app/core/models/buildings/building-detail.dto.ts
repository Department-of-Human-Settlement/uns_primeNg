export interface BuildingDetailDto {
    id?: number;
    buildingId?: number;
    existancyStatus?: string;
    associativePosition?: string;
    buildingName?: string;
    use?: string;
    type?: string;

    typology?: string;
    yearOfConstruction?: number;
    length?: number;
    breadth?: number;

    floorCount?: number;
    basementCount?: number;
    stiltCount?: number;
    atticCount?: number;
    jamthogCount?: number;
    contact?: number;
}

export interface CreateBuildingDetailsDto {
    buildingId: number;
    existancyStatus: string;
    associativePosition?: string;
    buildingName?: string;
    use?: string;
    floorCount?: number;
    basementCount?: number;
    type?: string;
    stiltCount?: number;
    atticCount?: number;
    jamthogCount?: number;
    contact?: number;

    length?: number;
    breadth?: number;
}

export interface UpdateBuildingDetailsDto {
    existancyStatus?: string;
    associativePosition?: string;
    buildingName?: string;
    use?: string;
    type?: string;
    floorCount?: number;
    basementCount?: number;
    stiltCount?: number;
    atticCount?: number;
    jamthogCount?: number;
    contact?: number;
    length?: number;
    breadth?: number;
}
