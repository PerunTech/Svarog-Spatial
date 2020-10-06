import { React } from 'perun-core';
import { ButtonGroup, Button, Icon } from '..';

export const Import = () => 
    <ButtonGroup id='io' >
        <Button >
            <Icon name='shapefile' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Увези SHP</span>
        </Button>
        <Button >
            <Icon name='geojson' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Увези GeoJSON</span>
        </Button>
    </ButtonGroup>;