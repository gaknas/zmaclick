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