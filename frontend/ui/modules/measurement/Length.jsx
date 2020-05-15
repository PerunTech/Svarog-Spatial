import { React, PropTypes } from 'perun-core';
import { factory, Map, connect, store } from "../../../core";
import { MEASURE_LINE, PROCESS_ENUM, getProcessTitle } from '../../../config';
import { draw } from '../../../tools';
import { Button, Icon, Modal, DrawActions } from '../..';

/* The internal id of the process */
const _id = PROCESS_ENUM.length;

/* Layer group of all length measurements, register is accessible from outside. */
export const lengthMeasurements = factory.layerGroup().addTo(Map);

/* Registers the drawn shape. Executes when measurement shape is finished. */
const _finishMeasurement = e => (e && e.layer) && lengthMeasurements.addLayer(e.layer);

/* Disables measurement handler. Called automatically on map event,
    fired when the drawn shape is finished. */
const _disable = () => {
    Map.off('new_shape', _finishMeasurement);
    store.dispatch({activeId: ''});
    draw.line._finishShape();
}; 

/* Enables measurement handler */
const _enable = () => {
    Map.on('new_shape', _finishMeasurement).on('draw_end', (e) => console.log(e))
    store.dispatch({ activeId: _id });
    draw.line.enable(MEASURE_LINE);
};

function _Length ({activeId, ..._props}) {
    const [totalLength, setLength] = React.useState(0);

    return <Button {..._props}
        id={_id} 
        className={activeId === _id ? 'active' : ''}
        onClick={_enable} >
            <Icon name={_id} size='32px' />
            <span style={{ display: 'block' }}>{getProcessTitle(_id)}</span>
            {activeId === _id 
                && <Modal show
                    id='measure-dialog'
                    backdrop={false} 
                    enforceFocus={false}
                    container={document.getElementsByClassName('control-map')[0]} >
                    <Modal.Title>
                        <Button disabled className='as-label' >Измерена должина</Button>
                        <DrawActions
                            finish={() => draw.line._finishShape()} 
                            undo={() => draw.line._removeLastVertex()}
                            cancel={_disable} />
                    </Modal.Title>
                    <Modal.Body children={<Button disabled className='as-label' >{totalLength}</Button>} />
                    <Modal.Footer children={<Button onClick={_disable} >Заврши</Button>} />
                </Modal>}
    </Button>
}

_Length.propTypes = {
    options: PropTypes.object,
    activeId: PropTypes.string,
    dispatch: PropTypes.func
}

export const Length = connect(({process}) => { 
    return { activeId: process.activeId };
})(_Length);