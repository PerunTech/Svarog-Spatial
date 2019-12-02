import React from 'react';
import { IconButton } from '../..';
import { measHandler } from '../../../tools';

export function Length () {
    return <IconButton 
        id='length'
        title='Measure Length'
        className='control-icon leaflet-pm-icon-length'
        onClick={measHandler.length}
        />
}