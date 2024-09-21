import { AdminZoneDTO } from './adminstrative-zone.dto';

export interface SubAdminZoneDTO {
    id: number;
    name: string;
    adminZoneId: number;
    medianRentId: number;

    adminZone?: AdminZoneDTO;
}
