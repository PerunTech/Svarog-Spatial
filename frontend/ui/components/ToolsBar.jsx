import { React } from 'perun-core';
import { control } from '../../core';
import { Tab, Tabs, Digitization, Measurement, Navigation, Button } from '..';

export const ToolsBar = props => 
    <div style={{marginLeft: '250px', marginRight: '250px'}}>
        <Tabs id='toolsbar' defaultActiveKey='digitization' >
            <Tab eventKey='navigation' title='Навигација' children={<Navigation />} />
            <Tab eventKey='digitization' title='Дигитизација' children={<Digitization />} />
            <Tab eventKey='measurement' title='Мерења' children={<Measurement />} />
        </Tabs>
    </div>;

control(ToolsBar, {}, {position: 'top'});