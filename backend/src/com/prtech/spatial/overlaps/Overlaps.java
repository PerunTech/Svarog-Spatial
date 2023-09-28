package com.prtech.spatial.overlaps;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;


import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.impl.Log4jContextFactory;
import org.joda.time.DateTime;

import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvSDITile.SDIRelation;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import org.locationtech.jts.geom.Geometry;

public class Overlaps {
	static final Logger log4j = SvConf.getLogger(Overlaps.class);
	static BigDecimal bdZero = new BigDecimal(0);
	DateTime cutOverDate;
	DbDataObject application;

	public Overlaps(DateTime cutover, DbDataObject application) {
		this.cutOverDate = cutover;
		this.application = application;
	}

	boolean commonUseValid(DbDataObject dbo, Collection<Geometry> gc) {

		Long lpis = (Long) dbo.getVal("old_id");
		BigDecimal lpisArea = (BigDecimal) dbo.getVal("AREA");
		BigDecimal lpisSumArea = (BigDecimal) dbo.getVal("ALLOWED_AREA");
		if (lpisSumArea == null || !(lpisSumArea.compareTo(bdZero) > 0))
			return false;

		for (Geometry g : gc) {
			DbDataObject dbintersect = (DbDataObject) g.getUserData();
			if (dbintersect.getObjectId() != dbo.getObjectId() &&  lpis.equals(dbintersect.getVal("old_id"))) {
				BigDecimal b = (BigDecimal) dbintersect.getVal("ALLOWED_AREA");
				if (b == null)
					return false;
				lpisSumArea = lpisSumArea.add(b);
			}
		}
		lpisSumArea.setScale(1, RoundingMode.HALF_UP);
		lpisArea.setScale(1, RoundingMode.HALF_UP);
		if (lpisSumArea.compareTo(lpisArea) > 0) {
			log4j.debug("Total sum:" + lpisSumArea.toString() + " while max area:" + lpisArea.toString()
					+ " oldid:" + lpis.toString());
			return false;
		}
		return true;
	}

	public boolean hasOverlap(SvCore svc) throws SvException {
		boolean hasOverlap = false;
		try (SvReader svr = new SvReader(svc); SvGeometry svg = new SvGeometry(svc)) {
			svr.setIncludeGeometries(true);
			DbDataObject dbtAPTypes = SvCore.getDbtByName("AGRI_PARCEL");
			DbDataArray agriParcels = svr.getObjectsByParentId(application.getParentId(), dbtAPTypes.getObjectId(),
					cutOverDate);

			for (DbDataObject parcel : agriParcels.getItems()) {
				Geometry geom = SvGeometry.getGeometry(parcel);
				Collection<Geometry> related = svg.getRelatedGeometries(geom, dbtAPTypes.getObjectId(),
						SDIRelation.INTERSECTS, null, agriParcels, false, true, true, cutOverDate);
				if ((Boolean) parcel.getVal("COMMON_USE")) {
					if (!commonUseValid(parcel, related)) {
						log4j.debug("Parcel has invalid common use:" + parcel.getObjectId());
						hasOverlap = true;
					}
				} else if (related.size() > 0) {
					for (Geometry gr : related) {
						Geometry fin = geom.intersection(gr);
						if (fin.getArea() > 1) {
							DbDataObject dbr = (DbDataObject) gr.getUserData();
							log4j.debug("Parcel has no common use, but area overlaps: " + fin.getArea() + " :"
									+ parcel.getVal("old_id") + "/" + parcel.getObjectId() + " and "
									+ dbr.getVal("old_id") + "/" + dbr.getObjectId());
							hasOverlap = true;
						}
					}
				}
			}

		}
		return hasOverlap;
	}
}
