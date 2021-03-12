package com.prtech.spatial.importer;

import java.sql.SQLException;
import java.util.Map;

import org.apache.logging.log4j.Logger;
import org.joda.time.DateTime;

import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog.SvException;
import com.prtech.svarog.SvReader;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_interfaces.ISvCore;
import com.prtech.svarog_interfaces.ISvExecutor;
import com.vividsolutions.jts.io.ParseException;

public class ImporterSDIByFarmExe implements ISvExecutor {

	static final Logger log4j = SvConf.getLogger(ImporterSDIByFarmExe.class);
	private final String category = "IMPORTER";
	private final String name = "SDI";
	private final String description = "Inserting and updating agri_parcel by farm";
	private final DateTime start = new DateTime();
	private final DateTime end = SvConf.MAX_DATE;
	private final Class<?> type = Boolean.class;

	@Override
	public Class<?> getReturningType() {
		return type;
	}

	@Override
	public String getCategory() {
		return category;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getDescription() {
		return description;
	}

	@Override
	public DateTime getStartDate() {
		return start;
	}

	@Override
	public DateTime getEndDate() {
		return end;
	}

	@Override
	public Object execute(Map<String, Object> params, ISvCore svCore) throws SvException {

		try (SvReader svr = new SvReader((SvCore) svCore);) {
			DbDataObject farm = svr.getObjectById((Long) params.get("farmId"), SvCore.getTypeIdByName("FARMER"), null);

			try {
				SDIImporter.importSDIByFarm(SvCore.getTypeIdByName("AGRI_PARCEL"), (Long) farm.getVal("OLD_PKID"),
						farm.getObjectId(), "VLPIS_FULL", svr);
			} catch (SQLException | ParseException | java.text.ParseException e) {
				throw new SvException("error.update_agri_parcel", svr.getInstanceUser(), farm, "VLPIS_FULL");
			}
		}
		return true;
	}

	@Override
	public long versionUID() {
		// TODO Auto-generated method stub
		return 1L;
	}

}
