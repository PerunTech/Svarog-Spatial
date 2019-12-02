import React from 'react';
import { IconButton } from '../..';
import { navHandler } from '../../../tools';

export function Location () {
    return <IconButton 
        id='location'
        title='Go to Location'
        className='control-icon leaflet-pm-icon-location'
        onClick={navHandler.point}
        />
}