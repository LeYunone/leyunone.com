---
date: 2023-05-09
title: DatabaseMetaData基本使用汇总
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA
  - - meta
    - name: description
      content: 最近有使用到DatabaseMetaData开发数据库比对工具，所以汇总一下这个类的使用
---
# DatabaseMetaData

> 最近有使用到DatabaseMetaData开发数据库比对工具，所以汇总一下这个类的使用

## 前置 - JDBC连接

```java
 Connection con= DriverManager.getConnection("","root","root");
```

## 数据库信息

### 获得数据基本信息

```java
    private void dbBaseInfo(Connection con) {
            DatabaseMetaData dbmd=con.getMetaData();
            System.out.println("数据库已知的用户: " + dbmd.getUserName());
            System.out.println("数据库的系统函数的逗号分隔列表: " + dbmd.getSystemFunctions());
            System.out.println("数据库的时间和日期函数的逗号分隔列表: " + dbmd.getTimeDateFunctions());
            System.out.println("数据库的字符串函数的逗号分隔列表: " + dbmd.getStringFunctions());
            System.out.println("数据库供应商用于 'schema' 的首选术语: " + dbmd.getSchemaTerm());
            System.out.println("数据库URL: " + dbmd.getURL());
            System.out.println("是否允许只读:" + dbmd.isReadOnly());
            System.out.println("数据库的产品名称:" + dbmd.getDatabaseProductName());
            System.out.println("数据库的版本:" + dbmd.getDatabaseProductVersion());
            System.out.println("驱动程序的名称:" + dbmd.getDriverName());
            System.out.println("驱动程序的版本:" + dbmd.getDriverVersion());
    }
```

### 获得表信息

```java
        DatabaseMetaData meta = con.getMetaData();
        ResultSet rs = meta.getTables(String catalog,String schema,String tableNamePattern,String []type) 
```

**catalog**：目录名称，一般都为空.
**schema**：数据库名，【oracle为用户名】
**tableNamePattern**：正则匹配表名称
**type** ：表的类型(TABLE | VIEW)

```java
    private void dbTableInfo(Connection con,String dbName) {
        DatabaseMetaData meta = con.getMetaData();
        ResultSet rs = meta.getTables(dbName, null, null,
                                      new String[] { "TABLE" });
        while (rs.next()) {
            String tableName = rs.getString("TABLE_NAME");
            System.out.println("表名：" + tableName);
            System.out.println("表类型:"+rs.getString("TABLE_TYPE"));
            System.out.println("表注释:"+rs.getString("REMARKS"));
            System.out.println("表所属用户名：" + rs.getString(2));
            ResultSet primaryKeys = meta.getPrimaryKeys(null, null, tableName);
            while (primaryKeys.next()){
                System.out.println("表主键： "+ primaryKeys.getString("COLUMN_NAME"));
                System.out.println("PKNAME:"+primaryKeys.getString("PK_NAME"));
            }
        }
    }
```

### 获得字段信息

```java
            DatabaseMetaData meta = con.getMetaData();
            ResultSet columns = meta.getColumns(String catalog, String schemaPattern,
                         String tableNamePattern, String columnNamePattern);
```

**catalog**：目录名称，一般都为空.
**schemaPattern**：数据库名，【oracle为用户名】
**tableNamePattern**：正则匹配表名称
**columnNamePattern** ：正则匹配字段名

```java
    private void dbColumnInfo(Connection con,String tableName){
        DatabaseMetaData meta = con.getMetaData();
        ResultSet columns = meta.getColumns(null, null, tableName, "%");
        System.out.println("======字段========");
        while (columns.next()){
            System.out.println("字段名:"+columns.getString("COLUMN_NAME")+
                               "  字段类型："+columns.getString("DATA_TYPE")+
                               "  字段类型名:"+columns.getString("TYPE_NAME")+
                               "  TABLE_CAT:"+columns.getString("TABLE_CAT")+
                               "  TABLE_SCHEM:"+columns.getString("TABLE_SCHEM")+
                               "  TABLE_NAME:"+columns.getString("TABLE_NAME")+
                               "  COLUMN_SIZE:"+columns.getString("COLUMN_SIZE")+
                               "  DECIMAL_DIGITS:"+columns.getString("DECIMAL_DIGITS")+
                               "  NUM_PREC_RADIX:"+columns.getString("NUM_PREC_RADIX")+
                               "  REMARKS:"+columns.getString("REMARKS"));
        }
        System.out.println("------------------------------");
    }
```

