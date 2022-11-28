---
date: 2022-03-04 14:57:14
title: 日记1
category: 
  - 开发日记
tag:
  - 开发日记
---
# 基于Swing的伪QQ开发日记1

本文与2019-12-29完成，怀念篇，归档。
> 在学完Swing，socket，线程，等等知识后，急需要一个项目练手。
> 但是XX管理系统肯定不能满足，所以在了解了json的皮毛之后，就着手作了这个伪QQ
>
> 完整代码已上传到github上，地址：[https://github.com/LeYunone/leyuna-qq](https://github.com/LeYunone/leyuna-qq)。有需要的可以自取。
> 作为一个伪QQ，代码中我实现了他的发送表情、文件、点对点，点对多。社交系统。实时在线更新，离线消息，个人资料上传等等功能。
> 仿QQ系列博客主要分享我在项目中遇到的几点难点。（1）发送表情和文件 （2）实时在线，信息更新 （3）
> 消息信息的处理  （4）社交系统的完整性。
> [JAVA: 初级项目之基于Swing界面的仿QQ（二）](https://blog.csdn.net/weixin_42454225/article/details/103705360)
> [JAVA: 初级项目之基于Swing界面的仿QQ（三）](https://blog.csdn.net/weixin_42454225/article/details/103706068)


# 需求分析
1：我们首先需要一个**登陆服务器**（oracle数据库进行辅助）进行登录，和一个**注册服务器**（HtmlEmail类）进行账号注册。
2：然后进行登录交互成功之后，客户端与服务器之间需要一个永不断开的死循环进行服务器发送给用户信息的交互，所以还需要一个**交互服务器**。
3：然后有了交互服务器之后，用户进入主界面，可以得到和自己有关的所有信息。但对这些信息进行操作的话，则需要一个**指令服务器**向服务器发送请求。
4：而其中**指令服务器**为一大类其中包括（**好友的增删改查**，**群组的增删改查**，**服务器的心跳包**，**点对点的聊天**，**云服务器的文件保存**，**个人信息的修改保存**等等...）
最后创建了这些服务器后，在可对客服端运行时的小细节进行填补（**好友弹窗**，**好友上线**，**消息铃声和提醒**，**实时在线更新**等等...）

## （1）登录服务器与注册服务器
**流程图思路**
![登录注册流程图](https://img-blog.csdnimg.cn/20191222211230266.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQ1NDIyNQ==,size_16,color_FFFFFF,t_70)

**代码思路（画图工具，丑请见谅）**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191222213202158.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQ1NDIyNQ==,size_16,color_FFFFFF,t_70)
登录与注册模块主要是要想清信息之间的交互，用tcp完成登录操作，信息交互正确，则进行连接后的无限循环的交互。 用udp完成注册操作，在客户端与服务器端设立一个接受端口，在程序运行时就打开，然后就由电脑无脑沟通就行了。
这里想玩花哨些就搞个手机注册什么的，在这里我用的是HtmlEmail类发送邮箱。
登录与注册模块主要需要注意的是tcp一问一答机制，**用户登录成功后再服务器上的在线列表的注册**和登录无论成功与否接下来的操作。其余的根据思路一步一步走就行。

## 服务器上的在线列表的注册
UserOnline类主要是封装了对用户上下线时的更新操作。

```
/**
 * 用户在线查询 服务器用
 * @author 清风理辛
 *
 */
public class UserOnline {

	private UserOnline(){}
	private static UserOnline useronline=new UserOnline();
	public static UserOnline getUserOnline(){
		return useronline;
	}
	private HashMap<String, Userinfo> map=new HashMap<String, Userinfo>();  //用户在线表 （编号，用户）
	jm 
	public void regOnline(Socket socket,String uid,String uemail,String uiphone){  //给服务器 用户列表一个用户编号进行在线登记
		 //用户在线登录登记
		Userinfo userinfo=map.get(uid);
		if(userinfo!=null){  //判断账号是否在线    进行挤号判断
			try {
				userinfo.getSocket().close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		userinfo=new Userinfo();
		userinfo.setSocket(socket);
		userinfo.setUemail(uemail);
		userinfo.setUid(uid);
		userinfo.setUiphone(uiphone);
		map.put(uid, userinfo);  //在线登记
	}
	public boolean ifOnline(String uid){  //查看用户是否在线
		Userinfo userinfo=map.get(uid);
		if(userinfo==null){
			return false;
		}else{
			return true;
		}
	}
	
	public Set<String> getOnlineList(){  //得到在线用户列表  
		return map.keySet();
	}	
	
	public void updateUserUDP(String uid,String ip,int port){  //心跳包用
		map.get(uid).setUip(ip);
		map.get(uid).setUport(port);
	}
	
	public Userinfo getOnline(String uid){  //得到在线用户
		return map.get(uid);
	}
	
	public void outOnline(String uid){  //用户下线更新，删除在线列表中的用户编号
		map.remove(uid);
	}
	
	
	private Hashtable<String, ArrayList<DatagramPacket>> messmap=new Hashtable<String, ArrayList<DatagramPacket>>();  //存储离线信息
	private ArrayList<DatagramPacket> dataList=new ArrayList<DatagramPacket>();  //离线包载体
	
	
	public void addMess(String uid,DatagramPacket pack){ //添加离线信息
		dataList.add(pack);
		messmap.put(uid, dataList);
	}
	
	public  ArrayList<DatagramPacket> getMess(String uid){  //取得离线信息
		return messmap.get(uid);
	}
	
	public void clearMess(String uid){ //清空当前用户下的离线信息
		messmap.remove(uid);
	}
}
```
然后就是登录之后最重要的操作，也是本项目的核心之处.

# 交互服务器（实时在线，信息更新）

```
public class LoginServer implements Runnable {
	
	private Socket socket;
	
	public LoginServer(Socket socket){
		this.socket=socket;
	}

	public static void openServer(){  //打开服务器
		ExecutorService es=Executors.newFixedThreadPool(1000);  //创建1000个线程池
		try {
			ServerSocket serversocket=new ServerSocket(CL.Login_port);
			while(true){
				Socket socket=serversocket.accept();  //等待用户端连接
				//如果连上
				es.execute(new LoginServer(socket));  //创建一个新用户至服务器线程池
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	@Override
	public void run() {   //服务器线程事务
		InputStream is=null;
		OutputStream os=null;
		String uid=null;
		try {
			is=socket.getInputStream();
			os=socket.getOutputStream();
			byte[] bf=new byte[2048];
			int len=is.read(bf);  //String msg="{\"iphone\":\""+iphone+"\",\"email\":\""+email+"\",\"name\":\""+name+"\",\"passwod\":\""+password+"\"}";
			String msg=new String(bf,0,len);  //接受客户端的登录请求		
			JSONObject json=JSONObject.fromObject(msg); //解析登录信息
			String username=json.getString("username");
			String password=json.getString("password");
			 ///判断是否是手机号码登录
			String regExp = "^((13[0-9])|(15[^4])|(18[0,2,3,5-9])|(17[0-8])|(147))\\d{8}$";
		    Pattern p = Pattern.compile(regExp);
		    Matcher m = p.matcher(username);
		    boolean lis=m.matches();	    
			try{   //登录时进行检测 服务器回复登录问题   登录成功后注册在线
				if(lis){ //如果是手机号码   
					uid=IFLogin.loginiphone(username, password);  //手机登录
					UserOnline.getUserOnline().regOnline(socket, uid, null, username);//登录后进行在线用户注册
				}else{ 
					uid=IFLogin.loginemail(username, password);   //邮箱登录
					UserOnline.getUserOnline().regOnline(socket, uid, username, null);//登录后进行在线用户注册				
 				}			
				//如果没有抛出异常 ，则 登录成功服务器回复0
				os.write("{\"state\":0,\"msg\":\"登录成功!\"}".getBytes());
				os.flush();			
				
				while(true){  //登录后成功服务器相连

                   //!!!!!!!!!!!!!!交互服务器			
				}
				
			}catch (NotUserException e) {
				os.write("{\"state\":1,\"msg\":\"没用用户名!\"}".getBytes());  
				os.flush();
			} catch (PasswordException e) {
				os.write("{\"state\":2,\"msg\":\"密码错误!\"}".getBytes());
				os.flush();
			} catch (AccountException e) {
				os.write("{\"state\":3,\"msg\":\"账号被封!\"}".getBytes());
				os.flush();
			} catch (SQLException e) {
				os.write("{\"state\":4,\"msg\":\"数据库出现差错!\"}".getBytes());
				os.flush();
			}		
		} catch (IOException e) {
			System.out.println("发送错误");
		}finally{
			try {
				UserOnline.getUserOnline().outOnline(uid);
				is.close();
				os.close();
				socket.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
```
可以看到用户成功登录后，不会与服务器断开，而是进入到一个不间断的循环中，这个循环就是本项目的主角_**实时在线更新信息.**

## 客户端

```

public class ForServer implements Runnable {
	private Socket socket=null;
	private InputStream is=null;
	private OutputStream os=null;
	private Thread thread;
	private boolean isrun=false;  //控制线程开关
	public static int num=0;
	@Override
	public void run() {   //与服务进进行交互的方法		
		try{
			while(isrun){
				Thread.sleep(5000);
				byte[]bf=new byte[2048*30];
				int len =0;
				os.write("03".getBytes());   //2  得到个人信息
				os.flush();
				len=is.read(bf);
				String my=new String(bf,0,len);
				CL.My_json_info=my;
//				System.out.println("个人："+my);
				
				os.write("01".getBytes());   //1得到好友信息
				os.flush();
				
				bf=new byte[10240];
				len  =is.read(bf);
				String msg=new String(bf,0,len);
				CL.json_friend=msg;    //传递好友信息
				
				os.write("02".getBytes());
				os.flush();
				is.read(); //读到服务器已响应指令
				String online=null;
				os.write(CL.friend_list.getBytes());
				os.flush();
				len=is.read(bf);  //得到所有在线好友的编号
				online=new String(bf,0,len);
				if(online.equals("040")){
					CL.friend_online="";
				}else{
					CL.friend_online=online;
//					System.out.println("好友在线编号："+CL.friend_online);
					CL.friendlist.updateFriend();  //实时更新用户下的所有好友信息
				}

				os.write("05".getBytes());
				os.flush();
				len=is.read(bf);
				String userinfoall=new String(bf,0,len);
				try {  
					if(!CL.json_All_userinfo.equals(userinfoall)){   //当有人的信息修改的时候
						CL.json_All_userinfo=userinfoall;
						CL.userinfolist.getAlluser();
						for(GroupUserList g:CL.groupUserviewlist){
							 g.updateGroup();
						}
					}
				} catch (Exception e) {
				}
				CL.json_All_userinfo=userinfoall;  //所有的用户信息 	
				os.write(1);
				os.flush();
				len=is.read(bf);
				String userinfoallid=new String(bf,0,len);  //接受到  xxx,xx,xx  编号
				if(!CL.All_userinfo_online.equals(userinfoallid)){  //如果发现有人上线了
					try {
						Player play=new Player(new FileInputStream( "Music/上线.mp3"));
						play.play();
					} catch (FileNotFoundException e) {
						e.printStackTrace();
					} catch (JavaLayerException e) {
						e.printStackTrace();
					}
					CL.All_userinfo_online=userinfoallid;
					CL.userinfolist.getAlluser();
				}
				CL.All_userinfo_online=userinfoallid;
				
				os.write("06".getBytes());  //更新加入的群编号
				os.flush();
				len=is.read(bf);
				String myGroup=new String(bf,0,len);			
				
				if(!CL.stringbuffer_list_myGroup.equals(myGroup)){  //如果发现群编号发生改变  
					System.out.println("退群成功");
				    CL.stringbuffer_list_myGroup=myGroup;
					os.write("07".getBytes());  //更新加入的群信息
					os.flush();
					len=is.read();
					os.write(CL.stringbuffer_list_myGroup.getBytes());
					os.flush();
					len=is.read(bf);
					String myGroupinfo=new String(bf,0,len); //得到自己的群的所有信息
					System.out.println("群："+myGroupinfo);
					CL.json_list_myGroupinfo=myGroupinfo;   //进行存储
					CL.grouplist.updateGroup();  //进行群信息
//					CL.grouplist.updateGroupList();//进行群列表
				}				
				CL.stringbuffer_list_myGroup=myGroup;   //得到所有的群编号
				
				os.write("08".getBytes()); //更新群下的用户           
				os.flush();
				is.read();
				os.write(CL.stringbuffer_list_myGroup.getBytes()); // 发送我的群编号
				os.flush();
				len=is.read(bf);
				String map_group_user=new String(bf,0,len);  //你群下的用户与群的关系
				CL.Map_User_Group=map_group_user;  //存储 群与用户编号的关系
				os.write(1);  //继续执行08  得到群中在线用户
				os.flush();
				len=is.read(bf);
				String map_group_user_online=new String(bf,0,len);
//				System.out.println("群在线编号:"+map_group_user_online);
				try{
					if(!CL.Map_User_Group_Online.equals(map_group_user_online)){
//						System.out.println("进行群在线更新！");
						CL.Map_User_Group_Online=map_group_user_online;  //得到json格式的  群编号：  群用户在线编号
						CL.grouplist.updateGroupList(); //进行用户列表更新
						if(CL.groupUserviewlist.size()!=0){
							for(GroupUserList g:CL.groupUserviewlist){
								 g.updateGroup();
							}
						}
					}
				}catch (Exception e) {
//					System.out.println("更新组员在线出现错误");
				}
				CL.Map_User_Group_Online=map_group_user_online;  //得到json格式的  群编号：  群用户在线编号
				
			}
		}catch (Exception e) {
			System.out.println("与服务器断开连接");
			e.printStackTrace();
			isrun=false;
		}finally{
			
		}
	}

	@SuppressWarnings("deprecation")
	public JSONObject login(){
		try {
			
			socket=new Socket(CL.ip,CL.Login_port);  //连接服务器
			is=socket.getInputStream();  //接通服务器端 
			os=socket.getOutputStream(); //发送服务器信息
			String msg="{\"username\":\""+CL.username+"\",\"password\":\""+CL.password+"\"}";
			
			os.write(msg.getBytes()); //请求登录       发送信息 {"username":"xxxx","password":"xxxx"}
			os.flush();
			
			byte[] bf=new byte[2048];
			int len=is.read(bf);
			msg=new String(bf,0,len);
			
			JSONObject json=JSONObject.fromObject(msg);
			
			int state=json.getInt("state");
			if(state==0){ //如果账号没被封
				if(thread!=null){  //判断是否已经连上
					if(thread.getState()==Thread.State.RUNNABLE){
						thread.stop();
						isrun=false;
					}
				}
				
				////////////////////////////////////       进行登陆服务    
				os.write("01".getBytes());   //1得到好友信息
				os.flush();
				bf=new byte[10240];
				len  =is.read(bf);
				msg=new String(bf,0,len);
				CL.json_friend=msg;    //传递好友信息
//				System.out.println(msg);  //json数组的好友信息
				System.out.println("好友信息："+msg);
				JSONArray jlist=JSONArray.fromObject(CL.json_friend);
				StringBuffer sb=new StringBuffer();
				for(int i=0;i<jlist.size();i++){
					JSONObject jsons=(JSONObject) jlist.get(i);
					String uid=jsons.getString("uid");
					sb.append(uid);
					sb.append(",");
				}
				if(sb.toString().equals("")){
					CL.friend_list="040";  //如果没有好友得到040错误
				}else{
					CL.friend_list=sb.toString();  //存储仅包含好友编号的信息
				}
				os.write("03".getBytes());   //2  得到个人信息
				os.flush();
				len=is.read(bf);
				msg=new String(bf,0,len);
				CL.My_json_info=msg;
				System.out.println("个人："+msg);
				os.write("06".getBytes());  //更新加入的群编号
				os.flush();
				len=is.read(bf);
				String myGroup=new String(bf,0,len);			
				CL.stringbuffer_list_myGroup=myGroup;   //得到所有的群编号
//				System.out.println("群编号:"+CL.stringbuffer_list_myGroup);
				os.write("07".getBytes());  //更新加入的群信息
				os.flush();
				len=is.read();
				os.write(CL.stringbuffer_list_myGroup.getBytes());
				os.flush();
				len=is.read(bf);
				String myGroupinfo=new String(bf,0,len); //得到自己的群的所有信息
				CL.json_list_myGroupinfo=myGroupinfo;   //进行存储
				System.out.println("你的群信息:"+CL.json_list_myGroupinfo);
				os.write("05".getBytes());
				os.flush();
				len=is.read(bf);
				String userinfoall=new String(bf,0,len);
				CL.json_All_userinfo=userinfoall;  //所有的用户信息 	
				os.write(1);
				os.flush();
				len=is.read(bf);
				String userinfoallid=new String(bf,0,len);  //接受到  xxx,xx,xx  编号
				CL.All_userinfo_online=userinfoallid;
				os.write("08".getBytes()); //更新群下的用户           
				os.flush();
				is.read();
				os.write(CL.stringbuffer_list_myGroup.getBytes()); // 发送我的群编号
				os.flush();
				len=is.read(bf);
				String map_group_user=new String(bf,0,len);  //你群下的用户与群的关系
				CL.Map_User_Group=map_group_user;  //存储 群与用户编号的关系
				JSONObject jsons=JSONObject.fromObject(CL.Map_User_Group);
				System.out.println(jsons);
				os.write(1);  //继续执行08  更新群中在线用户
				os.flush();
				len=is.read(bf);
				String map_group_user_online=new String(bf,0,len);
				CL.Map_User_Group_Online=map_group_user_online;  //得到json格式的  群编号：  群用户在线编号
				jsons=JSONObject.fromObject(CL.Map_User_Group);  //群与用户编号关系
				thread=new Thread(this);
				isrun=true;
				thread.start();
			}
			return json		
		} catch (UnknownHostException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
}

```
**服务器交互代码**

```
					bf=new byte[2048*5];
					len=is.read(bf);
					msg=new String(bf,0,len);
//					System.out.println("得到执行"+msg);
					if(msg.equals("01")){   //传送好友列表
						 Vector<Friend> vc=IFLogin.getFriend(uid);  //得到好友
						 os.write(JSONArray.fromObject(vc).toString().getBytes());
						 os.flush();
					}else if(msg.equals("02")){  //传送好友在线列表
						//更新前，客服端向服务器发送一个自己的好友列表
						os.write(1);// "给我列表"
						os.flush();
						len=is.read(bf);  // 读到客户端发来的列表  XXXX,XXXX,XXX 好友编号
						msg=new String(bf,0,len);
						if(msg.equals("040")){  //如果接受到的是没有好友的列表信息
							os.write("040".getBytes());
						}else{
							String fs[]=msg.split(",");
							StringBuffer sb=new StringBuffer();
							for(String f:fs){
								System.out.println(f);
								if(UserOnline.getUserOnline().ifOnline(f)){
									sb.append(f);
									sb.append(",");
								}
							}
							if(sb.length()==0){
								System.out.println("没有好友在线");
								os.write(0);
								os.flush();
							}else{
								os.write(sb.toString().getBytes());
								os.flush();
							}
						}
						
					}else if(msg.equals("03")){  //传送个人信息
						Myuserinfo user=IFLogin.reMyuser(uid);
						json=JSONObject.fromObject(user);
						os.write(json.toString().getBytes());
						os.flush();
					}else if(msg.equals("05")){  //传输所有的用户信息 以备使用   两部操作
						Vector<Friend> userinfoall=IFLogin.queryAll();
						JSONArray ja=JSONArray.fromObject(userinfoall);
						os.write(ja.toString().getBytes());  //所有的用户信息  
						os.flush();
						is.read(); //读到继续指令
						//将所有在线用户的编号发给客户端
						Set<String> setonline=UserOnline.getUserOnline().getOnlineList();  //得到所有在线用户的编号
						//得到[x,x]
						Iterator<String> it=setonline.iterator();
						StringBuffer sb=new StringBuffer();
						while(it.hasNext()){
							sb.append(it.next());
							sb.append(",");
						}
						os.write(sb.toString().getBytes());
						os.flush();
					}else if(msg.equals("06")){  //传输我加入的群编号
						StringBuffer sb=IFLogin.getMyGroup(uid);
						os.write(sb.toString().getBytes());  //传输群编号
						os.flush();
					}else if(msg.equals("07")){  //传输客户端传输过来的群编号的群信息
						os.write(22);  //给我你的群的编号
						os.flush();
						len=is.read(bf); //读取发送过来的群编号
						msg=new String(bf,0,len);
						String[] pids=msg.split(",");
						Vector<Groupinfo> list=IFLogin.getMyGroupinfo(pids);
						JSONArray jarry=JSONArray.fromObject(list);
						os.write(jarry.toString().getBytes());  //向客户端发送你加入的群的信息
						os.flush();
					}else if(msg.equals("08")){  //查询我的群的所有用户
						os.write(1); //给我你的群号
						os.flush();
						len=is.read(bf);   //接受到你给我的你的群编号
						msg=new String(bf,0,len);
						String [] str=msg.split(",");
						HashMap<String, Group> map=IFLogin.getGroup(str); //每个群里所有的用户编号
						HashMap<String,ArrayList<String>> umap=new HashMap<String, ArrayList<String>>();  //用户与群的关系
						HashMap<String,ArrayList<String>> onlineMap=new HashMap<String, ArrayList<String>>();  //群下用户的在线编号
						for(String s:str){
							onlineMap.put(s, new ArrayList<String>());
							ArrayList<String> list=map.get(s).getUser();
							for(int i=0;i<list.size();i++){
								if(UserOnline.getUserOnline().ifOnline(list.get(i))){
									onlineMap.get(s).add(list.get(i));
								}
							}
							umap.put(s, list);
						}
						JSONObject ja=JSONObject.fromObject(umap);
						os.write(ja.toString().getBytes());
						os.flush();
						is.read(); //得到需要执行 传给客户端群中在线用户编号
						JSONObject jaonline=JSONObject.fromObject(onlineMap);
						os.write(jaonline.toString().getBytes());  //传送用户在线编号
						os.flush();    
					}else if(msg.equals("09")){   // 得到账号下的离线信息
					}
```

# 图解

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191225201415522.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQ1NDIyNQ==,size_16,color_FFFFFF,t_70)
客户端会在登录成功后，先向服务器请求**01，03，06，07，05，08**然后将得到的数据保存在工具包中的常量类中。随后进入每5秒（自己设定）循环一次的信息交互中。若发现常量中的数据与新循环而得到的数据不同，然后完成时在线更新。
难点：tcp机制，加入的群下用户信息的得到，实时在线更新的操作，服务器在数据库上的请求。
这里最需要搞清楚的是json信息的交互过程。
不过由于是tcp传输一问一答形式，所以理清代码的运行顺序就没问题了。
具体数据库代码就不一一演示了，有需要的可以看源代码.
