import { React, PropTypes} from 'perun-core';
import { Form, Button } from '../..';

/**
 * A single step / partial application of a form. Use in assembly of a multi-step wizard.
 * 
 * @function StepForm (props: *): JSX
 * 
 * @param {*} props - Properties.
 * @param {Object} [props.schema] - The form schema. Defines fields.
 * @param {Object} [props.uiSchema] - The form uiSchema. Deines visualization.
 * @param {Object} [props.formData] - The form data. Deines fields data.
 * @param {Function} [props.onChange] - Callback for user input. 
 * @param {number} [props.activeStep] - The current active step in the set. 
 * @param {number} [props.totalSteps] - The total number of steps in the wizard.
 * @param {Function} [props.prev] - Callback for user access to the previous step.
 * @param {Function} [props.next] - Callback for user access to the next step.
 * @param {Function} [props.submit] - Callback on form submit.
 * 
 * @returns JSX; 
 */
export function StepForm ({schema, uiSchema, formData, onChange, activeStep, totalSteps, prev, next, submit}) {
    return <Form schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={(input) => onChange(input.formData)}
        onSubmit={() => activeStep() === totalSteps() ? submit() : next()} >
            <div id='formActions' >
                <Button type='button' onClick={prev} > Претходно </Button>
                <Button type='submit' > Наредно </Button>
            </div>
        </Form>;
}

StepForm.propTypes = {
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
    formData: PropTypes.any,
    onChange: PropTypes.func,
    activeStep: PropTypes.number,
    totalSteps: PropTypes.number,
    prev: PropTypes.func,
    next: PropTypes.func,
    submit: PropTypes.func
};