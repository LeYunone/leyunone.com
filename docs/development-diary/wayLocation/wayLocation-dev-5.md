---
date: 2022-04-09
title: wayLocation日记5
category: 
  - 开发日记
tag:
  - 开发日记
---
# wayLocation 本地方法测试工具开发日记5
> 0.0.1 - SNAPSHOT发布经历

## 准备
作为开箱即用的工具，测试阶段很是头痛。
因为依赖冲突不像代码，可以直观的看出错误。在引入工具自定义的spring-boot-start后，由于工具中spring、mvc、mybatis等依赖版本和被引入项目的某些依赖有很多冲突。
导致了总是总是出现很多莫名其妙的错误，
比如：Control层出参无法经过jast-json解析，不存在编码[缺失Get、Set方法；缺失重要依赖或组件]。所以很没有头绪的解决这个bug，后来也是在某些巧合[spring下的英文提问]。将原项目的依赖整理和工具重复依赖清理。问题突然就莫名其妙解决了。

还有，视图解析器的奇怪bug。在出现的时候，我的视图请求:"/waylocation",接口返回的是waylocation的字符串。
然后测试的时候，无论怎么操作都会报返回解析异常的错误。然后手一抖，把请求改成了:"/viewhtml"和返回值不重复之后。bug又莫名其妙的修复了，更关键的是之后想要复现，又将请求改回来之后，它又不报错了。![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210422.jpg)

**总之**很多这样的问题，没有任何头绪的出现错误。
不过好在慢慢的解决了，到现在我想这些错误出现的原因：拉本地依赖包出现旧版本问题，需要在打包前进行clear或者删除文件夹的错误。

然后就总结一下自定义一个spring-boot-start自动配置项目的流程。
其实不难，只要关注过springboot的源码，就能知道springboot的自动配置是基于@EnableAutoConfiguration中的AutoConfigurationImportSelector类里的一个方法：getAutoConfigurationEntry（）。
方法也简单，就是扫描解析WETA-INF文件下的spring.factories中定义的类，并且创建、填充、注入至ioc容器中。
所以我们自定义的start启动器，只需要标注@Configuration【配置类】，加上本工具的包扫描@ComponentScan，和配置文件类的设置@EnableConfigurationProperties（WayLocationProperties.class）。最后在WETA-INF文件夹下创建spring.factories文件：
```
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.leyuna.waylocation.autoconfig.WaylocationAutoConfiguration
```
就完成了一个自定义start，并且根据项目需要在public WaylocationAutoConfiguration() 构造器初始化时，进行业务的属性注入等操作。![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210514.jpg)

## 发布
通过准备、测试、整理之后，就是将工具的依赖发布到Maven中央仓库的时候了。
这里先贴上找到的比较好的教程：[链接](https://blog.csdn.net/lovexiaotaozi/article/details/121989407?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522164966192316780357283760%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=164966192316780357283760&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~times_rank-1-121989407.142^v7^pc_search_result_cache,157^v4^control&utm_term=%E5%8F%91%E5%B8%83maven%E4%B8%AD%E5%A4%AE%E4%BB%93%E5%BA%93&spm=1018.2226.3001.4187)
在上周已经把SonaType账号注册好，并且创建了仓库且认证了自己xya.leyuna的域名。
先说下认证域名的过程：
### 认证域名
1、创建仓库
2、在groupId那行，用自己的域名倒过来的顺序
3、创建成功之后，bot发个验证码需要你在你的域名DNS解析上映射。
![image.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-04-11/image.png)
记录值是**：https://issues.sonatype.org/browse/OSSRH-79702**  ，后面就是验证码
4、等，可能是几小时也可能是一星期。
5、bot发邮件告诉你通过了

### 配置文件
之后就需要着手设置发布依赖需要的属性及各种插件和配置了。
#### 秘钥GPG4win
下载：[https://www.gpg4win.org/thanks-for-download.html](https://www.gpg4win.org/thanks-for-download.html)
#### Maven配置文件
```

    <licenses>
        <license>
            <name>The Apache Software License, Version 2.0</name>
            <url>http://www.apache.org/licenses/LICENSE-2.0.txt</url>
            <distribution>repo</distribution>
        </license>
    </licenses>

    <developers>
        <developer>
            <name>leyuna</name>
            <email>1801370115@qq.com</email>
            <organization>https://leyuna.xyz</organization>
        </developer>
    </developers>

    <scm>
        <connection>scm:git@github.com:leyunone/waylocation.git</connection>
        <developerConnection>scm:git@github.com:leyunone/waylocation.git</developerConnection>
        <url>git@github.com:leyunone/waylocation.git</url>
    </scm>

    <profiles>
        <profile>
            <!--注意,此id必须与setting.xml中指定的一致,不要自作聪明改它名字-->
            <id>release</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <build>
                <!--发布到中央SNAPSHOT仓库插件-->
                <pluginManagement>
                    <plugins>
                        <plugin>
                            <groupId>org.apache.maven.plugins</groupId>
                            <artifactId>maven-release-plugin</artifactId>
                            <version>2.5.3</version>
                            <configuration>
                                <autoVersionSubmodules>true</autoVersionSubmodules>
                                <useReleaseProfile>false</useReleaseProfile>
                                <releaseProfiles>release</releaseProfiles>
                                <goals>deploy</goals>
                            </configuration>
                        </plugin>


                        <!--生成API文档插件-->
                        <plugin>
                            <groupId>org.apache.maven.plugins</groupId>
                            <artifactId>maven-javadoc-plugin</artifactId>
                            <version>2.9.1</version>
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
                            <version>2.2.1</version>
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
                    <!--注意,此id必须与setting.xml中指定的一致-->
                    <id>release</id>
                    <url>https://s01.oss.sonatype.org/content/repositories/snapshots</url>
                </snapshotRepository>
                <repository>
                    <id>release</id>
                    <url>https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/</url>
                </repository>
            </distributionManagement>
        </profile>
    </profiles>
```
以上是正式版的插件及依赖，测试版只需要改一改里面的属性和插件就行。
最后就是 **mvn clear** **mvn deploy** 过程.
最后就可以在[https://s01.oss.sonatype.org/#view-repositories;snapshots~browsestorage](https://s01.oss.sonatype.org/#view-repositories;snapshots~browsestorage)看到自己上传上去的依赖了。
但是到这里并不是将依赖上传到了中央仓库，还需要手动进行同步操作。
![企业微信截图_20220411171929.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-04-11/企业微信截图_20220411171929.png)
到这里，只需要静等一天左右。
就可以通过Maven中央仓库，引入自己的工具项目了。

## 总结
发布依赖真的挺磨脑子的，主要是注入自己项目的start依赖问题，导致出现了很多很多没有头绪的错误。
解决了很久很久，所以以后在开发开箱即用的应用，一定会先用个大版本控制整个项目的依赖。
其次就是很多细节问题，比如：
- 页面上配置了thymeleaf，所以使用了html加上vue，引入了element-ui插件。这里就有一个问题，因为如果使用网页引入element-ui以及vue的js和css的话。在国内很大概率出现访问不到的问题，所以需要将这些文件全部下载到项目中，本地引用。
- 在设置了server.servlet.context-path的应用里，前端的请求不能使用'/xxx/'封闭路径。需要'xxxx/xx'，相对路径请求。
- 因为本工具里有用到sql的拦截，所以要注意自定义的sql拦截顺序。
- 在非常非常在意重名问题，即工具中的类名和引用工具的项目里的类名。最好的解决办法就是在工具定义类名的时候，使用项目名作为前缀。
- ...
