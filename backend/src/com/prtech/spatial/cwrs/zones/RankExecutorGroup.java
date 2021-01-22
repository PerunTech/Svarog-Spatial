package com.prtech.spatial.cwrs.zones;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;

import org.joda.time.DateTime;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.prtech.sample.Sample;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvWriter;
import com.prtech.svarog.svCONST;
import com.prtech.svarog.score.SvarogScore;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;
import com.prtech.svarog_interfaces.ISvCore;
import com.prtech.svarog_interfaces.ISvExecutorGroup;

public class RankExecutorGroup implements ISvExecutorGroup {

	static final Map<String, Class<?>> retTypes = new HashMap<String, Class<?>>();
	static final List<String> names;
	static final Map<String, String> descriptions = new HashMap<String, String>();

	static final String SELECTOR = "SELECTOR";
	static final String RANK = "RANK";
	static final String RANK_VALUE = "RANK_VALUE";
	static final String SELECTOR_SAMPLE = "SELECTOR_SAMPLE";
	static final String SAMPLE = "SAMPLE";

	static {
		retTypes.put(SELECTOR, DbDataArray.class);
		retTypes.put(RANK, DbDataObject.class);
		retTypes.put(RANK_VALUE, BigDecimal.class);
		retTypes.put(SELECTOR_SAMPLE, DbDataArray.class);
		retTypes.put(SAMPLE, DbDataObject.class);

		names = new ArrayList<String>();
		names.add(SELECTOR);
		names.add(RANK);
		names.add(RANK_VALUE);
		names.add(SELECTOR_SAMPLE);
		names.add(SAMPLE);

		descriptions.put(SELECTOR,
				"Method which selects the CRWS zones which have a required percentage of agricultural area");
		descriptions.put(RANK_VALUE, "Method which counts the number of farm holdings in single zone");
		descriptions.put(RANK, "Method which ranks a single selected zone to count the number of farm holdings");
		descriptions.put(SELECTOR_SAMPLE, "Method which selects already ranked CRWS zones");
		descriptions.put(SAMPLE, "Method which extracts a zone by random and risk");

	}

	static final String scoreTypeLabel="score_type.rank.cwrs_zone";
	static final String sampleTypeLabel="sample_type.cwrs_zone";
	
