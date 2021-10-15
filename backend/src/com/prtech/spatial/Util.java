package com.prtech.spatial;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.util.List;
import java.util.Map.Entry;
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
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog_common.DbDataObject;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.io.WKTReader;
import com.vividsolutions.jts.io.svarog_geojson.GeoJsonReader;
import com.vividsolutions.jts.io.svarog_geojson.GeoJsonWriter;

public class Util {
	public static int PRECISION_SCALE = 2;
	static {
		int i = (int) (SvConf.getSDIPrecision() / 10);
		String s = Integer.toString(i);
		PRECISION_SCALE = s.length();
	}

	private static final Logger log = LogManager.getLogger(Util.class.getName());
	// dms regex pattern to match string format
	static final Pattern DMS_PATTERN = Pattern
			.compile("(-?)([0-9]{1,2})°([0-5]?[0-9])'([0-5]?[0-9](\\.[0-9]*)?)\"([NS])\\s"
					+ "(-?)([0-1]?[0-9]{1,2})°([0-5]?[0-9])'([0-5]?[0-9](\\.[0-9]*)?)\"([EW])");

	public static Boolean excludeField(String fieldName) {
		if ("PKID".equalsIgnoreCase(fieldName) || "GUI_METADATA".equalsIgnoreCase(fieldName)
				|| "CENTROID".equalsIgnoreCase(fieldName) || "GEOM".equalsIgnoreCase(fieldName)) {
			return false;
		}

		return true;
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
			log.debug(e);
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
			if ("Polygon".equalsIgnoreCase(polyType))
				geom = gf.createMultiPolygon(new Polygon[] { (Polygon) geom });
		} catch (Exception e) {
			log.error("Failed parsing geometry. " + e);
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
				log.error("Error reading exif GPS coordinates", e);
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
}
