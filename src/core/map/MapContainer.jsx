import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from '../model/Connect';
import { MAP_CONTAINER } from '../../Constants';
import {RenderCycle as RC} from './RenderCycle';

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

    useEffect(() => { RC.start(); }, []);
    useEffect(() => { RC.fetch(); }, [bbox]);
    useEffect(() => { RC.render(); }, [sid]);
    useEffect(() => { RC.refresh(); }, [refreshMap]);

    return <div id={MAP_CONTAINER} className={MAP_CONTAINER} style={{height: '100vh', border: '4px inset'}} />
}

_MapContainer.propTypes = {
    bbox: PropTypes.string,
    sid: PropTypes.number,
    refreshMap: PropTypes.bool,
};

const subscriber = state => {
    const { mapState } = state
    return { 
        bbox: mapState.bbox,
        sid: mapState.sid,
        refreshMap: mapState.refreshMap
}};

export const MapContainer = connect(subscriber)(_MapContainer);
