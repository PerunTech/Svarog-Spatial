import { React } from 'perun-core';
import { PROCESS_ENUM, getProcessTitle } from '../../../config';
import { Button, Icon, length, areaMeasurements } from '../..';

/* The internal id of the process */
const _id = PROCESS_ENUM.erase;

export const clearLength = () => length.measurements.clearLayers();
export const clearArea = () => areaMeasurements.clearLayers();
export const clearMeasurements = () => (clearLength(), clearArea());

export const Eraser = (props) =>
    <Button {...props} 
        id={_id} 
        onClick={clearMeasurements} >
            <Icon name={_id} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(_id)}</span>
    </Button>;