package com.prtech.spatial.cwrs.zones;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.Logger;

import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvNote;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.DbSearchExpression;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;
import com.prtech.svarog_interfaces.ISvConfiguration;
import com.prtech.svarog_interfaces.ISvConfigurationMulti;
import com.prtech.svarog_interfaces.ISvCore;

public class RankSampleConfigInstaller implements ISvConfigurationMulti {

	final static Logger log4j = SvConf.getLogger(RankSampleConfigInstaller.class);

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
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String beforeSidAclUpdate(Connection conn, ISvCore core, String schema) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String afterUpdate(Connection conn, ISvCore core, String schema) throws Exception {

		try (SvReader svr = new SvReader((SvCore) core);
				SvWriter svw = new SvWriter(svr);
				SvNote svn = new SvNote(svr);) {

			createJobType("batch_job_type.score.cwrs_zone", "SCORE", svr, svw);
			String params = "[{\"id\":\"GRID_NAME\",\"name\":\"Име на грид\",\"type\":\"NVARCHAR\",\"mandatory\":\"true\",\"value\":\"\"},{\"id\":\"LAYER_NAME\",\"name\":\"Име на слој\",\"type\":\"NVARCHAR\",\"mandatory\":\"false\",\"value\":\"\"},{\"id\":\"AGRI_PERCENT\",\"name\":\"Процент\",\"type\":\"NUMERIC\",\"mandatory\":\"true\",\"value\":\"\"},{\"id\":\"YEAR\",\"name\":\"Последна кампања\",\"type\":\"NUMERIC\",\"mandatory\":\"false\",\"value\":\"\"}]";
			createJobTemplate("batch_job_type.score.cwrs_zone", "template.selection.rank.cwrs_zone", 8L, 1L, "EXECUTOR",
					"CWRS_ZONES.SELECTOR", null, null, "CWRS_ZONES.RANK", null, "", params, null, null, svr, svw, svn);

			createJobType("batch_job_type.sample.cwrs_zone", "SAMPLE", svr, svw);
			params = "[{\"id\":\"control_percent\",\"name\":\"Процент за контрола\",\"type\":\"NUMERIC\",\"mandatory\":\"true\",\"value\":\"\"},{\"id\":\"random_percent\",\"name\":\"Процент случаен избор\",\"type\":\"NUMERIC\",\"mandatory\":\"false\",\"value\":\"\"},{\"id\":\"risk_percent\",\"name\":\"Процент анализа на ризик\",\"type\":\"NUMERIC\",\"mandatory\":\"false\",\"value\":\"\"}]";
			createJobTemplate("batch_job_type.sample.cwrs_zone", "template.selection.sample.cwrs_zone", 8L, 1L,
					"EXECUTOR", "CWRS_ZONES.SELECTOR_SAMPLE", null, null, "CWRS_ZONES.SAMPLE", null, "", params, null,
					null, svr, svw, svn);

			createScoreType(svw, svr, "score_type.rank.cwrs_zone",
					"[{\"id\":\"rank_cwrs_zone\",\"text\":\"Рангирани CWRS зони\"}]");

			createCritDef(svw, svr, "score_type.rank.cwrs_zone", "crit_def.cwrs.rank_k1", "JAVA",
					"CWRS_ZONES.RANK_VALUE");
			createCritDef(svw, svr, "score_type.rank.cwrs_zone", "crit_def.cwrs.rank_k2", "JAVA",
					"CWRS_ZONES.RANK_VALUE_PARCELS");
			createCritDef(svw, svr, "score_type.rank.cwrs_zone", "crit_def.cwrs.rank_k4", "JAVA",
					"CWRS_ZONES.RANK_VALUE_OTS");
			createCritDef(svw, svr, "score_type.rank.cwrs_zone", "crit_def.cwrs.rank_k5", "JAVA",
					"CWRS_ZONES.RANK_VALUE_SANCTION");
			
			createCritScale(svw, svr, 0L, 499L, 0L, "crit_def.cwrs.rank_k1","cwrs_k1.a");
			createCritScale(svw, svr, 500L, 1000L, 32L, "crit_def.cwrs.rank_k1","cwrs_k1.b");
			createCritScale(svw, svr, 1001L, 999999999L, 64L, "crit_def.cwrs.rank_k1","cwrs_k1.c");
			
			createCritScale(svw, svr, 0L, 4999L, 0L, "crit_def.cwrs.rank_k2","cwrs_k2.a");
			createCritScale(svw, svr, 5000L, 10000L, 24L, "crit_def.cwrs.rank_k2","cwrs_k2.b");
			createCritScale(svw, svr, 10001L, 999999999L, 48L, "crit_def.cwrs.rank_k2","cwrs_k2.c");
			
			createCritScale(svw, svr, 0L, 30L, 10L, "crit_def.cwrs.rank_k4","cwrs_k4.a");
			createCritScale(svw, svr, 31L, 50L, 20L, "crit_def.cwrs.rank_k4","cwrs_k4.b");
			createCritScale(svw, svr, 51L, 999999999L, 40L, "crit_def.cwrs.rank_k4","cwrs_k4.c");
			
			createCritScale(svw, svr, 0L, 5L, 10L, "crit_def.cwrs.rank_k5","cwrs_k5.a");
			createCritScale(svw, svr, 6L, 20L, 20L, "crit_def.cwrs.rank_k5","cwrs_k5.b");
			createCritScale(svw, svr, 21L, 999999999L, 40L, "crit_def.cwrs.rank_k5","cwrs_k5.c");

			createSampleType(svw, svr, "sample_type.cwrs_zone",
					"[{\"id\":\"cwrs_zone\",\"text\":\"Екстрахирани CWRS зони\"}]");

			svw.dbCommit();
			svn.dbCommit();
		}
		return null;
	}

