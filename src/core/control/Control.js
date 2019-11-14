import React from 'react';
import ReactDOM from 'react-dom';
import { factory, Map } from '../index';

export function control (opt = _opt) {
    const control = factory.Control.extend({
        initialize: function (opt) {
            this.options = opt;
            this.container = factory.DomUtil.create('div', this.options.className);
        },
    
        onAdd () {
            ReactDOM.render(<this.options.content {...this.options.props} />, this.container);
            return this.container;
        },
    
        onRemove () {}
    });

    return new control({ ..._opt, ...opt }).addTo(Map);
}

const _opt = {
    position: 'topleft', 
    className: 'mapToolbar',
    content: React.Component,
    props: {}
};