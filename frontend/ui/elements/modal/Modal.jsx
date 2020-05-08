import { React, elements } from 'perun-core';

const RBModal = elements.ReactBootstrap.Modal;

export const Modal = props => 
    <RBModal {...props} />;

Modal.displayName = 'Modal';

Modal.Body = RBModal.Body;
Modal.Header = RBModal.Header;
Modal.Title = RBModal.Title;
Modal.Footer = RBModal.Footer;

Modal.Dialog = RBModal.ModalDialog;

Modal.TRANSITION_DURATION = 300;
Modal.BACKDROP_TRANSITION_DURATION = 150;