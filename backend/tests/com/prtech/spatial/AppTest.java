package com.prtech.spatial;

import static org.junit.Assert.fail;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.BeforeClass;
import org.junit.Test;
import org.locationtech.proj4j.CRSFactory;
import org.locationtech.proj4j.CoordinateReferenceSystem;
import org.locationtech.proj4j.CoordinateTransform;
import org.locationtech.proj4j.CoordinateTransformFactory;
import org.locationtech.proj4j.ProjCoordinate;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.prtech.spatial.cwrs.zones.Ranking;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
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
				BigDecimal rank = rnk.rankTile(svs, tile, "AGRI_PARCEL", 1);
				if (rank == null)
					fail("No farms were counted");

				System.out.println(rank.toString());
			}

		}
	}

	@Test
	public void testExif() throws SvException, ImageProcessingException, IOException {
		File file = new File("test-data/468083.00000000 28_1_20200921_124004.jpg");
		CRSFactory crsFactory = new CRSFactory();
		CoordinateReferenceSystem systemCRS = (CoordinateReferenceSystem) crsFactory.createFromName("epsg:6316" );
		ProjCoordinate p = Util.readImgCoordinates(file, null, systemCRS);
		System.out.println(p);
	}
}
