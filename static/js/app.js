class app{
    constructor() {
        this.url = "http://127.0.0.1"
        this.token = ""
    }
    init() {
        this.open()
        const randomID = () => Math.random().toString(36).substring(2);
        let timer = null,
        isMove = false,
        initY = 0,
        moveDelta = 0,
        target = null,
        th = this,
        cart = null,
        CartEdsc = null
        $(document).on("click", ".user_state", e=> { // 显示用户状态
            $(".portrait-box").show()
            return false
        }).on("click", ".portrait-box .item", e => { // 选择用户状态
            let t = e.currentTarget
            console.log( $(t).index() )
            $(t).parent().hide()
        }).on("mouseenter", ".portrait", e => { // 显示用户小卡片
            $(".info_cart").show();
        }).on("mouseenter", ".info_cart", e => {
            if( cart) clearTimeout( cart )
        }).on("mouseenter", ".cart_portrait", e => { // 移入头像
            let t = e.currentTarget
            if( $(".file_but").length == 0) {
                $(t).append(`<label class="file_but"><span class="info_img"><i class="ri-camera-line"></i></span><input type="file" accept="image/*" id="UserPic"></label>`)
            }
        }).on("mouseleave", ".cart_portrait", e => { // 移出头像
                $(".file_but").remove()
        }).on("change", "#UserPic", e => {  //上传头像
            let t = e.currentTarget,
            file = $(t)[0].files[0]
            if( file ) {
                if( file.size > 1024 * 100 ) {
                    this.tip( "图片不能大于100KB…", false)
                    return
                }
                if( ! /^image\//.test(file.type) ) {
                    this.tip( "文件非图片格式…", false)
                    return
                }
                let img = new Image()
                img.src = URL.createObjectURL( file )
                img.onload = () => {
                    if( img.width > 250 || img.height > 250 ) {
                        this.tip( "图片尺寸不能大于250*250", false)
                        return    
                    }
                    let formData = new FormData();
                    formData.append("file", file)
                    this.axios( "/upload/portrait", formData, false ).then( e => {
                        if( e.code == 200) {
                            localStorage.setItem("token", e.token)
                            $(".portrait img, .cart_portrait img").attr("src",`${this.url + e.path}`)
                            this.tip( e.msg )
                            return false
                        }
                    })
                }
                
            } else {
                this.tip("没有选中头像…", false)
            }
        }).on("focus", ".cart_heard .desc, .cart_heard h3.nickname", e => { // 用户个人信息编辑
            let t = e.currentTarget
            CartEdsc = $(t).text()
        }).on("blur", ".cart_heard .desc, .cart_heard h3.nickname", e => { // 编辑完成个人信息，提交后台
            let t = e.currentTarget,
            ed = $(t).text()
            if( CartEdsc != ed ) {
                let n = $(t).attr("class")
                $.ajax({
                    type:"POST",
                    url : this.url + "/cartdesc", 
                    data:{ "data":{ [n]: ed}},
                    headers: {"Authorization": this.token}
                } ).then( e => {
                    if( e.code == 200) {
                        let token = e.token
                        localStorage.setItem("token", token)
                        this.tip( e.msg )
                    }
                }).fail( e => {
                    let res = $.parseJSON( e.responseText)
                    if( res.code == -1) {
                        this.tip( res.msg, false)
                        return
                    }
                })
            }            
        }).on("keydown", ".cart_heard h3.nickname", e => { // 禁止回车健
            if(  e.keyCode == 13) e.preventDefault();
        }).on("mouseleave", ".portrait, .info_cart", e => { // 移出小卡片
            cart = setTimeout( () =>{
                $(".info_cart").hide()
            }, 500)
        }).on("click", ".f_head span", e => {  // 消息、好友、群、搜索 选择卡
            let t = e.currentTarget
            $(t).parent().find("span").removeClass("action")
            $(t).addClass("action")
            $(".friend_ui").css({"left": - $(t).index() * 200})
            // 
        }).on("click", ".editor_box", e => {    // 选中编辑区，进入编辑状态
            $(".prompt").css("display", "none")
            $(".editor_con").focus()
            return
        }).on("blur", ".editor_box", e => { // 编辑区失去光标
            if( $.trim( $(".editor_con").html() ) == "" ) {
                $(".prompt").show()
            }
            return false
        }).on("click", ".emotion", () => {  // 打开表情包
            if( !$(".face_box").length ) {
                let t = `<div class="face_box">`
                for( let i = 0; i <= 71; i++) {
                    t+=`<div class="face_item"><img src="../static/img/face/${i}.gif"></div>`
                }
                t += `</div>`
                $(".win").append( t )
            } else {
                $(".face_box").show()
            }
            return false
        }).on("click", ".face_box div", e => { // 选中表情包
            let t = e.currentTarget
            $(".prompt").hide()
            $(".editor_con").append( `<img src="../static/img/face/${$(t ).index() }.gif">`).focus()
            let range = window.getSelection()
            range.selectAllChildren( $(".editor_con")[0] )
            range.collapseToEnd();
            // return false
        }).on("click", ".send_box", e => {      // 发送消息
            let t = $.trim($(".editor_con").html()).replace(/<div><br><\/div>/gi, "")
            if( t == "" || t == null || t == undefined ) { // 消息为空
                this.tip("发送消息不能为空…", false)
                return false
            }
            this.NewChat( t)
            $(".editor_con").html("")
        }).on("click", ".chat_history", e => { // 查看聊天记录
            try {
                window.electronAPI.openHist("chat_hist")
            } catch {

            }
            // 从左到右
            if( $("div").is(".ChatHist")) {
                $(".win").removeClass("is_hist")
                $(".ChatHist").remove()
                try{
                    window.electronAPI.CloseHist("close_hist")
                } catch{}                
                return
            }
            $(".win").addClass("is_hist")
            $.get("hist.html", e => {
                $(".main_box").append(e)
            }).then( e =>{
                this.YScroller( $(".chat_hist_cent") )
            })
        }).on("click", ".close_ico", () => {   // 关闭聊天记录
            $(".win").removeClass("is_hist")
            $(".ChatHist").remove()
            try{
                window.electronAPI.CloseHist("close_hist")
            } catch {

            }
        }).on("keydown", ".editor_con", e => {  // 回车事件
            if(  e.ctrlKey  && e.which == 13) {
                $(".editor_con").append("<div><br></div>")
                let range = window.getSelection()
                range.selectAllChildren( $(".editor_con")[0] )
                range.collapseToEnd();
                return false
            } else if( e.keyCode == 13) {
                $(".send_box").trigger("click")
                return false
            }
        }).on("mousedown", ".slider_bar", e => {    // 按下滚动条
            let t = e.currentTarget
            $(t).parent().addClass("is_over")
            isMove = true
            initY = e.pageY - $(t).position().top
            target = t
        }).on("mousemove", e => {   // 移动鼠标
            let t = e.currentTarget
            if( isMove )  e.preventDefault();
            // 节流 感觉没什么卵用
            if( timer) clearTimeout( timer)
            timer = setTimeout( () => {
                if( isMove) {
                    moveDelta = e.pageY - initY
                    // 向上
                    if( moveDelta <= 0  ) {
                        $(target).css( "top",  0 )
                        $(target).closest(".y_scroll").find(".y_s_content").css("top", 0)
                        return false
                   }
                   if( moveDelta >=  $(target).parent().height() - $(target).height() ) {
                    // 向下
                    $(target).css( "top",  $(target).parent().height() -$(target).height()  )
                    $(target).closest(".y_scroll").find(".y_s_content").css("top",  $(target).closest(".y_scroll").height() - $(target).closest(".y_scroll").find(".y_s_content").height() )
                        return false
                   }
                   $(target).css( "top",  moveDelta )
                   $(target).closest(".y_scroll").find(".y_s_content").css({"top": - moveDelta /  $(target).parent().height() * $(target).closest(".y_scroll").find(".y_s_content").height() })
                }
            },20)
            return
        }).on("mouseup", e => {   // 松开鼠标时
            $(".ascrail").removeClass("is_over");
            isMove = false;
            target = null
        }).on("wheel", ".y_scroll", ( e ) => { // 滚轮事件
            let t = e.currentTarget,
            b_h = $(t).height(),
            c_h = $(t).find(".y_s_content").height(),
            h = 15
            if( !$(t).find(" div").is(".ascrail")) {
                return false
            }
            let d = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
            (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox

            if (d > 0) {
                let top = $(t).find(".y_s_content").position().top
                if( - top + h  / (c_h - b_h)  <= h) {
                    $(t).find(".slider_bar").css("top",  0)
                    return false
                }
                $(t).find(".slider_bar").css("top",  ( $(".ascrail").height() - $(".slider_bar").height()) * ( - (top + h)  / (c_h - b_h)))
                $(t).find(".y_s_content").css({"top": top + h})

            } else if (d < 0) {
                // 向下滚
                let top = $(t).find(".y_s_content").position().top
                if( top <= -( c_h - b_h)) {
                    return false
                }
                $(t).find(".slider_bar").css("top",  ( $(".ascrail").height() - $(".slider_bar").height()) * ( - (top - h)  / (c_h - b_h)))
                $(t).find(".y_s_content").css("top", top - h)
            }
        }).on("click", ".group_itme", e => { // 展开好友组
            let t = e.currentTarget
            if($(t).is(".is_open")) {
                $(t).removeClass("is_open")
                return 
            }
            $(t).addClass("is_open")
        }).on("click", ".friend_li", () => {    // 点击好友，阻止冒泡

            return false
        }).on("click", ".chat_list .item", e => {  // 切换消息界面
            let t = e.currentTarget
            $(t).parent().find(".item").removeClass("action")
            $(t).addClass("action")

        }).on("contextmenu", ".group_header", e => { // 我的朋友 右击
            e.preventDefault();
           let y = e.pageY
            if( e.pageY + 100 > $(".win").height() ) {
                y = $(".win").height() - 120
            }
            let m = `<div class="menu" style="left:${e.pageX}px;top:${y}px">
                <span>添加分组</span>
                <span>重命名</span>
                <span>删除分组</span>
            </div>`
            if( $("body div").is(".menu")) {
                $(".menu").remove()
            }
            $("body").append( m )
            return false
        }).on("contextmenu", ".friend_li .item", e => { // 好友列表右键菜单
            e.preventDefault();
            let y = e.pageY
            if( e.pageY + 100 > $(".win").height() ) {
                y = $(".win").height() - 120
            }
            let m = `<div class="menu" style="left:${e.pageX}px;top:${y}px">
                <span>发送消息</span>
                <span>查看资料</span>
                <span>修改备注</span>
                <span>移动分组</span>
                <span>删除好友</span>
            </div>`
            if( $("body div").is(".menu")) {
                $(".menu").remove()
            }
            $("body").append( m )
            return false
        }).on("paste", ".editor_con", function(e) {    // 粘贴图片生成缩放图片
            let items = (window.clipboardData || e.originalEvent.clipboardData).files[0]
            if( items != undefined ) {
                let itemtype = items.type
                if( /^image\//.test(itemtype)) {
                    e.preventDefault();
                    th.GTImages( items )
                }
            }
        }).on("mouseover", "img.gti", e => {    // 缩放图片，鼠标移入，显示缩放比例
            let t = e.currentTarget
            if(!$(t).parent().is(".zoom")) {
                $(t).wrap(`<div class="zoom"></div>`);
            }
            return false
        }).on("dragleave", ".editor_box" ,function(e) { // 禁止拖拽中打开文件
            $(".prompt").hide()
            e.preventDefault();
        }).on("dragleave drop", ".editor_con", function(e) {    // 拖拽入会话
            if( e.type == "drop") {
                let files = e.originalEvent.dataTransfer.files
                if( files != undefined) {
                    if(/^image\//.test(files[0].type )) {
                        e.preventDefault();
                        th.GTImages( files[0])
                    }
                }
            }
        }).on("click", ".screen", () => {   // 截图功能
            window.electronAPI.screenApp("screen")
        }).on("click", ".zoom", e => {    // 打开子窗口，放大图片
            let t = e.currentTarget,
                img_src = $(t).find(".gti").attr("src"),
                ow = $(t).find(".gti").attr("ow"),
                oh = $(t).find(".gti").attr("oh")
            window.electronAPI.childApp("child_app", {"ow": Number( ow), "oh":Number(oh ) + 35, "src": img_src, "name": new Date()})
        }).on("click", ".minimize",  () => {    // 最小化窗口
            window.electronAPI.minApp("win_min")
        }).on("click", ".minimax", () => {
            window.electronAPI.maxApp("win_max")
        }).on("click", ".close" , () => {   // 关闭窗口
            window.electronAPI.closeApp("win_login")
        }).on("click", () => {  // 冒泡
            // 
            if( $(".face_box").is(":visible")) {
             $(".face_box").hide()
            }
            if( $("body div").is(".menu")) {
                $(".menu").remove()
            }
            $(".portrait-box").hide()
        })
        try{ 
            window.electronAPI.onbule( (_event,v ) => { // 窗口失去焦点
                if( v == 1) {
                    if( $("body div").is(".menu")) {
                        $(".menu").remove()
                    }
                    if( $(".face_box").is(":visible")) {
                        $(".face_box").hide()
                    }
                }
            })
            window.electronAPI.onscreen(  (e, v) => {   // 如果成功，则粘贴到富文本
                if( v ) {
                    let f = th.tofile( v.dataurl, randomID())
                    th.GTImages( f )
                    return
                }
            })
        } catch { }
    }
    // 新消息，插入聊天窗口
    async NewChat( date) {
        let parsed = $.parseHTML( date),
        t = this,
        datestring = ""
        $(parsed).each( function( i) {
            if( !$(this).is("div")) {
                datestring += date
                console.log( datestring )
                return
            } else if( $(this).find("img").is(".gti")) {
                let git = $(this).find("img.gti"),
                    ow = $(this).find("img.gti").attr("ow"),
                    oh = git.attr("oh"),
                    obj = t.ScaleImage( 356, 300, ow, oh)
                if( obj == null) {
                    $(git, $(parsed)).removeAttr("style")
                    $(git, $(parsed)).removeClass("gti");
                } else {
                    $(git, $(parsed)).attr("style", `width:${obj.nw}px;height:${obj.nh}px`)
                }
                datestring += $(this).html()
           } else {
                datestring += $(parsed)[i].outerHTML 
           }
        })
        let d = $("<div>").text( datestring ).html(),
        // 插入本地对话框
        h = `<div class="new_chat_item is_yours">
            <div class="list_user_img">
                <img src="../static/img/0143d06096496c11013e3b7d68df00.webp" alt="">
            </div>
            <div class="list_user_info">
                <span class="user_new_chat">${$("<div>").html( d).text()}</span>
            </div>
        </div>`
        $(".new_chat_con").append(  h)
        this.YScroller( $(".mb_r"))
    }
    // 滚动条
    YScroller( e) {
        let c = e.find(".y_scroll").height(),
        s = e.find(".y_s_content").height()
        if( s > c ) {
            if( !e.find(".y_scroll div").is(".ascrail")) {
                e.find(".y_scroll").append(`<div class="ascrail"><div class="slider_bar"></div></div>`)
            }
            // 滚动条长度
            let s_b_h = c * c / s
            e.find(".slider_bar").height( s_b_h)
            // 移动比例
            let ratio =  (s - c) / (c - s_b_h)
            // 新消息底部
            // e.find(".y_s_content").animate({"top":  c - s} ,100)
            e.find(".y_s_content").css({"top":  c - s} )
            e.find(".slider_bar").css("top", ( s_b_h * ratio) - s_b_h)
        }
    }
    // 模态弹出窗口
    tip = ( n , b = true) => {  
        let html =""
        if( b == false) {
            html = `<i class="ri-close-circle-fill error"></i>`
        } else {
            html =`<i class="ri-checkbox-circle-fill success"></i>`
        }
        let not = document.createElement("div"),
        t = 80;
        not.className = "notice-box"
        not.innerHTML =html +=  n;
        t += 45 * $("div.notice-box").length
        let i = ($(".win").append( not ), $("div.notice-box:last"))
        i.addClass("is_show")
        setTimeout( () => {
            not.remove();
        }, 1500)
    }
    // 按比例缩放图片
    ScaleImage = ( w = 350, h = 180 ,ow, oh ) => {
        let scale = Math.min( w / ow, h / oh),
            nw = ow * scale,
            nh = oh * scale
            if( nw > ow && nh > oh) {
                return null
            } else {
                if( nw > w ) {
                    let ratio = w / ( ow * scale)
                    nw  *= ratio
                    nh *= ratio
                }
    
                if( nh > h) {
                    let ratio = h / ( oh * scale)
                        nw *= ratio
                        nh *= ratio
                }
                return {nw, nh}
            }
    }
    // 生成缩略图
    GTImages( f) {
        $(".prompt").hide()
        let img = new Image(),
        th = this
        img.onload = function( e) {
                let obj = th.ScaleImage( 150, 180, img.width, img.height),
                    File = new FileReader(),
                    res = ""
                File.readAsDataURL(f);
                File.onload = function(e){
                    res = e.target.result
                    if( obj == null ) {
                        $(".editor_con").append(`<img src="${res}">`)
                    } else {
                        $(".editor_con").append(`<img class="gti" src="${res}" style="width:${obj.nw}px;height:${obj.nh}px" ow="${img.width}" oh="${img.height}">`)
                    }
                }
                let range = window.getSelection()
                range.selectAllChildren( $(".editor_con")[0] )
                range.collapseToEnd();
        }
        img.src = URL.createObjectURL( f)
    }
    // base64 转图片文件
    tofile ( base, fileName = "myimg") {
        let data = base.split(","),
            type =  data[0].match(/:(.*?);/)[1],
            suffix = type.split('/')[1],
            bstr = window.atob(data[1]),
            n = bstr.length,
            u8arr = new Uint8Array( n)
        while( n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        const file = new File([u8arr], `${fileName}.${suffix}`, { type: type})
        return file
    }
    open() {  // 打开首页
        let token = localStorage.getItem("token")
        if( token == null) {
            // 没有token,跳到登录页
            try {
                window.electronAPI.closeApp("win_login")
                return
            } catch {
                return
            }
        }
        let tokenstring = token.split(".")
        let info = $.parseJSON( decodeURIComponent(  escape(  window.atob(tokenstring[1].replace(/-/g,"+").replace(/_/g,"/")) )  ) );
        if( info.exp < parseInt(Date.now() / 1000) ) {  // 时间戳过期了
            localStorage.removeItem("token")
            window.electronAPI.closeApp("win_login")
            return
        }
        this.token = token
        if( info.portrait == "") {
            info.portrait = "../static/img/yaoyao20231212.png"
        } else {
            info.portrait = this.url + info.portrait
        }
        console.log( info )
        if( info.desc == "") info.desc = "该用户还没有签名…"
        var sex = ["保密", "男", "女"]
        $(".portrait img, .cart_portrait img").attr("src",`${info.portrait}`)
        $(".cart_heard h3").text(info.nickname  )
        $(".desc").text( info.desc )
        $(".cart_bottom .item:nth-child(1) span").text( sex[info.sex ])
        $(".cart_bottom .item:nth-child(2) span" ).text(info.city )
        let str = this.get_time_diff( info.reg_time)
        $(".cart_bottom .item:nth-child(3) span").text( str )

        // 请求最新消息

        $.post( this.url + "/newchat", e => {
            console.log( e )
        })
    }
    // 距今 Y-M-D h:m
    get_time_diff = (t ) => {
        let diff = parseInt(new Date().getTime() / 1000) - t,
        str = "",
        s = 60, // 秒
        m = s * 60, // 分
        h = m * 24, // 时
        w = h * 7, // 星期
        D = h * 30, // 月
        M = h * 365,
        Y = new Date(t * 1000 ).getFullYear()
        switch( true) {
            case diff > M:
                str = `${new Date().getFullYear() - Y }年`
                break;
            case ( D < diff && diff < M): 
                str = `${Math.floor( diff/ (D))}月`;
                break;
            case (w < diff && diff < D ):
                str = `${Math.floor( diff/ (w))}周`;
                break
            case (h < diff && diff < w):
                str = `${Math.floor( diff/ (h))}天`;
                break;
            case (m < diff && diff < h):
                str = Math.floor( diff / (60 * 60)) + "小时";
                break;
            case (s < diff && diff < m):
                str = `${Math.floor(diff / 60)}分钟`;
                break;
            case diff < s:
                str = "刚刚";
                break;
            default:
                str = ""
                break;
        }
        return str
    }
    axios(u, data, b = "true", type = "POST") {
        return $.ajax({
            type: type,
            url: this.url + u,
            dataType: "json",
            data: data,
            processData: b,
            contentType: b,
            headers: {"Authorization": this.token}
        }).fail( e => {
            if( e.status == 404 || e.status == 500 ) {
                let data = $.parseJSON( e.responseText)
                this.tip( data.msg , false)
                return false
            }
            this.tip( "网络连接失败…", false)
        })
    }
}
let a = new app()
a.init()