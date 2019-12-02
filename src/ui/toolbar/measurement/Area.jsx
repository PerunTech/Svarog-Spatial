import React from 'react';
import { IconButton } from '../..';
import { measHandler } from '../../../tools';

export function Area () {
    return <IconButton 
        id='area'
        title='Measure Area'
        className='control-icon leaflet-pm-icon-area'
        onClick={measHandler.area}
        />
}