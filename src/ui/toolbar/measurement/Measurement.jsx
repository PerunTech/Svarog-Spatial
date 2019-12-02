import React from 'react';
import { Length, Area, Angle, ClearMeasures } from '../..';

export function Measurement () {
    return <div id='measurement' className='leaflet-pm-toolbar leaflet-pm-draw leaflet-bar leaflet-control' >
        <Length />
        <Area />
        <Angle />
        <ClearMeasures />
    </div>
}