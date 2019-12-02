import React from 'react';
import { IconButton } from '../..';

export function Landscape () {
    return <IconButton 
        id='landscape'
        title='Add Landscape Feature'
        className='control-icon leaflet-pm-icon-landscape'
        onClick={() => console.log('add landscape features on map')}
        />
}