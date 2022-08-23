import { ReactDOM } from 'perun-core';
import { util, store, Map } from '..';

export const renderCycle = {
    /**
     * Initialization protocol for the whole module.
     * Activated when the root React container is mounted.
     */
    start () {
        Map.render();
        const setMapState = () =>
            store.dispatch({  zoom: Map.getZoom(), center: Map.getCenter(), bbox: Map.getBBox() });
        setMapState();

        Map.on('moveend', util.debounce(() => {
            setMapState();
        }, 1000));
    },

    fetch () {},
    render () {},
    refresh () {},

    /**
     * Cleanup protocol for the whole module.
     * Called when the root React container is unmounted.
     */
    cleanup () {
        store.dispatch({ processID: '' })
        /* Containers embedded in the map, used as placeholders for UI elements (controls). */
        const controlNodes = Object.values(Map._controlCorners);

        /**
         * Containers (containing the className 'leaflet-control') created when the Controls are initially mounted
         * Check the onAdd method on the Control class in the Control.js file
         */
         const controlContainers = document.getElementsByClassName('leaflet-control')
         if (controlContainers) {
             // Generate an array from the above HTMLCollection
             const controlContainersArr = Array.from(controlContainers)
             // Iterate over every container containing the className 'leaflet-control'
             controlContainersArr.map(container => {
                 // Fixes virtual DOM of React.
                 ReactDOM.unmountComponentAtNode(container)
             })
         }

        controlNodes.map(el => {
            // Fixes virtual DOM of React.
            ReactDOM.unmountComponentAtNode(el);
            
            // Removes all plain HTML elements attached to our control container,
            // which are not HTML containers themselves.
            [ ...el.children ].map(child =>
                !(controlNodes.includes(child)) && el.removeChild(child));
        });

        /**
         * Hack for lack of coordination between core and this plugin. 
         * Header and footer are forced to always render by core.
         * Hide them each time this plugin is initialized.
         * Show them whenever the plugin is uninitialized.
         */
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('footer').style.display = 'flex';
    }
};