import React from 'react';
import PropTypes from 'prop-types';
import { Navigation, Digitization, Measurement } from '..';
import { control, connect } from '../../core';

function _Toolbar ({activeId, children}) {
    return <div id='toolbar' > 
        {children.map(child => React.cloneElement(child, {activeId}) )}
    </div>
}

_Toolbar.propTypes = {
    activeId: PropTypes.string,
    children: PropTypes.node
}

export const Toolbar = connect(({process}) => { 
        return { activeId: process.id }; 
    })(_Toolbar);

/** `#revise_me` Move instantiation to somewhere more appropriate. */
control(
    Toolbar,
    {children: [<Navigation key='nav' />, <Digitization key='digi'/>, <Measurement key='meas' />]},
    {position: 'topleft'}
)
