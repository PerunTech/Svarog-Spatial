package com.prtech.spatial.service;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import org.apache.logging.log4j.Logger;

import com.prtech.svarog.SvConf;

public class WSSpatial {
	static final Logger log4j = SvConf.getLogger(WSSpatial.class);
	
	@GET
	@Path("/origin")
	@Produces("text/html;charset=utf-8")
	public Response getHoldingLocation() {
		// Prilep
		return Response.status(200).entity("41.32779361376413,21.501059532165527,41.34355071838928,21.54028415679932").build();
	};
}
