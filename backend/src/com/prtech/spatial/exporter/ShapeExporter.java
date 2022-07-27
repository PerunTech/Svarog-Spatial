package com.prtech.spatial.exporter;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.geotools.data.DefaultTransaction;
import org.geotools.data.FileDataStoreFinder;
import org.geotools.data.Transaction;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.referencing.CRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.FactoryException;

import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;

import com.prtech.svarog_common.DbDataObject;
import com.vividsolutions.jts.geom.Polygon;

public class ShapeExporter {

	public static final String USER_DATA_PARENT_ID = "parent_id";
	public static final String USER_DATA_OBJECT_ID = "object_id";
	public static final String USER_DATA_OBJECT_TYPE = "type";
	public static final String USER_DATA_STATUS = "status";
	public static final String USER_DATA_TABLE_NAME = "table_name";
	public static final String USER_DATA_AREA = "area";
	public static final String USER_DATA_THE_GEOM = "the_geom";

	private SimpleFeatureType getPolygonSimpleFeatureType() throws FactoryException {
		SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
		String crs = SvConf.getParam("shape.exporter.crs");
		org.opengis.referencing.crs.CoordinateReferenceSystem sourceCRS = CRS.parseWKT(crs);
		builder.setName("polygonFeature");
		builder.setCRS(sourceCRS);
		builder.setDefaultGeometry(USER_DATA_THE_GEOM);
		builder.add(USER_DATA_THE_GEOM, Polygon.class);
		builder.add(USER_DATA_OBJECT_ID, Long.class);
		builder.add(USER_DATA_OBJECT_TYPE, Long.class);
		builder.add(USER_DATA_TABLE_NAME, String.class);
		builder.add(USER_DATA_STATUS, String.class);
		builder.add(USER_DATA_AREA, Double.class);
		return builder.buildFeatureType();
	}

	private SimpleFeature toFeature(DbDataObject dbo, SimpleFeatureType polygon) throws SvException {
		SimpleFeatureBuilder featureBuilder = new SimpleFeatureBuilder(polygon);
		featureBuilder.add(SvGeometry.getGeometry(dbo));
		featureBuilder.add(dbo.getObjectId());
		featureBuilder.add(dbo.getObjectType());
		featureBuilder.add(SvCore.getDbt(dbo.getObjectType()).getVal("TABLE_NAME").toString());
		featureBuilder.add(dbo.getStatus());
		featureBuilder.add(dbo.getVal("AREA") != null ? Double.valueOf(dbo.getVal("AREA").toString()) : 0D);
		return featureBuilder.buildFeature(null);
	}

	public File toShape(DbDataObject dbo) throws IOException, FactoryException, SvException {
		SimpleFeatureType polygonSFT = getPolygonSimpleFeatureType();
		DefaultFeatureCollection collection = new DefaultFeatureCollection();

		SimpleFeature feature = toFeature(dbo, polygonSFT);
		collection.add(feature);
		File shapeFile = new File(new File(dbo.getObjectId().toString()).getAbsolutePath() + ".shp");
		shapeFile.setReadOnly();

		Map<String, Serializable> params = new HashMap<>();
		params.put("url", shapeFile.toURI().toURL());
		params.put("create spatial index", Boolean.TRUE);

		ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();
		dataStoreFactory.createNewDataStore(params);

		ShapefileDataStore dataStore = (ShapefileDataStore) FileDataStoreFinder.getDataStore(shapeFile);
		dataStore.setDataStoreFactory(dataStoreFactory);
		dataStore.createSchema(polygonSFT);

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
		return shapeFile;
	}
}
