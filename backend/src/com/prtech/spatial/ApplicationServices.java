package com.prtech.spatial;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.StreamingOutput;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.prtech.spatial.geobuf.GeobufEncoder;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.vividsolutions.jts.geom.Geometry;

@Path("/spatial")
public class ApplicationServices {
	private static final Logger log = LogManager.getLogger(ApplicationServices.class.getName());
	
	/**
	 * 
	 * @param sessionId
	 * @param objectName
	 * @param bbox
	 * @return
	 * @throws SvException
	 */
	private ArrayList<Geometry> getGeometryImpl(String sessionId, Long objTypeId, String bbox) throws SvException {
		SvGeometry svg = null;
		ArrayList<Geometry> geom = new ArrayList<Geometry>();

		try {
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
	@Path("/getGeometry/bbox/{token}/{objectName}/{bbox}")
	@Produces("application/pbf")
	public StreamingOutput getGeometry(@PathParam("token") final String token,
			@PathParam("objectName") final String objectName, @PathParam("bbox") final String bbox) {

		return new StreamingOutput() {
			public void write(OutputStream stream) {
				GeobufEncoder enc = new GeobufEncoder(stream, 10);
				try {
					ArrayList<Geometry> geomArr = getGeometryImpl(token, SvCore.getTypeIdByName(objectName), bbox);
					enc.writeSvGeometry(geomArr);
				} catch (Exception e) {
					String errMsg = "Failed fetching geometry set. Please see server logs";
					if (e instanceof SvException)
						errMsg = ((SvException) e).getJsonMessage();
					try {
						stream.write(errMsg.getBytes(StandardCharsets.UTF_8));
					} catch (IOException ioe) {
						log.error("Stream closed, can't write error", ioe);
					}
					log.error(errMsg, e);
				}
			};
		};
	}
}
