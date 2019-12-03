import React from 'react';
import { Length, Area, Angle, ClearMeasures } from '../..';
import { measHandler } from '../../../tools';

export function Measurement ({processId}) { //eslint-disable-line
    console.log(processId)
    return <div id='measurement' className='leaflet-pm-toolbar leaflet-pm-draw leaflet-bar leaflet-control' >
        <Length id='length' title='Measure Length' onClick={measHandler.length} />
        <Area />
        <Angle />
        <ClearMeasures />
    </div>
}