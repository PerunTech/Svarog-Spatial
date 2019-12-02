import React from 'react';
import { IconButton } from '../..';
import { navHandler } from '../../../tools';

export function Search () {
    return <IconButton 
        id='search'
        title='Search'
        className='control-icon leaflet-pm-icon-search'
        onClick={navHandler.search}
        />
}