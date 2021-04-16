package com.prtech.spatial.importer;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.opengis.filter.And;

import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvMTWriter;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvSecurity;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog.SvarogInstall;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_interfaces.ISvDatabaseIO;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LinearRing;
import com.vividsolutions.jts.geom.impl.CoordinateArraySequence;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKBReader;

/** Utility class for spatial data import */
public class SDIImporter {
	static final Logger log = LogManager.getLogger(SDIImporter.class.getName());

	private static String token = null;
	private static String target = null;
	private static String source = null;
	private static HashMap<String, String> fields = null;

	private static void printUsage() {
		System.out.println("SDIImporter is missing mandatory command line parameters. \n"
				+ "Mandatory Params: TARGET USER_NAME PASSWORD SOURCE FIELDMAP \n "
				+ "1. TARGET: The svarog table to be populated by this import. \n "
				+ "2. SV_USER_NAME: Your Svarog username. \n " + "3. SV_PASSWORD: Your Svarog password. \n "
				+ "4. SOURCE_TABLE: The table name in the current svarog database containing the source data. \n"
				+ "5. FIELDMAP: Map of fields in the source table against the fields of the target table \n " + " \n "
				+ "Example: SDI_UNITS $USER $PASSWORD IMP_DATA.ADMINISTRATIVE_DIVISIONS "
				+ "UNIT_NAME=name;UNIT_ID=adm_code;GEOM=geometry");
	}

	private static HashMap<String, String> parseFieldMap(String map) {
		HashMap<String, String> fields = new HashMap<String, String>();
		String[] sFields = map.split(";");

		for (String sField : sFields) {
			String[] keyVal = sField.split("=");
			fields.put(keyVal[0], keyVal[1]);
		}
		return fields;
	}

	/**
	 * Import initializer for svarog spatial data.
	 * 
	 * @method main (args: String[]): void
	 * 
	 * @param args    <String[]> - The set of import arguments.
	 * @param args[0] - Name of the target table to import into.
	 * @param args[1] - User name.
	 * @param args[2] - Password.
	 * @param args[3] - Name of the source table to import from, prefixed by schema.
	 * @param args[4] - Field argument set, matches source field name to target
	 *                field name.
	 * 
	 * @return void;
	 * 
	 * @example main(["LPIS_2019", "ADMIN", "welcome", "LPIS_IACS_IMPORT.LPIS_2019",
	 *          "gid=fic;geometry=geom;geom_cnt=centroid;nvm=elevation"
	 */
	public static void main(String[] args) {
		if (args.length != 5) {
			printUsage();
			System.exit(-2);
		}

		SvSecurity svSec = null;
		try {
			svSec = new SvSecurity();
			target = args[0];
			token = svSec.logon(args[1], SvUtil.getMD5(args[2]));
			source = args[3];
			fields = parseFieldMap(args[4]);
			Long type = SvCore.getTypeIdByName(target);

			if (type != null) {
				importSDI(type);
			} else {
				printUsage();
			}

		} catch (Exception e) {
			System.out.println("Exception running SDI Importer");
			if (e instanceof SvException) {
				System.out.println(((SvException) e).getFormattedMessage());
				e.printStackTrace();
			} else
				e.printStackTrace();
		}

		System.exit(0);
	};

	static void defaultSetField(DbDataObject dbo, String key, ResultSet rs) {
		try {
			dbo.setVal(key, rs.getObject(fields.get(key)));
		} catch (SQLException e) {
			log.error(e);
			e.printStackTrace();
		}
	}

