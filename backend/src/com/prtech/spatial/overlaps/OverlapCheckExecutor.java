package com.prtech.spatial.overlaps;

import java.util.Map;

import org.apache.logging.log4j.Logger;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.DbSearchExpression;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;
import com.prtech.svarog_interfaces.ISvCore;
import com.prtech.svarog_interfaces.ISvExecutor;

public class OverlapCheckExecutor implements ISvExecutor {

	static final Logger log4j = SvConf.getLogger(OverlapCheckExecutor.class);
	private final String category = "SPATIAL";
	private final String name = "OVERLAP_PARCEL";
	private final String description = "It checks if application has overlap on parcels";
	private final DateTime start = new DateTime();
	private final DateTime end = SvConf.MAX_DATE;
	private final Class<?> type = DbDataObject.class;

	@Override
	public long versionUID() {
		return 1L;
	}

	@Override
	public Class<?> getReturningType() {
		return type;
	}

	@Override
	public String getCategory() {
		return category;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getDescription() {
		return description;
	}

	@Override
	public DateTime getStartDate() {
		return start;
	}

	@Override
	public DateTime getEndDate() {
		return end;
	}

	@Override
	public Object execute(Map<String, Object> params, ISvCore svCore) throws SvException {

		String ref_date = "";
		DateTime dtRef = null;
		DbDataObject dbApp = new DbDataObject();
		try (SvReader svr = new SvReader((SvCore) svCore);
				SvWriter svw = new SvWriter(svr);
				SvParameter svp = new SvParameter(svr);) {

			if (params.containsKey("RECORD")) {
				dbApp = (DbDataObject) (params.get("RECORD"));
				if (dbApp == null)
					throw new SvException("could not find appliaction or application is null", svr.getInstanceUser());
				dbApp = svr.getObjectById(dbApp.getObjectId(), dbApp.getObjectType(), null);

			} else
				throw new SvException("could not find RECORD or application is null", svr.getInstanceUser());

			if (params.containsKey("JSON_PARAMS")) {
				JsonArray jArry = new Gson().fromJson((String) params.get("JSON_PARAMS"), JsonArray.class);
				JsonObject jsonParamDetails;
				for (JsonElement jElement : jArry) {
					jsonParamDetails = jElement.getAsJsonObject();

					if (jsonParamDetails.has("id")) {
						if (jsonParamDetails.get("id").getAsString().equals("ref_date")) {
							ref_date = jsonParamDetails.get("value").getAsString();
							DateTimeFormatter formatter = DateTimeFormat.forPattern("dd.MM.yyyy");
							dtRef = formatter.parseDateTime(ref_date);
						}
					}
				}

				if (ref_date.equals("")) {
					throw new SvException("could not find ref_date", svr.getInstanceUser());
				}

			} else
				throw new SvException("could not find JSON_PARAMS", svr.getInstanceUser());

			Overlaps overlap = new Overlaps(dtRef, dbApp);

			if (overlap.hasOverlap(svr)) {
				DbDataObject paramType = createParamType(0L, "spatial.overlap.parcels", "NVARCHAR", "TEXT_AREA", svr, svw);
				svp.setParamString(dbApp, paramType.getVal("LABEL_CODE").toString(), "true");
				throw new SvException("application.has_overlap", svr.getInstanceUser());
			}

		}
		return dbApp;
	}

	public DbDataObject createParamType(Long parent_id, String label_code, String dataType, String inputType,
			SvReader svReader, SvWriter svw) throws SvException {

		DbSearchExpression expr = new DbSearchExpression();
		expr.addDbSearchItem(new DbSearchCriterion("LABEL_CODE", DbCompareOperand.EQUAL, label_code));

		DbDataArray arr = svReader.getObjects(expr, SvReader.getTypeIdByName("SVAROG_PARAM_TYPE"), null, 0, 0);
		DbDataObject dbObj = null;
		if (arr.isEmpty()) {
			dbObj = new DbDataObject();
			dbObj.setObjectType(SvReader.getTypeIdByName("SVAROG_PARAM_TYPE"));
			dbObj.setVal("LABEL_CODE", label_code);
			dbObj.setVal("DATA_TYPE", dataType);
			dbObj.setVal("INPUT_TYPE", inputType);
			dbObj.setParentId(parent_id);
			svw.saveObject(dbObj, false);

		} else {
			dbObj = arr.get(0);
		}
		return dbObj;
	}

}
