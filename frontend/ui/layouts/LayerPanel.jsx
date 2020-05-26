import { React } from 'perun-core';
import { control } from '../../core';
import { Button, Icon } from '..';

export const LayerPanel = () => {
    const [isOpen, open] = React.useState(true);

    return <div id='layer-panel' >
        <Button id='layer-panel-toggle' onClick={() => open(!isOpen)} >
            <Icon name={isOpen ? 'chevron-right' : 'chevron-left'} size='16px' />
        </Button>
    </div>
};

control(LayerPanel, {}, { position: 'right' });
/* {isOpen && <Button disabled size='' className='as-label'>Листа на слоеви</Button>} */