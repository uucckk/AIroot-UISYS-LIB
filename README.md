# UI-SYSTEM-LIB
Library for UI-SYSTEM
# 说明
- UI-SYSTEM 是一套轻巧、高性能、静态前端系统，可以快速构建稳健的WEB服务。  
整套系统采用了混合式的开发思想，即“选择合适的技术做擅长的事，各尽其职，优势融合”。  
- UI-SYSTEM 设计思想是 “简单明了，直截了当”，让前端工程师直接进入开发状态。  
- UI-SYSTEM 在模块化设计上，采用微模块方案，你可以把他理解为DNA和氨基酸的配合，一切展现模块都是即时组合，并且在渲染上做了大量优化，能提供原生性能的渲染体验。  
- UI-SYSTEM 提供了命令行控制服务和自动配置文件两种方式部署，服务采用热更新方式，动态切换服务参数。  
- UI-SYSTEM 采用Go作为开发语言，充分利用了Go的高并发能力，很高兴选择了Go作为服务开发（之前一直使用Java，实际上GO在复杂业务上处理速度已经远远高于Java这门语言，网上很多人用JIT命中高例子和Go对比是不正确的。）
# 如何使用
> WINDOWS  

- <b>方式1</b> 
1. window系统运行uisys.exe  
2. 从example里面添加一个工程，写法如下：

  ```linux
  pub example/v1 :80
  ```
其中:80是开启服务的端口好，也可以指定发布地址，如127.0.0.1:80  
3. 打开chrome浏览器，输入：http://127.0.0.1/
- <b>方式2</b>  
1. 也可以直接将您的工程目录拖动到uisys.exe图标上。  
![conv_ops](README/img/dragstart.gif)
2. 确保弹出的控制台没有端口占用错误错误。
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
添加服务节点，用于挂在被发布的工程。  
注意：服务名称不能使用add作为服务的名字。
- 命令格式: add \<Service Name> [Project Path] [HTTP Service IP:PORT]
```linux
$> add a0 example/v1 :80
---------------------------------------------
  The [a0] setted in [E:\UISYS-RELEASE\example\v1].
  The [a0] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
也可以只创建服务节点，但是不挂在项目：
```linux
$> add a0
---------------------------------------------
  The [a0] added successfully.
```
如果需要挂在节点，可以通过 <b>stp</b>（set project）命令挂在项目目录：
```linux
$> a0 stp example/v1
---------------------------------------------
  The [a0] setted in [C:\Users\Administrator\Desktop\UISYS-RELEASE-0.9.5BETA\example\v1].
```
此时，我们只是挂在了项目，如果要运行需要使用 <b>run</b> 命令：
```linux
$> run a0 :80
---------------------------------------------
  The [a0] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
### 6. <b>run</b> 
Start service.  
运行服务节点  
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
$> rm a0
---------------------------------------------
  [a0] remove success.
  status: [:80]http: Server closed.
  [:80]JUS Server END.
```


### 9. <b>nat</b> 
实现端口穿透功能。  
- 命令格式: nat <-add/-remove> <Nat Name> <本机端口> <映射机器IP:端口号>  
例如，我们希望将本机的12000端口映射到10.110.10.28的3389端口。  
3389 端口是window服务器的远程桌面服务端口，这样就可以暴露本机的12000端口来对外提供服务。    
写法如下：
```linux
$> nat -add desktop :12000 10.110.10.28:3389
---------------------------------------------
  The [desktop] starting at  [:12000-->10.110.10.28:3389]
  ----list over----
```

查看本平台用了多少个对外映射可以：
```linux
$> nat
---------------------------------------------
  desktop       [:12000-->127.0.0.1:3389]       Running 0
  ----list over----
```
如果要删除这个映射服务可以用一下命令：
```linux
$> nat -remove desktop
---------------------------------------------
>> accept tcp [::]:12000: use of closed network connection
desktop Close havs error:  close tcp [::]:12000: use of closed network connection
  ----list over----
```


### 10. <b>-c</b>
关闭控制台（Console）的输入功能。
```linux
$> -c
---------------------------------------------
  Console Input Method Unabled.
