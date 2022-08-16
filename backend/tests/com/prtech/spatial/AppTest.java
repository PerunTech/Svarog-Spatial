package com.prtech.spatial;

import static org.junit.Assert.fail;

import java.io.File;
import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.commons.imaging.ImageReadException;
import org.apache.commons.imaging.ImageWriteException;

import org.junit.Test;
import org.locationtech.proj4j.CRSFactory;
import org.locationtech.proj4j.CoordinateReferenceSystem;
import org.locationtech.proj4j.ProjCoordinate;
import org.geotools.feature.SchemaException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;

import com.drew.imaging.ImageProcessingException;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.prtech.spatial.cwrs.zones.Ranking;
import com.prtech.spatial.exporter.ShapeExporter;
import com.prtech.spatial.geobuf.GeobufEncoder;
import com.prtech.spatial.geobuf.GeobufFeature;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;

import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvSecurity;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKTReader;
import com.vividsolutions.jts.simplify.TopologyPreservingSimplifier;

import java.awt.image.BufferedImage;
import org.apache.commons.imaging.FormatCompliance;
import org.apache.commons.imaging.common.bytesource.ByteSourceFile;
import org.apache.commons.imaging.formats.tiff.TiffContents;
import org.apache.commons.imaging.formats.tiff.TiffDirectory;
import org.apache.commons.imaging.formats.tiff.TiffField;
import org.apache.commons.imaging.formats.tiff.TiffReader;

/**
 * Unit test for simple App.
 */
public class AppTest {

	static String token = null;

	public static void initToken() throws SvException {
		try (SvSecurity svs = new SvSecurity()) {
			token = svs.logon("ADMIN", SvUtil.getMD5("welcome13"));
		}
	}

	public void testRank() throws SvException {
		initToken();
		try (SvReader svs = new SvReader(token)) {
			if (SvCore.getDbtByName("AGRI_PARCEL") == null)
				return;
			Ranking rnk = new Ranking("KNT_2020");
			DbDataArray selectedTiles = rnk.getAgriTiles(svs, "AGRI_PARCEL", "3:8", 15.0);
			System.out.println("Selected " + selectedTiles.size() + " is selected!");
			for (DbDataObject tile : selectedTiles.getItems()) {
				BigDecimal rank;

				rank = rnk.rankTile(svs, tile, "AGRI_PARCEL");
				if (rank == null)
					fail("No farms were counted");
				System.out.println("FIC Count:" + rank.toString());

				rank = rnk.getDeclaredParcels(svs, tile, "AGRI_PARCEL");
				if (rank == null)
					fail("No parcels were counted");
				System.out.println("Parcel Count:" + rank.toString());

				rank = rnk.otsCount(svs, tile, "AGRI_PARCEL", 2021);
				if (rank == null)
					fail("No OTs were counted");
				System.out.println("OTS Count:" + rank.toString());

				rank = rnk.sanctionedCount(svs, tile, "AGRI_PARCEL", 2021);
				if (rank == null)
					fail("No Sanction were counted");
				System.out.println("Sanction Count:" + rank.toString());

			}

		}
	}

	public void testExif() throws SvException, ImageProcessingException, IOException {
		File file = new File("test-data/468083.00000000 28_1_20200921_124004.jpg");
		CRSFactory crsFactory = new CRSFactory();
		CoordinateReferenceSystem systemCRS = (CoordinateReferenceSystem) crsFactory.createFromName("epsg:6316");
		InputStream inputStream = new FileInputStream(file);
		ProjCoordinate p = null;
		try {
			p = Util.readImgCoordinates(inputStream, -1, null, systemCRS, file.getName());
		} catch (Exception e) {
			e.printStackTrace();
			fail("Reading coordinates threw exception");
		} finally {
			inputStream.close();
		}

		System.out.println(p);
	}

	public void testNoExif() throws SvException, ImageProcessingException, IOException {
		File file = new File("test-data/468083.00000000 28_1_20200921_124004-noexif.jpg");
		CRSFactory crsFactory = new CRSFactory();
		CoordinateReferenceSystem systemCRS = (CoordinateReferenceSystem) crsFactory.createFromName("epsg:6316");
		InputStream inputStream = new FileInputStream(file);
		ProjCoordinate p = null;
		try {
			p = Util.readImgCoordinates(inputStream, -1, null, systemCRS, file.getName());
			if (p != null)
				fail("Projected coordinates should be null when exif is broken");
		} finally {
			inputStream.close();
		}

	}

