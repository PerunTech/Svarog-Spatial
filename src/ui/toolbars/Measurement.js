import { control } from '../../core';
import { measHandler } from '../../tools';
import { ButtonSet } from '..';

const buttons = [{ 
        id: 'measLength',
        title: 'Measure Length',
        icon: 'control-icon leaflet-pm-icon-length',
        onClick: () => console.log('measure length on map')
    }, { 
        id: 'measArea',
        title: 'Measure Area',
        icon: 'control-icon leaflet-pm-icon-area',
        onClick: () => console.log('measure area on map') 
    }, { 
        id: 'measAngle',
        title: 'Measure Angle',
        icon: 'control-icon leaflet-pm-icon-angle',
        onClick: () => console.log('measure angle on map') 
    }, { 
        id: 'deleteMeas',
        title: 'Remove Measurements',
        icon: 'control-icon leaflet-pm-icon-erase',
        onClick: () => console.log('remove measurements on map') 
    }];

export const measToolbar = control(ButtonSet, {buttons});