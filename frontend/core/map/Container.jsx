import {React, PropTypes} from 'perun-core';
import { connect, renderCycle as rc } from '..';
import { MAP_CONTAINER } from '../../config';
import { useMount, useUpdate } from '../../ui';

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
 * @param {boolean} props.refreshing - A flag for a manual refresh of all rendered geometries.
 * 
 * @returns JSX.Element;
 */
function _MapContainer ({ bbox, sid, refreshing }) {
    useMount(rc.start);
    useUpdate(rc.fetch, [bbox]);
    useUpdate(rc.render, [sid]);
    useUpdate(rc.refresh, [refreshing]);

    return <div id={MAP_CONTAINER} style={{height: '100vh'}} />
}

_MapContainer.propTypes = {
    bbox: PropTypes.string,
    sid: PropTypes.number,
    refreshing: PropTypes.bool,
};

export const MapContainer = connect(({map, app}) => {
    return { 
        bbox: map.bbox,
        sid: map.sid,
        refreshing: app.refreshing
}})(_MapContainer);
