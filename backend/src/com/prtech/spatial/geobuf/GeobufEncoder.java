package com.prtech.spatial.geobuf;

import java.io.ByteArrayOutputStream;
import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.mapdb.Serializer;

import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog_common.DbDataArray;
import com.prtech.svarog_common.DbDataObject;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.Polygon;

/**
 * Encode features to GeoBuf.
 * 
 * `#revise_me`
 * Made everything public. Eventually hide the important bits.
 * It should be done the opposite way private => public, so we don't break callers, 
 * but what can you do.
 *  
 * Revise method signatures, simplify / tweak streaming api.
 * Definitely revisit createGeobufFeature method!
 * Test this.
 */
public class GeobufEncoder {
	static final Logger LOG = LogManager.getLogger(GeobufEncoder.class.getName());

    /** What to multiply floating point values by to get desired precision */
    public final long precisionMultiplier;
    public final int precision;
    public boolean includeGeometries; //`#revise_me`, revise this.
    private OutputStream outputStream;
    
	public GeobufEncoder (OutputStream outputStream, int precision) {
		this(outputStream, precision, true);
	};
	
	public GeobufEncoder (OutputStream outputStream, int precision, boolean includeGeometries) {
        this.outputStream = outputStream;
        this.precision = precision;
        this.precisionMultiplier = (long) Math.pow(10, precision);
		this.includeGeometries = includeGeometries;
	};
	
    public static class GeobufFeatureSerializer extends Serializer<GeobufFeature> implements Serializable {
		private static final long serialVersionUID = 1L;

		public final int precision;

        private transient GeobufEncoder encoder;

        public GeobufFeatureSerializer (int precision) {
            this.precision = precision;
        }

        @Override
        public void serialize(DataOutput dataOutput, GeobufFeature geobufFeature) throws IOException {
            GeobufEncoder enc = getEncoder();
            // This could be more efficient, we're wrapping a single feature in a feature collection. But that way the key/value
            // serialization all works.
            Geobuf.Data feat = enc.buildData(Arrays.asList(geobufFeature));
            byte[] data = feat.toByteArray();
            dataOutput.writeInt(data.length);
            dataOutput.write(data);
        }

        @Override
        public GeobufFeature deserialize(DataInput dataInput, int i) throws IOException {
            int len = dataInput.readInt();
            byte[] feat = new byte[len];
            dataInput.readFully(feat);
            Geobuf.Data data = Geobuf.Data.parseFrom(feat);

            return new GeobufFeature(data.getFeatureCollection().getFeatures(0), data.getKeysList(), Math.pow(10, data.getPrecision()));
        }

        /** get the geobuf encoder, lazy initializing if needed. JVM should inline this function */
        private GeobufEncoder getEncoder () {
            if (encoder == null) {
                synchronized (this) {
                    if (encoder == null) {
                        encoder = new GeobufEncoder(new ByteArrayOutputStream(), precision);
                    }
                }
            }

            return encoder;
        }
    }
	
