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
socket.emit('auth', {auth: {login: login, password: password}})
function transfer() {
    var $target = $("#dest")
    var $amount = $("#val")
    socket.emit('transfer', {target: $target.val(), amount: $amount.val(), auth: {login: login, password: password}})
}