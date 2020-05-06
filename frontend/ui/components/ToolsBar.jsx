import { React } from 'perun-core';
import { control } from '../../core';
import { Tab, Tabs, Digitization, Measurement, Navigation } from '..';

export const ToolsBar = props => 
    <Tabs id='toolsbar' defaultActiveKey='digitization'>
        <Tab eventKey='navigation' title='Навигација' children={<Navigation />} />
        <Tab eventKey='digitization' title='Дигитизација' children={<Digitization />} />
        <Tab eventKey='measurement' title='Мерења' children={<Measurement />} />
    </Tabs>;

control(ToolsBar, {}, {position: 'top'});