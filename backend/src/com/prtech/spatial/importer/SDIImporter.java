package com.prtech.spatial.importer;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map.Entry;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvSecurity;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_interfaces.ISvDatabaseIO;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKBReader;

import oracle.net.aso.i;

/** Utility class for spatial data import */
public class SDIImporter {
	static final Logger log = LogManager.getLogger(SDIImporter.class.getName());
	
	private static String token = null;
	private static String target = null;
	private static String source = null;
	private static HashMap<String, String> fields = null;

	private static void printUsage () {
		System.out.println("SDIImporter is missing mandatory command line parameters. \n"
				+ "Mandatory Params: TARGET USER_NAME PASSWORD SOURCE FIELDMAP \n "
				+ "1. TARGET: The svarog table to be populated by this import. \n "
				+ "2. SV_USER_NAME: Your Svarog username. \n "
				+ "3. SV_PASSWORD: Your Svarog password. \n "
				+ "4. SOURCE_TABLE: The table name in the current svarog database containing the source data. \n"
				+ "5. FIELDMAP: Map of fields in the source table against the fields of the target table \n "
				+ " \n "
				+ "Example: SDI_UNITS $USER $PASSWORD IMP_DATA.ADMINISTRATIVE_DIVISIONS "
				+ "UNIT_NAME=name;UNIT_ID=adm_code;GEOM=geometry");
	}
	
	private static HashMap<String, String> parseFieldMap (String map) {
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
	 * @param args
	 *            <String[]> - The set of import arguments.
	 * @param args[0]
	 *            - Name of the target table to import into.
	 * @param args[1]
	 *            - User name.
	 * @param args[2]
	 *            - Password.
	 * @param args[3]
	 *            - Name of the source table to import from, prefixed by schema.
	 * @param args[4]
	 *            - Field argument set, matches source field name to target
	 *            field name.
	 * 
	 * @return void;
	 * 
	 * @example main(["LPIS_2019", "ADMIN", "welcome",
	 *          "LPIS_IACS_IMPORT.LPIS_2019",
	 *          "gid=fic;geometry=geom;geom_cnt=centroid;nvm=elevation"
	 */
	public static void main (String[] args) {
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
	
	static void defaultSetField (DbDataObject dbo, String key, ResultSet rs) {
		try {
			dbo.setVal(key, rs.getObject(fields.get(key)));
		} catch (SQLException e) {
			log.error(e);
			e.printStackTrace();
		}
	}
	
	static void setField (DbDataObject dbo, String key, ResultSet rs) {
		
		
		switch (target) {
			case "PHYSICAL_BLOCK": 
				if (key.equals("LAND_COVER_CODE") || key.equals("LAND_COVER_CODE_2")) {
					try {
						Object landUseAlt = rs.getObject("LAND_USE_ID_2");
						if (landUseAlt != null) {
							dbo.setVal("LAND_COVER_CODE", landUseAlt.toString());
						} else {
							dbo.setVal("LAND_COVER_CODE", rs.getObject("LAND_USE_ID").toString());
						}
					} catch (SQLException e) {
						log.info("physical_block.land_cover_code processing failed.");
					}
				} else if (key.equals("NOTE")) {
					dbo.setVal("NOTE", "MAFWE IMPORT");
				} else {
					defaultSetField(dbo, key, rs);
				}
				break;
			default: defaultSetField(dbo, key, rs);
				break;
		}
	}
	
	static Boolean skipField (String fieldName) {
		boolean retval = false;
		
		if (fieldName.toUpperCase().equals("PKID")
			|| fieldName.toUpperCase().equals("CENTROID")
			|| fieldName.toUpperCase().equals("PERIMETER")
			|| fieldName.toUpperCase().equals("AREA")) {
			retval = true;
		}
		
		return retval;
	}
	
	static boolean canImport (DbDataObject dbo, SvGeometry svg) throws java.text.ParseException {
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
			
			if (!skipField(fieldName) 
				&& !(Boolean) field.getVal("is_null") 
				&& dbo.getVal(fieldName) == null) {
					log.warn("Field must have a value" + field.toJson().toString());
					retval = false;
					break;
			}
		}

		return retval;
	}

	static void setGeometryDerivatives (DbDataObject dbo) {
		DecimalFormat df = new DecimalFormat("0.0000");
		Geometry geom = SvGeometry.getGeometry(dbo);
		
		String area = df.format(geom.getArea());
		String perimeter = df.format(geom.getLength());
		
		try {
			dbo.setVal("AREA", df.parse(area));
			dbo.setVal("PERIMETER", df.parse(perimeter));
		} catch (java.text.ParseException e) {
			log.error("Failed parsing geometry derivatives. Area and perimeter are not set. "
					+ "Save will fail.");
			e.printStackTrace();
		}
		
	}
	
	static void importSDI (Long targetTypeId)
			throws SvException, SQLException, ParseException, java.text.ParseException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		SvGeometry svg = null;
		DbDataObject dboGeom = null;
		try {
			svg = new SvGeometry(token);
			svg.setIsLongRunning(true);
			svg.setAutoCommit(false);
			Connection conn = svg.dbGetConn();
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
				for (String key : fields.keySet()) {
					if (key.toUpperCase().equals("GEOM")) {
						dboGeom.setVal(key, wkbReader.read(rs.getBytes(fields.get(key))));
					} else {
						setField(dboGeom, key.toUpperCase(), rs);
					}
				}

				if (canImport(dboGeom, svg)) {
					try {
						setGeometryDerivatives(dboGeom);
						dbArray.addDataItem(dboGeom);
						if (log.isDebugEnabled()) {
							log.debug("\n" + "Object to be saved: " + dboGeom.getValuesMap() + "\n");
							log.debug("Object count is: " + totalCnt + "\n");	
						}
						batchCnt++;
						totalCnt++;
						if (batchCnt == 1000) {
							svg.saveGeometry(dbArray, true);
							svg.dbCommit();
							dbArray = new DbDataArray();
							log.info("Object count is: " + totalCnt + "\n");
							batchCnt = 0;
						}
					} catch (Exception e) {
						if (e instanceof SvException) {
							log.error(((SvException) e).getFormattedMessage(), e);
						} else {
							log.error(e);	
						}
					}
				} else {
					log.warn("Invalid object to import: " + dboGeom.toJson().toString());
				}
			}
			
			try {
				svg.saveGeometry(dbArray, true);
				svg.dbCommit();
				log.info("Remaining batch count is: " + batchCnt + "\n"
						+ "Total count of imported objects is: " + totalCnt + "\n"
						+ "SDI import finished succesfully.");
			} catch (Exception e) {
				if (e instanceof SvException) {
					log.error(((SvException) e).getFormattedMessage(), e);
				} else {
					log.error(e);	
				}
			}
			
		} finally {
			SvCore.closeResource((AutoCloseable) rs, null);
			SvCore.closeResource((AutoCloseable) ps, null);
			if (svg != null)
				svg.release();
		}
	}
};