import { React, PropTypes} from 'perun-core';
import { util } from '../../../core';
import { Wizard, StepForm } from '../..';

export function ParcelForm ({schema, uiSchema, formData = {}}) {
    const onChange = input => setData(util.assign(data, input)),
        submit = () => console.log(data), // this should defer call to DrawParcel
        [data, setData] = React.useState(formData);

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

