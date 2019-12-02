import React from 'react';
import { ZoomIn, ZoomOut, Search, Origin, Location, View } from '../..';

export function Navigation () {
    return <div id='navigation' className='leaflet-pm-toolbar leaflet-pm-draw leaflet-bar leaflet-control' >
        <ZoomIn />
        <ZoomOut />
        <Search />
        <Origin />
        <Location />
        <View />
    </div>
}