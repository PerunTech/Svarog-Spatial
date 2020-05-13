import { React, PropTypes } from 'perun-core';
import { util, factory, Map, connect } from "../../../core";
import { MEASURE_LINE, PROCESS_ENUM, getProcessTitle } from '../../../config';
import { draw } from '../../../tools';
import { Button, Icon, Modal, DrawActions } from '../..';

/* The internal id of the process */
const _id = PROCESS_ENUM.length;
/* Layer group of all length measurements, register is accessible from outside. */
export const lengthMeasurements = factory.layerGroup().addTo(Map);

function _Length ({options, ...props}) {
    const { activeId, dispatch, ..._props } = props;

    /* Disables measurement handler. Called automatically on map event,
        fired when the drawn shape is finished. */
    const disable = React.useCallback((e) => {
        (e && e.layer) 
            && (lengthMeasurements.addLayer(e.layer),
                Map.fitBounds(e.layer.getBounds()).off('pm:create', disable));

        dispatch({activeId: ''});
        draw.line.disable();
    }, [dispatch])

    /* Enables measurement handler */
    const enable = React.useCallback(() => {
        dispatch({ activeId: _id });
        Map.on('pm:create', disable);
        draw.line.enable(util.assign(MEASURE_LINE, options));
    }, [options, dispatch, disable])

    return <Button {..._props}
        id={_id} 
        className={activeId === _id ? 'active' : ''}
        onClick={() => enable() } >
            <Icon name={_id} size='32px' />
            <span style={{ display: 'block' }}>{getProcessTitle(_id)}</span>
            {activeId === _id 
                && <Modal show
                    id='measure-dialog'
                    backdrop={false} 
                    enforceFocus={false}
                    container={document.getElementsByClassName('control-map')[0]} >
                    <Modal.Title>
                        <Button disabled className='as-label' >Измерена површина</Button>
                        <DrawActions
                            finish={() => draw.line._finishShape()} 
                            undo={() => draw.line._removeLastVertex()}
                            cancel={disable} />
                    </Modal.Title>
                    <Modal.Body >
                        <Button onClick ={() => console.log('clicked')} >Test Measure Utility Body</Button>
                    </Modal.Body>
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