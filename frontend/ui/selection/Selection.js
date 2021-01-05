import { React } from 'perun-core';
import { ButtonGroup, Button, Icon, Divider } from '..';

export const Selection = () => 
    <ButtonGroup id='selection' >
        <Button disabled >
            <Icon name='selection' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери геометрија</span>
        </Button>
        <Divider />
        <Button disabled >
            <Icon name='selection-polygon' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери со полигон</span>
        </Button>
        <Button disabled >
            <Icon name='selection-frame' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери со рамка</span>
        </Button>
        <Button disabled >
            <Icon name='selection-radius' size='30px' />
            <span style={{display: 'block', marginTop: '5px' }}>Избери со радиус</span>
        </Button>
        <Divider />
        <Button disabled >
            <Icon name='informer' size='28px' />
            <span style={{display: 'block', marginTop: '5px' }}>Информатор</span>
        </Button>
    </ButtonGroup>;