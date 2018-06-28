;(function(){
    
    //自适应宽高
	var section = document.querySelector('#section');
	var head = document.querySelector('#head');
	function resize(){
		var clientH = document.documentElement.clientHeight;
		section.style.height = clientH - head.offsetHeight+'px';
	}
	window.onresize = resize;
	resize();
    var WARN = 'warn123';
    var OK = "ok"
	
    // 渲染第一层 微云

	var initTree = -1;  // 初始的父级

    var treeMenu = $('.tree-menu');
    treeMenu.html(fn.createTreeHtml(-1,-1))
    fn.addStyleBgById(treeMenu,1)
    // 渲染导航
    var breadNav = $('.bread-nav')

    var initPath = 1;
    breadNav.html(fn.createNavPathHtml(1));
    // 渲染文件区
    var folders = $('.folders');

    var fileInitId = 1;
    folders.html(fn.createFilesHtml(1))
    // 点击导航生成文件和导航
    treeMenu.on('click',"li",function (e){
		var id = $(this).find('div').attr('custom-id');
		// 渲染导航
		fn.addStyleBgById(treeMenu,id)
		breadNav.html(fn.createNavPathHtml(id));
		folders.html(fn.createFilesHtml(id))
		e.stopPropagation();	
    })
    // -------导航路径区域交互--------

	breadNav.on('click','a',function (){
		var id = $(this).attr('custom-id');
		fn.addStyleBgById(breadNav,id)
		breadNav.html(fn.createNavPathHtml(id));
		folders.html(fn.createFilesHtml(id))
			
    })
    // 文件区域的交互
    // 进入
	folders.on('click','.file-item',function (e){
		var target = e.target;
		if($(target).is('i') || $(target).is('input')){
			return;
		}
		// 点击的不是i，进到下一级
		var id = $(this).attr('custom-id')

		fn.addStyleBgById(folders,id);
		breadNav.html(fn.createNavPathHtml(id));
		folders.html(fn.createFilesHtml(id))

		checkedAll.removeClass('checked')
    })
    // 单选
	folders.on('click','.file-item',function (e){
		var target = e.target;
		if($(target).is('i')){
			// 单选
			var bl = $(target).toggleClass('checked').is('.checked');
			if(bl) {
				$(target).parent().addClass('active')
			}else{
				$(target).parent().removeClass('active')
			}

			var checkedI = folders.find('i.checked'); // 选中的i
			if(checkedI.length === checkedSingleAll.length){
				checkedAll.addClass('checked')
			}else{
				checkedAll.removeClass('checked')
			}
		}
	})
    


    // 全选
    var checkedAll = $('.checkedAll');
    var checkedSingleAll =  folders[0].getElementsByTagName('i');
    checkedAll.click(function (){

		// 找到当前文件id下有没有子级
		var currentId = breadNav.find('span').attr('current-id');
		var childs = fn.getChildsById(currentId);
		if(!childs.length){
			return;
		}

		var bl = $(this).toggleClass('checked').is('.checked');
		if(bl){
			// folders.find('i')
			$(checkedSingleAll).each(function(index,item){
				$(item).addClass('checked');
				$(item).parent().addClass('active')
			})
		}else{
			$(checkedSingleAll).each(function(index,item){
				$(item).removeClass('checked')
				$(item).parent().removeClass('active')
			})
		}
    });
    // 框选
    folders.on('mousedown',function (e){

		// 如果事件源不是文件区域的空白地方，不能出现框框
		if(!$(e.target).is('.folders')){
			return;
		}
		
		var newDiv = $('<div class="kuang"></div>');

		var downX = e.clientX,downY = e.clientY;

		newDiv.css({
			width: 10,
			height: 10,
			left: downX,
			top: downY
		})

		newDiv.data('isAppend',false);  // 记录是否放到body中了

		//$(document.body).append(newDiv);

		var moveX,moveY,left,
				top,
				width,
				height,t,l;

		$(document).mousemove(function (e){
			
			// 有范围 10像素之内 是没有div


			if(Math.abs(e.clientX - downX) > 10 || Math.abs(e.clientY - downY) > 10){
				if(!newDiv.data('isAppend')){
					$(document.body).append(newDiv);
					newDiv.data('isAppend',true); // 记录已经插入
				}
			}else{
				return;
			}
			moveX = e.clientX,moveY = e.clientY,
			width = Math.abs(moveX - downX),
			height = Math.abs(moveY - downY);
			left = Math.min(moveX,downX),
			top = Math.min(moveY,downY),
			
			l = folders.offset().left
			t = folders.offset().top

			if(left < l){
				left = l;
				width = width - (l - moveX);
			}
			if(top < t){
				top = t;
				height = height - (t - moveY);
			}

			newDiv.css({
				width: width,
				height: height,
				left: left,
				top: top
			})	
            // 碰撞检测
            var fileItems = folders[0].getElementsByClassName('file-item'); // 找到所有的div文件
			$(fileItems).each(function (index,item){
				if(fn.collision(newDiv[0],item)){
					$(item).addClass('active').find('i').addClass('checked')
				}else{
					$(item).removeClass('active').find('i').removeClass('checked')
				}	
			})

			var checkedI = folders.find('i.checked'); // 选中的i
			if(checkedI.length === checkedSingleAll.length){
				checkedAll.addClass('checked')
			}else{
				checkedAll.removeClass('checked')
			}

		})

		$(document).mouseup(function (){
			newDiv.remove();
			$(document).off('mousemove mouseup')	
		})

		
		e.preventDefault();
	})
    // 删除选中
    $('#tanbox .ok').click(function (){
		var selectedI = folders.find('i.checked');
		var delectIds = [];
		selectedI.each(function (index,item){
			delectIds.push($(item).parent().attr('custom-id'))
		})
		// 拿到要删除的id
		var delectIds = fn.getChildsAllByIds(delectIds).map(function (item){
			return item.id	
		})
		// 批量删除数据
		fn.delectItemByIds(delectIds);
		var currentId = breadNav.find('span').attr('current-id')

		// 重新渲染结构
		treeMenu.html(fn.createTreeHtml(-1,-1)) // 全部渲染
	    folders.html(fn.createFilesHtml(currentId))// 渲染当前下的子级在文件区域中
	    fn.addStyleBgById($('#tanbox'),currentId); // 属性菜单指定id加高亮
	    checkedAll.removeClass('checked');
        $('#tanbox').hide();
        fn.tip(OK,'删除成功')	
    })
    $('#del').click(function (){
		/*
			1. 点击没有选中，提醒（）
			2. 有东西，删除
				删数据 重新 渲染结构 
		*/
		var selectedI = folders.find('i.checked');

		if(selectedI.length > 0){
			// 弹框出现
			$('#tanbox').show();
		}else{
			fn.tip(WARN,'提醒：请选中文件')
		}

    })
    // 重命名
    $('#rename').click(function (){
		var selectedI = folders.find('i.checked');

		if(selectedI.length === 1){
			var span = selectedI.siblings('span');
			var input = selectedI.siblings('input');
			span.hide();
			// 选中文本获取焦点
			input.css({display:'block'}).focus().val(span.text().trim()).select();

			// 正在重命名
			$('#rename').data('isRename',true)

		} else if(selectedI.length > 1){
			console.log('提醒：你不能重命名多个');
			fn.tip(WARN,'提醒：你不能重命名多个')
		}else if(selectedI.length < 1){
			console.log('提醒：请选中要重名的文件');
			fn.tip(WARN,'提醒：请选中要重名的文件')
		}
    })
    $(document).mousedown(function (e){

		// 判断一下是否在重命名
		if(!$('#rename').data('isRename')){
			return;
		}
		if($(e.target).is('input')){
			return;
		}
		var selectedI = folders.find('i.checked');
		var span = selectedI.siblings('span');
		var input = selectedI.siblings('input');
		var value = input.val().trim();
		var id = selectedI.parent().attr('custom-id')

		if(value === ''){
			tip(WARN,'不能为空')
			input.hide();
			span.show();
		}else if(fn.isExistBrothersNameById(id,value)){
			tip(WARN,'提醒：有重名')
			input.hide();
			span.show();
		}else {
			input.hide();
			span.show().text(value);
			var self = fn.getItemById(id);
			self.title = value;
			treeMenu.find('div[custom-id="'+id+'"]').find('span').html('<i></i>'+value);
			fn.tip(OK,'重名成功')
		}
		// 重命名结束关闭状态
		$('#rename').data('isRename',false)

    })
    // 新建
    $('#create').click(function (){

		var html = $(fn.createSingleFileHtml({id:'',title: ''}));
		folders.prepend(html);
		var span = html.find('span')
		var input = html.find('input')

		span.hide();
		input.css('display','block').focus();

		$('#create').data('isCreate',true)
    })
    $(document).mousedown(function (e){
		if($(e.target).is('input')){
			return;
		}
		if($('#create').data('isCreate')){
			var first = folders.find('.file-item:first');
			var span = first.find('span')
			var input = first.find('input');
			var value = input.val().trim();
			var pid = breadNav.find('span').attr('current-id');

			if(value === ''){
                fn.tip(WARN,'文件名不能为空')
				first.remove();
			}else if(fn.isExistChildsNameById(pid,value)){
                fn.tip(WARN,'文件名不能重复')
				first.remove();
			}else{
				var o = {
					id: Date.now(),
					title: value,
					pid: +pid
				}
				data.unshift(o)
				first.attr('custom-id',o.id)
				input.hide();
                span.show().text(value)
                fn.tip(OK,'新建成功')
			}
			$('#create').data('isCreate',false);
			treeMenu.html(fn.createTreeHtml(-1,-1));
			// addStyleBgById(pid)
		}
    })
    // 移动到
    var moveTargetId = 1;  // 移动的目标父级的id
	$('#remove').click(function (){
		var selectedI = folders.find('i.checked')
		if(selectedI.length > 0){
			$('.modal-tree').show();
			$('#mask').show();
			$('.modal-tree .content').html(fn.createTreeHtml(-1,-1))
			fn.addModalStyleBgById(1)
			// 点击移动到按钮
			// 判断当前所在在目录 和 移动的目标父级的id 是否相同
			// 相同 不能移动 不同，可以移动
			if(breadNav.find('span').attr('current-id') == moveTargetId){
				$('.modal-tree .tip').data('isMove',false)
			}else{
				$('.modal-tree .tip').data('isMove',true)
			}
		}else{
			fn.tip(WARN,'请选中要移动的文件')
		}
    })
    // 默认能不能移动
	// 给modal弹框绑定事件
	$('.modal-tree .content').on('click','div',function (){
		var id = $(this).attr('custom-id');  // 选中的目标id
		fn.addModalStyleBgById(id);

		// 选中的目标父级 是 任何一个要移动的文件的 子孙级 自身 父级 都不能移动

		// 拿到所有要移动的文件的 子孙级 自身 父级  如果选中的目标父级在这个集合中，不能移动

		var selectedI = folders.find('i.checked'); 

		// 拿到所有要移动的文件的id
		var ids = [];
		selectedI.each(function (index,item){
			ids.push($(item).parent().attr('custom-id'))	
		})
		// 找到父级数据
		var allData =fn. getChildsAllByIds(ids).concat(fn.getParentById(ids[0])); //[{},{}]

		// 目标父级id在不在allData中 在的话不能移动 不在 可以移动
		var zai = false;  // 不在
		for( var i = 0; i < allData.length; i++ ){
			if(allData[i].id == id){
				console.log('在');
				zai = true;
				break;
			}
		}

		if(zai){
			// 记录不能移动
			$('.modal-tree .tip').data('isMove',false)
			$('.modal-tree .tip').text('在自身子孙父级中，不能移动')
		}else{
			console.log('不在。能移动');
			$('.modal-tree .tip').text('能移动')
			// 记录能移动
			$('.modal-tree .tip').data('isMove',true)
		}

		moveTargetId = id;  // 记录目标父级

    })
    $('.modal-tree .ok').click(function (){

		if(!$('.modal-tree .tip').data('isMove')){
			return;
		}
		// ------------可以移动------------

		/*
				移动的文件 和 目标父级中的文件有重名，不能移动重名的
		*/
		var selectedI = folders.find('i.checked');  	//要移动的文件
		console.log(moveTargetId);  	//要移动的文件
		// 点击ok，是否可以移动
		var chong = false;
		selectedI.each(function (index,item){
			var id = $(item).parent().attr('custom-id');
			var self = fn.getItemById(id);  // 要移动文件的数据
			// 移动的数据的title，在不在目标父级所有子级中
			if(!fn.isExistChildsNameById(moveTargetId,self.title)){
				self.pid = +moveTargetId;
			}else{
				chong = true;
				self.title = self.title+'('+Date.now()+')'
				self.pid = +moveTargetId;
				//
			}
		})
		/*if(chong){
			tip(WARN,'部分移动失败，因为重名了')
		}*/
		console.log(data);
		// 移动后重新渲染
		treeMenu.html(fn.createTreeHtml(-1,-1));
		folders.html(fn.createFilesHtml(breadNav.find('span').attr('current-id')))
		// addStyleBgById(breadNav.find('span').attr('current-id'))
		$('.modal-tree').hide();
		$('#mask').hide();
	})

	$('.modal-tree .cancel').click(function (){
			$('.modal-tree').hide();
            $('#mask').hide();
            
	})
	
})()