import React from 'react';
import { IconButton } from '../..';
import { navHandler } from '../../../tools';

export function View () {
    return <IconButton 
        id='view'
        title='Go to View'
        className='control-icon leaflet-pm-icon-view'
        onClick={navHandler.boxZoom}
        />
}