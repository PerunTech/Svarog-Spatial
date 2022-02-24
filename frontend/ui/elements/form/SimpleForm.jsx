import { React, PropTypes } from 'perun-core';
import { Button, Modal } from '../../';

export function SimpleForm ({ formTitle, schema, uiSchema, formData, onSubmit, onChange, children }) {
    const vFormTitle = formTitle || 'Пополнете ја формата';
    return <Modal id='measure-dialog'
        show
        backdrop={false}
        enforceFocus={false}
        container={document.getElementsByClassName('control-map')[0]} >
        <Modal.Title>
            <Button disabled className='as-label ap-modal-title' >{vFormTitle}</Button>
            {children}
        </Modal.Title>
        <Modal.Body className='ap-modal-body' >
            <ui.Form
                schema={schema}
                uiSchema={uiSchema}
                formData={{ ...formData }}
                onSubmit={onSubmit}
                onChange={onChange} >
                <Button type='submit' size='' className='save-cnt' >
                    Зачувај
                </Button>
            </ui.Form>
        </Modal.Body>
    </Modal>;
}

SimpleForm.propTypes = {
    formTitle: PropTypes.string,
    schema: PropTypes.object,
    uiSchema: PropTypes.object,
    formData: PropTypes.object,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    children: PropTypes.node,
}
