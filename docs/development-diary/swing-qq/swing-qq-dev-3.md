---
date: 2022-03-12
title: QQ日记3
category:
  - 开发日记
tag:
  - 开发日记
---
# 基于Swing的伪QQ开发日记3
本文与2019-12-29完成，怀念篇，归档。
| 模块       | 进度 |
| ---------- | ---- |
| 登录       | √    |
| 注册       | √    |
| 信息交互   | √    |
| 用户显示   | √    |
| 群显示     | √    |
| 点对点聊天 | ×    |

> 点对点聊天还有一个难点，发送表情和文件

## 发送表情
基于Swing界面中只有JTextPane可以以文本的格式输出图片，所以就不考虑JTextArea。
**第一步：**
将表情包中的所有图片修改成以#为开头的，#01，#02 ...格式   （表情编号）

**第二步：**
用面向对象的方法将每一个表情看作一个对象，这个对象中有自己的Jpanel。然后将所有的表情对象，遍历到一个大的Jpanel（表情列表）中。然后在聊天界面上添加表情按钮的监听事件，这样一个发送表情的样子就出来了。

**第三步：**

将聊天界面ChatView作为属性传给所有的表情对象，然后在表情对象中设立鼠标点击事件。点击的时候，将表情对象中的name（#01格式）作为参数调用ChatView中的信息处理方法中。

```
lblImg.addMouseListener(new MouseAdapter() {
				@Override
				public void mouseClicked(MouseEvent arg0) {  //如果点击了这个表情
					try {
						chatview.manageMyInfo(mp);
						 imglistview.dispose();
					} catch (BadLocationException e) {
						e.printStackTrace();
					}
				}
				
			});
```

**第四步：**
个人信息处理方法。

```
	private String chat=""; //信息的载体
	private String chat2="";  
	private JButton btnFile;
	private boolean is=true;
	public void setIs(boolean is){
		this.is=is;
	}
	public void manageMyInfo(String info) throws BadLocationException {  //个人信息板上消息的显示 
		if(is){ //第一次打字 
			String a=MsgMy.getText();
			setChat2(a+info);
			setChat(getChat2());
			setIs(false);
		}else{
			char[]c=getChat2().toCharArray();
			int coun=0;
			for(int i=0;i<c.length;i++){
				if(c[i]=='#'){
					coun++;
				}
			}	
			String b=MsgMy.getText().substring(getChat2().length()-(2*coun),MsgMy.getText().length());  //计算表情
			setChat(getChat2()+b+info);  //原信息编码
			setChat2(getChat());
		}	
		int length = info.length();
		char[] every = new char[length];
		boolean is=false;
		int count = 0;// 
		String path = "img/"; 
		Document doc = MsgMy.getStyledDocument();
		
		SimpleAttributeSet attr = new SimpleAttributeSet();
		for (int i = 0; i < every.length; i++) {
			every[i] = info.charAt(i);
			if (every[i] == '#') 
				is = true;
		}
		
		for (int i = 0; i <length; i++) {
			if (is == false) {
				String msg =info;
				doc.insertString(doc.getLength(), msg, attr);
				break;
			}
			if (every[i] == '#') {
				String str = null;
				str = info.substring(count, i); 
				try {
					if (str != null)
						doc.insertString(doc.getLength(), str, attr);
				} catch (Exception e) {
				}
				String icName;
				icName = info.substring(i, i + 3); 
				Icon ic = new ImageIcon(path + icName + ".png");
				System.out.println(path + icName + ".png");
				MsgMy.setCaretPosition(doc.getLength());
				MsgMy.insertIcon(ic); 
				count = i + 3;
			}
		}
		if (count != length) {
			String theLast = null;
			theLast = info.substring(count, length);
			try {
				doc.insertString(doc.getLength(), theLast, attr);
			} catch (Exception e) {
			}
		}
	}
```
**方法解读：**（发送消息面板）
1、如果是第一次调用信息处理方法（有表情的信息）；
2、那么就直接得到信息参数（表情编号）然后在自己的发送面板上，进行解析加载图片追加文本。
3‘、然后点击发送的时候，作为判断的是否为第一次调用信息处理方法的**is**重新设置为**true**
4、如果不是第一次调用信息处理方法（在一次聊天中发送了多个表情）。
5、我们就要明确目的了。
一、得到原信息（第二次调用信息处理方法前）中表情的编码与表情编码前后的信息。
二、将原信息与新信息（第二次调用信息处理方法）进行拼接。

```
			char[]c=getChat2().toCharArray();
			int coun=0;
			for(int i=0;i<c.length;i++){
				if(c[i]=='#'){
					coun++;
				}
			}
			
			String b=MsgMy.getText().substring(getChat2().length()-(2*coun),MsgMy.getText().length());  //计算表情
			setChat(getChat2()+b+info);  //原信息编码
			setChat2(getChat());
```
计算长度的时候需要注意JTextPane的getText（）不会得到表情编码，在表情处只会显示一个空格。具体的看代码实现。

