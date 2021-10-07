package com.prtech.spatial;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import org.apache.logging.log4j.Logger;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.prtech.spatial.geobuf.GeobufEncoder;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvGrid;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog.svCONST;
import com.prtech.svarog.SvSDITile.SDIRelation;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryCollection;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.io.WKTReader;
import com.vividsolutions.jts.operation.polygonize.Polygonizer;
import com.vividsolutions.jts.operation.union.UnaryUnionOp;

@Path("/spatial")
public class ApplicationServices {

	static int precisionScale = 2;
	private static final Logger log = SvConf.getLogger(ApplicationServices.class);

	static {
		Long d = new Long(Math.round(SvConf.getSDIPrecision() / 10));
		String s = d.toString();
		precisionScale = s.length();
	}

	/**
	 * 
	 * @param token
	 * @param objectName
	 * @param bbox
	 * @return
	 */
	@GET
	@Path("/grid/get/{objectName}")
	@Produces("application/pbf")
	public StreamingOutput getGrid(@PathParam("objectName") final String objectName) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try {
					SvGrid svg = new SvGrid(objectName);
					Set<Geometry> geomArr = svg.getInternalGeometries();
					Set<Geometry> gridResult = new HashSet<Geometry>();
					for (Geometry g : geomArr) {
						Geometry newG = SvUtil.sdiFactory.createGeometry(g);
						newG.setUserData(svg.getTileDbo((String) g.getUserData()));
						gridResult.add(newG);
					}
					enc.writeSvGeometry(gridResult);
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

	@Path("/grid/put/{token}/{objectName}/{objectId}")
	@POST
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	@Produces("application/pbf")
	public StreamingOutput saveGrid(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("objectId") final Long objectId,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try (SvGeometry svg = new SvGeometry(token)) {
					Geometry geom = getInputGeometry(formVals, null);
					SvGrid svgrid = new SvGrid(objectName);
					Set<Geometry> updates = svgrid.getRelations(geom, SDIRelation.OVERLAPS, false);
					DbDataArray modifiedGeoms = new DbDataArray();
					Iterator<Geometry> it = updates.iterator();
					while (it.hasNext()) {
						Geometry g = it.next();
						DbDataObject t = svgrid.getTileDbo((String) g.getUserData());
						if (!t.getObjectId().equals(objectId)) {
							g = g.difference(geom);
						}
						SvGeometry.setGeometry(t, g);
						modifiedGeoms.addDataItem(t);

					}
					svg.saveGeometry(modifiedGeoms);
					svgrid.setIsTileDirty(true);
					Set<Geometry> geomArr = svgrid.getInternalGeometries();
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
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
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
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
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

	Geometry getInputGeometry(MultivaluedMap<String, String> formVals, final String geometryWkt) {
		Geometry geom = null;
		if (geometryWkt != null && !geometryWkt.isEmpty()) {
			try {
				WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
				geom = wkr.read(geometryWkt);
			} catch (Exception e) {
				log.warn("Invalid WKT string", e);
			}
		}
		if (geom == null) {
			JsonObject json = null;
			json = Util.dataToJson(formVals);

			JsonElement je = json.get("GEOM");
			if (je == null)
				je = json.get("geometry");

			geom = Util.jsonToGeometry(je);
		}
		return geom;
	}

	@POST
	@Path("/geometry/get/wkt/{token}/{objectName}/{geometryWkt}")
	@Produces("application/pbf")
	public StreamingOutput getGeometryByPolyWKT(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("geometryWkt") final String geometryWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try (SvGeometry svg = new SvGeometry(token)) {
					Geometry geom = getInputGeometry(formVals, geometryWkt);
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
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
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

	@POST
	@Path("/geometry/split/preview/{token}/{objectName}/{geometryWkt}")
	@Produces("application/pbf")
	public StreamingOutput splitGeometryPreview(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("geometryWkt") final String geometryWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {

		return splitGeometry(token, objectName, geometryWkt, formVals, true);
	}

	@POST
	@Path("/geometry/split/confirm/{token}/{objectName}")
	@Produces("application/pbf")
	public StreamingOutput splitGeometryConfirm(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, MultivaluedMap<String, String> formVals,
			@Context HttpServletRequest httpRequest) {

		return splitGeometry(token, objectName, "", formVals, false);
	}

	private StreamingOutput splitGeometry(final String token, final String objectName, final String lineStringWKT,
			MultivaluedMap<String, String> formVals, boolean preview) {
		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try (SvGeometry svg = new SvGeometry(token)) {
					Geometry geom = getInputGeometry(formVals, lineStringWKT);
					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					Set<Geometry> geomArr = splitGeometryImpl((LineString) geom, layerTypeId, false, svg, preview,
							true);
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
			}
		};
	}

	private void splitGeometryDbUpdate(Set<Geometry> newGeometries, Set<Geometry> deletedGeometries, boolean autoCommit,
			SvGeometry svg) throws SvException {
		// get the previous state of autocommit
		boolean oldAutoCommit = svg.getAutoCommit();
		try (SvWriter svw = new SvWriter(svg)) {
			// set autocommit to false to ensure all deletes and saves are in single
			// transaction
			svg.setAutoCommit(false);
			DbDataObject dbo = null;
			// delete the others
			for (Geometry g : deletedGeometries) {
				dbo = (DbDataObject) g.getUserData();
				svw.deleteObject(dbo);
			}
			for (Geometry g : newGeometries) {
				dbo = (DbDataObject) g.getUserData();
				SvGeometry.setGeometry(dbo, g);
				svg.saveGeometry(dbo);
			}

			if (autoCommit)
				svg.dbCommit();
		} finally {
			svg.dbSetAutoCommit(oldAutoCommit);
		}

	}

	public Set<Geometry> splitGeometryImpl(LineString line, Long layerTypeId, boolean allowMultiGeometries,
			SvGeometry svg, boolean preview, boolean autoCommit) throws SvException {
		if (!line.isSimple())
			throw (new SvException("system.error.sdi.line_intersects_self", svCONST.systemUser, null, line));

		Set<Geometry> intersected = svg.getRelatedGeometries(line, layerTypeId, SDIRelation.INTERSECTS, null, null,
				false);
		Iterator<Geometry> iterator = intersected.iterator();
		while (iterator.hasNext()) {
			Geometry findGeom = iterator.next();
			if (!findGeom.disjoint(line.getStartPoint()) || !findGeom.disjoint(line.getEndPoint()))
				iterator.remove();
		}

		if (intersected.size() > 1 && !allowMultiGeometries)
			throw (new SvException(Sv.Exceptions.SDI_MULTIPLE_GEOMS_FOUND, svCONST.systemUser, null, line));

		Set<Geometry> result = new HashSet<>();
		for (Geometry originalGeom : intersected) {
			Geometry[] geometries = new Geometry[] { originalGeom.getBoundary(), line };
			GeometryCollection col = SvUtil.sdiFactory.createGeometryCollection(geometries);
			Geometry union = UnaryUnionOp.union(col);
			DbDataObject originalDbo = null;
			if (originalGeom.getUserData() != null && originalGeom.getUserData() instanceof DbDataObject)
				originalDbo = (DbDataObject) originalGeom.getUserData();
			Polygonizer polygonizer = new Polygonizer();
			polygonizer.add(union);
			for (Polygon poly : (Collection<Polygon>) polygonizer.getPolygons()) {
				if (originalDbo != null) {
					DbDataObject dbo = new DbDataObject(originalDbo.getObjectType());
					dbo.setValuesMap(originalDbo.getValuesMap());
					poly.setUserData(dbo);
				}
				result.add(poly);
			}

			// if the difference resulted in multipolygon, we are interested only in the
			// polygon which covers the point

		}
		if (!preview) {
			splitGeometryDbUpdate(result, intersected, autoCommit, svg);
		}
		return result;
	}

	@POST
	@Path("/geometry/merge/preview/{token}/{objectName}")
	@Produces("application/pbf")
	public StreamingOutput mergeGeometryPreview(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, MultivaluedMap<String, String> formVals,
			@Context HttpServletRequest httpRequest) {
		return mergeGeometryImpl(token, objectName, true, "", formVals);
	}

	@POST
	@Path("/geometry/merge/confirm/{token}/{objectName}/{lineStringWKT}")
	@Produces("application/pbf")
	public StreamingOutput mergeGeometryConfirm(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("lineStringWKT") final String lineStringWKT,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		return mergeGeometryImpl(token, objectName, false, lineStringWKT, formVals);
	}

	public StreamingOutput mergeGeometryImpl(final String token, final String objectName, final boolean isPreview,
			final String lineStringWKT, MultivaluedMap<String, String> formVals) {
		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try (SvGeometry svg = new SvGeometry(token)) {
					LineString lineString = (LineString) getInputGeometry(formVals, lineStringWKT);
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

	@POST
	@Path("/geometry/hole/{token}/{objectName}/{polygonWkt}")
	@Produces("application/pbf")
	public StreamingOutput createHoleGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		return holeInGeometry(token, objectName, polygonWkt, false, formVals);
	}

	@POST
	@Path("/geometry/fill/{token}/{objectName}/{polygonWkt}")
	@Produces("application/pbf")
	public StreamingOutput fillHoleGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		return holeInGeometry(token, objectName, polygonWkt, true, formVals);
	}

	public StreamingOutput holeInGeometry(final String token, final String objectName, final String polygonWkt,
			boolean remove, MultivaluedMap<String, String> formVals) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try (SvGeometry svg = new SvGeometry(token)) {
					MultiPolygon hole = (MultiPolygon) getInputGeometry(formVals, polygonWkt);

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

	@POST
	@Path("/geometry/validate/{token}/{objectName}/{polygonWkt}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response validateGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		JsonObject validationResult = new JsonObject();
		try (SvGeometry svg = new SvGeometry(token)) {
			Polygon geom = (Polygon) getInputGeometry(formVals, polygonWkt);
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
		} catch (SvException e) {
			log.error("Failed polygon validation", e);
			validationResult.addProperty("topo.validation.finished", false);
			validationResult.addProperty("topo.validation.exception", e.getMessage());
		}
		return Response.status(200).entity(validationResult.toString()).build();
	}

	@POST
	@Path("/geometry/auto_correct/{token}/{objectName}/{polygonWkt}")
	@Produces("application/pbf")
	public StreamingOutput correctGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try (SvGeometry svg = new SvGeometry(token)) {
					Geometry geom = (Polygon) getInputGeometry(formVals, polygonWkt);
					Long layerTypeId = SvCore.getTypeIdByName(objectName);

					Double maxAngle = SvParameter.getSysParam(Sv.SDI_SPIKE_MAX_ANGLE, Sv.DEFAULT_SPIKE_MAX_ANGLE);
					geom = svg.fixPolygonSpikes(geom, maxAngle);

					Integer minPointDistance = SvParameter.getSysParam(Sv.SDI_MIN_POINT_DISTANCE,
							Sv.DEFAULT_MIN_POINT_DISTANCE);
					geom = svg.fixMinVertexDistance(geom, minPointDistance);

					Integer distanceTolerance = SvParameter.getSysParam(Sv.SDI_MIN_GEOM_DISTANCE,
							Sv.DEFAULT_MIN_GEOM_DISTANCE);
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
