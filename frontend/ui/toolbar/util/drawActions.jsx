import { React } from 'perun-core';
import { ProcessButton } from '../..';
import { draw } from '../../../tools';

export function drawActions (handler) {
    return <div id='drawActions' className='leaflet-pm-actions-container' >
        <ProcessButton id='finish-shape' onClick={e => draw.getHandler(handler.type)._finishShape(e)} />
        <ProcessButton id='delete-last-vertex' onClick={() => draw.getHandler(handler.type)._removeLastVertex() } />
        <ProcessButton id='cancel-draw' onClick={() => handler.disable() } />
    </div>
}