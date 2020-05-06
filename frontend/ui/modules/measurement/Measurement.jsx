import { React, PropTypes } from 'perun-core';
import { connect } from '../../../core';
import { PROCESS_ENUM, getProcessTitle } from '../../../config';
import { ButtonGroup, Button, Icon, 
    length as lengthTool, 
    area as areaTool, 
    angle as angleTool, 
    eraser as eraserTool } from '../..';

const { length, area, angle, erase } = PROCESS_ENUM

function _Measurement (props) {
    return <ButtonGroup id='measurement' >
        <Button id={length}
            className={props.activeId === length ? 'active' : ''}
            onClick={e => {props.dispatch({activeId:length}), lengthTool.enable(e)}} >
                <Icon name={length} size='32px' />
                <span style={{display: 'block'}}>{getProcessTitle(length)}</span>
        </Button>
        <Button id={area}
            className={props.activeId === area ? 'active' : ''}
            onClick={e => {props.dispatch({activeId:area}), areaTool.enable(e)}} >
                <Icon name={area} size='28px' />
                <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(area)}</span>
        </Button>
        <Button id={angle} onClick={() => angleTool.enable()} >
            <Icon name={angle} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(angle)}</span>
        </Button>
        <Button id={erase} onClick={()=> eraserTool.clearMeasurements()} >
            <Icon name={erase} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(erase)}</span>
        </Button>
    </ButtonGroup>
}

_Measurement.propTypes = {
    activeId: PropTypes.string,
    dispatch: PropTypes.func
}

export const Measurement = connect(({process}) => { 
    return { activeId: process.activeId };
})(_Measurement);