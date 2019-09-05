
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import axios from 'axios'
import Pbf from 'pbf'
import Gbf from 'geobuf'
import { get } from 'lodash'
import {store} from 'tibro-redux'
/**
 * Libs
 */
import leaflet from 'leaflet'
import proj4 from 'proj4'
import proj4leaflet from 'proj4leaflet' /* eslint-disable-line*/
import numberFormatter from './Scripts/NumberFormatter.js' /* eslint-disable-line*/
import controlCoords from './Scripts/Control.Coordinates.js' /* eslint-disable-line*/  // Convert to leaflet.gazetteer plugin => npm publish
import beautifyMarker from './Scripts/leaflet-beautify-marker-icon.js' /* eslint-disable-line*/
import markerCluster from 'leaflet.markercluster' /* eslint-disable-line*/
import { antPath } from 'leaflet-ant-path' /* eslint-disable-line*/
import leafletPM from 'leaflet.pm' /* eslint-disable-line*/
import leafletMeasure from 'leaflet-measure-path' /* eslint-disable-line*/

import IStore from './Components/IStore'
import { replacePathParams } from './Components/Utils'
import { MapLoading } from './ModuleIndex'

(function (window, document, undefined) {
  /**
   * @namespace Spatial objects functionality interface
   * Init root
   */
  const Sofi = {
    version: '0.0.1'
  }

  // publish and create backup
  function expose () {
    var oldG = window.Sofi

    Sofi.backup = function () {
      window.Sofi = oldG
      return this
    }

    window.Sofi = Sofi
  }

  // define Sofi for Node module pattern loaders, including Browserify
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = Sofi
  }

  // define Sofi as a global Sofi variable, saving the original object to restore later if needed
  if (typeof window !== 'undefined') {
    expose()
  }

  /**
   * Private configuration objects
   */
  const configuration = {
    ANIMAL: {
      vectorConfig: {
        permanent: {
          animalMovements: {
            name: 'Animal movements',
            sdiType: 'animal_movement',
            service: '/SDI/getMovements/animal/{token}/{animal_id}/{departureDate}/{arrivalDate}',
            responseType: 'arraybuffer',
            permanent: true,
            render: {
              min: 0,
              max: 23
            }
          },
          quarantines: {
            name: 'Quarantines',
            sdiType: 'quarantine_geometry',
            service: '/SDI/getQuarantines/bbox/{token}/{startDate}/{expiryDate}/{filterHistory}',
            responseType: 'arraybuffer',
            permanent: true,
            render: {
              min: 0,
              max: 23
            }
          }
        },
        spatial: {
          holding: {
            name: 'Holdings',
            sdiType: 'holding',
            service: '/SDI/getGeometry/bbox/{token}/holding/{mapBbox}',
            responseType: 'arraybuffer',
            permanent: false,
            render: {
              min: 15,
              max: 23
            }
          },
          village: {
            name: 'Villages',
            sdiType: 'sdi_units',
            service: '/SDI/getVillages/bbox/{token}/svarog_sdi_units/{mapBbox}',
            responseType: 'arraybuffer',
            permanent: false,
            render: {
              min: 11,
              max: 23
            }
          }
        }
      },
      rasterConfig: {
        Base_Map: {
          name: 'Base',
          path: [window.location.protocol] + '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: true
        },
        Humanitarian_Map: {
          name: 'Humanitarian',
          path: [window.location.protocol] + '//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: false
        },
        Topographic_Map: {
          name: 'Topographic',
          path: [window.location.protocol] + '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: false
        },
        Terrain_Map: {
          name: 'Terrain',
          path: [window.location.protocol] + '//stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
          options: {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>,' +
            '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash;' +
            'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            maxZoom: 18
          },
          defaultRender: false
        }
      },
      layerControl: {
        'position': 'topright',
        'collapsed': true,
        'autoZIndex': true,
        'sortLayers': false,
        'hideSingleBase': false
      },
      rootInfo: {
        Animal_ID: 'animal_id',
        External_ID: 'external_id'
      },
      service: {
        base: window.location.hostname === 'localhost' ? window.location.protocol + '//localhost:9091/triglav_rest' : window.location.protocol + '/triglav_rest',
        getMapOrigin: '/SDI/getMapOrigin/animal/{token}/{parent_id}',
        getSearchLocations: '/SDI/getSearchLocations/{token}/{searchStr}'
      }
    },
    HOLDING: {
      vectorConfig: {
        permanent: {
          animalMovements: {
            name: 'Animal movements',
            sdiType: 'animal_movement',
            service: '/SDI/getMovements/holding/{token}/{object_id}/{departureDate}/{arrivalDate}',
            responseType: 'arraybuffer',
            permanent: true,
            render: {
              min: 0,
              max: 23
            }
          },
          quarantines: {
            name: 'Quarantines',
            sdiType: 'quarantine_geometry',
            service: '/SDI/getQuarantines/bbox/{token}/{startDate}/{expiryDate}/{filterHistory}',
            responseType: 'arraybuffer',
            permanent: true,
            render: {
              min: 0,
              max: 23
            }
          }
        },
        spatial: {
          holding: {
            name: 'Holdings',
            sdiType: 'holding',
            service: '/SDI/getGeometry/bbox/{token}/holding/{mapBbox}',
            responseType: 'arraybuffer',
            permanent: false,
            render: {
              min: 15,
              max: 23
            }
          },
          village: {
            name: 'Villages',
            sdiType: 'sdi_units',
            service: '/SDI/getVillages/bbox/{token}/svarog_sdi_units/{mapBbox}',
            responseType: 'arraybuffer',
            permanent: false,
            render: {
              min: 11,
              max: 23
            }
          }
        }
      },
      rasterConfig: {
        Base_Map: {
          name: 'Base',
          path: [window.location.protocol] + '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: true
        },
        Humanitarian_Map: {
          name: 'Humanitarian',
          path: [window.location.protocol] + '//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: false
        },
        Topographic_Map: {
          name: 'Topographic',
          path: [window.location.protocol] + '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: false
        },
        Terrain_Map: {
          name: 'Terrain',
          path: [window.location.protocol] + '//stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
          options: {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>,' +
            '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash;' +
            'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            maxZoom: 20
          },
          defaultRender: false
        }
      },
      layerControl: {
        'position': 'topright',
        'collapsed': true,
        'autoZIndex': true,
        'sortLayers': false,
        'hideSingleBase': false
      },
      rootInfo: {
        PIC: 'pic',
        Name: 'name',
        Address: 'physical_address',
        Village_Code: 'village_code',
        External_ID: 'external_id'
      },
      service: {
        base: window.location.hostname === 'localhost' ? window.location.protocol + '//localhost:9091/triglav_rest' : window.location.protocol + '/triglav_rest',
        getMapOrigin: '/SDI/getMapOrigin/holding/{token}/{object_id}/{object_type}',
        getSearchLocations: '/SDI/getSearchLocations/{token}/{searchStr}'
      }
    },
    QUARANTINE: {
      vectorConfig: {
        permanent: {
          animalMovements: {
            name: 'Animal movements',
            sdiType: 'animal_movement',
            service: '/SDI/getBlacklistedMovements/quarantine/{token}/{object_id}/{departureDate}/{arrivalDate}',
            responseType: 'arraybuffer',
            permanent: true,
            render: {
              min: 0,
              max: 23
            }
          },
          quarantines: {
            name: 'Quarantines',
            sdiType: 'quarantine_geometry',
            service: '/SDI/getQuarantines/bbox/{token}/{startDate}/{expiryDate}/{filterHistory}',
            responseType: 'arraybuffer',
            permanent: true,
            render: {
              min: 0,
              max: 23
            }
          }
        },
        spatial: {
          holding: {
            name: 'Holdings',
            sdiType: 'holding',
            service: '/SDI/getGeometry/bbox/{token}/holding/{mapBbox}',
            responseType: 'arraybuffer',
            permanent: false,
            render: {
              min: 15,
              max: 23
            }
          },
          village: {
            name: 'Villages',
            sdiType: 'sdi_units',
            service: '/SDI/getVillages/bbox/{token}/svarog_sdi_units/{mapBbox}',
            responseType: 'arraybuffer',
            permanent: false,
            render: {
              min: 11,
              max: 23
            }
          }

        }
      },
      rasterConfig: {
        Base_Map: {
          name: 'Base',
          path: [window.location.protocol] + '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: true
        },
        Humanitarian_Map: {
          name: 'Humanitarian',
          path: [window.location.protocol] + '//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: false
        },
        Topographic_Map: {
          name: 'Topographic',
          path: [window.location.protocol] + '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          defaultRender: false
        },
        Terrain_Map: {
          name: 'Terrain',
          path: [window.location.protocol] + '//stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
          options: {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>,' +
            '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash;' +
            'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            maxZoom: 20
          },
          defaultRender: false
        }
      },
      layerControl: {
        'position': 'topright',
        'collapsed': true,
        'autoZIndex': true,
        'sortLayers': false,
        'hideSingleBase': false
      },
      rootInfo: {
        REASON: 'reason',
        DATE_FROM: 'Date of declaration',
        DATE_TO: 'Date of expiry'
      },
      service: {
        base: window.location.hostname === 'localhost' ? window.location.protocol + '//localhost:9091/triglav_rest' : window.location.protocol + '/triglav_rest',
        getMapOrigin: '/SDI/getMapOrigin/quarantine/{token}/{object_id}/{object_type}',
        getSearchLocations: '/SDI/getSearchLocations/{token}/{searchStr}'
      }
    }
  }

  const descriptor = {
    HOLDING: {
      icon: {
        iconShape: 'doughnut',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#00360e',
        iconSize: [12, 12]
      },
      iconFocus: {
        icon: 'spinner',
        backgroundColor: '#fff',
        textColor: '#00360e',
        borderColor: '#00360e',
        borderWidth: 2,
        iconSize: [22, 22],
        spin: true
      },
      label: {
        options: {
          show_label: true,
          permanent: true,
          className: 'leaflet_poly_label',
          opacity: 0.9,
          direction: 'center'
        },
        fieldName: 'PIC',
        label_scale: {
          min: 16,
          max: 23
        }
      },
      onClick: {
        type: 'HOLDING'
      }
    },
    SVAROG_SDI_UNITS: {
      icon: {
        iconShape: 'doughnut',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#0105ff',
        iconSize: [12, 12]
      },
      iconFocus: {
        icon: 'spinner',
        backgroundColor: '#fff',
        textColor: '#0105ff',
        borderColor: '#0105ff',
        borderWidth: 2,
        iconSize: [22, 22],
        spin: true
      },
      style: {
        weight: 2.0,
        color: '#000',
        fillColor: '#000',
        opacity: 1.0,
        fillOpacity: 0.0
      },
      label: {
        options: {
          show_label: true,
          permanent: true,
          className: 'leaflet_poly_label',
          opacity: 0.9,
          direction: 'center'
        },
        fieldName: 'UNIT_NAME',
        label_scale: {
          min: 12,
          max: 15
        }
      },
      onClick: {
        type: 'SVAROG_SDI_UNITS'
      }
    },
    MOVEMENT_HOLDING: {
      icon: {
        icon: 'home',
        borderColor: '#00360e',
        textColor: '#00360e'
      },
      iconFocus: {
        icon: 'home',
        iconSize: [32, 32],
        iconAnchor: [16, 15],
        innerIconAnchor: [0, 8],
        borderWidth: 3,
        borderColor: '#fff',
        textColor: '#fff',
        backgroundColor: '#00360e'
      },
      label: {
        options: {
          show_label: true,
          permanent: true,
          className: 'leaflet_poly_label',
          opacity: 0.9,
          direction: 'center'
        },
        fieldName: 'PIC',
        label_scale: {
          min: 12,
          max: 23
        }
      },
      onClick: {
        type: 'HOLDING'
      }
    },
    MOVEMENT_LINE: {
      style: {
        weight: 3.0,
        color: '#fff',
        fillColor: '#fff',
        opacity: 1.0,
        fillOpacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        /* AntPath options */
        paused: false,
        reversed: false,
        pulseColor: '#00360e',
        delay: '6000',
        dashArray: '20 10',
        dashOffset: '5'
      },
      onClick: {
        type: 'ANIMAL_MOVEMENT'
      }
    },
    QUARANTINE_ACTIVE: {
      style: {
        weight: 3.0,
        color: 'red',
        fillColor: 'red',
        opacity: 1.0,
        fillOpacity: 0.15,
        lineCap: 'round',
        lineJoin: 'round'
      },
      label: {
        options: {
          show_label: true,
          permanent: true,
          className: 'leaflet_poly_label',
          opacity: 0.9,
          direction: 'center'
        },
        fieldName: 'REASON',
        label_scale: {
          min: 10,
          max: 23
        }
      },
      onClick: {
        type: 'QUARANTINE'
      }
    },
    QUARANTINE_HOVER: {
      style: {
        weight: 3.0,
        color: 'blue',
        fillColor: 'blue',
        opacity: 1.0,
        fillOpacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round'
      }
    },
    QUARANTINE_INACTIVE: {
      style: {
        weight: 3.0,
        color: 'grey',
        fillColor: 'grey',
        opacity: 1.0,
        fillOpacity: 0.15,
        lineCap: 'round',
        lineJoin: 'round'
      },
      label: {
        options: {
          show_label: true,
          permanent: true,
          className: 'leaflet_poly_label',
          opacity: 0.9,
          direction: 'center'
        },
        fieldName: 'REASON',
        label_scale: {
          min: 10,
          max: 23
        }
      },
      onClick: {
        type: 'QUARANTINE'
      }
    },
    default: {
      style: {
        weight: 3.0,
        color: '#fff',
        fillColor: '#fff',
        opacity: 1.0,
        fillOpacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        /* AntPath options */
        paused: false,
        reversed: false,
        pulseColor: '#fcfc03',
        delay: '6000',
        dashArray: '20 10',
        dashOffset: '5'
      },
      icon: {
        icon: 'home',
        borderColor: '#fcfc03',
        textColor: '#fcfc03'
      },
      iconFocus: {
        icon: 'home',
        iconSize: [32, 32],
        iconAnchor: [16, 15],
        innerIconAnchor: [0, 8],
        borderWidth: 3,
        borderColor: '#fff',
        textColor: '#fff',
        backgroundColor: '#fcfc03'
      }
    }
  }

  /**
   *
   * @namespace Leaflet
   * @pointer L: <map render engine>
   *
   *
   *
   *
   */
  const L = Sofi.L = leaflet

  /**
   *
   * @namespace Map
   * @class Map
   * @pointer map: <leaflet map instance>
   *
   * Instantiates a leaflet map
   * Exposes instance to module
   * Adds basic functionalities to instance <scale, coordinates, zoom control>
   *
   * To Do => create map factory
   */
  var Map = Sofi.Map = null

  /**
   *
   * @namespace CRS
   * @class CRS
   *
   *
   *
   *
   */
  const CRS = Sofi.CRS = (function () {
    // CRS Configuration
    const _config = {
      epsg: 'EPSG:3857',
      proj: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
      /* epsg: 'EPSG:4326',
      proj: '+proj=longlat +datum=WGS84 +no_defs', */
      epsgNative: 'EPSG:32638',
      projNative: '+proj=utm +zone=38 +datum=WGS84 +units=m +no_defs',
      origin: [-180, +90],
      scaleList: [
        5000000,
        2500000,
        1000000, // 10 km
        750000,
        500000,
        250000,
        100000, // 1000m or 1 km
        75000,
        50000,
        25000,
        10000, // 100m
        7500,
        5000,
        2500,
        1000, // 1000 cm = 10 m
        750,
        500,
        250,
        100 // 1m
      ]
    }

    /**
     * Get monitor dpi
     * Find how many pixels is 1 cm on screen, 1cm is your ref point[in pixels] from which you generate scales
     * Create custom scale
     * @param {*} b
     * @param {*} a
     * @param {*} i
     * @param {*} c
     */
    function _getScreenDPI (b, a, i, c) {
      c = (d, e) => e >= d ? (a = d + (e - d) / 2, b(a) > 0 && (a === d || b(a - 1) <= 0) ? a : b(a) <= 0 ? c(a + 1, e) : c(d, a - 1)) : -1
      for (i = 1; b(i) <= 0;) i *= 2
      return c(i / 2, i) | 0
    };
    const _dpi = _getScreenDPI(x => matchMedia(`(max-resolution: ${x}dpi)`).matches)

    // How many pixels in 1cm of screen(width)[ppm = pixels per meter]
    const _ppm = (_dpi / 2.54).toFixed(4)

    // gets a list of scales to iterate over and returns a list of resolutions as a number[pixels/meter](do we want cm instead of m?)
    const _resolutions = (function (px) {
      const scaleList = _config['scaleList']
      let rList = []
      for (var i = 0; i < scaleList.length; i++) {
        rList.push((scaleList[i] / 100) / px)
      }
      return rList
    })(_ppm)

    /**
     * @factory _crsFactory
     *
     *
     * @param {String} epsg
     * @param {String} proj
     * @param {Object} options
     *
     * @return {Object} Coordinate Reference System <Object>
     */
    const _crsFactory = function (epsg, proj, options = {}) {
      proj4.defs(epsg, proj)
      return new L.Proj.CRS(epsg, proj, options)
    }

    /**
     * @function setObjectCrs(Obj <Object>, EPSG <String>): void
     * sets CRS properties of a GeoJSON object
     *
     */
    const setObjectCrs = function (Obj, EPSG) {
      Obj.crs = {
        type: 'name',
        properties: {
          name: EPSG
        }
      }
    }

    return {
      web: new _crsFactory(_config['epsg'], _config['proj'], { resolutions: _resolutions, origin: _config['origin'] }),
      native: new _crsFactory(_config['epsgNative'], _config['projNative']),
      scaleList: _config.scaleList,
      setObjectCrs: setObjectCrs
    }
  })()

  /**
   *
   * @namespace Layer
   * @class Layer
   *
   *
   *
   *
   */
  const Layer = Sofi.Layer = (function () {
    /**
     * Objects <Geojson>
     */
    let permanent = {}
    let spatial = {}
    /**
     * Feature Groups
     */
    let workLayer = new L.FeatureGroup()
    let measure = new L.FeatureGroup()
    let search = new L.FeatureGroup()
    let permanentCluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyDistanceMultiplier: 3
    }).bringToFront()
    let spatialCluster = L.markerClusterGroup({
      maxClusterRadius: 200,
      spiderfyDistanceMultiplier: 3
    }).bringToBack()
    /**
     * Permanent Sets
     */
    let movementArr = []
    let quarantineArr = []

    function initialize (container) {
      workLayer.addTo(container)
      measure.addTo(container)
      search.addTo(container)
      permanentCluster.addTo(container)
      spatialCluster.addTo(container)
    }

    return {
      initialize,
      permanent,
      spatial,
      workLayer,
      measure,
      search,
      permanentCluster,
      spatialCluster,
      movementArr,
      quarantineArr
    }
  })()

  /**
   *
   * @namespace Components
   *
   *
   *
   *
   *
   */
  const Components = Sofi.Components = (function () {
    /**
     * @class mapContainer
     *
     */
    class mapContainer extends React.Component {
      static propTypes = {
        permVc: PropTypes.object.isRequired,
        spatialVc: PropTypes.object.isRequired,
        rasterConfig: PropTypes.object.isRequired,
        layerControl: PropTypes.object.isRequired,
        geometry: PropTypes.object.isRequired,

        object_id: PropTypes.number.isRequired, /*eslint-disable-line*/
        token: PropTypes.string.isRequired,     /*eslint-disable-line*/
        rootData: PropTypes.object.isRequired,  /*eslint-disable-line*/
        mapOrigin: PropTypes.string.isRequired,
        refreshMap: PropTypes.bool.isRequired,
        mapBbox: PropTypes.string.isRequired,
        zoomLevel: PropTypes.number.isRequired, /*eslint-disable-line*/
        geomSID: PropTypes.number
      }
      constructor (props) {
        super(props)
        this.state = {
          isBusy: false
        }
      }

      componentDidMount () {
        Factory.map('mapContainer', {})
        Raster.render(this.props.rasterConfig, this.props.layerControl)
        setTimeout(Fetch.mapOrigin, 1500, this.props)
      }

      componentDidUpdate (prevProps) {
        // Map assets initialization
        if (this.props.mapOrigin !== prevProps.mapOrigin) {
          Utils.setOrigin()
          this.setState({isBusy: true}) /* eslint-disable-line */
          // Init fetch permanent geometry set
          Fetch.geometry(this.props.permVc, Object.assign({}, this.props, this.props.rootData))
        }
        // When viewport changes => fetch new spatial geometry set
        if (this.props.mapBbox !== prevProps.mapBbox) {
          // Spatial data fetch should go quick and smooth (hence spatial), do not use loader here
          Fetch.geometry(this.props.spatialVc, this.props)
        }
        // When new geometry set assembled => render geometry
        if (this.props.geomSID !== prevProps.geomSID) {
          Vector.render(this.props.geometry)
          this.setState({isBusy: false}) /* eslint-disable-line */
        }
        // Manual map refresh, re-draws full geometry set
        if (this.props.refreshMap && this.props.refreshMap !== prevProps.refreshMap) {
          this.setState({isBusy: true}) /* eslint-disable-line */
          Fetch.geometry(this.props.permVc, this.props)
          IStore.setData({refreshMap: false})
        }
      }

      render () {
        return <div id='mapContainer' className='mapContainer' style={{border: '4px inset'}} >
          {this.state.isBusy && <MapLoading />}
        </div>
      }
    }

    const mapStateToProps = (state, ownProps) => {
      const { gis: { config, data, geometry } } = state

      return {
        permVc: config.vectorConfig.permanent,
        spatialVc: config.vectorConfig.spatial,
        rasterConfig: config.rasterConfig,
        layerControl: config.layerControl,
        geometry: geometry,

        object_id: data.rootData.object_id,
        token: state.security.svSession,
        rootData: data.rootData,
        mapOrigin: data.mapOrigin,
        refreshMap: data.refreshMap,
        mapBbox: data.mapBbox,
        zoomLevel: data.zoomLevel,
        geomSID: data.geomSID,
        departureDate: data.departureDate,
        arrivalDate: data.arrivalDate,
        startDate: data.startDate,
        expiryDate: data.expiryDate,
        filterHistory: data.filterHistory
      }
    }
    const MapContainer = connect(mapStateToProps)(mapContainer)

    return {
      MapContainer
    }
  })()

  /**
   *
   * @namespace Utils
   *
   *
   *
   *
   *
   */
  const Utils = Sofi.Utils = {
    /**
     *
     * @function debounce
     *
     *  Returns a function, that, as long as it continues to be invoked, will not be triggered `<Fn>`.
     *  The function will be called after it stops being called for N milliseconds `<time>`.
     *  If `exec` is passed, trigger the function on the leading edge, instead of the trailing.
     *
     * @param {Function} Fn
     * @param {Number} time
     * @param {Boolean} exec
     *
     * @return Function executed with a delay between repeated calls (think dom events and api/ws calls)
     */
    debounce (Fn, time, exec = false) {
      // timer
      let deltaT
      return function () {
        // context to be passed to execFn
        const context = this
        const args = arguments

        // Function to be executed when the timer ends (trailing-end)
        const execFn = function () {
          deltaT = null
          !exec && Fn.apply(context, args)
        }
        // reset timer for every root call, restart the debounce waiting period.
        clearTimeout(deltaT)
        deltaT = setTimeout(execFn, time);

        // Call immediately if you're dong a leading-end execution
        (exec && !deltaT) && Fn.apply(context, args)
      }
    },

    /**
     *
     * @function wait
     *
     * @param {Function} Fn
     */
    wait (Fn) {
      return async function () {
        try {
          await Fn.call(this, arguments)
        } catch (e) {
          console.log(e)
        }
      }
    },

    /**
     * Overwrite method of object instance
     *
     * @param {Function} method
     * @param {Function} fn
     * @param {Boolean} hookAfter
     */
    override (method, fn, hookAfter) {
      if (!hookAfter) {
        return function () {
          method.apply(this, arguments)
          fn.apply(this, arguments)
        }
      } else {
        return function () {
          fn.apply(this, arguments)
          method.apply(this, arguments)
        }
      }
    },

    /**
     * @function merge(dest <Object> , src? <Object>): Object
     * Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
     */
    merge (dest) {
      let i, j, len, src

      for (j = 1, len = arguments.length; j < len; j++) {
        src = arguments[j]
        for (i in src) {
          dest[i] = src[i]
        }
      }
      return dest
    },

    isEmptyDeep (l) {
      // thanks for the function, Felix Heck
      const flatten = list =>
        list
          .filter(x => ![null, '', undefined].includes(x))
          .reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

      return !flatten(l).length
    },

    calcMiddleLatLng (map, latLng1, latLng2) {
      // calculate the middle coordinates between two markers ,
      // i.e middle point of a line formed by latLng input
      const p1 = map.project(latLng1)
      const p2 = map.project(latLng2)

      return map.unproject(p1._add(p2)._divideBy(2))
    },

    /**
     * @function calculateBbox(): String <swX + swY + neX + ne Y>
     * Reprojects present map boundaries to native crs
     *
     * @return string concatenation of reprojected boundaries
     */
    calculateBbox () {
      var psw = CRS.native.projection.project(Map.getBounds().getSouthWest())
      var pne = CRS.native.projection.project(Map.getBounds().getNorthEast())

      return psw.x + ',' + psw.y + ',' + pne.x + ',' + pne.y
    },

    /**
     * @function setOrigin(): void
     * Sets map center at store.gis.data.mapOrigin
     *
     */
    setOrigin () {
      let dataArr = IStore.getData('mapOrigin').split(',')

      if (dataArr.length > 1 && dataArr.length < 3) {
        // if origin data is a location, init Point <Coords> =>  transform and setView on map
        let x = Number(dataArr[0])
        let y = Number(dataArr[1])
        let p = L.point([x, y])
        let cnt = CRS.native.projection.unproject(p, Map.getZoom())

        Map.setView(cnt, 14)
      } else if (dataArr.length > 3) {
        // if origin data is a bounding box, get nortEast/southWest points => transform and fit bounds
        let zoomLevel = Map.getZoom()
        let sw = CRS.native.projection.unproject(L.point(Number(dataArr[0]), Number(dataArr[1])), zoomLevel)
        let ne = CRS.native.projection.unproject(L.point(Number(dataArr[2]), Number(dataArr[3])), zoomLevel)

        Map.fitBounds(L.latLngBounds(sw, ne))
      } else {
        // default, if origin data processing fails => set view on present location
        this.setMapView() // uses default parameters
      }
    },

    setMapView (center = Map.getCenter(), zoomLevel = 8, options = {easeLinearity: 1, duration: 10, noMoveStart: true}) {
      /**
         * @param zom/pan options?: <Object>, third flyTo parameter
         *
         * animate: null <omit for animation if origin is in view, false = no animation, true = animation always>
         * duration: 0.25 <use higher than 3 for smooth animation transition>
         * easeLinearity: 0.25 < The curvature factor of panning animation easing (third parameter of the Cubic Bezier curve). 1 is linear, < 1 is bowed curvature >
         * noMoveStart: false <If true, panning won't fire movestart event on start (used internally for panning inertia)>
         */
      Map.flyTo(center, zoomLevel, options)
    },

    /**
     * Re-projects polygon/polyline coordinates from latLing pair  to x,y
     * @this L.Polygon/L.Polyline instance
     *
     * @return {Array} re-projected coordinates as {x: val, y: val}
     */
    reprojectLatLngs () {
      let latLngs = this.getLatLngs()
      // if multiPolygon, flatten
      if (latLngs.length === 1) {
        latLngs = latLngs.flat(2)
      }

      // point Arr, contains a set of points {x: val, y: val}
      let pArr = []
      latLngs.map((ll) => {
        // reverse latitude longitude (i.e langLat) object, as projected xy coordinates are in the opposite order
        // point {x: val.of(Longitude), y: val.of(Latitude)}
        let p = CRS.native.projection.project(ll)

        pArr.push(p)
      })

      return pArr
    }
  }

  const Mixin = Sofi.Mixin = (function () {
    const drag = {
      enableLayerDrag () {
        if (this._layer instanceof L.Marker) {
          this._layer.dragging.enable()
          return
        }

        // temporary coord variable for delta calculation
        this._tempDragCoord = null

        // add CSS class
        const el = this._layer._path
          ? this._layer._path
          : this._layer._renderer._container
        L.DomUtil.addClass(el, 'leaflet-pm-draggable')

        this._originalMapDragState = this._layer._map.dragging._enabled

        // can we reliably save the map's draggable state?
        // (if the mouse up event happens outside the container, then the map can become undraggable)
        this._safeToCacheDragState = true

        // add mousedown event to trigger drag
        this._layer.on('mousedown', this._dragMixinOnMouseDown, this)
      },
      disableLayerDrag () {
        if (this._layer instanceof L.Marker) {
          this._layer.dragging.disable()
          return
        }

        // remove CSS class
        const el = this._layer._path
          ? this._layer._path
          : this._layer._renderer._container
        L.DomUtil.removeClass(el, 'leaflet-pm-draggable')

        // no longer save the drag state
        this._safeToCacheDragState = false

        // disable mousedown event
        this._layer.off('mousedown', this._dragMixinOnMouseDown, this)
      },
      _dragMixinOnMouseUp () {
        const el = this._layer._path
          ? this._layer._path
          : this._layer._renderer._container

        // re-enable map drag
        if (this._originalMapDragState) {
          this._layer._map.dragging.enable()
        }

        // if mouseup event fired, it's safe to cache the map draggable state on the next mouse down
        this._safeToCacheDragState = true

        // clear up mousemove event
        this._layer._map.off('mousemove', this._dragMixinOnMouseMove, this)

        // clear up mouseup event
        this._layer.off('mouseup', this._dragMixinOnMouseUp, this)

        // if no drag happened, don't do anything
        if (!this._dragging) {
          return false
        }

        // timeout to prevent click event after drag :-/
        // TODO: do it better as soon as leaflet has a way to do it better :-)
        window.setTimeout(() => {
          // set state
          this._dragging = false
          L.DomUtil.removeClass(el, 'leaflet-pm-dragging')

          // fire pm:dragend event
          this._layer.fire('pm:dragend')

          // fire edit
          this._fireEdit()
        }, 10)

        return true
      },
      _dragMixinOnMouseMove (e) {
        const el = this._layer._path
          ? this._layer._path
          : this._layer._renderer._container

        if (!this._dragging) {
          // set state
          this._dragging = true
          L.DomUtil.addClass(el, 'leaflet-pm-dragging')

          // bring it to front to prevent drag interception
          this._layer.bringToFront()

          // disbale map drag
          if (this._originalMapDragState) {
            this._layer._map.dragging.disable()
          }

          // fire pm:dragstart event
          this._layer.fire('pm:dragstart')
        }

        this._onLayerDrag(e)
      },
      _dragMixinOnMouseDown (e) {
        // cancel if mouse button is NOT the left button
        if (e.originalEvent.button > 0) {
          return
        }
        // save current map dragging state
        if (this._safeToCacheDragState) {
          this._originalMapDragState = this._layer._map.dragging._enabled

          // don't cache the state again until another mouse up is registered
          this._safeToCacheDragState = false
        }

        // save for delta calculation
        this._tempDragCoord = e.latlng

        this._layer.on('mouseup', this._dragMixinOnMouseUp, this)

        // listen to mousemove on map (instead of polygon),
        // otherwise fast mouse movements stop the drag
        this._layer._map.on('mousemove', this._dragMixinOnMouseMove, this)
      },
      dragging () {
        return this._dragging
      },
      _onLayerDrag (e) {
        // latLng of mouse event
        const { latlng } = e

        // delta coords (how far was dragged)
        const deltaLatLng = {
          lat: latlng.lat - this._tempDragCoord.lat,
          lng: latlng.lng - this._tempDragCoord.lng
        }

        // move the coordinates by the delta
        const moveCoords = coords =>
          // alter the coordinates
          coords.map(currentLatLng => {
            if (Array.isArray(currentLatLng)) {
              // do this recursively as coords might be nested
              return moveCoords(currentLatLng)
            }

            // move the coord and return it
            return {
              lat: currentLatLng.lat + deltaLatLng.lat,
              lng: currentLatLng.lng + deltaLatLng.lng
            }
          })

        const moveCoord = coord => ({
          lat: coord.lat + deltaLatLng.lat,
          lng: coord.lng + deltaLatLng.lng
        })

        if (this._layer instanceof L.CircleMarker) {
          // create the new coordinates array
          const newCoords = moveCoord(this._layer.getLatLng())

          // set new coordinates and redraw
          this._layer.setLatLng(newCoords).redraw()
        } else {
          // create the new coordinates array
          const newCoords = moveCoords(this._layer.getLatLngs())

          // set new coordinates and redraw
          this._layer.setLatLngs(newCoords).redraw()
        }

        // save current latlng for next delta calculation
        this._tempDragCoord = latlng

        // fire pm:dragstart event
        this._layer.fire('pm:drag')
      }
    }

    const snap = {
      _initSnappableMarkers () {
        this.options.snapDistance = this.options.snapDistance || 30

        this._assignEvents(this._markers)

        this._layer.off('pm:dragstart', this._unsnap, this)
        this._layer.on('pm:dragstart', this._unsnap, this)
      },
      _assignEvents (markerArr) {
        // loop through marker array and assign events to the markers
        markerArr.forEach(marker => {
          // if the marker is another array (Multipolygon stuff), recursively do this again
          if (Array.isArray(marker)) {
            this._assignEvents(marker)
            return
          }

          // add handleSnapping event on drag
          marker.off('drag', this._handleSnapping, this)
          marker.on('drag', this._handleSnapping, this)

          // cleanup event on dragend
          marker.off('dragend', this._cleanupSnapping, this)
          marker.on('dragend', this._cleanupSnapping, this)
        })
      },
      _unsnap () {
        // delete the last snap
        delete this._snapLatLng
      },
      _cleanupSnapping () {
        // delete it, we need to refresh this with each start of a drag because
        // meanwhile, new layers could've been added to the map
        delete this._snapList

        // remove map event
        this._map.off('pm:remove', this._handleSnapLayerRemoval, this)

        if (this.debugIndicatorLines) {
          this.debugIndicatorLines.forEach(line => {
            line.remove()
          })
        }
      },
      _handleSnapLayerRemoval ({ layer }) {
        // find the layers index in snaplist
        const index = this._snapList.findIndex(
          e => e._leaflet_id === layer._leaflet_id
        )
        // remove it from the snaplist
        this._snapList.splice(index, 1)
      },
      _handleSnapping (e) {
        // if snapping is disabled via holding ALT during drag, stop right here
        if (e.originalEvent.altKey) {
          return false
        }

        // create a list of polygons that the marker could snap to
        // this isn't inside a movestart/dragstart callback because middlemarkers are initialized
        // after dragstart/movestart so it wouldn't fire for them
        if (this._snapList === undefined) {
          this._createSnapList(e)
        }

        // if there are no layers to snap to, stop here
        if (this._snapList.length <= 0) {
          return false
        }

        const marker = e.target

        // get the closest layer, it's closest latlng, segment and the distance
        const closestLayer = this._calcClosestLayer(
          marker.getLatLng(),
          this._snapList
        )

        const isMarker =
          closestLayer.layer instanceof L.Marker ||
          closestLayer.layer instanceof L.CircleMarker

        // find the final latlng that we want to snap to
        let snapLatLng
        if (!isMarker) {
          snapLatLng = this._checkPrioritiySnapping(closestLayer)
        } else {
          snapLatLng = closestLayer.latlng
        }

        // minimal distance before marker snaps (in pixels)
        const minDistance = this.options.snapDistance

        // event info for pm:snap and pm:unsnap
        const eventInfo = {
          marker,
          snapLatLng,
          segment: closestLayer.segment,
          layer: this._layer,
          layerInteractedWith: closestLayer.layer, // for lack of a better property name
          distance: closestLayer.distance
        }

        eventInfo.marker.fire('pm:snapdrag', eventInfo)
        this._layer.fire('pm:snapdrag', eventInfo)

        if (closestLayer.distance < minDistance) {
          // snap the marker
          marker.setLatLng(snapLatLng)

          marker._snapped = true

          const triggerSnap = () => {
            this._snapLatLng = snapLatLng
            marker.fire('pm:snap', eventInfo)
            this._layer.fire('pm:snap', eventInfo)
          }

          // check if the snapping position differs from the last snap
          // Thanks Max & car2go Team
          const a = this._snapLatLng || {}
          const b = snapLatLng || {}

          if (a.lat !== b.lat || a.lng !== b.lng) {
            triggerSnap()
          }
        } else if (this._snapLatLng) {
          // no more snapping

          // if it was previously snapped...
          // ...unsnap
          this._unsnap(eventInfo)

          marker._snapped = false

          // and fire unsnap event
          eventInfo.marker.fire('pm:unsnap', eventInfo)
          this._layer.fire('pm:unsnap', eventInfo)
        }

        return true
      },

      // we got the point we want to snap to (C), but we need to check if a coord of the polygon
      // receives priority over C as the snapping point. Let's check this here
      _checkPrioritiySnapping (closestLayer) {
        const map = this._map

        // A and B are the points of the closest segment to P (the marker position we want to snap)
        const A = closestLayer.segment[0]
        const B = closestLayer.segment[1]

        // C is the point we would snap to on the segment.
        // The closest point on the closest segment of the closest polygon to P. That's right.
        const C = closestLayer.latlng

        // distances from A to C and B to C to check which one is closer to C
        const distanceAC = this._getDistance(map, A, C)
        const distanceBC = this._getDistance(map, B, C)

        // closest latlng of A and B to C
        let closestVertexLatLng = distanceAC < distanceBC ? A : B

        // distance between closestVertexLatLng and C
        let shortestDistance = distanceAC < distanceBC ? distanceAC : distanceBC

        // snap to middle (M) of segment if option is enabled
        if (this.options.snapMiddle) {
          const M = Utils.calcMiddleLatLng(map, A, B)
          const distanceMC = this._getDistance(map, M, C)

          if (distanceMC < distanceAC && distanceMC < distanceBC) {
            // M is the nearest vertex
            closestVertexLatLng = M
            shortestDistance = distanceMC
          }
        }

        // the distance that needs to be undercut to trigger priority
        const priorityDistance = this.options.snapDistance

        // the latlng we ultemately want to snap to
        let snapLatlng

        // if C is closer to the closestVertexLatLng (A, B or M) than the snapDistance,
        // the closestVertexLatLng has priority over C as the snapping point.
        if (shortestDistance < priorityDistance) {
          snapLatlng = closestVertexLatLng
        } else {
          snapLatlng = C
        }

        // return the copy of snapping point
        return Object.assign({}, snapLatlng)
      },

      _createSnapList () {
        let layers = []
        const debugIndicatorLines = []
        const map = this._map

        map.off('pm:remove', this._handleSnapLayerRemoval, this)
        map.on('pm:remove', this._handleSnapLayerRemoval, this)

        // find all layers that are or inherit from Polylines... and markers that are not
        // temporary markers of polygon-edits
        map.eachLayer(layer => {
          if (
            layer instanceof L.Polyline ||
            layer instanceof L.Marker ||
            layer instanceof L.CircleMarker
          ) {
            layers.push(layer)

            // this is for debugging
            const debugLine = L.polyline([], { color: 'red', pmIgnore: true })
            debugIndicatorLines.push(debugLine)

            // uncomment 👇 this line to show helper lines for debugging
            // debugLine.addTo(map);
          }
        })

        // ...except myself
        layers = layers.filter(layer => this._layer !== layer)

        // also remove everything that has no coordinates yet
        layers = layers.filter(
          layer => layer._latlng || (layer._latlngs && layer._latlngs.length > 0)
        )

        // finally remove everything that's leaflet.pm specific temporary stuff
        layers = layers.filter(layer => !layer._pmTempLayer)

        // save snaplist from layers and the other snap layers added from other classes/scripts
        if (this._otherSnapLayers) {
          this._snapList = layers.concat(this._otherSnapLayers)
        } else {
          this._snapList = layers
        }

        this.debugIndicatorLines = debugIndicatorLines
      },
      _calcClosestLayer (latlng, layers) {
        // the closest polygon to our dragged marker latlng
        let closestLayer = {}

        // loop through the layers
        layers.forEach((layer, index) => {
          // find the closest latlng, segment and the distance of this layer to the dragged marker latlng
          const results = this._calcLayerDistances(latlng, layer)

          // show indicator lines, it's for debugging
          this.debugIndicatorLines[index].setLatLngs([latlng, results.latlng])

          // save the info if it doesn't exist or if the distance is smaller than the previous one
          if (
            closestLayer.distance === undefined ||
            results.distance < closestLayer.distance
          ) {
            closestLayer = results
            closestLayer.layer = layer
          }
        })

        // return the closest layer and it's data
        // if there is no closest layer, return undefined
        return closestLayer
      },

      _calcLayerDistances (latlng, layer) {
        const map = this._map

        // is this a marker?
        const isMarker =
          layer instanceof L.Marker || layer instanceof L.CircleMarker

        // is it a polygon?
        const isPolygon = layer instanceof L.Polygon

        // the point P which we want to snap (probpably the marker that is dragged)
        const P = latlng

        // the coords of the layer
        const latlngs = isMarker ? layer.getLatLng() : layer.getLatLngs()

        if (isMarker) {
          // return the info for the marker, no more calculations needed
          return {
            latlng: Object.assign({}, latlngs),
            distance: this._getDistance(map, latlngs, P)
          }
        }

        // the closest segment (line between two points) of the layer
        let closestSegment

        // the shortest distance from P to closestSegment
        let shortestDistance

        // loop through the coords of the layer
        const loopThroughCoords = coords => {
          coords.forEach((coord, index) => {
            if (Array.isArray(coord)) {
              loopThroughCoords(coord)
              return
            }

            // take this coord (A)...
            const A = coord
            let nextIndex

            // and the next coord (B) as points
            if (isPolygon) {
              nextIndex = index + 1 === coords.length ? 0 : index + 1
            } else {
              nextIndex = index + 1 === coords.length ? undefined : index + 1
            }

            const B = coords[nextIndex]

            if (B) {
              // calc the distance between P and AB-segment
              const distance = this._getDistanceToSegment(map, P, A, B)

              // is the distance shorter than the previous one? Save it and the segment
              if (shortestDistance === undefined || distance < shortestDistance) {
                shortestDistance = distance
                closestSegment = [A, B]
              }
            }
          })
        }

        loopThroughCoords(latlngs)

        // now, take the closest segment (closestSegment) and calc the closest point to P on it.
        const C = this._getClosestPointOnSegment(
          map,
          latlng,
          closestSegment[0],
          closestSegment[1]
        )

        // return the latlng of that sucker
        return {
          latlng: Object.assign({}, C),
          segment: closestSegment,
          distance: shortestDistance
        }
      },

      _getClosestPointOnSegment (map, latlng, latlngA, latlngB) {
        let maxZoom = map.getMaxZoom()
        if (maxZoom === Infinity) {
          maxZoom = map.getZoom()
        }
        const P = map.project(latlng, maxZoom)
        const A = map.project(latlngA, maxZoom)
        const B = map.project(latlngB, maxZoom)
        const closest = L.LineUtil.closestPointOnSegment(P, A, B)
        return map.unproject(closest, maxZoom)
      },
      _getDistanceToSegment (map, latlng, latlngA, latlngB) {
        const P = map.latLngToLayerPoint(latlng)
        const A = map.latLngToLayerPoint(latlngA)
        const B = map.latLngToLayerPoint(latlngB)
        return L.LineUtil.pointToSegmentDistance(P, A, B)
      },
      _getDistance (map, latlngA, latlngB) {
        return map
          .latLngToLayerPoint(latlngA)
          .distanceTo(map.latLngToLayerPoint(latlngB))
      }
    }

    const intersection = {
      /**
       * Get geometry property of input featureCollection or return input
       *
       * @param {*} object
       */
      getFeatureGeometry (object) {
        return object.type === 'Feature'
          ? object.geometry
          : object
      },

      /**
       * Check lineString construct validity
       *
       * @param {Array|Object} ls
       * LinesString feature collection or geometry line represented as [coord1, coord2]
       *
       * @return {Boolean}
       */
      isLine (ls) {
        if (Array.isArray(this.getFeatureGeometry(ls))) {
          if (ls.length === 2 && (ls.map(coords => coords.length === 2))) {
            return true
          }
        }
        return false
      },

      /**
       * check self-intersection for input geometry
       * will handle multiPolygons rings
       *
       * @param {Object|Array} geometry
       * Feature collection or geometry set, constructor
       *
       * @return {Array} results
       * Array of intersection points (leaflet markers, temp, fix this)
       * Do Boolean(selfCheck(g).length > 0) if a binary result is expected
       */
      selfCheck (geometry) {
        let geom = this.getFeatureGeometry(geometry)
        let result = []
        // self-check self-reference, funny
        let I = this

        geom.coordinates.forEach(function (ring1) {
          geom.coordinates.forEach(function (ring2) {
            for (let i = 0; i < ring1.length - 1; i++) {
              for (let k = 0; k < ring2.length - 1; k++) {
                // don't check adjacent sides of a given ring, since of course they intersect in a vertex.
                if (ring1 === ring2 && (Math.abs(i - k) === 1 || Math.abs(i - k) === ring1.length - 2)) {
                  continue
                }

                // ip - intersection point [x, y] || boolean
                let ip = I.linesCheck(
                  ring1[i][0],
                  ring1[i][1],
                  ring1[i + 1][0],
                  ring1[i + 1][1],
                  ring2[k][0],
                  ring2[k][1],
                  ring2[k + 1][0],
                  ring2[k + 1][1])
                if (ip) {
                  result.push(L.marker([ip[0], ip[1]]))
                }
              }
            }
          })
        })

        return result
      },

      /**
       *
       * @param {Array|Object} line1
       * LinesString feature collection or geometry line represented as [coord1, coord2]
       *
       * @param {Array|Object} line2
       * LinesString feature collection or geometry line represented as [coord1, coord2]
       *
       * @return {Array|Boolean} result
       * array of x,y coordinates representing the intersection point or boolean false
       */
      linesCheck (line1, line2) {
        let L1 = this.getFeatureGeometry(line1)
        let L2 = this.getFeatureGeometry(line2)

        return this.isLine(L1) && this.isLine(L2)
          ? this.linesCheckImpl(
            line1[0][0],
            line1[0][1],
            line1[1][0],
            line1[1][1],
            line2[0][0],
            line2[0][1],
            line2[1][0],
            line2[1][1]
          )
          : false
      },

      /**
       * Checks intersection of two line segments, represented by
       *
       * @param {Number} L1sX
       * line 1 start coordinate X
       *
       * @param {Number} L1sY
       * line 1 start coordinate Y
       *
       * @param {Number} L1eX
       * line 1 end coordinate X
       *
       * @param {Number} L1eY
       * line 1 end coordinate Y
       *
       * @param {Number} L2sX
       * line 2 start coordinate X
       *
       * @param {Number} L2sY
       * line 2 start coordinate Y
       *
       * @param {Number} L2eX
       * line 2 end coordinate X
       *
       * @param {Number} L2eY
       * line 2 end coordinate Y
       *
       *
       * @return {Array|Boolean} result
       * array of x,y coordinates representing the intersection point or boolean false
       */
      linesCheckImpl (L1sX, L1sY, L1eX, L1eY, L2sX, L2sY, L2eX, L2eY) {
        // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
        let denominator
        let a
        let b
        // numerator 1
        let n1
        // numerator 2
        let n2
        let result = {
          x: null,
          y: null,
          onLine1: false,
          onLine2: false
        }

        denominator = ((L2eY - L2sY) * (L1eX - L1sX)) - ((L2eX - L2sX) * (L1eY - L1sY))
        if (denominator === 0) {
          if (result.x !== null && result.y !== null) {
            return result
          } else {
            return false
          }
        }
        a = L1sY - L2sY
        b = L1sX - L2sX
        n1 = ((L2eX - L2sX) * a) - ((L2eY - L2sY) * b)
        n2 = ((L1eX - L1sX) * a) - ((L1eY - L1sY) * b)
        a = n1 / denominator
        b = n2 / denominator

        // if we cast these lines infinitely in both directions, they intersect here:
        result.x = L1sX + (a * (L1eX - L1sX))
        result.y = L1sY + (a * (L1eY - L1sY))

        // if line1 is a segment and line2 is infinite, they intersect if:
        if (a >= 0 && a <= 1) {
          result.onLine1 = true
        }
        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b >= 0 && b <= 1) {
          result.onLine2 = true
        }
        // if line1 and line2 are segments, they intersect if both of the above are true
        if (result.onLine1 && result.onLine2) {
          return [result.x, result.y]
        } else {
          return false
        }
      }
    }

    return {
      drag,
      snap,
      intersection
    }
  })()

  /**
   *
   * @namespace Vector
   *
   *
   *
   *
   *
   */
  const Vector = Sofi.Vector = (function () {
    /****************
    *     State     *
    ****************/
    let filterFeat = []
    let selectedId = null
    let activeMode = false

    function setState () {
      const { data } = IStore.getGisStore()

      selectedId = data.geomId
      activeMode = data.activeMode
    }

    function getState () {
      return {
        selectedId,
        activeMode
      }
    }

    /****************
    *     Utils     *
    ****************/
    /**
     *
     * @param {Object} vector
     * @param {Object} feature
     * @param {Object} options
     */
    function setLabel (vector, feature, options) {
      const { label } = options
      const zoomLevel = Map.getZoom()

      if ((zoomLevel - label.label_scale.min) * (zoomLevel - label.label_scale.max) <= 0) {
        vector.bindTooltip(feature.properties[label.fieldName], label.options)
      }
    }

    /**
     * @param {Object} feature
     */
    function filterVector () {
      return function filter (feature) {
        // feature.id <String> , should we cast to <Number> ?
        return !filterFeat.includes(feature.id)
      }
    }

    function setFilterVector (item) {
      if (!filterFeat.includes(item)) { filterFeat.push(item) }
    }

    function isWorked (id) {
      let layers = Layer.workLayer._layers
      for (let key in layers) {
        if (layers.hasOwnProperty(key) && layers[key].feature) {
          if (layers[key].feature.id === id) {
            return true
          }
        }
      }
      return false
    }

    /**
     *
     * @param {Object} feature
     */
    function getDescriptorId (feature) {
      return feature.properties.DESCRIPTOR || ''
    }

    function clearVectors () {
      Layer.permanentCluster.clearLayers()
      Layer.spatialCluster.clearLayers()
      Layer.movementArr.map(ls => { if (Map.hasLayer(ls)) { ls.removeFrom(Map) } })

      Layer.quarantineArr.map(q => {
        if (!isWorked(q.feature.id)) {
          if (Map.hasLayer(q)) {
            q.removeFrom(Map)
          }
        }
      })

      Layer.movementArr = []
      Layer.quarantineArr = []
    }

    /****************
    * Marker Utils *
    ****************/

    /**
     *
     * @param {Object} config
     * @param {Object} point
     * @param {Object} latLng
     * @param {Event} e
     */
    function onMarkerClick (config, point, latLng) {
      return function onClick (e) {
        // selectedId = point.id
        IStore.setData({geomInfo: [point.id, config.onClick.type, null]})
        // FIX ME, GeomMetadata does not re-render on props change, unless its content flag is toggled before each call
        IStore.setComponentData('GeomMetadata', Object.assign({}, { formContent: false, readOnly: true }))
        IStore.setComponentData('GeomMetadata', Object.assign({}, { geomId: point.id, geomTable: config.onClick.type, readOnly: true, formContent: true }))
        IStore.setData({refreshMap: true})
      }
    }

    /**
     *
     * @param {Object} iconConfig
     */
    function setIcon (iconConfig) {
      return L.BeautifyIcon.icon(iconConfig)
    }

    /************************
    *  Render/GeoJson API   *
    ************************/

    function _onEachFeature_permanent (config) {
      return function onEachFeature (feature, layer) {
        let desc = Factory.descriptor(getDescriptorId(feature))
        setFilterVector(feature)
        if (feature.geometry.type === 'LineString') {
          let ls = L.polyline.antPath(layer.getLatLngs(), desc.style)
          ls.feature = layer.feature
          // and path lines are added twice when included in permanentFeat <L.FeatureGroup>, keep reference in permanent Set
          Layer.movementArr.push(ls)
          ls.on('click', e => {
            console.log(e)
          })
          ls.addTo(Map)
        }
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          if (!isWorked(feature.id)) {
            layer.feature.properties.parent_id === selectedId ? layer.setStyle(Factory.descriptor('QUARANTINE_HOVER').style) : layer.setStyle(desc.style)
            Events.quarantine(getState(), desc, layer)
            Layer.quarantineArr.push(layer)
            layer.addTo(Map)
          }
        }
      }
    }

    /**
     *
     * @param {Object} config
     * @param {Object} point
     * @param {Object} latLng
     */
    function _onEachMarker_permanent (config) {
      return function pointToLayer (point, latLng) {
        let desc = Factory.descriptor(getDescriptorId(point))
        // Create leaflet.Marker<any> element
        let marker = L.marker(latLng, {
          icon: point.id === selectedId
            ? setIcon(desc.iconFocus)
            : setIcon(desc.icon),
          draggable: false})

        // Attach marker hooks
        if (activeMode) {
          marker.off()
        } else {
          marker.on({
            click: onMarkerClick(desc, point, latLng)
          })
        }

        setFilterVector(point.id)
        setLabel(marker, point, desc)

        Layer.permanentCluster.addLayer(marker)
      }
    }

    function _onEachFeature_spatial () {
      return function onEachFeature (feature, layer) {
        let desc = Factory.descriptor(getDescriptorId(feature))
        if (feature.properties['DESCRIPTOR'] === 'SVAROG_SDI_UNITS') {
          layer.setStyle(desc.style)
          layer.addTo(Map)
        }
      }
    }

    /**
     *
     * @param {Object} config
     * @param {Object} point
     * @param {Object} latLng
     */
    function _onEachMarker_spatial (config) {
      return function pointToLayer (point, latLng) {
        let desc = Factory.descriptor(getDescriptorId(point))
        // Create leaflet.Marker<any> element
        let marker = L.marker(latLng, {
          icon: point.id === selectedId
            ? setIcon(desc.iconFocus)
            : setIcon(desc.icon),
          draggable: false})

        // Attach marker hooks
        if (!activeMode) {
          marker.on({
            click: onMarkerClick(desc, point, latLng)
          })
        }

        setLabel(marker, point, desc)
        marker.options.pane = 'overlayPane'
        Layer.spatialCluster.addLayer(marker)
      }
    }

    /**
     * @param {*} config
     * @param {*} geometry
     */
    function _addPermanent (config, geometry) {
      Layer.permanent[config.sdiType] = L.Proj.geoJson(geometry, {
        crs: CRS.web,
        onEachFeature: _onEachFeature_permanent(config),
        pointToLayer: _onEachMarker_permanent(config)
      })
    }

    /**
     * @param {*} config
     * @param {*} geometry
     */
    function _addSpatial (config, geometry) {
      Layer.spatial[config.sdiType] = L.Proj.geoJson(geometry, {
        crs: CRS.web,
        onEachFeature: _onEachFeature_spatial(),
        pointToLayer: _onEachMarker_spatial(config),
        filter: filterVector()
      })
    }

    return {
      render (data) {
        clearVectors()
        setState()

        Object.keys(data).map(key => {
          const {config, geometry} = data[key]

          CRS.setObjectCrs(geometry, CRS.native.code)
          config.permanent ? _addPermanent(config, geometry) : _addSpatial(config, geometry)
        })
      }
    }
  })()

  /**
   *
   * @namespace Raster
   *
   *
   *
   *
   *
   */
  const Raster = Sofi.Raster = (function () {
    const defProps = {
      position: 'topright',
      collapsed: true,
      autoZIndex: true,
      sortLayers: false
    }

    return {
      /**
       * @function render(rasterConfig <Object>, controlConfig<Object): void
       * Generates tileLayers from configuration => initializes layer control => Renders raster
       *
       * @param {Object} rasterConfig  <Object> - contains configuration objects for WMS services
       * @param {Object} controlConfig <Object> - specifies L.control.layers properties, will be merged and overwrite options
       */
      render (rasterConfig, controlConfig) {
        let base = {}
        Object.keys(rasterConfig).map((key) => {
          const { name, path, options, defaultRender } = rasterConfig[key]

          let tileLayer = L.tileLayer(path, options)
          base[name] = tileLayer

          if (defaultRender) tileLayer.addTo(Map)
        })

        L.control.layers(base, null, Object.assign(defProps, controlConfig)).addTo(Map)
      }
    }
  })()

  /**
   *
   * @namespace Events
   *
   *
   *
   *
   *
   */
  const Events = Sofi.Events = (function () {
    // Add keyboard event listener
    document.onkeydown = e => {
      // Escape is 27
      if (e.keyCode === 27) {
        // if any work is being done and the object is contained in workLayer feature group, disable all active processes
        // includes active editing of existing quarantines or modifying a newly declared one (where drawing as finished)
        // includes newly declared quarantines (still being drawn) and measurement tools
        Map.pm.disableDraw('Line')
        Map.pm.disableDraw('Poly')
        Map.pm.disableDraw('Circle')
        Tools.removeDrawnItems()
      }
    }

    return {
      /****************
      *  Map Events   *
      ****************/
      map: container => {
        /**
        * attach moveend event to map instance
        */
        container.on('moveend', Utils.debounce(e => {
          IStore.setData({'zoomLevel': container.getZoom()})
          IStore.setData({mapBbox: Utils.calculateBbox()})
        }, 1000))
      },

      /****************
      *  Draw Events  *
      ****************/
      draw: container => {
        /**
        * attach object drawing initiated event to map instance
        */
        container.on('pm:drawstart', e => {
          const {shape, workingLayer} = e
          IStore.setData({activeMode: [true, 'draw']})
          // disable click events on dom container for all markers as drawing process started
          // vertexes should be added freely, no interaction with other objects allowed
          Map.getPane('markerPane').style.pointerEvents = 'none'
          shape === 'Circle'
            ? Tools.labelQuarantine(workingLayer)
            : workingLayer.showMeasurements()
        })

        /**
         * attach object drawn/created event to map instance
         */
        container.on('pm:create', e => {
          let layer = e.layer
          // enable click events on dom container for all markers as drawing process is finished

          if (e.shape === 'Line' || e.shape === 'Poly') {
            IStore.setData({activeMode: [false, '']})
            Map.getPane('markerPane').style.pointerEvents = 'visiblePainted'
            layer.showMeasurements()
            Layer.measure.addLayer(layer)
          }
          if (e.shape === 'Circle') {
            Tools.labelQuarantine(layer)
            // attach editing events on drawn layer and enable edit hooks
            Events.editCircle(layer)
            // Configure Metadata, store shape
            IStore.setData({ geomInfo: [null, 'QUARANTINE', 0] })
            IStore.setData({ qRadius: Math.round(layer._mRadius), geomCoords: CRS.native.projection.project(layer.getLatLng()) })
            IStore.setComponentData('GeomMetadata', Object.assign({}, {formContent: false, readOnly: 'close'}))
            IStore.setComponentData('GeomMetadata', Object.assign({}, {geomId: '', geomTable: 'QUARANTINE', readOnly: 'close', formContent: true}))

            Layer.workLayer.addLayer(layer)
          }

          Map.fitBounds(layer.getBounds())
        })
      },

      /****************
      *  Edit Events  *
      ****************/
      editCircle: layer => {
        layer.on('pm:centerplaced pm:markerdragend', e => {
          IStore.setData({
            qRadius: Math.round(e.target._mRadius),
            geomCoords: CRS.native.projection.project(e.target.getLatLng()) })
        })

        layer.on('pm:markerdragstart', e => {
          Tools.labelQuarantine(e.target)
        })

        layer.pm.enable()
      },

      editPolygon: layer => {
        // attach events
        layer.on('pm:vertexadded pm:vertexremoved', e => {
          IStore.setData({ geomCoords: Utils.reprojectLatLngs.call(e.target) })
        })
        layer.on('pm:markerdragend', e => {
          e.target.pm.enable()
          IStore.setData({ geomCoords: Utils.reprojectLatLngs.call(e.target) })
        })

        Map.getPane('markerPane').style.pointerEvents = 'none'
        IStore.setData({activeMode: [true, 'edit']})

        // Quarantine geometry field is MultiPolygon type (database type)
        // initialization of work with the geometry data should simplify its structure to a flat, simple polygon
        // avoids headaches on hooks and methods with double/triple nested arrays
        // Conversion to a complex multiPoly type is done on server side, once the whole client work is done and the object is being saved
        // Fixes redrawing of the shape , this._layer, when its vertices position change i.e polygon is being edited
        let coords = layer.getLatLngs()
        if (coords.length === 1) {
          layer.setLatLngs(coords.flat(2)) // do we have a case of triple+ nested data? Should we just slap an int 10 parameter?
        }

        Tools.labelQuarantine(layer)

        layer.pm.enable({
          snappable: true,
          snapDistance: 20,
          allowSelfIntersection: false,
          preventMarkerRemoval: false
        })
        Map.fitBounds(layer.getBounds())

        IStore.setData({ geomCoords: Utils.reprojectLatLngs.call(layer) })

        Layer.workLayer.addLayer(layer)
      },

      /*************************
      * Quarantine Interaction *
      *************************/
      quarantine: (state, config, layer) => {
        const { activeMode, selectedId } = state

        if (!activeMode) {
          layer.on('click', function (e) {
            let id = layer.feature.properties.parent_id
            // attach editing events on selected layer and enable edit hooks
            Events.editPolygon(layer)

            IStore.setData({geomInfo: [id, config.onClick.type, null]})
            IStore.setComponentData('GeomMetadata', Object.assign({}, {formContent: false, readOnly: 'close'}))
            IStore.setComponentData('GeomMetadata', Object.assign({}, {geomId: id, geomTable: config.onClick.type, readOnly: 'close', formContent: true}))
            IStore.setData({refreshMap: true})
          })
        }

        layer.on('mouseover', function (e) {
          e.target.setStyle(Factory.descriptor('QUARANTINE_HOVER').style)
        })

        layer.on('mouseout', function (e) {
          if (e.target.feature.properties.parent_id !== selectedId) {
            e.target.setStyle(config.style)
          }
        })
      }

    }
  })()

  /**
   *
   * @namespace Draw
   * @class Draw
   *
   *
   *
   *
   *
   */
  const Draw = Sofi.Draw = (function () {
    return {
      geometry (type = 'Poly', options = {}) {
        Map.pm.enableDraw(type, options)
      }
    }
  })()

  /**
   *
   * @namespace Edit
   * @class Edit
   *
   * @extends pm plugin edit root
   *
   * As every edit sub-class inherits from pm.edit,
   * this provides namespace to configure/extend/include functionality to all
   * add our own mixins to start
   *
   * To do: properly integrate
   */
  const Edit = Sofi.Edit = L.PM.Edit.include({
    // includes: [Mixin.drag, Mixin.snap, Mixin.intersection],
    options: {
      snappable: true,
      snapDistance: 20,
      allowSelfIntersection: false,
      draggable: false
    },
    isPolygon () {
      // if it's a polygon, it means the coordinates array is multi dimensional
      return this._layer instanceof L.Polygon
    },
    ...Mixin
  })

  /**
   *
   * @namespace EditLine
   * @class EditLine
   * @override Leaflet PM plugin <Edit.Line> functionality
   * @this Layer instance
   *
   * created with the intention to modify/extend/debug editing process
   *
   * Uses leaflet L.include(obj) {L.extend(this.proto, obj)}
   *
   * Takes all attributes of the object here and appends/overwrites src x <X.include>
   *
   */
  const EditLine = Sofi.EditLine = L.PM.Edit.Line.include({
    initialize (layer) {
      this._layer = layer
      this._enabled = false
    },

    toggleEdit (options) {
      if (!this.enabled()) {
        this.enable(options)
      } else {
        this.disable()
      }

      return this.enabled()
    },

    enable (options) {
      L.Util.setOptions(this, options)

      this._map = this._layer._map

      // cancel when map isn't available, this happens when the polygon is removed before this fires
      if (!this._map) {
        return
      }

      if (!this.enabled()) {
        // if it was already enabled, disable first
        // we don't block enabling again because new options might be passed
        this.disable()
      }

      // change state
      this._enabled = true

      // init markers
      this._initMarkers()

      // if polygon gets removed from map, disable edit mode
      this._layer.on('remove', this._onLayerRemove, this)

      if (!this.options.allowSelfIntersection) {
        this._layer.on(
          'pm:vertexremoved',
          this._handleSelfIntersectionOnVertexRemoval,
          this
        )
      }

      if (!this.options.allowSelfIntersection) {
        if (!this.cachedColor) {
          this.cachedColor = this._layer.options.color
        }

        this.isRed = false
        this._handleLayerStyle()
      }
    },

    _onLayerRemove (e) {
      this.disable(e.target)
    },

    enabled () {
      return this._enabled
    },

    disable (poly = this._layer) {
      // if it's not enabled, it doesn't need to be disabled
      if (!this.enabled()) {
        return false
      }

      // prevent disabling if polygon is being dragged
      if (poly.pm._dragging) {
        return false
      }
      poly.pm._enabled = false
      poly.pm._markerGroup.clearLayers()

      // clean up draggable
      poly.off('mousedown')
      poly.off('mouseup')

      // remove onRemove listener
      this._layer.off('remove', this._onLayerRemove, this)

      if (!this.options.allowSelfIntersection) {
        this._layer.off(
          'pm:vertexremoved',
          this._handleSelfIntersectionOnVertexRemoval
        )
      }

      // remove draggable class
      const el = poly._path ? poly._path : this._layer._renderer._container
      L.DomUtil.removeClass(el, 'leaflet-pm-draggable')

      // remove invalid class if layer has self intersection
      if (this.hasSelfIntersection()) {
        L.DomUtil.removeClass(el, 'leaflet-pm-invalid')
      }

      if (this._layerEdited) {
        this._layer.fire('pm:update', {})
      }
      this._layerEdited = false

      return true
    },

    hasSelfIntersection () {
      // check for self intersection of the layer and return true/false
      const siResult = this.intersection.selfCheck(this._layer.toGeoJSON(15))
      return siResult.length > 0
    },

    _handleSelfIntersectionOnVertexRemoval () {
      // check for selfintersection again (mainly to reset the style)
      this._handleLayerStyle(true)

      if (this.hasSelfIntersection()) {
        // reset coordinates
        this._layer.setLatLngs(this._coordsBeforeEdit)
        this._coordsBeforeEdit = null

        // re-enable markers for the new coords
        this._initMarkers()
      }
    },

    _handleLayerStyle (flash) {
      const layer = this._layer

      if (this.hasSelfIntersection()) {
        if (this.isRed) {
          return
        }

        // if it does self-intersect, mark or flash it red
        if (flash) {
          layer.setStyle({ color: 'red' })
          this.isRed = true

          window.setTimeout(() => {
            layer.setStyle({ color: this.cachedColor })
            this.isRed = false
          }, 200)
        } else {
          layer.setStyle({ color: 'red' })
          this.isRed = true
        }

        // fire intersect event
        this._layer.fire('pm:intersect', {
          intersection: this.intersection.selfCheck(this._layer.toGeoJSON(15))
        })
      } else {
        // if not, reset the style to the default color
        layer.setStyle({ color: this.cachedColor })
        this.isRed = false
      }
    },

    _initMarkers () {
      const map = this._map
      const coords = this._layer.getLatLngs()

      // cleanup old ones first
      if (this._markerGroup) {
        this._markerGroup.clearLayers()
      }

      // add markerGroup to map, markerGroup includes regular and middle markers
      this._markerGroup = new L.LayerGroup()
      this._markerGroup._pmTempLayer = true
      map.addLayer(this._markerGroup)

      // handle coord-rings (outer, inner, etc)
      const handleRing = coordsArr => {
        // if there is another coords ring, go a level deep and do this again
        if (Array.isArray(coordsArr[0])) {
          return coordsArr.map(handleRing, this)
        }

        // the marker array, it includes only the markers of vertexes (no middle markers)
        const ringArr = coordsArr.map(this._createMarker, this)

        // create small markers in the middle of the regular markers
        coordsArr.map((v, k) => {
          // find the next index fist
          const nextIndex = this.isPolygon() ? (k + 1) % coordsArr.length : k + 1
          // create the marker
          return this._createMiddleMarker(ringArr[k], ringArr[nextIndex])
        })

        return ringArr
      }

      // create markers
      this._markers = handleRing(coords)

      if (this.options.snappable) {
        this._initSnappableMarkers()
      }
    },

    // creates initial markers for coordinates
    _createMarker (latlng) {
      const marker = new L.Marker(latlng, {
        draggable: true,
        icon: L.divIcon({ className: 'marker-icon' })
      })

      marker._pmTempLayer = true

      marker.on('dragstart', this._onMarkerDragStart, this)
      marker.on('move', this._onMarkerDrag, this)
      marker.on('dragend', this._onMarkerDragEnd, this)

      if (!this.options.preventMarkerRemoval) {
        marker.on('contextmenu', this._removeMarker, this)
      }

      this._markerGroup.addLayer(marker)

      return marker
    },

    // creates the middle markes between coordinates
    _createMiddleMarker (leftM, rightM) {
      // cancel if there are no two markers
      if (!leftM || !rightM) {
        return false
      }

      const latlng = Utils.calcMiddleLatLng(
        this._map,
        leftM.getLatLng(),
        rightM.getLatLng()
      )

      const middleMarker = this._createMarker(latlng)
      const middleIcon = L.divIcon({
        className: 'marker-icon marker-icon-middle'
      })
      middleMarker.setIcon(middleIcon)

      // save reference to this middle markers on the neighboor regular markers
      leftM._middleMarkerNext = middleMarker
      rightM._middleMarkerPrev = middleMarker

      middleMarker.on('click', () => {
        // TODO: move the next two lines inside _addMarker() as soon as
        // https://github.com/Leaflet/Leaflet/issues/4484
        // is fixed
        const icon = L.divIcon({ className: 'marker-icon' })
        middleMarker.setIcon(icon)

        this._addMarker(middleMarker, leftM, rightM)
      })
      middleMarker.on('movestart', () => {
        // TODO: This is a workaround. Remove the moveend listener and
        // callback as soon as this is fixed:
        // https://github.com/Leaflet/Leaflet/issues/4484
        middleMarker.on('moveend', () => {
          const icon = L.divIcon({ className: 'marker-icon' })
          middleMarker.setIcon(icon)

          middleMarker.off('moveend')
        })

        this._addMarker(middleMarker, leftM, rightM)
      })

      return middleMarker
    },

    // adds a new marker from a middlemarker
    _addMarker (newM, leftM, rightM) {
      // first, make this middlemarker a regular marker
      newM.off('movestart')
      newM.off('click')

      // now, create the polygon coordinate point for that marker
      // and push into marker array
      // and associate polygon coordinate with marker coordinate
      const latlng = newM.getLatLng()
      const coords = this._layer._latlngs

      // the index path to the marker inside the multidimensional marker array
      const { indexPath, index, parentPath } = this.findDeepMarkerIndex(
        this._markers,
        leftM
      )

      // define the coordsRing that is edited
      const coordsRing = indexPath.length > 1 ? get(coords, parentPath) : coords

      // define the markers array that is edited
      const markerArr =
          indexPath.length > 1 ? get(this._markers, parentPath) : this._markers

      // add coordinate to coordinate array
      coordsRing.splice(index + 1, 0, latlng)

      // add marker to marker array
      markerArr.splice(index + 1, 0, newM)

      // set new latlngs to update polygon
      this._layer.setLatLngs(coords)

      // create the new middlemarkers
      this._createMiddleMarker(leftM, newM)
      this._createMiddleMarker(newM, rightM)

      // fire edit event
      this._fireEdit()

      this._layer.fire('pm:vertexadded', {
        layer: this._layer,
        marker: newM,
        indexPath: this.findDeepMarkerIndex(this._markers, newM).indexPath,
        latlng
        // TODO: maybe add latlng as well?
      })

      if (this.options.snappable) {
        this._initSnappableMarkers()
      }
    },

    _removeMarker (e) {
      // if self intersection isn't allowed, save the coords upon dragstart
      // in case we need to reset the layer
      if (!this.options.allowSelfIntersection) {
        const c = this._layer.getLatLngs()
        this._coordsBeforeEdit = JSON.parse(JSON.stringify(c))
      }

      // the marker that should be removed
      const marker = e.target

      // coords of the layer
      const coords = this._layer.getLatLngs()

      // the index path to the marker inside the multidimensional marker array
      const { indexPath, index, parentPath } = this.findDeepMarkerIndex(
        this._markers,
        marker
      )

      // only continue if this is NOT a middle marker (those can't be deleted)
      if (!indexPath) {
        return
      }

      // define the coordsRing that is edited
      const coordsRing = indexPath.length > 1 ? get(coords, parentPath) : coords

      // define the markers array that is edited
      const markerArr =
          indexPath.length > 1 ? get(this._markers, parentPath) : this._markers

      // remove coordinate
      coordsRing.splice(index, 1)

      // set new latlngs to the polygon
      this._layer.setLatLngs(coords)

      // if the ring of the poly has no coordinates left, remove the last coord too
      if (coordsRing.length <= 1) {
        coordsRing.splice(0, coordsRing.length)

        // set new coords
        this._layer.setLatLngs(coords)

        // re-enable editing so unnecessary markers are removed
        // TODO: kind of an ugly workaround maybe do it better?
        this.disable()
        this.enable(this.options)
      }

      // TODO: we may should remove all empty coord-rings here as well.

      // if no coords are left, remove the layer
      if (Utils.isEmptyDeep(coords)) {
        this._layer.remove()
      }

      // now handle the middle markers
      // remove the marker and the middlemarkers next to it from the map
      if (marker._middleMarkerPrev) {
        this._markerGroup.removeLayer(marker._middleMarkerPrev)
      }
      if (marker._middleMarkerNext) {
        this._markerGroup.removeLayer(marker._middleMarkerNext)
      }

      // remove the marker from the map
      this._markerGroup.removeLayer(marker)

      let rightMarkerIndex
      let leftMarkerIndex

      if (this.isPolygon()) {
        // find neighbor marker-indexes
        rightMarkerIndex = (index + 1) % markerArr.length
        leftMarkerIndex = (index + (markerArr.length - 1)) % markerArr.length
      } else {
        // find neighbor marker-indexes
        leftMarkerIndex = index - 1 < 0 ? undefined : index - 1
        rightMarkerIndex = index + 1 >= markerArr.length ? undefined : index + 1
      }

      // don't create middlemarkers if there is only one marker left
      if (rightMarkerIndex !== leftMarkerIndex) {
        const leftM = markerArr[leftMarkerIndex]
        const rightM = markerArr[rightMarkerIndex]
        this._createMiddleMarker(leftM, rightM)
      }

      // remove the marker from the markers array
      markerArr.splice(index, 1)

      // fire edit event
      this._fireEdit()

      // fire vertex removal event
      this._layer.fire('pm:vertexremoved', {
        layer: this._layer,
        marker,
        indexPath
        // TODO: maybe add latlng as well?
      })
    },
    findDeepMarkerIndex (arr, marker) {
      // thanks for the function, Felix Heck
      let result

      const run = path => (v, i) => {
        const iRes = path.concat(i)

        if (v._leaflet_id === marker._leaflet_id) {
          result = iRes
          return true
        }

        return Array.isArray(v) && v.some(run(iRes))
      }
      arr.some(run([]))

      let returnVal = {}

      if (result) {
        returnVal = {
          indexPath: result,
          index: result[result.length - 1],
          parentPath: result.slice(0, result.length - 1)
        }
      }

      return returnVal
    },
    updatePolygonCoordsFromMarkerDrag (marker) {
      // update polygon coords
      const coords = this._layer.getLatLngs()
      /*
      if (coords.length === 1) {
        coords.flat(2)
      }
      */
      // get marker latlng
      const latlng = marker.getLatLng()

      // get indexPath of Marker
      const { indexPath, index, parentPath } = this.findDeepMarkerIndex(
        this._markers,
        marker
      )

      // update coord
      const parent = indexPath.length > 1 ? get(coords, parentPath) : coords
      parent.splice(index, 1, latlng)

      // set new coords on layer, fix me
      try {
        this._layer.setLatLngs(coords).redraw()
      } catch (e) {
        if (process.env.NODE_ENV === 'debug') {
          console.log('layer._renderer._updatePath failed with exception: ' + e + '.\n' +
          'Known cause is leaflet not emitting setLatLngs events on Polygon/Polyline paths.' + '\n' +
          'Please update this instance manually when marker(vertex) dragging ends.')
        }
      }
    },

    _onMarkerDrag (e) {
      // dragged marker
      const marker = e.target

      const { indexPath, index, parentPath } = this.findDeepMarkerIndex(
        this._markers,
        marker
      )

      // only continue if this is NOT a middle marker
      if (!indexPath) {
        return
      }

      this.updatePolygonCoordsFromMarkerDrag(marker)

      // the dragged markers neighbors
      const markerArr = indexPath.length > 1
        ? get(this._markers, parentPath)
        : this._markers

      // find the indizes of next and previous markers
      const nextMarkerIndex = (index + 1) % markerArr.length
      const prevMarkerIndex = (index + (markerArr.length - 1)) % markerArr.length

      // update middle markers on the left and right
      // be aware that "next" and "prev" might be interchanged, depending on the geojson array
      const markerLatLng = marker.getLatLng()

      // get latlng of prev and next marker
      const prevMarkerLatLng = markerArr[prevMarkerIndex].getLatLng()
      const nextMarkerLatLng = markerArr[nextMarkerIndex].getLatLng()

      if (marker._middleMarkerNext) {
        const middleMarkerNextLatLng = Utils.calcMiddleLatLng(
          this._map,
          markerLatLng,
          nextMarkerLatLng
        )
        marker._middleMarkerNext.setLatLng(middleMarkerNextLatLng)
      }

      if (marker._middleMarkerPrev) {
        const middleMarkerPrevLatLng = Utils.calcMiddleLatLng(
          this._map,
          markerLatLng,
          prevMarkerLatLng
        )
        marker._middleMarkerPrev.setLatLng(middleMarkerPrevLatLng)
      }

      // if self intersection is not allowed, handle it
      if (!this.options.allowSelfIntersection) {
        this._handleLayerStyle()
      }
    },

    _onMarkerDragEnd (e) {
      const marker = e.target
      const { indexPath } = this.findDeepMarkerIndex(this._markers, marker)

      // if self intersection is not allowed but this edit caused a self intersection,
      // reset and cancel; do not fire events
      if (!this.options.allowSelfIntersection && this.hasSelfIntersection()) {
        // reset coordinates
        this._layer.setLatLngs(this._coordsBeforeEdit)
        this._coordsBeforeEdit = null

        // re-enable markers for the new coords
        this._initMarkers()

        // check for selfintersection again (mainly to reset the style)
        this._handleLayerStyle()
        return
      }

      this._layer.fire('pm:markerdragend', {
        markerEvent: e,
        indexPath
      })

      // fire edit event
      this._fireEdit()
    },
    _onMarkerDragStart (e) {
      const marker = e.target
      const { indexPath } = this.findDeepMarkerIndex(this._markers, marker)

      this._layer.fire('pm:markerdragstart', {
        markerEvent: e,
        indexPath
      })

      // if self intersection isn't allowed, save the coords upon dragstart
      // in case we need to reset the layer
      if (!this.options.allowSelfIntersection) {
        this._coordsBeforeEdit = this._layer.getLatLngs()
      }
    },

    _fireEdit () {
      // fire edit event
      this._layerEdited = true
      this._layer.fire('pm:edit')
    }
  })

  /**
   *
   * @namespace Tools
   * @class Tools
   *
   *
   *
   *
   *
   */
  const Tools = Sofi.Tools = (function () {
    const GeoCoder = L.Control.GeoCoder = L.Control.extend({
      options: {
        position: 'topleft',
        className: 'geoCoder',
        collapsed: true,
        title: 'Search location',
        types: []
      },
      /**
       * After compilation, JSX expressions become regular JavaScript function calls
       * and evaluate to JavaScript objects => typeof <Symbol> of a ReactElement
       *
       * Each JSX is transpiled to React.createElement =>
       *  Fn(type <T>, props <P>, children <C>): JSX | ReactElement <Symbol>
       *
       * createElement is called recursively (for jsx returned types) until all return types are reactElements,
       * then reconciliation is triggered and the react vDOM is built out of these elements
       *
       * React vDOM (tree of reactElements <Object> describing the actual browser DOM <Html>) defaults to HTML by ReactDOM.render calls =>
       *  Fn(element <ReactElement>, container <Html> [, callback <Fn>]): void | this
       *
       * React class or Fn (stateless comp) is a jsx factory fn, has input and returns jsx (which defaults to a React.createELement call)
       * Notice that the only mandatory method to these factories is the render(), which calls ReactDOM.render in the back,
       * effectively turning these abstractions into real DOM elements
       *
       * Now, given the above, in order to embed React ...
       */
      ui: class GeoCoderUI extends React.Component {
        static propTypes = {
          options: PropTypes.object.isRequired /*eslint-disable-line*/
        }
        constructor (props) {
          super(props)
          this.state = {
            isOpen: false,
            isActive: false,
            searchStr: '',
            results: []
          }
          this.token = store.getState().security.svSession

          this.onInput = this.onInput.bind(this)
          this.fetch = Utils.debounce(this.fetch.bind(this), 1000)
          this.result = this.result.bind(this)
          this.goToLocation = this.goToLocation.bind(this)
        }

        onInput (e) {
          let searchStr = e.currentTarget.value

          searchStr.length > 2
            ? this.fetch(searchStr)
            : this.setState({results: []})

          this.setState({searchStr: searchStr})
        }

        fetch (searchStr) {
          let service = IStore.getServicePath('getSearchLocations')
          let url = IStore.getServicePath() + replacePathParams(service, {token: this.token, searchStr: searchStr})

          axios({
            method: 'get',
            url: url,
            responseType: 'json',
          })
            .then(response => {
              let results = []

              response.data.map(el =>
                results.push(this.result(el)))

              this.setState({results: results})
            })
            .catch(e => { console.log(e) })
        }

        result (el) {
          return <a
            id={el.id}
            key={el.id}
            type={el.type}
            className='searchResult'
            data-values={el.values}
            data-markup={el.markup}
            data-geometry={el.geometry}
            onClick={this.goToLocation}>
            {el.markup}
          </a>
        }

        goToLocation (e) {
          let el = e.currentTarget
          // reset search results items rendered on map
          Layer.search.clearLayers()

          if (el !== null) {
            let data = el.dataset
            const { geometry, markup } = data

            let layer = L.Proj.geoJson(JSON.parse(geometry), {
              crs: CRS.web,
            }).addTo(Layer.search).bindTooltip(markup)

            Map.fitBounds(layer.getBounds())
          }

          this.setState({results: []})
        }

        componentDidMount () {
          this.setState({isOpen: !this.props.options.collapsed})
        }

        render () {
          const { isOpen, searchStr, results } = this.state

          return isOpen
            ? <div
              id='geoCoderUI'
              className='geoCoderUI'
              onMouseLeave={Utils.debounce(() => { (!this.state.isActive && isOpen) && this.setState({isOpen: !isOpen}) }, 1500)} >
              <div
                id='geoCoderInput'
                className='geoCoderInput' >
                <input
                  id='gcInput'
                  className='gcInput'
                  title=''
                  placeholder='Search'
                  value={searchStr}
                  onClick={() => { (!this.state.isActive) && this.setState({isActive: true}) }}
                  onChange={this.onInput} />
                <a
                  id='gcSearch'
                  className='gcButton'
                  title='Search' />
                {searchStr.length > 0 &&
                <a
                  id='gcClear'
                  className='gcButton'
                  title='Clear'
                  onClick={Utils.debounce(() => this.setState({searchStr: '', results: []}), 500)} />}
                <a
                  id='gcCollapse'
                  className='gcButton'
                  title='Cancel'
                  onClick={Utils.debounce(() => this.setState({isOpen: false}), 500)} />
              </div>
              {results.length > 0 &&
                <div
                  id='geoCoderResults'
                  className='geoCoderResults' >
                  {results}
                </div>}
            </div>
            : <a
              id='gcSearch'
              className='gcButton'
              onMouseOver={() => { (!isOpen) && this.setState({isOpen: !isOpen}) }} />
        }
      },

      // GeoCoder constructor
      initialize: function (map, options) {
        L.setOptions(this, options)

        this._map = map
        this._container = L.DomUtil.create('div', this.options.className)
      },

      onAdd: function (map) {
        this._container.title = this.options.title
        ReactDOM.render(<this.ui options={this.options} />, this._container)

        return this._container
      },

      onRemove: function (map) {
        // remove html dom element build by leaflet DOM, unmount react component
      },
    })
    // Factory function, exposed in Tools namespace
    const geoCoder = function (map, options) {
      return new GeoCoder(map, options)
    }

    return {
      geoCoder,
      /**
       *
       * @param {Object} options
       */
      measureDistance (options = {}) {
        Draw.geometry('Line', Object.assign({
          // snapping
          snappable: true,
          snapDistance: 20,
          // show tooltips
          tooltips: true,
          // allow snapping to the middle of segments
          snapMiddle: false,
          // self intersection
          allowSelfIntersection: true,
          // the lines between coordinates/markers
          templineStyle: {
            color: 'blue'
          },
          // the line from the last marker to the mouse cursor
          hintlineStyle: {
            color: 'blue',
            dashArray: [5, 5]
          },
          // show a marker at the cursor
          cursorMarker: false,
          // specify type of layer event to finish the drawn shape
          // example events: 'mouseout', 'dblclick', 'contextmenu'
          finishOn: null,
          // custom marker style (only for Marker draw)
          markerStyle: {
            opacity: 0.5,
            draggable: true
          },
          // add leaflet options for drawn elements
          pathOptions: {
            weight: 2.0,
            stroke: true,
            color: 'blue',
            fillColor: 'blue',
            opacity: 0.9,
            fillOpacity: 0.25
            // pane: 'workPane'
          }
        }, options))
      },
      /**
       *
       * @param {Object} options
       */
      measureArea (options = {}) {
        Draw.geometry('Poly', Object.assign({
          // snapping
          snappable: true,
          snapDistance: 20,
          // show tooltips
          tooltips: true,
          // allow snapping to the middle of segments
          snapMiddle: false,
          // self intersection
          allowSelfIntersection: true,
          // the lines between coordinates/markers
          templineStyle: {
            color: 'blue'
          },
          // the line from the last marker to the mouse cursor
          hintlineStyle: {
            color: 'blue',
            dashArray: [5, 5]
          },
          // show a marker at the cursor
          cursorMarker: false,
          // specify type of layer event to finish the drawn shape
          // example events: 'mouseout', 'dblclick', 'contextmenu'
          finishOn: null,
          // custom marker style (only for Marker draw)
          markerStyle: {
            opacity: 0.5,
            draggable: true
          },
          // add leaflet options for drawn elements
          pathOptions: {
            weight: 2.0,
            stroke: true,
            color: 'blue',
            fillColor: 'blue',
            opacity: 0.9,
            fillOpacity: 0.25
            // pane: 'workPane'
          }
        }, options))
      },
      /**
       *
       */
      removeDrawnItems () {
        Layer.measure.clearLayers()
        Layer.search.clearLayers()
        this.removeDrawnQuarantine()
      },
      /**
       *
       */
      removeDrawnQuarantine () {
        IStore.setData({activeMode: [false, '']})
        Map.getPane('markerPane').style.pointerEvents = 'visiblePainted'

        // reset Metadata form
        IStore.setData({geomInfo: [null, null, null]})
        IStore.setComponentData('GeomMetadata', Object.assign({}, {formContent: false, readOnly: null, geomId: '', geomTable: ''}))

        if (Layer.workLayer.getLayers().length > 0) {
          Layer.workLayer.clearLayers()
        }

        IStore.setData({refreshMap: true})
      },
      /**
       *
       * @param {Object} options
       */
      declareQuarantine (options = {}) {
        Draw.geometry('Circle', Object.assign({
          // snapping
          snappable: true,
          snapDistance: 20,
          // show tooltips
          tooltips: true,
          // allow snapping to the middle of segments
          snapMiddle: false,
          // self intersection
          allowSelfIntersection: true,
          // the lines between coordinates/markers
          templineStyle: {
            color: 'red'
          },
          // the line from the last marker to the mouse cursor
          hintlineStyle: {
            color: 'red',
            dashArray: [5, 5]
          },
          // show a marker at the cursor
          cursorMarker: false,
          // specify type of layer event to finish the drawn shape
          // example events: 'mouseout', 'dblclick', 'contextmenu'
          finishOn: null,
          // custom marker style (only for Marker draw)
          markerStyle: {
            opacity: 0.5,
            draggable: true
          },
          // add leaflet options for drawn elements
          // APPEND A WORKING LAYER PANE TO MAP< INIT ALL DRAWING ON IT
          pathOptions: {
            weight: 2.0,
            stroke: true,
            color: 'red',
            fillColor: 'red',
            opacity: 0.9,
            fillOpacity: 0.25
            // pane: 'workPane'
          }
        }, options))
      },
      /**
       * @function labelQuarantine
       *
       * @param {Object} q
       * quarantine layer instance
       */
      labelQuarantine (q) {
        // shadow this<q>.prototype.formatArea property, run our code, bind instance
        q.formatArea = this.setQLabel.bind(q)
        q.showMeasurements()

        return q
      },
      /**
       * @function setQLabel
       *
       * @param {Number} area
       * area
       *
       * @this
       * quarantine layer instance
       *
       * @return {String} formatted label < context?, area measurement >
       */
      setQLabel (area) {
        let contextLabel = ''
        let areaLabel
        let unit

        if (area) {
          if (this._measurementOptions.imperial) {
            if (area > 404.685642) {
              area = area / 4046.85642
              unit = ' ac'
            } else {
              area = area / 0.09290304
              unit = ' ft²'
            }
          } else {
            if (area > 100000) {
              area = area / 100000
              unit = ' km²'
            } else {
              unit = ' m²'
            }
          }

          areaLabel = area < 100
            ? '<span>' + 'Area = ' + area.toFixed(1) + unit
            : '<span>' + 'Area = ' + Math.round(area) + unit
        }

        if (this instanceof L.Circle) {
          contextLabel = 'Radius = ' + this._mRadius.toFixed(1) + ' m' + '<br/>'
        }
        if (this instanceof L.Polygon) {
          contextLabel = String(this.feature.properties['REASON']) + '<br/>'
        }

        return '<span>' + contextLabel + areaLabel + '</span>'
      }
    }
  })()

  /**
   *
   * @namespace Fetch
   * @class Fetch
   *
   *
   *
   *
   */
  const Fetch = Sofi.Fetch = (function () {
    /**
     * @param   {Number} zoomLevel
     * @param   {Object} renderConfig
     * @returns {Boolean} result: `zoomLevel` between `renderConfig.min/.max`
     */
    const _isRendered = (zoomLevel, renderConfig) => {
      return (zoomLevel - renderConfig.min) * (zoomLevel - renderConfig.max) <= 0
    }

    /**
     * @param   {String} mapBbox
     * @returns {Number} Spatial ID
     */
    const _generateSID = function (mapBbox) {
      let sid = Number(mapBbox.replace(/ /g, '').replace(/-/g, '').replace(/,/g, '').replace(/\./g, ''))
      return IStore.getData('geomSID') === sid ? sid ** 2 : sid
    }

    /**
     * @param   {Promise}  p
     * @returns {Function} Publishes geometry set <Geobuf Feature> to store
     */
    const _publish = p => {
      try {
        let pbf = new Pbf(new Uint8Array(p.data))
        let geometry = Gbf.decode(pbf)
        let { config } = p.config

        Object.getOwnPropertyNames(geometry).length > 0 &&
          IStore.setGeometry('addLayer', config.sdiType, geometry, config)
      } catch (err) {
        console.log('Failed decoding data at protobuf constructor or geobuf decoder with: ' + err)
      }
    }

    /**
     *
     * @param   {Object} config
     * @param   {Object} options
     * @returns {Array} `Collection <Axios>`
     */
    const _generateCalls = function (config, options) {
      let promiseArr = []

      Object.keys(config).map((key) => {
        let feat = config[key]

        if (_isRendered(options.zoomLevel, feat.render)) {
          let { service, responseType } = feat
          let url = IStore.getServicePath() + replacePathParams(service, options)

          promiseArr.push(
            axios({
              method: 'get',
              url: url,
              responseType: responseType,
              config: feat,
              state: Object.assign({}, ...options) // not handled or dispatched presently
            })
          )
        } else { IStore.setGeometry('removeLayer', feat.sdiType) }
      })

      return promiseArr
    }

    return {
      /**
       * @param {Object} config
       * @param {Object} props
       *
       * Named parameters:
       *  {String} `mapBbox`
       *  {Number} `zoomLevel`
       *  {Object} `options`
       *
       * @returns {Function} Publishes promise results <Feature Collection> to store
       */
      geometry: function (config, {mapBbox, zoomLevel, ...options}) {
        Promise.all(_generateCalls(...arguments))
          .then(async results => {
            await results.map(_publish)
            IStore.setData({geomSID: _generateSID(mapBbox)})
          })
      },

      /**
       * @param {Object} props
       *
       * Named parameters:
       *  {String} `token`
       *  {Object} `rootData`
       *
       * @returns {Function} Publishes map origin <String> to store
       */
      mapOrigin: function ({token, rootData}) {
        // FIX ME move url assembly ouside of fetch, this(url) => call => set mapOrigin
        let service = IStore.getServicePath('getMapOrigin')
        let url = IStore.getServicePath() + replacePathParams(service, Object.assign(rootData, {token: token}))

        axios.get(url)
          .then(response => {
            IStore.setData({mapOrigin: response.data})
          })
          .catch(e => { console.log(e) })
      }
    }
  })()

  /**
   *
   * @namespace Factory
   * @class Factory
   *
   *
   *
   *
   */
  const Factory = Sofi.Factory = {
    /**
     * @function get configuration
     * get configuration object
     */
    configuration: function (type) {
      // FIX ME, add default configuration type
      return configuration[type]
    },

    /**
     * @function get descriptor
     * @param {String} id
     * get descriptor object
     */
    descriptor: function (id) {
      return (id === null || id === '') ? descriptor.default : descriptor[id]
    },

    /**
     * @function mapFactory
     * initialize leaflet map
     */
    map: function (id = 'map', options = {}) {
      // Init map attributes
      const _properties = {
        center: [42.48627657532141, 43.35205078125001],
        zoom: 8,
        minZoom: 0,
        maxZoom: 18,
        dragging: true,
        zoomControl: true,
        doubleClickZoom: false,
        scrollWheelZoom: true,
        zoomAnimation: true,
        attributionControl: false,
        preferCanvas: false,
        keyboard: true,
        keyboardPanDelta: 80,
        tap: false,
        tapTolerance: 15
      }
      Object.assign(_properties, options)

      // Init leaflet map
      const _map = L.map(id, _properties).setView(_properties.center, 8)

      // Enable touch functionality, bloody leaflet draw
      L.Browser.touch = false

      // Adds a scale to the map(do something about position, bloody corner)
      // L.control.scale does not work with Leaflet^1.0.0 by itself(Proj4 issue), one has to specify distance which requires Earth's radius
      CRS.web.distance = L.CRS.Earth.distance
      CRS.web.R = 6378137
      L.control.scale().addTo(_map)

      // Init zoom control
      _map.zoomControl.setPosition('topleft')

      // Adds configurable coordinates toolbar, which shows the latling on mouseover as well as allowing input of a latling pair to pan onto
      // Adds atribution
      L.control.attribution({prefix: 'NAITS GIS Module'}).addTo(_map)
      L.control.coordinates({
        position: 'bottomright',
        decimals: 5,
        decimalSeperator: '.',
        enableUserInput: true,
        collapsed: false,
        crs: CRS.native,
        labelTemplateLat: 'Y: {y}',
        labelTemplateLng: 'X: {x}'
      }).addTo(_map)

      Tools.geoCoder(_map, {
        className: 'geoCoder',
        posttion: 'topleft'
      }).addTo(_map)

      // attach layers and events to map instance
      Events.map(_map)
      Events.draw(_map)
      Layer.initialize(_map)
      // add work pane
      _map.createPane('workPane').style.zIndex = 800

      Map = Sofi.Map = _map
    }
  }

  /**
   *
   * @namespace UI
   * @class UI
   *
   *
   *
   *
   */
  const UI = Sofi.UI = (function () {
    /**
     * @class Button
     */
    const Button = ({
      id,
      className,
      dataTip,
      dataEffect,
      onClick,
      iconConfig
    }) => {
      return <button
        id={id}
        key={id}
        data-tip={dataTip}
        data-effect={dataEffect}
        className={className}
        onClick={onClick}
      >
        {iconConfig}
      </button>
    }

    const ButtonGroup = (btnSet, className = 'btnGroup', style = {}) => {
      const btnGrp = []
      btnSet.map(config => btnGrp.push(Button(config)))

      return <div className={className} style={style}>
        {btnGrp}
      </div>
    }

    return {
      Button,
      ButtonGroup
    }
  })()
}(window, document))
