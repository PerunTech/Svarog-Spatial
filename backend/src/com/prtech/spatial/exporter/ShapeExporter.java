package com.prtech.spatial.exporter;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.geotools.data.DefaultTransaction;
import org.geotools.data.Transaction;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.SchemaException;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.referencing.CRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;

import com.prtech.spatial.geobuf.GeobufFeature;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.SvUtil;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKTReader;

public class ShapeExporter {
	private SimpleFeature toFeature(DbDataArray dba, SimpleFeatureType POLYGON, GeometryFactory geometryFactory) {

		SimpleFeatureBuilder featureBuilder = new SimpleFeatureBuilder(POLYGON);

		for (DbDataObject dbo : dba.getItems())
			featureBuilder.add(SvGeometry.getGeometry(dbo));
		SimpleFeature retVal = featureBuilder.buildFeature(null);
		return retVal;
	}

	public GeobufFeature createGeobufFeature(Geometry g, Object userData) {

		GeobufFeature feat = new GeobufFeature();
		feat.geometry = (g.getGeometryType().equals("GeometryCollection") ? null : g);
		feat.properties = new HashMap<>();

		if (userData instanceof DbDataObject && userData != null) {
			DbDataObject dbo = (DbDataObject) userData;
			feat.id = dbo.getObjectId().toString();
			feat.properties.put("type", dbo.getObjectType().toString());
			feat.properties.put("status", dbo.getStatus());

			if (dbo.getParentId() != null)
				feat.properties.put("parent_id", dbo.getParentId().toString());

			// Assign default type descriptor if not specified already
			String desc = (String) dbo.getVal("DESCRIPTOR");
			if (desc == null)
				try {
					dbo.setVal("DESCRIPTOR", SvCore.getDbt(dbo.getObjectType()).getVal("TABLE_NAME"));
				} catch (SvException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			// Set feature properties
			dbo.getValuesMap().forEach((k, v) -> {
				if (v != null && !SvGeometry.getGeometryFieldName(dbo.getObjectType()).equals(k.toString()))
					feat.properties.put(k.toString(), v);
			});
		}

		return feat;
	};

	public void toShape(DbDataArray dba)
			throws IOException, SchemaException, ParseException, NoSuchAuthorityCodeException, FactoryException {

		// create simple feature builder for the locations
		SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
		builder.setName("polygonFeature");
		// ovoj string treba da odi preku parameter.
		// SvParameter.getSysParam
		//
		// SvParameter.getSysParam(Sv.SDI_MIN_POINT_DISTANCE,
		// Sv.DEFAULT_MIN_POINT_DISTANCE);
		//
		String crs = "PROJCS[\"unnamed\",GEOGCS[\"Bessel 1841\",DATUM[\"unknown\",SPHEROID[\"bessel\",6377397.155,299.1528128],TOWGS84[521.748,229.489,590.921,-4.029,-4.488,15.521,-9.78]],PRIMEM[\"Greenwich\",0],UNIT[\"degree\",0.0174532925199433]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",21],PARAMETER[\"scale_factor\",0.9999],PARAMETER[\"false_easting\",7500000],PARAMETER[\"false_northing\",0],UNIT[\"Meter\",1],AUTHORITY[\"epsg\",\"6316\"]]";
		org.opengis.referencing.crs.CoordinateReferenceSystem sourceCRS = CRS.parseWKT(crs);

		builder.setCRS(sourceCRS);
		builder.add("the_geom", Polygon.class);
		SimpleFeatureType POLYGON = builder.buildFeatureType();

		DefaultFeatureCollection collection = new DefaultFeatureCollection();

		GeometryFactory gf = SvUtil.sdiFactory;
		WKTReader wkr = new WKTReader(gf);

		SimpleFeature feature = toFeature(dba, POLYGON, gf);
		collection.add(feature);
		collection.forEach(name -> System.out.println(name));

		File shapeFile = new File(new File("2020-").getAbsolutePath() + "shapefile.shp");

		Map<String, Serializable> params = new HashMap<>();
		params.put("url", shapeFile.toURI().toURL());
		params.put("create spatial index", Boolean.TRUE);

		ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();

		ShapefileDataStore dataStore = (ShapefileDataStore) dataStoreFactory.createNewDataStore(params);
		dataStore.createSchema(POLYGON);

		Transaction transaction = new DefaultTransaction("create");

		String typeName = dataStore.getTypeNames()[0];
		SimpleFeatureSource featureSource = dataStore.getFeatureSource(typeName);

		if (featureSource instanceof SimpleFeatureStore) {
			SimpleFeatureStore featureStore = (SimpleFeatureStore) featureSource;
			featureStore.setTransaction(transaction);
			try {
				featureStore.addFeatures(collection);
				transaction.commit();

			} catch (Exception problem) {
				transaction.rollback();
			} finally {
				transaction.close();
			}
		}
	}
}
