window.electronAPI.IsOpenApp("is_open_child")
class imageview {
    init() {
        window.electronAPI.imgview((v ) => {
            let date = JSON.parse( v )
            let img = new Image()
            img.src = date.src
            $(img).on( "load", () => {
                $(".main-box img").attr("src", img.src).show()

            })
            $(".win").css({"width":date.ow, "height": date.oh})
        })

        $(".close").on("click", ( ) => {
            window.electronAPI.closeChild("child_close")
        })
    }
}
let i = new imageview()
i.init()