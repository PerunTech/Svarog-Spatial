package com.prtech.spatial;

import static org.junit.Assert.fail;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import org.junit.BeforeClass;
import org.junit.Test;

import com.prtech.spatial.cwrs.zones.Ranking;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvGrid;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvSecurity;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog.SvSDITile.SDIRelation;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryCollection;

/**
 * Unit test for simple App.
 */
public class AppTest {
	static String token = null;

	public static void initToken() throws SvException {
		try (SvSecurity svs = new SvSecurity()) {
			token = svs.logon("ADMIN", SvUtil.getMD5("welcome"));
		}
	}

	public void testRank() throws SvException {
		if (SvCore.getDbtByName("AGRI_PARCEL") == null)
			return;
		try (SvReader svs = new SvReader(token)) {
			Ranking rnk = new Ranking("KNT_2020");
			DbDataArray selectedTiles = rnk.getAgriTiles(svs, "AGRI_PARCEL", "11:12", 15.0);
			System.out.println("Selected " + selectedTiles.size() + " is selected!");
			for (DbDataObject tile : selectedTiles.getItems()) {
				DbDataObject rank = rnk.rankTile(svs, tile, "AGRI_PARCEL", 1);
				if (rank.getVal("FARM_COUNT") == null)
					fail("No farms were counted");

				System.out.println(rank.toSimpleJson().toString());
			}

		}
	}
}
