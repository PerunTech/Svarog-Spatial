import { React, PropTypes } from 'perun-core';
import { factory, Map, connect, store, util } from "../../../core";
import { MEASURE_LINE, PROCESS_ENUM, getProcessTitle } from '../../../config';
import { draw } from '../../../tools';
import { Button, Icon, Modal, DrawActions } from '../..';

/* The internal id of the process */
const _id = PROCESS_ENUM.length;
let _sum = 0

/* Layer group of all length measurements, register is accessible from outside. */
export const lengthMeasurements = factory.layerGroup().addTo(Map);


/* Registers the drawn shape. Executes when measurement shape is finished. */
const _finishMeasurement = e => 
    (e && e.layer) && (lengthMeasurements.addLayer(e.layer), _sum = _sum + calcCurrentLength(store.getState().measurement.totalLength));

const calcCurrentLength = str => Number(Array.from(str).filter(s =>
    '.0123456789'.split('').includes(s)).join('')) * (str.includes('km') ? 1000 : 1);

/* Disables measurement handler. */
const _disable = () => {
    _sum = 0
    Map.off('new_shape', _finishMeasurement);
    store.dispatch({activeId: '', totalLength: '0 m'});
    draw.line.disable('force');
}; 

/* Enables measurement handler */
const _enable = () => {
    Map.on('new_shape', _finishMeasurement);
    store.dispatch({ activeId: _id });
    draw.line.enable(MEASURE_LINE);
};

function _Length ({activeId, currentMeasure, ..._props}) {
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
                            cancel={_disable /* implement cancel rather than disable */} />
                    </Modal.Title>
                    <Modal.Body >
                        <Button 
                            disabled 
                            size='lg' 
                            className='as-label' >
                                {(_sum + currentMeasure)  + ' m'}
                        </Button>
                    </Modal.Body>
                    <Modal.Footer children={<Button onClick={_disable} >Заврши</Button>} />
                </Modal>}
    </Button>
}

_Length.propTypes = {
    currentMeasure: PropTypes.string,
    activeId: PropTypes.string,
    dispatch: PropTypes.func
}

export const Length = connect(({ process, measurement: {totalLength} }) => {
    return { 
        activeId: process.activeId,
        currentMeasure: calcCurrentLength(totalLength)
    };
})(_Length);