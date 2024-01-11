---
date: 2023-11-04
title: 临时用
category: 笔记
tag:
  - note
---
# 下载

https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/file/maven3.rar

https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/file/settings.xml

https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/file/mysql-8.0.11-winx64.zip

# application.yaml/properties

```yaml
spring: 
  application:
    name: XXX
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB
  datasource:
    url: jdbc:mysql://192.168.151.233:3306/gvs-customization?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&allowMultiQueries=true
    username: root
    password: root
    druid:
      initial-size: 10 #连接池初始化大小
      min-idle: 10 #最小空闲连接数
      max-active: 20 #最大连接数
      web-stat-filter:
        exclusions: "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*" #不统计这些请求数据
      stat-view-servlet: #访问监控网页的登录用户名和密码
        login-username: druid
        login-password: druid
      max-wait: 5000
      time-between-eviction-runs-millis: 15000
      min-evictable-idle-time-millis: 30000
      remove-abandoned: true
      remove-abandoned-timeout-millis: 300000
      log-abandoned: true
mybatis-plus:
  global-config:
    db-config:
      logic-delete-value: 1 # 逻辑已删除值(默认为 1)
      logic-not-delete-value: 0 # 逻辑未删除值(默认为 0)

```



# pom

```pom
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.leyunone</groupId>
    <artifactId>laboratory-core</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>laboratory-core</name>
    <description>Demo project for Spring Boot</description>
    
    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <spring-boot.version>2.3.7.RELEASE</spring-boot.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.8.0.M3</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>easyexcel</artifactId>
            <version>3.1.1</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.3.1</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            </dependency>
    </dependencies>


    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

</project>

```



# maven-setting

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
<pluginGroups> </pluginGroups>
<proxies> </proxies>
<servers>
<server>
<id>release</id>
<username>leyuna</username>
<password>@@@Aa3201360</password>
</server>
</servers>
<mirrors>
<mirror>
<id>mirrorId</id>
<mirrorOf>repositoryId</mirrorOf>
<name>Human Readable Name for this Mirror.</name>
<url>http://my.repository.com/repo/path</url>
</mirror>
<mirror>
<id>aliyunmaven</id>
<mirrorOf>*</mirrorOf>
<name>阿里云公共仓库</name>
<url>https://maven.aliyun.com/repository/public</url>
</mirror>
</mirrors>
<profiles>
<profile>
<id>jdk-1.8</id>
<activation>
<jdk>1.8</jdk>
<activeByDefault>true</activeByDefault>
</activation>
<properties>
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
<maven.compiler.encoding>UTF-8</maven.compiler.encoding>
<maven.compiler.source>1.8</maven.compiler.source>
<maven.compiler.target>1.8</maven.compiler.target>
<maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
</properties>
</profile>
<profile>
<id>release</id>
<activation>
<activeByDefault>true</activeByDefault>
</activation>
<properties>
<!-- 这里填你安装的GnuPG位置 -->
<gpg.executable>E:\software\GnuPG\bin\gpg.exe</gpg.executable>
<gpg.passphrase>@@@Aa3201360</gpg.passphrase>
<gpg.homedir>C:\Users\leyuna\AppData\Roaming\gnupg\pubring.kbx</gpg.homedir>
</properties>
</profile>
</profiles>
</settings>
```



# LoginView

```java
package com.leyunone.laboratory.core.swing.test;

import javax.swing.*;

/**
 * :)
 *
 * @author LeYunone
 * @email 1801370115@qq.com
 * @date 2023/10/23
 */
public class LoginView extends JFrame {


    public LoginView(){

        this.setSize(350,200);
        this.setLocationRelativeTo(null);
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JPanel formPanel = new JPanel();
        this.add(formPanel);
        this.formPanelLoad(formPanel);

        this.setVisible(true);
    }

    private void formPanelLoad(JPanel formPanel){
        formPanel.setLayout(null);

        JLabel accountLabel = new JLabel("账号:");
        accountLabel.setBounds(10,20,80,25);
        formPanel.add(accountLabel);

        JTextField accountText = new JTextField(20);
        accountText.setBounds(100,20,165,25);
        formPanel.add(accountText);

        JLabel passwordLabel = new JLabel("密码:");
        passwordLabel.setBounds(10,50,80,25);
        formPanel.add(passwordLabel);

        JPasswordField passwordText = new JPasswordField(20);
        passwordText.setBounds(100,50,165,25);
        formPanel.add(passwordText);

        JButton loginButton = new JButton("登录");
        loginButton.setBounds(100, 90, 80, 25);
        loginButton.addActionListener(e -> {
            if(accountText.getText().equals("123") && passwordText.getText().equals("123")){
                JOptionPane.showMessageDialog(formPanel, "登录成功!");
                HomeView homeView = new HomeView();
                homeView.setVisible(true);

                this.setVisible(false);
            }else{
                JOptionPane.showMessageDialog(formPanel,"用户名或密码错误！");
            }
        });

        formPanel.add(loginButton);
    }

