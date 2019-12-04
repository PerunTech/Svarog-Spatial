import React from 'react';
import PropTypes from 'prop-types';
import { Icon, ButtonSet } from '..';
import { measHandler } from '../../tools';

export function Measurement ({activeId}) {
    console.log(activeId)
    return <ButtonSet id='measurement' >
        <div id='length'
            title='Measure Length'
            className='button-container'
            onClick={measHandler.length} >
            <Icon className='control-icon leaflet-pm-icon-length' />
        </div>
        <div 
            id='area'
            title='Measure Area'
            className='button-container'
            onClick={measHandler.area} >
            <Icon className='control-icon leaflet-pm-icon-area' />
        </div>
        <div
            id='angle'
            title='Measure Angle'
            className='button-container'
            onClick={measHandler.angle} >
            <Icon className='control-icon leaflet-pm-icon-angle' />
        </div>
        <div 
            id='clearMeasures'
            title='Clear Measurements'
            className='button-container'
            onClick={measHandler.clearMeasurements} >
            <Icon className='control-icon leaflet-pm-icon-erase' />
        </div>
    </ButtonSet>
}

Measurement.propTypes = {
    activeId: PropTypes.string
}