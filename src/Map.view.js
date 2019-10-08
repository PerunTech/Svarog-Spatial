import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export const MapView = props => {
    // 
    let [isBusy, setBusy] = useState(false);
    //add hooks here
    useEffect(() => {
        console.log('test effect run on mount')
        return () => {
            console.log('test effect run on unmount')
        }
    }, []);

    return <div id='mapContainer' className='mapContainer' style={{border: '4px inset'}} >
            {props}
        </div>
}

MapView.propTypes = {
    test: PropTypes.oneOf[PropTypes.string, PropTypes.bool]
}

const mapStateToProps = (state, ownProps) => {
    const { gis: { data } } = state

    return {
        mapOrigin: data.mapOrigin,
        mapBbox: data.mapBbox,
        geomSID: data.geomSID,
        // permVc: config.vectorConfig.permanent,
        // spatialVc: config.vectorConfig.spatial,
        // rasterConfig: config.rasterConfig,
        layerControl: config.layerControl,
        geometry: geometry,

        object_id: data.rootData.object_id,
        token: state.security.svSession,
        rootData: data.rootData,
        mapOrigin: data.mapOrigin,
        refreshMap: data.refreshMap,

        zoomLevel: data.zoomLevel,

        departureDate: data.departureDate,
        arrivalDate: data.arrivalDate,
        startDate: data.startDate,
        expiryDate: data.expiryDate,
        filterHistory: data.filterHistory
    }
}
const MapContainer = connect(mapStateToProps)(MapView)