package com.prtech.spatial;

import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.core.MultivaluedMap;

import org.apache.commons.io.FilenameUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.joda.time.DateTime;
import org.locationtech.proj4j.CRSFactory;
import org.locationtech.proj4j.CoordinateReferenceSystem;
import org.locationtech.proj4j.CoordinateTransform;
import org.locationtech.proj4j.CoordinateTransformFactory;
import org.locationtech.proj4j.ProjCoordinate;

import com.drew.imaging.FileType;
import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.prtech.perun.PerunUtil;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvSDITile.SDIRelation;
import com.prtech.svarog.SvSecurity;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog.svCONST;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbQueryObject;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryCollection;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Lineal;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.Polygonal;
import org.locationtech.jts.geom.Puntal;
import org.locationtech.jts.geom.prep.PreparedGeometry;
import org.locationtech.jts.geom.prep.PreparedLineString;
import org.locationtech.jts.geom.prep.PreparedPoint;
import org.locationtech.jts.geom.prep.PreparedPolygon;
import org.locationtech.jts.io.WKTReader;
import com.prtech.svarog_geojson.GeoJsonReader;
import com.prtech.svarog_geojson.GeoJsonWriter;

public class SpatialUtil extends PerunUtil {
	// dms regex pattern to match string format
	static final Pattern DMS_PATTERN = Pattern
			.compile("(-?)([0-9]{1,2})°([0-5]?[0-9])'([0-5]?[0-9](\\.[0-9]*)?)\"([NS])\\s"
					+ "(-?)([0-1]?[0-9]{1,2})°([0-5]?[0-9])'([0-5]?[0-9](\\.[0-9]*)?)\"([EW])");
	/**
	 * Array of Svarog internal layers
	 */
	private static DbDataArray layers;

	/**
	 * Array of External (WMS) layers
	 */
	private static DbDataArray externalLayers;

	public static Boolean excludeField(String fieldName) {
		if ("PKID".equalsIgnoreCase(fieldName) || "GUI_METADATA".equalsIgnoreCase(fieldName)
				|| "CENTROID".equalsIgnoreCase(fieldName) || "GEOM".equalsIgnoreCase(fieldName)) {
			return false;
		}

		return true;
	}

	void topologyCheck(DbDataArray result) throws SvException {
		double minPointDistance = SvParameter.getSysParam(Sv.SDI_MIN_POINT_DISTANCE, Sv.DEFAULT_MIN_POINT_DISTANCE);
		for (DbDataObject prc : result.getItems()) {
			Geometry g = SvGeometry.getGeometry(prc);
			if (!g.isSimple() || !g.isValid() || hasDuplicates((Polygon) g, minPointDistance))
				prc.setStatus(CC.TOPO_ERR);
		}
	}

	public static DbDataObject addValueToDataObject(DbDataObject dbo, String fieldName, DbDataObject fieldObject,
			JsonObject jsonData) {

		String fieldType = fieldObject.getVal("FIELD_TYPE").toString();
		Long scale = (Long) fieldObject.getVal("FIELD_SCALE");
		Gson gson = new Gson();
		JsonObject jsonObjRet = jsonData;
		JsonObject guiMetadata = null;

		try {
			if (fieldObject.getVal("GUI_METADATA") != null) {
				guiMetadata = gson.fromJson(fieldObject.getVal("GUI_METADATA").toString(), JsonObject.class);
			}
		} catch (Exception e) {
			log4j.debug(e);
		}

		if (guiMetadata != null && guiMetadata.has("react")) {
			JsonObject jsonreactGUI = (JsonObject) guiMetadata.get("react");
			if (jsonreactGUI != null && jsonreactGUI.has("grouppath"))
				jsonObjRet = (JsonObject) jsonData.get(jsonreactGUI.get("grouppath").getAsString());
		}

		if (jsonObjRet != null) {
			if (jsonObjRet.has(fieldName)) {
				switch (fieldType) {
				case "NUMERIC":
					if (scale == null || scale <= 0) {
						Long tmpLong = jsonObjRet.get(fieldName).getAsLong();
						dbo.setVal(fieldName, tmpLong);
					} else {
						Double tmpDouble = jsonObjRet.get(fieldName).getAsDouble();
						dbo.setVal(fieldName, tmpDouble);
					}
					break;
				case "NVARCHAR":
					dbo.setVal(fieldName, jsonObjRet.get(fieldName).getAsString());
					break;
				case "BOOLEAN":
					dbo.setVal(fieldName, jsonObjRet.get(fieldName).getAsBoolean());
					break;
				case "DATE":
					DateTime date = new DateTime(jsonObjRet.get(fieldName).getAsString());
					dbo.setVal(fieldName, date);
					break;
				case "TIMESTAMP":
				case "DATETIME":
					DateTime pickDate = new DateTime(jsonObjRet.get(fieldName).getAsString());
					dbo.setVal(fieldName, pickDate);
					break;
				default:
				}
			} else
				dbo.setVal(fieldName, null);
		}

		return dbo;
	}

