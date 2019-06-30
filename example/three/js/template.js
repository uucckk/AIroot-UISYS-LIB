
/**
 * 对模版进行处理
 */
function __TEMPLATE_MARK__(data){
	var xml = new XML(data);
	__TEMPLATE_EXE__(xml.child(),[]);
	console.log(xml.toXMLString());
	
	
}

function __TEMPLATE_EXE__(child,lst){//返回模版
	var p = null;
	for(var i = 0;i<child.length();i++){
		p = child.at(i);
		if(p.getName() == "tp-roll"){
			p.node("<tp-inner-01/>");
			lst.push(__TEMPLATE__(p.toXMLString()));
			
		}
	}
}


/**
 * 将数据转换为模块Object{html,copy,attr:Array}
 * @param data:String 字符串数据
 */
function __TEMPLATE__(data){
	var sb = [];
	var attrList = [];//Array 属性MAPList
	var endPos = 0;
	var attrName = "";
	var object = {
			__attrList__:attrList,
			toString:function(){
				var out = "";
				for(var i = 0;i<sb.length;i++){
					out += sb[i];
					out += this[attrList[i]];
				}
				return out + data;
			},
			toHTML:function(){//返回HTML
				return $(toString());
			}
		};
	while(true){
		endPos = data.indexOf("{@");
		if(endPos == -1){
			break;
		}
		endPos += 2;
		sb.push(data.substring(0,endPos - 2)) - 1;//添加到字符串函数里
		data = data.substring(endPos);
		endPos = data.indexOf("}");
		if(endPos == -1){//说明代码写法有问题，提示用户应该重新检查自己的模版代码，默认返回null
			return null;
		}
		attrName = data.substring(0,endPos);
		
		endPos ++;
		data = data.substring(endPos);
		attrList.push(attrName);
		object[attrName] = "{@" + attrName + "}";
	}

	return object;
}


/**
 * 内置控制
 */
 
var __DATA_LIB__ = {};//双向绑定的数据寄存映射
var __TEMPLATE_ID__ = 0;//模版唯一标识
 
//将字符串转化为模版
if (!String.prototype.template) {
    String.prototype.toTemplate = function() {
        return __TEMPLATE__(this);
    };
}

