import React from 'react';
import { IconButton } from '../..';

export function Cut () {
    return <IconButton 
        id='cut'
        title='Cut Parcel'
        className='control-icon leaflet-pm-icon-cut'
        onClick={() => console.log('cut parcel on map')}
        />
}