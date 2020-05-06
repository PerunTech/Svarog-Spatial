import { React } from 'perun-core';
import { control } from '../../core';
import { Tab, Tabs, Digitization, Measurement, Navigation } from '..';

export const ToolsBar = props => 
    <div style={{marginLeft: '249px', marginRight: '249px', borderLeft: '1px solid rgba(0, 0, 0, 0.25)'}}>
        <Tabs id='toolsbar' defaultActiveKey='digitization' >
            <Tab eventKey='navigation' title='Навигација' children={<Navigation />} />
            <Tab eventKey='digitization' title='Дигитизација' children={<Digitization />} />
            <Tab eventKey='selection' title='Селекција' children={<Measurement />} />
            <Tab eventKey='measurement' title='Мерења' children={<Measurement />} />
        </Tabs>
    </div>;

control(ToolsBar, {}, {position: 'top'});