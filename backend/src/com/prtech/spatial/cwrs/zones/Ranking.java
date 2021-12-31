package com.prtech.spatial.cwrs.zones;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.apache.logging.log4j.Logger;
import org.joda.time.DateTime;

import com.prtech.spatial.Config;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvGrid;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog.SvSDITile.SDIRelation;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbQueryExpression;
import com.prtech.svarog_common.DbQueryObject;
import com.prtech.svarog_common.DbQueryObject.DbJoinType;
import com.prtech.svarog_common.DbQueryObject.LinkType;
import com.prtech.svarog_common.DbSearchCriterion;
import com.prtech.svarog_common.DbSearchCriterion.DbCompareOperand;
import com.prtech.svarog_common.DbSearchExpression;
import com.prtech.svarog_common.IDbFilter;
import com.prtech.svarog_common.DbSearch.DbLogicOperand;
import com.prtech.svarog_interfaces.ISvCore;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryCollection;

public class Ranking {
	private static final Logger log = SvConf.getLogger(Ranking.class);

	String gridName = null;
	// double areaPercentage = 15;

	public Ranking(String gridName) {
		this.gridName = gridName;
		// this.areaPercentage = agriculturalAreaPercent;
	}

	volatile ArrayList<Long> edbarTypes = null;

	private ArrayList<Long> getEdbarAppTypes(ISvCore svc, Integer startYear) throws SvException {
		if (edbarTypes == null) {
			synchronized (Ranking.class) {
				if (edbarTypes == null) {

					edbarTypes = new ArrayList<>();
					try (SvReader svr = new SvReader((SvCore) svc)) {
						DbDataArray apptypes = svr.getObjectsByTypeId(SvCore.getTypeIdByName("APPLICATION_TYPE"), null,
								null, null);
						for (DbDataObject type : apptypes.getItems()) {
							if (type.getVal("LABEL_CODE").toString().contains("edbar")) {
								Integer y = Integer.parseInt(type.getVal("YEAR").toString());
								if (y >= (startYear - 5))
									edbarTypes.add(type.getObjectId());
							}

						}
					}
				}
			}

		}
		return edbarTypes;

	}

	private SvGrid getGrid(String gridName, ISvCore svc) throws SvException {
		boolean exists = true;
		SvGrid grid = null;
		try {
			grid = new SvGrid(gridName);
		} catch (SvException e) {
			if (e.getLabelCode().equals(Sv.Exceptions.EMPTY_GRID))
				exists = false;
		}
		if (!exists) {
			Collection<Geometry> b = SvGeometry.getSysBoundary().getInternalGeometries();
			Geometry boundary = b.iterator().next();
			GeometryCollection gcl = SvGrid.generateGrid(boundary, 10, svc);
			SvGrid.saveGridToDatabase(gcl, gridName, svc);
			grid = new SvGrid(gridName);
		}
		return grid;
	}

	/**
	 * Method to fetch a list of grid tiles which have a required percentage
	 * (minimum percentage specified via parameter <b>agriculturalAreaPercent</b>)
	 * of area covered by the geometries registered under the object specified via
	 * the parameter <b>parcelLayerName</b>. A filter to specify a single tile is
	 * provided by parameter tileNameFilter.
	 * 
	 * @param svc                     The ISvCore instance which shall be used for
	 *                                connection sharing and authentication
	 * @param parcelLayerName         The name of the layer (object type) which
	 *                                contains the geometries to be analysed
	 * @param agriculturalAreaPercent The minimum percentage a tile should cover in
	 *                                order to be considered agricultural.
	 * @return List of tiles which meet the specified percentage of area covered
	 * @throws SvException Any underlying exception is re-thrown
	 */
	public DbDataArray getAgriTiles(ISvCore svc, String parcelLayerName, double agriculturalAreaPercent)
			throws SvException {
		return getAgriTiles(svc, parcelLayerName, null, agriculturalAreaPercent);
	}

