import { UserRoles } from '../../constants';

export interface UserDTO {
    id: number;
    cid: string;
    password: string;
    fullName: string;
    role: UserRoles;

    designation: string;
    workingAgency: string;
}

export interface CreateUserDTO {
    cid: string;
    password: string;
    fullName: string;
    role: UserRoles;
}

export interface UpdateUserDTO {
    cid: string;
    fullName: string;
    role: UserRoles;

    designation: string;
    workingAgency: string;
}
