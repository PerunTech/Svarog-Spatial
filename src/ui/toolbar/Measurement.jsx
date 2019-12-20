import React from 'react';
import PropTypes from 'prop-types';
import { Icon, ButtonSet } from '..';
import { measHandler } from '../../tools';
import { PROCESS_ENUM } from '../../config';

export function Measurement ({activeId}) {
    const className = 'button-container',
        setActive = (processType) => {return activeId === processType ? className + ' active' : className};

    return <ButtonSet id='measurement' >
        <div id={PROCESS_ENUM.length}
            title='Measure Length'
            className={setActive(PROCESS_ENUM.length)}
            onClick={measHandler.length} >
            <Icon className='control-icon leaflet-pm-icon-length' />
        </div>
        <div 
            id={PROCESS_ENUM.area}
            title='Measure Area'
            className={setActive(PROCESS_ENUM.area)}
            onClick={measHandler.area} >
            <Icon className='control-icon leaflet-pm-icon-area' />
        </div>
        <div
            id={PROCESS_ENUM.angle}
            title='Measure Angle'
            className={setActive(PROCESS_ENUM.angle)}
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
};