	/**
	 * Method to fetch a list of grid tiles which have a required percentage
	 * (minimum percentage specified via parameter <b>agriculturalAreaPercent</b>)
	 * of area covered by the geometries registered under the object specified via
	 * the parameter <b>parcelLayerName</b>. A filter to specify a single tile is
	 * provided by parameter tileNameFilter.
	 * 
	 * @param svc                     The ISvCore instance which shall be used for
	 *                                connection sharing and authentication
	 * @param parcelLayerName         The name of the layer (object type) which
	 *                                contains the geometries to be analysed
	 * @param tileNameFilter          The name of the tile which shall be used as
	 *                                filter, if null, all tiles are processed
	 * @param agriculturalAreaPercent The minimum percentage a tile should cover in
	 *                                order to be considered agricultural.
	 * @return List of tiles which meet the specified percentage of area covered
	 * @throws SvException Any underlying exception is re-thrown
	 */
	public DbDataArray getAgriTiles(ISvCore svc, String parcelLayerName, String tileNameFilter,
			double agriculturalAreaPercent) throws SvException {
		DbDataArray selectedTiles = new DbDataArray();
		try (SvGeometry svg = new SvGeometry((SvCore) svc)) {
			SvGrid grid = getGrid(gridName, svc);
			Collection<Geometry> gridset = grid.getInternalGeometries();
			DbDataObject layerType = SvCore.getDbtByName(parcelLayerName);
			for (Geometry cell : gridset) {
				if (tileNameFilter != null && !tileNameFilter.equals(cell.getUserData()))
					continue;
				Set<Geometry> gridGeoms = svg.getRelatedGeometries(SvUtil.sdiFactory.createGeometry(cell).buffer(-0.1),
						layerType.getObjectId(), SDIRelation.INTERSECTS, null, null, false);
				GeometryCollection gcl = SvUtil.sdiFactory.createGeometryCollection(gridGeoms.toArray(new Geometry[0]));

				double hac = (cell.getArea() / 10000);
				double haa = 0;
				double perc = 0;
				if (gcl.getArea() > 0) {
					haa = (gcl.getArea() / 10000);
					perc = haa * 100 / hac;
				}
				if (log.isDebugEnabled()) {
					log.debug("Cell " + cell.getUserData() + ", Area:" + hac);
					log.debug("Geometries " + gcl.getNumGeometries() + ", Agricultural area:" + haa);
					log.debug("Percentage of agricultural area: " + perc);
				}
				if (perc > agriculturalAreaPercent) {
					log.debug("Cell " + cell.getUserData() + " is selected!");
					selectedTiles.addDataItem(grid.getTileDbo((String) cell.getUserData()));
				}

			}
		}
		return selectedTiles;
	}

	boolean verifyParcelCount(Set<Long> allParcelIds, DbDataArray allFarmParcels, int errorMargin) {
		int found = 0;

		for (DbDataObject parcel : allFarmParcels.getItems()) {
			if (allParcelIds.contains(parcel.getObjectId()))
				found++;
		}
		return (found + errorMargin) > allFarmParcels.size();
	}

	/**
	 * Method to get the number of Farms in the tile of the grid. The tile
	 * descriptor and the layer name of the parcel layer are specified to be used
	 * for counting all parcel parents (farms) which have all of the holding parcels
	 * inside this tile.
	 * 
	 * @param svc             The ISvCore instance which shall be used for
	 *                        connection sharing and authentication
	 * @param tile            The descriptor of the tile which shall be used as
	 *                        filter to identify parcels intersected
	 * @param parcelLayerName The name of the layer (object type) which contains the
	 *                        geometries to be analysed
	 * @return DbDataObject which contains number of matched farms in the field
	 *         "FARM_COUNT"
	 * @throws SvException Any underlying exception is re-thrown
	 */
	public BigDecimal rankTile(ISvCore svc, DbDataObject tile, String parcelLayerName) throws SvException {

		BigDecimal rank = new BigDecimal(getFarmIds(svc, tile, parcelLayerName).size());

		return rank;
	}

	public Collection<Long> getFarmIds(ISvCore svc, DbDataObject tile, String parcelLayerName) throws SvException {
		DbDataObject layerType = SvCore.getDbtByName(parcelLayerName);
		Set<Long> allFarmIds = new HashSet<Long>();

		try (SvGeometry svg = new SvGeometry((SvCore) svc); SvReader svr = new SvReader(svg)) {
			Geometry cell = SvGeometry.getGeometry(tile);
			if (cell == null) {
				SvGrid g = getGrid((String) tile.getVal(SvGrid.GRID_NAME), svc);
				DbDataObject gdbo = g.getTileDbo((String) tile.getVal(SvGrid.GRIDTILE_ID));
				cell = SvGeometry.getGeometry(gdbo);
			}
			Set<Geometry> gridGeoms = svg.getRelatedGeometries(SvUtil.sdiFactory.createGeometry(cell).buffer(-0.1),
					layerType.getObjectId(), SDIRelation.INTERSECTS, null, null, false);

			for (Geometry gg : gridGeoms) {
				DbDataObject parcel = (DbDataObject) gg.getUserData();
				if (parcel.getParentId() > 0L) {
					if (!allFarmIds.contains(parcel.getParentId()))
						allFarmIds.add(parcel.getParentId());
				}
			}
			return allFarmIds;

		}
	}

