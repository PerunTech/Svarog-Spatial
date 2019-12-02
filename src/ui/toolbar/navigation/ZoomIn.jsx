import React from 'react';
import { IconButton } from '../..';
import { Map } from '../../../core';

export function ZoomIn () {
    return <IconButton 
        id='zoomIn'
        title='Zoom In'
        className='control-icon leaflet-pm-icon-zoom-in'
        onClick={() =>  Map.zoomIn()}
        />
}