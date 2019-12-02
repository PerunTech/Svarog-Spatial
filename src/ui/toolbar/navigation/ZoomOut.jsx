import React from 'react';
import { IconButton } from '../..';
import { Map } from '../../../core';

export function ZoomOut () {
    return <IconButton 
        id='zoomOut'
        title='Zoom Out'
        className='control-icon leaflet-pm-icon-zoom-out'
        onClick={() =>  Map.zoomOut()}
        />
}