**第五步：**

接受到的信息处理方法

```
public void manageInfo(String name,String info) throws BadLocationException {  //表情包
		int length = info.length();// 消息编码
		char[] every = new char[length];
		boolean is=false;
		int count = 0;// 记录次数
		String path = "img/"; // 
		Document doc = MsgArea.getStyledDocument();  //得到面板
		SimpleAttributeSet attr = new SimpleAttributeSet();
		for (int i = 0; i < every.length; i++) {
			every[i] = info.charAt(i);
			if (every[i] == '#') // 如果发现表情编码符# 则进行转表情操作
				is = true;
		}
		String msg = name+"\t"+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + "\n";  
		doc.insertString(doc.getLength(), msg, attr);
		
		if (is == false) {  //如果没有表情符号 则进行正常的添加信息处理
			msg = info + "\n";
			doc.insertString(doc.getLength(), msg, attr);
			return; 
		}
		for (int i = 0; i <length; i++) {  //如果有 # 则找到这个#的位置
			if (every[i] == '#') {
				String str = null;
				str = info.substring(count, i); // #前的字符
				try {
					if (str != null)
						doc.insertString(doc.getLength(), str, attr);// 添加#前的字符
				} catch (Exception e) {
				}
				String icName;
				icName = info.substring(i, i + 3); // #后2个的表情编号数字
				Icon ic = new ImageIcon(path + icName + ".png");// 加载对应表情
				MsgArea.setCaretPosition(doc.getLength());  //进行添加
				MsgArea.insertIcon(ic); // 
				count = i + 3;// 将下标移到表情数字后   然后再进行遍历
			}
		}
		if (count < length) { 
			String theLast = null;
			theLast = info.substring(count, length);
			theLast=theLast+"\n";
			try {
				doc.insertString(doc.getLength(), theLast, attr);
			} catch (Exception e) {
			}
		}else{
			String j="\n";
			doc.insertString(doc.getLength(), j, attr);
		}
	}
```
**第六步：**
发送信息
点对点聊天使用udp服务器，直接将需要发送的信息打包成Mess类发送给中转服务器。

## 发送文件（udp）

