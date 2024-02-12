class Cookie {
    set(n, v, e) {
        let value
        if( typeof(v) == 'object') {
            value = JSON.stringify( v)
        } else {
            value = v 
        }
        let d = new Date();
        d.setDate( d.getDate() + e );
        document.cookie = `${n}=${encodeURI(value)}${e == null ? '' : `;expires=${d.toGMTString()}`};path=/`
    }
    get(n ) {
        if( document.cookie.length > 0) {
            let i = document.cookie.indexOf(`${n}=`)
            if( i != -1) {
                i = i + n.length + 1
                let end = document.cookie.indexOf(";", i)
                if(end == -1) {
                    end = document.cookie.length
                }
                return document.cookie.substring( i, e);
            }
        }
        return null
    }
    del(n) {
        this.set( n, 0, -10)
    }
}