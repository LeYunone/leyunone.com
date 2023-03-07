---
date: 2022-03-09
title: 日记2
category: 
  - 开发日记
tag:
  - 开发日记
---
# 基于Swing的伪QQ开发日记2
本文与2019-12-29完成，怀念篇，归档。
| 模块     | 进度 |
| -------- | ---- |
| 登录     | √    |
| 注册     | √    |
| 信息交互 | √    |
在上一章中已经完成了上述操作，若有问题的可以私聊一起研究。

> 在完成了登录操作后，通过信息的交互，成功进入到了主界面。这时候就面临了几个问题。
> 1：好友的显示
> 2：个人资料的显示
> 3：群的显示
> 4：群下用户的显示
> 5：添加好友的显示

解决这几个问题，就是本项目的第二个难点，社交系统的完整。
不过好在，java的面向对象思想编程就是专业解决这些问题的方法。

## 面向对象
1：我们可以将每一个好友看作一个对象，每一个对象都有自己的Jpanel。而承担这些对象的面板就是好友列表FriendsList也是一个Jpanel 。
**图解**：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191225204318773.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQ1NDIyNQ==,size_16,color_FFFFFF,t_70)
所以我们将得到的所有好友信息进行下列操作

```
	JSONArray jsonlist=JSONArray.fromObject(CL.json_friend);
			for(int i=0;i<jsonlist.size();i++){
				JSONObject json=(JSONObject) jsonlist.get(i);
				String uid=json.getString("uid");
				String head=json.getString("head");
				String netname=json.getString("netname");
				String sign=json.getString("sign");
				String email=json.getString("email");
				
				Friends fs=CL.map.get(uid);
				if(fs!=null){
					fs.setHead(head);
					fs.setNetname(netname);
					fs.setSign(sign);
					fs.setEmail(email);
				}else{
					Friends f =new Friends(head, netname, sign,uid);
					f.setEmail(email);
					CL.map.put(uid, f);  //添加好友列表
				}
```
然后更新所有的好友的在线状态为false，在通过从服务器交互得到的好友在线编号，一一设置好友新在线状态。这样像QQ那样，在线好友头像为彩色，下线好友头像为灰色功能也就完成了。
然后**3，4，5**问题就都可以像这样的形式一一显示出来。唯一需要注意的是计算好友Jpanel的大于与好友列表Jpanel遍历添加好友的间隔大小。

> 不过作为社交系统当然还要好友与群的添加与删除，个人信息的改，好友的查询功能了。

在这里我们就要用创建新东西，udp服务器——指令服务器。
udp的特点，只管发送。若不处理这个问题，那么就不能体现出离线功能，所以对每一个指令又要进行二次处理。
**图解：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191225205648513.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQ1NDIyNQ==,size_16,color_FFFFFF,t_70)
关键点：**1、Json格式信息的传输。**
2、udp发送信息发送的是一个**包裹**。

所以针对这个问题，又可以用到**面向对象**的思想。
**创建信息（Mess）类**

```
package com.zy.qq.clientModel;

/**
 * 消息
 * @author 清风理辛
 *
 */
public class Mess {

	private String msg;  //消息
	private String touid; //被发送对象的编号
	private String myuid;  //发送者的编号
	private String code;   //信息编号
	private String type;  //信息题目
	public String getMsg() {
		return msg;
	}
	public void setMsg(String msg) {
		this.msg = msg;
	}
	public String getTouid() {
		return touid;
	}
	public void setTouid(String touid) {
		this.touid = touid;
	}
	public String getMyuid() {
		return myuid;
	}
	public void setMyuid(String myuid) {
		this.myuid = myuid;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
}
```
所以服务器得到这个信息包之后，可以根据touid和myuid，重新创建一个包，组织相应的语言后，根据touid在服务器的在线列表上查找这个编号的ip地址，如果发送touid在列表上没有被登记，则这个人没有在线。所以就要在服务器上进行这个人touid的信息存储。达到离线信息的效果。
**注意**由于udp的机制，我们必须要创建一个心跳包，防止socket被改变。（一样由指令服务器进行控制，type=“f5”）

就这样在服务器上对得到的包裹进行重新编织，就可以完成发送添加好友时，对方接到后，我方可以得到回应的效果。而删除，退群，创建群的功能则是单方面执行。我发出了，服务器就执行。

> 根据JSON的信息格式，社交上的增删改就可以很轻易的完成

然后就是社交上的重要的一环，**点对点聊天，点对多聊天。**
**关键点**：1 、聊天窗口的控制   
  2 、判断群下用户是否为陌生人的聊天窗口控制 
 3、离线信息的处理和未开窗口的信息处理  
 4、发送表情和文件

**点对点聊天**
双击好友或群下用户，弹出聊天界面。
这里又要用**面向对象**的思想
**问题1：**
**将每一个用户的聊天窗口看作一个对象**
所以在双击用户的时候就要进行聊天窗口的登记