	/**
	 * Method to transform a GeometryCollection to DbDataArray of DbDataObject based
	 * on the typeId, which identifies the type to enable matching of the metatadata
	 * fields
	 * 
	 * @param geom   The geometry collection from which the DbDataObjects will be
	 *               created
	 * @param typeId The ID of the object type which will be created
	 * @return a DbDataArray containing all generated objects including the
	 *         geometries
	 */
	public static DbDataArray transformGeomCollection(GeometryCollection geom, Long typeId) {
		DbDataArray db = new DbDataArray();

		for (int i = 0; i < geom.getNumGeometries(); i++) {
			Geometry g = geom.getGeometryN(i);
			DbDataObject dbo = new DbDataObject(typeId);
			if (g.getUserData() != null)
				for (Map.Entry<String, Object> e : ((Map<String, Object>) g.getUserData()).entrySet())
					dbo.setVal(e.getKey(), e.getValue());

			g.setUserData(dbo);
			SvGeometry.setGeometry(dbo, g);
			SpatialUtil.calculateGeometryDerivatives(dbo);
			db.addDataItem(dbo);
		}
		return db;
	}

	public static boolean geometryRelates(PreparedGeometry g, Geometry geom, SDIRelation relation) {
		boolean relates = false;
		switch (relation) {
		case INTERSECTS:
			relates = g.intersects(geom);
			break;
		case COVEREDBY:
			relates = g.coveredBy(geom);
			break;
		case CONTAINS:
			relates = g.contains(geom);
			break;
		case CROSSES:
			relates = g.crosses(geom);
			break;
		case COVERS:
			relates = g.covers(geom);
			break;
		case DISJOINT:
			relates = g.disjoint(geom);
			break;
		case EQUALS:
			relates = g.equals(geom);
			break;
		case OVERLAPS:
			relates = g.overlaps(geom);
			break;
		case WITHIN:
			relates = g.within(geom);
			break;
		case TOUCHES:
			relates = g.touches(geom);
			break;
		default:
			relates = false;
		}
		return relates;
	}

	/**
	 * Method to calculate the relations of two geometry collections. Each geometry
	 * of the left collection (active) will be tested if it relates to each geometry
	 * in the right collection (passive). The method will return list of geometry
	 * indexes, which can be used to get the needed Geometry. The param
	 * returnLefthand specifies which index will be returned, if returnLefthand is
	 * true, the method will return the list of active geometries (the left hand
	 * side). If the parameter is false, it will return the indices of passive
	 * geometries
	 * 
	 * @param active              The list of geometries on which the relation
	 *                            method will be invoked
	 * @param passive             The list of geometries which will be used as
	 *                            parameter to the relation operation
	 * @param relation            The relation which should be tested (enum
	 *                            com.prtech.svarog.SvSDITile.SDIRelation)
	 * @param returnLefthandIndex The flag to signify which of the two indexes will
	 *                            be returned
	 * 
	 * @return The list of collection indices resulting from the overlap
	 */
	public static Set<Integer> collectionOverlap(GeometryCollection active, GeometryCollection passive,
			SDIRelation relation, Boolean returnLefthandIndex) {
		Set<Integer> relationIndex = new HashSet<>();
		for (int i = 0; i < active.getNumGeometries(); i++) {
			Geometry left = active.getGeometryN(i);
			PreparedGeometry pgleft = getPreparedGeom(left);
			for (int j = 0; j < passive.getNumGeometries(); j++) {
				Geometry right = passive.getGeometryN(j);
				if (geometryRelates(pgleft, right, relation))
					relationIndex.add(returnLefthandIndex ? i : j);
			}

		}
		return relationIndex;

	}
	public static String geometryToSvg(Geometry geom, String fill, String stroke, int width)
	{
		double mx = geom.getEnvelopeInternal().getMinX();
		double my = geom.getEnvelopeInternal().getMinY();

		double mxx = geom.getEnvelopeInternal().getMaxX();
		double mxy = geom.getEnvelopeInternal().getMaxY();

		StringBuilder sbr = new StringBuilder();
		sbr.append("<svg height=\""+((int) (mxy-my))+"\" width=\""+((int)(mxx-mx))+"\">");
		
		sbr.append("<polygon points=\"");
		for(int i=0; i<geom.getCoordinates().length;i++)
		{
			Coordinate c = geom.getCoordinates()[i];
			sbr.append(((int) (c.x-mx))+","+((int)(c.y-my))+" ");

		}
		sbr.append("\" style=\"fill:"+fill+";stroke:"+stroke+";stroke-width:"+width+"\" /></svg>");
		return sbr.toString();
	}
	/**
	 * Helper method to prepare a geometry based on the type
	 * 
	 * @param g The original geometry
	 * @return The prepared Geometry
	 */
	public static PreparedGeometry getPreparedGeom(Geometry g) {
		PreparedGeometry pg = null;
		if (g instanceof Polygonal)
			pg = new PreparedPolygon((Polygonal) g);
		else if (g instanceof Lineal)
			pg = new PreparedLineString((Lineal) g);
		else if (g instanceof Puntal)
			pg = new PreparedPoint((Puntal) g);

		return pg;
	}

