package com.prtech.spatial.overlaps;

import java.util.Map;

import org.apache.logging.log4j.Logger;
import org.joda.time.DateTime;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
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
	private final DateTime end = new DateTime("9999-12-31T00:00:00+00");
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
		SvReader svr = null;
		SvWriter svw = null;
		String ref_date = "";
		DbDataObject dbApp = new DbDataObject();
		try {
			svr = new SvReader((SvCore) svCore);
			svw = new SvWriter(svr);

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
						}
					}
				}

				if (ref_date.equals("")) {
					throw new SvException("could not find ref_date", svr.getInstanceUser());
				}

			} else
				throw new SvException("could not find JSON_PARAMS", svr.getInstanceUser());

			Overlaps overlap = new Overlaps(new DateTime(), dbApp);
			
			if(overlap.hasOverlap(svr)) {
				createParamType(dbApp.getObjectId(), "spatial.overlap.parcels", "NVARCHAR", "true", svr, svw);
				throw new SvException("application.has_overlap", svr.getInstanceUser());
			}
			
		} finally {
			if (svr != null) {
				svr.release();
			}
			if (svw != null) {
				svw.release();
			}
		}
		return dbApp;
	}
	
	public void createParamType(Long parent_id, String label_code, String dataType, String inputType, SvReader svReader,
			SvWriter svw) throws SvException {

		DbSearchExpression expr = new DbSearchExpression();
		expr.addDbSearchItem(new DbSearchCriterion("LABEL_CODE", DbCompareOperand.EQUAL, label_code));

		DbDataArray arr = svReader.getObjects(expr, SvReader.getTypeIdByName("SVAROG_PARAM_TYPE"), null, 0, 0);

		if (arr.isEmpty()) {
			DbDataObject dbObj = new DbDataObject();
			dbObj.setObjectType(SvReader.getTypeIdByName("SVAROG_PARAM_TYPE"));
			dbObj.setVal("LABEL_CODE", label_code);
			dbObj.setVal("DATA_TYPE", dataType);
			dbObj.setVal("INPUT_TYPE", inputType);
			dbObj.setParentId(parent_id);
			svw.saveObject(dbObj, false);

		}
	}

}