	@Override
	public long versionUID() {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public Map<String, Class<?>> getReturningTypes() {
		return retTypes;
	}

	@Override
	public String getCategory() {
		return "CWRS_ZONES";
	}

	@Override
	public List<String> getNames() {
		return names;
	}

	@Override
	public Map<String, String> getDescriptions() {
		return descriptions;
	}

	@Override
	public DateTime getStartDate() {
		// TODO Auto-generated method stub
		return Sv.Y2K_START_DATE;
	}

	@Override
	public DateTime getEndDate() {
		// TODO Auto-generated method stub
		return SvConf.MAX_DATE;
	}

	@Override
	public Object execute(String name, Map<String, Object> params, ISvCore svCore) throws SvException {

		Long batchId = (Long) (params.get("JOB_ID"));
		DbDataObject tileObject = (DbDataObject) params.get("RECORD");
		String gridName = null;
		Double agriPercentage = null;
		Integer tolerance = null;
		String layerName = null;
		String tileName = null;

		if (params.containsKey("JSON_PARAMS")) {
			JsonArray jArry = new Gson().fromJson((String) params.get("JSON_PARAMS"), JsonArray.class);
			JsonObject jsonParamDetails;
			for (JsonElement jElement : jArry) {
				jsonParamDetails = jElement.getAsJsonObject();

				if (jsonParamDetails.has("id")) {
					if (jsonParamDetails.get("id").getAsString().equals("GRID_NAME")) {
						gridName = jsonParamDetails.get("value").getAsString();
					} else if (jsonParamDetails.get("id").getAsString().equals("AGRI_PERCENT")) {
						agriPercentage = jsonParamDetails.get("value").getAsDouble();
					} else if (jsonParamDetails.get("id").getAsString().equals("COUNT_TOLERANCE")) {
						tolerance = jsonParamDetails.get("value").getAsInt();
					} else if (jsonParamDetails.get("id").getAsString().equals("LAYER_NAME")) {
						layerName = jsonParamDetails.get("value").getAsString();
					} else if (jsonParamDetails.get("id").getAsString().equals("TILE_FILTER")) {
						tileName = jsonParamDetails.get("value").getAsString();
					}
				}
			}
		}

		Object result = null;

		Ranking rnk = new Ranking(gridName);
		switch (name) {
		case RANK:
			result = processRank(params, svCore);
			break;
		case SELECTOR:
			result = rnk.getAgriTiles(svCore, layerName, tileName, agriPercentage);
			createRank(batchId, svCore);
			break;
		case RANK_VALUE:
			result = rnk.rankTile(svCore, tileObject, layerName, tolerance);
			break;
		case SELECTOR_SAMPLE:
			result = getRankedTiles(batchId, svCore);
			break;
		case SAMPLE:
			result = sampleTiles(tileObject, params, svCore);
			break;

		}
		return result;
	}

	private void createRank(Long batchId, ISvCore svc) throws SvException {
		try (SvReader svr = new SvReader((SvCore) svc); SvWriter svw = new SvWriter(svr)) {
			DbDataObject dbBatch = svr.getObjectById(batchId, svCONST.OBJECT_TYPE_BATCH_JOB, null);
			String note = (String) dbBatch.getVal("NOTE");
			String name = (String) dbBatch.getVal("NAME");
			DbDataObject scoreType = svr.getObjectByUnqConfId(scoreTypeLabel, "SVAROG_SCORE_TYPE");

			DbDataArray result = new DbDataArray();
			DbSearchCriterion dbsc = new DbSearchCriterion("BATCH_ID", DbCompareOperand.EQUAL, batchId);
			result = svr.getObjects(dbsc, SvCore.getTypeIdByName("SVAROG_SCORE"), null, 0, 0);
			if (result.getItems().isEmpty()) {
				DbDataObject score = SvarogScore.createSoreObject(scoreType.getObjectId(), batchId, name, note);
				svw.saveObject(score, true);
			}
		}
	}
	
	private DbDataObject processRank(Map<String, Object> params, ISvCore svc) throws SvException {
		try (SvReader svr = new SvReader((SvCore) svc); SvWriter svw = new SvWriter(svr)) {
			DbDataObject scoreType = svr.getObjectByUnqConfId(scoreTypeLabel, "SVAROG_SCORE_TYPE");
			SvarogScore svScore = new SvarogScore(scoreType, params);
			DbDataObject scoreValue = svScore.scoring(svr);
			DbDataArray arrCritValueToSave = new DbDataArray();
			DbDataArray arrCritValue = (DbDataArray) scoreValue.getVal("CRIT_VALUES");
			svw.saveObject(scoreValue, false);
			for (DbDataObject crtiVal : arrCritValue.getItems()) {
				crtiVal.setParentId(scoreValue.getObjectId());
				arrCritValueToSave.addDataItem(crtiVal);
			}
			svw.saveObject(arrCritValueToSave, true, false);
			svw.dbCommit();
			return scoreValue;
		}
	}
	
	private DbDataArray getRankedTiles(Long batchId, ISvCore svc) throws SvException {

		DbDataArray rankedTiles = new DbDataArray();
		DbDataObject score = null;

		try (SvReader svr = new SvReader((SvCore) svc); SvWriter svw = new SvWriter(svr)) {
			DbDataObject scoreType = svr.getObjectByUnqConfId(scoreTypeLabel, "SVAROG_SCORE_TYPE");

			ArrayList<DbDataObject> arrResult = svr
					.getObjectsByParentId(scoreType.getObjectId(), SvReader.getTypeIdByName("SVAROG_SCORE"), null, 0, 0)
					.getSortedItems("PKID", true);

			ListIterator<DbDataObject> listIterator = arrResult.listIterator(arrResult.size());
			DbDataObject dbo = null;
			while (listIterator.hasPrevious()) {
				dbo = listIterator.previous();
				if (dbo.getStatus().equals("APPROVED")) {
					score = dbo;
					break;
				}
			}

			if (score != null) {
				rankedTiles.addDataItem(score);
				DbDataObject dbBatch = svr.getObjectById(batchId, svCONST.OBJECT_TYPE_BATCH_JOB, null);
				String note = (String) dbBatch.getVal("NOTE");
				String name = (String) dbBatch.getVal("NAME");

				DbDataObject sampleType = svr.getObjectByUnqConfId(sampleTypeLabel, "SAMPLE_TYPE");
				DbDataObject sample = Sample.createSampleObject(sampleType.getObjectId(), batchId, name, note);
				svw.saveObject(sample, true);
			}
		}
		return rankedTiles;
	}

	private DbDataObject sampleTiles(DbDataObject score, Map<String, Object> params, ISvCore svc) throws SvException {

		try (SvReader svr = new SvReader((SvCore) svc); SvWriter svw = new SvWriter(svr)) {
			DbDataArray arrObjectsToExtracte = svr.getObjectsByParentId(score.getObjectId(),
					SvReader.getTypeIdByName("SVAROG_SCORE_VALUE"), null, 0, 0);
			Sample sample = new Sample(params, arrObjectsToExtracte);
			DbDataArray randomSample = sample.getRandomSample(svr);
			svw.saveObject(randomSample, true, true);
			DbDataArray riskSample = sample.getRiskSample(svr);
			svw.saveObject(riskSample, true, true);
			score.setVal("RISK_SAMPLE", riskSample);
			score.setVal("RANDOM_SAMPLE", randomSample);
		}
		return score;
	}

}
