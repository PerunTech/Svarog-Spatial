import { React, PropTypes } from 'perun-core';
import { ButtonGroup, Button, Icon } from '..';

export const DrawActions = ({finish, undo, cancel})  =>
    <ButtonGroup id='draw-actions' >
        <Button id='finish-shape' onClick={e => finish(e)} >
            <Icon name='confirm' size='16px' />
        </Button>
        <Button id='delete-last-vertex' onClick={(e) => undo(e) } >
            <Icon name='undo' size='16px' />
        </Button>
        <Button id='cancel-draw' onClick={(e) => cancel(e) } >
            <Icon name='cancel' size='16px' />
        </Button>
    </ButtonGroup>

DrawActions.propTypes = {
    finish: PropTypes.func,
    undo: PropTypes.func,
    cancel: PropTypes.func
}