import { React, PropTypes } from 'perun-core';
import { control } from '../../core';
import { CoordinatesControl, CRSControl, ScaleControl, Divider } from '..';

export function StatusBar (props) {
    return <React.Fragment >
        <a 
            href='http://www.perun.tech/' 
            target='_blank'
            rel= 'noopener noreferrer' 
            className='author-link' >
                Perun Technologies ©
        </a>
        <CoordinatesControl />
        <Divider />
        <ScaleControl />
        <Divider />
        <CRSControl />
    </React.Fragment>
}

control(StatusBar, {}, {position: 'bottom', className: 'status-bar'});
        // <Button disabled style={{width: '239px'}} className='as-label' ></Button>