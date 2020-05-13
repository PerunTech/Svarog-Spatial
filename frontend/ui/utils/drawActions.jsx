import { React, PropTypes } from 'perun-core';
import { ButtonGroup, Button, Icon } from '..';

export const DrawActions = ({finish, undo, cancel})  =>
    <ButtonGroup id='draw-actions' >
        <Button id='finish-shape' onClick={e => finish(e)} >
            <Icon name='yes' />
        </Button>
        <Button id='delete-last-vertex' onClick={(e) => undo(e) } >
            <Icon name='undo' />
        </Button>
        <Button id='cancel-draw' onClick={(e) => cancel(e) } >
            <Icon name='no' />
        </Button>
    </ButtonGroup>

DrawActions.propTypes = {
    finish: PropTypes.func,
    undo: PropTypes.func,
    cancel: PropTypes.func
}