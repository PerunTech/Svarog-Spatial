package com.prtech.spatial.cwrs.zones;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;

import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvException;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_interfaces.ISvCore;
import com.prtech.svarog_interfaces.ISvExecutorGroup;

public class RankExecutorGroup implements ISvExecutorGroup {

	static final Map<String, Class<?>> retTypes = new HashMap<String, Class<?>>();
	static final List<String> names;
	static final Map<String, String> descriptions = new HashMap<String, String>();

	static final String SELECTOR = "SELECTOR";
	static final String RANK = "RANK";

	static {
		retTypes.put(SELECTOR, DbDataArray.class);
		retTypes.put(RANK, DbDataObject.class);

		names = new ArrayList<String>();
		names.add(SELECTOR);
		names.add(RANK);

		descriptions.put(SELECTOR,
				"Method which selects the CRWS zones which have a required percentage of agricultural area");
		descriptions.put(RANK, "Method which ranks a single selected zone to count the number of farm holdings");

	}

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
		Object result = null;
		String gridName = (String) params.get("GRID_NAME");
		Double agriPercentage = (Double) params.get("AGRI_PERCENT");
		Integer tolerance = (Integer) params.get("COUNT_TOLERANCE");
		String layerName = (String) params.get("LAYER_NAME");
		String tileName = (String) params.get("TILE_FILTER");
		DbDataObject tileObject = (DbDataObject) params.get("RECORD");

		Ranking rnk = new Ranking(gridName);
		switch (name) {
		case RANK:
			result = rnk.rankTile(svCore, tileObject, layerName, tolerance);
			break;
		case SELECTOR:
			result = rnk.getAgriTiles(svCore, layerName, tileName, agriPercentage);
			break;

		}
		return result;
	}

}
