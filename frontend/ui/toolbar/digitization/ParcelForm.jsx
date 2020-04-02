import React, {useState}  from 'react';
import PropTypes from 'prop-types';
import { util } from '../../../core';
import { Wizard, StepForm } from '../..';

export function ParcelForm ({schema, uiSchema, formData = {}}) {
    const onChange = input => setData(util.obj.assign(data, input)),
        submit = () => console.log(data), // this should defer call to DrawParcel
        [data, setData] = useState(formData);

    return <Wizard>
        {Object.keys(schema.properties).map(key => {
            return <StepForm key={key+ '_form'}
                schema={schema.properties[key]}  
                uiSchema={uiSchema}
                formData={formData}
                onChange={onChange}
                submit={submit} /> })}
    </Wizard>;
}

ParcelForm.propTypes = {
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object.isRequired,
    formData: PropTypes.object
}

