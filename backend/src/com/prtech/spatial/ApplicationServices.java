package com.prtech.spatial;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
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
import org.joda.time.DateTime;

import com.google.gson.JsonObject;
import com.prtech.spatial.geobuf.GeobufEncoder;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvGrid;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvSDITile;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog.svCONST;
import com.prtech.svarog.SvSDITile.SDIRelation;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.SvCharId;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.Polygon;


@Path("/spatial")
public class ApplicationServices {

	public static int PRECISION_SCALE = 2;
	static {
		int i = (int) (SvConf.getSDIPrecision() / 10);
		String s = Integer.toString(i);
		PRECISION_SCALE = s.length();
	}

	final static SvCharId parentIdKey = new SvCharId(Sv.PARENT_ID);
	static int precisionScale = PRECISION_SCALE;
	private static final Logger log = SvConf.getLogger(ApplicationServices.class);

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
					Collection<Geometry> geomArr = svg.getInternalGeometries();
					Collection<Geometry> gridResult = new ArrayList<Geometry>();
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
					Geometry geom = SpatialUtil.getInputGeometry(formVals, null);
					SvGrid svgrid = new SvGrid(objectName);
					Set<Geometry> updates = svgrid.getRelations(geom, SDIRelation.OVERLAPS, false);
					DbDataArray modifiedGeoms = new DbDataArray();
					Iterator<Geometry> it = updates.iterator();
					while (it.hasNext()) {
						Geometry g = it.next();
						DbDataObject t = svgrid.getTileDbo((String) g.getUserData());
						if (!t.getObjectId().equals(objectId)) {
							g = g.difference(geom);
						} else
							g = geom;
						if (t.getVal("GRIDTILE_ID").toString().indexOf("-") < 0)
							t.setVal("GRIDTILE_ID",
									t.getVal("GRIDTILE_ID").toString() + "-" + t.getVal("IS_BORDER").toString());

						SvGeometry.setGeometry(t, g);
						modifiedGeoms.addDataItem(t);

					}
					svg.saveGeometry(modifiedGeoms);
					svgrid.setIsTileDirty(true);
					Collection<Geometry> geomArr = svgrid.getInternalGeometries();
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
	@Path("/geometry/get/byparent/{token}/{objectName}/{parentId}")
	@Produces("application/pbf")
	public StreamingOutput getGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("parentId") final Long parentId) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
				try (SvReader svr = new SvReader(token)) {
					Long layerTypeId = SvCore.getTypeIdByName(objectName);
					svr.setIncludeGeometries(true);
					DbDataArray geomArr = svr.getObjectsByParentId(parentId, layerTypeId, null);
					enc.writeDbDataArray(geomArr);
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

	@GET
	@Path("/geometry/info/{token}/{objectName}/{x}/{y}")
	@Produces("application/pbf")
	public Response getGeometryInfo(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("x") final Double x,
			@PathParam("y") final Double y) {

		DbDataArray result = new DbDataArray();
		String errMsg = null;
		try (SvGeometry svg = new SvGeometry(token); SvReader svr = new SvReader(svg)) {
			Point point = SvUtil.sdiFactory.createPoint(new Coordinate(x, y));
			Long layerTypeId = SvCore.getTypeIdByName(objectName);
			Collection<Geometry> geomArr = svg.getRelatedGeometries(point, layerTypeId, SDIRelation.INTERSECTS, null,
					null, false);
			for (Geometry g : geomArr) {
				DbDataObject dbo = (DbDataObject) g.getUserData();
				DbDataObject dbt = SvCore.getDbt(SvCore.getDbt(dbo).getParentId());
				DbDataObject dboP = svr.getObjectById(dbo.getParentId(), dbt, null);
				if (dboP != null)
					result.addDataItem(dboP);
				if (dbo != null)
					result.addDataItem(dbo);
			}
		} catch (Exception e) {
			log.error("Error fetching geometry info", e);
			errMsg = "Failed fetching geometry set. Please see server logs";
		}
		if (errMsg != null)
			return Response.status(500).entity(errMsg).type(MediaType.APPLICATION_JSON).build();
		else
			return Response.status(200).entity(result.toSimpleJson().toString()).type(MediaType.APPLICATION_JSON)
					.build();
	}

	/**
	 * Method to generate a PBF binary response from a DbDataArray or JSON error
	 * response based on input parameters
	 * 
	 * @param result       The collection of objects with geometry. Either
	 *                     DbDataArray or List<Geometry>
	 * @param errorMessage The error message which shoul be sent with HTTP status
	 *                     500
	 * @return The HTTP response with the appropriate data.
	 */
	public Response preparePbfStream(final Object result, String errorMessage) {
		assert (result != null);
		if (errorMessage == null || errorMessage.isEmpty()) {
			StreamingOutput pbfStream = new StreamingOutput() {
				public void write(OutputStream stream) throws IOException {
					GeobufEncoder enc = new GeobufEncoder(stream, PRECISION_SCALE);
					if (result instanceof DbDataArray)
						enc.writeDbDataArray((DbDataArray) result);
					else if (result instanceof Collection<?>)
						enc.writeSvGeometry((Collection<Geometry>) result);
					else
						log.error("Result is not DbDataArray nor Collection<Geometry>! It can't be streamed");
				};
			};
			return Response.ok(pbfStream, "application/pbf").build();
		} else
			return Response.status(500).entity(errorMessage).type(MediaType.APPLICATION_JSON).build();
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
					Geometry geom = SpatialUtil.getInputGeometry(formVals, geometryWkt);
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
	@Path("/geometry/layer/cutoff/{token}/{objectName1}/{objectName2}/{x}/{y}/{parentId}")
	@Produces("application/pbf")
	public Response getGeometry(@PathParam("token") final String token,
			@PathParam("objectName1") final String objectName1, @PathParam("objectName2") final String objectName2,
			@PathParam("x") final Double x, @PathParam("y") final Double y,
			@PathParam("parentId") final Long parentId) {

		String errMsg = null;
		List<Geometry> list = new ArrayList<Geometry>();
		try (SvGeometry svg = new SvGeometry(token)) {
			Point point = SvUtil.sdiFactory.createPoint(new Coordinate(x, y));
			Long layerTypeId1 = SvCore.getTypeIdByName(objectName1);
			Long layerTypeId2 = SvCore.getTypeIdByName(objectName2);
			Collection<Geometry> set = geometryFromPoint(point, layerTypeId1, layerTypeId2, false, true, svg);

			// fix spikes or bad segments
			for (Geometry g : set) {
				DbDataObject o = (DbDataObject) g.getUserData();
				if (o != null && o.getParentId().equals(parentId)) {
					list.add(g);
					break;
				}
			}
		} catch (SvException e) {
			errMsg = e.getJsonMessage();
		} catch (Exception e) {
			errMsg = e.getMessage();
		}
		return preparePbfStream(list, errMsg);
	}

	/**
	 * Method to create a geometry from point selector over layer identified with
	 * layerTypeId. The geometries found in the base layer shall be cut off from the
	 * diff layer and the result will be provided back to the caller
	 * 
	 * @param point                The point from which we can select the source
	 *                             geometries
	 * @param layerTypeId          The layer from which we shall load the geometries
	 * @param diffLayer            The target layer over which we should do
	 *                             difference
	 * @param allowMultiGeometries Flag to allow one point to select more than one
	 *                             geometry
	 * @param allowDuplicates      If the method should return equal geometries as
	 *                             separate objects
	 * @return A collection of resulting geometries
	 * @throws SvException if allowMulti geometries is false, and the base layer has
	 *                     more than one geometry intersecting with the point, a
	 *                     Sv.Exceptions.SDI_MULTIPLE_GEOMS_FOUND exception will be
	 *                     raised
	 */
	public Collection<Geometry> geometryFromPoint(Point point, Long layerTypeId, Long diffLayer,
			boolean allowMultiGeometries, boolean allowDuplicates, SvGeometry svg) throws SvException {
		Collection<Geometry> intersected = svg.getRelatedGeometries(point, layerTypeId, SDIRelation.INTERSECTS, null,
				null, false, false, allowDuplicates);
		if (intersected.size() > 1 && !allowMultiGeometries)
			throw (new SvException(Sv.Exceptions.SDI_MULTIPLE_GEOMS_FOUND, svCONST.systemUser, null, point));
		Collection<Geometry> result = allowDuplicates ? new ArrayList<>() : new HashSet<>();
		for (Geometry originalGeom : intersected) {
			Collection<Geometry> related = svg.getRelatedGeometries(originalGeom, diffLayer, SDIRelation.INTERSECTS,
					null, null, false, false, allowDuplicates);
			for (Geometry relatedGeom : related) {
				if (originalGeom.overlaps(relatedGeom)) {
					Object ud = originalGeom.getUserData();
					originalGeom = originalGeom.difference(relatedGeom);
					originalGeom.setUserData(ud);
				}

			}
			// if the difference resulted in multipolygon, we are interested only in the
			// polygon which covers the point
			if (originalGeom.getNumGeometries() > 1)
				for (int i = 0; i < originalGeom.getNumGeometries(); i++) {
					Geometry gp = originalGeom.getGeometryN(i);
					if (gp.covers(point)) {
						originalGeom = gp;
						break;
					}

				}
			result.add(originalGeom);
		}
		return result;
	}

	@GET
	@Path("/geometry/layer/cutoff/{token}/{objectName1}/{objectName2}/{x}/{y}")
	@Produces("application/pbf")
	public Response getGeometry(@PathParam("token") final String token,
			@PathParam("objectName1") final String objectName1, @PathParam("objectName2") final String objectName2,
			@PathParam("x") final Double x, @PathParam("y") final Double y) {

		String errMsg = null;
		List<Geometry> list = new ArrayList<Geometry>();
		try (SvGeometry svg = new SvGeometry(token)) {
			Point point = SvUtil.sdiFactory.createPoint(new Coordinate(x, y));
			Long layerTypeId1 = SvCore.getTypeIdByName(objectName1);
			Long layerTypeId2 = SvCore.getTypeIdByName(objectName2);
			Collection<Geometry> set = svg.geometryFromPoint(point, layerTypeId1, layerTypeId2, false, true);
			// fix spikes or bad segments
			for (Geometry g : set) {
				list.add(svg.fixPolygonSpikes(g, 1.0));
				break;
			}
		} catch (SvException e) {
			errMsg = e.getJsonMessage();
		} catch (Exception e) {
			errMsg = e.getMessage();
		}
		return preparePbfStream(list, errMsg);
	}

	@POST
	@Path("/geometry/split/preview/{token}/{objectName}/{parentId}")
	@Produces("application/pbf")
	public Response splitGeometryPreview(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("parentId") final Long parentId,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		String errMsg = "";
		final Set<Geometry> result = new HashSet<Geometry>();
		try (SvGeometry svg = new SvGeometry(token)) {
			Geometry geom = SpatialUtil.getInputGeometry(formVals, null);
			Long layerTypeId = SvCore.getTypeIdByName(objectName);
			List<DbDataObject> toBeDeleted = new ArrayList<DbDataObject>();
			Set<Geometry> split = svg.splitGeometries((LineString) geom, layerTypeId, toBeDeleted, false, SC.PARENT_ID,
					parentId, false);
			result.addAll(split);
		} catch (SvException e) {
			errMsg = e.getJsonMessage();
		} catch (Exception e) {
			errMsg = e.getMessage();
		}
		if (errMsg.isEmpty()) {
			StreamingOutput pbfStream = new StreamingOutput() {
				public void write(OutputStream stream) throws IOException {
					GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
					enc.writeSvGeometry(result);
				};
			};
			return Response.ok(pbfStream, "application/pbf").build();
		} else
			return Response.status(500).entity(errMsg).type(MediaType.APPLICATION_JSON).build();
	}

	@POST
	@Path("/geometry/split/confirm/{token}/{objectName}/{parentId}")
	@Produces("application/pbf")
	public Response splitGeometryConfirm(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("parentId") final Long parentId,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		String errMsg = "";
		final Set<Geometry> result = new HashSet<Geometry>();
		try (SvGeometry svg = new SvGeometry(token)) {
			Geometry geom = SpatialUtil.getInputGeometry(formVals, null);
			Long layerTypeId = SvCore.getTypeIdByName(objectName);
			List<DbDataObject> toBeDeleted = new ArrayList<DbDataObject>();
			Set<Geometry> split = svg.splitGeometries((LineString) geom, layerTypeId, toBeDeleted, false, SC.PARENT_ID,
					parentId, false);
			svg.splitMergeGeometryDbUpdate(split, toBeDeleted, true);
			result.addAll(split);
		} catch (SvException e) {
			errMsg = e.getJsonMessage();
		} catch (Exception e) {
			errMsg = e.getMessage();
		}
		if (errMsg.isEmpty()) {
			StreamingOutput pbfStream = new StreamingOutput() {
				public void write(OutputStream stream) throws IOException {
					GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
					enc.writeSvGeometry(result);
				};
			};
			return Response.ok(pbfStream, "application/pbf").build();
		} else
			return Response.status(500).entity(errMsg).type(MediaType.APPLICATION_JSON).build();
	}

	@POST
	@Path("/geometry/delete/confirm/{token}/{objectId}/{objectType}/")
	@Produces("application/pbf")
	public Response deleteGeometry(@PathParam("token") final String token, @PathParam("objectId") final Long objectId,
			@PathParam("objectType") final Long objectType, MultivaluedMap<String, String> formVals,
			@Context HttpServletRequest httpRequest) {

		String errMsg = "";
		final Set<Geometry> result = new HashSet<Geometry>();
		try (SvReader svr = new SvReader(token);
				SvWriter svw = new SvWriter(svr);
				SvGeometry svg = new SvGeometry(svr)) {
			svr.setIncludeGeometries(true);
			DbDataObject dbo = svr.getObjectById(objectId, objectType, null);
			if (dbo == null)
				throw (new SvException(Sv.Exceptions.NULL_OBJECT, svr.getInstanceUser()));
			else {
				Geometry gTile = SvGeometry.getTileGeometry(SvGeometry.getCentroid(dbo));
				SvSDITile svTile = SvGeometry.getTile(objectType, (String) gTile.getUserData(), null);
				svw.deleteObject(dbo);
				svTile.setIsTileDirty(true);
			}

		} catch (SvException e) {
			errMsg = e.getJsonMessage();
		} catch (Exception e) {
			errMsg = e.getMessage();
		}
		if (errMsg.isEmpty()) {
			StreamingOutput pbfStream = new StreamingOutput() {
				public void write(OutputStream stream) throws IOException {
					GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
					enc.writeSvGeometry(result);
				};
			};
			return Response.ok(pbfStream, "application/pbf").build();
		} else
			return Response.status(500).entity(errMsg).type(MediaType.APPLICATION_JSON).build();

//		return mergeGeometryImpl(token, objectName, false, lineStringWKT, formVals);

	}

	@POST
	@Path("/geometry/merge/confirm/{token}/{objectName}/{parentId}")
	@Produces("application/pbf")
	public Response mergeGeometryConfirm(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("parentId") final Long parentId,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {

		String errMsg = "";
		final Set<Geometry> result = new HashSet<Geometry>();
		try (SvGeometry svg = new SvGeometry(token)) {
			LineString lineString = (LineString) SpatialUtil.getInputGeometry(formVals, null);
			ArrayList<Point> p = new ArrayList<>();
			for (Coordinate c : lineString.getCoordinates())
				p.add(SvUtil.sdiFactory.createPoint(c));
			Long layerTypeId = SvCore.getTypeIdByName(objectName);

			List<DbDataObject> toBeDeleted = new ArrayList<DbDataObject>();
			Geometry split = svg.mergeGeometries(p, layerTypeId, toBeDeleted, false, SC.PARENT_ID, parentId, false);
			result.add(split);
			svg.splitMergeGeometryDbUpdate(result, toBeDeleted, true);

		} catch (SvException e) {
			errMsg = e.getJsonMessage();
		} catch (Exception e) {
			errMsg = e.getMessage();
		}
		if (errMsg.isEmpty()) {
			StreamingOutput pbfStream = new StreamingOutput() {
				public void write(OutputStream stream) throws IOException {
					GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
					enc.writeSvGeometry(result);
				};
			};
			return Response.ok(pbfStream, "application/pbf").build();
		} else
			return Response.status(500).entity(errMsg).type(MediaType.APPLICATION_JSON).build();

//		return mergeGeometryImpl(token, objectName, false, lineStringWKT, formVals);

	}

	@POST
	@Path("/geometry/merge/preview/{token}/{objectName}/{parentId}")
	@Produces("application/pbf")
	public Response mergeGeometryPreview(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("parentId") final Long parentId,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {

		String errMsg = "";
		final Set<Geometry> result = new HashSet<Geometry>();
		try (SvGeometry svg = new SvGeometry(token)) {
			LineString lineString = (LineString) SpatialUtil.getInputGeometry(formVals, null);
			ArrayList<Point> p = new ArrayList<>();
			for (Coordinate c : lineString.getCoordinates())
				p.add(SvUtil.sdiFactory.createPoint(c));
			Long layerTypeId = SvCore.getTypeIdByName(objectName);

			List<DbDataObject> toBeDeleted = new ArrayList<DbDataObject>();
			Geometry split = svg.mergeGeometries(p, layerTypeId, toBeDeleted, false, SC.PARENT_ID, parentId, false);
			result.add(split);

		} catch (SvException e) {
			errMsg = e.getJsonMessage();
		} catch (Exception e) {
			errMsg = e.getMessage();
		}
		if (errMsg.isEmpty()) {
			StreamingOutput pbfStream = new StreamingOutput() {
				public void write(OutputStream stream) throws IOException {
					GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
					enc.writeSvGeometry(result);
				};
			};
			return Response.ok(pbfStream, "application/pbf").build();
		} else
			return Response.status(500).entity(errMsg).type(MediaType.APPLICATION_JSON).build();

//		return mergeGeometryImpl(token, objectName, false, lineStringWKT, formVals);

	}

	@POST
	@Path("/geometry/hole/{token}/{objectName}")
	@Produces("application/pbf")
	public Response createHoleGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		return holeInGeometry(token, objectName, Sv.EMPTY_STRING, false, formVals, null);
	}

	@POST
	@Path("/geometry/hole/{token}/{objectName}/{parentId}")
	@Produces("application/pbf")
	public Response createHoleGeometryByParent(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("parentId") final Long parentId,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		return holeInGeometry(token, objectName, Sv.EMPTY_STRING, false, formVals, parentId);
	}

	@POST
	@Path("/geometry/fill/{token}/{objectName}")
	@Produces("application/pbf")
	public Response fillHoleGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		return holeInGeometry(token, objectName, Sv.EMPTY_STRING, true, formVals, null);
	}

	public boolean alignPolyGeom(SvGeometry svg, DbDataObject oldDbo, Geometry newGeom) {
		Geometry oldGeometry = SvGeometry.getGeometry(oldDbo);
		boolean isGeomUpdated = true;
		if (oldDbo.getObjectId() > 0L && oldGeometry != null) {
			if (oldGeometry.getGeometryType().equals("MultiPolygon"))
				svg.alignMultiPolygons((MultiPolygon) oldGeometry, (MultiPolygon) newGeom);
			else
				svg.alignPolygon((Polygon) oldGeometry, (Polygon) newGeom);
			if (oldGeometry.equalsTopo(newGeom))
				isGeomUpdated = false;

		}
		newGeom.setUserData(oldDbo);
		return isGeomUpdated;
	}

	/**
	 * Method to verify and align a geometry with the old object (transforming a
	 * polygon from/to WGS can create a few centimeters distorsion in the vertices
	 * and thats why we need to align. Besides alignmnt, we remove duplicate points,
	 * we cut angles smaller than 1% and we prevent or allow overlaps with the other
	 * polygons of the parent
	 * 
	 * @param geom          The geometry to be prepared
	 * @param oldDbo        The old data object attached to the geometry
	 * @param svg           The SvGeometry used for the operations
	 * @param overlapParent Flag if we want to cutoff the geometries from the same
	 *                      parent
	 * @return
	 * @throws SvException
	 */
	public boolean prepareGeometry(Geometry geom, DbDataObject oldDbo, SvGeometry svg, boolean overlapParent)
			throws SvException {

		// Init geom

		if (CC.MULTIPOLYGON.equalsIgnoreCase(geom.getGeometryType()))
			geom = ((MultiPolygon) geom).getGeometryN(0);
		else if (!CC.POLYGON.equalsIgnoreCase(geom.getGeometryType()))
			throw (new SvException(CC.NON_POLYGON_GEOM, svg.getInstanceUser()));

		geom = svg.deduplicatePolygon((Polygon) geom);

		boolean isGeomUpdated = alignPolyGeom(svg, oldDbo, geom);

		boolean hasSpikes = true;
		// data to geom
		Geometry g = geom;
		if (g.isEmpty() || g.getArea() < 1)
			g = null;
		else
			while (hasSpikes) {
				try {
					svg.testPolygonSpikes(g, 1.0);
					hasSpikes = false;
				} catch (SvException e) {
					if (e.getLabelCode().equals(Sv.Exceptions.SDI_SPIKE_DETECTED)) {
						g = svg.fixPolygonSpikes(g, 1.0);
					}
				}
			}

		geom.setUserData(oldDbo); // append spatial control dbo as user
		// data to geom

		if (g != null) {
			SvGeometry.setGeometry(oldDbo, g);
		} else {
			SvGeometry.setGeometry(oldDbo, geom);
		}
		return isGeomUpdated;
	}

	@POST
	@Path("/geometry/fill/{token}/{objectName}/{parentId}")
	@Produces("application/pbf")
	public Response fillHoleGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("parentId") final Long parentId,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		return holeInGeometry(token, objectName, Sv.EMPTY_STRING, true, formVals, parentId);
	}

	public Response holeInGeometry(final String token, final String objectName, final String polygonWkt, boolean remove,
			MultivaluedMap<String, String> formVals, Long parentId) {
		String errMsg = "";

		final Set<Geometry> result = new HashSet<Geometry>();
		try (SvGeometry svg = new SvGeometry(token)) {
			Long layerTypeId = SvCore.getTypeIdByName(objectName);
			Polygon hole = (Polygon) SpatialUtil.getInputGeometry(formVals, polygonWkt);
			SvCharId filterKey = parentId != null ? ApplicationServices.parentIdKey : null;

			Geometry g = svg.holeInPolygon(hole, layerTypeId, remove, filterKey, parentId, false, true, null);
			result.add(g);
		} catch (Exception e) {
			errMsg = ((SvException) e).getJsonMessage();
		}
		if (errMsg.isEmpty()) {
			StreamingOutput pbfStream = new StreamingOutput() {
				public void write(OutputStream stream) throws IOException {
					GeobufEncoder enc = new GeobufEncoder(stream, precisionScale);
					enc.writeSvGeometry(result);
				};
			};
			return Response.ok(pbfStream, "application/pbf").build();
		} else
			return Response.status(500).entity(errMsg).type(MediaType.APPLICATION_JSON).build();

	}

	@POST
	@Path("/geometry/validate/{token}/{objectName}/{polygonWkt}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response validateGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("polygonWkt") final String polygonWkt,
			MultivaluedMap<String, String> formVals, @Context HttpServletRequest httpRequest) {
		JsonObject validationResult = new JsonObject();
		try (SvGeometry svg = new SvGeometry(token)) {
			Polygon geom = (Polygon) SpatialUtil.getInputGeometry(formVals, polygonWkt);
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
			Double minPointDistance = SvParameter.getSysParam(Sv.SDI_MIN_POINT_DISTANCE, Sv.DEFAULT_MIN_POINT_DISTANCE);
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
					Geometry geom = (Polygon) SpatialUtil.getInputGeometry(formVals, polygonWkt);
					Long layerTypeId = SvCore.getTypeIdByName(objectName);

					Double maxAngle = SvParameter.getSysParam(Sv.SDI_SPIKE_MAX_ANGLE, Sv.DEFAULT_SPIKE_MAX_ANGLE);
					geom = svg.fixPolygonSpikes(geom, maxAngle);

					Double minPointDistance = SvParameter.getSysParam(Sv.SDI_MIN_POINT_DISTANCE,
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
