import { React, PropTypes} from 'perun-core';
import { SYS_CENTER } from '../../../config';
import { util, Map } from '../../../core';
import { Coordinates, Pinpoint } from '../..';

export function CoordinatesControl (props) {
    // Component state, composite, updateable by reducer function. 
    const [{coordinates, active}, dispatch] = React.useReducer((currState, update) => 
        ({...currState, ...update}), {
            coordinates: Object.values(SYS_CENTER).map(c => String(c)),
            active: false 
        });

    /* The map listener for latlng location on mouse cursor movement. Passive mode. */
    const tracker = React.useCallback(util.fn.throttle(e => 
        dispatch({ coordinates: _transform(e.latlng, props.precision) }),
        100), []);
    
    /* An effect which mounts / unmounts mouse-recording tracker from the map when active state changes. */
    React.useEffect(() => { active
        ? Map.off('mousemove', tracker) 
        : Map.on('mousemove', tracker)}, [active, tracker]);

    return <div id='coordinates-control' className='coordinates-control' >
        <Coordinates {...props}
            coordinates={coordinates}
            onChange={e => {
                coordinates.splice(Number(e.target.name), 1, e.target.value);
                dispatch({coordinates: coordinates}); }}
            onFocus={() => !active && dispatch({active: true, coordinates: ['', '']})} 
            onBlur={e => !e.currentTarget.parentNode.contains(e.relatedTarget) && dispatch({active: false})} 
            validated={active} />
        <Pinpoint />
    </div>
}

CoordinatesControl.defaultProps = {
    precision: 4
};
CoordinatesControl.propTypes = {
    precision: PropTypes.number
}

const _transform = (latlng, precision) => 
    Object.values(Map.transform(latlng)).map(coord =>
        Number(coord).toFixed(precision));