	/**
	 * Method to extract the centroids of geometries in a GeometryCollection and
	 * return a new GeometryCollection containing points. The centroid index,
	 * corresponds to the geometry index
	 * 
	 * @param gcl The collection of geometries
	 * @return
	 */
	static GeometryCollection extractCentroids(GeometryCollection gcl) {
		Geometry[] centroids = new Geometry[gcl.getNumGeometries()];
		for (int i = 0; i < gcl.getNumGeometries(); i++) {
			Geometry g = gcl.getGeometryN(i);
			centroids[i] = g.getCentroid();
		}

		return SvUtil.sdiFactory.createGeometryCollection(centroids);

	}

	public static JsonObject dataToJson(MultivaluedMap<String, String> data) {
		String formData = "";
		JsonObject json = null;

		try {
			Gson gson = new Gson();
			// handle empty, prep json, create data
			for (Entry<String, List<String>> entry : data.entrySet()) {
				if (entry.getKey() != null && !entry.getKey().isEmpty()) {
					String key = entry.getKey();
					formData = key;
				}
			}

			json = gson.fromJson(formData, JsonObject.class);
		} catch (Exception e) {
			// TODO: handle exception
		}

		return json;
	}

	public static String geometryToJson(Geometry g) {
		GeoJsonWriter gjw = new GeoJsonWriter();
		return gjw.write(g);
	}

	public static Geometry jsonToGeometry(JsonElement el) {
		Geometry geom = null;

		try {
			GeometryFactory gf = SvUtil.sdiFactory;
			GeoJsonReader gjr = new GeoJsonReader(gf);
			geom = gjr.read(el.toString());

			String polyType = geom.getGeometryType();
			// if ("Polygon".equalsIgnoreCase(polyType))
			// geom = gf.createMultiPolygon(new Polygon[] { (Polygon) geom });
		} catch (Exception e) {
			log4j.error("Failed parsing geometry. " + e);
		}

		return geom;
	}

	public static void calculateGeometryDerivatives(DbDataObject dbo) {
		Geometry geom = SvGeometry.getGeometry(dbo);
		DecimalFormat df = new DecimalFormat("#.####");

		dbo.setVal("AREA", Double.parseDouble(df.format(geom.getArea()).replace(",", ".")));
		dbo.setVal("PERIMETER", Double.parseDouble(df.format(geom.getLength()).replace(",", ".")));
	}

	static FileType getFileTypeByExt(String filename) {
		if (filename == null)
			return null;
		String extension = FilenameUtils.getExtension(filename);
		for (String ex : FileType.Jpeg.getAllExtensions()) {
			if (ex.equals(extension))
				return FileType.Jpeg;
		}
		for (String ex : FileType.Png.getAllExtensions()) {
			if (ex.equals(extension))
				return FileType.Png;
		}
		for (String ex : FileType.Tiff.getAllExtensions()) {
			if (ex.equals(extension))
				return FileType.Tiff;
		}
		for (String ex : FileType.Bmp.getAllExtensions()) {
			if (ex.equals(extension))
				return FileType.Bmp;
		}
		return null;

	}

