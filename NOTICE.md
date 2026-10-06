# Third-party code

## leaflet-geoman

The drawing, editing, dragging and snapping tools in `frontend/tools/`
(`draw/`, `edit/`, `drag/` and `snap/`, plus `misc/MarkerPoints.js`, which is
built from their mixins) are adapted from
[leaflet-geoman](https://github.com/geoman-io/leaflet-geoman), formerly
`leaflet.pm`. They were taken from a release between 2.3.0 and 2.5.0
(October 2019 to March 2020), with the snapping priority sort back-ported from
2.8.0 later.

The code is not a drop-in copy. Geoman's classes are plain objects here, with
the snap mixin spread in, and `L.*` is `factory.*`. Each object is a template:
every map gets its own copy of each tool, with `this._map` set to that map
(`drawFor` in `draw/Draw.js`, `editFor` in `edit/Edit.js`). An editing tool
keeps its map as `_ownMap` and works on the map of the layer it is given.
`L.PM.js`, which builds `layer.pm`, was not brought across, so `.pm` is created
nowhere; `draw/shapes/Cut.js` still refers to it. Upstream fixes therefore have
to be ported by hand; they cannot be merged.

leaflet-geoman is distributed under this licence:

```
MIT License

Copyright (c) 2017 Sumit Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Files that carry their own notice

These were copied whole or in part, and their notices are kept in the file:

| File | From | Licence |
|---|---|---|
| `frontend/core/service/google/Leaflet.GoogleMutant.js` | GoogleMutant, Iván Sánchez Ortega | Beerware |
| `frontend/core/service/google/LRUMap.js` | [rsms/js-lru](https://github.com/rsms/js-lru), Rasmus Andersson | MIT |
| `frontend/data/protobuf/Protobuf.js` | 64-bit ints from [dpw/node-buffer-more-ints](https://github.com/dpw/node-buffer-more-ints); buffer code from [feross/buffer](https://github.com/feross/buffer) | MIT |