//将数组按照模版转化
if (!Array.prototype.withTemplate) {
    Array.prototype.withTemplate = function(elementID,template,reg) {//元素ID,模版,模版对照
		var myName = this.____;
		if(!myName){//整理数据索引
			this.__template__ = [];
			this.____ = myName = "A" + (__ARRAY__ ++);
			for(var k = 0;k<this.length;k++){
				this[k].____ = __ARRAY_OBJECT__ ++;
			}
			__DATA_LIB__[myName] = this;
			//增加方法
			var Splice = this.splice;
			this.splice = function(index,count){
				for(var k = 2;k<arguments.length;k++){
					arguments[k].____ = __ARRAY_OBJECT__ ++;
				}
				var tls = this.__template__;
				var elem = null;
				for(var p = 0;p<tls.length;p++){
					elem = tls[p];
					var tpl = elem.template;
					var obj = $("#" + myName + elem.index + "_" + this[index].____);
					var data = null;
					var sb = "";
					var key = "";
					if(obj.length>0 && arguments.length>2){
						for(var i = 2;i<arguments.length;i++){
							for(var j = 0;j<attrList.length;j++){
								key = attrList[j];
								data = arguments[i][reg ? reg[key] : key];
								if(data != null){
									tpl[key] = data;
								}else{
									tpl[key] = "{@" + key + "}";
								}
							}
							obj.before("<div id='" + myName + elem.index + "_" + arguments[i].____ + "' __ARRAY__='" + myName + "' __ARRAY_OBJECT__='" + arguments[i].____ + "'>" + tpl.toString() + "</div>\r\n");
						}
					}
					
				}
				var arr = Splice.apply(this,arguments);
				for(var p = 0;p<this.__template__.length;p++){
					for(var n = 0;n<arr.length;n++){
						$("#" + myName + this.__template__[p].index + "_" + arr[n].____).remove();
					}
				}
				
			}
			var Push = this.push;
			this.push = function(value){//override Array.push
				for(var k = 0;k<arguments.length;k++){
					arguments[k].____ = __ARRAY_OBJECT__ ++;
				}
				var tls = this.__template__;
				var elem = null;
				for(var p = 0;p<tls.length;p++){
					elem = tls[p];
					var target = elem.obj;
					var tpl = elem.template;
					if(target.length >0){
						var data = null;
						var key = "";
						for(var i = 0;i<arguments.length;i++){
							for(var j = 0;j<attrList.length;j++){
								key = attrList[j];
								data = arguments[i][reg ? reg[key] : key];
								if(data != null){
									tpl[key] = data;
								}else{
									tpl[key] = "{@" + key + "}";
								}
							}
							target.append("<div id='" + myName + elem.index + "_" + arguments[i].____ + "' __ARRAY__='" + myName + "' __ARRAY_OBJECT__='" + arguments[i].____ + "'>" + tpl.toString() + "</div>\r\n");
						}
						
					}
				}
				
				Push.apply(this,arguments);
			}
			var Unshift = this.unshift;
			this.unshift = function(value){
				for(var k = 0;k<arguments.length;k++){
					arguments[k].____ = __ARRAY_OBJECT__ ++;
				}
				var tls = this.__template__;
				var elem = null;
				for(var p = 0;p<this.__template__.length;p++){
					elem = tls[p];
					var target = elem.obj;
					var tpl = elem.template;
					if(target.length >0){
						var data = null;
						var sb = "";
						var key = "";
						for(var i = 0;i<arguments.length;i++){
							for(var j = 0;j<attrList.length;j++){
								key = attrList[j];
								data = arguments[i][reg ? reg[key] : key];
								if(data != null){
									tpl[key] = data;
								}else{
									tpl[key] = "{@" + key + "}";
								}
							}
							sb += "<div id='" + myName + "_" + arguments[i].____ + "' __ARRAY__='" + myName + "' __ARRAY_OBJECT__='" + arguments[i].____ + "'>" + tpl.toString() + "</div>\r\n";
						}
						
						target.prepend(sb);
					}
				}
				Unshift.apply(this,arguments);
			}
			
			
			var Pop = this.pop;
			this.pop = function(){//override Array.pop
				var obj = Pop.call(this);
				var tls = this.__template__;
				var elem = null;
				for(var p = 0;p<tls.length;p++){
					elem = tls[p];
					$("#" + myName + elem.index + "_" + obj.____).remove();
				}
			}
			var Shift = this.shift;
			this.shift = function(){
				var obj = Shift.call(this);
				var tls = this.__template__;
				var elem = null;
				for(var p = 0;p<tls.length;p++){
					elem = tls[p];
					$("#" + myName + elem.index + "_" + obj.____).remove();
				}
			}
		}
		var sb = "";
		var tpl = null;
		if(typeof(template) == "string"){
			tpl = __TEMPLATE__(template);
		}else{
			tpl = template;
		}
		
		
		__TEMPLATE_ID__ ++;
		this.__template__.push({obj:$(elementID),index:(__TEMPLATE_ID__),template:tpl});//添加模版
		
		var key = null;
		var value = null;
		var attrList = tpl.__attrList__;
		
		for(var i = 0;i<this.length;i++){
			for(var j = 0;j<attrList.length;j++){
				key = attrList[j];
				value = this[i][reg ? reg[key] : key];
				if(value != null){
					tpl[key] = value;
				}
			}
			sb += "<div id='" + myName + __TEMPLATE_ID__ + "_" + this[i].____ + "' __ARRAY__='" + myName + "' __ARRAY_OBJECT__='" + this[i].____ + "'>" + tpl.toString() + "</div>\r\n";
		}
		
		$(elementID).html(sb);
    };
}

/**
 * 绑定数据或者模版
 */
$.fn.with = function(array,template){
	var $this = $(this);
	array.withTemplate($(this),template);
}


