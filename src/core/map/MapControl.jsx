import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from '../model/Connect'
import * as Actions from '../../Actions'
import { Loading } from '../../ui/loading/Loading';

function _MapControl (props) {
    const { mapOrigin, mapBbox, geomSID, refreshMap, isBusy } = props;
    // Did mount effect
    useEffect(() => { 
        console.log('I am called only once')
        Actions.initializeMap(); }, [])
    // Map assets initialization
    useEffect(() => { Actions.fetchVectors() }, [mapOrigin]) // this may be merged in init
    // Viewport change
    useEffect(() => { Actions.fetchRasters() }, [mapBbox])
    // Render data
    useEffect(() => { Actions.renderGeometry() }, [geomSID])
    // Manual refresh
    useEffect(() => { Actions.refreshGeometry() }, [refreshMap])

    return <div id='mapContainer' className='mapContainer' style={{height: '100vh', border: '4px inset'}} >
        {isBusy && <Loading />}
    </div>
}

_MapControl.propTypes = {
    mapOrigin: PropTypes.string,
    mapBbox: PropTypes.string,
    geomSID: PropTypes.number,
    refreshMap: PropTypes.bool,
    isBusy: PropTypes.any
}

const stateListener = (state) => { 
    return { 
        isBusy: state.isBusy
}}
export const MapControl = connect(stateListener)(_MapControl);