	public static ProjCoordinate readImgCoordinates(InputStream fileInputStream, long streamLength,
			CoordinateReferenceSystem fileCRS, CoordinateReferenceSystem systemCRS)
			throws SvException, ImageProcessingException, IOException {
		return readImgCoordinates(fileInputStream, streamLength, fileCRS, systemCRS, null);
	}

	public static ProjCoordinate readImgCoordinates(InputStream fileInputStream, long streamLength,
			CoordinateReferenceSystem fileCRS, CoordinateReferenceSystem systemCRS, String filename)
			throws SvException, ImageProcessingException, IOException {

		FileType ft = getFileTypeByExt(filename);
		Metadata metadata = null;
		if (ft == null)
			metadata = ImageMetadataReader.readMetadata(fileInputStream, streamLength);
		else
			metadata = ImageMetadataReader.readMetadata(fileInputStream, streamLength, ft);

		String latRef = "";
		String longRef = "";
		String latDMS = "";
		String longDMS = "";
		for (Directory directory : metadata.getDirectories()) {
			if ("GPS".contentEquals(directory.getName()))
				for (Tag tag : directory.getTags()) {
					String tname = tag.getTagName();
					switch (tname) {
					case "GPS Latitude Ref":
						latRef = tag.getDescription();
						break;
					case "GPS Longitude Ref":
						longRef = tag.getDescription();
						break;
					case "GPS Latitude":
						latDMS = tag.getDescription();
						break;
					case "GPS Longitude":
						longDMS = tag.getDescription();
						break;
					}
				}
			if (directory.hasErrors()) {
				for (String error : directory.getErrors()) {
					System.err.format("ERROR: %s", error);
				}
			}

		}
		ProjCoordinate result = null;
		String dms = latDMS.replace(" ", "") + latRef + " " + longDMS.replace(" ", "") + longRef;
		if (!(latDMS.isEmpty() || longDMS.isEmpty())) {
			try {
				double[] d = convert(dms);
				CRSFactory crsFactory = new CRSFactory();
				if (fileCRS == null)
					fileCRS = (CoordinateReferenceSystem) crsFactory.createFromName("epsg:4326");
				if (systemCRS == null)
					systemCRS = (CoordinateReferenceSystem) crsFactory.createFromName("epsg:" + SvConf.getSDISrid());

				CoordinateTransformFactory ctFactory = new CoordinateTransformFactory();
				CoordinateTransform wgsToUtm = (CoordinateTransform) ctFactory.createTransform(fileCRS, systemCRS);
				// `result` is an output parameter to `transform()`
				result = new ProjCoordinate();
				wgsToUtm.transform(new ProjCoordinate(d[1], d[0]), result);
			} catch (Exception e) {
				log4j.error("Error reading exif GPS coordinates", e);
				result = null;
			}
		}
		return result;
	}

	private static double toDouble(Matcher m, int offset) {
		int sign = "".equals(m.group(1 + offset)) ? 1 : -1;
		double degrees = Double.parseDouble(m.group(2 + offset));
		double minutes = Double.parseDouble(m.group(3 + offset));
		double seconds = Double.parseDouble(m.group(4 + offset));
		String ref = m.group(6 + offset);
		int direction = "NE".contains(ref) ? 1 : -1;

		return sign * direction * (degrees + minutes / 60 + seconds / 3600);
	}

	public static double[] convert(String dms) {
		Matcher m = DMS_PATTERN.matcher(dms.trim());

		if (m.matches()) {
			double latitude = toDouble(m, 0);
			double longitude = toDouble(m, 6);

			if ((Math.abs(latitude) > 90) || (Math.abs(longitude) > 180)) {
				throw new NumberFormatException("Invalid latitude or longitude");
			}

			return new double[] { latitude, longitude };
		} else {
			throw new NumberFormatException("Malformed degrees/minutes/seconds/direction coordinates");
		}
	}

	public static Geometry getInputGeometry(MultivaluedMap<String, String> formVals, final String geometryWkt) {
		Geometry geom = null;
		if (geometryWkt != null && !geometryWkt.isEmpty()) {
			try {
				WKTReader wkr = new WKTReader(SvUtil.sdiFactory);
				geom = wkr.read(geometryWkt);
			} catch (Exception e) {
				log4j.warn("Invalid WKT string", e);
			}
		}
		if (geom == null) {
			JsonObject json = null;
			json = dataToJson(formVals);

			JsonElement je = json.get("GEOM");
			if (je == null)
				je = json.get("geometry");

			geom = jsonToGeometry(je);
		}
		return geom;
	}

