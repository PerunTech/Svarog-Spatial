import React from 'react';
import PropTypes from 'prop-types';
import { Navigation, Digitization, Measurement } from '..';
import { control, connect } from '../../core';

function _Toolbar ({processId, children}) {
    return <div > 
        {children.map(child => React.cloneElement(child, {processId}) )}
    </div>
}

_Toolbar.propTypes = {
    processId: PropTypes.string,
    children: PropTypes.array
}

export const Toolbar = connect(({process}) => { 
        return  { processId: process.id }; 
    })(_Toolbar);

/** `#revise_me` Move instantiation to somewhere more appropriate. */
control(
    Toolbar,
    {children: [<Navigation key='nav' />, <Digitization key='digi'/>, <Measurement key='meas' />]},
    {position: 'topleft'}
)
