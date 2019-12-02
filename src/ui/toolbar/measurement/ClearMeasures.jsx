import React from 'react';
import { IconButton } from '../..';
import { measHandler } from '../../../tools';

export function ClearMeasures () {
    return <IconButton 
        id='clearMeasures'
        title='Clear Measurements'
        className='control-icon leaflet-pm-icon-erase'
        onClick={measHandler.clearMeasurements}
        />
}