	@Test
	public void testReadWriteTags() throws ImageWriteException, ImageReadException, IOException {
		final File target = new File("test-data/etst.tiff");
		String rootName = null;

		final boolean optionalImageReadingEnabled = rootName != null && !rootName.isEmpty();

		final ByteSourceFile byteSource = new ByteSourceFile(target);
		final HashMap<String, Object> params = new HashMap<>();

		// Establish a TiffReader. This is just a simple constructor that
		// does not actually access the file. So the application cannot
		// obtain the byteOrder, or other details, until the contents has
		// been read. Then read the directories associated with the
		// file by passing in the byte source and options.
		final TiffReader tiffReader = new TiffReader(true);
		final TiffContents contents = tiffReader.readDirectories(byteSource, optionalImageReadingEnabled, // read
																											// imagepresent
				FormatCompliance.getDefault());

		// Loop on the directories and fetch the metadata and
		// image (if available, and configured to do so)
		int iDirectory = 0;
		for (final TiffDirectory directory : contents.directories) {
			// Get the metadata (Tags) and write them to standard output
			final boolean hasTiffImageData = directory.hasTiffImageData();
			System.out.format("Directory %2d %s, description: %s%n", iDirectory,
					hasTiffImageData ? "Has TIFF Image Data" : "No TIFF Image Data", directory.description());
			// Loop on the fields, printing the metadata (fields) ----------
			final List<TiffField> fieldList = directory.getDirectoryEntries();
			for (final TiffField tiffField : fieldList) {
				String s = tiffField.toString();
				// In the case if the offsets (file positions) for the Strips
				// or Tiles, the string may be way too long for output and
				// will be truncated. Therefore, indicate the numnber of entries.
				// These fields are indicated by numerical tags 0x144 and 0x145
				if (tiffField.getTag() == 0x144 || tiffField.getTag() == 0x145) {
					final int i = s.indexOf(')');
					final int[] a = tiffField.getIntArrayValue();
					s = s.substring(0, i + 2) + " [" + a.length + " entries]";
				}
				System.out.println(" " + s);
			}

			if (optionalImageReadingEnabled && hasTiffImageData) {
				final File output = new File(rootName + "_" + iDirectory + ".jpg");
				System.out.println("Writing image to " + output.getPath());
				final BufferedImage bImage = directory.getTiffImage(params);
				ImageIO.write(bImage, "JPEG", output);
			}
			System.out.println("");
			iDirectory++;
		}
	}

	// @Test
	public void testdedup() throws ParseException, SvException {
		String deduPoly = "POLYGON ((7549667.66 4656038.028, 7549667.645 4656038.031, 7549660.05 4656038.58, 7549648.21 4656039.741, 7549640.066 4656035.269, 7549631.13 4656027.349, 7549627.778 4656021.335, 7549627.38 4656014.53, 7549620.341 4656004.833, 7549617.9 4656001.47, 7549620.16 4655979.01, 7549622.19 4655958.3, 7549625.85 4655948.957, 7549639.66 4655933.319, 7549646.971 4655924.587, 7549652.454 4655922.556, 7549661.187 4655924.384, 7549667.077 4655926.618, 7549669.514 4655933.116, 7549671.339 4655949.569, 7549672.761 4655959.318, 7549675.88 4655979.39, 7549674.29 4655994.87, 7549671.33 4656002.94, 7549663.4 4656009.69, 7549667.66 4656038.028))";
		GeometryFactory gf = SvUtil.sdiFactory;
		WKTReader wkr = new WKTReader(gf);

		Geometry geom = wkr.read(deduPoly);
		// the polygon has double points
		System.out.println(geom.getCoordinates().length);
		initToken();
		geom = TopologyPreservingSimplifier.simplify(geom, 0.01);
		// geom = Util.deduplicatePolygon((Polygon) geom, 0.01);
		System.out.println(geom.getCoordinates().length);
		try (SvGeometry g = new SvGeometry(token)) {
			g.testMinVertexDistance(geom, 0.01);
		} catch (Exception e) {
			System.out.println("ok, duplicates found");
		}
		geom = TopologyPreservingSimplifier.simplify(geom, 0.01);
		System.out.println(geom.getCoordinates().length);
		try (SvGeometry g = new SvGeometry(token)) {
			g.testMinVertexDistance(geom, 0.01);
		} catch (Exception e) {
			System.out.println("again, duplicates found");
		}
		System.out.println(geom.getCoordinates().length);
	}

