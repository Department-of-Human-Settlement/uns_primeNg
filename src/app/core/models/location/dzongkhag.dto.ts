import { AdminZoneDTO } from './adminstrative-zone.dto';

export interface DzongkhagDTO {
    id: number;
    name: string;
    nameDzongkha: string;

    adminZones?: AdminZoneDTO[];
}
