import { React, PropTypes } from 'perun-core';
import { Tab, Tabs, Selection, Measurement, Import, Export } from '..';

export const ToolsBar = ({ tabs = [], opt = {} }) => {
    const _opt = {
        defaultTab: 'selection',
        selection: true,
        measurement: true,
        import: true,
        export: true,
        ...opt
    };

    return <div id='toolsbar' >
        <Tabs defaultActiveKey={_opt.defaultTab} >
            { /* tabs.map(tab => tab) */}

            {_opt.selection
                && <Tab eventKey='selection' title='Селекција' >
                    <Selection />
                </Tab>}
            {_opt.measurement 
                && <Tab eventKey='measurement' title='Мерења' >
                    <Measurement />
                </Tab>}
            {_opt.import 
                && <Tab eventKey='import' title='Увезување' >
                    <Import />
                </Tab>}
            {_opt.export 
                && <Tab eventKey='export' title='Извезување' >
                    <Export />
                </Tab>}
        </Tabs>
    </div>;
}

ToolsBar.propTypes = {
    tabs: PropTypes.array,
    opt: PropTypes.object
}