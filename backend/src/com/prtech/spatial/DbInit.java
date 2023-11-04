package com.prtech.spatial;

import java.util.ArrayList;

import com.prtech.spatial.CC;
import com.prtech.svarog.Sv;
import com.prtech.svarog.svCONST;
import com.prtech.svarog_common.DbDataField;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.DbDataTable;
import com.prtech.svarog_common.IDbInit;
import com.prtech.svarog_common.DbDataField.DbFieldType;

public class DbInit implements IDbInit {
	
	static final String CONST_MASTER_REPO = "{MASTER_REPO}";
	static final String CONST_DEFAULT_SCHEMA = "{DEFAULT_SCHEMA}";
	static final String CONST_GUI_READONLY_GRID_VISIBLE = "{\"react\":{\"filterable\":true,\"visible\":true,\"resizable\":true,\"editable\":true,\"uischema\":{\"ui:readonly\":true}}}";
	static final String SRID = "NULL";
	
	private static DbDataTable addSortOrder(DbDataTable dbtt) {
		Integer order = 100;
		if (dbtt.getDbTableFields() != null)
			for (DbDataField dbf : dbtt.getDbTableFields()) {
				if (dbf != null && dbf.getSort_order() == null) {
					dbf.setSort_order(order);
					order = order + 100;
				}
			}
		return dbtt;
	}
	
	private static DbDataTable createGeoLayerType() {
		DbDataTable dbe = new DbDataTable();
		dbe.setDbTableName(CC.GEO_LAYER_TYPE);
		dbe.setDbRepoName(CONST_MASTER_REPO);
		dbe.setDbSchema(CONST_DEFAULT_SCHEMA);
		dbe.setIsSystemTable(false);
		dbe.setIsRepoTable(false);
		dbe.setLabel_code("master_repo.geo_layer_type");
		dbe.setUse_cache(false);
		dbe.setIsConfigTable(false);

		DbDataField dbf1 = new DbDataField();
		dbf1.setDbFieldName(Sv.PKID);
		dbf1.setIsPrimaryKey(true);
		dbf1.setDbFieldType(DbFieldType.NUMERIC);
		dbf1.setDbFieldSize(18);
		dbf1.setDbFieldScale(0);
		dbf1.setIsNull(false);
		dbf1.setLabel_code(Sv.TABLE_META_PKID);

		DbDataField dbf2 = new DbDataField();
		dbf2.setDbFieldName("TITLE");
		dbf2.setDbFieldType(DbFieldType.NVARCHAR);
		dbf2.setDbFieldSize(200);
		dbf2.setLabel_code("geo_layer_type.title");
		dbf2.setSort_order(1000);

		DbDataField dbf3 = new DbDataField();
		dbf3.setDbFieldName("LAYER_TYPE");
		dbf3.setDbFieldType(DbFieldType.NVARCHAR);
		dbf3.setDbFieldSize(100);
		dbf3.setLabel_code("geo_layer_type.layer_type");
		dbf3.setSort_order(1001);
		dbf3.setCode_list_user_code("LAYER_TYPE");

		DbDataField dbf3a = new DbDataField();
		dbf3a.setDbFieldName("LAYER_GROUP");
		dbf3a.setDbFieldType(DbFieldType.NVARCHAR);
		dbf3a.setDbFieldSize(400);
		dbf3a.setLabel_code("geo_layer_type.layer_group");
		dbf3a.setSort_order(1004);

		DbDataField dbf4 = new DbDataField();
		dbf4.setDbFieldName("LABEL_CODE");
		dbf4.setDbFieldType(DbFieldType.NVARCHAR);
		dbf4.setDbFieldSize(400);
		dbf4.setLabel_code("geo_layer_type.label_code");
		dbf4.setSort_order(1004);
		dbf4.setGui_metadata(CONST_GUI_READONLY_GRID_VISIBLE);

		DbDataField dbf5 = new DbDataField();
		dbf5.setDbFieldName("MODULE_NAME");
		dbf5.setDbFieldType(DbFieldType.NVARCHAR);
		dbf5.setDbFieldSize(100);
		dbf5.setLabel_code("geo_layer_type.module_name");
		dbf5.setSort_order(1001);

		DbDataField dbf6 = new DbDataField();
		dbf6.setDbFieldName("URL");
		dbf6.setDbFieldType(DbFieldType.NVARCHAR);
		dbf6.setDbFieldSize(200);
		dbf6.setLabel_code("geo_layer_type.url");
		dbf6.setSort_order(1100);
		
		
		DbDataField dbf7 = new DbDataField();
		dbf7.setDbFieldName("PROTOCOL");
		dbf7.setDbFieldType(DbFieldType.NVARCHAR);
		dbf7.setDbFieldSize(10);
		dbf7.setLabel_code("geo_layer_type.protocol");
		dbf7.setSort_order(1100);
		
		DbDataField[] dbTableFields = new DbDataField[8];
		dbTableFields[0] = dbf1;
		dbTableFields[1] = dbf2;
		dbTableFields[2] = dbf3;
		dbTableFields[3] = dbf3a;
		dbTableFields[4] = dbf4;
		dbTableFields[5] = dbf5;
		dbTableFields[6] = dbf6;
		dbTableFields[7] = dbf7;
		dbe.setDbTableFields(dbTableFields);
		return dbe;
	}

	@Override
	public ArrayList<DbDataTable> getCustomObjectTypes() {
		ArrayList<DbDataTable> dbtList = new ArrayList<DbDataTable>();
		dbtList.add(addSortOrder(createGeoLayerType()));

		
		return dbtList;
	}

	@Override
	public ArrayList<DbDataObject> getCustomObjectInstances() {
		ArrayList<DbDataObject> defaultObjests = new ArrayList<DbDataObject>();
		return defaultObjests;
	}
}
