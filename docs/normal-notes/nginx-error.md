# Nginx  error

Nginx 在默认配置下，有着很多正常使用下，比如简单的路由转发、文件指向、负载等，灾难性错误的坑。

在最近的一次项目上线中，也因为服务器中对于Nginx的配置设置以及请求头的设置，导致了一次线上级的灾难性错误。

所以在这次事故案例发生后，我感觉非常非常有必要收集Nginx在使用中，那些隐蔽着的大大小小坑

## 下划线请求头部

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-09-11/480dfc1f-286b-4785-aaee-7efe4817d9e7.PNG)

由于业务需要，加上对Nginx这个配置的不熟。要求接口调用方设置了 `HOME_ID`的请求头，但是发现线上环境中代码里`HOME_ID`一直未被赋值。最终发现Nginx 对于 下划线的处理，当默认关闭 `underscores_in_headers` 设置时，Nginx会将请求头中的 下划线命名，转换为驼峰命名。

比如我设置的 `HOME_ID`，最终被设置为 `homeId` 转发到对应的路由上

## 自上而下的配置

这点简而易见，在Nginx的配置文件中，所有的生效设置比如 `server` `location:`  `proxy_pass` 都是自上而下覆盖性生效的。

比如以下配置：

```xml

location / {
    root  xxxxx;
    index index.html index.htm;
}
location /api/ {
    proxy_pass xxxxx;
}

```

在访问 .../api/时，就会被 上面的设置覆盖而指向目标root。

除此之外，在复杂的配置文件中，往往会 `include /usr/local/nginx/conf/vhost.d/*.conf; ` 之类的设置，将需要转发的应用路由单独开一个文件然后在主配置文件中引入。

并且 `include` 设置只是一个简单的插入的方式，所以我们必须考虑到自上而下的配置覆盖问题。

## include不能嵌套

一笔带过， `include` 支持后面跟多个文件 ，并且对主配置文件中 `include` 的次数没有任何的限制。

但是 include的配置文件中，禁止再使用 `include`设置

## 获取参数

当我们需要对访问路径中的参数进行捕捉，达到动态路由的转发功能时，必须要写上代理访问的解析

比如：

有一个访问路径， xxxxxx/api/?test=hello

```xml
location /api/ {
    proxy_pass $arg_test; # $arg_参数名：可以获取参数内容
}
```

在server配置中必须要加上 `resovler` 。

```xml 
server{
	listen 80;
	resovler 8.8.8.8;
}
```

## 负载均衡配置

作为Nginx最出名的功能，在使用负载均衡配置中，要注意其负载算法和设置。

Nginx的负载策略有6种：

- 权重(weight)
- ip_hash(依据ip分配方式)
- least_conn(最少连接数)
- fair(根据响应时间)
- url_hash(根据URL分配)
- 轮询

其中weight代表权重，权重较大者，被分配到的机会比较大；

max_fails是指最大失败次数，如果达到失败次数，那么该节点会被标记为不可用；

等待fail_timeout为时间周期；

因此一个负载路由的设置可以是这样：

```xml

upstream tomcat_pool 
    {
	server wwww.test.com weight=1 max_fails=2 fail_timeout=30s;
    server wwww.test.com weight=5 max_fails=2 fail_timeout=10s;
    }
```

## Nginx优化



