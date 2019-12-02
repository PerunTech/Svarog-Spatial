import React from 'react';
import { IconButton } from '../..';

export function Merge () {
    return <IconButton 
        id='merge'
        title='Merge Parcel'
        className='control-icon leaflet-pm-icon-merge'
        onClick={() => console.log('merge parcel on map')}
        />
}