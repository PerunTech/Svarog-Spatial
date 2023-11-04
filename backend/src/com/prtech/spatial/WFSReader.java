package com.prtech.spatial;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.Authenticator;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.PasswordAuthentication;
import java.net.Proxy;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.logging.log4j.Logger;

import com.prtech.spatial.ApplicationServices;
import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvGeometry;
import com.prtech.svarog.SvParameter;
import com.prtech.svarog.svCONST;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;

/**
 * Class to support fetching Geometry objects from external WFS server
 * 
 * @author ristepejov
 *
 */
public class WFSReader {
	private static final Logger log = SvConf.getLogger(WFSReader.class);

	private String wfsServerUrl; // https://map.cadastru.md/geoserver/w_rsuat/wms
	private String layerName;

	private String epsg; // SRS=EPSG%3A4026&

	private String serviceName = "WFS";
	private String serviceVersion = "version=1.1.0";
	private String serviceFormat = "image%2Fpng";
	private String outputFormat = "application/json";
	private String infoFormat = "application/json";
	private String serviceRequest = "GetFeature"; // ?REQUEST=GetFeatureInfo

	// related to REQUEST=GetFeatureInfo
	private int mapHeight = 0;
	private int mapWidth = 0;
	private int mapX = 0;
	private int mapY = 0;

	
	public WFSReader(String layerName, String epsg, String wfsServerUrl) throws SvException {
		if (wfsServerUrl == Sv.EMPTY_STRING)
			throw (new SvException(CC.WFS_NOT_CONFIGURED, svCONST.systemUser));

		this.wfsServerUrl = wfsServerUrl;
		this.layerName = layerName;
		this.epsg = epsg;
	}

	public WFSReader(String layerName, String epsg, String wfsServerUrl, String serviceName) throws SvException {

		if (wfsServerUrl == Sv.EMPTY_STRING)
			throw (new SvException(CC.WFS_NOT_CONFIGURED, svCONST.systemUser));

		this.wfsServerUrl = wfsServerUrl;
		this.layerName = layerName;
		this.serviceName = serviceName;
		this.epsg = epsg;
	}

	public WFSReader(String layerName, String epsg, String wfsServerUrl, String serviceName, String outputFormat,
			String serviceRequest) throws SvException {

		if (wfsServerUrl == Sv.EMPTY_STRING)
			throw (new SvException(CC.WFS_NOT_CONFIGURED, svCONST.systemUser));

		this.wfsServerUrl = wfsServerUrl;
		this.layerName = layerName;
		this.epsg = epsg;
	}
	
	/**
	 * Method to build a wfs request based on JTS Envelope
	 * @param envelope The JTS Envelope which will be used as bounding box
	 * @return
	 */
	public String buildWfsRequestUrl(Envelope envelope) {
		return buildWfsRequestUrl(SvGeometry.getBBox(envelope));
	}

	/**
	 * Minimum distance between to vertexes
	 */
	public String buildWfsRequestUrl(String bbox) {
		String url = buildWfsRequestUrl() + "&BBOX=" + bbox;
		if (log.isDebugEnabled())
			log.debug("WFS url:" + url);
		return url;
	}

	public String buildWfsRequestUrlFilter(String ogcFilter) {
		String url = buildWfsRequestUrl() + "&FILTER=" + ogcFilter;
		if (log.isDebugEnabled())
			log.debug("WFS url:" + url);
		return url;
	}

	public String buildWfsRequestUrl() {
		String url = wfsServerUrl + "?" + getService() + "&" + serviceVersion + "&" + getServiceRequest() + "&"
				+ getLayerType() + "&srs=" + epsg + "&" + getServiceFormat() + getExtendedServiceParams();
		;
		return url;
	}

	private String getExtendedServiceParams() {
		String params = "";
		if (serviceName.equalsIgnoreCase("WMS"))
			params = "&HEIGHT=" + mapHeight + "&WIDTH=" + mapWidth;

		if (serviceRequest.equalsIgnoreCase("GetFeatureInfo"))
			params = params + "&X=" + mapX + "&Y=" + mapY;
		return params;
	}

	private String getLayerType() {
		// TODO Auto-generated method stub
		if (serviceName.equalsIgnoreCase("WFS"))
			return "typeName=" + layerName;
		else if (serviceName.equalsIgnoreCase("WMS")) {
			return "layers=" + layerName + "&QUERY_LAYERS=" + layerName;
		}
		return "";

	}

	private String getServiceFormat() {
		// TODO Auto-generated method stub
		String serviceString = "";
		String additionalFormatString = "";

		if (serviceName.equalsIgnoreCase("WMS"))
			serviceString = "format=" + serviceFormat;

		if (serviceName.equalsIgnoreCase("WFS"))
			serviceString = "outputFormat=" + outputFormat;

		if (serviceRequest.equalsIgnoreCase("GetFeatureInfo"))
			additionalFormatString = "&info_format=" + infoFormat;

		return serviceString + additionalFormatString;
	}

	private String getServiceRequest() {
		// TODO Auto-generated method stub
		return "request=" + serviceRequest;
	}

	private String getService() {
		return "service=" + serviceName;
	}

	public Geometry getByEnvelope(Envelope envelope) {
		return null;

	}

