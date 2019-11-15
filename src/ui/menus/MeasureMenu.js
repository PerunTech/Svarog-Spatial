import { control } from '../../core';
import { ButtonSet } from '../index';

const buttons = [{ 
        id: 'drawParcel',
        icon: 'control-icon leaflet-pm-icon-polygon',
        onClick: () => console.log('measure area on map')
    }, { 
        id: 'editParcel',
        icon: 'control-icon leaflet-pm-icon-edit',
        onClick: () => console.log('measure area on map') 
    }];

export const measureMenu = control(ButtonSet, {buttons});