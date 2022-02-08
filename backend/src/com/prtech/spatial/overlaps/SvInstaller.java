package com.prtech.spatial.overlaps;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvNote;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog.svCONST;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbQueryExpression;
import com.prtech.svarog_common.DbQueryObject;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.DbQueryObject.DbJoinType;
import com.prtech.svarog_common.DbQueryObject.LinkType;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;
import com.prtech.svarog_common.DbSearchExpression;
import com.prtech.svarog_interfaces.ISvConfigurationMulti;
import com.prtech.svarog_interfaces.ISvCore;
import com.prtech.svarog_interfaces.ISvConfiguration.UpdateType;

public class SvInstaller implements ISvConfigurationMulti {

	@Override
	public int executionOrder(UpdateType updateType) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public String beforeSchemaUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String beforeLabelsUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String beforeCodesUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String beforeTypesUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String beforeLinkTypesUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String beforeAclUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		SvReader svr = null;
		SvWriter svw = null;
		SvNote svn = null;
		try {
			svr = new SvReader((SvCore) core);
			svw = new SvWriter(svr);
			svn = new SvNote(svr);

			String overlapSelectionJob = "batch_job_type.overlap_parcel";
			String params = "[{\"id\":\"application.app_type_id\",\"name\":\"Ид на модул\",\"type\":\"NUMERIC\",\"mandatory\":\"true\",\"value\":\"\"},{\"id\":\"ref_date\",\"name\":\"Последен ден од кампањата\",\"type\":\"NVARCHAR\",\"mandatory\":\"true\",\"value\":\"\"}]";
			String reports = null;
			String actions = null;
			String strQueryExp = createJsonSelectorForOverlaps(svr);

			createJobType(overlapSelectionJob, "PAYMENT", svr, svw);

			createJobTemplate(overlapSelectionJob, "template.checks.overlap_parcel.application", 8L, 1L,
					"QUERY_EXPRESSION", null, null, null, "SPATIAL.OVERLAP_PARCEL", null, strQueryExp, params, reports,
					actions, svr, svw, svn);

			svw.dbCommit();
			svn.dbCommit();
		} finally {
			if (svr != null) {
				svr.release();
			}
			if (svw != null) {
				svw.release();
			}
			if (svn != null) {
				svn.release();
			}
		}
		return null;
	}

	@Override
	public String beforeSidAclUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String afterUpdate(Connection conn, ISvCore core, String schema) throws Exception {

		return null;
	}

	public String createJsonSelectorForOverlaps(SvReader svr) throws Exception {

		DbDataObject dbtApplication = svr.getObjectById(SvReader.getTypeIdByName("APPLICATION"),
				svCONST.OBJECT_TYPE_TABLE, null);
		DbDataObject dbappType = svr.getObjectById(SvReader.getTypeIdByName("APPLICATION_TYPE"),
				svCONST.OBJECT_TYPE_TABLE, null);

		DbSearchCriterion dbAppsStatusAdmCtrl = new DbSearchCriterion("STATUS", DbCompareOperand.EQUAL, "ADM_CTRL");
		DbSearchCriterion dbAppsStatusSubmitted = new DbSearchCriterion("STATUS", DbCompareOperand.EQUAL, "SUBMITTED");
		dbAppsStatusSubmitted.setNextCritOperand("OR");

		DbSearchExpression appStatus = new DbSearchExpression();
		appStatus.addDbSearchItem(dbAppsStatusSubmitted).addDbSearchItem(dbAppsStatusAdmCtrl);

		DbQueryObject dqoItSubmitteAdmCtrldApps = new DbQueryObject(dbtApplication, appStatus, DbJoinType.INNER, null,
				LinkType.CUSTOM, null, null);
		dqoItSubmitteAdmCtrldApps.addCustomJoinLeft("APP_TYPE_ID");
		dqoItSubmitteAdmCtrldApps.addCustomJoinRight("OBJECT_ID");
		DbQueryObject dqoItAppType = new DbQueryObject(dbappType, null, null, null);
		DbQueryExpression q = new DbQueryExpression();
		dqoItSubmitteAdmCtrldApps.setIsReturnType(true);
		q.addItem(dqoItSubmitteAdmCtrldApps);
		q.addItem(dqoItAppType);

		return q.toJson().toString();

	}

	public void createJobType(String labelCode, String JobType, SvReader svr, SvWriter svw) throws SvException {
		DbDataObject dbo = null;

		dbo = svr.getObjectByUnqConfId(labelCode, "SVAROG_BATCH_JOB_TYPE");
		if (dbo == null) {
			dbo = new DbDataObject(svCONST.OBJECT_TYPE_BATCH_JOB_TYPE);
			dbo.setVal("LABEL_CODE", labelCode);
			dbo.setVal("JOB_TYPE", JobType);

			svw.saveObject(dbo, false);
		}

	}

	public void createJobTemplate(String labelCodeJobType, String labelCodeJobTemplate, Long numThread, Long batchSize,
			String selectionType, String selectorExecutor, String readerExecutor, String filterExecutor,
			String processorExecutor, String writerExecutor, String strQueryExp, String params, String reports,
			String actions, SvReader svr, SvWriter svw, SvNote svn) throws SvException {

		DbDataObject jobType = svr.getObjectByUnqConfId(labelCodeJobType, "SVAROG_BATCH_JOB_TYPE");
		DbDataObject dbo = null;

		dbo = svr.getObjectByUnqConfId(labelCodeJobTemplate, "SVAROG_BATCH_JOB_TEMPLATE");
		if (dbo == null) {
			dbo = new DbDataObject(svCONST.OBJECT_TYPE_BATCH_JOB_TEMPLATE);
			dbo.setParentId(jobType.getObjectId());

			dbo.setVal("LABEL_CODE", labelCodeJobTemplate);
			dbo.setVal("NUM_THREAD", numThread);
			dbo.setVal("BATCH_SIZE", batchSize);
			dbo.setVal("SEL_TYPE", selectionType);
			dbo.setVal("SEL_EXE", selectorExecutor);
			dbo.setVal("R_EXE", readerExecutor);
			dbo.setVal("F_EXE", filterExecutor);
			dbo.setVal("P_EXE", processorExecutor);
			dbo.setVal("W_EXE", writerExecutor);
			dbo.setVal("PARAMS", params);
			dbo.setVal("REPORTS", reports);
			dbo.setVal("ACTIONS", actions);
			svw.saveObject(dbo, false);
			if (!"".equals(strQueryExp)) {
				svn.setNote(dbo.getObjectId(), "QUERY_EXPRESSION", strQueryExp, false);
			}
		}
	}

	@Override
	public int getVersion(int currentVersion) {
		// TODO Auto-generated method stub
		return 1;
	}

	@Override
	public List<UpdateType> getUpdateTypes() {
		ArrayList<UpdateType> updateTypes = new ArrayList<>();
		updateTypes.add(UpdateType.FINAL);
		return updateTypes;
	}

}
