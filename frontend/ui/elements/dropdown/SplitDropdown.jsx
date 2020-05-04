import { React, PropTypes, elements} from 'perun-core';

export const SplitDropdown = ({variant, size, ...props}) => 
    <elements.ReactBootstrap.SplitButton {...props} variant={variant} size={size} />;

SplitDropdown.defaultProps = {
    variant: 'light',
    size: 'sm'
}
SplitDropdown.propTypes = {
    variant: PropTypes.string,
    size: PropTypes.string,
};