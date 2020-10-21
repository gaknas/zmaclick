var login = localStorage.getItem('login')
var password = localStorage.getItem('password')
var socket = io.connect()
if (!(login && password)) {
    window.location.replace("/register")
}
socket.on('tresult', function(data) {
    console.log(data)
    if (data.res == 1) {
        $("#bal").text("BALANCE: " + data.balance + "CL")
    }
    else {
        alert(data.data)
    }
})
$(function() {
    var $form = $("#transferForm")
    $form.submit(function(event) {
        event.preventDefault()
        transfer()
    })
})