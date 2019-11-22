import React from 'react';
import { control, Map } from '../../core';
import { navHandler } from '../../tools'
import { ButtonSet } from '..';

export const navButtons = [{ 
        id: 'goToOrigin',
        title: 'Go to Origin',
        icon: 'control-icon leaflet-pm-icon-origin',
        onClick: navHandler.origin
    }, {
        id: 'goToLocation',
        title: 'Go to Location',
        icon: 'control-icon leaflet-pm-icon-location',
        onClick: navHandler.point
    }, {
        id: 'goToView',
        title: 'Go to View',
        icon: 'control-icon leaflet-pm-icon-view',
        onClick: navHandler.boxZoom
    }];

export function NavTools () {
    return <div id='navTools' style={{cursor: 'pointer'}}>
        <a id='zoomIn_control'
            className='leaflet-control-zoom-in'
            title='Zoom In'
            role='button'
            onClick={() => Map.zoomIn()} >
                +
        </a>
        <a id='zoomOut_control'
            className='leaflet-control-zoom-out'
            title='Zoom out'
            role='button'
            onClick={() => Map.zoomOut()} >
                -
        </a>
        <ButtonSet buttons={navButtons} />
    </div>
}

export const navToolbar = control(NavTools);