```
### 11. <b>webc</b> 
启动Web版的服务器命令窗口。该功能默认以https发布。
- 命令格式: webc [HTTP Service IP:PORT]
```linux
$> webc
---------------------------------------------
Web Control Server Started At: [:3690]. Use protocol https
```
如果自己设定服务端口，可以用：
```linux
$> webc :10000
---------------------------------------------
Web Control Server Started At: [:10000]. Use protocol https
```
### 12. <b>bat</b> 
执行批处理命令，可以指定多个批处理文件。
- 命令格式：bat <batch file Name> [batch file Name...]  
UI-SYSTEM 可以运行多个WEB服务，因此如果每次服务重启都要手工重新敲击一边太慢了。
我们可以将经常重服务输入的命令写在一个文件或多个文件里。

例如，我们编写一个“config.conf”，如下：
```txt
#发布example/v1工程到80端口
pub example/v1 :80
#发布example/v2工程到90端口
pub example/v2 :90
```
然后保存到uisys.exe 可以访问的目录，例如，放到uisys目录下。
然后再uisys控制台输入命令：
```linux
$> bat config.conf
---------------------------------------------
#发布example/v1工程到80端口
  The [p0] setted in [C:\UISYS-RELEASE\example\v1].
  The [p0] starting at  [:80]
#发布example/v2工程到90端口
  WEB Server Started At: [:80]. Use protocol http
  The [p1] setted in [C:\UISYS-RELEASE\example\v2].
  The [p1] starting at  [:90]
  WEB Server Started At: [:90]. Use protocol http
```
bat 多个执行多个命令文件，如下：
```linux
$> bat config.conf config1.conf "E:/uisys conf/config2.conf"
---------------------------------------------
  ...
```
### 13. <b>stat</b> 
get application status，for example time and so on.
获取平台的运行状态，用以显示当前平台的起始时间和运行时间。
```linux
$> stat
---------------------------------------------
    Date 2019-07-13 23:27:45
    Now  2019-07-13 23:33:20
```

### 14. <b>exit</b> 
Exit.
退出服务



## 项目参数设置
### 1. <b>ctp</b> 
create project dir.
创建一个UI交互工程目录，ctp 是 <b style='color:#aa0000'>c</b>rea<b style='color:#aa0000'>t</b>e <b style='color:#aa0000'>p</b>roject 的缩写。 
COMMAND: ctp \<Project Path>
命令格式：ctp \<项目路径>  
说明：被创建的工程平台会直接帮您挂在到一个临时服务节点上。
```linux
$> ctp D:\uisys\project01
---------------------------------------------
  create project [D:\uisys\project01].

  The [a0] added successfully.
  The [a0] setted in [D:\uisys\project01].
  The project mount at[a0] server.
```

### 2. <b>stp</b> 
set project dir.  
重新设置一个服务节点的工程目录,stp 是 <b style='color:#aa0000'>s</b>e<b style='color:#aa0000'>t</b> <b style='color:#aa0000'>p</b>roject 的缩写。   
COMMAND: stp \<Service Name> <Project Path>
例如，如果平台已有一个服务节点a0，可以重新让其指向"D:\uisys\project01"的路径。  
```linux
$> stp a0 D:\uisys\project01
---------------------------------------------
  The [a0] setted in [D:\uisys\project01].
```

### 3. <b>ctf</b>
create module file.  
COMMAND: ctf [-Create Method(-h|m|s|r)] \<Service Name> <Project Path>
For Example:ctf test component.Test
ctf test -hr component.Test

### 4. <b>release</b>  
release project.
发布工程为原生工程，以便其他服务器可以使用。  
COMMAND: release \<Service Name> [Project Path]  
```linux
$> release a0 D:\uisys\project-release\
---------------------------------------------
  ----Release Complete----
```
### 5. <b>send</b> 
push data to Service by websocket.  
通过UI-System自建的websocket数据服务，推送数据到WEB客户端。  
COMMAND: send \<Service Name> \<User ID> \<UUID> \<Value>

### 6. <b>lw</b> 
display websocket list of Service  
查看服务节点提供的websocket服务被多少个WEB客户端连接。  
COMMAND: lw \<Service Name> [-h]

### 7. <b>info</b> 
The project infomation  
显示项目信息  
COMMAND: rm \<Service Name>

### 8. <b>set</b> 
Set project attributes.  
设置WEB工程的属性  
COMMAND: set \<Service Name> \<AttributeName> \<Value> [Value...]

### 9. <b>ret</b> 
Remove project attributes.  
COMMAND: ret \<Service Name> \<AttributeName>
