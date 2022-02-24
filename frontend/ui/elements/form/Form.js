import { React, PropTypes, Form as RJSForm } from 'perun-core';

/**
 * Renders a generic form.
 * 
 * @function Form (props:Object): JSX.Element
 * 
 * @param {Object} props - Component properties.
 * 
 * @returns JSX.Element;
 */
export function Form({ children, childrenProps = {}, ...props }) {
    return <RJSForm {...props} >
        {children && (children instanceof Element ? children : React.cloneElement(children, childrenProps))}
    </RJSForm>
}

Form.propTypes = {
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
    formData: PropTypes.any,
    widgets: PropTypes.objectOf(
        PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    ),
    fields: PropTypes.objectOf(PropTypes.elementType),
    ArrayFieldTemplate: PropTypes.func,
    ObjectFieldTemplate: PropTypes.func,
    FieldTemplate: PropTypes.func,
    ErrorList: PropTypes.func,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    showErrorList: PropTypes.bool,
    onSubmit: PropTypes.func,
    id: PropTypes.string,
    className: PropTypes.string,
    tagName: PropTypes.func,
    name: PropTypes.string,
    method: PropTypes.string,
    target: PropTypes.string,
    action: PropTypes.string,
    autocomplete: PropTypes.string,
    autoComplete: PropTypes.string,
    enctype: PropTypes.string,
    acceptcharset: PropTypes.string,
    noValidate: PropTypes.bool,
    noHtml5Validate: PropTypes.bool,
    liveValidate: PropTypes.bool,
    validate: PropTypes.func,
    transformErrors: PropTypes.func,
    formContext: PropTypes.object,
    customFormats: PropTypes.object,
    additionalMetaSchemas: PropTypes.arrayOf(PropTypes.object),
    omitExtraData: PropTypes.bool,
    extraErrors: PropTypes.object,
    children: PropTypes.node,
    childrenProps: PropTypes.object
};