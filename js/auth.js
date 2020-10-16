$(function() {
    var $form = $("#registerForm")
    var $login = $("#login")
    var $password = $("#password")

    $form.submit(function(event) {
        event.preventDefault()
        if ($login.val() && $password.val()) {
            localStorage.setItem('login', $login.val())
            localStorage.setItem('password', $password.val())
            window.location.replace('/')
        }
        else {
            alert('введите логин и пароль')
        }
    })
})