package com.prtech.spatial;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import org.apache.logging.log4j.Logger;

import com.google.gson.JsonObject;
import com.prtech.spatial.geobuf.GeobufEncoder;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog.SvSDITile.SDIRelation;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKTReader;

@Path("/spatial")
public class ApplicationServices {
	private static final Logger log = SvConf.getLogger(ApplicationServices.class);

	/**
	 * 
	 * @param token
	 * @param objectName
	 * @param bbox
	 * @return
	 */
	@GET
	@Path("/geometry/get/bbox/{token}/{objectName}/{bbox}")
	@Produces("application/pbf")
	public StreamingOutput getGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("bbox") final String bbox) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					Set<Geometry> geomArr = svg.getGeometriesByBBOX(SvCore.getTypeIdByName(objectName), bbox);
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}

	@GET
	@Path("/geometry/get/point/{token}/{objectName}/{x}/{y}")
	@Produces("application/pbf")
	public StreamingOutput getGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("x") final Double x,
			@PathParam("y") final Double y) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					Point point = SvUtil.sdiFactory.createPoint(new Coordinate(x, y));
					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					Set<Geometry> geomArr = svg.getRelatedGeometries(point, layerTypeId, SDIRelation.INTERSECTS, null,
							null, false);
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}

	@GET
	@Path("/geometry/get/wkt/{token}/{objectName}/{geometryWkt}")
	@Produces("application/pbf")
	public StreamingOutput getGeometryByPolyWKT(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("geometryWkt") final String geometryWkt) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
					Geometry geom = wkr.read(geometryWkt);
					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					Set<Geometry> geomArr = svg.getRelatedGeometries(geom, layerTypeId, SDIRelation.INTERSECTS, null,
							null, false);
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}

	@GET
	@Path("/geometry/layer/cutoff/{token}/{objectName1}/{objectName2}/{x}/{y}")
	@Produces("application/pbf")
	public StreamingOutput getGeometry(@PathParam("token") final String token,
			@PathParam("objectName1") final String objectName1, @PathParam("objectName2") final String objectName2,
			@PathParam("x") final Double x, @PathParam("y") final Double y) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					Point point = SvUtil.sdiFactory.createPoint(new Coordinate(x, y));
					Long layerTypeId1 = SvCore.getTypeIdByName(objectName1);
					Long layerTypeId2 = SvCore.getTypeIdByName(objectName2);
					Set<Geometry> geomArr = svg.geometryFromPoint(point, layerTypeId1, layerTypeId2, false);
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}

	@GET
	@Path("/geometry/split/{token}/{objectName}/{lineStringWKT}")
	@Produces("application/pbf")
	public StreamingOutput splitGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("lineStringWKT") final String lineStringWKT) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
					LineString lineString = (LineString) wkr.read(lineStringWKT);
					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					Set<Geometry> geomArr = svg.splitGeometry(lineString, layerTypeId, false);
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}

	@GET
	@Path("/geometry/merge/preview/{token}/{objectName}/{lineStringWKT}")
	@Produces("application/pbf")
	public StreamingOutput splitGeometryPreview(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("saveToDB") final String saveToDB,
			@PathParam("lineStringWKT") final String lineStringWKT) {
		return splitGeometryImpl(token, objectName, true, lineStringWKT);
	}

	@GET
	@Path("/geometry/merge/confirm/{token}/{objectName}/{lineStringWKT}")
	@Produces("application/pbf")
	public StreamingOutput splitGeometryConfirm(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("saveToDB") final String saveToDB,
			@PathParam("lineStringWKT") final String lineStringWKT) {
		return splitGeometryImpl(token, objectName, false, lineStringWKT);
	}

	public StreamingOutput splitGeometryImpl(final String token, final String objectName, final boolean isPreview,
			final String lineStringWKT) {
		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
					LineString lineString = (LineString) wkr.read(lineStringWKT);
					ArrayList<Point> p = new ArrayList<>();
					for (Coordinate c : lineString.getCoordinates())
						p.add(SvUtil.sdiFactory.createPoint(c));
					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					Set<Geometry> geomArr = new HashSet<>();
					geomArr.add(svg.mergeGeometries(p, layerTypeId, false, isPreview, true));
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed merging geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}

	@GET
	@Path("/geometry/hole/{token}/{objectName}/{polygonWkt}")
	@Produces("application/pbf")
	public StreamingOutput createHoleGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt) {
		return holeInGeometry(token, objectName, polygonWkt, false);
	}

	@GET
	@Path("/geometry/fill/{token}/{objectName}/{polygonWkt}")
	@Produces("application/pbf")
	public StreamingOutput fillHoleGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt) {
		return holeInGeometry(token, objectName, polygonWkt, true);
	}

	public StreamingOutput holeInGeometry(final String token, final String objectName, final String polygonWkt,
			boolean remove) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
					Polygon hole = (Polygon) wkr.read(polygonWkt);

					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					Set<Geometry> geomArr = new HashSet<>();
					geomArr.add(svg.holeInPolygon(hole, layerTypeId, remove));
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed merging geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}

	@GET
	@Path("/geometry/validate/{token}/{objectName}/{polygonWkt}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response validateGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt) {
		JsonObject validationResult = new JsonObject();
		WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
		try (SvGeometry svg = new SvGeometry(token)) {
			Polygon geom = (Polygon) wkr.read(polygonWkt);
			try {
				svg.verifyBounds(geom);
				validationResult.addProperty("topo.check.pass", true);
			} catch (SvException ex) {
				validationResult.addProperty("topo.check.pass", false);
				validationResult.addProperty("topo.check.reason", ex.getLabelCode());
			}
			Double maxAngle = SvParameter.getSysParam(Sv.SDI_SPIKE_MAX_ANGLE, Sv.DEFAULT_SPIKE_MAX_ANGLE);
			try {
				svg.testPolygonSpikes(geom, maxAngle);
				validationResult.addProperty("topo.spikes.pass", true);
			} catch (SvException ex) {
				validationResult.addProperty("topo.spikes.pass", false);
				validationResult.addProperty("topo.spikes.reason", ex.getLabelCode());
				validationResult.addProperty("topo.spikes.min_angle", maxAngle);
			}
			Integer minPointDistance = SvParameter.getSysParam(Sv.SDI_MIN_POINT_DISTANCE,
					Sv.DEFAULT_MIN_POINT_DISTANCE);
			try {

				svg.testMinVertexDistance(geom, minPointDistance);
				validationResult.addProperty("topo.vertex_distance.pass", true);
			} catch (SvException ex) {
				validationResult.addProperty("topo.vertex_distance.pass", false);
				validationResult.addProperty("topo.vertex_distance.reason", ex.getLabelCode());
				validationResult.addProperty("topo.geometry_distance.tolerance", minPointDistance);
			}
			Integer distanceTolerance = SvParameter.getSysParam(Sv.SDI_MIN_GEOM_DISTANCE, Sv.DEFAULT_MIN_GEOM_DISTANCE);
			try {
				Long layerTypeId = SvCore.getTypeIdByName(objectName);
				svg.testGeomDistance(geom, layerTypeId, distanceTolerance);
				validationResult.addProperty("topo.geometry_distance.pass", true);
			} catch (SvException ex) {
				validationResult.addProperty("topo.geometry_distance.pass", false);
				validationResult.addProperty("topo.geometry_distance.reason", ex.getLabelCode());
				validationResult.addProperty("topo.geometry_distance.tolerance", distanceTolerance);
			}
			validationResult.addProperty("topo.validation.finished", true);
		} catch (ParseException | SvException e) {
			log.error("Failed polygon validation", e);
			validationResult.addProperty("topo.validation.finished", false);
			validationResult.addProperty("topo.validation.exception", e.getMessage());
		}
		return Response.status(200).entity(validationResult.toString()).build();
	}

	@GET
	@Path("/geometry/auto_correct/{token}/{objectName}/{lineStringWKT}")
	@Produces("application/pbf")
	public StreamingOutput correctGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt) {
			
		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try (SvGeometry svg = new SvGeometry(token)) {
					
					WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
					Geometry geom = (Polygon) wkr.read(polygonWkt);
					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					
					Double maxAngle = SvParameter.getSysParam(Sv.SDI_SPIKE_MAX_ANGLE, Sv.DEFAULT_SPIKE_MAX_ANGLE);
					geom = svg.fixPolygonSpikes(geom, maxAngle);

					Integer minPointDistance = SvParameter.getSysParam(Sv.SDI_MIN_POINT_DISTANCE,
							Sv.DEFAULT_MIN_POINT_DISTANCE);
					geom = svg.fixMinVertexDistance(geom, minPointDistance);

					Integer distanceTolerance = SvParameter.getSysParam(Sv.SDI_MIN_GEOM_DISTANCE, Sv.DEFAULT_MIN_GEOM_DISTANCE);
					geom = svg.fixGeomDistance(geom, layerTypeId, distanceTolerance);
					
					Set<Geometry> geoms = new HashSet<>();
					enc.writeSvGeometry(geoms);
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}
}
