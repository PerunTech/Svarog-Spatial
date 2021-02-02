package com.prtech.spatial.cwrs.zones;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.apache.logging.log4j.Logger;

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
			Set<Geometry> b = SvGeometry.getSysBoundary().getInternalGeometries();
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
	public DbDataArray getAgriTiles(ISvCore svc, String parcelLayerName, String tileNameFilter, double agriculturalAreaPercent)
			throws SvException {
		DbDataArray selectedTiles = new DbDataArray();
		try (SvGeometry svg = new SvGeometry((SvCore) svc)) {
			SvGrid grid = getGrid(gridName, svc);
			Set<Geometry> gridset = grid.getInternalGeometries();
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
	 * Method to rank a tile of the grid. The tile descriptor and the layer name of
	 * the parcel layer are specified to be used for counting all parcel parents
	 * (farms) which have all of the holding parcels inside this tile.
	 * 
	 * @param svc             The ISvCore instance which shall be used for
	 *                        connection sharing and authentication
	 * @param tile            The descriptor of the tile which shall be used as
	 *                        filter to identify parcels intersected
	 * @param parcelLayerName The name of the layer (object type) which contains the
	 *                        geometries to be analysed
	 * @param tolerance       Value to be used as tolerance in the parcel count. A
	 *                        value of 1 means that a farm with all parcels, except
	 *                        1 inside the tile shall be counted towards the result
	 * @return DbDataObject which contains number of matched farms in the field
	 *         "FARM_COUNT"
	 * @throws SvException Any underlying exception is re-thrown
	 */
	public BigDecimal rankTile(ISvCore svc, DbDataObject tile, String parcelLayerName, Integer tolerance)
			throws SvException {
		DbDataObject layerType = SvCore.getDbtByName(parcelLayerName);
		BigDecimal rank = null;
		long farmCount = 0;
		int intTolerance = tolerance != null ? tolerance.intValue() : 0;
		try (SvGeometry svg = new SvGeometry((SvCore) svc); SvReader svr = new SvReader(svg)) {
			Geometry cell = SvGeometry.getGeometry(tile);
			Set<Geometry> gridGeoms = svg.getRelatedGeometries(SvUtil.sdiFactory.createGeometry(cell).buffer(-0.1),
					layerType.getObjectId(), SDIRelation.INTERSECTS, null, null, false);
			Set<Long> allFarmIds = new HashSet<Long>();
			Set<Long> allParcelIds = new HashSet<Long>();

			for (Geometry gg : gridGeoms) {
				DbDataObject parcel = (DbDataObject) gg.getUserData();
				if (parcel.getParentId() > 0L) {
					allParcelIds.add(parcel.getObjectId());
					if (!allFarmIds.contains(parcel.getParentId()))
						allFarmIds.add(parcel.getParentId());
				}

			}

			Iterator<Long> farmIterator = allFarmIds.iterator();
			while (farmIterator.hasNext()) {
				Long farmId = farmIterator.next();
				DbDataArray allFarmParcels = svr.getObjectsByParentId(farmId, layerType.getObjectId(), null);
				if (verifyParcelCount(allParcelIds, allFarmParcels, intTolerance)) {
					farmCount++;
				}

			}
			rank = new BigDecimal(farmCount);
		}
		return rank;
	}

}
