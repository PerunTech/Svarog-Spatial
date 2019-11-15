import React from 'react';
import { control, Map } from '../../core';
import { navTools } from '../../tools'
import { ButtonSet } from '../index';

export const navButtons = [{ 
        id: 'goToOrigin',
        title: 'Go to Origin',
        icon: 'control-icon leaflet-pm-icon-circle-marker',
        onClick: navTools.origin
    }, {
        id: 'goToLocation',
        title: 'Go to Location',
        icon: 'control-icon leaflet-pm-icon-marker',
        onClick: navTools.location
    }, {
        id: 'goToView',
        title: 'Go to View',
        icon: 'control-icon leaflet-pm-icon-rectangle',
        onClick: navTools.view
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
// , {}, {className: 'leaflet-control-zoom leaflet-bar leaflet-control'}