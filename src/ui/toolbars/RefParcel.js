import { control } from '../../core';
import { ButtonSet } from '../index';

const buttons = [{ 
        id: 'drawParcel',
        icon: 'control-icon leaflet-pm-icon-polygon',
        onClick: () => console.log('draw reference parcel on map')
    }, { 
        id: 'editParcel',
        icon: 'control-icon leaflet-pm-icon-edit',
        onClick: () => console.log('edit reference parcel on map') 
    }];


export const rpToolbar = control(ButtonSet, {buttons});