	// @Test
	public void testExport() throws ParseException, SvException, NoSuchAuthorityCodeException, IOException,
			SchemaException, FactoryException {
		String deduPoly = "POLYGON ((7549667.66 4656038.028, 7549667.645 4656038.031, 7549660.05 4656038.58, 7549648.21 4656039.741, 7549640.066 4656035.269, 7549631.13 4656027.349, 7549627.778 4656021.335, 7549627.38 4656014.53, 7549620.341 4656004.833, 7549617.9 4656001.47, 7549620.16 4655979.01, 7549622.19 4655958.3, 7549625.85 4655948.957, 7549639.66 4655933.319, 7549646.971 4655924.587, 7549652.454 4655922.556, 7549661.187 4655924.384, 7549667.077 4655926.618, 7549669.514 4655933.116, 7549671.339 4655949.569, 7549672.761 4655959.318, 7549675.88 4655979.39, 7549674.29 4655994.87, 7549671.33 4656002.94, 7549663.4 4656009.69, 7549667.66 4656038.028))";
		GeometryFactory gf = SvUtil.sdiFactory;
		WKTReader wkr = new WKTReader(gf);

		Geometry geom = wkr.read(deduPoly);
		// the polygon has double points
		System.out.println(geom.getCoordinates().length);
	}

	// @Test
	public void testToShape() throws SvException, ParseException, FactoryException {
		initToken();
		try (SvReader svr = new SvReader(token)) {
			svr.setIncludeGeometries(true);
			ShapeExporter se = new ShapeExporter();
			DbDataArray dba = svr.getObjectsByParentId(81838940L, SvCore.getTypeIdByName("AGRI_PARCEL"), null);
			if (!dba.isEmpty())
				se.toShape(dba.get(0));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void testGbuf() throws ParseException, SvException, NoSuchAuthorityCodeException, IOException,
			SchemaException, FactoryException {
		String deduPoly = "POLYGON ((7549667.66 4656038.028, 7549667.645 4656038.031, 7549660.05 4656038.58, 7549648.21 4656039.741, 7549640.066 4656035.269, 7549631.13 4656027.349, 7549627.778 4656021.335, 7549627.38 4656014.53, 7549620.341 4656004.833, 7549617.9 4656001.47, 7549620.16 4655979.01, 7549622.19 4655958.3, 7549625.85 4655948.957, 7549639.66 4655933.319, 7549646.971 4655924.587, 7549652.454 4655922.556, 7549661.187 4655924.384, 7549667.077 4655926.618, 7549669.514 4655933.116, 7549671.339 4655949.569, 7549672.761 4655959.318, 7549675.88 4655979.39, 7549674.29 4655994.87, 7549671.33 4656002.94, 7549663.4 4656009.69, 7549667.66 4656038.028))";
		GeometryFactory gf = SvUtil.sdiFactory;
		WKTReader wkr = new WKTReader(gf);

		Geometry geom = wkr.read(deduPoly);
		String input = "{\"type\":\"Feature\",\"properties\":{},\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[7549677.4457,4530304.3899],[7549695.3881,4530279.6366]]}}";
		Gson gs = new Gson();
		JsonObject json = gs.fromJson(input, JsonObject.class);
		Geometry g = (LineString) Util.jsonToGeometry(json);
		HashMap<String, Object> mp = new HashMap<>();
		mp.put("1", 1);
		mp.put("CENTROID", "SSSSSSSSSSSSSSSSSSSSSSSSS");
		g.setUserData(mp);
		List<Geometry> gg = new ArrayList<>();
		gg.add(g);
		OutputStream os = new FileOutputStream(FileDescriptor.out);
		GeobufEncoder enc = new GeobufEncoder(os, 1);
		GeobufFeature gf1 = enc.createGeobufFeature(g, g.getUserData());
		if (gf1.properties == null)
			fail("proerties not set");
		enc.writeSvGeometry(gg);
		System.out.println(gg.toString());

	};
}
