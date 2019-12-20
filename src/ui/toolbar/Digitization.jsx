import React from 'react';
import PropTypes from 'prop-types';
import { Icon, ButtonSet } from '..';
import { drawParcel, editParcel } from '../../tools';
import { PROCESS_ENUM } from '../../config';

export function Digitization ({activeId}) {
    return <ButtonSet id='digitization' >
        <div 
            id={PROCESS_ENUM.draw}
            title='Draw Parcel'
            className='button-container'
            onClick={drawParcel} >
            <Icon className='control-icon leaflet-pm-icon-draw' />
        </div>
        <div 
            id={PROCESS_ENUM.edit}
            title='Edit Parcel'
            className='button-container'
            onClick={editParcel} >
            <Icon className='control-icon leaflet-pm-icon-edit' />
        </div>
        <div 
            id={PROCESS_ENUM.cut}
            title='Cut Parcel'
            className='button-container'
            onClick={() => console.log('cut parcel on map')} >
            <Icon className='control-icon leaflet-pm-icon-cut' />
        </div>
        <div 
            id={PROCESS_ENUM.split}
            title='Split Parcel'
            className='button-container'
            onClick={() => console.log('split parcel on map')} >
            <Icon className='control-icon leaflet-pm-icon-split' />
        </div>
        <div 
            id={PROCESS_ENUM.merge}
            title='Merge Parcel'
            className='button-container'
            onClick={() => console.log('merge parcel on map')} >
            <Icon className='control-icon leaflet-pm-icon-merge' />
        </div>
        <div 
            id={PROCESS_ENUM.landscape}
            title='Add Landscape Feature'
            className='button-container'
            onClick={() => console.log('add landscape features on map')} >
            <Icon className='control-icon leaflet-pm-icon-landscape' />
        </div>
    </ButtonSet>
}

Digitization.propTypes = {
    activeId: PropTypes.string
};