var login = localStorage.getItem('login')
var password = localStorage.getItem('password')
var socket = io.connect()
function fclick() {
    console.log('click')
    socket.emit('click', {auth: {login: login, password: password}})
}
socket.on('bal', function(data) {
    console.log(data)
    if (data.res == 1) {
        $("#bal").text("BALANCE: " + data.data + " CL")
    }
    else {
        alert(data.data)
    }
})