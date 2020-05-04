import { React, PropTypes, elements} from 'perun-core';

export const DropdownButton = ({variant, size, ...props}) => 
    <elements.ReactBootstrap.DropdownButton {...props} variant={variant} size={size} />;

DropdownButton.defaultProps = {
    variant: 'light',
    size: 'sm'
}
DropdownButton.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};