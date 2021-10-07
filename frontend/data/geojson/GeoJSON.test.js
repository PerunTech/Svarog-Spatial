/**
 * @jest-environment jsdom
 */
import { factory } from "../../core/index";

export const testLinestring = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "LineString",
        coordinates: [
            [
                21.990252,
                41.50806
            ],
            [
                21.991663,
                41.507495
            ]
        ]
    }
};

export const testGeom =
{
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [
                    21.990526,
                    41.508172
                ],
                [
                    21.99075,
                    41.507884
                ],
                [
                    21.991337,
                    41.508165
                ],
                [
                    21.991099,
                    41.508343
                ],
                [
                    21.990526,
                    41.508172
                ]
            ]
        ]
    }
}



test('use jsdom in this test file', () => {
    //const geojson = factory.GeoJSON.reproject(testGeom, Map.getCRS());
    //console.log(geojson);

    //const geoline = factory.GeoJSON.reproject(testLinestring, Map.getCRS());
    //console.log(geoline);
    expect('grapefruit').toBe('grapefruit');

});