    public static void main(String[] args) {
        new LoginView();
    }
}
```

# HomeView

```java
package com.leyunone.laboratory.core.swing.test;

import com.leyunone.laboratory.core.swing.bean.UserVO;
import com.leyunone.laboratory.core.swing.model.UserModel;

import javax.swing.*;
import java.awt.*;

/**
 * :)
 *
 * @author LeYunone
 * @email 1801370115@qq.com
 * @date 2023/10/23
 */
public class HomeView extends JFrame {

    //搜索
    private JTextField searchText = new JTextField(20);

    private final JTable table;

    public HomeView(){

        this.setSize(700,700);
        this.setLocationRelativeTo(null);
        JPanel searchForm = new JPanel();
        searchForm.setSize(500,200);
        JLabel searchLabel = new JLabel("姓名/编号/电话号码：");
        searchLabel.setBounds(40,20,60,25);
        searchForm.add(searchLabel);
        searchText.setBounds(40,90,20,25);
        searchForm.add(searchText);
        this.add(searchForm);

        //返回
        JButton ret = new JButton("返回");

        //提示
        JLabel dig = new JLabel("暂未选中数据");
        searchForm.add(dig);
        searchForm.add(ret);

        //表格
        UserModel userModel = new UserModel();
        table = new JTable(userModel);

        table.setSize(300,300);
        table.getSelectionModel().addListSelectionListener(
                e -> {
                    int row = table.getSelectedRow();
                    UserVO user = userModel.getUser(row);
                    dig.setText("当前选中的数据为： " + user.getName());
                });
        JScrollPane scrollPane = new JScrollPane(table);

        //操作按钮
        JPanel buttons = new JPanel();
        JButton addButton = new JButton("新增");
        JButton editButton = new JButton("编辑");
        JButton deleteButton = new JButton("删除");
        addButton.addActionListener(e->{
            new UserTableEditView(userModel,null,this);
        });
        editButton.addActionListener(e->{
            new UserTableEditView(userModel,userModel.getUser(table.getSelectedRow()),this);
        });
        deleteButton.addActionListener(e->{

        });
        buttons.add(addButton);
        buttons.add(editButton);
        buttons.add(deleteButton);

        this.add(buttons,BorderLayout.SOUTH);
        this.add(scrollPane, BorderLayout.CENTER);
        this.add(searchForm,BorderLayout.NORTH);
        this.setVisible(true);
    }

    public void reData(){
        table.updateUI();
    }
}
```

# UserEditView

```java
package com.leyunone.laboratory.core.swing.test;

import com.leyunone.laboratory.core.swing.bean.UserVO;
import com.leyunone.laboratory.core.swing.model.UserModel;
import org.apache.commons.lang3.StringUtils;

import javax.swing.*;
import java.awt.*;

/**
 * :)
 *
 * @author LeYunone
 * @email 1801370115@qq.com
 * @date 2023/10/24
 */
public class UserTableEditView extends JDialog   {

    private JLabel nameLabel = new JLabel("姓名:");

    private JLabel sexLabel = new JLabel("性别:");

    private JLabel ageLabel = new JLabel("年龄:");

    private JLabel phoneLabel = new JLabel("号码:");

