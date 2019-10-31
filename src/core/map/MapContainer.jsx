import React from 'react';
import PropTypes from 'prop-types';
import { connect, renderCycle as rc } from '../index';
import { useMount, useUpdate } from '../../Hooks'
import { MAP_CONTAINER } from '../../Constants';


/**
 * The React container of the rendered map. 
 * Manages the render cycle of all assets shown on the map.
 * 
 * &nbsp;
 * 
 * @function _MapContainer (bbox: string, sid: number, refreshMap: boolean): JSX.Element
 * 
 * @param {Object} props - Properties.
 * @param {string} props.bbox - The current map bounding box.
 * @param {number} props.sid - The current map spatial id of the render cycle.
 * @param {boolean} props.refreshMap - A flag for a manual refresh of all rendered geometries.
 * 
 * @returns JSX.Element;
 */
function _MapContainer ({ bbox, sid, refreshMap }) {

    useMount(rc.start);
    useUpdate(rc.fetch, [bbox]);
    useUpdate(rc.render, [sid]);
    useUpdate(rc.refresh, [refreshMap]);

    return <div id={MAP_CONTAINER} className={MAP_CONTAINER} style={{height: '100vh', border: '4px inset'}} />
}

_MapContainer.propTypes = {
    bbox: PropTypes.string,
    sid: PropTypes.number,
    refreshMap: PropTypes.bool,
};

const subscriber = ({map}) => {
    console.log(map.sid)
    return { 
        bbox: map.bbox,
        sid: map.sid,
        refreshMap: map.refreshMap
}};

export const MapContainer = connect(subscriber)(_MapContainer);
