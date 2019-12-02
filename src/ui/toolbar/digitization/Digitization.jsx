import React from 'react';
import { Draw, Edit, Cut, Split, Merge, Landscape } from '../..';

export function Digitization () {
    return <div id='digitization' className='leaflet-pm-toolbar leaflet-pm-draw leaflet-bar leaflet-control' >
        <Draw />
        <Edit />
        <Cut />
        <Split />
        <Merge />
        <Landscape />
    </div>
}