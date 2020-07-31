import { React, PropTypes } from 'perun-core';
import { Tab, Tabs, Measurement, Button } from '..';

export const ToolsBar = ({ tabs = [], opt = {} }) => {
    const _opt = {
        defaultTab: 'selection',
        selection: true,
        io: true,
        measurement: true,
        ...opt
    };

    return <div id='toolsbar' >
        <Tabs defaultActiveKey={_opt.defaultTab} >
            { /* tabs.map(tab => tab) */}

            {_opt.selection
                && <Tab eventKey='selection' title='Селекција' >
                    <Button size='' disabled className='as-label'>Во Изградба</Button>
                </Tab>}
            
            {_opt.io 
                && <Tab eventKey='io' title='Увезување / Извезување' >
                    <Button size='' disabled className='as-label'>Во Изградба</Button>
                </Tab>}

            {_opt.measurement 
                && <Tab eventKey='measurement' title='Мерења' >
                    <Measurement />
                </Tab>}
        </Tabs>
    </div>;
}

ToolsBar.propTypes = {
    tabs: PropTypes.array,
    opt: PropTypes.object
}