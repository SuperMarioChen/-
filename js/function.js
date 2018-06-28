;var fn=(function(){
    // 根据id找到数据中的某一项
	function getItemById(id){
		for( var i = 0; i < data.length; i++ ){
			if(data[i].id == id){
				return data[i]
			}
		}
		return null;	
    }
    // 通过一个id找到所有的子级
	/*
		参数 是一个id
		返回值 数组 没有子级就是空数组
	*/
	function getChildsById(id){
		var arr = [];
		for( var i = 0; i < data.length; i++ ){
			if(data[i].pid == id){
				arr.push(data[i]);
			}
		}	
		return arr;
    }
    // 找到指定id所有的父级
	function getParentAllById(id){
		var arr = [];
		var item = getItemById(id); // 先找到这条数据
		if(item){
			arr.push(item);
			// 递归调用这个元素，函数会返回当前数据的父级
			// 父级和当前的元素拼起来
			arr = arr.concat(getParentAllById(item.pid))
		}
		return arr;	
    }
    // 通过传入的一个id，找到这个id下所有的子级数据，生成一个ul结构
	function createTreeHtml(id,n){
		var childs = getChildsById(id);	
		var treeHtml = '';
		n++;
		// 有数据才生成ul结构
		if(childs.length){
			treeHtml = '<ul>';

			for( var i = 0; i < childs.length; i++ ){
				/*var c = getChildsById(childs[i].id);
				var cls = c.length ? 'tree-ico' : '';*/
				var html = createTreeHtml(childs[i].id,n); // 下一级返回的结构
				var cls = html !== '' ? 'tree-ico' : '';
				treeHtml += '<li>\
						<div custom-id="'+childs[i].id+'" style="padding-left: '+(n*20)+'px;" class="tree-title '+cls+'">\
							<span><i></i>'+childs[i].title+'</span>\
						</div>'

				treeHtml += html

				treeHtml += '</li>';
			}	

			treeHtml += '</ul>'
		}

		return treeHtml;
    }
    // 用来给传入的元素加上样式的
	function addStyleBgById(ev,id){
		ev.find('div').css('background','')
		ev.find('div[custom-id="'+id+'"]').css('background','red')	
	}
    // 传入指定id，找到这个id所有的父级，返回拼好的结构
	function createNavPathHtml(id){
		var parentsAll = getParentAllById(id).reverse();	
		var pathHtml = '';
		if(parentsAll.length){
			// 从0-length -1 （不包含length-1）
			for( var i = 0; i < parentsAll.length - 1; i++ ){
				pathHtml += '<a custom-id="'+parentsAll[i].id+'" href="javascript:;">'+parentsAll[i].title+'</a>'
			}
			// 最后一项
			pathHtml += '<span current-id="'+parentsAll[parentsAll.length-1].id+'">'+ parentsAll[parentsAll.length-1].title +'</span>'
		}
		return pathHtml;
    }
    // 生成一个文件结构
	function createSingleFileHtml(obj){
		return '<div custom-id="'+obj.id+'" class="file-item">\
                <img src="img/folder-b.png" alt="" />\
                <span class="folder-name">'+obj.title+'</span>\
                <input type="text" class="editor"/>\
                <i></i>\
            </div>'	
    }
    function createFilesHtml(id){
		var fileChilds = getChildsById(id);
		var fileHtml = '';
		if(fileChilds.length){  // 有子级
			for( var i = 0; i < fileChilds.length; i++ ){
				fileHtml += createSingleFileHtml(fileChilds[i])
			}
		}
		return fileHtml;	
    }
    // 碰撞检测的工具函数
	function getRect(el){
		return el.getBoundingClientRect();
	}
	function collision(dragEl,hitedEl){
		var dragRect = getRect(dragEl);
		var hitedRect = getRect(hitedEl); 

		if(
			dragRect.right < hitedRect.left || 
			dragRect.bottom < hitedRect.top ||
			dragRect.left > hitedRect.right ||
			dragRect.top > hitedRect.bottom
		){
			return false
		}

		return true
    }
    // 通过一个id，找到所有的子孙数据 不包含自己
	function getChildsAllById(id){
		var self = getItemById(id);
		var arr = [];

		arr.push(self);

		var childs = getChildsById(id);

		if(childs.length){
			for( var i = 0; i < childs.length; i++ ){
				arr = arr.concat(getChildsAllById(childs[i].id))
			}
		}

		return arr;

    }
    // 接收一个数组，找数组id的每一个子孙
	function getChildsAllByIds(idsArr){
		var arr = [];
		for( var i = 0; i < idsArr.length; i++ ){
			arr = arr.concat(getChildsAllById(idsArr[i]))
		}
		return arr;	
    }
    // 根据id删除数据
	function delectItemById(id){
		for( var i = 0; i < data.length; i++ ){
			if(data[i].id == id){
				data.splice(i,1);
				break;
			}		
		}	
	}

	// 批量删除，传入一个数组 [1,2,3,4]
	function delectItemByIds(delectIds){
		for( var i = 0; i < delectIds.length; i++ ){
			delectItemById(delectIds[i])	
		}	
    }
    // 指定id找所有的兄弟
	function getBrothersById(id){
		var self = getItemById(id); // 自己
		var arr = [];
		for( var i = 0; i < data.length; i++ ){
			if(data[i].pid == self.pid){
				arr.push(data[i])
			}		
		}	
		return arr;
    }
    // 给定一个id，和这个id所有的弟兄对比，是否存在某个名字
	function isExistBrothersNameById(id,title){ 
		// 排出自己
		var brothers = getBrothersById(id).filter(function (item){
			return item.id != id;	
		});

		for( var i = 0; i < brothers.length; i++ ){
			if(brothers[i].title == title){
				return true;
			}
		}

		return false; 

    }
    // 提示框
    var fullTipBox = $('.full-tip-box');
	var tipText = fullTipBox.find('.tip-text')
	var timer = null;
	
    // 定义一些不变的量  常量  修改起来方便
	
    function tip(cls,value){
        var WARN = 'warn123';
        var OK = "ok"
		fullTipBox.css('top',-32);
		fullTipBox[0].style.transition = 'none';
		tipText.text(value);
		fullTipBox.removeClass(WARN+' ' + OK).addClass(cls);
		setTimeout(function (){
			fullTipBox.css('top',0);
			fullTipBox[0].style.transition = '.3s';
			
		})	
		clearTimeout(timer)
		timer = setTimeout(function (){
			fullTipBox.css('top',-32);	
		},2000)	
    }
    // 指定一个id，找到这个id中所有的子级中是否包含传入的value,true false
	function isExistChildsNameById(id,value){
		var childs = getChildsById(id);
		for( var i = 0; i < childs.length; i++ ){
			if(childs[i].title === value){
				return true;
			}		
		}

		return false;	
	}
    function addModalStyleBgById(id){
		$('.modal-tree .content').find('div').css('background','')
		$('.modal-tree .content').find('div[custom-id="'+id+'"]').css('background','red')	
    }
    // 找到指定id的父级
	function getParentById(id){
		var self = getItemById(id);
		for( var i = 0; i < data.length; i++ ){
			if(data[i].id == self.pid){
				return data[i]
			}
		}
		return null;
    }
    
    return {
        getItemById: getItemById,
        getChildsById:getChildsById,
        getParentAllById:getParentAllById,
        createTreeHtml:createTreeHtml,
        addStyleBgById:addStyleBgById,
        createNavPathHtml:createNavPathHtml,
        createSingleFileHtml:createSingleFileHtml,
        createFilesHtml:createFilesHtml,
        getRect:getRect,
        collision:collision,
        getChildsAllById:getChildsAllById,
        getChildsAllByIds:getChildsAllByIds,
        delectItemById:delectItemById,
        delectItemByIds:delectItemByIds,
        getBrothersById:getBrothersById,
        isExistBrothersNameById:isExistBrothersNameById,
        tip:tip,
        isExistChildsNameById:isExistChildsNameById,
        addModalStyleBgById:addModalStyleBgById,
        getParentById:getParentById,
    }
})();