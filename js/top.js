var socket = io.connect()
socket.on('info', function(data) {
    console.log(data)
    var ans = ''
    for (user in data) {
        ans += `<li class="user">
                    <div class="user_pos">(${Number(user) + 1})</div>
                    <div class="user_name">${data[user].username}</div>
                    <div class="user_score">${data[user].balance} CL<img src="static/logo.svg" class="logo small"></div>
                </li>`
    }
    $("#users").html(ans)
})
socket.emit('get_users')