import { React, PropTypes } from 'perun-core';
import { Modal, Button, DrawActions } from '../..';

export const Dialog = ({title, handler}) => 
    <Modal show
        backdrop={false}
        enforceFocus={false}
        container={document.getElementsByClassName('control-map')[0]}
        dialogClassName='measure-dialog' >
            <Modal.Title>
                <Button disabled className='as-label' >{title}</Button>
                <DrawActions handler={handler} />
            </Modal.Title>
            <Modal.Body >
                <Button onClick ={() => console.log('clicked')} >Test Measure Utility Body</Button>
            </Modal.Body>
    </Modal>;

Dialog.propTypes = {
    title: PropTypes.string
}