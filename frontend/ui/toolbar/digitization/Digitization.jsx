import { React } from 'perun-core';
import { ButtonGroup, ToolbarButton, drawParcel, editParcel } from '../..';
import { PROCESS_ENUM } from '../../../config';

export function Digitization () {
    return <ButtonGroup id='digitization' >
        <ToolbarButton id={PROCESS_ENUM.draw} onClick={() => drawParcel.enable()} />
        <hr />
        <ToolbarButton id={PROCESS_ENUM.edit} onClick={editParcel}
            children={<div className='leaflet-pm-actions-container' />}
        />
        <ToolbarButton id={PROCESS_ENUM.cut} onClick={() => console.log('cut parcel on map')} />
        <hr />
        <ToolbarButton id={PROCESS_ENUM.split} onClick={() => console.log('split parcel on map')} />
        <ToolbarButton id={PROCESS_ENUM.merge} onClick={() => console.log('merge parcel on map')} />
        <ToolbarButton id={PROCESS_ENUM.landscape} onClick={() => console.log('add landscape features on map')} />
    </ButtonGroup>
}