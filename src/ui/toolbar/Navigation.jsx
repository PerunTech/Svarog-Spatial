import { Map, control } from '../../core';
import { navHandler } from '../../tools'
import { ButtonSet } from '..';

export const navButtons = [{ 
        id: 'zoomIn',
        title: 'Zoom In',
        icon: 'control-icon leaflet-pm-icon-zoom-in',
        onClick: () =>  Map.zoomIn()
    }, {
        id: 'zoomOut',
        title: 'Zoom Out',
        icon: 'control-icon leaflet-pm-icon-zoom-out',
        onClick: () => Map.zoomOut()
    },{ 
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
    }, {
        id: 'search',
        title: 'Search',
        icon: 'control-icon leaflet-pm-icon-search',
        onClick: navHandler.search
    }];

export const navToolbar = control(ButtonSet, { buttons: navButtons });