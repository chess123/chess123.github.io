var charge_x;
var charge_y;
var charge_val;
var numCharges;
var space;
var old_space;
var mouseX;
var mouseY;
var current_charge = -1;
var mouseDown = false;
var c = document.getElementById("mycanvas");
var ctx = c.getContext("2d");
var width = c.width;
var height = c.height;
window.onload = function() {
	start_sim();
	$("#reschange").on("input", function() {
	   space = (40 - $(this).val());
	   old_space = space;
	   paintComponent();
	});
}
document.getElementById("mycanvas").onmousemove = register_mouse_moved;
document.getElementById("mycanvas").onmousedown = function() {
	mouseDown = true;
}
document.getElementById("mycanvas").onmouseup = function() {
	mouseDown = false;
	current_charge = -1;
	space = old_space;
	paintComponent();
}

function update_vals() {
	var qx = $('input[name="input1"]').val();
	var qy = $('input[name="input2"]').val();
	var mag = print_field(qx, qy);
	document.getElementById("emag").innerHTML = mag;
}

function start_sim() {
	charge_x = [];
	charge_y = [];
	charge_val = [];
	numCharges = 10;
	space = 25;
	old_space = 25;
	for (i = 0; i < numCharges; i++) {
		do {
			charge_x[i] = (Math.random() * 20 - 10) | 0;
			charge_y[i] = (Math.random() * 20 - 10) | 0;
		} while (found(charge_x[i], charge_y[i], i));
		// console.log(charge_vel_x[i], charge_vel_y[i]);
		charge_val[i] = (Math.random() * 10 + 5);
		if (Math.random() > 0.5) charge_val[i] *= -1;
	}
	paintComponent();
	// document.getElementById("arrowimg").onload = paintComponent();
}

function register_mouse_moved(e) {
	if (!mouseDown) return;
	mouseX = e.clientX - $("#mycanvas").position().left + window.scrollX;
	mouseY = e.clientY - $("#mycanvas").position().top + window.scrollY;
	console.log(window.scrollY);
	var ind = find_charge(mouseX, mouseY);
	if (ind > -1 || current_charge != -1) {
		if (space < 20) space = 20;
		if (ind != -1 && current_charge == -1) current_charge = ind;
		charge_x[current_charge] = (mouseX - width / 2) / (width / 20);
		charge_y[current_charge] = (mouseY - height / 2) / -(height / 20);
		paintComponent();
	}
}

function find_charge(mx, my) {
	for (i = 0; i < numCharges; i++) {
		var x = charge_x[i];
		var y = charge_y[i];
		var r = Math.sqrt(Math.pow(mx - (width / 20 * x + width / 2), 2) + Math.pow(my - (height / 2 - height / 20 * y), 2));
		if (r <= (Math.round(Math.abs(charge_val[i])) + 5)) {
			return i;
		}
	}
	return -1;
}

function found(x, y, ind) {
	for (n = 0; n < ind; n++) {
		if (charge_x[n] == x && charge_y[n] == y) return true;
	}
	return false;
}