	public String getWFSResponse(Envelope envelope) {
		return executeGet(buildWfsRequestUrl(envelope), Sv.EMPTY_STRING, 0, Sv.EMPTY_STRING, Sv.EMPTY_STRING);

	}
	/**
	 * method to fetch get FeatureInfo from external WMS
	 * @param bbox the BBOX as per WMS standard
	 * @param mapHeight the map height in pixel
	 * @param mapWidth the map width in pixel
	 * @param x the X of the clicked pixel on the map
	 * @param y the X of the clicked pixel on the map
	 * @return Json data with feature info
	 */
	public String getWMSFeatureInfo(String bbox, int mapHeight, int mapWidth,int x, int y ) {
		
		this.mapHeight=mapHeight;
		this.mapWidth=mapWidth;
		this.mapX=x;
		this.mapY=y;
		this.serviceRequest="GetFeatureInfo";
		return executeGet(buildWfsRequestUrl(bbox), Sv.EMPTY_STRING, 0, Sv.EMPTY_STRING, Sv.EMPTY_STRING);

	}
	
	public String getWFSResponse(Envelope envelope, final String sshServer, final String sshUser, final String sshPass,
			final String webUser, final String webPass, String extSshParams) {
		return executeGet(buildWfsRequestUrl(envelope), sshServer, sshUser, sshPass, webUser, webPass, extSshParams);

	}

	public String getWFSResponse(String filter, final String sshServer, final String sshUser, final String sshPass,
			final String webUser, final String webPass, String extSshParams) {
		return executeGet(buildWfsRequestUrlFilter(filter), sshServer, sshUser, sshPass, webUser, webPass,
				extSshParams);

	}

	public String buildOgcFilter(String grCodDp, String grCodCC, List<String> grParcels) {

		StringBuilder filter = new StringBuilder();
		filter.append("<ogc:Filter xmlns:ogc=\'http://www.opengis.net/ogc\'><ogc:And>"
				+ "<ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>GR_COD_DP</ogc:PropertyName><ogc:Literal>"
				+ grCodDp + "</ogc:Literal></ogc:PropertyIsEqualTo>"
				+ "<ogc:PropertyIsEqualTo><ogc:PropertyName>GR_COD_CC</ogc:PropertyName><ogc:Literal>" + grCodCC
				+ "</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And>" + "<ogc:Or>");
		for (String grParcel : grParcels) {
			filter.append("<ogc:PropertyIsEqualTo><ogc:PropertyName>GR_PARCEL</ogc:PropertyName><ogc:Literal>"
					+ grParcel + "</ogc:Literal></ogc:PropertyIsEqualTo>");
		}
		filter.append("</ogc:Or></ogc:And></ogc:Filter>");
		return filter.toString();
	}

	public String getWFSResponseByFilter(String filter) {
		return executeGet(buildWfsRequestUrlFilter(filter), Sv.EMPTY_STRING, 0, Sv.EMPTY_STRING, Sv.EMPTY_STRING);

	}

	private String executeGet(final String http_url, final String proxyName, final int port, final String proxyUser,
			final String proxyPass) {
		String ret = "";

		URL url;
		try {

			HttpURLConnection con;
			url = new URL(http_url);

			if (proxyName.isEmpty()) {
				con = (HttpURLConnection) url.openConnection();
			} else {
				Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(proxyName, port));
				con = (HttpURLConnection) url.openConnection(proxy);
				Authenticator authenticator = new Authenticator() {
					public PasswordAuthentication getPasswordAuthentication() {
						return (new PasswordAuthentication(proxyUser, proxyPass.toCharArray()));
					}
				};
				Authenticator.setDefault(authenticator);
			}

			// Now it's "open", we can set the request method, headers etc.
			con.setRequestProperty("accept", outputFormat);

			// This line makes the request
			InputStream responseStream = con.getInputStream();
			ret = IOUtils.toString(responseStream, StandardCharsets.UTF_8);

		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return ret;
	}

	private String executeGet(final String http_url, final String sshServer, final String sshUser, final String sshPass,
			final String webUser, final String webPass, String extSshParams) {

		ProcessBuilder processBuilder = new ProcessBuilder();
		// "http://osspwms.katastar.gov.mk/geoserver/PARCELI/gwc/service/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=PARCELI:PARCELI_WMS&srs=EPSG:6316&outputFormat=application/json&BBOX=7640026.21,4574935.62,7640698.43,4575335.59\"
		// -- Linux --
		String cmd = "sshpass -p " + sshPass + " ssh " + sshUser + "@" + sshServer + " " + extSshParams
				+ " \"wget -q -O - --user " + webUser + " --password " + webPass + " \\\"" + http_url + "\\\"\"";
		// Run a shell command
		processBuilder.command("bash", "-c", cmd);

		// Run a shell script
		// processBuilder.command("path/to/hello.sh");

		// -- Windows --

		// Run a command
		// processBuilder.command("cmd.exe", "/c", "dir C:\\Users\\mkyong");

		// Run a bat file
		// processBuilder.command("C:\\Users\\mkyong\\hello.bat");

		try {

			Process process = processBuilder.start();

			StringBuilder output = new StringBuilder();

			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

			String line;
			while ((line = reader.readLine()) != null) {
				output.append(line);
			}

			int exitVal = process.waitFor();
			if (exitVal == 0) {
				return output.toString();
			} else {
				return null;
			}

		} catch (IOException e) {
			e.printStackTrace();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		return null;

	}
	// select * from svarog.vfarmer_imp2 where fic='00005005950'

}
