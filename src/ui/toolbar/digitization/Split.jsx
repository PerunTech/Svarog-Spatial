import React from 'react';
import { IconButton } from '../..';

export function Split () {
    return <IconButton 
        id='split'
        title='Split Parcel'
        className='control-icon leaflet-pm-icon-split'
        onClick={() => console.log('split parcel on map')}
        />
}