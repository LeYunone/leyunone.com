---
date: 2023-10-26
title: JAVA-Swing回顾
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: Java、Swing
---
# Swing组件的复习

因为参加了某个比赛，赛事主办方对JAVA程序的要求竟然是使用Swing这种十年前的怪东西。所以在复习这些以前还是小白时候匆匆带过的东西，非常有必要做一次记录这个。虽然知道Swing~~绝对~~ 不可能会再涉及，但未来方程走向何，这又有谁会知道捏。

## 流程一，登录界面JFrame

从一个最简单的视图做起，登录界面。

接触过前端知识的可以感觉到，Swing中很多的组件模式都有CSS、Html的影子：

- `<span><span/>` 对应 `JLabel`
- `<div><div/>`  对应 `JPanel` 、`JFrame`
- ...

因此着手写一个登录界面在逻辑上体现就很简单了：

创建一个登录的JFrame

```java
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

此处记录JFrame的基本属性：

|         方法/属性          |                       含义                       |
| :------------------------: | :----------------------------------------------: |
|  setLocationRelativeTo()   |    设置窗口相对于指定组件的位置，为null时居中    |
| setDefaultCloseOperation() | 设置用户在此窗体上单击“关闭”按钮时默认执行的操作 |
|        setLayout()         |                     设置布局                     |
|        setVisible()        |                 设置视图是否显示                 |
|           add()            |                     添加组件                     |
|         setSize()          |                     设置宽高                     |
|        setBounds()         |              设置定位x,y,width,high              |

流程一体验下来，总结下来是以下几点：

- 在JAVA中Swing模式的开发使得面向对象的操作变得非常繁琐
- Swing的组件布局因为没有HTML开发标签中各组件的区域概念，使得对x,y坐标的定位极其苛刻
- 按钮监听器的事件不够拓展，因为是函数式的植入，所以按钮点击之后对属性值的获取、变动等等无法做到异步的方式

## 流程二，简单表格JTable

不管哪种视图语言开发，表格组件肯定都是最重要的一环。

不过在Swing中，JTable的运用以当前的眼光看来是非常的不灵活的。

作为一个表格，他需要两份数据，一是作为列的 `column` ，二是作为行的 `data`

在JTable中，他提供了以下几种构建方法：

- `JTable(TableModel dm)`
- `JTable(Vector rowData, Vector columnNames)`
- `JTable(final Object[][] rowData, final Object[] columnNames)`

从上往下分别是，对象模式、集合模式、二维数组模式

其中对象`TableModel ` 是最符合当今开发结构的方式，集合以及数组都存在数据无法与视图逻辑彻底分割，即 Dao、View层混合使用问题

因此只掌握对象模式，我认为更多的是优点而非缺点。

`TableModel`的构建：

```java
public class UserVO {

    private String id;

    private String name;

    private String sex;

    private String age;

    private String phone;
}
public class UserModel extends AbstractTableModel {

    private final String [] columns = new String[] {"编号","姓名","性别","年龄","电话"};
    private List<UserVO> values;
    public UserModel(){
        this.loadData();
    }

    private void loadData(){
        this.values = CollectionUtil.newArrayList(new UserVO("1","m","男","23","111"),new UserVO(
                "2","4","男","23","111"),new UserVO("3","mdddd","男","23","111")
                ,new UserVO("4","dfm","男","23","111"),new UserVO("5","vvvm","男","23","111"));
    }

    @Override
    public int getRowCount() {
        return this.values.size();
    }

    @Override
    public int getColumnCount() {
        return this.columns.length;
    }

    @Override
    public String getColumnName(int columnIndex) {
        return columns[columnIndex];
    }

    public UserVO getUser(Integer index){
        return values.get(index);
    }

    public void addUser(UserVO userVO){
        this.values.add(userVO);
    }

    public void updateUser(UserVO userVO){
        for (UserVO value : values) {
            if(userVO.getId().equals(value.getId())){
                value = userVO;
            }
        }
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        UserVO userVO = this.values.get(rowIndex);
        if(columnIndex==0){
            return userVO.getId();
        }else if(columnIndex == 1){
            return userVO.getName();
        }else if(columnIndex == 2){
            return userVO.getSex();
        }else if(columnIndex == 3){
            return userVO.getAge();
        }else if(columnIndex == 4){
            return userVO.getPhone();
        }
        return null;
    }
}
```

以上为一个TableModel常驻的方法及属性，当然我省略了从Dao层处操作数据源的过程。

在构建了对象之后，流程二的开发就显得非常面对对象且现代了：

```java
//表格
UserModel userModel = new UserModel();
JTable table = new JTable(userModel);
```

**选中行：**

```java
table.getSelectionModel().addListSelectionListener(
        e -> {
            int row = table.getSelectedRow();
            UserVO user = userModel.getUser(row);
            dig.setText("当前选中的数据为： " + user.getName());
        });