	public Collection<Long> getParcelIds(ISvCore svc, DbDataObject tile, String parcelLayerName) throws SvException {
		DbDataObject layerType = SvCore.getDbtByName(parcelLayerName);
		Set<Long> allParcels = new HashSet<Long>();

		try (SvGeometry svg = new SvGeometry((SvCore) svc); SvReader svr = new SvReader(svg)) {
			Geometry cell = SvGeometry.getGeometry(tile);
			if (cell == null) {
				SvGrid g = getGrid((String) tile.getVal(SvGrid.GRID_NAME), svc);
				DbDataObject gdbo = g.getTileDbo((String) tile.getVal(SvGrid.GRIDTILE_ID));
				cell = SvGeometry.getGeometry(gdbo);
			}
			Set<Geometry> gridGeoms = svg.getRelatedGeometries(SvUtil.sdiFactory.createGeometry(cell).buffer(-0.1),
					layerType.getObjectId(), SDIRelation.INTERSECTS, null, null, false);

			for (Geometry gg : gridGeoms) {
				DbDataObject parcel = (DbDataObject) gg.getUserData();
				if (parcel.getParentId() > 0L) {
					if (!allParcels.contains((Long) parcel.getVal("OLD_ID")))
						allParcels.add((Long) parcel.getVal("OLD_ID"));
				}
			}
			return allParcels;
		}
	}

	/**
	 * Method to get the number of Farms in the tile of the grid. The tile
	 * descriptor and the layer name of the parcel layer are specified to be used
	 * for counting all parcel parents (farms) which have all of the holding parcels
	 * inside this tile.
	 * 
	 * @param svc             The ISvCore instance which shall be used for
	 *                        connection sharing and authentication
	 * @param tile            The descriptor of the tile which shall be used as
	 *                        filter to identify parcels intersected
	 * @param parcelLayerName The name of the layer (object type) which contains the
	 *                        geometries to be analysed
	 * @return DbDataObject which contains number of matched farms in the field
	 *         "FARM_COUNT"
	 * @throws SvException Any underlying exception is re-thrown
	 */
	public BigDecimal getDeclaredParcels(ISvCore svc, DbDataObject tile, String parcelLayerName) throws SvException {
		BigDecimal rank = new BigDecimal(getParcelIds(svc, tile, parcelLayerName).size());
		return rank;
	}

	public boolean hasOts(Long farmId, SvReader svr, int lastCampaign) throws SvException {
		Integer hasOts = 0;
		CallableStatement cstmt = null;
		try {
			cstmt = svr.dbGetConn().prepareCall("{ ? = call FIELD_CONTROL_CHECK (?,?,?) }");
			DbDataObject farmDbo = svr.getObjectById(farmId, SvCore.getTypeIdByName("FARMER"), null);
			cstmt.setString(2, farmDbo.getVal("FIC").toString());
			cstmt.setInt(3, lastCampaign - 6);
			cstmt.setInt(4, lastCampaign + 1);
			cstmt.registerOutParameter(1, Types.INTEGER);
			cstmt.execute();
			hasOts = cstmt.getInt(1);
		} catch (SQLException e) {
			throw (new SvException("system_err.problemWithFunction_FIELD_CONTROL_CHECK", svr.getInstanceUser(), e));
		} finally {
			SvCore.closeResource((AutoCloseable) cstmt, svr.getInstanceUser());
		}
		return hasOts != 0;
	}

	/*
	 * - број на пријавени (во производен план) СИЗП парцели во зона - големина на
	 * пријавена површина по зона - број на ИДБР кои не биле предмет на контроли во
	 * последните 5 години
	 */
	public BigDecimal otsCount(ISvCore svc, DbDataObject tile, String parcelLayerName, Integer year)
			throws SvException {
		BigDecimal rank = null;
		long otsFarmCount = 0;
		try (SvReader svr = new SvReader((SvCore) svc)) {

			Iterator<Long> farmIterator = getFarmIds(svc, tile, parcelLayerName).iterator();
			while (farmIterator.hasNext()) {
				if (hasOts(farmIterator.next(), svr, year))
					otsFarmCount++;

			}

		}
		int farmCount = getFarmIds(svc, tile, parcelLayerName).size();
		rank = new BigDecimal(otsFarmCount/(double)farmCount*100);
		return rank;
	}

