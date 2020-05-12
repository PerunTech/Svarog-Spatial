import { React, PropTypes } from 'perun-core';
import { util, factory, Map, connect } from "../../../core";
import { MEASURE_LINE, PROCESS_ENUM, getProcessTitle } from '../../../config';
import { draw } from '../../../tools';
import { Button, Icon } from '../..';

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