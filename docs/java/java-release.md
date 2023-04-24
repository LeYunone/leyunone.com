---
date: 2023-04-24
title: 如何发布一个Jar包到中央仓库
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: Maven、发布、java
---
# Issues

## 1、注册

[Sign up for Jira - Sonatype JIRA](https://issues.sonatype.org/secure/Signup!default.jspa)

创建好账号之后，创建仓库，表单如下图所示

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-24/27540c58-bb93-4e9a-9def-789265fc0043.png)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-24/f233cca0-3056-4971-a4f2-09f46be5bc28.png)

## 2、验证

在创建好仓库之后，BOT会向注册邮箱中发送两条邮信

**创建成功的：**

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-24/6702fa2e-3954-4e1b-9e0b-462599521f61.png" style="zoom:67%;" />

**等待验证的**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-24/d69fdf96-b6a0-4527-9541-c3911a9671af.png)

点开仓库链接，可以看到BOT发来的最新动态

![image-20230424232139457](C:/Users/leyuna/AppData/Roaming/Typora/typora-user-images/image-20230424232139457.png)

意思是，

1、如果你的仓库groupId，使用的是你自己的域名，那么需要在域名的DNS解析上添加一个： **记录为@** 、**记录类型TXT** 、**记录值为仓库名** 的记录

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-24/ea88cfa2-e069-49bf-8e3b-66f9cfcb2ffa.png)

2、如果你的仓库groupId，使用的GitHub地址，io.github.xxx，那么需要在你的GitHub中创建一个指定名称的仓库进行验证。

做好之后，将项目状态改变

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-24/e0551ed2-7705-4ac9-9a5d-4ed770fcca51.png)

然后就是一个等待BOT验证的过程，验证通过之后，会将通过的邮件发送至你的注册游戏

## 3、发布准备

### 1/创建秘钥

#### 秘钥GPG4win

下载：https://www.gpg4win.org/thanks-for-download.html

安装之后，打开cmd命令

![image-20230424233944016](C:/Users/leyuna/AppData/Roaming/Typora/typora-user-images/image-20230424233944016.png)

```markdown

gpg --gen-key
 Real name: 名字
 Email address: 邮箱
 You selected this USER-ID:
 "xxx[xxx@qq.com](mailto:xxx@qq.com)"
 Change (N)ame, (E)mail, or (O)kay/(Q)uit? o
 弹出一个Passphase（输入两次,务必牢记)
```

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-24/5d40449c-2a71-4137-90bf-6889dad58ba2.png)

```markdown
发布：gpg --keyserver hkp://keyserver.ubuntu.com:11371 --send-keys 公钥
查询：gpg --keyserver hkp://keyserver.ubuntu.com:11371 --recv-keys 公钥 
```

### 2/配置Maven-Setting

在Maven的Setting文件中

```xml
<servers>
	  <server>
        <id>ossrh</id>
        <username>(SonaType账号)</username>
        <password>(SonaType密码)</password>
	  </server>
  </servers>
 
  <profiles>
    <profile>
      <id>ossrh</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <properties>
        <!--这里填你安装的GnuPG位置-->
        <gpg.executable>E:\software\GnuPG\bin\gpg.exe</gpg.executable>
        <gpg.passphrase>填写你生成秘钥时输入的密码</gpg.passphrase>
        <!--这里填你秘钥在磁盘上的位置  gpg --list-keys 后会显示-->
        <gpg.homedir>C:\Users\leyuna\AppData\Roaming\gnupg\pubring.kbx</gpg.homedir>
      </properties>
    </profile>
  </profiles>
```

项目的Pom文件，如果是多模块项目，则添加在父类模块的pom文件中