	public GeobufFeature createGeobufFeature (Geometry g, Object userData) {

		GeobufFeature feat = new GeobufFeature();
		feat.geometry = g;	// should we allow feat.geometry: null ?
		feat.properties = new HashMap<>();

		if (userData instanceof DbDataObject && userData != null) {
			DbDataObject dbo = (DbDataObject) userData;
			feat.id = dbo.getObject_id().toString();
			
			if (dbo.getParent_id() != null)
				feat.properties.put("parent_id", dbo.getParent_id().toString());
			
			// Assign default type descriptor if not specified already
			String desc = (String) dbo.getVal("DESCRIPTOR");
			if (desc == null)
				try {
					dbo.setVal("DESCRIPTOR", SvCore.getDbt(dbo.getObject_type()).getVal("TABLE_NAME"));
				} catch (SvException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			
			// Set feature properties 
			dbo.getValuesMap().forEach((k,v) -> {
				if (v != null) // should we send null vallues flying over the internet?
					feat.properties.put(k.toString(),v);				
			});			
		}
		
		return feat;
	};
    
	public Collection<GeobufFeature> dbDataArrayToGeobuf (DbDataArray dbArr) {
		Collection<GeobufFeature> gbfc = new ArrayList<GeobufFeature>();
		Geometry g = null;
		
		for (DbDataObject dbo: dbArr.getItems()) {
			if (SvGeometry.hasGeometries(dbo.getObject_type())) {
				g = SvGeometry.getGeometry(dbo);			
			}
				
			gbfc.add(createGeobufFeature(g, dbo));
		}
		
		return gbfc;
	};
	
    public Geobuf.Data.Geometry pointToGeobuf(Point point) {
        return Geobuf.Data.Geometry.newBuilder()
                .setType(Geobuf.Data.Geometry.Type.POINT)
                .addCoords((long) (point.getX() * precisionMultiplier))
                .addCoords((long) (point.getY() * precisionMultiplier))
                .build();
    }	

	public Geobuf.Data.Geometry lineStringToGeobuf (LineString ls) {
		Geobuf.Data.Geometry.Builder builder = Geobuf.Data.Geometry.newBuilder();
		builder.setType(Geobuf.Data.Geometry.Type.LINESTRING);
		
		long x, y, prevX = 0, prevY = 0;
		
		for (int i = 0; i < ls.getNumPoints(); i++) {
			// delta code, roundoff errors do not accumulate
			Coordinate cd = ls.getCoordinateN(i);
			x = (long) (cd.x * precisionMultiplier);
			y = (long) (cd.y * precisionMultiplier);
			
			builder.addCoords(x - prevX);
			builder.addCoords(y - prevY);
			
			prevX = x;
			prevY = y;
		}
		
		return builder.build();		
	};
	
    public Geobuf.Data.Geometry polyToGeobuf (Polygon poly) {
        Geobuf.Data.Geometry.Builder builder = Geobuf.Data.Geometry.newBuilder()
                .setType(Geobuf.Data.Geometry.Type.POLYGON);

        Stream<LineString> interiorRings = IntStream.range(0, poly.getNumInteriorRing())
                .mapToObj(poly::getInteriorRingN);

        Stream.concat(Stream.of(poly.getExteriorRing()), interiorRings)
                .forEach(r -> addRing(r, builder));

        return builder.build();
    }
	
    public Geobuf.Data.Geometry multiPolyToGeobuf (MultiPolygon poly) {
        Geobuf.Data.Geometry.Builder builder = Geobuf.Data.Geometry.newBuilder()
                .setType(Geobuf.Data.Geometry.Type.MULTIPOLYGON);

        // first we specify the number of polygons
        builder.addLengths(poly.getNumGeometries());

        for (int i = 0; i < poly.getNumGeometries(); i++) {
            Polygon p = (Polygon) poly.getGeometryN(i);
            // how many rings there are
            builder.addLengths(p.getNumInteriorRing() + 1);

            Stream<LineString> interiorRings = IntStream.range(0, p.getNumInteriorRing())
                    .<LineString>mapToObj(p::getInteriorRingN);

            Stream.concat(Stream.of(p.getExteriorRing()), interiorRings)
                    .forEach(r -> addRing(r, builder));
        }

        return builder.build();
    }    

    /** Add a ring to a builder */
    private void addRing(LineString r, Geobuf.Data.Geometry.Builder builder) {
        // skip last point, same as first
        builder.addLengths(r.getNumPoints() - 1);

        long x, y, prevX = 0, prevY = 0;

        // last point is same as first, skip
        for (int i = 0; i < r.getNumPoints() - 1; i++) {
            // delta code
            Coordinate coord = r.getCoordinateN(i);
            // note that roundoff errors do not accumulate
            x = (long) (coord.x * precisionMultiplier);
            y = (long) (coord.y * precisionMultiplier);
            builder.addCoords(x - prevX);
            builder.addCoords(y - prevY);
            prevX = x;
            prevY = y;
        }
    }    
    
	private Geobuf.Data.Geometry buildGeometry (Geometry geom) {
        if (geom instanceof Point)
            return pointToGeobuf((Point) geom);
        else if (geom instanceof LineString)
            return lineStringToGeobuf((LineString) geom);
        else if (geom instanceof Polygon)
            return polyToGeobuf((Polygon) geom);
        else if (geom instanceof MultiPolygon)
            return multiPolyToGeobuf((MultiPolygon) geom);
        else
            throw new UnsupportedOperationException("Unsupported geometry type " + geom.getGeometryType());

    }
	
	private void setProperties (Geobuf.Data.Feature.Builder featBld, GeobufFeature feature, List<String> keys) {
        
		for (Map.Entry<String, Object> e : feature.properties.entrySet()) {
            // TODO store keys separately from features
            Geobuf.Data.Value.Builder val = Geobuf.Data.Value.newBuilder();

            Object featVal = e.getValue();
            
            // init encoder with geometry boolean to include geometry data as string into feature.properties map
            // geometry data excluded by default, makes objects lighter, feature.geometry already contains the data
            if (featVal instanceof Geometry) {
            	if (this.includeGeometries)
            		val.setStringValue(featVal.toString());
            	else continue;
            }
            else if (featVal instanceof String)
                val.setStringValue((String) featVal);
            else if (featVal instanceof Boolean)
                val.setBoolValue((Boolean) featVal);
            else if (featVal instanceof Integer) {
                int keyInt = (Integer) featVal;
                if (keyInt >= 0)
                    val.setPosIntValue(keyInt);
                else
                    val.setNegIntValue(keyInt);
            }
            else if (featVal instanceof Long) {
                long keyLong = (Long) featVal;
                if (keyLong >= 0)
                    val.setPosIntValue(keyLong);
                else
                    val.setNegIntValue(keyLong);
            }
            else if (featVal instanceof Double || featVal instanceof Float)	// BigDecimal?
                val.setDoubleValue(((Number) featVal).doubleValue());
            else {
                // TODO serialize to JSON
                LOG.debug("Unable to save object of type " + featVal.getClass().getTypeName() +" to geobuf, falling back on toString. Deserialization will not work as expected.", featVal.getClass());
                val.setStringValue(featVal.toString());
            }

            int keyIdx = keys.indexOf(e.getKey());
            if (keyIdx == -1) {
                synchronized (keys) {
                    keyIdx = keys.size();
                    keys.add(e.getKey());
                }
            }

            // properties is a jagged array of [key index, value index, . . .]
            featBld.addProperties(keyIdx);
            featBld.addProperties(featBld.getValuesCount());
            featBld.addValues(val);
        }		
	}

	private void setId (Geobuf.Data.Feature.Builder featBld, GeobufFeature feature) {
        
		if (feature.id != null) {
     	   featBld.setId(feature.id);
     	   featBld.clearIntId();
        }
        else {
     	   featBld.setIntId(feature.numericId);
     	   featBld.clearId();
        }		
	}

	private Geobuf.Data.Feature buildFeature (GeobufFeature feature, List<String> keys) {

		Geobuf.Data.Feature.Builder featBld = Geobuf.Data.Feature.newBuilder();
    	   
    	featBld.setGeometry(this.buildGeometry(feature.geometry));
    	this.setProperties(featBld, feature, keys);
    	this.setId(featBld, feature);
    	   
    	return featBld.build();
	}

	private Geobuf.Data buildData (Collection<GeobufFeature> featureCollection) {
           
    	Geobuf.Data.Builder data = Geobuf.Data.newBuilder()
    			.setPrecision(precision)
                .setDimensions(2);

        Geobuf.Data.FeatureCollection.Builder fc = Geobuf.Data.FeatureCollection.newBuilder();

        // deduplicate keys
        List<String> keys = new ArrayList<>();

        featureCollection.stream()
        	.map(f -> this.buildFeature(f, keys))
            .forEach(fc::addFeatures);

        fc.addAllValues(Collections.emptyList());
        fc.addAllCustomProperties(Collections.emptyList());

        data.setFeatureCollection(fc);
        data.addAllKeys(keys);

        return data.build();
    }       

    public void writeFeatureCollection (Collection<GeobufFeature> featureCollection) throws IOException {
    	outputStream.write(buildData(featureCollection).toByteArray());
    }

    public void writeDbDataArray (DbDataArray dbArr) throws IOException {
     	this.writeFeatureCollection(dbDataArrayToGeobuf(dbArr));
    }

    public void writeDbDataObject (DbDataObject dbo) throws IOException {
    	DbDataArray dbArr = new DbDataArray();
    	dbArr.addDataItem(dbo);

    	this.writeDbDataArray(dbArr);
    }

    public void writeSvGeometry (Collection<Geometry> geomArr) throws IOException {	
        Collection<GeobufFeature> gbfc = new ArrayList<GeobufFeature>();
        geomArr.forEach( g -> gbfc.add(createGeobufFeature(g, g.getUserData())) );
        this.writeFeatureCollection(gbfc);
    }
    
    public void close () throws IOException {
        outputStream.close();
    }

}
