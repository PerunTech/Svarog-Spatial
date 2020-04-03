import { React } from 'perun-core';
import { ButtonGroup, ProcessButton, drawActions, drawParcel, editParcel } from '../..';
import { PROCESS_ENUM } from '../../../config';
import { control } from '../../../core';

export function Digitization () {
    return <ButtonGroup id='digitization' >
        <ProcessButton id={PROCESS_ENUM.draw} onClick={() => drawParcel.enable()} children={drawActions(drawParcel)} />
        <hr />
        <ProcessButton id={PROCESS_ENUM.edit} onClick={editParcel}
            children={<div className='leaflet-pm-actions-container' />}
        />
        <ProcessButton id={PROCESS_ENUM.cut} onClick={() => console.log('cut parcel on map')} />
        <hr />
        <ProcessButton id={PROCESS_ENUM.split} onClick={() => console.log('split parcel on map')} />
        <ProcessButton id={PROCESS_ENUM.merge} onClick={() => console.log('merge parcel on map')} />
        <ProcessButton id={PROCESS_ENUM.landscape} onClick={() => console.log('add landscape features on map')} />
    </ButtonGroup>
}
// control(Digitization, {}, {position: 'top'}); 