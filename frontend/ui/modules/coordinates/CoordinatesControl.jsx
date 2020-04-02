import React, { useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SYS_CENTER } from '../../../config';
import { util, Map } from '../../../core';
import { Coordinates, Pinpoint } from '../..';

export function CoordinatesControl (props) {
    // Component state, composite, updateable by reducer function (necessary for the onChange hook). 
    const [{coordinates, active}, dispatch] = useReducer((currState, update) => ({...currState, ...update}), {
            coordinates: Object.values(SYS_CENTER).map(c => String(c)),
            active: false 
        });

    /* The map listener for latlng location on mouse cursor movement. Passive mode. */
    const tracker = useCallback(util.fn.throttle(e => 
        dispatch({ coordinates: _transform(e.latlng, props.precision) }),
        100), []);
    
    /* An effect is run on state.active change, mounts / unmounts mouse-recording tracker from the map. */
    useEffect(() => { active
        ? Map.off('mousemove', tracker) 
        : Map.on('mousemove', tracker)}, [active, tracker]);

    return <div id='coordinates-control' className='coordinates-control' >
        <Coordinates {...props}
            coordinates={coordinates}
            onChange={e => {
                coordinates.splice(Number(e.target.name), 1, e.target.value);
                dispatch({coordinates: coordinates}); }}
            labeled
            validated={active}
            onFocus={() => !active && dispatch({active: true, coordinates: ['', '']})} 
            onBlur={e => !e.currentTarget.parentNode.contains(e.relatedTarget)
                && dispatch({active: false})} />
        <Pinpoint />
    </div>
}

CoordinatesControl.defaultProps = {
    precision: 4
};
CoordinatesControl.propTypes = {
    projected: PropTypes.bool,
    precision: PropTypes.number
}

const _transform = (latlng, precision) => 
    Object.values(Map.transform(latlng)).map(coord =>
        Number(coord).toFixed(precision));

// !Object.values(coordinates).reduce((acc, {valid}) => acc && valid, true)