	/**
	 * Method to deduplicate vertices
	 * 
	 * @param line   The existing line string
	 * @param isRing Flag to signify that the string is ring and we guarantee that
	 *               we'll always close it
	 * @return Deduplicated line string or the same object if the line does not have
	 *         duplicate vertices
	 */
	public static LineString deduplicateLineString(LineString line, boolean isRing, double tolerance) {
		int dedupEnd = line.getCoordinates().length;

		ArrayList<Coordinate> newCoords = new ArrayList<>(line.getCoordinates().length - 1);
		Coordinate prevCoord, cuurentCoord = null;
		for (int i = 1; i < dedupEnd; i++) {
			prevCoord = line.getCoordinates()[i - 1];
			cuurentCoord = line.getCoordinates()[i];
			if (!cuurentCoord.equals2D(prevCoord, tolerance)) {
				newCoords.add(prevCoord);
			}
		}
		// after we iterated to the end, we add the current coordinate
		if (cuurentCoord != null) {
			if (isRing) {
				newCoords.add(newCoords.get(0));
				line = SvUtil.sdiFactory.createLinearRing(newCoords.toArray(new Coordinate[newCoords.size()]));
			} else {
				newCoords.add(cuurentCoord);
				line = SvUtil.sdiFactory.createLineString(newCoords.toArray(new Coordinate[newCoords.size()]));
			}
		}

		return line;
		// ensure the first and last are the same
	}

	public static boolean hasDuplicates(LineString line, double tolerance) {
		int dedupEnd = line.getCoordinates().length;

		boolean hasDuplicates = false;
		for (int i = 1; i < dedupEnd; i++) {
			Coordinate prevCoord = line.getCoordinates()[i - 1];
			Coordinate oc = line.getCoordinates()[i];
			if (oc.equals2D(prevCoord, tolerance)) {
				hasDuplicates = true;
				break;
			}
		}
		return hasDuplicates;

	}

	/**
	 * Method to detect duplicate points in polygon geometries, line ring by line
	 * ring to ensure that all vertices are within SDI_VERTEX_ALIGN_TOLERANCE
	 * parameter
	 * 
	 * @param oldG The existing polygon
	 * @return the new polygon with deduplicated vertices
	 */
	public static boolean hasDuplicates(Polygon poly, double tolerance) {
		boolean hasDuplicates = hasDuplicates(poly.getExteriorRing(), tolerance);
		if (hasDuplicates)
			return hasDuplicates;
		LinearRing[] holes = new LinearRing[poly.getNumInteriorRing()];
		for (int i = 0; i < poly.getNumInteriorRing(); i++) {
			hasDuplicates = hasDuplicates(poly.getInteriorRingN(i), tolerance);
			if (hasDuplicates)
				return hasDuplicates;
		}
		return hasDuplicates;
	}

	/**
	 * Method to deduplicate multi polygon geometries, polygon by polygon to ensure
	 * that all polygons have vertices are within SDI_VERTEX_ALIGN_TOLERANCE
	 * parameter
	 * 
	 * @param mpoly The existing polygon
	 * @return the new polygon with deduplicated vertices
	 */
	public static boolean hasDuplicates(MultiPolygon mpoly, double tolerance) {
		boolean hasDuplicates = false;
		Polygon[] polys = new Polygon[mpoly.getNumGeometries()];
		for (int i = 0; i < mpoly.getNumGeometries(); i++) {
			hasDuplicates = hasDuplicates((Polygon) mpoly.getGeometryN(i), tolerance);
			if (hasDuplicates)
				return hasDuplicates;
		}

		return hasDuplicates;
	}

	/**
	 * Method to deduplicate polygon geometries, line ring by line ring to ensure
	 * that all vertices are within SDI_VERTEX_ALIGN_TOLERANCE parameter
	 * 
	 * @param oldG The existing polygon
	 * @return the new polygon with deduplicated vertices
	 */
	public static Polygon deduplicatePolygon(Polygon poly, double tolerance) {
		LinearRing shell = (LinearRing) deduplicateLineString(poly.getExteriorRing(), true, tolerance);
		boolean isModified = !shell.equalsExact(poly.getExteriorRing());
		LinearRing[] holes = new LinearRing[poly.getNumInteriorRing()];
		for (int i = 0; i < poly.getNumInteriorRing(); i++) {
			holes[i] = (LinearRing) deduplicateLineString(poly.getInteriorRingN(i), true, tolerance);
			if (!isModified)
				isModified = !holes[i].equalsExact(poly.getInteriorRingN(i));
		}
		if (isModified)
			return SvUtil.sdiFactory.createPolygon(shell, holes);
		else
			return poly;

	}

