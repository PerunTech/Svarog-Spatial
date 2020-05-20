import { React, PropTypes } from 'perun-core';
import { util, factory, Map, connect } from "../../../core";
import { MEASURE_LINE, PROCESS_ENUM, getProcessTitle } from '../../../config';
import { draw } from '../../../tools';
import { Button, Icon } from '../..';

/* The internal id of the process */
const _id = PROCESS_ENUM.area;
/* Layer group of all Area measurements, register is accessible from outside. */
export const areaMeasurements = factory.layerGroup().addTo(Map);

function _Area ({options, ...props}) {
    const { processID, dispatch, ..._props } = props;

    /* Disables measurement handler. Called automatically on map event,
        fired when the drawn shape is finished. */
    const disable = React.useCallback((e) => {
        (e && e.layer) 
            && (areaMeasurements.addLayer(e.layer),
                Map.fitBounds(e.layer.getBounds()).off('new_shape', disable));

        dispatch({processID: ''});
        draw.polygon.disable();
    }, [dispatch])

    /* Enables measurement handler */
    const enable = React.useCallback(() => {
        dispatch({ processID: _id });
        Map.on('new_shape', disable);
        draw.polygon.enable(util.assign(MEASURE_LINE, options));
    }, [options, dispatch, disable])

    return <Button {..._props}
        id={_id} 
        className={processID === _id ? 'active' : ''}
        onClick={() => enable() } >
            <Icon name={_id} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(_id)}</span>
    </Button>
}

_Area.propTypes = {
    options: PropTypes.object,
    processID: PropTypes.string,
    dispatch: PropTypes.func
}

export const Area = connect(({app}) => { 
    return { processID: app.processID };
})(_Area);