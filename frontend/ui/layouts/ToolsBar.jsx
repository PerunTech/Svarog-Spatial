import { React } from 'perun-core';
import { control } from '../../core';
import { Tab, Tabs, Measurement, Button } from '..';

export const ToolsBar = props => 
    <div id='toolsbar' style={{marginLeft: '249px', marginRight: '249px', borderLeft: '1px solid rgba(0, 0, 0, 0.25)'}}>
        <Tabs defaultActiveKey='digitization' >
            <Tab eventKey='digitization' title='Дигитизација' >
                <Button size='' disabled className='as-label'>Во Изградба</Button>
            </Tab>
            <Tab eventKey='selection' title='Селекција' >
                <Button size='' disabled className='as-label'>Во Изградба</Button>
            </Tab>
            <Tab eventKey='measurement' title='Мерења' >
                <Measurement />
            </Tab>
        </Tabs>
    </div>;

control(ToolsBar, {}, {position: 'top'});