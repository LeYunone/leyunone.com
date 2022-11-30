---
date: 2022-05-18
title: SpringCloud源码阅读—负载均衡
category: 
  - Spring
tag:
  - SpringCloud
head:
  - - meta
    - name: keywords
      content: Spring,SpringCloud,源码阅读
  - - meta
    - name: description
      content: SpringCloud的负载均衡由Ribbon组件完成，Ribbon组件在实际开发中很难直接接触，因...
---

# SpringCloud源码阅读—负载均衡

SpringCloud的负载均衡由Ribbon组件完成，Ribbon组件在实际开发中很难直接接触，因为我们大多都是直接使用了**@FeignClient**客户端注释，直接使用默认的所有配置去调用已经注册的服务。

所以SpringCloud的负载均衡流程需要由我们自己去探索发现。

##  LoadBalancerAutoConfiguration

配置均衡的自动配置类，我们以此为入口，看看负载均衡具体关联了哪些重要类。

###  loadBalancerRequestFactory

*LoadBalancerRequest* 创建封装HTTP请求的ClientHttpResponse生成工厂。

原理简单，首先Spring通过读取配置文件中的地址、端口等属性构造出LoadBalancerClient客户端 ；

然后请求工厂根据

```
HttpRequest serviceRequest = new ServiceRequestWrapper(HttpRequest, ServiceInstance,
      LoadBalancerClient);
```

得到本次服务请求的HttpRequest，包含发送地址以及byte形式入参

###  LoadBalancerInterceptorConfig

拦截器配置类，拦截的是拦截RestTemplate对象发起的HTTP请求。

```
		@Bean
		public LoadBalancerInterceptor loadBalancerInterceptor(
				LoadBalancerClient loadBalancerClient,
				LoadBalancerRequestFactory requestFactory) {
			return new LoadBalancerInterceptor(loadBalancerClient, requestFactory);
		}
```



###  RetryInterceptorAutoConfiguration

配置RestTemplate与LoadBalancerInterceptor进行绑定，所以这个配置与上面的配置是息息相关的。

只有当次配置生效时，拦截器才会生效。

```
		@Bean
		@ConditionalOnMissingBean
		public RestTemplateCustomizer restTemplateCustomizer(
				final RetryLoadBalancerInterceptor loadBalancerInterceptor) {
			return restTemplate -> {
				List<ClientHttpRequestInterceptor> list = new ArrayList<>(
						restTemplate.getInterceptors());
				list.add(loadBalancerInterceptor);
				restTemplate.setInterceptors(list);
			};
		}
```

### 总结

所以LoadBalancerAutoConfiguration自动配置类，除了装载一些默认配置或是自定义的类外。

最核心的就是自动加载了LoadBalancerInterceptor拦截器，而负载均衡就是在RestTemplate发起HTTP请求到生效前，被拦截进行的负载均衡算法。



## LoadBalancerInterceptor

作为一个拦截器，理所当然的定位他的拦截方法 **intercept** 准没错。

```
	@Override
	public ClientHttpResponse intercept(final HttpRequest request, final byte[] body,
			final ClientHttpRequestExecution execution) throws IOException {
		final URI originalUri = request.getURI();
		String serviceName = originalUri.getHost();
		Assert.state(serviceName != null,
				"Request URI does not contain a valid hostname: " + originalUri);
		return this.loadBalancer.execute(serviceName,
				this.requestFactory.createRequest(request, body, execution));
	}
```

可以看到拦截方法中，除了前置的通过本次RestTemplate的HTTP请求头，拿到需要的服务名/路径等，主要是调用LoadBalancerClient的execute方法。

那么我们来到LoadBalancerClient中找到方法实例
![image-20220518235924952.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-19/image-20220518235924952.png)width="auto" height="auto"

可以看到有两个实例，根据内容分析。

```
BlockingLoadBalancerClient

     ReactiveLoadBalancer<ServiceInstance> loadBalancer = this.loadBalancerClientFactory.getInstance(serviceId);
```

BlockingLoadBalancerClient中有这样一行代码，说明和客户端缓存有关。

那么我们则可以跳过这个，直接观测 **RibbonLoadBalancerClient**

根据方法路径

```
execute->getServer->execute
```

解释：调用getServer方法获得本次服务调用的Server，然后将这个Server、requset、body数据源，交给最终客户端处理返回结果。

所以负载均衡就是在这个getServer方法中进行的，其余的过程都是无法改变的硬性流程。

### getServer

```
    protected Server getServer(ILoadBalancer loadBalancer, Object hint) {
        return loadBalancer == null ? null : loadBalancer.chooseServer(hint != null ? hint : "default");
    }
```

返回的是loadBalancer中的chooseServer方法

```
    public Server chooseServer(Object key) {
        if (counter == null) {
            counter = createCounter();
        }
        counter.increment();
        if (rule == null) {
            return null;
        } else {
            try {
                //使用默认 “default” key
                return rule.choose(key);
            } catch (Exception e) {
                logger.warn("LoadBalancer [{}]:  Error choosing server for key {}", name, key, e);
                return null;
            }
        }
    }
```

key在我们默认下，即没有指定hint对象时，使用默认key，那么这个默认key是什么呢


![image-20220519001133033.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-19/image-20220519001133033.png)width="auto" height="auto"

 **RoundRobinRule**对象，直译出来轮询规则，这也是Cloud默认的负载均衡算法是轮询的原因。

而算法则是在其rule.choose(key);

**choose**方法中实现：

```
轮询算法很简单，指定一个标识，然后这个标识对应位置就是当前服务器位置，轮询则是将上一次位置+1 = 当前服务器位置。并且在服务器数量范围内区间内不断循环。
    
```
![image-20220519001618219.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-19/image-20220519001618219.png)width="auto" height="auto"

在incrementAndGetModulo中进行新节点位置的计算：

```
    private int incrementAndGetModulo(int modulo) {
        for (;;) {
            int current = nextServerCyclicCounter.get();
            int next = (current + 1) % modulo;
            if (nextServerCyclicCounter.compareAndSet(current, next))
                return next;
        }
    }
```

nextServerCyclicCounter采用AtomicInteger原子类，确保原子性计算。

### 自定义负载均衡算法

所以如果我们需要自定义一个负载均衡算法，则只需要围绕 XXXRule构建就可。

继承AbstractLoadBalancerRule，在IOC中进行注册。

实现最重要的**choose**方法，入参为Key和ILoadBalancer。

其中ILoadBalancer为注册中心同步过来的服务列表，存储当前所有的服务节点。

所以我们只需要根据自己的算法，得到本次服务调用的节点位置，将其返回。

这样一个自定义的负载均衡就完成了。

# 总结

总结一下服务调用，进行负载均衡的这么一个流程。

1. 自动构建RestTemplate
2. 生成LoadBalancerClient请求的HTTP封装好的工厂
3. 加载LoadBalancerInterceptor拦截器
4. 将拦截器和容器中的RestTemplate进行绑定
5. RestTemplate发起HTTP，请求服务调用
6. LoadBalancerInterceptor拦截HTTP请求，进行拦截方法
7. 拦截方法根据指定的或默认的负载均衡算法器进行其中的方法
8. Rule算法器执行Choose方法，返回出本次调用服务的节点Server。
9. Client将Server信息与Http请求进行绑定，并且发起HTTP请求。
