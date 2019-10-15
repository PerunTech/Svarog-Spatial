import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Map } from './Map';
import { MapLoading } from './MapLoading';

const _MapContainer = () => {
    // init
    useEffect(() => {
        Map.init();
        // render raster
        // get origin
    }, [])

    let [isBusy, setBusy] = useState(false);
    //add hooks here
    useEffect(() => {
        console.log('test effect run on mount')
        return () => {
            console.log('test effect run on unmount')
        }
    }, []);

    return <div id='mapContainer' className='mapContainer' style={{border: '4px inset'}} >
            {isBusy && <MapLoading />}
        </div>
}

_MapContainer.propTypes = {
    mapOrigin: PropTypes.string,
    mapBbox: PropTypes.string,
    geomSID: PropTypes.number
}

const mapStateToProps = (state) => {
    const { gis: { data } } = state

    return {
        mapOrigin: data.mapOrigin,
        mapBbox: data.mapBbox,
        geomSID: data.geomSID,
        // refreshMap: data.refreshMap,
    }
}
export const MapContainer = connect(mapStateToProps)(_MapContainer)