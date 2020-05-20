import { React, PropTypes} from 'perun-core';
import { connect } from '../../../core';
import { Button, Icon } from '../..';
import { getProcessTitle } from '../../../config';

/**
 * A Button HOC that actively listens to the registered application process and records 
 * its own process when accessed (clicked).  Use in toolbars and menus where each action button
 * should be aware of potential actions on all other buttons in the screen. 
 * 
 * &nbsp;
 * 
 * @function ToolbarButton(props: *): JSX
 * 
 * @param {*} props - Properties.
 * @param {string} [props.id] - The ID of the application process, acccessible via this button.
 * @param {Function} [props.onClick] - The callback to be executed on click. 
 *                   Automatically registers the process in store before passing the event to the click call.
 * @param {string} [props.processID] - The currently active process id, recorded in the application store.
 * @param {Function} [props.dispatch] - The publish function of the app store. Provided by connect.
 * 
 * @returns JSX;
 */
function _ToolbarButton ({id, onClick, ...props}) {
    return <Button {...props} 
        id={id} 
        className={props.processID === id ? 'active' : ''}
        onClick={e => {props.dispatch({processID:id}), onClick(e)}} >
            <Icon name={id} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(id)}</span>
    </Button>
}

_ToolbarButton.propTypes = {
    id: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    processID: PropTypes.string,
    dispatch: PropTypes.func
}

export const ToolbarButton = connect(({app}) => { 
    return { processID: app.processID };
})(_ToolbarButton);