import { util, factory, Map } from '../../../core';
import { drag, snap } from '../..';

export const line = {
    ...snap,
    ...drag,

    layer: {},
    enabled: false,
    options: {},

    enable (layer, opt) {
        // if it was already enabled, disable first
        // we don't block enabling again because new options might be passed
        this.enabled && this.disable();

        this.layer = layer;
        this.enabled= true;

        util.assign(this.options, opt);

        // init markers
        this._initMarkers();
    
        // init snap utilities
        this.options.snappable
            ? this._initSnappableMarkers()
            : this._disableSnapping();
    
        // if polygon gets removed from map, disable edit mode
        this.layer.on('remove', this._onLayerRemove, this);
    
    
        if (!this.options.allowSelfIntersection) {
            this.cachedColor = this._layer.options.color;
    
            this.isRed = false;
            this._handleLayerStyle();
        }
    },

    disable () {
        // if it's not enabled, it doesn't need to be disabled.
        if (!this.enabled || this.layer._dragging) {    //this.layer.pm._dragging
            return false;
        }

        this.layer.enabled = false;
        this.layer._markerGroup.clearLayers();
    
        // clean up draggable
        this.layer.off('mousedown');
        this.layer.off('mouseup');
    
        // remove onRemove listener
        this.layer.off('remove', this._onLayerRemove, this);
    
        // remove draggable class
        const el = this.layer._path || this._layer._renderer._container;
        factory.DomUtil.removeClass(el, 'leaflet-pm-draggable');
    
        // remove invalid class if layer has self intersection
        this.hasSelfIntersection() && factory.DomUtil.removeClass(el, 'leaflet-pm-invalid');
    
        this.layer.fire('pm:disable');
    
        this._layerEdited && this.layer.fire('pm:update', {});
        this._layerEdited = false;
    
        return true;
    },

    _initMarkers () {
        const coords = this.layer.getLatLngs();
    
        // cleanup old ones first
        this._markerGroup && this._markerGroup.clearLayers();
    
        // add markerGroup to map, markerGroup includes regular and middle markers
        this._markerGroup = new factory.LayerGroup();
        this._markerGroup._pmTempLayer = true;
    
        // handle coord-rings (outer, inner, etc)
        // if there is another coords ring, go a level deep and do this again
        const _handleRing = coordsArr => {
            util.isArray(coordsArr[0]) && coordsArr.map(_handleRing, this);
    
            // the marker array, it includes only the markers of vertexes (no middle markers)
            const ringArr = coordsArr.map(this._createMarker, this);
    
            // create small markers in the middle of the regular markers
            coordsArr.map((v, k) => {
                // find the next index fist
                const nextIndex = this.layer instanceof factory.Polygon
                    ? (k + 1) % coordsArr.length 
                    : k + 1;
                // create the marker
                return this._createMiddleMarker(ringArr[k], ringArr[nextIndex]);
            });
    
            return ringArr;
        };
    
        // create markers
        this._markers = _handleRing(coords);
    
        // handle possible limitation: maximum number of markers
        this.filterMarkerGroup();
    
        // add markerGroup to map
        Map.addLayer(this._markerGroup);
    },

    // creates initial markers for coordinates
    _createMarker (latlng) {
        const marker = factory.marker(latlng, {
            draggable: true,
            icon: factory.divIcon({ className: 'marker-icon' }),
        });

        marker._pmTempLayer = true;

        marker.on('dragstart', this._onMarkerDragStart, this);
        marker.on('move', this._onMarkerDrag, this);
        marker.on('dragend', this._onMarkerDragEnd, this);

        if (!this.options.preventMarkerRemoval) {
            marker.on('contextmenu', this._removeMarker, this);
        }

        this._markerGroup.addLayer(marker);

        return marker;
    },

    // creates the middle markes between coordinates
    _createMiddleMarker (leftM, rightM) {
        // cancel if there are no two markers
        if (!leftM || !rightM) {
            return false;
        }

        const latlng = this._calcMiddleLatLng(
            Map,
            leftM.getLatLng(),
            rightM.getLatLng()
        );

        const middleMarker = this._createMarker(latlng)
            .setIcon(factory.divIcon({ className: 'marker-icon marker-icon-middle' }));

        // save reference to this middle markers on the neighboor regular markers
        leftM._middleMarkerNext = middleMarker;
        rightM._middleMarkerPrev = middleMarker;

        middleMarker.on('click', () => {
            middleMarker.setIcon(factory.divIcon({ className: 'marker-icon' }));
            this._addMarker(middleMarker, leftM, rightM);
        });

        middleMarker.on('movestart', () => {
            middleMarker.on('moveend', () => {
                middleMarker
                    .setIcon(factory.divIcon({ className: 'marker-icon' }))
                    .off('moveend');
            });

            this._addMarker(middleMarker, leftM, rightM);
        });

        return middleMarker;
    },

    // adds a new marker from a middlemarker
    _addMarker (newM, leftM, rightM) {
        // first, make this middlemarker a regular marker
        newM.off('movestart');
        newM.off('click');

        // now, create the polygon coordinate point for that marker
        // and push into marker array
        // and associate polygon coordinate with marker coordinate
        const latlng = newM.getLatLng();
        const coords = this.layer._latlngs;

        // the index path to the marker inside the multidimensional marker array
        const { indexPath, index, parentPath } = this.findDeepMarkerIndex(this._markers, leftM);

        // define the coordsRing that is edited
        const coordsRing = indexPath.length > 1 
            ? util.access(coords, parentPath) 
            : coords;

        // define the markers array that is edited
        const markerArr = indexPath.length > 1 
            ? util.access(this._markers, parentPath) 
            : this._markers;

        // add coordinate to coordinate array
        coordsRing.splice(index + 1, 0, latlng);

        // add marker to marker array
        markerArr.splice(index + 1, 0, newM);

        // set new latlngs to update polygon
        this.layer.setLatLngs(coords);

        // create the new middlemarkers
        this._createMiddleMarker(leftM, newM);
        this._createMiddleMarker(newM, rightM);

        // fire edit event
        this._fireEdit();

        this.layer.fire('pm:vertexadded', {
            layer: this.layer,
            marker: newM,
            indexPath: this.findDeepMarkerIndex(this._markers, newM).indexPath,
            latlng,
        });

        if (this.options.snappable) {
            this._initSnappableMarkers();
        }
    },

    _removeMarker (e) {
        // the marker that should be removed
        const marker = e.target;
    
        // coords of the layer
        const coords = this.layer.getLatLngs();
    
        // the index path to the marker inside the multidimensional marker array
        const { indexPath, index, parentPath } = this.findDeepMarkerIndex(this._markers, marker);
    
        // only continue if this is NOT a middle marker (those can't be deleted)
        if (!indexPath) {
            return;
        }
    
        // define the coordsRing that is edited
        const coordsRing = indexPath.length > 1 
            ? util.access(coords, parentPath) 
            : coords;
    
        // define the markers array that is edited
        const markerArr = indexPath.length > 1 
            ? util.access(this._markers, parentPath) 
            : this._markers;
    
        // remove coordinate
        coordsRing.splice(index, 1);
    
        // set new latlngs to the polygon
        this.layer.setLatLngs(coords);
    
        // if the ring of the poly has no coordinates left, remove the last coord too
        if (coordsRing.length <= 1) {
            coordsRing.splice(0, coordsRing.length);
    
            // set new coords
            this.layer.setLatLngs(coords);
    
            // re-enable editing so unnecessary markers are removed
            // TODO: kind of an ugly workaround maybe do it better?
            this.disable();
            this.enable(this.options);
        }

        // if no coords are left, remove the layer
        !util.flattenDeep(coords).length && this.layer.remove();
    
        // now handle the middle markers
        // remove the marker and the middlemarkers next to it from the map
        marker._middleMarkerPrev 
            && this._markerGroup.removeLayer(marker._middleMarkerPrev);
        marker._middleMarkerNext 
            && this._markerGroup.removeLayer(marker._middleMarkerNext);
    
        // remove the marker from the map
        this._markerGroup.removeLayer(marker);
    
        let rightMarkerIndex;
        let leftMarkerIndex;
    
        // find neighbor marker-indexes
        this.layer instanceof factory.Polygon
            ? (rightMarkerIndex = (index + 1) % markerArr.length,
                leftMarkerIndex = (index + (markerArr.length - 1)) % markerArr.length)
            : (leftMarkerIndex = index - 1 < 0 
                    ? undefined 
                    : index - 1,
                rightMarkerIndex = index + 1 >= markerArr.length 
                    ? undefined 
                    : index + 1);
    
        // don't create middlemarkers if there is only one marker left
        if (rightMarkerIndex !== leftMarkerIndex) {
            const leftM = markerArr[leftMarkerIndex];
            const rightM = markerArr[rightMarkerIndex];
            this._createMiddleMarker(leftM, rightM);
        }
    
        // remove the marker from the markers array
        markerArr.splice(index, 1);
    
        // fire edit event
        this._fireEdit();
    
        // fire vertex removal event
        this.layer.fire('pm:vertexremoved', {
            layer: this.layer,
            marker,
            indexPath,
            // TODO: maybe add latlng as well?
        });
    },

    findDeepMarkerIndex (arr, marker) {
        let result;
    
        const run = path => (v, i) => {
            const iRes = path.concat(i);
    
            if (v._leaflet_id === marker._leaflet_id) {
                result = iRes;
                return true;
            }
    
            return Array.isArray(v) && v.some(run(iRes));
        };
        arr.some(run([]));
    
        let returnVal = {};
    
        if (result) {
            returnVal = {
                indexPath: result,
                index: result[result.length - 1],
                parentPath: result.slice(0, result.length - 1), // this has to be stringified.
            };
        }
    
        return returnVal;
    },

    updatePolyOnDrag (marker) {
        // update polygon coords
        const coords = this.layer.getLatLngs();
    
        // get marker latlng
        const latlng = marker.getLatLng();
    
        // get indexPath of Marker
        const { indexPath, index, parentPath } = this.findDeepMarkerIndex(this._markers, marker);
    
        // update coord
        const parent = indexPath.length > 1 
            ? util.access(coords, parentPath) 
            : coords;
        parent.splice(index, 1, latlng);
    
        // set new coords on layer
        this.layer.setLatLngs(coords);
    },

    _onMarkerDrag (e) {
        // dragged marker
        const marker = e.target;
        const { indexPath, index, parentPath } = this.findDeepMarkerIndex(this._markers, marker);
    
        // only continue if this is NOT a middle marker
        if (!indexPath) {
            return;
        }
    
        this.updatePolyOnDrag(marker);
    
        // the dragged markers neighbors
        const markerArr = indexPath.length > 1 
            ? util.access(this._markers, parentPath) 
            : this._markers;
    
        // find the indizes of next and previous markers
        const nextMarkerIndex = (index + 1) % markerArr.length;
        const prevMarkerIndex = (index + (markerArr.length - 1)) % markerArr.length;
    
        // update middle markers on the left and right
        // be aware that "next" and "prev" might be interchanged, depending on the geojson array
        const markerLatLng = marker.getLatLng();
    
        // get latlng of prev and next marker
        const prevMarkerLatLng = markerArr[prevMarkerIndex].getLatLng();
        const nextMarkerLatLng = markerArr[nextMarkerIndex].getLatLng();
    
        marker._middleMarkerNext 
            && marker._middleMarkerNext.setLatLng(this._calcMiddleLatLng(
                Map,
                markerLatLng,
                nextMarkerLatLng
            ));
    
        marker._middleMarkerPrev 
            && marker._middleMarkerPrev.setLatLng(this._calcMiddleLatLng(
                Map,
                markerLatLng,
                prevMarkerLatLng
            ));
    },
}