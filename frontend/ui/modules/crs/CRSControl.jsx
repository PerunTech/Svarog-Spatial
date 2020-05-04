import { React } from 'perun-core';
import { Map } from '../../../core';
import { Button, Icon } from '../..';

export const CRSControl = () => 
        <Button style={{width: '239px'}} disabled className='as-label' >
            <Icon name='crs' style={{marginRight: '10px'}} />
            {Map.getCRS().desc}
        </Button>