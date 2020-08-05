import { React } from 'perun-core';
import { CoordinatesControl, CRSControl, ScaleControl } from '..';

export function StatusBar () {
    return <>
        <CoordinatesControl />
        <ScaleControl />
        <CRSControl />
        <a 
            href='http://www.perun.tech/' 
            target='_blank'
            rel= 'noopener noreferrer' 
            className='author-link' >
                Perun Technologies ©
        </a>
    </>
}