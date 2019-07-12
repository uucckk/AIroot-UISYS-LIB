# UI-SYSTEM-RELEASE
Public for UI-SYSTEM
# 说明
- UI-SYSTEM 是一套轻巧、高性能、静态前端系统，可以快速构建稳健的WEB服务。  
整套系统采用了混合式的开发思想，即“选择合适的技术做擅长的事，各尽其职，优势融合”。  
- UI-SYSTEM 设计思想是 “简单明了，直截了当”，让前端工程师直接进入开发状态。  
- UI-SYSTEM 在模块化设计上，采用微模块方案，你可以把他理解为DNA和氨基酸的配合，一切展现模块都是即时组合，并且在渲染上做了大量优化，能提供原生性能的渲染体验。  
- UI-SYSTEM 提供了命令行控制服务和自动配置文件两种方式部署，服务采用热更新方式，动态切换服务参数。  
- UI-SYSTEM 采用Go作为开发语言，充分利用了Go的高并发能力，很高兴选择了Go作为服务开发（之前一直使用Java，实际上GO在复杂业务上处理速度已经远远高于Java这门语言，网上很多人用JIT命中高例子和Go对比是不正确的。）
# 如何使用
> WINDOWS  
1. window系统运行uisys.exe  
2. 从example里面添加一个工程，写法如下：

```linux
pub example/v1 :80
```
其中:80是开启服务的端口好，也可以指定发布地址，如127.0.0.1:80  

3. 打开chrome浏览器，输入：http://127.0.0.1/

> LINUX 和 CENTOS

> DARWIN

> ARM

# 命令解析
## 服务控制命令
### 1. <b>help</b>  
获取帮助信息
```linux
$> --help
---------------------------------------------
    lang Language Setting.
    COMMAND: lang <zh/cn>

    pub Publishing websites.
    COMMAND: pub <path> [HTTP Service IP:PORT]

    ls Show services list.
    COMMAND: ls

    add Add services and don't use command as services name.
    COMMAND: add <Service Name> [Project Path] [HTTP Service IP:PORT]
...
```

### 2. <b>version</b>  
获取软件版本
```linux
$> version
---------------------------------------------
    AIroot UI-SYSTEM 0.9.5beta
```

### 3. <b>pub</b>  
发布指定目录为网站  
命令格式: pub <path> [HTTP Service IP:PORT]
```linux
$> pub example/v1
---------------------------------------------
  The [p0] setted in [E:\UISYS-RELEASE\example\v1].
  The [p0] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
可以指定端口：
```linux
$> pub example/v1 :8888
---------------------------------------------
  The [p0] setted in [E:\UISYS-RELEASE\example\v1].
  The [p0] starting at  [:8888]
  WEB Server Started At: [:8888]. Use protocol http
```
可以指定绝对路径：
```linux
$> pub E:\UISYS-RELEASE\example\v1 :8888
---------------------------------------------
  The [p0] setted in [E:\UISYS-RELEASE-0.9.5BETA\example\v1].
  The [p0] starting at  [:8888]
  WEB Server Started At: [:8888]. Use protocol http
```
对于带空格的路径可以用引号括起来，如下：
```linux
$> pub "E:\UISYS RELEASE\example\v1" :8888
---------------------------------------------
  The [p0] setted in [E:\UISYS RELEASE\example\v1\example\v1].
  The [p0] starting at  [:8888]
  WEB Server Started At: [:8888]. Use protocol http
```
可以指定https服务
```linux
$> pub "E:\UISYS-RELEASE\example\v1" https://:80
---------------------------------------------
  The [p0] starting at  [https://:80]
  WEB Server Started At: [:80]. Use protocol https
```
可以全部制定：
```linux
$> pub "E:\UISYS-RELEASE\example\v1" https://10.110.10.34:80
---------------------------------------------
  The [p0] starting at  [https://10.110.10.34:80]
  WEB Server Started At: [10.110.10.34:80]. Use protocol https
```

### 4. <b>ls</b>  
列出当前存在的服务节点。
```linux
$> ls
---------------------------------------------
  0. p1 Running 2019-07-10 23:43:28     D:\UISYS-RELEASE\example\v1       http://0.0.0.0:80/
  1. a2 Stopping        2019-07-10 23:43:43     D:\UISYS-RELEASE\example\v2     http:///
  ----list over----
```
### 5. <b>add</b> 
Add services and don't use command as services name.  
- 命令格式: add \<Service Name> [Project Path] [HTTP Service IP:PORT]

### 6. <b>run</b> 
Start service.  
- 命令格式: run \<Service Name> [IP:PORT], For Example:run test 127.0.0.1:1511
```linux
$> run a0
---------------------------------------------
  The [a2] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
可以指定端口
```linux
$> run a0 :80
---------------------------------------------
  The [a2] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
可以指定IP
```linux
$> run a0 10.110.10.34:80
---------------------------------------------
  The [a2] starting at  [10.110.10.34:80]
  WEB Server Started At: [10.110.10.34:80]. Use protocol http
```
可以指定https服务
```linux
$> run a0 https://:80
---------------------------------------------
  The [a2] starting at  [https://:80]
  WEB Server Started At: [:80]. Use protocol https
```
可以全部制定：
```linux
$> run a0 https://10.110.10.34:80
---------------------------------------------
  The [a2] starting at  [https://10.110.10.34:80]
  WEB Server Started At: [10.110.10.34:80]. Use protocol https
```
### 7. <b>stop</b> 
停止服务 
- 命令格式: stop \<Service Name>
```linux
$> stop a0
---------------------------------------------
  a0 Stop [a0]
  status: [:80]http: Server closed.
  [:80]JUS Server END.
```
### 8. <b>rm</b> 
移除服务
- 命令格式: rm \<Service Name>
```linux
$> rm p1
---------------------------------------------
  [p1] remove success.
  status: [:80]http: Server closed.
  [:80]JUS Server END.
```


### 9. <b>nat</b> 
实现端口穿透功能。

### 10. <b>-c</b>
关闭控制台（Console）的输入功能。

### 11. <b>webc</b> 
启动Web版的服务器命令窗口。该功能默认以https发布。
- 命令格式: webc [HTTP Service IP:PORT]

### 12. <b>bat</b> 
执行批处理命令，可以指定多个批处理文件。
- 命令格式：bat <batch file Name> [batch file Name...]

### 13. <b>stat</b> 
get application status，for example time and so on.


### 14. <b>exit</b> 
Exit.



## 项目参数设置

1. ctp create project dir.
COMMAND: ctp <Project Path>
For Example:ctp C:/jus/project/

2. stp set project dir.
COMMAND: stp <Service Name> <Project Path>
For Example:stp test C:/jus/project/

3. ctf create module file.
COMMAND: ctf [-Create Method(-h|m|s|r)] <Service Name> <Project Path>
For Example:ctf test component.Test
ctf test -hr component.Test

4. release release project.
COMMAND: release <Service Name> [Project Path]
For Example:release test C:/jus/project/


5. send push data to Service by websocket.
COMMAND: send <Service Name> <User ID> <UUID> <Value>

lw display websocket list of Service
COMMAND: lw <Service Name> [-h]

6. info The project infomation
COMMAND: rm <Service Name>

7. set Set project attributes.
COMMAND: set <Service Name> <AttributeName> <Value> [Value...]

10. ret Remove project attributes.
COMMAND: set <Service Name> <AttributeName>