	private DbDataObject searchForObject(long objToSearch, String columnToSearch, String valueToSearch,
			SvReader svReader) throws SvException {
		DbDataArray obj = new DbDataArray();
		DbDataObject result = null;

		DbSearchExpression expr = new DbSearchExpression();
		expr.addDbSearchItem(new DbSearchCriterion(columnToSearch, DbCompareOperand.EQUAL, valueToSearch));
		obj = svReader.getObjects(expr, objToSearch, null, 0, 0);
		ArrayList<DbDataObject> list = obj.getItems();
		if (list.size() > 0) {
			result = list.get(0);
		}
		return result;

	}

	private void createJobType(String labelCode, String jobType, SvReader svr, SvWriter svw) throws SvException {

		DbDataObject dbObj = searchForObject(SvReader.getTypeIdByName("SVAROG_BATCH_JOB_TYPE"), "LABEL_CODE", labelCode,
				svr);
		if (dbObj == null) {
			dbObj = new DbDataObject();
			dbObj.setObjectType(SvReader.getTypeIdByName("SVAROG_BATCH_JOB_TYPE"));
			dbObj.setVal("LABEL_CODE", labelCode);
			dbObj.setVal("JOB_TYPE", jobType);
			svw.saveObject(dbObj, false);
			log4j.info("Object SVAROG_SCORE_TYPE created with label code: " + labelCode);
		} else {

			if (dbObj.getVal("JOB_TYPE") != null && !dbObj.getVal("JOB_TYPE").equals(jobType)) {
				dbObj.setVal("JOB_TYPE", jobType);
			}
			if (dbObj.getVal("LABEL_CODE") != null && !dbObj.getVal("LABEL_CODE").equals(labelCode)) {
				dbObj.setVal("LABEL_CODE", labelCode);
			}
			if (dbObj.getIsDirty()) {
				svw.saveObject(dbObj, false);
				log4j.info("Object SVAROG_BATCH_JOB_TYPE updated with label code: " + labelCode);
			} else {
				log4j.info("Object SVAROG_BATCH_JOB_TYPE already exists with label code: " + labelCode);
			}
		}
	}