因为发送文件这块没有什么经验，起初想将文件转成字符串类型，通过json格式包直接传输。
但发现很难实现（乱码）。所以苦思乱想就想到了这个类似 云服务器的东西。
![在这里插入图片描述](https://img-blog.csdnimg.cn/2019122719092985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQ1NDIyNQ==,size_16,color_FFFFFF,t_70)
**图解：**
**第一步**：
用户使用JFileChooser选择文件，得到文件名（filename）和文件路径（filepath）。然后通过调用表情的信息处理方法，将文件名的格式进行判断（TXT,DOC,JPG,PNG...）在发送信息聊天框中体现出来。
然后点击发送【第一步：先将文件名发送给服务器，服务器上进行文件名的存储】【第二步：在客户端上记录一个touid（被发送对象的用户编号）然后发送文件给文件服务器的端口】

**第二步：**
文件服务器（独占一个端口，只用来接受文件）接受到文件后，在服务器端下载下来，并且生成一个随机的编号，将文件的路径用map进行存储（文件编号，文件路径）。然后将文件编号打包成`String msg="{\"files\":\""+num+"\",\"type\":\"fileNum\"}"; //回执一个文件编号`发送回去。

**第三步：**
客户端的服务器上发现接受到type=“filenum”的信息包，进行文件转发处理。如果发现touid不为空，则将这个文件编号发送给touid对应的用户编号

```
else if(type.equals("fileNum")){  //如果接受到的是一个文件编号
					System.out.println("客户端1:得到文件编码========");
					String filenum=json.getString("files");  //得到这个文件编号
					if(!CL.fileTouid.equals("")){  //如果发现有需求向用户发送文件
						String touid=CL.fileTouid;
						String myuid=JSONObject.fromObject(CL.My_json_info).getString("uid");
						msg="{\"myuid\":\""+myuid+"\",\"touid\":\""+touid+"\",\"files\":\""+filenum+"\",\"type\":\"SendFile\"}";  //创建向好友发送文件的请求
						byte[] b=msg.getBytes();
						len=b.length;
						pack=new DatagramPacket(b,0,len,InetAddress.getByName(CL.ip),CL.chat_port); //向聊天服务器发送编号
						CL.datasocket.send(pack);
					}
				}
```

**第四步：**
信息中转服务器接受到type=“SendFile”的信息包，进行处理。 
取出touid，判断这个编号的用户是否在线，如果没有在线，则进行离线信息的处理。
如果这个人在线，则将这个信息包转发给touid对应的用户。

```
else if(type.equals("SendFile")){  //如果是发送文件
				String touid=json.getString("touid");  //向他发
				if(!UserOnline.getUserOnline().ifOnline(touid)){  //如果对方没有在线
					UserOnline.getUserOnline().addMess(touid, datapack);  //则进行服务器的信息存储
					return;
				}
				Userinfo userinfo=UserOnline.getUserOnline().getOnline(touid);  //得到对方的ip用户
				try {
					datapack=new DatagramPacket(
							datapack.getData(),0,datapack.getLength(),   // json格式的数据包 包含信息和信息编号 原数据包
							InetAddress.getByName(userinfo.getUip())     //用户的ip地址
							,userinfo.getUport());                      //用户的端口
					datasocket.send(datapack);  //  发给客户端
				} 
			}
```

**`第五步：
**
客户端2的服务器接收到type=“SendFile”的信息包，取出其中的myuid，通过myuid得到发送方的网名netname
然后进行弹窗判断是否接收

```
int num=JOptionPane.showConfirmDialog(null,netname+"向你发送一个文件，是否接收","系统提示",JOptionPane.YES_NO_OPTION,JOptionPane.QUESTION_MESSAGE);
					if(num==JOptionPane.YES_OPTION){
						msg="{\"myuid\":\""+mymyuid+"\",\"files\":\""+filenum+"\",\"type\":\"getFile\"}"; //向服务器请求下载
						byte[] b=msg.getBytes();
						len=b.length;
						pack=new DatagramPacket(b,0,len,InetAddress.getByName(CL.ip),CL.chat_port); //向聊天服务器发送编号
						CL.datasocket.send(pack);
					}
```
如果选择接收的话，就重新组织语言，向拿包中的文件编号，向服务器讨要文件。

**第六步：**
服务器接收到type=“getFile”的信息包，取出其中的文件编号（filenum）和接收文件方的id（myuid），然后在服务器上进行文件的传输

```
else if(type.equals("getFile")){  //如果接受到的是要向他发送文件的请求
				System.out.println("服务器:客户端请求得到文件========");
				String filenum=json.getString("files");
				String path=CL.fileMap.get(filenum);  //得到需要发送的文件路径
				String myuid=json.getString("myuid");  //需要向 myuid发送文件
				FileInputStream fis=null;
				try {
					fis=new FileInputStream(new File(path));
					byte[] b=new byte[fis.available()];
					fis.read(b);
					Userinfo userinfo=UserOnline.getUserOnline().getOnline(myuid);  //得到对方的ip用户
					datapack=new DatagramPacket(
							datapack.getData(),0,datapack.getLength(),   // json格式的数据包 包含信息和信息编号 原数据包
							InetAddress.getByName(userinfo.getUip())     //用户的ip地址
							,userinfo.getUport());                      //用户的端口
					datasocket.send(datapack);  //  发给客户端
				} catch (FileNotFoundException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
```
**第七步：**
客户端服务器接收到没有题目（type）的包，默认为下载文件指令。接受其中的数据，进行下载。

```
else{ //如果没有主题 则为下载文件
					System.out.println("客户端2:得到文件========");
					FileOutputStream fos=null;
					try {
						fos=new FileOutputStream(new File("D:/"+CL.filename));
						byte[] b=new byte[1024*10];
						 len = 0;   //数据长度
						    while (len == 0) {  //无数据则开始循环接收数据
						        //接收数据包		               
						        len = pack.getLength();
						        if (len > 0) {
						            fos.write(b,0,len);
						            fos.flush();
						            len = 0;//循环接收
						        }
						}
					} catch (Exception e) {
						fos.close();
						e.printStackTrace();
					}
				}
```
**===================================**
到这里发送文件就完成了，不过需要提醒的是，这个功能bug很多；由于udp传输的原因，接受文件和发送文件需要进行处理（不会）。还有就是不能很多人同时进行发送文件的操作。
不过因为是udp传输文件，又要点对点传输。实在想不出很好的方法，发送文件的功能具体也能用。

# 点对多聊天
群聊的话和点对点聊天其实是一个东西。
客户端像点对点一样的进行发送。
服务器接收信息包的时候发现type=“chats”，群信息处理。
取出其中的群编号（pid），然后在数据库操作中得到这个群编号下的所有用户编号，然后进行一个遍历发送。
客户端接受到type=“chats”，群信息处理。

```
else if(type.equals("chats")){ //如果是群聊发送过来的信息
			try{
				if(CL.chatsmap.get(touid).isVisible()){ //群聊天面板
					JSONArray a=JSONArray.fromObject(CL.json_All_userinfo);
					String name=null;
					for(int i=0;i<a.size();i++){
						json=(JSONObject) a.get(i);
						if(myuid.equals(json.getString("uid"))){
							name=json.getString("netname");
						}
					}
					CL.chatsmap.get(touid).addTomess(msg, name);
				}else{
					throw new Exception();
				}
			}catch (Exception e) {
				CL.groupMap.get(touid).addMess(mess);
			}
		}
```
=====================
到这里仿QQ的一些思路就分享完了，具体代码可以到github上，地址：[https://github.com/LeYunone/leyuna-qq](https://github.com/LeYunone/leyuna-qq)自取，欢迎各位的金手指点评。
