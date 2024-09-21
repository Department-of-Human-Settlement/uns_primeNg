import { DzongkhagDTO } from './dzongkhag.dto';

export interface AdminZoneDTO {
    id: number;
    name: string;
    nameDzongkha?: string;
    dzongkhagId: number;

    dzongkhag: DzongkhagDTO;
}
