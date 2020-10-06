import { React, PropTypes} from 'perun-core';
import { SYS_CENTER } from '../../config';
import { util, Map } from '../../core';
import { limits } from '../../tools';
import { Coordinates } from '..';

const { useReducer, useCallback, useEffect } = React;

export function CoordinatesControl (props) {
    // Component state, composite, updateable by reducer function. 
    const [{coordinates, active}, dispatch] = useReducer((currState, update) => 
        ({...currState, ...update}), {
            coordinates: Object.values(SYS_CENTER).map(c => String(c)),
            active: false
        });

    /* The map listener for latlng location on mouse cursor movement. Passive mode. */
    const tracker = useCallback(util.throttle(e => 
        dispatch({ coordinates: Object.values(Map.transform(e.latlng, props.precision)) }),
        100), []);
    
    /* An effect which mounts / unmounts mouse-recording tracker from the map when active state changes. */
    useEffect(() => { active
        ? Map.off('mousemove', tracker) 
        : Map.on('mousemove', tracker)}, [active, tracker]);

    /* Navigation helper, pans the map to the current coordinates when Enter is pressed. */
    const locate = useCallback(e => {
        if (e.keyCode === 13 && coordinates.reduce((acc, val, i) => 
            acc && val.length > 4 && limits.isBounded(val, i, true), true)) {
                Map.setView(Map.untransform({
                    x: Number(coordinates[0].padEnd(7, '00')),
                    y: Number(coordinates[1].padEnd(7, '00'))
                }), Map.getZoom());
            }
    }, [coordinates])

    return <div id='coordinates-control' className='coordinates-control' onKeyDown={locate} >
        <Coordinates {...props}
            coordinates={coordinates}
            onChange={e => {
                coordinates.splice(Number(e.target.name), 1, e.target.value);
                dispatch({coordinates: coordinates}); }}
            onFocus={() => !active && dispatch({active: true, coordinates: ['', '']})} 
            onBlur={e => !e.currentTarget.parentNode.contains(e.relatedTarget) && dispatch({active: false})} 
            validated={active} />
    </div>;
}

CoordinatesControl.defaultProps = {
    precision: 4
};
CoordinatesControl.propTypes = {
    precision: PropTypes.number
}