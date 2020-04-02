package com.prtech.perun_spatial.importer;

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
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKBReader;

/** Utility class for spatial data import */
public class SDIImporter {
	static final Logger log4j = LogManager.getLogger("svx_spatial");
	private static String token = null;
	static DecimalFormat df = new DecimalFormat("0.00000");

	/**
	 * Rudimentary import initializer.
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
	public static void main(String[] args) {
		if (args.length != 5) {
			printUsage();
			System.exit(-2);
		}

		try {
			SvSecurity svSec = new SvSecurity();
			token = svSec.logon(args[1], SvUtil.getMD5(args[2]));
			Long type = SvCore.getTypeIdByName(args[0]);

			if (type != null) {
				importSDI(args, type);
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
		;
		System.exit(0);
	};

	static void printUsage() {
		System.out.println("SvarogSDIImport is missing mandatory command line parameters");
		System.out.println("Example: SvarogImport ACTION SV_USER_NAME SV_PASSWORD SOURCE_TABLE FIELDMAP");
		System.out.println("ACTION: SDI_UNITS, SDI_BOUNDS, SDI_COVER, MINERALS_SDI_PROSPECTING");
		System.out.println("SV_USER_NAME: Your Svarog username");
		System.out.println("SV_PASSWORD: Your Svarog password");
		System.out.println("SOURCE_TABLE: The table name in the current svarog database containing the source data");
		System.out.println("FIELDMAP: Map of fields in the source table against the fields of the SDI objects");
		System.out
				.println("          Example for import of MK municipalities: UNIT_NAME=name;UNIT_ID=code_tu;GEOM=geom");
		System.out.println("          The field name GEOM is treated as geometry");

	}

	static HashMap<String, String> parseFieldMap(String map) {
		HashMap<String, String> fields = new HashMap<String, String>();
		String[] sFields = map.split(";");

		for (String sField : sFields) {
			String[] keyVal = sField.split("=");
			fields.put(keyVal[0], keyVal[1]);
		}
		return fields;
	};

	static boolean canImport(DbDataObject dbo, SvGeometry svg) throws java.text.ParseException {
		boolean retval = true;
		try {
			svg.verifyBounds(dbo);
		} catch (SvException svx) {
			log4j.warn("Invalid geometry" + svx.getFormattedMessage());
			retval = false;
		}

		DbDataArray fields = SvCore.getFields(dbo.getObjectType());
		for (DbDataObject field : fields.getItems()) {
			if (((String) field.getVal("FIELD_NAME")).equals("PKID")
					|| ((String) field.getVal("FIELD_NAME")).equals("CENTROID"))
				continue;
			else if (((String) field.getVal("FIELD_NAME")).equals("PERIMETER")
					|| ((String) field.getVal("FIELD_NAME")).equals("AREA")
					|| ((String) field.getVal("FIELD_NAME")).equals("AREA_HA")) {
				if (dbo.getVal(field.getVal("FIELD_NAME").toString()) != null) {
					Object val = dbo.getVal(field.getVal("FIELD_NAME").toString());
					String formate = df.format(val.toString());
					double finalValue = (Double) df.parse(formate);
					dbo.setVal(field.getVal("FIELD_NAME").toString(), finalValue);
				}

				continue;
			}

			if (!(Boolean) field.getVal("is_null") && dbo.getVal((String) field.getVal("FIELD_NAME")) == null) {
				log4j.warn("Field must have a value" + field.toJson().toString());
				retval = false;
				break;
			}
		}

		return retval;
	}

	static void importSDI(String[] args, Long importType)
			throws SvException, SQLException, ParseException, java.text.ParseException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		SvGeometry svg = null;
		DbDataObject dboGeom = null;
		try {
			svg = new SvGeometry(token);
			Connection conn = svg.dbGetConn();
			ISvDatabaseIO dbHandler = SvCore.getDbHandler();
			HashMap<String, String> fields = parseFieldMap(args[4]);

			String sqlList = "";
			for (Entry<String, String> e : fields.entrySet()) {
				String fld = e.getValue();
				if (e.getKey().toUpperCase().equals("GEOM"))
					fld = dbHandler.getGeomReadSQL(fld) + " as GEOM";
				sqlList = sqlList + (sqlList == "" ? "" : ",") + fld;
			}
			String sqlStmt = "SELECT " + sqlList + " FROM " + args[3];
			log4j.info("Executing sqlStm before pre-processing:");
			log4j.info("Executing:" + sqlStmt);
			ps = conn.prepareStatement(sqlStmt);
			rs = ps.executeQuery();
			if (args[3].equals("IACS_IMPORT.ILPIS_6316_IMPORT")) {
				sqlStmt = sqlStmt
						+ " where ID_ILPIS not in (select old_ilpis_id from IACS.VPHYSICAL_BLOCK where sysdate between dt_insert and dt_delete)";
			}
			if (args[3].equals("IACS_LPIS.LPIS_2019")) {
				sqlStmt = sqlStmt
						+ " where id not in (1364712) and id not in (select parcel_id from IACS.vLPIS_PARCEL where sysdate between dt_insert and dt_delete)";
				// + " where id = 1603539";
			}
			log4j.info("Executing sqlStm after pre-processing:");
			log4j.info("Executing:" + sqlStmt);
			ps = conn.prepareStatement(sqlStmt);
			rs = ps.executeQuery();
			WKBReader wkbReader = new WKBReader();
			DbDataArray importArr = new DbDataArray();

			int i = 0;
			while (rs.next()) {
				dboGeom = new DbDataObject();
				dboGeom.setObjectType(importType);
				for (String key : fields.keySet()) {
					if (key.toUpperCase().equals("GEOM")) {
						dboGeom.setVal(key, wkbReader.read(rs.getBytes(fields.get(key))));
					} else
						dboGeom.setVal(key, rs.getObject(fields.get(key)));
				}

				if (canImport(dboGeom, svg)) {
					try {
						svg.saveGeometry(dboGeom);
					} catch (Exception e) {
						log4j.error(e);
					}
					// importArr.addDataItem(dboGeom);
					// i++;
				} else {
					log4j.warn("Invalid object to import: " + dboGeom.toJson().toString());
				}

				if (i == 500) {
					// svg.saveGeometry(importArr, true);
					// importArr = new DbDataArray();
					// i = 0;
				}

			}

			svg.saveGeometry(importArr, true);
		} finally {
			SvCore.closeResource((AutoCloseable) rs, null);
			SvCore.closeResource((AutoCloseable) ps, null);
			if (svg != null)
				svg.release();
		}
	}
};