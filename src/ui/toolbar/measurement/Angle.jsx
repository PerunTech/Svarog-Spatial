import React from 'react';
import { IconButton } from '../..';
import { measHandler } from '../../../tools';

export function Angle () {
    return <IconButton 
        id='angle'
        title='Measure Angle'
        className='control-icon leaflet-pm-icon-angle'
        onClick={measHandler.angle}
        />
}