	/**
	 * Method to deduplicate multi polygon geometries, polygon by polygon to ensure
	 * that all polygons have vertices are within SDI_VERTEX_ALIGN_TOLERANCE
	 * parameter
	 * 
	 * @param mpoly The existing polygon
	 * @return the new polygon with deduplicated vertices
	 */
	public static MultiPolygon deduplicateMultiPolygons(MultiPolygon mpoly, double tolerance) {
		boolean isModified = false;
		Polygon[] polys = new Polygon[mpoly.getNumGeometries()];
		for (int i = 0; i < mpoly.getNumGeometries(); i++) {
			polys[i] = deduplicatePolygon((Polygon) mpoly.getGeometryN(i), tolerance);
			if (!isModified)
				isModified = !polys[i].equalsExact(mpoly.getGeometryN(i));
		}
		if (isModified)
			return SvUtil.sdiFactory.createMultiPolygon(polys);
		else
			return mpoly;

	}

	static DbDataArray getAllTables() throws SvException {
		try (SvSecurity svs = new SvSecurity()) {
			svs.switchUser(svCONST.serviceUser);
			try (SvReader svr = new SvReader(svs)) {
				DbQueryObject dbo = new DbQueryObject(SvCore.getDbt(svCONST.OBJECT_TYPE_TABLE), null, null, null);
				return svr.getObjects(dbo, null, null);
			}
		}
	}

	/**
	 * Method to return all object types which contain Geometry (GIS Layers)
	 * 
	 * @param beginsWith
	 * @return list of all layers (objects with geometry column)
	 * @throws SvException
	 */
	public static DbDataArray getLayerList() throws SvException {
		if (layers == null)
			synchronized (SpatialUtil.class) {
				if (layers == null) {
					layers = new DbDataArray();
					List<DbDataObject> dbts = SvCore.getTypes();
					for (DbDataObject dbo : dbts) {
						if (SvCore.hasGeometries(dbo.getObjectId()) && dbo.getVal(Sv.GUI_METADATA) != null) {
							JsonObject jgui = (JsonObject) dbo.getVal(Sv.GUI_METADATA);
							if (jgui.has(CC.LPIS_IMPORT) && jgui.get(CC.LPIS_IMPORT).getAsBoolean())
								layers.addDataItem(dbo);
						}

					}
				}
			}
		return layers;
	}

	/**
	 * Method to return all object types which contain Geometry (GIS Layers)
	 * 
	 * @param beginsWith
	 * @return list of all layers (objects with geometry column)
	 * @throws SvException
	 */
	public static DbDataArray getExternalLayerList() throws SvException {
		try (SvSecurity svs = new SvSecurity()) {
			svs.switchUser(svCONST.serviceUser);
			try (SvReader svr = new SvReader(svs)) {
				return svr.getObjectsByParentId(0L, SvCore.getDbtByName(CC.GEO_LAYER_TYPE).getObjectId(), null);
			}
		}
	}

	/**
	 * Method to ensure that the geometry is of the type needed by svarog
	 * 
	 * @param dbo The DbDataObject to be saved
	 * @param g   The geometry object
	 * @return Corrected geometry
	 * @throws SvException
	 */
	public static Geometry verifyGeometryType(DbDataObject dbo, Geometry g) throws SvException {
		DbDataObject dbt = SvCore.getDbt(dbo);
		DbDataObject geomField = SvCore.getFieldByName((String) dbt.getVal(Sv.TABLE_NAME), Sv.GEOM);
		String geomType = (String) geomField.getVal(Sv.GEOMETRY_TYPE);
		if (g.getGeometryType().equalsIgnoreCase("POLYGON") && geomType.equals("MULTIPOLYGON")) {
			Polygon[] p = new Polygon[1];
			p[0] = (Polygon) g;
			g = SvUtil.sdiFactory.createMultiPolygon(p);
		}
		return g;
	}
}