```

**操作数据：**

操作数据，实际则是更新 `TableModel` 中的values

```java
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

public void reData(){
    table.updateUI();
}
```

```java
public UserTableEditView(UserModel userModel, UserVO userVO,HomeView homeView){
    //....
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
    //...
}
```

此处记录JTable的基本属性：

|                    方法/属性                     |                    含义                    |
| :----------------------------------------------: | :----------------------------------------: |
| JScrollPane scrollPane = new JScrollPane(table); | 表格默认不显示表头和滚动，需要这个组件配合 |
|                  getRowCount()                   |                  返回总行                  |
|                 getColumnCount()                 |                  返回总列                  |
|                 getColumnName()                  |                  返回列名                  |
|                  isCellEditable                  |             单元格是否可以修改             |
|                    getValueAt                    |                单元格里的值                |

**流程小结：**

虽然JTable的设计给人一种很落后的感观，但是TableModel的出现还是令人眼前一新的。

过去接触过领域对象、领域服务的设计；即将一个对象与表结合，设计成Dao+Entry一体的领域对象。

这种体验使用下来是虽然方法会变得冗余，但是针对一个对象，一个领域来说，变得更方便和整体。

## 流程三，JPanel布局

Swing开发最头疼的就是各类组件的布局问题。

因为没有可视化界面，所以一个输入框、一段文字...需要使用多少高宽，定位在哪个xy，在这个无法热部署的程序开发中，显得特别困难。

使用一个好看的Swing界面，绝对少不了使用大量的JPanel去模块式的包含，统一布局。

注意，在前文中有提到：`<div><div/>` = `JPanel`

有这样一个页面，从上到下分别是：

1. 搜索框
2. 表格
3. 按钮

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-10-26/c871f118-7445-435a-8cb2-6ac3baccbc6b.png)

理所当然是在代码中通过JPanel布局应该这样：

1、搜索框JPanel

```java
JPanel searchForm = new JPanel();
JLabel searchLabel = new JLabel("姓名/编号/电话号码：");
searchForm.add(searchLabel);
searchForm.add(searchText);
JLabel dig = new JLabel("暂未选中数据");
searchForm.add(dig);
searchForm.add(ret);
this.add(searchForm);
```

2、表格

```java
//表格
UserModel userModel = new UserModel();
table = new JTable(userModel);
JScrollPane scrollPane = new JScrollPane(table);
this.add(scrollPane);
```

3、按钮

```java
JPanel buttons = new JPanel();
JButton addButton = new JButton("新增");
JButton editButton = new JButton("编辑");
JButton deleteButton = new JButton("删除");
buttons.add(addButton);
buttons.add(editButton);
buttons.add(deleteButton);
this.add(buttons);
```

将一个JFrame分成三块，如果用Html来说明就是：

```html
<div>
    <div>
        //搜索框
    </div>
    <div>
        表格
    </div>
    <div>
        按钮栏
    </div>
</div>
```

这套下来就可以发现，Swing开发布局真是麻烦，需要靠一层一层 调用 `.add()`方法包含组件。

不过好在，Swing提供了几种默认的布局方式

比如在上述案例中，三个JPanel添加到主界面中的布局为：

```java
    this.add(buttons,BorderLayout.SOUTH);
    this.add(scrollPane, BorderLayout.CENTER);
    this.add(searchForm,BorderLayout.NORTH);
```

| BorderLayout.NORTH  | 容器的北边 |
| ------------------- | ---------- |
| BorderLayout.SOUTH  | 容器的南边 |
| BorderLayout.WEST   | 容器的西边 |
| BorderLayout.EAST   | 容器的东边 |
| BorderLayout.CENTER | 容器的中心 |

流程总结：

虽然Swing的组件布局不好控制，但是Eclipse是有提供可视化界面的，所以如果大家不是在学习或是回顾这块知识，点到为止即可，真的不要和某个组件的位置移动钻到底。

## 阶段性总结

花了几小时做了这次Swing知识的回顾，好在刚开始学习Java的时候，在做 Swing-qq 项目的时候对Swing的繁琐开发印象深刻，间接导致知识的知识加深，所以体验下来在有了心里准备的前提下还是很顺利的。

不过Swing真该淘汰呀，有这功夫还不如学学C#随随便便都可以写一个漂亮的应用 ：（（（（ /(ㄒoㄒ)/~~
