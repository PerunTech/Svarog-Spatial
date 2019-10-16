import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from '../model/Connect'
import { Map } from './Map';
import { Loading } from '../../ui/loading/Loading';

function _MapControl ({isBusy}) {
    useEffect(() => { Map.init('mapContainer', {}); }, [])

    return <div id='mapContainer' className='mapContainer' style={{border: '4px inset'}} >
        {isBusy && <Loading />}
    </div>
}

_MapControl.propTypes = {
    isBusy: PropTypes.any
}

const mapState = ({isBusy}) => { return { isBusy: isBusy }}
export const MapControl = connect(mapState)(_MapControl);
