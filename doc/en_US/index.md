| [中文](doc/zh_CN/index.md) | [English](doc/en_US/index.md) | [日语](doc/jp_CH/index.md) |
# UI-SYSTEM-LIB
Library for UI-SYSTEM

# 说明
- UI-SYSTEM is a static front end system has the advantages of light and high performance, it can create stable web server quickly. 
- The system used hybrid development, like” Choose the right technology to do what you are good at, do your own business, put the advantage together.”
- UI-SYSTEM design idea is “simple, straightforward”, so that it can let the front-end developer enter the development state directly.
- UI-SYSTEM use the micromodul plan in modularization design, you can understand like the coordination of DNA and amino acids. All the show modules are make a group immediately, and a lot of optimization has been done in rendering, it can provide a rendering taste of the native properties. 
- UI-SYSTEM provides two install ways is command line control service and automatic profile. This system uses the way of hot refresh (don’t need restart, it can update newest.), change service parameter dynamic.
- UI-SYSTEM use Go as a development language, Go can support different clients use the system together, so glad choose Go for development (always use Java before, actually Go is more faster than Java in dealing with the complex business, many people compare JIT has a much higher percentage of hits with Go is incorrect.)

# 如何使用
> WINDOWS  

- <b>方式1</b> 
- **Method 1**  
1.run uisys.exe in windows  
2.add a project to example, like below :
    ```linux
    pub example/v1 :80
    ```
    3.open chrome, enter: http://127.0.0.1/


- **Method 2**  
1. drag your project to uisys.exe icon.  
![conv_ops](../img/dragstart.gif)   
2. Make sure the Console doesn’t have error say interface occupied.
3. open chrome, enter: http://127.0.0.1/
> LINUX 和 CENTOS

> DARWIN

> ARM

# 服务控制命令

### 1. <b>help</b>  
get help information
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
get system version
```linux
$> version
---------------------------------------------
    AIroot UI-SYSTEM 0.9.5beta
```

### 3. <b>pub</b>  
publish designated directory  
Command format : pub <path> [HTTP Service IP:PORT]
```linux
$> pub example/v1
---------------------------------------------
  The [p0] setted in [E:\UISYS-RELEASE\example\v1].
  The [p0] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
Can designated port:
```linux
$> pub example/v1 :8888
---------------------------------------------
  The [p0] setted in [E:\UISYS-RELEASE\example\v1].
  The [p0] starting at  [:8888]
  WEB Server Started At: [:8888]. Use protocol http
```
Can designated absolute path:
```linux
$> pub E:\UISYS-RELEASE\example\v1 :8888
---------------------------------------------
  The [p0] setted in [E:\UISYS-RELEASE-0.9.5BETA\example\v1].
  The [p0] starting at  [:8888]
  WEB Server Started At: [:8888]. Use protocol http
```
You should put the path which has blank space into “ ” 
```linux
$> pub "E:\UISYS RELEASE\example\v1" :8888
---------------------------------------------
  The [p0] setted in [E:\UISYS RELEASE\example\v1\example\v1].
  The [p0] starting at  [:8888]
  WEB Server Started At: [:8888]. Use protocol http