	private void createJobTemplate(String labelCodeJobType, String labelCodeJobTemplate, Long numThread, Long batchSize,
			String selectionType, String selectorExecutor, String readerExecutor, String filterExecutor,
			String processorExecutor, String writerExecutor, String strQueryExp, String params, String reports,
			String actions, SvReader svr, SvWriter svw, SvNote svn) throws SvException {

		DbDataObject jobType = svr.getObjectByUnqConfId(labelCodeJobType, "SVAROG_BATCH_JOB_TYPE");
		DbDataObject dbObj = searchForObject(SvReader.getTypeIdByName("SVAROG_BATCH_JOB_TEMPLATE"), "LABEL_CODE",
				labelCodeJobTemplate, svr);
		if (dbObj == null) {
			dbObj = new DbDataObject();
			dbObj.setObjectType(SvReader.getTypeIdByName("SVAROG_BATCH_JOB_TEMPLATE"));
			dbObj.setVal("LABEL_CODE", labelCodeJobTemplate);
			dbObj.setVal("NUM_THREAD", numThread);
			dbObj.setVal("BATCH_SIZE", batchSize);
			dbObj.setVal("SEL_TYPE", selectionType);
			dbObj.setVal("SEL_EXE", selectorExecutor);
			dbObj.setVal("R_EXE", readerExecutor);
			dbObj.setVal("F_EXE", filterExecutor);
			dbObj.setVal("P_EXE", processorExecutor);
			dbObj.setVal("W_EXE", writerExecutor);
			dbObj.setVal("PARAMS", params);
			dbObj.setVal("REPORTS", reports);
			dbObj.setVal("ACTIONS", actions);
			dbObj.setParentId(jobType.getObjectId());
			svw.saveObject(dbObj, false);
			if (!"".equals(strQueryExp)) {
				if ("".equals(svn.getNote(dbObj.getObjectId(), "QUERY_EXPRESSION")))
					svn.setNote(dbObj.getObjectId(), "QUERY_EXPRESSION", strQueryExp, false);
				else if (!strQueryExp.equals(svn.getNote(dbObj.getObjectId(), "QUERY_EXPRESSION")))
					svn.setNote(dbObj.getObjectId(), "QUERY_EXPRESSION", strQueryExp, false);
			}
			log4j.info("Object SVAROG_BATCH_JOB_TEMPLATE created with label code: " + labelCodeJobTemplate);
		} else {
			if (jobType != null && dbObj.getParentId() != null && !dbObj.getParentId().equals(jobType.getObjectId())) {
				dbObj.setParentId(jobType.getObjectId());
			}
			if (dbObj.getVal("LABEL_CODE") != null && !dbObj.getVal("LABEL_CODE").equals(labelCodeJobTemplate)) {
				dbObj.setVal("LABEL_CODE", labelCodeJobTemplate);
			}
			if (dbObj.getVal("NUM_THREAD") != null && !dbObj.getVal("NUM_THREAD").equals(numThread)) {
				dbObj.setVal("NUM_THREAD", numThread);
			}
			if (dbObj.getVal("BATCH_SIZE") != null && !dbObj.getVal("BATCH_SIZE").equals(batchSize)) {
				dbObj.setVal("BATCH_SIZE", batchSize);
			}
			if (dbObj.getVal("SEL_TYPE") != null && !dbObj.getVal("SEL_TYPE").equals(selectionType)) {
				dbObj.setVal("SEL_TYPE", selectionType);
			}
			if (dbObj.getVal("SEL_EXE") != null && !dbObj.getVal("SEL_EXE").equals(selectorExecutor)) {
				dbObj.setVal("SEL_EXE", selectorExecutor);
			}
			if (dbObj.getVal("R_EXE") != null && !dbObj.getVal("R_EXE").equals(readerExecutor)) {
				dbObj.setVal("R_EXE", readerExecutor);
			}
			if (dbObj.getVal("F_EXE") != null && !dbObj.getVal("F_EXE").equals(filterExecutor)) {
				dbObj.setVal("F_EXE", filterExecutor);
			}
			if (dbObj.getVal("P_EXE") != null && !dbObj.getVal("P_EXE").equals(processorExecutor)) {
				dbObj.setVal("P_EXE", processorExecutor);
			}
			if (dbObj.getVal("W_EXE") != null && !dbObj.getVal("W_EXE").equals(writerExecutor)) {
				dbObj.setVal("W_EXE", writerExecutor);
			}
			if (dbObj.getVal("PARAMS") != null && !dbObj.getVal("PARAMS").equals(params)) {
				dbObj.setVal("PARAMS", params);
			}
			if (dbObj.getVal("REPORTS") != null && !dbObj.getVal("REPORTS").equals(reports)) {
				dbObj.setVal("REPORTS", reports);
			}
			if (dbObj.getVal("ACTIONS") != null && !dbObj.getVal("ACTIONS").equals(actions)) {
				dbObj.setVal("ACTIONS", actions);
			}
			if (dbObj.getIsDirty()) {
				svw.saveObject(dbObj, false);
				log4j.info("Object SVAROG_BATCH_JOB_TEMPLATE updated with label code: " + labelCodeJobTemplate);
			} else {
				log4j.info("Object SVAROG_BATCH_JOB_TEMPLATE already exists with label code: " + labelCodeJobTemplate);
			}
			if (!"".equals(strQueryExp)) {
				if ("".equals(svn.getNote(dbObj.getObjectId(), "QUERY_EXPRESSION")))
					svn.setNote(dbObj.getObjectId(), "QUERY_EXPRESSION", strQueryExp, false);
				else if (!strQueryExp.equals(svn.getNote(dbObj.getObjectId(), "QUERY_EXPRESSION")))
					svn.setNote(dbObj.getObjectId(), "QUERY_EXPRESSION", strQueryExp, false);
			}
		}

	}