    public UserTableEditView(UserModel userModel, UserVO userVO,HomeView homeView) {
        this.setModal(true);

        this.setSize(500,500);
        this.setTitle("人员编辑");
        this.setLocationRelativeTo(null);

        JPanel formPanel = new JPanel();
        formPanel.setSize(300,300);

        nameLabel.setSize(40,25);

        JTextField nameText = new JTextField(20);
        nameText.setSize(150,25);

        sexLabel.setSize(40,25);

        JTextField sexText = new JTextField(20);
        sexText.setSize(150,25);

        ageLabel.setSize(40,25);

        JTextField ageText = new JTextField(20);
        ageText.setSize(150,25);

        phoneLabel.setSize(40,25);

        JTextField phoneText = new JTextField(20);
        phoneText.setSize(150,25);

        formPanel.add(nameLabel);
        formPanel.add(nameText);
        formPanel.add(sexLabel);
        formPanel.add(sexText);
        formPanel.add(ageLabel);
        formPanel.add(ageText);
        formPanel.add(phoneLabel);
        formPanel.add(phoneText);
        this.add(formPanel, BorderLayout.CENTER);

        if(userVO==null) {
            userVO = new UserVO();
        }else {
            nameText.setText(userVO.getName());
            sexText.setText(userVO.getSex());
            ageText.setText(userVO.getAge());
            phoneText.setText(userVO.getPhone());
        }

        JPanel buttonPanel = new JPanel();
        JButton saveButton = new JButton("登录");
        saveButton.setBounds(100, 90, 80, 25);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        UserVO finalUserVO = userVO;
        saveButton.addActionListener(e -> {
            finalUserVO.setAge(ageText.getText());
            finalUserVO.setName(nameText.getText());
            finalUserVO.setPhone(phoneText.getText());
            finalUserVO.setSex(sexText.getText());
            if(StringUtils.isBlank(finalUserVO.getId())){
                //新增
                userModel.addUser(finalUserVO);
                this.setVisible(false);
                homeView.reData();
            }else{
                //更新
                userModel.updateUser(finalUserVO);
                this.setVisible(false);
                homeView.reData();
            }
        });
        JButton cancelButton = new JButton("取消");
        cancelButton.addActionListener(e->{
            this.setVisible(false);
        });
        saveButton.setBounds(100, 110, 80, 25);
        buttonPanel.add(saveButton);
        buttonPanel.add(cancelButton);
        this.add(buttonPanel,BorderLayout.SOUTH);
        this.setVisible(true);
    }
}
```

# UserModel

```java
package swingtest.bean;

import java.util.List;

import javax.swing.table.AbstractTableModel;

import swingtest.service.UserService;

public class UserModel extends AbstractTableModel {

	private List<User> data;

	private final String[] columns = { "id", "姓名", "年龄", "手机号" };

	private Integer index = 1;

	private Integer size = 20;

	public UserModel() {
		this.loadUser(null);
	}

	public void loadUser(String hax) {
		data = UserService.build().userList(hax, index, size);
	}

	@Override
	public int getRowCount() {
		// TODO Auto-generated method stub
		return this.data.size();
	}

	@Override
	public int getColumnCount() {
		// TODO Auto-generated method stub
		return this.columns.length;
	}

	@Override
	public Object getValueAt(int rowIndex, int columnIndex) {
		// TODO Auto-generated method stub
		User user = data.get(rowIndex);
		if (columnIndex == 0) {
			return user.getId();
		} else if (columnIndex == 1) {
			return user.getName();
		} else if (columnIndex == 2) {
			return user.getAge();
		} else if (columnIndex == 3) {
			return user.getPhone();
		}
		return null;
	}

}
```

# user

```java
package swingtest.bean;

import com.alibaba.excel.annotation.ExcelProperty;

public class User {

	private Integer id;

	@ExcelProperty("姓名")
	private String name;
	@ExcelProperty("年龄")
	private Integer age;
	@ExcelProperty("手机号")
	private String phone;

	private String testAddress;

	private String account;

	private String password;

	public String getAccount() {
		return account;
	}

