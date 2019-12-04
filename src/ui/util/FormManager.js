import { http } from '../../core';
import { Form } from '../elements/Form';

export const formManager = {
    getData (opt) { 
        return http.callConcurrently( Object.keys(opt), Object.values(opt) ); 
    },

    render (props) { 
        return Form(...props); 
    }
};

formManager.getData({
    rpData: { 
        url: '/sws/rpData',
        method: 'get',
        responseType: 'application/json'
    },
    schema: { 
        url: '/sws/schema',
        method: 'get',
        responseType: 'application/json'
    },
    uischema: { 
        url: '/sws/uischema',
        method: 'get',
        responseType: 'application/json'
    }
});