socket = io.connect()
var login = localStorage.getItem('login')
var password = localStorage.getItem('password')

if (!(login && password)) {
	window.location.replace("/register")
}
else {
	socket.emit('auth', {auth: {login: login, password: password}})
	socket.on('res', function(data) {
		console.log(data)
		if (data.code == 1) {
			$("#bal").text("BALANCE: " + data.balance + " CL")
		}
		else {
			$("#bal").text("BALANCE: 0 CL")
			alert(data.result)
		}
	})
}

socket.on('buyer', function (data) {
    console.log(data)
    if (data.res == 1) {
        console.log(data.itemname)
        price = Number($(`#${data.itemname}`).text()) * 1.2
        price = Math.round(price)
        $(`#${data.itemname}`).text(price)
        $("#bal").text("BALANCE: " + data.balance +" CL")
    }
    else {
        alert(data.data)
    }
})

socket.on('list', function(data) {
    console.log(data)
    var ans = ''
    for (item in data) {
        info = data[item]
        shab = `<li class="item">
                    <div class="item_body">
                        <img src="/static/zma.webp" alt="" class="item_icon">
                        <div class="item_info">
                            <h3 class="item_name">${item}</h3>
                            <div class="item_perk">+${info.desc} <img src="/static/logo.svg" class="logo small"></div>
                        </div>
                    </div>
                    <button onclick="buy('${item}')" class="btn buybtn">Купить <span class="item_price"><plain id="${item}">${info.price}</plain> <img src="/static/logo.svg" class="logo small"></span></button>
                </li>`
        ans += shab
    }
    $("#items").html(ans)
})

function buy(itemname) {
    console.log(itemname)
    socket.emit('buy', {itemname: itemname, auth: {login: login, password: password}})
}

socket.emit('get_items')