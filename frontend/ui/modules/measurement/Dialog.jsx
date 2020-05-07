import { React } from 'perun-core';
import { Modal } from '../..';

export const Dialog = () => 
    <Modal show
        backdrop={false}
        enforceFocus={false}
        container={document.getElementsByClassName('control-map')[0]}
        dialogClassName='measure-dialog' >
            <Modal.Title>Test Measure Utility</Modal.Title>
            <Modal.Body >
                <span >Test Measure Utility Body</span>
            </Modal.Body>
    </Modal>;