import { React, PropTypes } from 'perun-core';
import { factory, Map, connect, store } from "../../core";
import { MEASURE_LINE, PROCESS_ENUM, getProcessTitle } from '../../config';
import { draw } from '../../tools';
import { Button, Icon, Modal, DrawActions } from '..';

export const area = {
    /* The internal id of the process */
    id: PROCESS_ENUM.area,

    /* The measurements sum of the action */
    sum: 0,

    /* Layer group of all area measurements */
    measurements: factory.layerGroup().addTo(Map),

    enable: function () {
        Map.on('new_shape', this._finishMeasurement.bind(this));
        store.dispatch({ processID: this.id });
        draw.polygon.enable(MEASURE_LINE);
    },

    disable: function () {
        this.sum = 0;
        Map.off('new_shape');
        store.dispatch({processID: '', totalArea: '0 m²'});
        draw.polygon.disable('force');
    },

    _finishMeasurement: function (e) {
        if (e && e.layer) {
            this.measurements.addLayer(e.layer);
            this.sum = this.sum + this._calcCurrentArea(store.getState().measurement.totalArea);
            store.dispatch({totalArea: '0 m²'});
        }
    },

    _calcCurrentArea: str => 
        Number(Array.from(str).filter(s =>
            '.0123456789'.split('').includes(s)).join('')) * (str.includes('km') ? 1000000 : 1)
}

function _Area ({processID, currentMeasure, ..._props}) {
    const { id, sum, enable, disable } = area;

    return <Button {..._props}
        id={id} 
        className={processID === id ? 'active' : ''}
        onClick={enable.bind(area)} >
            <Icon name={id} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(id)}</span>
            {processID === id
                && <Modal show
                    id='measure-dialog'
                    backdrop={false} 
                    enforceFocus={false}
                    container={document.getElementsByClassName('control-map')[0]} >
                    <Modal.Title>
                        <Button disabled className='as-label' >Измерена површина</Button>
                        <DrawActions
                            finish={() => draw.polygon._finishShape()} 
                            undo={() => draw.polygon._removeLastVertex()}
                            cancel={() => (draw.polygon.disable('force'), draw.polygon.enable())} />
                    </Modal.Title>
                    <Modal.Body >
                        <Button disabled size='lg' className='as-label' >{(sum + currentMeasure)  + ' m²'}</Button>
                    </Modal.Body>
                    <Modal.Footer >
                        <Button size='' className='end-measurement' onClick={disable.bind(area)} >Заврши</Button>
                    </Modal.Footer>
                </Modal>}
    </Button>
}

_Area.propTypes = {
    currentMeasure: PropTypes.number,
    processID: PropTypes.string,
}

export const Area = connect(({ app, measurement }) => { 
    return { 
        processID: app.processID,
        currentMeasure: area._calcCurrentArea(measurement.totalArea)
    };
})(_Area);