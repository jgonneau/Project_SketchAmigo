



$('body').ready(function () {
	
	var context = document.getElementById('drawing').getContext("2d"),
		paint = false,
		colorSelected = "#000000",
		clickX = [],
		clickY = [],
		clickDrg = [],
		crayonWidth = [],
		crayonColor = [];

	function penTrack(x, y, drg) {
		
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
	
	function updateDraw(cX, cY, cDrg, cW, cC) {
		
		context.lineJoin = "round";
		
		for (var i = 0; i < cX.length; i++)
		{
			context.beginPath();
			if (cDrg[i] && i) {
				context.moveTo(cX[i-1], cY[i-1]);
			} else {
				context.moveTo(cX[i]-1, cY[i]);
			}
			context.strokeStyle = cC[i];
			context.lineWidth = cW[i];
			context.lineTo(cX[i], cY[i]);
			context.stroke();
			context.closePath();
		}
	}
	
	function sendObj () {
		var Obj = {};
		
		if (clickX.length)
		{
			Obj.cX = clickX;
			Obj.cY = clickY;
			Obj.dg = clickDrg;
			Obj.cW = crayonWidth;
			Obj.cC = crayonColor;
			socket.emit('updateCanvas', {pT: Obj});
		}
	}
	
	setInterval(sendObj, 100);
	
	$('#rstdrw').click(function (){
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	});
	
	$('#palette').click(function (e) {
		if (e.target.id != palette)
		{
			$('#palette td').css('opacity', '0.5');
			$('#selcolor').html(e.target.id.substr(1)).css('color', $('#'+e.target.id).css('background-color'));
			colorSelected = $('#'+e.target.id).css('background-color');
			$('#'+e.target.id).css('opacity', '1');
		}
	});
	
	$('#drawing').mousedown(function(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		
		paint = true;
		penTrack(mouseX, mouseY);
	});
	
	$('#drawing').mousemove(function(e) {
		if (paint) {
			var element = $('#drawing');
			element = element.offset();
			var mouseX = e.pageX - element.left;
			var mouseY = e.pageY - element.top;
			
			penTrack(mouseX, mouseY, paint);
		}
	});
	
	$('#drawing').mouseup(function(e) {
		paint = false;
	});
	
	$('#drawing').mouseleave(function(e) {
		paint = false;
	});
	
	socket.on('syncCanvas', function(data) {
			updateDraw(data.cr.cX, data.cr.cY, data.cr.dg, data.cr.cW, data.cr.cC);
	});
	
	socket.on('clearCanvas', function(data) {
		$('#chatlines').append('<span class="mred">'+data.usr+' cleared all!</span><hr>');
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	});
});
