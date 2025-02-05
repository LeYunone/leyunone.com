---
date: 2025-01-23
title: Acme.sh SSL证书自动续签保姆级流程
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: Acme,SSL
---
# Acme.sh SSL证书自动续签保姆级流程

## 安装

根据官方文档两种方式：

**http**

```shell
curl https://get.acme.sh | sh -s email=my@example.com

wget -O -  https://get.acme.sh | sh -s email=my@example.com
```

**git安装：**https://blog.csdn.net/m0_52985087/article/details/136205445

**Git**

```shell
git clone https://github.com/acmesh-official/acme.sh.git
cd ./acme.sh
./acme.sh --install -m my@example.com
```

由于Git对墙内服务器的逐渐迁移，我们大部分服务器还是无法访问Git的，因此需要用到Gitee

**Gitee**

```shell
git clone https://gitee.com/neilpang/acme.sh.git
cd ./acme.sh
./acme.sh --install -m my@example.com
```

需要注意Gitee所下载的版本对比最新版本落后很多，因此存在一些使用上或者扫描出来的BUG。

不过所有的功能与使用流程与最新版本一致

**检查**

检查是否安装成功：

1\定时任务

```shell
[root@VM-20-13-opencloudos acme]# crontab -e

2 0 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

2\检查指令

```shell
source ~/.bashrc
acme.sh --debug
```

## 使用

如我们人工的配置一个证书，acme脚本所做的如同一辙；从免费的证书网站上获取证书，验签、安装证书、迁移、配置....

但是一切的一切对用户来说都是透明的，我们只需要简单的启用脚本就可以无痕的完成一次SSL证书的签发.

**配置nginx**

```nginx
		server {
                listen 80;
                server_name www.leyunone.com;
                # rewrite ^/(.*)$ https://leyunone.com:443/$1 permanent;
    
                location /.well-known/acme-challenge/ {
                        root /www/ssl/;
                        log_not_found off;
                }
        }

```

`/.well-known/acme-challenge/` 是acme脚本执行过程中存放验证文件的目录，不管执行结果如何这个目录中的文件都会被清空

**签发**

```shell
acme.sh --issue -d leyunone.com -d www.leyunone.com --webroot /www/ssl

```

执行完成后可以看到证书生成在文件 ` /root/.acme.sh/leyunone.com` 域名的目录下，但是这些证书并不适合我们直接使用，因为他们属于acme的目录文件，未来acme更新目录结构改变，其中的文件也存在变更的风险；

因此需要将这些文件赋值到我们存放SSL证书的目录下，执行脚本：

```shell
acme.sh --install-cert -d leyunone.com \
--key-file       /我们存放证书的目录/leyunone.key.pem  \
--fullchain-file /我们存放证书的目录/leyunone.cert.pem \
--reloadcmd     "nginx -s reload"
```

 **nginxSSL配置**

```nginx
	server {
		listen 443 ssl;
		server_name www.leyunone.com;
		index index.html index.htm index.nginx-debian.html;
		ssl_certificate /我们存放证书的目录/leyunone.cert.pem;
		ssl_certificate_key /我们存放证书的目录/leyunone.key.pem;
		ssl_session_timeout 5m;
		ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
		ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
		ssl_prefer_server_ciphers on;
		gzip on;
		gzip_types text/plain application/xml text/css application/javascript;
		gzip_min_length 1000;
		charset utf-8;
		location /.well-known/acme-challenge/ {
			root /www/ssl/;
			log_not_found off;
		}
	}
```

这样使用acme的发签流程就完成了，是不是特别简单；

然后回到续签问题上，acme的定时任务:

```shell
2 0 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

每天凌晨0:02会执行脚本`acme.sh --cron`，检查域名是否即将60天过期。如果是则完成我们上述已经执行过（执行成功即新增了配置）的指令，帮助我们完成自动续约；

在文件`/root/.acme.sh/域名/域名.conf`中，可以看到定时任务执行脚本时所需要的所有配置参数，以及是否获取新证书的依据时间

## 后言

因为目前所接触的除了nginx服务器外没有其他，所以其余的生成模式比如Apache或Web服务器都没有涉及。但是依官方文档上所言，基本相同的指令流程。

官方文档十分强大，涵盖了所有可能遇到的问题；比如签发证书的网站，**默认使用的是ZeroSSL**太慢到最后超时失败，文档会告诉你修改CA机构：`acme.sh --set-default-ca --server letsencrypt`

以及除了Http请求获取证书的方式，还有DNS验证的模式教程 [https://github.com/acmesh-official/acme.sh/wiki/dnsapi](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)