```
Can designated https service
```linux
$> pub "E:\UISYS-RELEASE\example\v1" https://:80
---------------------------------------------
  The [p0] starting at  [https://:80]
  WEB Server Started At: [:80]. Use protocol https
```
Can designated all
```linux
$> pub "E:\UISYS-RELEASE\example\v1" https://10.110.10.34:80
---------------------------------------------
  The [p0] starting at  [https://10.110.10.34:80]
  WEB Server Started At: [10.110.10.34:80]. Use protocol https
```

### 4. <b>ls</b>  
list the currently existing service node.
```linux
$> ls
---------------------------------------------
  0. p1 Running 2019-07-10 23:43:28     D:\UISYS-RELEASE\example\v1       http://0.0.0.0:80/
  1. a2 Stopping        2019-07-10 23:43:43     D:\UISYS-RELEASE\example\v2     http:///
  ----list over----
```
### 5. <b>add</b> 
Add service node to release project.
Notice: service name cannot use “add” as name.
- Command format: add \<Service Name> [Project Path] [HTTP Service IP:PORT]
```linux
$> add a0 example/v1 :80
---------------------------------------------
  The [a0] setted in [E:\UISYS-RELEASE\example\v1].
  The [a0] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
Also can only create service node, doesn’t use in project:
```linux
$> add a0
---------------------------------------------
  The [a0] added successfully.
```
If you need put on project, you can use stp(set project) command to put it in project directory:
```linux
$> a0 stp example/v1
---------------------------------------------
  The [a0] setted in [C:\Users\Administrator\Desktop\UISYS-RELEASE-0.9.5BETA\example\v1].
```
At this moment, we just put on project, if need run project we should use command “**run**”
```linux
$> run a0 :80
---------------------------------------------
  The [a0] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
### 6. <b>run</b> 
Run service node
- Command format: run \<Service Name> [IP:PORT], For Example:run test 127.0.0.1:1511
```linux
$> run a0
---------------------------------------------
  The [a2] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```
Can designated port
```linux
$> run a0 :80
---------------------------------------------
  The [a2] starting at  [:80]
  WEB Server Started At: [:80]. Use protocol http
```

Can designated IP
```linux
$> run a0 10.110.10.34:80
---------------------------------------------
  The [a2] starting at  [10.110.10.34:80]
  WEB Server Started At: [10.110.10.34:80]. Use protocol http
```

Can designated service
```linux
$> run a0 https://:80
---------------------------------------------
  The [a2] starting at  [https://:80]
  WEB Server Started At: [:80]. Use protocol https
```

Can designated all
```linux
$> run a0 https://10.110.10.34:80
---------------------------------------------
  The [a2] starting at  [https://10.110.10.34:80]
  WEB Server Started At: [10.110.10.34:80]. Use protocol https
```
### 7. <b>stop</b> 
Stop the service
- Command Format: stop \<Service Name>
```linux
$> stop a0
---------------------------------------------
  a0 Stop [a0]
  status: [:80]http: Server closed.
  [:80]JUS Server END.
```
### 8. <b>rm</b> 
Remove the service
- Command Format: rm \<Service Name>
```linux
$> rm a0
---------------------------------------------
  [a0] remove success.
  status: [:80]http: Server closed.
  [:80]JUS Server END.
```


### 9. <b>nat</b> 
Implementation penetrate function of port
- Command Format: nat <-add/-remove> <Nat Name> <本机端口> <映射机器IP:端口号>  

For example, we hope put the port 12000 mapping to port 3389 (10.110.10.28). Port 3389 is port of remote desktop in window server, this can show port 12000 to other service. like:
```linux
$> nat -add desktop :12000 10.110.10.28:3389
---------------------------------------------
  The [desktop] starting at  [:12000-->10.110.10.28:3389]
  ----list over----
```

Search and count how many mapping be used on system
```linux
$> nat
---------------------------------------------
  desktop       [:12000-->127.0.0.1:3389]       Running 0
  ----list over----
```
If you want to delete mapping service, you can use command line: 
```linux
$> nat -remove desktop
---------------------------------------------
>> accept tcp [::]:12000: use of closed network connection
desktop Close havs error:  close tcp [::]:12000: use of closed network connection
  ----list over----
```


### 10. <b>-c</b>
Close the input function in Console.
```linux
$> -c
---------------------------------------------
  Console Input Method Unabled.
```
### 11. <b>webc</b> 
Run server command window, this function publishes as https
- Command Format: webc [HTTP Service IP:PORT]
```linux
$> webc
---------------------------------------------
Web Control Server Started At: [:3690]. Use protocol https
```
If you set up server port by yourself, you can use:
```linux
$> webc :10000
---------------------------------------------
Web Control Server Started At: [:10000]. Use protocol https
```
### 12. <b>bat</b> 
Run the command for a piece of files together
- 命令格式：bat <batch file Name> [batch file Name...]  
UI-SYSTEM 可以运行多个WEB服务，因此如果每次服务重启都要手工重新敲击一边太慢了。
我们可以将经常重服务输入的命令写在一个文件或多个文件里。
For example, we write a “config.conf” , like:
```txt
#发布example/v1工程到80端口
pub example/v1 :80
#发布example/v2工程到90端口
pub example/v2 :90
```
然后保存到uisys.exe 可以访问的目录，例如，放到uisys目录下。
Then save to a path that uisys.exe can go through, for example, put file under the uisys directory.   
Then type the command in the Console:

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
Bat run lots of command file, like:
```linux
$> bat config.conf config1.conf "E:/uisys conf/config2.conf"
---------------------------------------------
  ...
```
### 13. <b>stat</b> 
Get the system status, show the system start time and run time.
```linux
$> stat
---------------------------------------------
    Date 2019-07-13 23:27:45
    Now  2019-07-13 23:33:20
```

### 14. <b>exit</b> 
Exit the service.


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




项目参数设置
1.Create a UI interactive project directory, ctp is short for create project.
Notice: when you create a project, the system will help you put it on a temporary node directly.
2.Reset a service node for project directory, stp is short for set project.
3...
4.Release project is original project; other server also can use it.
5.Use websocket service sent data to web client.
6.Look at how many web clients connected websocket service
7.Show the project information
8.Set the attributes of project. 
