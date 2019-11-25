import { control } from '../../core';
import { measHandler } from '../../tools';
import { ButtonSet } from '..';

const buttons = [{ 
        id: 'measLength',
        title: 'Measure Length',
        icon: 'control-icon leaflet-pm-icon-length',
        onClick: measHandler.length
    }, { 
        id: 'measArea',
        title: 'Measure Area',
        icon: 'control-icon leaflet-pm-icon-area',
        onClick: measHandler.area
    }, { 
        id: 'measAngle',
        title: 'Measure Angle',
        icon: 'control-icon leaflet-pm-icon-angle',
        onClick: measHandler.angle 
    }, { 
        id: 'deleteMeas',
        title: 'Remove Measurements',
        icon: 'control-icon leaflet-pm-icon-erase',
        onClick: measHandler.clearMeasurements 
    }];

export const measToolbar = control(ButtonSet, {buttons});