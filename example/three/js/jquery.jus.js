/**
 * 前端模块编译器
 */
$.fn.loadModule = function(module,value,listener,__APPDOMAIN__){
	JUS.loadModule(this,module,value,listener,__APPDOMAIN__);
}
/**
 * 前端模块编译器
 */
$.fn.addModule = function(module,value,listener,__APPDOMAIN__){
	JUS.addModule(this,module,value,listener,__APPDOMAIN__);
}

$.fn.addChild = function(child){
	if(!child){
		return;
	}
	if(child.dom){
		if(this.length != 0){
			$(this).append(child.dom);
		}else{
			child.dom.remove();
		}
	}
	else{
		if(this.length != 0){
			$(this).append(child);
		}else{
			child.remove();
		}
	}
	
};




$.fn.removeChild = function(child){
	if(!child){
		return;
	}
	if(child.dom){
		child.dom.remove();
	}
	else{
		child.remove();
	}
	
};

$.fn.triggerParent = function(){
	var $this = $(this);
	var p = null;
	var i = 0;
	$this = $this.parent();
	if($this.attr("class_id")){
		p = window[$this.attr("id")];
		if(p && p.trigger){
			p.trigger();
		}
	}
};


/**
 * 将数据转化成模块
 */
$.fn.ModuleFromString = window.ModuleFromString = function(mod,value,listener,__APPDOMAIN__){	
	var target = this;
	asjs.load("/index.api",function(e){
		var data = e.target.data;
		var w = __INIT__(__UUID__(),module,data,value,__APPDOMAIN__,target);
		if(listener){	
			listener(w);
		}
		
	},{"do":"module",value:mod});
};



/**
 * JQuery 扩展
 */
$.fn.submit = function(){
	var url = null;
	var edata = null;
	var compEvt = null;
	for(var i = 0;i<arguments.length;i++){
		if(typeof(arguments[i]) == 'string'){
			url = arguments[i];
		}else if(typeof(arguments[i]) == 'object'){
			edata = arguments[i];
		}else if(typeof(arguments[i]) == 'function'){
			compEvt = arguments[i];
		}
	}
	var $this = $(this);
	var data = $this.toJSON();
	$.extend(data,edata);
	var target = $this.attr('target');
	if(target){
		if(!document.getElementById(target)){
			var obj = eval(target);
			if(typeof(obj) == 'function'){
				compEvt = obj;
			}else{
				if(obj.maskFront){
					obj.maskFront(true);
				}
			}
			
		}
	}
	asjs.load(url?url:$this.attr('url'),function(e){
		if(target){
			if(document.getElementById(target)){
				$("#" + target).html(e.target.data);
			}else{
				target = eval(target);
				if(target.standardData){
					target.standardData(new XML(e.target.data));
				}
			}
		}
		$this.trigger("complete",[e]);
		if(compEvt){
			compEvt(e);
		}
	
	},data);
	return data;
}

/**
 * 将指定HTML域下的内容转换成JSON数据
 */
$.fn.toJSON = function(){
	var $this = $(this);
	var data = {};
	var value = null;
	var name = "";
	var count = 0;
	
	
	$("input,select,textarea,[update='true']",$this).each(function(){
		var $self = $(this);
		name = $self.attr('name');
		if(!name){
			if($self.attr('id')){
				name = $self.attr('id');
				name = asjs.getMName(name);
			}else{
				name = "uname" + count ++;
			}
			
		}
		
		
		
		
		if($self.is('input')){
			if($self.attr('type') == 'checkbox' || $self.attr('type') == 'radio'){
				if(!$self[0].checked){
					return true;
				}
			}
			value = $self.val() ? $self.val() : "";
		}else if($self.is('select')){
			value = $self.val() ? $self.val() : "";
		}else if($self.is('textarea')){
			value = $self.val() ? $self.val() : "";
		}else{
			value = $self.text() ? $self.text() : "";
		}
		var pos = data[name];
		if(pos){
			if(pos instanceof Array){
				pos.push(value);	
			}else{
				var t = pos;
				pos = data[name] = new Array();
				pos.push(t);
				pos.push(value);
			}
		}else{
			data[name] = value;
		}
		
	});
	return data;
}

/**
 * 向指定区域添加信息
 */
$.fn.inner = function(main,value){
	value = value.child('data');
	for(var i = 0;i<value.length();i++){
		var attr = value.at(i).child('@');
		var tmp = null;
		for(var p = 0;p<attr.length;p++){
			tmp = $("#" + main + attr[p].name,this);
			if(tmp.length == 0){
				tmp = $("[name='" + main + attr[p].name + "']",this); 
			}
			
			tmp.each(function(){
				var $this = $(this);
				if($this.attr("data_index") && parseInt($this.attr("data_index")) != i){
					return true;
				}
				
				if($this.is("input")){
					$this.val(attr[p].value);
				}else if($this.is("select")){
					$this.val(attr[p].value.toString());
				}else{
					$this.text(attr[p].value);
				}
			});
				
				
			
		}
	}
	
}

$.fn.domain = function(){
	try{
		var $this = $(this);
		return window[$this.find(".domain").eq(0).text().trim()];
	}catch(e){
		return null;
	}
}


$._rightMenuElement = null;
$.fn.contextMenu = function(filter,menuList,listener){
	var $this = $(this);
	$this.bind("mousedown",function(e){
		if(e.which == 3){
			if(filter(e)){
				if($._rightMenuElement){
					$._rightMenuElement.remove();
				}
				$(document).bind("contextmenu",function(e){return false;});
				var menu = $(menuList);
				menu.css("position","absolute");
				menu.css("left",e.pageX);
				menu.css("top",e.pageY);
				$._rightMenuElement = menu;
				$("body").append(menu);
				menu.find("li").click(function(){
					if(listener){
						listener(e,$(this))
					}
				});
				$("body").bind("click",function(e){menu.remove();$(document).unbind("contextmenu");});
				return false;
			}
			
		}
		return true;
	});
	return $this;
	
}
	
	