```xml
  <!--协议-->
    <licenses>
        <license>
            <name>The Apache Software License, Version 2.0</name>
            <url>http://www.apache.org/licenses/LICENSE-2.0.txt</url>
            <distribution>repo</distribution>
        </license>
    </licenses>

    <!--我的信息-->
    <developers>
        <developer>
            <name>leyunone</name>
            <email>365627310@qq.com</email>
            <organization>https://leyuna.com</organization>
        </developer>
    </developers>

    <!--本项目仓库-->
    <scm>
        <connection>scm:git@github.com:leyunone/spring-mqtt-leyunone.git</connection>
        <developerConnection>scm:git@github.com:leyunone/spring-mqtt-leyunone.git</developerConnection>
        <url>git@github.com:leyunone/spring-mqtt-leyunone.git</url>
    </scm>

    <profiles>
        <profile>
            <!--注意,此id必须与setting.xml中指定的一致,不要自作聪明改它名字-->
            <id>ossrh</id>
            <!--            <id>release</id>-->
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <build>
                <!--发布到中央SNAPSHOT仓库插件-->
                <pluginManagement>
                    <plugins>
                        <!--测试包插件-->
                        <plugin>
                            <groupId>org.sonatype.plugins</groupId>
                            <artifactId>nexus-staging-maven-plugin</artifactId>
                            <version>1.6.7</version>
                            <extensions>true</extensions>
                            <configuration>
                                <serverId>ossrh</serverId>
                                <nexusUrl>https://s01.oss.sonatype.org/</nexusUrl>
                                <!--                                <autoReleaseAfterClose>true</autoReleaseAfterClose>-->
                            </configuration>
                        </plugin>

                        <!--正式环境插件-->
                        <!--                        <plugin>-->
                        <!--                            <groupId>org.apache.maven.plugins</groupId>-->
                        <!--                            <artifactId>maven-release-plugin</artifactId>-->
                        <!--                            <version>2.5.3</version>-->
                        <!--                            <configuration>-->
                        <!--                                <autoVersionSubmodules>true</autoVersionSubmodules>-->
                        <!--                                <useReleaseProfile>false</useReleaseProfile>-->
                        <!--                                <releaseProfiles>release</releaseProfiles>-->
                        <!--                                <goals>deploy</goals>-->
                        <!--                            </configuration>-->
                        <!--                        </plugin>-->


                        <!--生成API文档插件-->
                        <plugin>
                            <groupId>org.apache.maven.plugins</groupId>
                            <artifactId>maven-javadoc-plugin</artifactId>
                            <version>2.10.3</version>
                            <configuration>
                                <!-- 忽略生成文档中的错误 -->
                                <additionalparam>-Xdoclint:none</additionalparam>
                                <aggregate>true</aggregate>
                                <charset>UTF-8</charset><!-- utf-8读取文件 -->
                                <encoding>UTF-8</encoding><!-- utf-8进行编码代码 -->
                                <docencoding>UTF-8</docencoding><!-- utf-8进行编码文档 -->
                            </configuration>
                            <executions>
                                <execution>
                                    <id>attach-javadocs</id>
                                    <goals>
                                        <goal>jar</goal>
                                    </goals>
                                </execution>
                            </executions>
                        </plugin>

                        <!--生成源码插件-->
                        <plugin>
                            <groupId>org.apache.maven.plugins</groupId>
                            <artifactId>maven-source-plugin</artifactId>
                            <version>3.0.0</version>
                            <executions>
                                <execution>
                                    <id>attach-sources</id>
                                    <goals>
                                        <goal>jar-no-fork</goal>
                                    </goals>
                                </execution>
                            </executions>
                        </plugin>

                        <!--gpg插件-->
                        <plugin>
                            <groupId>org.apache.maven.plugins</groupId>
                            <artifactId>maven-gpg-plugin</artifactId>
                            <version>1.6</version>
                            <executions>
                                <execution>
                                    <id>sign-artifacts</id>
                                    <phase>verify</phase>
                                    <goals>
                                        <goal>sign</goal>
                                    </goals>
                                </execution>
                            </executions>
                        </plugin>

                    </plugins>
                </pluginManagement>
            </build>

            <distributionManagement>
                <snapshotRepository>
                    <id>ossrh</id>
                    <url>https://s01.oss.sonatype.org/content/repositories/snapshots/</url>
                </snapshotRepository>
                <repository>
                    <id>release</id>
                    <url>https://s01.oss.sonatype.org/content/repositories/releases/</url>
                </repository>
            </distributionManagement>
        </profile>
    </profiles>
    
```

