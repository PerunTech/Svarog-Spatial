import { React } from 'perun-core';
import { CoordinatesControl, CRSControl, ScaleControl, Button } from '..';

export function StatusBar () {
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