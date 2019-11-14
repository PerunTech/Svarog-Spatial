import { control } from '../../core';
import { Toolbar } from '../index';

export const navigateMenu = control({
    position: 'topleft',
    className: 'leaflet-pm-toolbar leaflet-pm-draw leaflet-bar leaflet-control',
    content: Toolbar,
    props: {
        buttons: [
            { 
                id: 'drawParcel',
                icon: 'control-icon leaflet-pm-icon-polygon',
                onClick: () => console.log('navigate to polygon on map')
            },
            { 
                id: 'editParcel',
                icon: 'control-icon leaflet-pm-icon-edit',
                onClick: () => console.log('navigate to polygon on map') 
            }
        ]}
});