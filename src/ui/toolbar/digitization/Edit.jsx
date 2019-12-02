import React from 'react';
import { IconButton } from '../..';
import { editParcel } from '../../../tools';

export function Edit () {
    return <IconButton 
        id='edit'
        title='Edit Parcel'
        className='control-icon leaflet-pm-icon-edit'
        onClick={editParcel}
        />
}