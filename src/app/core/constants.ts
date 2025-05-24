export enum GeomEditType {
    EDIT = 'EDIT',
    ADD = 'ADD',
}

export enum BuildingPointStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}
export enum UnitOccupancyStatus {
    'VACANT' = 'Vacant',

    // 'UNDER_MAINTENANCE' = 'Under Maintenance',
    // 'UNDER_CONSTRUCTION' = 'Under Construction',

    'OWNER_OCCUPIED' = 'OwnerOccupied',
    'RENTED' = 'Rented',
    // 'SHORT_TERM_RENTAL' = 'Short Term Rental',
    // 'OCCUPIED' = 'Occupied',
}

export enum UnitOwnershipTypes {
    'OWNER_OWNED' = 'Owner Owned',
    'INDIVIDUAL_OWNERSHIP' = 'Individual Ownership',
    'JOINT_OWNERSHIP' = 'Joint Ownership',
}

export enum BuildingOwnershipTypes {
    'SOLE' = 'SOLE',
    'JOINT' = 'JOINT',
    'STRATA' = 'STRATA',
}

export enum UserRoles {
    'ADMIN' = 'admin',
    'ENUMERATORS' = 'enumerator',
    'SUPERVISOR' = 'supervisor',
    'LG_FOCAL' = 'lg_focal',
}

export const BuildingExistancyStatus = [
    'Standing',
    'Under Construction',
    'Demolished',
    'Non Existant',
    'Temporary',
    'Others',
];

export const BuildingTypologies = [
    'RCC',
    'Confined Masonry',
    'Stone masonry with cement and mud mortar',
    'Stone masonry with cement mortar',
    'Rammed Earth',
    'Brick masonry',
    'Adobe blocks',
    'Timber',
    'Ikra',
    'Steel',
    'Others/Informal',
];

export const BuildingType = ['Traditional', 'Contemporary', 'Temporary'];

export const BuildingAssociativePositions = ['Primary', 'Ancillary'];

export const PrimaryUses = [
    'Mixed Use',
    'Residential',
    'Commercial',
    'Hotel',
    'Institutional',
    'Religious Institution',
    'Health',
    'Industrial',
    'Hospital',
    'Educational',
    'Office',
    'Storage',
    'Assembly',
];

export const NumberedDropDownOptions = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
];

export const UnitNumbers = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59',
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '70',
    '71',
    '72',
    '73',
    '74',
    '75',
    '76',
    '77',
    '78',
    '79',
    '80',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '90',
    '91',
    '92',
    '93',
    '94',
    '95',
    '96',
    '97',
    '98',
    '99',
    '100',
];

export const UnitOccupancyOption = ['Vacant', 'OwnerOccupied', 'Rented'];

export const UnitPrimaryUses = [
    'Mixed Use',
    'Residential',
    'Commercial',
    'Institutional',
    'Private Offices',
    'Hotes & Resorts',
    'Religious',
    'Social',
    'Health',
    'Industrial',
];