	public void setAccount(String account) {
		this.account = account;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public User() {
		// TODO Auto-generated constructor stub
	}

	public String getTestAddress() {
		return testAddress;
	}

	public void setTestAddress(String testAddress) {
		this.testAddress = testAddress;
	}

	public User(Integer id, String name, Integer age, String phone) {
		super();
		this.id = id;
		this.name = name;
		this.age = age;
		this.phone = phone;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getAge() {
		return age;
	}

	public void setAge(Integer age) {
		this.age = age;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	@Override
	public String toString() {
		return "User [id=" + id + ", name=" + name + ", age=" + age + ", phone=" + phone + "]";
	}

}

```

# EasyExcel

```java
package swingtest.util;

import java.util.List;
import java.util.function.Consumer;
import java.util.function.Supplier;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;

/**
 *
 * @author leyuna
 */
public class ExcelListen<T> implements ReadListener<T> {

	private static final int BATCH_COUNT = 100;
	private List<T> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
	private Consumer<List<T>> excelDao;

	public ExcelListen(Consumer<List<T>> r) {
		this.excelDao = r;
	}

	@Override
	public void invoke(T data, AnalysisContext context) {
		cachedDataList.add(data);
		if (cachedDataList.size() >= BATCH_COUNT) {
			saveData();
			cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
		}

	}

	@Override
	public void doAfterAllAnalysed(AnalysisContext context) {
		saveData();
	}

	/**
	 * 加上存储数据库
	 */
	private void saveData() {
		excelDao.accept(cachedDataList);
		System.out.println(111);
	}
}

```

# Connectionservice



```java
package swingtest.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import swingtest.bean.User;
import swingtest.util.ResultSetPropertiesSimplifyHelps;

public class ConnectionService {

	public static Connection currentConnect = null;

	static {
		getConnection("jdbc:mysql://127.0.0.1:3306/test?serverTimezone=Asia/Shanghai", "root", "root");
	}

	public static Connection getConnection(String url, String userName, String passWord) {
		Connection con = currentConnect;
		if (null == con) {
			try {
				Class.forName("com.mysql.jdbc.Driver");
				con = DriverManager.getConnection(url, userName, passWord);
				currentConnect = con;
			} catch (Exception e) {
				System.out.println(e);
			}
		}
		return con;
	}

	public static PreparedStatement executSql(String sql) {
		PreparedStatement p = null;
		try {
			p = currentConnect.prepareStatement(sql);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return p;
	}

	public static PreparedStatement executSql(String sql, Object... params) {
		PreparedStatement p = null;
		try {
			p = currentConnect.prepareStatement(sql);
			for (int i = 0; i < params.length; i++) {
				p.setObject(i + 1, params[i]);
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return p;
	}

	public static ResultSet query(String sql, Object... params) {
		PreparedStatement executSql = executSql(sql, params);
		try {
			return executSql.executeQuery();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public static <T> List<T> query(String sql, Class<T> clazz, Object... params) {
		PreparedStatement executSql = executSql(sql, params);
		try {
			return ResultSetPropertiesSimplifyHelps.putResult(executSql.executeQuery(), clazz);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public static int save(String sql, Object... params) {
		PreparedStatement executSql = executSql(sql, params);
		try {
			return executSql.executeUpdate();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 0;
	}

}

```

# Userservice

```java
package swingtest.service;

import java.util.ArrayList;
import java.util.List;

import swingtest.bean.User;
import swingtest.db.ConnectionService;

public class UserService {

	private static UserService userService = null;

	private UserService() {
	}

	public static UserService build() {
		if (userService == null) {
			synchronized (UserService.class) {
				userService = new UserService();
			}
		}
		return userService;
	}

	public boolean login(String account, String password) {
		List<User> query = ConnectionService.query("select * from t_user where account= ? and password = ?", User.class,
				account, password);
		return query != null && query.size() != 0;
	}

	public List<User> userList(String hax, Integer index, Integer size) {
		List<User> user = new ArrayList<>();
		if (hax == null || hax.trim().equals("")) {
			user = ConnectionService.query("select * FROM t_user LIMIT ?,?", User.class, index, size);
		} else {
			user = ConnectionService.query(
					"SELECT * FROM t_user WHERE name LIKE CONCAT('%',?,'%') OR phone LIKE CONCAT('%',?,'%') LIMIT ?,?",
					User.class, hax, hax, index, size);
		}
		return user;
	}

	public void save(List<User> users) {
		users.forEach(user -> {
			ConnectionService.save("INSERT INTO t_user (name,phone) VALUES(?,?)", user.getName(), user.getPhone());
		});
	}
}

```



# MYSQL

```imi
[mysqld]
# 设置3306端口
port=3306
# 设置mysql的安装目录
basedir=E:\\software\\mysql\\mysql-8.0.11-winx64   # 切记此处一定要用双斜杠\\，单斜杠我这里会出错，不过看别人的教程，有的是单斜杠。自己尝试吧
# 设置mysql数据库的数据的存放目录
datadir=E:\\software\\mysql\\mysql-8.0.11-winx64\\Data   # 此处同上
# 允许最大连接数
max_connections=200
# 允许连接失败的次数。这是为了防止有人从该主机试图攻击数据库系统
max_connect_errors=10
# 服务端使用的字符集默认为UTF8
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
# 默认使用“mysql_native_password”插件认证
default_authentication_plugin=mysql_native_password
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8
[client]
# 设置mysql客户端连接服务端时默认使用的端口
port=3306
default-character-set=utf8
```

```cmd
mysqld --initialize --console
mysqld --install
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '新密码';  
```

