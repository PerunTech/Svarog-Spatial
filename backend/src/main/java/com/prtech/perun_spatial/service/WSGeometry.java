package com.prtech.perun_spatial.service;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvReader;
import com.prtech.svarog.SvUtil;
import com.prtech.perun_spatial.geobuf.GeobufEncoder;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;

@Path("/wsg")
// Should this class publish http services? It may be the case that we should provide base (extendable) implementation here
// and assemble / publish services in the supportiing (project-specific) plugin only. 
public class WSGeometry {
	
	static final Logger LOG = LogManager.getLogger(WSGeometry.class.getName());
	
	static final GeometryFactory geomFactory = SvUtil.sdiFactory;

	private ArrayList<Geometry> getGeometryImpl(String sessionId, Long objTypeId, String bbox) throws SvException {
		SvGeometry svg = null;
		ArrayList<Geometry> geom = new ArrayList<Geometry>();

		try {
			// Why init SvGeometry on each call? can we make-do with a single core instance?
			svg = new SvGeometry(sessionId);
			geom = svg.getGeometriesByBBOX(objTypeId, bbox);
		} finally {
			if (svg != null)
				svg.release();
		}

		return geom;
	}
	
	/**
	 * 
	 * @param token
	 * @param objectName
	 * @param bbox
	 * @return
	 */
	@GET
	@Path("/getGeometry/{token}/{bbox}/{objectName}")
	@Produces("application/pbf")
	public StreamingOutput getGeometry(@PathParam("token") final String token,
			@PathParam("bbox") final String bbox,
			@PathParam("objectName") final String objectName) {

		// token and bbox are a must, that is the point of the service. To consider:
		// Should we include objectName to signature? why don't we just get all vectors for the given bounding box?
		
		// Objection 1: Because all tables render on different scales of the map. Parcels render < 1:5000.
		// If we omit type, we must filter each row for the current scale (which becomes an argument). This may be way worse.
		
		// Objection 2: Most tables will not render vectors at all for a given session, consequence of user type.
		// Farmers should not get full built SVG clickable reference parcels. They will get a background image via the image server.
		return new StreamingOutput() {
			public void write(OutputStream stream) {
				// add geobuf jar to pom deps
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				
				try {
					enc.writeSvGeometry(getGeometryImpl(token, SvCore.getTypeIdByName(objectName), bbox));
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set with type: " + objectName + ". Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						LOG.error("Stream closed, can't write error", ioe);
					}
					LOG.error(errMsg, e);
				}
			};
		};
	}
	
	@GET
	@Path("/getOrigin/{token}")
	@Produces("text/html;charset=utf-8")
	public Response getOrigin(@PathParam("token") String token) {

		String origin = "";
		SvReader svr = null;

		try {
			svr = new SvReader(token);
			svr.setIncludeGeometries(true);

			// It is possible that there is no generic version of this method.
			// Theoretically, the token carries information about the user, we start with that.
			
			// We get all geometries pertaining to the user (whatever pertaining means to the system).
			// We generate an envelope of the full geometry set. 
			// Then we create a (string) bounding box and assign to origin => return.
			
			// What this service does is a calculation (executed once) of a specific geographical space,
			// represented by a bbox (i.e. frame), that is relevant to the user.
			
			// If a beneficiary makes access in the application, we get all registered parcels which are
			// owned by him, calculate the smallest geographical rectangle that contains the parcels
			// and return string coordinates of said rectangle.

		} catch (SvException e) {
			LOG.error("Failed fetching map origin", e);
		} finally {
			if (svr != null)
				svr.release();
		}

		return Response.status(200).entity(origin).build();
	};
}
