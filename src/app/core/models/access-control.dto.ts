import { AdminZoneDTO } from './location/adminstrative-zone.dto';
import { DzongkhagDTO } from './location/dzongkhag.dto';
import { SubAdminZoneDTO } from './location/subadministrative-zone.dto';
import { UserDTO } from './users/user.dto';

export interface CreateSubAdminZoneRightsByDzongkhagDTO {
    userId: number;
    dzongkhags: DzongkhagDTO[];
}

export interface CreateSubAdminZoneRightsByAdminZoneDTO {
    userId: number;
    adminZones: AdminZoneDTO[];
}

export interface CreateSubAdminZoneRightsBySubAdminZoneDTO {
    userId: number;
    subAdminZones: SubAdminZoneDTO[];
}

interface FailedCreateDTO {
    error: string;
    status: string;
    subAdminZone: SubAdminZoneDTO;
}
interface SuccessfulCreateDTO {
    status: string;
    subAdminZone: SubAdminZoneDTO;
}

export interface ResultCreateByDzongkhagAndAdminDTO {
    statusCode: number;
    message: string;
    failedCreates: FailedCreateDTO[];
    successfulCreates: SuccessfulCreateDTO[];
}

export interface SubAdminZoneRightDTO {
    id: number;

    userId: number;
    subAdminZoneId: number;

    user?: UserDTO;
    subAdminZone?: SubAdminZoneDTO;
}