	private void createScoreType(SvWriter svw, SvReader svr, String labelCode, String reports) throws SvException {
		DbDataObject dbObj = searchForObject(SvReader.getTypeIdByName("SVAROG_SCORE_TYPE"), "LABEL_CODE", labelCode,
				svr);
		if (dbObj == null) {
			dbObj = new DbDataObject();
			dbObj.setObjectType(SvReader.getTypeIdByName("SVAROG_SCORE_TYPE"));
			dbObj.setVal("LABEL_CODE", labelCode);
			dbObj.setVal("REPORTS", reports);
			svw.saveObject(dbObj, false);
			log4j.info("Object SVAROG_SCORE_TYPE created with label code: " + labelCode);
		} else {

			if (dbObj.getVal("REPORTS") != null && !dbObj.getVal("REPORTS").equals(reports)) {
				dbObj.setVal("REPORTS", reports);
			}
			if (dbObj.getVal("LABEL_CODE") != null && !dbObj.getVal("LABEL_CODE").equals(labelCode)) {
				dbObj.setVal("LABEL_CODE", labelCode);
			}
			if (dbObj.getIsDirty()) {
				svw.saveObject(dbObj, false);
				log4j.info("Object SVAROG_SCORE_TYPE updated with label code: " + labelCode);
			} else {
				log4j.info("Object SVAROG_SCORE_TYPE already exists with label code: " + labelCode);
			}
		}
	}

	private void createCritDef(SvWriter svw, SvReader svr, String scoreTypeLabel, String critDefLabel, String codeType,
			String valueFunction) throws SvException {

		DbDataObject scoreType = svr.getObjectByUnqConfId(scoreTypeLabel, "SVAROG_SCORE_TYPE");
		DbDataObject dbObj = searchForObject(SvReader.getTypeIdByName("SVAROG_SCORE_CRIT_DEF"), "LABEL_CODE",
				critDefLabel, svr);
		if (dbObj == null) {
			dbObj = new DbDataObject();
			dbObj.setObjectType(SvReader.getTypeIdByName("SVAROG_SCORE_CRIT_DEF"));
			dbObj.setVal("LABEL_CODE", critDefLabel);
			dbObj.setVal("VALUE_FUNCTION", valueFunction);
			dbObj.setVal("CODE_TYPE", codeType);
			dbObj.setParentId(scoreType.getObjectId());
			svw.saveObject(dbObj, false);
			log4j.info("Object SVAROG_SCORE_CRIT_DEF created with label code: " + critDefLabel);
		} else {
			if (scoreType != null && dbObj.getParentId() != null
					&& !dbObj.getParentId().equals(scoreType.getObjectId())) {
				dbObj.setParentId(scoreType.getObjectId());
			}
			if (dbObj.getVal("VALUE_FUNCTION") != null && !dbObj.getVal("VALUE_FUNCTION").equals(valueFunction)) {
				dbObj.setVal("VALUE_FUNCTION", valueFunction);
			}
			if (dbObj.getVal("CODE_TYPE") != null && !dbObj.getVal("CODE_TYPE").equals(codeType)) {
				dbObj.setVal("CODE_TYPE", codeType);
			}
			if (dbObj.getVal("LABEL_CODE") != null && !dbObj.getVal("LABEL_CODE").equals(critDefLabel)) {
				dbObj.setVal("LABEL_CODE", critDefLabel);
			}
			if (dbObj.getIsDirty()) {
				svw.saveObject(dbObj, false);
				log4j.info("Object SVAROG_SCORE_CRIT_DEF updated with label code: " + critDefLabel);
			} else {
				log4j.info("Object SVAROG_SCORE_CRIT_DEF already exists with label code: " + critDefLabel);
			}
		}
	}

