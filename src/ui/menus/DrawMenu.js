import { control } from '../../core';
import { ButtonSet } from '../index';

const buttons = [{ 
        id: 'drawParcel',
        icon: 'control-icon leaflet-pm-icon-polygon',
        onClick: () => console.log('draw polygon on map')
    }, { 
        id: 'editParcel',
        icon: 'control-icon leaflet-pm-icon-edit',
        onClick: () => console.log('draw polygon on map') 
    }];

export const drawMenu = control(ButtonSet, {buttons});
