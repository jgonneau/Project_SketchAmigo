//Evements jquery

$('body').ready(function () {

	//creation des variables necessaires au fonctionnement
	var context = document.getElementById('drawing').getContext("2d"),
		paint = false,
		colorSelected = "#000000",
		clickX = [],
		clickY = [],
		clickDrg = [],
		crayonWidth = [],
		crayonColor = [];

//evenement d'appuie de souris pour dessiner
	function addClick(x, y, drg) {

		clickX.push(x);
		clickY.push(y);
		clickDrg.push(drg);
		if (document.getElementById('slarge').selected)
			crayonWidth.push(6);
		else if (document.getElementById('smedium').selected)
			crayonWidth.push(4);
		else
			crayonWidth.push(1);
		crayonColor.push(colorSelected);
	}

//evenement de mise à jour des traits dessins effectués
	function redraw() {

		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		context.lineJoin = "round";

		for (var i = 0; i < clickX.length; i++)
		{
			context.beginPath();
			if (clickDrg[i] && i) {
				context.moveTo(clickX[i-1], clickY[i-1]);
			} else {
				context.moveTo(clickX[i]-1, clickY[i]);
			}
			context.strokeStyle = crayonColor[i];
			context.lineWidth = crayonWidth[i];
			context.lineTo(clickX[i], clickY[i]);
			context.stroke();
			context.closePath();
			console.log(clickX[i]+'='+clickY[i]+'='+clickDrg[i]);
		}
	}

	//permet de reinitialiser le dessin
	$('#rstdrw').click(function (){
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	});

	//permet de choisir les params de dessin
	$('#palette').click(function (e) {
		if (e.target.id != palette)
		{
			$('#palette td').css('opacity', '0.5');
			$('#selcolor').html(e.target.id.substr(1)).css('color', $('#'+e.target.id).css('background-color'));
			colorSelected = $('#'+e.target.id).css('background-color');
			$('#'+e.target.id).css('opacity', '1');
		}
	});

//evenement de dessin, appuie souris
	$('#drawing').mousedown(function(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;

		$('#chatlines').append(clickX.length+'\n');
		paint = true;
		addClick(mouseX, mouseY);
		redraw();
	});

	//evenement de dessin, mouvement souris
	$('#drawing').mousemove(function(e) {
		if (paint) {
			var element = $('#drawing');
			element = element.offset();
			addClick(e.pageX - element.left, e.pageY - element.top, paint);
			redraw();
		}
	});

//evenement de dessin, relachement souris
	$('#drawing').mouseup(function(e) {
		paint = false;
	});

	//evenement de dessin, souris en dehors 
	$('#drawing').mouseleave(function(e) {
		paint = false;
	});


});
