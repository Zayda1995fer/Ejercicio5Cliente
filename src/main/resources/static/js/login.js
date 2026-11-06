function validarLogin(){
	
	/*alert($("#email").val());
	alert($("#password").val());*/
	var email = document.getElementById("exampleInputEmail1");
	if($("#exampleInputEmail1").val() == "" && $("#exampleInputPassword1").val() == ""){
		var myToast = document.querySelector('#alerta1');
		var toast = new bootstrap.Toast(myToast);
		toast.show();
	}
	else if($("#exampleInputEmail1").val() == ""){
		document.getElementById("exampleInputEmail1").focus();
		var myToast = document.querySelector('#alerta2');
		var toast = new bootstrap.Toast(myToast);
		toast.show();
	}
	else if(email.checkValidity() == false){
		document.getElementById("exampleInputEmail1").focus();
		var myToast = document.querySelector('#alerta3');
		var toast = new bootstrap.Toast(myToast);
		toast.show();
	}
	else if($("#exampleInputPassword1").val() == ""){
		document.getElementById("exampleInputEmail1").focus();
		var myToast = document.querySelector('#alerta4');
		var toast = new bootstrap.Toast(myToast);
		toast.show();
	}
	else{

		$.ajax({
			url : "/verificarLogin",
			contentType:"application/json",
			data : JSON.stringify({correo_electronico: $("#exampleInputEmail1").val(), contrasena:$("#exampleInputPassword1").val()}),
			type : "POST",
			success: function(data){
				console.log(data);
				if(data.nombre == '000'){
					document.getElementById("exampleInputEmail1").focus();
					var myToast = document.querySelector('#alerta5');
					var toast = new bootstrap.Toast(myToast);
					toast.show();
				}else{
					localStorage.setItem("usuario", JSON.stringify(data));
					window.location.href = 'inicio';
				}
			},
			// PRACTICA 3 (defecto AUT-F04 de la practica 2): si el backend falla (500, sin conexion)
			// antes no se avisaba nada al usuario
			error: function(xhr){
				console.error("Error al verificar el login: " + xhr.status);
				var myToast = document.querySelector('#alerta6');
				var toast = new bootstrap.Toast(myToast);
				toast.show();
			}
		});
	}

}