	boolean isFarmSanctioned(ISvCore svc, List<Long> appIds) throws SvException {
		DbSearchExpression expr = new DbSearchExpression();
		for (Long aid : appIds) {
			expr.addDbSearchItem(new DbSearchCriterion(Sv.PARENT_ID, DbCompareOperand.EQUAL, aid, DbLogicOperand.OR));
		}

		DbQueryExpression isAppSanctioned = new DbQueryExpression();
		DbQueryObject dqo = new DbQueryObject(SvCore.getDbtByName("CALC"), expr, null, DbJoinType.INNER);
		dqo.setLinkToNextType(LinkType.CHILD);
		DbQueryObject dqo2 = new DbQueryObject(SvCore.getDbtByName("CALC_SANCTION"), null, null, DbJoinType.INNER);
		isAppSanctioned.addItem(dqo);
		isAppSanctioned.addItem(dqo2);
		DbDataArray result;
		try (SvReader svr = new SvReader((SvCore) svc)) {
			result = svr.getObjects(isAppSanctioned, null, null);
		}
		return result != null && result.size() > 0;
	}

	/*
	 * - број на пријавени (во производен план) СИЗП парцели во зона - големина на
	 * пријавена површина по зона - број на ИДБР кои не биле предмет на контроли во
	 * последните 5 години
	 */
	public BigDecimal sanctionedCount(ISvCore svc, DbDataObject tile, String parcelLayerName, Integer year)
			throws SvException {
		BigDecimal rank = null;
		long sanctionedFarmCount = 0;
		try (SvGeometry svg = new SvGeometry((SvCore) svc); SvReader svr = new SvReader(svg)) {

			Iterator<Long> farmIterator = getFarmIds(svc, tile, parcelLayerName).iterator();
			while (farmIterator.hasNext()) {
				Long farmId = farmIterator.next();
				DbDataArray allApps = svr.getObjectsByParentId(farmId, SvCore.getTypeIdByName("APPLICATION"), null);
				List<Long> appIds = new ArrayList<Long>();
				for (DbDataObject app : allApps.getItems()) {
					
					if (app.getStatus().equals("ADM_CTRL") || app.getStatus().equals("REFUSED")) {
						Long typeId = (Long) app.getVal("APP_TYPE_ID");
						if (getEdbarAppTypes(svc, year).contains(typeId)) {
							appIds.add(app.getObjectId());
						}
					}
				}
				if (appIds.size() > 0 && isFarmSanctioned(svc, appIds))
					sanctionedFarmCount++;

			}
			int farmCount = getFarmIds(svc, tile, parcelLayerName).size();
			rank = new BigDecimal(sanctionedFarmCount/(double)farmCount*100);
		}
		return rank;
	}

	public BigDecimal tileAgriArea(ISvCore svc, DbDataObject tile, String parcelLayerName) throws SvException {
		DbDataObject layerType = SvCore.getDbtByName(parcelLayerName);
		BigDecimal rank = null;
		try (SvGeometry svg = new SvGeometry((SvCore) svc); SvReader svr = new SvReader(svg)) {
			Geometry cell = SvGeometry.getGeometry(tile);
			if (cell == null) {
				SvGrid g = getGrid((String) tile.getVal(SvGrid.GRID_NAME), svc);
				DbDataObject gdbo = g.getTileDbo((String) tile.getVal(SvGrid.GRIDTILE_ID));
				cell = SvGeometry.getGeometry(gdbo);
			}
			Set<Geometry> gridGeoms = svg.getRelatedGeometries(SvUtil.sdiFactory.createGeometry(cell).buffer(-0.1),
					layerType.getObjectId(), SDIRelation.INTERSECTS, null, null, false);
			GeometryCollection gcl = SvUtil.sdiFactory.createGeometryCollection(gridGeoms.toArray(new Geometry[0]));

			double haa = 0;
			if (gcl.getArea() > 0) {
				haa = (gcl.getArea() / 10000);
			}
			rank = new BigDecimal(haa);
		}
		return rank;
	}

}
