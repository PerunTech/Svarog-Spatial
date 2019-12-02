import React from 'react';
import { IconButton } from '../..';
import { drawParcel } from '../../../tools';

export function Draw () {
    return <IconButton 
        id='draw'
        title='Draw Parcel'
        className='control-icon leaflet-pm-icon-draw'
        onClick={drawParcel}
        />
}