	private void createCritScale(SvWriter svw, SvReader svr, Long valFrom, Long valTo, Long score, String critTypeLabel,
			String critScaleLabel) throws SvException {

		DbDataObject critDef = searchForObject(SvReader.getTypeIdByName("SVAROG_SCORE_CRIT_DEF"), "LABEL_CODE",
				critTypeLabel, svr);
		boolean isNew = true;
		if (critDef != null) {
			DbDataArray critScales = svr.getObjectsByParentId(critDef.getObjectId(),
					SvReader.getTypeIdByName("SVAROG_SCORE_CRIT_SCALE"), null);

			if (!critScales.isEmpty()) {
				for (DbDataObject critScale : critScales.getItems()) {
					if (critScale.getVal("LABEL_CODE") == null) {
						svw.deleteObject(critScale, false);
					} else if (critScale.getVal("LABEL_CODE").toString().equals(critScaleLabel)) {
						isNew = false;
						if (critScale.getVal("VALUE_FROM") != null && !critScale.getVal("VALUE_FROM").equals(valFrom)) {
							critScale.setVal("VALUE_FROM", valFrom);
						}
						if (critScale.getVal("VALUE_TO") != null && !critScale.getVal("VALUE_TO").equals(valTo)) {
							critScale.setVal("VALUE_TO", valTo);
						}
						if (critScale.getVal("SCORE") != null && !critScale.getVal("SCORE").equals(score)) {
							critScale.setVal("SCORE", score);
						}
						if (critScale.getIsDirty()) {
							svw.saveObject(critScale, false);
							log4j.info("Object SVAROG_SCORE_CRIT_SCALE updated with label code: " + critScaleLabel);
						} else {
							log4j.info(
									"Object SVAROG_SCORE_CRIT_SCALE already exists with label code: " + critScaleLabel);
						}
						break;
					}
				}
			}
			if (isNew) {
				DbDataObject dbObj = new DbDataObject();
				dbObj = new DbDataObject();
				dbObj.setObjectType(SvReader.getTypeIdByName("SVAROG_SCORE_CRIT_SCALE"));
				dbObj.setVal("VALUE_FROM", valFrom);
				dbObj.setVal("VALUE_TO", valTo);
				dbObj.setVal("SCORE", score);
				dbObj.setVal("LABEL_CODE", critScaleLabel);
				dbObj.setParentId(critDef.getObjectId());
				svw.saveObject(dbObj, false);
				log4j.info("Object SVAROG_SCORE_CRIT_SCALE created for parent: " + critTypeLabel);
			}
		} else {
			log4j.info(
					"The parent SVAROG_SCORE_CRIT_DEF with label code: crit_def.cwrs.rank_k1 doesen't exist or already has scale items.");
		}
	}

	private void createSampleType(SvWriter svw, SvReader svr, String labelCode, String reports) throws SvException {
		DbDataObject dbObj = searchForObject(SvReader.getTypeIdByName("SAMPLE_TYPE"), "LABEL_CODE", labelCode, svr);
		if (dbObj == null) {
			dbObj = new DbDataObject();
			dbObj.setObjectType(SvReader.getTypeIdByName("SAMPLE_TYPE"));
			dbObj.setVal("LABEL_CODE", labelCode);
			dbObj.setVal("REPORTS", reports);
			svw.saveObject(dbObj, false);
			log4j.info("Object SAMPLE_TYPE created with label code: " + labelCode);
		} else {
			if (dbObj.getVal("REPORTS") != null && !dbObj.getVal("REPORTS").equals(reports)) {
				dbObj.setVal("REPORTS", reports);
			}
			if (dbObj.getVal("LABEL_CODE") != null && !dbObj.getVal("LABEL_CODE").equals(labelCode)) {
				dbObj.setVal("LABEL_CODE", labelCode);
			}
			if (dbObj.getIsDirty()) {
				svw.saveObject(dbObj, false);
				log4j.info("Object SAMPLE_TYPE updated with label code: " + labelCode);
			} else {
				log4j.info("Object SAMPLE_TYPE already exists with label code: " + labelCode);
			}
		}
	}

	@Override
	public int getVersion(int currentVersion) {
		// TODO Auto-generated method stub
		return 3;
	}

	@Override
	public List<UpdateType> getUpdateTypes() {
		// TODO Auto-generated method stub
		List<UpdateType> types = new ArrayList<>();
		types.add(UpdateType.FINAL);
		return types;
	}

}