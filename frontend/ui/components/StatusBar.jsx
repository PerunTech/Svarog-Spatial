import { React, PropTypes } from 'perun-core';
import { control } from '../../core';
import { CoordinatesControl, CRSControl, ScaleControl, Button } from '..';

export function StatusBar (props) {
    return <>
        <a 
            href='http://www.perun.tech/' 
            target='_blank'
            rel= 'noopener noreferrer' 
            className='author-link' >
                Perun Technologies ©
        </a>
        <CoordinatesControl />
        <ScaleControl />
        <CRSControl />
        <Button disabled style={{width: '250px'}} />
    </>
}

control(StatusBar, {}, {position: 'bottom', className: 'status-bar'});