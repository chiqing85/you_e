class login {
    constructor() {
        this.url = "http://127.0.0.1",
        this.mouseX = 0,
        this.isDraggable = false
        this.time = null
        this.moveX = null
        this.movey = []
        this.uuid = null
        this.fn = null
    }
    init(){
        let token = localStorage.getItem("token")
        if( token == null) {
            // 没有token
            $(".quick").hide()
            $(".login_wrap").show()
        } else {
            let tokenstring = token.split("."),
            info = $.parseJSON( decodeURIComponent(  escape(  window.atob(tokenstring[1].replace(/-/g,"+").replace(/_/g,"/")) )  ) );
            if( info.exp < parseInt(Date.now() / 1000) ) {  // 时间戳过期了
                $(".quick").hide()
                $(".login_wrap").show()
            } else {
                if( info.portrait == "") {
                    info.portrait = "../static/img/yaoyao20231212.png"
                } else {
                    info.portrait = this.url + info.portrait
                }
                let nick = info.nickname 
                if( nick.length >= 3) {
                    nick = nick.substr(0, 1) + "***" + nick.substr(nick.length - 1, nick.length )
                }
                $(".nick>h5").text( nick )
                $(".quick_info_img").attr("src",`${info.portrait}` )
            }
        }
        $(".close").on("click", ( ) => {
            window.electronAPI.closeApp("win_close")
        })
        $(".minimize").on("click", () => {
            window.electronAPI.minApp("win_min")
        })
        $("input").on("focus", e => {
            let t = e.currentTarget
            $(t).parent().addClass("is_focus")
        }).on("blur", e => {
            let t = e.currentTarget
            $(t).parent().removeClass("is_focus")
        })
        $(document).on("click", ".pas_login", e => {   // 切换登录方式
            let t = e.currentTarget
            $(".login_wrap").show()
            $(t).parents(".quick").prepend(`<div class="quick_bg"></div>`)
            $(t).parents(".quick").addClass("is_close")
            setTimeout(( ) => {
                $(".quick_bg").remove()
            }, 380)
        }).on("click", ".quick-btn", e => { // 一键登录
            window.electronAPI.newApp("win_new")
        }).on("click", ".sub-int", e => {
            this.isform()
        }).on("click", ".reg_log", e => { // 登录 <=> 注册
            if( $(".main").is(".action")) {
                // 跳转到登录页
                $(".main").removeClass("action")
            } else {
                // 跳转到注册页
                $(".main").addClass("action")
            }
        }).on("keydown","input", e => { // 回车
            if( e.keyCode == 13) {
                // 如果值为空，将不会跳过输入框
                let t = e.currentTarget
                if(  $(t).val() ) {
                    this.isform( )
                } else {
                    this.tip( $(t).attr("dada_cont"), false)
                }
            }
        }).on("click", ".send_mail_ico:not(.is_start)", e => { // 点击发送验证码
            let MailReg =/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                PhoneReg = /^1[3456789]\d{9}$/,
                i = $(".regi input").eq(0)
            if(i.val() == "" ) {
                this.tip( i.attr("dada_cont"), false )
                i.focus()
                return false
            }
            if(  i.is(".phone") && !PhoneReg.test( i.val() )) {
                this.tip( "手机号是无效的…", false)
                i.focus()
                return false
            }
            if( i.is(".user_mail") && !i.val().match( MailReg )) {
                this.tip("邮箱地址无效…", false)
                i.focus()
                return false
            }
            this.fn = null
            this.fn = "SendMail"
            this.captcha()
        }).on("click", ".step-btn", e => {

            let nick = $(".user_name").val()
            if( nick.length > 0) {
                $(".step").removeClass("is_show")
                .next(".step").addClass("is_show")
                $(".act span").text("性别选择")
                $(e.currentTarget).find("a").text("完成")

                console.log( nick)
            } else {
                this.tip("请填写用户昵称…", false)
                $(".user_name").focus()
            }
        }).on("mousedown", ".captcha_handler", e => {   // 拖动验证
            // e.preventDefault();
            let t = e.currentTarget
            this.isDraggable = true;
            this.startX = e.pageX - $(t).offset().left;
            this.time = Date.now()
            this.movey = []
            $(document).on('mousemove', (e) =>  {
                if( this.isDraggable ) {
                     this.moveX = e.pageX - $(".qing_control").offset().left - this.startX;
                    if( this.moveX >= 0  && this.moveX <= $(".qing_control").width() - $(".captcha_handler").width()) {
                        $(".captcha_handler, .verify-sub-block").css("left", this.moveX)
                        $(".progress_bar").css("width", this.moveX + 'px')
                        if( !this.movey.includes( e.pageY )) this.movey.push( e.pageY)
                        if(  e.pageY < $(".qing_control").offset().top || e.pageY >  $(".qing_control").offset().top + $(".captcha_handler").height() ) {
                            this.isDraggable = false;
                            $(document).off('mousemove');
                            this.check()
                        }
                    }
                }
            })
        }).on("mouseup", ".captcha_handler", e => {
            this.isDraggable = false;
            $(document).off('mousemove');
            this.check()
        }).on("click", ".qing_top__right", () => {  // 刷新验证图片
            $(".qing_bgimg").append(`<div class='captcha_loadding loadding'><div class='loadbox__inner'><div class='loadbox-ico'><i class="ri-loader-4-line"></i></div><div class='load_text'>加载中…</div></div></div>`)
            $(".captcha_handler, .verify-sub-block").css("left", 0)
            $(".progress_bar").css("width", 0 + 'px')
            $.post(this.url + "/captcha").then( e => {
                this.uuid = null
                this.uuid = e.uuid
                let bg = e.baseImage,
                    cropped = e.croppedImg
                $(".qing_bg").attr("src", `data:image/png;base64,${bg}`)
                $(".verify-sub-block").css("top", e.top)
                .find("img").attr("src", `data:image/png;base64,${cropped}`)
                $(".captcha_loadding").remove()
            }).fail( e => {
                $(".load_text").text("加载失败…")
            })
        }).on("click", ".qing_modal__close>i", e => {
            $(".panel").remove()
        })
    }
    getid() { // uuid
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0
            var v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }
    // 消息框
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
    // 验证表单
    isform (){
        let t = this,
            is_bobl = true,
            PasReg = /^(?=.*\d)(?=.*[A-Za-z])[\x20-\x7e]{6,}$/,
            MailReg =/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            PhoneReg = /^1[3456789]\d{9}$/,
            inparse = ""
        if( $(".main").is(".action")) { // 注册
            inparse = ".regi"
        } else {
            inparse = ".login"
        }
        $( inparse + " input").each( function() {
            let v = $(this).val()
            if( v == "") {
                t.tip( $(this).attr("dada_cont"), false)
                $(this).focus()
                is_bobl = false
                return false
            }
            if( $(this).is(".user_mail") && !v.match( MailReg)) { // 邮箱正则验证
                t.tip("邮箱地址无效…", false)
                is_bobl = false
                return false
            }
            if($(this).is(".phone") && ! PhoneReg.test( v)) { //手机号正则验证
                t.tip( "手机号是无效的…", false)
                is_bobl = false
                return false
            }
            if( $(this).is(".setpas") ||  $(this).is(".user_paw")) { // 密码验证
                if( v.length < 6) {
                    t.tip("密码不得少于6位字符…", false)
                    $(this).focus()
                    is_bobl = false
                    return false
                } else if( !PasReg.test(v )) { // 密码验证
                    t.tip("密码不能为纯数字或字母…", false)
                    $(this).focus()
                    is_bobl = false
                    return false
                }
            }
            if( $(this).is(".verify") && v.length != 4 ) {
                t.tip("验证码有误…", false)
                $(this).focus()
                is_bobl = false
                return false
            }
        })
        if( !is_bobl) return false
        if( !$(".main").is(".action")) {  // 弹出拖动验证
            // 验证是否在本机登录过，如果没有，则弹出拖动验证，否则直接登录
            // ../../is.lock
            let d = localStorage.getItem("is_lock")
            if( d == null || Date.now() > parseInt(d) + (86400000 * 5) ) {
                this.captcha()
                this.fn = null
                this.fn = "login"
                return false
            }
        }
        this.login()
    }
    // 拖动验证
    captcha() {
        this.axios("/captcha").then( e => {
            this.uuid = null
            this.uuid = e.uuid
            let bg = e.baseImage,
                cropped = e.croppedImg,
             t = `<div class='panel'>
                    <div class='captcha'>
                        <div class='qing_modal__header'>
                            <span class='qing_modal__title'>请完成安全验证</span>
                            <span class='qing_modal__close'><i class='ri-close-line'></i></span>
                        </div>
                        <div class='qing_modal_verify'>
                            <div class='qing_bgimg'>
                                <img class='qing_bg' src='data:image/png;base64,${bg}' ondragstart="return false">
                                <div class='qing_top__right'>
                                    <svg fill="#fff" width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10,4 C12.0559549,4 13.9131832,5.04358655 15.0015086,6.68322231 L15,5.5 C15,5.22385763 15.2238576,5 15.5,5 C15.7761424,5 16,5.22385763 16,5.5 L16,8.5 C16,8.77614237 15.7761424,9 15.5,9 L12.5,9 C12.2238576,9 12,8.77614237 12,8.5 C12,8.22385763 12.2238576,8 12.5,8 L14.5842317,8.00000341 C13.7999308,6.20218044 12.0143541,5 10,5 C7.23857625,5 5,7.23857625 5,10 C5,12.7614237 7.23857625,15 10,15 C11.749756,15 13.3431487,14.0944653 14.2500463,12.6352662 C14.3958113,12.4007302 14.7041063,12.328767 14.9386423,12.4745321 C15.1731784,12.6202971 15.2451415,12.9285921 15.0993765,13.1631281 C14.0118542,14.9129524 12.0990688,16 10,16 C6.6862915,16 4,13.3137085 4,10 C4,6.6862915 6.6862915,4 10,4 Z" fill-rule="nonzero"></path>
                                    </svg>
                                </div>
                                <div class='verify-sub-block' style='top:${e.top}px'>
                                    <img src='data:image/png;base64,${cropped}'>
                                </div>
                            </div>
                            <div class='qing_control'>
                                <div class='progress_bar'></div>
                                <div class='verify-msg'>向右拖动滑块完成拼图</div>
                                <div class='captcha_handler'><i class="ri-arrow-right-s-line"></i></div>
                            </div>
                        </div>
                    </div>
                </div>`
            $(".main").append( t)
        })
    }
    // 拖动完滑块后，数据发送到后台验证
    check() {
        // dnal
        let  outime = (( Date.now() - this.time) / 1000).toFixed(2),
        isok = true
        if( outime >= 0.2) {
            let key = localStorage.getItem("pubkey")
            if( key == null) {
                key =  this.generateRandomKey( 16)
                localStorage.setItem("pubkey", key)
            }
            let obj = {
                "outime": parseFloat(outime),
                "x":this.moveX,
                "y":this.movey,
                "uuid": this.uuid
            },
            str = this.encrypt( JSON.stringify( obj ),  key)
            $.post(this.url + "/captcha/check", {data: str, pubkey: key}).then( e => {
                if( e.result == 0) {
                    $(".qing_bgimg").append( `<div class='captcha_message success captcha_up'>${outime + "S " + e.message}</div>`)
                }
            }).fail( e => {
                let msg =  e.responseJSON
                if( msg.result == 1 ) {
                    isok = false
                    $(".qing_bgimg").append( `<div class='captcha_message error captcha_up'>${msg.message}</div>`)
                }
            })
        } else {
            isok = false
            $(".qing_bgimg").append( `<div class='captcha_message error captcha_up'>验证失败…</div>`)
        }
        setTimeout( () => {
            $(".captcha_message").removeClass("captcha_up").addClass("captcha_out")
            setTimeout( () => {
                $(".captcha_message").remove()
                if( !isok ) {
                    $(".qing_top__right").trigger("click")
                } else {
                    $(".panel").remove()
                    if( this.fn != null) {
                        this[this.fn]()
                    }
                }
            }, 1000)
        }, 1500)
    }
    login() {
        if( $(".main").is(".action")) { // 注册
            let data = $(".regi input").serialize()
            this.axios( "/reg", data).then( e => {
                if( e.code == 200) {
                    this.tip( e.msg )
                }
            })
        } else { // 登录
            let data = $(".login input").serialize()
            this.axios("/login", data).then( e => {
                if( e.code == 200) {
                    let token = e.token
                    localStorage.setItem("is_lock", Date.now())
                    localStorage.setItem("token", token)
                    this.tip( e.msg )
                     // 跳转到用户聊天界面
                    window.electronAPI.newApp("win_new")
                }
            })
        }
    } 
    SendMail( ) {  // 发送邮件
         let u = "/verify",
         index = 60,
         t = $(".send_mail_ico"),
         i = $(".regi input").eq(0),
         timer
     $.ajax( {
         type: "post",
         url: this.url + u,
         data: {  "value":$("input.user_mail").val() },
         dataType: "json",
         beforeSend: () => {
             t.addClass("is_start")
             $(".is_start>i").text(`${index}` + "S")
             timer = setInterval ( () => {
                 if( index == 0) {
                     index = 60
                     t.removeClass("is_start")
                     .find("i").text("")
                     clearInterval( timer )
                 } else {
                     $(".is_start>i").text(`${index}` + "S")
                     index --;
                 }
             }, 1000)
         }
     }).then( e => {
         if( e.code == 200) {
             i.prop("readonly", true)
             this.tip( e.msg )
         }
     }).fail( e => {
         if( e.status != 0) {
             let res = $.parseJSON(  e.responseText)
             if( res.code == -1) {
                 t.removeClass("is_start")
                 .find("i").text("")
                 clearInterval( timer )
                 this.tip( res.msg, false)
                 return
             }
         }
         this.tip( e.statusText, false)
     })
    }
    axios(u, data, type = "POST") {
        return $.ajax({
            type: type,
            url: this.url + u,
            dataType: "json",
            data: data,
        }).fail( e => {
            if( e.status == 404) {
                let data = $.parseJSON( e.responseText)
                this.tip( data.msg , false)
                return false
            }
            this.tip( "网络连接失败…", false)
        })
    }
    encrypt( word, paw = "XwKsGlMcdPMEhR1B" ){  // ecb加密
          let key = CryptoJS.enc.Utf8.parse(paw),
            srcs = CryptoJS.enc.Utf8.parse(word),
            encrypted = CryptoJS.AES.encrypt(srcs, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.toString();
    }
    generateRandomKey(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
let app = new login()
app.init()