	static void setField(DbDataObject dbo, String key, ResultSet rs) throws SQLException {
		switch (target) {
		case "PHYSICAL_BLOCK":
			if (key.equals("LAND_COVER_CODE") || key.equals("LAND_COVER_CODE_2")) {
				try {
					int landUseAlt = 0;
					if (rs.getObject("LAND_USE_ID_2") != null) {
						landUseAlt = ((BigDecimal) rs.getObject("LAND_USE_ID_2")).intValue();
					}
					int landUse = ((BigDecimal) rs.getObject("LAND_USE_ID")).intValue();
					if (landUseAlt > 0) {
						dbo.setVal("LAND_COVER_CODE", Integer.valueOf(landUseAlt).toString());
					} else {
						dbo.setVal("LAND_COVER_CODE", Integer.valueOf(landUse).toString());
					}
				} catch (SQLException e) {
					log.info("physical_block.land_cover_code processing failed.");
				}
			} else if (key.equals("NOTE")) {
				dbo.setVal("NOTE", "MAFWE IMPORT");
			} else if (key.equals("OLD_ID")) {
				dbo.setVal("OLD_ID", ((BigDecimal) rs.getObject("ID_ILPIS")).intValue());
			} else {
				defaultSetField(dbo, key, rs);
			}
			break;
		case "AGRI_PARCEL":
			if (key.equals("LAND_COVER_CODE") && rs.getObject("LAND_USE_ID") != null) {
				int lc = ((BigDecimal) rs.getObject("LAND_USE_ID")).intValue();
				if (lc > 0)
					dbo.setVal("LAND_COVER_CODE", Integer.valueOf(lc).toString());
			} else if (key.equals("LAND_COVER_CODE_2") && rs.getObject("LAND_USE_ID_2") != null) {
				int lc = ((BigDecimal) rs.getObject("LAND_USE_ID_2")).intValue();
				if (lc > 0)
					dbo.setVal("LAND_COVER_CODE", Integer.valueOf(lc).toString());
			} else if (key.equals("INVISIBLE_BORDER") && rs.getObject("INVISIBLE_BORDER") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("INVISIBLE_BORDER")).intValue() > 0;
				dbo.setVal("INVISIBLE_BORDER", bool);
			} else if (key.equals("CHANGED_BORDER") && rs.getObject("CHANGED_BORDER") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("CHANGED_BORDER")).intValue() > 0;
				dbo.setVal("CHANGED_BORDER", bool);
			} else if (key.equals("IRRIGATION") && rs.getObject("IRRIGATION") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("IRRIGATION")).intValue() > 0;
				dbo.setVal("IRRIGATION", bool);
			} else if (key.equals("TERRACE") && rs.getObject("TERASE") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("TERASE")).intValue() > 0;
				dbo.setVal("TERRACE", bool);
			} else if (key.equals("LANDSCAPE_FEATURES") && rs.getObject("LANDSCAPE_FEATURES") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("LANDSCAPE_FEATURES")).intValue() > 0;
				dbo.setVal("LANDSCAPE_FEATURES", bool);
			} else if (key.equals("COMMON_USE") && rs.getObject("COMMON_USE") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("COMMON_USE")).intValue() > 0;
				dbo.setVal("COMMON_USE", bool);
			} else if (key.equals("CERTIFICATE_OF_USE") && rs.getObject("CERTIFICATE_OF_USE") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("CERTIFICATE_OF_USE")).intValue() > 0;
				dbo.setVal("CERTIFICATE_OF_USE", bool);
			} else if (key.equals("ORGANIC") && rs.getObject("ORGANIC") != null) {
				Boolean bool = ((BigDecimal) rs.getObject("ORGANIC")).intValue() > 0;
				dbo.setVal("ORGANIC", bool);
			} else if (key.equals("OLD_ID") && rs.getObject("ID") != null) {
				dbo.setVal("OLD_ID", ((BigDecimal) rs.getObject("ID")).longValue());
			} else
				defaultSetField(dbo, key, rs);
			break;
		default:
			defaultSetField(dbo, key, rs);
			break;
		}
	}

	static Boolean skipField(String fieldName) {
		boolean retval = false;

		if (fieldName.toUpperCase().equals("PKID") || fieldName.toUpperCase().equals("CENTROID")
				|| fieldName.toUpperCase().equals("PERIMETER") || fieldName.toUpperCase().equals("AREA")) {
			retval = true;
		}

		return retval;
	}

	static boolean canImport(DbDataObject dbo, SvGeometry svg) throws java.text.ParseException {
		boolean retval = true;
		// Geometry validation
		try {
			svg.verifyBounds(dbo);
		} catch (SvException svx) {
			log.warn("Invalid geometry" + svx.getFormattedMessage());
			retval = false;
		}
		// Mandatory fields validation
		DbDataArray fields = SvCore.getFields(dbo.getObjectType());
		for (DbDataObject field : fields.getItems()) {
			String fieldName = (String) field.getVal("FIELD_NAME");

			if (!skipField(fieldName) && !(Boolean) field.getVal("is_null") && dbo.getVal(fieldName) == null) {
				log.warn("Field must have a value" + field.toJson().toString());
				retval = false;
				break;
			}
		}

		return retval;
	}

	static void setGeometryDerivatives(DbDataObject dbo) {
		DecimalFormat df = new DecimalFormat("0.0000");
		Geometry geom = SvGeometry.getGeometry(dbo);

		String area = df.format(geom.getArea());
		String perimeter = df.format(geom.getLength());

		try {
			dbo.setVal("AREA", df.parse(area));
			dbo.setVal("PERIMETER", df.parse(perimeter));
		} catch (java.text.ParseException e) {
			log.error("Failed parsing geometry derivatives. Area and perimeter are not set. " + "Save will fail.");
			e.printStackTrace();
		}

	}

	static void importSDI(Long targetTypeId)
			throws SvException, SQLException, ParseException, java.text.ParseException {
		PreparedStatement ps = null;
		ResultSet rs = null;

		SvMTWriter mtw = null;
		DbDataObject dboGeom = null;
		ArrayList<SvWriter> svs = new ArrayList<>();
		try (SvGeometry svgMain = new SvGeometry(token)) {
			Integer threadCount = 0;
			String threadCountParam = SvConf.getParam("sdi.import.thread_count");
			try {
				threadCount = Integer.parseInt(threadCountParam.trim());
			} catch (Exception e) {
				threadCount = 1;
			}
			log.info("Running import with thread count:" + threadCount.toString());
			for (int i = 0; i < threadCount; i++) {
				SvGeometry svgt = new SvGeometry(token);
				svgt.setIsLongRunning(true);
				svgt.setAutoCommit(false);
				svs.add(svgt);
			}

			mtw = new SvMTWriter(svs);
			mtw.start();

			svgMain.setIsLongRunning(true);
			Connection conn = svgMain.dbGetConn();
			ISvDatabaseIO dbHandler = SvCore.getDbHandler();

			String sqlList = "";
			for (Entry<String, String> e : fields.entrySet()) {
				String fld = e.getValue();
				if (e.getKey().toUpperCase().equals("GEOM"))
					fld = dbHandler.getGeomReadSQL(fld) + " as " + fld;
				sqlList = sqlList + (sqlList == "" ? "" : ",") + fld;
			}
			String sqlStmt = "SELECT " + sqlList + " FROM " + source;
			log.info("Executing:" + sqlStmt);
			ps = conn.prepareStatement(sqlStmt);
			rs = ps.executeQuery();

			WKBReader wkbReader = new WKBReader();
			DbDataArray dbArray = new DbDataArray();

			int batchCnt = 0;
			int batchSize = 1000;
			int totalCnt = 0;

			while (rs.next()) {
				dboGeom = new DbDataObject();
				dboGeom.setObjectType(targetTypeId);
				dboGeom.setParentId(rs.getLong("FARM_ID"));
				for (String key : fields.keySet()) {
					if (key.toUpperCase().equals("GEOM")) {
						Geometry geometry = wkbReader.read(rs.getBytes(fields.get(key)));
						if (geometry.getDimension() > 1 && geometry.isValid() && geometry.isSimple()) {
							dboGeom.setVal(key, geometry);
						} else {
							ArrayList<Coordinate> points = new ArrayList<Coordinate>();
							points.add(new Coordinate(7606326.4898, 4689204.6929));
							points.add(new Coordinate(7606329.9135, 4689038.0987));
							points.add(new Coordinate(7606533.0659, 4689044.9483));
							points.add(new Coordinate(7606523.0754, 4689203.9997));
							points.add(new Coordinate(7606326.4898, 4689204.6929));
							Geometry tempGeom = SvUtil.sdiFactory.createPolygon(new LinearRing(
									new CoordinateArraySequence(points.toArray(new Coordinate[points.size()])),
									SvUtil.sdiFactory), null);
							dboGeom.setVal(key, tempGeom);
							dboGeom.setStatus("INVALID");
						}
					} else {
						setField(dboGeom, key.toUpperCase(), rs);
					}
				}

				if (canImport(dboGeom, svgMain)) {
					try {
						setGeometryDerivatives(dboGeom);
						dbArray.addDataItem(dboGeom);
						if (log.isDebugEnabled()) {
							log.trace("Object #" + totalCnt + "to be saved: " + dboGeom.getValuesMap());
						}
						batchCnt++;
						totalCnt++;
						if (batchCnt >= batchSize) {
							if (log.isDebugEnabled())
								log.debug("Start batch save of " + batchCnt + " records");
							mtw.saveObject(dbArray, true);

							if (log.isDebugEnabled())
								log.debug("Successfull batch save of " + batchCnt + " records");
							mtw.commit();
							dbArray = new DbDataArray();
							log.info("Object count is: " + totalCnt);
							batchCnt = 0;
						}
					} catch (Exception e) {
						if (e instanceof SvException) {
							log.error(((SvException) e).getFormattedMessage(), e);
						} else {
							log.error("Invalid object to import: " + dboGeom.toJson().toString(), e);
						}
					}
				} else {
					log.warn("Invalid object to import: " + dboGeom.toJson().toString());
				}
			}

			try {
				mtw.saveObject(dbArray, true);
				mtw.commit();
				log.info("Remaining batch count is: " + batchCnt + "\n" + "Total count of imported objects is: "
						+ totalCnt + "\n" + "SDI import finished succesfully.");
			} catch (Exception e) {
				if (e instanceof SvException) {
					log.error(((SvException) e).getFormattedMessage(), e);
				} else {
					log.error(e);
				}
			}

		} finally {
			try {
				if (mtw != null)
					mtw.close();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			for (SvWriter svg : svs) {
				if (svg != null)
					svg.release();
			}
			SvCore.closeResource((AutoCloseable) rs, null);
			SvCore.closeResource((AutoCloseable) ps, null);

		}
	}

	public static void importSDIByFarm(Long targetTypeId, Long farmId, Long farmObjId, String source, SvReader svr)
			throws SvException, SQLException, ParseException, java.text.ParseException {
		final String fieldMap = "GEOM=geometry;FARM_ID=farm_id;LAND_COVER_CODE=land_use_id;HOME_NAME=home_name;"
				+ "NOTE_INSERT=note_insert;NOTE_FARMER=note_farmer;NOTE_ORGANISATION=note_organisation;"
				+ "LAND_COVER_CODE_2=land_use_id_2;KO_ID=ko_id;INVISIBLE_BORDER=invisible_border;"
				+ "CHANGED_BORDER=changed_border;IRRIGATION=irrigation;SLOPE_AVG=slope_avg;"
				+ "TERRACE=terase;Z_AVG=z_avg;EXPOSITION_AVG=exp_avg;LANDSCAPE_FEATURES=landscape_features;"
				+ "ELIGIBILITY_COEF=eligibility_coef;COMMON_USE=common_use;CERTIFICATE_OF_USE=certificate_of_use;"
				+ "ORGANIC=organic;SOIL_TYPE=soil_type;OLD_ID=id;PARCEL_INTERSECT=parcel_intersect";
		fields = parseFieldMap(fieldMap);
		target = "AGRI_PARCEL";
		PreparedStatement ps = null;
		ResultSet rs = null;
		SvMTWriter mtw = null;
		DbDataObject dboGeom = null;
		ArrayList<SvWriter> svs = new ArrayList<>();
		try (SvGeometry svgMain = new SvGeometry(svr);) {

			svgMain.setIsLongRunning(true);
			Connection conn = svgMain.dbGetConn();
			ISvDatabaseIO dbHandler = SvCore.getDbHandler();

			String sqlList = "";
			for (Entry<String, String> e : fields.entrySet()) {
				String fld = e.getValue();
				if (e.getKey().toUpperCase().equals("GEOM"))
					fld = dbHandler.getGeomReadSQL(fld) + " as " + fld;
				sqlList = sqlList + (sqlList == "" ? "" : ",") + fld;
			}
			String sqlStmt = "SELECT " + sqlList + " FROM " + source
					+ " WHERE certificate_of_use = '1' AND FARM_ID = ?";
			log.debug("Executing:" + sqlStmt);
			ps = conn.prepareStatement(sqlStmt);
			ps.setLong(1, farmId);
			rs = ps.executeQuery();

			WKBReader wkbReader = new WKBReader();
			DbDataArray dbArray = new DbDataArray();

			while (rs.next()) {
				dboGeom = new DbDataObject();
				dboGeom.setObjectType(targetTypeId);
				dboGeom.setParentId(farmObjId);
				for (String key : fields.keySet()) {
					if (key.toUpperCase().equals("GEOM")) {
						Geometry geometry = wkbReader.read(rs.getBytes(fields.get(key)));
						if (geometry.getDimension() > 1 && geometry.isValid() && geometry.isSimple()) {
							dboGeom.setVal(key, geometry);
						} else {
							ArrayList<Coordinate> points = new ArrayList<Coordinate>();
							points.add(new Coordinate(7606326.4898, 4689204.6929));
							points.add(new Coordinate(7606329.9135, 4689038.0987));
							points.add(new Coordinate(7606533.0659, 4689044.9483));
							points.add(new Coordinate(7606523.0754, 4689203.9997));
							points.add(new Coordinate(7606326.4898, 4689204.6929));
							Geometry tempGeom = SvUtil.sdiFactory.createPolygon(new LinearRing(
									new CoordinateArraySequence(points.toArray(new Coordinate[points.size()])),
									SvUtil.sdiFactory), null);
							dboGeom.setVal(key, tempGeom);
							dboGeom.setStatus("INVALID");
						}
					} else {
						setField(dboGeom, key.toUpperCase(), rs);
					}
				}

				if (canImport(dboGeom, svgMain)) {
					try {
						setGeometryDerivatives(dboGeom);
						dbArray.addDataItem(dboGeom);
					} catch (Exception e) {
						if (e instanceof SvException) {
							log.error(((SvException) e).getFormattedMessage(), e);
						} else {
							log.error("Invalid object to import: " + dboGeom.toJson().toString(), e);
						}
					}
				} else {
					log.warn("Invalid object to import: " + dboGeom.toJson().toString());
				}
			}

			DbDataArray agriParcels = svr.getObjectsByParentId(farmObjId, SvCore.getTypeIdByName("AGRI_PARCEL"), null);

			DbDataArray deleteObjects = new DbDataArray();
			DbDataArray saveObjects = new DbDataArray();
			DbDataArray updateObjects = new DbDataArray();
			if (!agriParcels.isEmpty()) {

				dbArray.rebuildIndex("OLD_ID", true);

				Iterator<DbDataObject> it = agriParcels.getItems().iterator();
				DbDataObject dbo = null;
//				BigDecimal oldArea = null;
//				BigDecimal newArea = null;
//				BigDecimal oldZavg = null;
//				BigDecimal newZavg = null;
				while (it.hasNext()) {
					DbDataObject agriParcel = it.next();
					dbo = dbArray.getItemByIdx(agriParcel.getVal("OLD_ID").toString());
					if (dbo == null) {
						deleteObjects.addDataItem(agriParcel);
					} else {
//						oldArea = new BigDecimal(agriParcel.getVal("AREA").toString());
//						newArea = new BigDecimal(dbo.getVal("AREA").toString());
//						oldZavg = agriParcel.getVal("Z_AVG") != null
//								? new BigDecimal(agriParcel.getVal("Z_AVG").toString())
//								: new BigDecimal("0");
//						newZavg = new BigDecimal(dbo.getVal("Z_AVG").toString());
//						if (oldArea.compareTo(newArea) != 0 || oldZavg.compareTo(newZavg) != 0) {
//							dbo.setPkid(agriParcel.getPkid());
//							dbo.setObjectId(agriParcel.getObjectId());
//							dbo.setParentId(agriParcel.getParentId());
//							updateObjects.addDataItem(dbo);
//						}
						
						if(SvarogInstall.shouldUpgradeConfig(agriParcel, dbo,
								SvCore.getFields(SvCore.getTypeIdByName("AGRI_PARCEL")), true)) {
							dbo.setPkid(agriParcel.getPkid());
							dbo.setObjectId(agriParcel.getObjectId());
							dbo.setParentId(agriParcel.getParentId());
							updateObjects.addDataItem(dbo);
						}
					}
				}

				it = dbArray.getItems().iterator();
				agriParcels.rebuildIndex("OLD_ID", true);
				while (it.hasNext()) {
					DbDataObject newAgriParcel = it.next();
					dbo = agriParcels.getItemByIdx(newAgriParcel.getVal("OLD_ID").toString());
					if (dbo == null) {
						saveObjects.addDataItem(newAgriParcel);
					}
				}
			} else {
				saveObjects = dbArray;
			}

			try (SvGeometry svgt = new SvGeometry(svgMain.getSessionId()); SvWriter svw = new SvWriter(svgt)) {
				svgt.setAutoCommit(false);
				svw.setAutoCommit(false);
				if (deleteObjects != null && deleteObjects.size() > 0)
					svw.deleteObjects(deleteObjects);
				svgt.setIsLongRunning(true);
				svs.add(svgt);
				mtw = new SvMTWriter(svs);
				mtw.start();
				mtw.saveObject(updateObjects, true);
				mtw.saveObject(saveObjects, true);
				mtw.commit();
			}
		} finally {
			try {
				if (mtw != null)
					mtw.close();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			for (SvWriter svg : svs) {
				if (svg != null)
					svg.release();
			}
			SvCore.closeResource((AutoCloseable) rs, null);
			SvCore.closeResource((AutoCloseable) ps, null);

		}
	}
};