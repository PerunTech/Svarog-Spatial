import {React, PropTypes} from 'perun-core';
import { Map, connect, renderCycle as rc } from '..';
import { MAP_CONTAINER } from '../../config';
import { useUpdate } from '../../ui';

/**
 * The React container of the rendered map. 
 * Manages the render cycle of all assets shown on the map.
 * 
 * &nbsp;
 * 
 * @function _MapContainer (bbox: string, sid: number, refreshing: boolean): JSX.Element
 * 
 * @param {Object} props - Properties.
 * @param {string} props.bbox - The current map bounding box.
 * @param {number} props.sid - The current map spatial id of the render cycle.
 * @param {number} props.minZoom - The minimum zoom level of the map.
 * @param {number} props.maxZoom - The maximum zoom level of the map.
 * @param {boolean} props.refreshing - A flag for a manual refresh of all rendered geometries.
 * 
 * @returns JSX.Element;
 */
function _MapContainer ({ bbox, sid, minZoom, maxZoom, refreshing }) {
    /* Mount / Unmount effect */
    React.useEffect(() => {
        rc.start(); // Init program.
        
        return () => 
            rc.cleanup(); // Release program. 
    }, []);

    /* Runtime effects. */
    useUpdate(rc.fetch, [bbox]);
    useUpdate(rc.render, [sid]);
    useUpdate(rc.refresh, [refreshing]);

    React.useEffect(() => {
        Map.setMinZoom(minZoom).setMaxZoom(maxZoom)
    }, [maxZoom, minZoom]);

    return <div id={MAP_CONTAINER} style={{height: '100vh'}} />
}

_MapContainer.propTypes = {
    bbox: PropTypes.string,
    sid: PropTypes.number,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    refreshing: PropTypes.bool,
};

export const MapContainer = connect(({ map }) => {
    return { 
        bbox: map.bbox,
        sid: map.sid,
        minZoom: map.minZoom,
        maxZoom: map.maxZoom,
        refreshing: map.refreshing
}})(_MapContainer);
