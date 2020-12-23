import { React, PropTypes } from 'perun-core';
import { ButtonGroup, Button, Icon } from '..';

export const DrawActions = ({finish, undo, cancel})  =>
    <ButtonGroup id='draw-actions' >
        {finish
            && <Button id='finish-shape' title='Потврди' onClick={e => finish(e)} >
                <Icon name='confirm' size='16px' />
            </Button>}

        {undo 
            && <Button id='delete-last-vertex' title='Поништи го последното теме' onClick={(e) => undo(e) } >
                <Icon name='undo' size='16px' />
            </Button>}

        {cancel
            && <Button id='cancel-draw' title='Откажи' onClick={(e) => cancel(e) } >
                <Icon name='cancel' size='16px' />
            </Button>}
    </ButtonGroup>

DrawActions.propTypes = {
    finish: PropTypes.func,
    undo: PropTypes.func,
    cancel: PropTypes.func
}