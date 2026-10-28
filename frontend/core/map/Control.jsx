import { React, createRoot } from 'perun-core';
import { factory, Map, Provider } from '..';

/* Every control `control()` has on a map, for `removeControls()`. */
const _controls = new Set();

/**
 * Render embedded user interface in the map frame. 
 * The interface composition can be plain HTML | React.Node.
 * 
 * &nbsp;
 * 
 * After compilation, JSX expressions become regular JavaScript function calls and evaluate to JavaScript objects =>
 * `typeof <Symbol> of a ReactElement`. Each JSX is transpiled to `React.createElement =>`
 *  `Fn(type <T>, props <P>, children <C>): JSX | ReactElement <Symbol>.`
 *
 * CreateElement is called recursively (for jsx returned types) until all return types are reactElements,
 * then reconciliation is triggered and the react vDOM is built out of these elements. React vDOM,
 * tree of reactElements <Object> describing the actual browser DOM <Html>, defaults to HTML by
 * ReactDOM.render calls => `Fn(element <ReactElement>, container <Html> [, callback <Fn>]): void | this`.
 *
 * React class or Fn (stateless comp) is a jsx factory fn, has input and returns jsx which defaults to
 * a React.createELement call. Notice that the only mandatory method to these factories is the render(),
 * which calls ReactDOM.render in the back, effectively turning these abstractions into real DOM elements.
 *
 * Given the above, in order to embed React we simply compose our UI item(s) and pass the root
 * React component || function (`not instance!, the actual class`) here as `UI` argument. Pass the necessary `props`,
 * as an optional arguments. Strive to be minimal, don't pass a whole app to this function (think menu / button).
 * 
 * &nbsp;
 * 
 * @function control (UI: React.Component | Element, props?: Object, opt?: Object): Control
 * 
 * @param {React.Component | Element} UI - The user interface element / composition.
 * @param {Object} [props] - Props for your React UI.
 * @param {Object} [opt] - Configuratiuon object.
 * @param {string} [opt.position] - Rendering position in the map frame. Default is left.
 *        Valid locations are 'top', 'bottom', 'left', 'right'. These are the main control blocks.
 *        Sub-locations include 'topleft', 'topright', 'bottomleft', 'bottomright'. These are map overlay helpers.
 *        'bottomcenter' is one of these too, centred under the map, for a control that describes it rather
 *        than acts on it -- a coordinate readout, a scale.
 * @param {string} [opt.className] - The css class of the Control.
 * 
 * @returns Control;
 */
export function control (UI, props = {}, opt = _opt) {
    /**
     * Injects UI into a new extended instance of Control. Automatically adds and renders
     * the UI in the map, for convenience.
     * 
     * @class Control
     */
    const Control = factory.Control.extend({
        initialize: function (opt) {
            this.options = opt;
        },
        
        onAdd () {
            // A new container on each add, so it never holds a root that is still unmounting.
            this.container = factory.DomUtil.create('div', this.options.className);

            if (UI instanceof Element) { // `#revise_me`, need to test this.
                this.container.appendChild(UI);
            } else {
                this.root = createRoot(this.container);
                this.root.render(<Provider children={<UI {...props} />} />);
            }
            _controls.add(this);

            return this.container; // This hook must return HTMLElement.
        },
    
        /**
         * Take the React tree off with the control.
         *
         * Leaflet calls this and then detaches the container, so without an
         * unmount the tree carries on running against a node that is no longer
         * in the document: every `useEffect` cleanup is skipped, which means map
         * listeners a control registered are never removed and layers it created
         * are never taken off. The next screen to adopt the map inherits both,
         * and a control whose cleanup was written correctly still leaks.
         */
        onRemove () {
            const root = this.root;
            this.root = null;
            _controls.delete(this);
            // Removal can come from inside a React commit, where another root can't unmount synchronously.
            root && queueMicrotask(() => root.unmount());
        }
    });

    return new Control({ ..._opt, ...opt }).addTo(Map);
}

/**
 * Takes every control added with `control()` off its map, unmounting its React tree.
 *
 * @function removeControls (): void
 */
export const removeControls = () => [..._controls].forEach(c => c.remove());

const _opt = {
    position: 'left', // Default is data panel, left side menu block.
    className: 'leaflet-control', // Do not change this default, style rules depend on it.
};