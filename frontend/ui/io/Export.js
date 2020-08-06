import { React } from 'perun-core';
import { ButtonGroup, Button, Icon } from '..';

export const Export = () => 
    <ButtonGroup id='io' >
        <Button >
            <Icon name='shapefile' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Извези SHP</span>
        </Button>
        <Button >
            <Icon name='geojson' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Извези GeoJSON</span>
        </Button>
        <Button >
            <Icon name='csv' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Извези CSV</span>
        </Button>
        <Button >
            <Icon name='xsl' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Извези XSL</span>
        </Button>
        <Button >
            <Icon name='pdf' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Извези PDF</span>
        </Button>
        <Button >
            <Icon name='map-report' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Извези Картографија</span>
        </Button>
        <Button >
            <Icon name='printer' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Испечати</span>
        </Button>
    </ButtonGroup>;