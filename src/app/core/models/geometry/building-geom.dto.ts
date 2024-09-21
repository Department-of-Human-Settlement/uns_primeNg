import { Geometry } from '@turf/turf';
import { BuildingDTO } from '../buildings/building.dto';
import { BuildingGeomSourceType } from '../../constants';

export interface BuildingGeomDTO {
    id: number;
    buildingId: number;
    geom: Geometry;
    areaSqft: number;

    sourceType: BuildingGeomSourceType;
    sourceDetails: string;

    building?: BuildingDTO;
}
