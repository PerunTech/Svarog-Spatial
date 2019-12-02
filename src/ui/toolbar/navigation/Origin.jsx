import React from 'react';
import { IconButton } from '../..';
import { navHandler } from '../../../tools';

export function Origin () {
    return <IconButton 
        id='origin'
        title='Go to Origin'
        className='control-icon leaflet-pm-icon-origin'
        onClick={navHandler.origin}
        />
}