function paintComponent() {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, width, height);
	var min_field = get_field(0, 0)[2];
	var min_x = width / 2;
	var min_y = height / 2;
	for (a = 0; a < width; a += space) {
		for (j = 0; j < height; j += space) {
			var field = get_field((a + space / 2 - width / 2) / (width / 20), (j + space / 2 - height / 2) / -(height / 20));
			// if (field[2] > 5) {
			// 	ctx.fillStyle = "rgba(0, 255, 0, 1)";
			// 	ctx.strokeStyle = "rgba(0, 255, 0, 1)";
			// }
			// else {
			// 	var alpha = Math.pow(field[2] / 5, 0.4);
			// 	ctx.fillStyle = "rgba(0, 255, 0, " + alpha + ")";
			// 	ctx.strokeStyle = "rgba(0, 255, 0, " + alpha + ")";				
			// }
			var alpha = 2 / (1 + Math.pow(Math.E, -0.5 * field[2])) - 1;
			ctx.fillStyle = "rgba(0, 255, 0, " + alpha + ")";
			ctx.strokeStyle = "rgba(0, 255, 0, " + alpha + ")";
			if (field[2] < min_field) {
				min_field = field[2];
				min_x = a;
				min_y = j;
			}
			ctx.beginPath();
			ctx.moveTo(a + space / 2, j + space / 2);
			ctx.lineTo((a + space / 2) + ((space / 2) * field[0] / field[2]), (j + space / 2) + ((space / 2) * field[1] / field[2]));
			ctx.moveTo(a + space / 2, j + space / 2);
			ctx.lineTo((a + space / 2) - ((space / 2) * field[0] / field[2]), (j + space / 2) - ((space / 2) * field[1] / field[2]));
			ctx.stroke();
			ctx.beginPath();
			ctx.ellipse((a + space / 2) + ((space / 2) * field[0] / field[2]), (j + space / 2) + ((space / 2) * field[1] / field[2]), 2 * space / 20, 2 * space / 20, 0, 0, 2 * Math.PI);
			ctx.fill();
			// ctx.fillRect(a, j, space, space);
		}
	}
	ctx.fillStyle = "#ffa500";
	ctx.strokeStyle = "#ffa500";
	ctx.fillRect(min_x - 2, min_y - 2, 4, 4);
	for (i = 0; i < numCharges; i++) {
		if (charge_val[i] < 0) ctx.fillStyle = "#0000ff";
		else ctx.fillStyle = "#ff0000";
		ctx.beginPath();
		var val = Math.round(Math.abs(charge_val[i])) + 5;
		var ell_x = width / 2 + charge_x[i] * width / 20;
		var ell_y = height / 2 - charge_y[i] * height / 20;
		ctx.ellipse(ell_x, ell_y, val / 2, val / 2, 0, 0, 2 * Math.PI);
		ctx.fill();
	}
	ctx.strokeWeight = 5;
	ctx.strokeStyle = "#ffffff";
	ctx.beginPath();
	ctx.moveTo(width / 2, 0);
	ctx.lineTo(width / 2, height);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, height / 2);
	ctx.lineTo(width, height / 2);
	ctx.stroke();
}

function get_field(x, y) {
	var sum_fx = 0;
	var sum_fy = 0;
	for (i = 0; i < numCharges; i++) {
		var r = Math.sqrt(Math.pow(charge_x[i] - x, 2) + Math.pow(charge_y[i] - y, 2));
		var f = charge_val[i] / (r * r);
		var fx = -f * (charge_x[i] - x) / r;
		var fy = f * (charge_y[i] - y) / r;
		sum_fx += fx;
		sum_fy += fy;
	}
	var force_arr = [];
	force_arr[0] = sum_fx;
	force_arr[1] = sum_fy;
	force_arr[2] = Math.sqrt(sum_fx * sum_fx + sum_fy * sum_fy);
	force_arr[2] = Math.round(force_arr[2] * 1000) / 1000;
	return force_arr;
}

function add_charge() {
	do {
		charge_x[numCharges] = (Math.random() * 20 - 10) | 0;
		charge_y[numCharges] = (Math.random() * 20 - 10) | 0;
	} while (found(charge_x[numCharges], charge_y[numCharges], numCharges));
	charge_val[numCharges] = Math.random() * 10 + 5;
	if (Math.random() > 0.5) charge_val[numCharges] *= -1;
	numCharges++;
	paintComponent();
}

function remove_charge() {
	if (numCharges <= 0) return;
	numCharges--;
	charge_x[numCharges] = null;
	charge_y[numCharges] = null;
	charge_val[numCharges] = null;
	paintComponent();
}

function print_field(x, y) {
	var field = get_field(x, y);
	var direction = get_direction(field);
	return field[2] + " N/C " + direction;
}

function get_direction(field) {
	var theta = Math.atan(field[1] / field[0]);
	theta *= 180 / Math.PI;
	var horiz = "";
	var vert = "";
	if (field[0] > 0) horiz = "E";
	if (field[0] < 0) horiz = "W";
	if (field[1] > 0) vert = "S";
	if (field[1] < 0) vert = "N";
	var angle = "";
	theta = Math.round(theta * 10) / 10;
	theta = Math.abs(theta);
	if (theta % 90 != 0) angle = theta + "";
	return "[" + horiz + angle + vert + "]";
}