```
if(CL.Chatmap.get(uid)==null){ //Chatmap 为每个用户编号名下的窗口  （String， Chatview）
						ChatView chatview=new ChatView(uid, netname, head, sign,Messlist);
						CL.Chatmap.put(uid, chatview); //进行聊天框登记
					}else{
						CL.Chatmap.get(uid).setAlwaysOnTop(true);
						CL.Chatmap.get(uid).setVisible(true);
						CL.Chatmap.get(uid).addMess(Messlist); //用来存储信息
					}
```

这里需要注意的是，窗口关闭时应该设置`setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);`
这样就可以完成双击打开窗口，关闭后再打开信息也不会删除的效果。
完成了对聊天窗口的控制。

**问题2**：判断双击的这个人是好友还是陌生人
首先要清楚为什么要进行判断。
原因：针对问题3的信息处理，防止打开两次处理的信息。

```
if(CL.Chatmap.get(uid)==null){
								ChatView chatview=new ChatView(uid, netname, head,sign,Messlist);
								CL.Chatmap.put(uid, chatview); //进行聊天框登记  如果是陌生人也登记
							}else{
								CL.Chatmap.get(uid).setAlwaysOnTop(true);
								CL.Chatmap.get(uid).setVisible(true);
								String [] str=CL.friend_list.split(",");  //得到好友编号
								for(String fuid: str){
									if(fuid.equals(uid)){
										CL.Chatmap.get(uid).addMess(CL.map.get(uid).getList());
										return;
									}
								}
								CL.Chatmap.get(uid).addMess(Messlist);
							}
```
**问题3**：离线信息的处理和未开窗口的信息处理  
针对这个问题，我们要先创建一个消息池，用来存储信息进行分类处理

```
public class MessPool {
	private MessPool(){}
	private static MessPool messpool=new MessPool();
	public static MessPool getMessPool(){
		return messpool;
	}
	public void addMess(JSONObject json){
		String myuid=json.getString("myuid"); 
		Mess mess=new Mess();
		String msg=json.getString("msg");
		String code=json.getString("code");
		String touid=json.getString("touid");
		String type=json.getString("type");
		mess.setCode(code);
		mess.setTouid(touid);  //如果是私聊 则是 向“我” 发送  我的编号      如果是 群聊  则是 群编号
		mess.setMyuid(myuid);  //如果是私聊 则是发送方的编号id     如果是群聊则是发送方的id
		mess.setType(type);   //群聊chats  私聊chat
		mess.setMsg(msg);
		if(type.equals("chat")){  //如果是私聊 点对点		
			try{
				if(CL.Chatmap.get(myuid).isVisible()){
					CL.Chatmap.get(myuid).addTomess(msg);
				}else {
					throw new Exception(); 
				}
			}catch (Exception e) {
				if(CL.map.get(myuid)!=null ){
					System.out.println("调用好友聊天");
					CL.map.get(myuid).addMess(mess);  //添加聊天记录
				}else{
					System.out.println("调用陌生人聊天");
					CL.groupuserMap.get(myuid).addMess(mess);
				}
			}
		}else if(type.equals("chats")){ //如果是群聊发送过来的信息
			try{
				if(CL.chatsmap.get(touid).isVisible()){
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
	}
}
```
接受到消息时，进行判断。 若消息的发送人的那个窗口被打开，则直接进行消息的显示。
若消息的发送人的那个窗口未被打开，则调用那个好友下的信息池messlist进行存储。然后当消息提醒铃声响起的时候，双击这个好友就将这个消息池messlist设置到这个好友聊天窗口中进行显示。

发送信息时，进行判断，服务器如果发现这个touid没有在线，则像前言一样，进行离线消息存储，等这个好友上线的时候，在发送给他。

**离线信息**
 在每一个用户登录上线后，马上在服务端端上拿自己的编号查找离线信息池map中有没有自己的信息，如果有的话，服务器就发送给"我"。就这样完成了离线信息的效果。
 可以在心跳包中实现这个功能

```
String myuid=json.getString("myuid");
				UserOnline.getUserOnline().updateUserUDP(myuid, datapack.getAddress().getHostAddress(), datapack.getPort());
				Userinfo userinfo=UserOnline.getUserOnline().getOnline(myuid);  //得到我的ip用户
				if(UserOnline.getUserOnline().getMess(myuid)!=null){  //如果我的账号下有离线信息
					ArrayList<DatagramPacket> datalist=UserOnline.getUserOnline().getMess(myuid);
					for(DatagramPacket datagramPacket:datalist){   //遍历所有的信息 发送到我的客户端端口上
						try {
							datagramPacket=new DatagramPacket(
									datagramPacket.getData(),0,datagramPacket.getLength(),   // json格式的数据包 包含信息和信息编号 原数据包
									InetAddress.getByName(userinfo.getUip())     //用户的ip地址
									,userinfo.getUport()); 	//用户的端口
							datasocket.send(datagramPacket);  //  发给客户端
						} catch (Exception e) {
							e.printStackTrace();
						}                      						
					}
					UserOnline.getUserOnline().clearMess(myuid);
```
