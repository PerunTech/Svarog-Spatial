import { React, PropTypes } from 'perun-core';
import { control } from '../../core';
import { CoordinatesControl, CRSControl, ScaleControl, Divider, Button } from '..';

export function StatusBar (props) {
    return <React.Fragment >
        <CRSControl />
        <Divider />
        <CoordinatesControl />
        <Divider />
        <ScaleControl />
        <Divider />
        <Button disabled style={{width: '239px'}} className='as-label' ></Button>
    </React.Fragment>
}

control(StatusBar, {}, {position: 'bottom', className: 'status-bar'});