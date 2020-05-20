import { React, PropTypes} from 'perun-core';
import { connect, Map } from '../../../core';
import { DropdownButton, Dropdown } from '../..';

/**
 * Generate content body of ScaleControl. Static, use map init range of scales, these will not extend
 * for the lifetime of the application (i.e. this is the maximum extent of values, they may decrease only).
 * 
 * Access of crs.options.distances may fail if the currently used crs is not created with distances, 
 * but rather with resolutions or scales directly. The crs class needs to be revised,
 * before any assumptions are made here. 
 */
function _ScaleControl ({currZoom, minZoom, maxZoom}) {
    const distances = React.useMemo(() => 
        [...Map.getCRS().options.distances].splice(minZoom, maxZoom + 1), [minZoom, maxZoom]);

    return <DropdownButton title={`1 : ${distances[currZoom]}`} drop='up' alignRight >
        {distances.map((dist, i) => {
            return <Dropdown.Item 
                key={i} 
                eventKey={i} 
                active={i === currZoom} 
                onClick={() => Map.setView(Map.getCenter(), i)} >
                    {`1 : ${dist}`}
                </Dropdown.Item>})}
        </DropdownButton>
}

_ScaleControl.propTypes = {
    currZoom: PropTypes.number,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number
}

export const ScaleControl = connect(state => { 
    return {
        currZoom: state.map.zoom,
        minZoom: state.map.minZoom,
        maxZoom: state.map.maxZoom
    }
})(_ScaleControl);