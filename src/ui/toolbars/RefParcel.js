import { control } from '../../core';
import { ButtonSet } from '..';

const buttons = [{ 
        id: 'addParcel',
        title: 'Add Parcel',
        icon: 'control-icon leaflet-pm-icon-draw',
        onClick: () => console.log('draw reference parcel on map')
    }, { 
        id: 'editParcel',
        title: 'Edit Parcel',
        icon: 'control-icon leaflet-pm-icon-edit',
        onClick: () => console.log('edit reference parcel on map') 
    }, { 
        id: 'cutParcel',
        title: 'Cut Parcel',
        icon: 'control-icon leaflet-pm-icon-cut',
        onClick: () => console.log('cut reference parcel on map') 
    }, { 
        id: 'splitParcel',
        title: 'Split Parcel',
        icon: 'control-icon leaflet-pm-icon-split',
        onClick: () => console.log('split reference parcel on map') 
    }, { 
        id: 'mergeParcel',
        title: 'Merge Parcels',
        icon: 'control-icon leaflet-pm-icon-merge',
        onClick: () => console.log('merge reference parcel on map') 
    }, { 
        id: 'addLandscapeFeats',
        title: 'Add Landscape Features',
        icon: 'control-icon leaflet-pm-icon-landscape',
        onClick: () => console.log('add landscape features on map')
    }];


export const rpToolbar = control(ButtonSet, {buttons});