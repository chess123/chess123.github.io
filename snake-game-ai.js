var c;
var ctx;
var x_locations;
var y_locations;
var snake_x;
var snake_y;
var numFoods;
var snake_parts;
var direction;
var snake_lefts;
var snake_tops;
var moving;
var timer;
var dead;
var score;
var colors;
var last_moved_direction;
var move_wall;
var wall_x, wall_y;
var vx, vy;
var radius;
var times;
var temp_score;
window.onload = start_game();

function start_game() {
	times = 0;
	temp_score = 0;
	radius = 25;
	last_moved_direction = 0;
	colors = new Array();
	clearInterval(timer);
	clearInterval(move_wall);
	c = document.getElementById("mycanvas");
	ctx = c.getContext("2d");
	x_locations = new Array();
	y_locations = new Array();
	snake_x;
	snake_y;
	wall_x = new Array();
	wall_y = new Array();
	wall_x[0] = Math.random() * c.width | 0;
	wall_y[0] = Math.random() * c.height | 0;
	vx = new Array();
	vy = new Array();
	vx[0] = 1;
	vy[0] = 1;
	numFoods = 100;
	numPortals = 0;
	snake_parts = 1;
	initialize_locations();
	direction = 0;
	snake_lefts = new Array();
	snake_tops = new Array();
	place_snake();
	moving = false;
	dead = false;
	score = 0;
	update_gradient();
	paintComponent();
	setTimeout(begin, 3000);
	document.getElementById("rating").innerHTML = "AI strength: " + localStorage.getItem("avg");
}

function initialize_locations() {
	for (i = 0; i < numFoods; i++) {
		x_locations[i] = 10 * Math.floor(Math.random() * 99);
		y_locations[i] = 10 * Math.floor(Math.random() * 69);
	}
}

function update_gradient() {
	for (i = 0; i < snake_parts; i++) {
		colors[i] = Math.floor(i * 255.0 / snake_parts);
	}
}

function better_direction() {
	var zero, one, two, three;
	zero = one = two = three = true;
	var n = direction;
	if (n == 0) two = false;
	if (n == 1) three = false;
	if (n == 2) zero = false;
	if (n == 3) one = false;
	for (u = 1; u < snake_parts; u++) {
		if (snake_x + 10 == snake_lefts[u]) two = false;
	}
	for (u = 0; u < wall_x.length; u++) {
		var temp = snake_x + 10;
		if (temp < 0) temp = 1000;
		if (temp >= 1000) temp = 0;
		var d = Math.sqrt(Math.pow(temp - (wall_x[u] + vx[u]), 2) + Math.pow(snake_y - (wall_y[u] + vy[u]), 2));
		if (d <= radius + 50) two = false;
		d = Math.sqrt(Math.pow(temp - wall_x[u], 2) + Math.pow(snake_y - wall_y[u], 2));
		if (d <= radius + 50) two = false;
	}
	for (u = 1; u < snake_parts; u++) {
		if (snake_x - 10 == snake_lefts[u]) zero = false;
	}
	for (u = 0; u < wall_x.length; u++) {
		var temp = snake_x - 10;
		if (temp < 0) temp = 1000;
		if (temp >= 1000) temp = 0;
		var d = Math.sqrt(Math.pow(temp - (wall_x[u] + vx[u]), 2) + Math.pow(snake_y - (wall_y[u] + vy[u]), 2));
		if (d <= radius + 50) zero = false;
		d = Math.sqrt(Math.pow(temp - wall_x[u], 2) + Math.pow(snake_y - wall_y[u], 2));
		if (d <= radius + 50) zero = false;
	}
	for (u = 1; u < snake_parts; u++) {
		if (snake_y + 10 == snake_tops[u]) three = false;
	}
	for (u = 0; u < wall_x.length; u++) {
		var temp = snake_y + 10;
		if (temp <= 0) temp = 700;
		if (temp > 700) temp = 0;
		var d = Math.sqrt(Math.pow(temp - (wall_y[u] + vy[u]), 2) + Math.pow(snake_x - (wall_x[u] + vx[u]), 2));
		if (d <= radius + 50) three = false;
		d = Math.sqrt(Math.pow(temp - wall_y[u], 2) + Math.pow(snake_x - wall_x[u], 2));
		if (d <= radius + 50) three = false;
	}
	for (u = 1; u < snake_parts; u++) {
		if (snake_y - 10 == snake_tops[u]) one = false;
	}
	for (u = 0; u < wall_x.length; u++) {
		var temp = snake_y - 10;
		if (temp <= 0) temp = 700;
		if (temp > 700) temp = 0;
		var d = Math.sqrt(Math.pow(temp - (wall_y[u] + vy[u]), 2) + Math.pow(snake_x - (wall_x[u] + vx[u]), 2));
		if (d <= radius + 50) one = false;
		d = Math.sqrt(Math.pow(temp - wall_y[u], 2) + Math.pow(snake_x - wall_x[u], 2));
		if (d <= radius + 50) one = false;
	}
	if (!zero && !one && !two && !three) {
		zero = one = two = three = true;
		var possible = [];
		for (u = 1; u < snake_parts; u++) {
			if (snake_y - 10 == snake_tops[u]) one = false;
			if (snake_y + 10 == snake_tops[u]) three = false;
			if (snake_x - 10 == snake_lefts[u]) zero = false;
			if (snake_x + 10 == snake_lefts[u]) two = false;
		}
		if (n == 0) two = false;
		if (n == 1) three = false;
		if (n == 2) zero = false;
		if (n == 3) one = false;
		if (zero) possible.push(0);
		if (one) possible.push(1);
		if (two) possible.push(2);
		if (three) possible.push(3);
		return possible[(Math.random() * possible.length) | 0];
	}
	var possible = [];
	if (zero) possible.push(0);
	if (one) possible.push(1);
	if (two) possible.push(2);
	if (three) possible.push(3);
	if (possible.length == 1) return possible[0];
	var max_distance = 0;
	var max_x = x_locations[0];
	var max_y = y_locations[0];
	for (i = 0; i < numFoods; i++) {
		var dist = 0;
		for (j = 0; j < wall_x.length; j++) {
			dist += Math.sqrt(Math.pow(x_locations[i] - wall_x[j], 2) + Math.pow(y_locations[i] - wall_y[j], 2));
		}
		if (dist > max_distance) {
			max_distance = dist;
			max_x = x_locations[i];
			max_y = y_locations[i];
		}
	}
	if (max_x < snake_x && zero) return 0;
	if (max_x > snake_x && two) return 2;
	if (max_y < snake_y && one) return 1;
	if (max_y > snake_y && three) return 3;
	var min_val = 100000000000000000;
	var best_dir;
	for (u = 0; u < possible.length; u++) {
		var dir = possible[u];
		var score = 0;
		if (dir == 0) {
			for (v = 0; v < wall_x.length; v++) {
				var temp = snake_x - 10;
				if (temp < 0) temp = 1000;
				if (temp >= 1000) temp = 0;
				score += 10000 / Math.sqrt(Math.pow(temp - wall_x[v] - vx[v], 2) + Math.pow(snake_y - wall_y[v] - vy[v], 2));
			}
		}
		if (dir == 1) {
			for (v = 0; v < wall_x.length; v++) {
				var temp = snake_y - 10;
				if (temp <= 0) temp = 700;
				if (temp > 700) temp = 0;
				score += 10000 / Math.sqrt(Math.pow(temp - wall_y[v] - vy[u], 2) + Math.pow(snake_x - wall_x[v] - vx[v], 2));
			}
		}
		if (dir == 2) {
			for (v = 0; v < wall_x.length; v++) {
				var temp = snake_x + 10;
				if (temp < 0) temp = 1000;
				if (temp >= 1000) temp = 0;
				score += 10000 / Math.sqrt(Math.pow(temp - wall_x[v] - vx[v], 2) + Math.pow(snake_y - wall_y[v] - vy[v], 2));
			}
		}
		if (dir == 3) {
			for (v = 0; v < wall_x.length; v++) {
				var temp = snake_y + 10;
				if (temp <= 0) temp = 700;
				if (temp > 700) temp = 0;
				score += 10000 / Math.sqrt(Math.pow(temp - wall_y[v] - vy[v], 2) + Math.pow(snake_x - wall_x[v] - vx[v], 2));
			}
		}
		if (score < min_val) {
			min_val = score;
			best_dir = dir;
		}
	}
	return best_dir;
}

function begin() {
	moving = true;
	timer = setInterval(move_snake, 5);
	move_wall = setInterval(move_red, 5);
}

function move_red() {
	times++;
	if (times % 1000 == 0) {
		var n = wall_x.length;
		for (a = 0; a < n; a++) {
			var tx = wall_x[a];
			var ty = wall_y[a];
			var tvx = vx[a] * 2;
			var tvy = vy[a] * 2;
			wall_x[wall_x.length] = tx;
			wall_y[wall_y.length] = ty;
			vx[vx.length] = tvx;
			vy[vy.length] = tvy;
		}
		radius /= 2;
	}
	else if (times % 40 == 0) {
		radius++;
		for (p = 0; p < wall_x.length; p++) {
			vx[p] /= 1.2;
			vy[p] /= 1.2;
		}
	}
	for (p = 0; p < wall_x.length; p++) {		
		vx[p] += 1 / Math.sqrt(wall_x.length) * (1 - Math.random() * 2);
		vy[p] += 1 / Math.sqrt(wall_x.length) * (1 - Math.random() * 2);
		wall_x[p] += vx[p];
		wall_y[p] += vy[p];
		if (wall_x[p] < 0 && vx[p] < 0 || wall_x[p] > c.width - radius && vx[p] > 0) vx[p] *= -1;
		if (wall_y[p] < 0 && vy[p] < 0 || wall_y[p] > c.height - radius && vy[p] > 0) vy[p] *= -1;
		for (q = 0; q < snake_lefts.length; q++) {
			if (Math.sqrt(Math.pow(snake_lefts[q] - wall_x[p], 2) + Math.pow(snake_tops[q] - wall_y[p], 2)) < radius) {
				if (q == 0) {
					clearInterval(timer);
					clearInterval(move_wall);
					dead = true;
					snake_parts = 0;
					paintComponent();
					return;
				}
				snake_lefts.splice(q, snake_lefts.length - q + 1);
				snake_tops.splice(q, snake_tops.length - q + 1);
				snake_parts = snake_lefts.length;
				temp_score = 10 * (snake_parts - 1);
				update_gradient();
				paintComponent();
				break;
			}
		}
	}
	paintComponent();
}

function place_snake() {
	do {
		snake_x = 10 * Math.floor(Math.random() * 99);
		snake_y = 10 * Math.floor(Math.random() * 69);
	} while (Math.sqrt(Math.pow(snake_x - wall_x[0], 2) + Math.pow(snake_y - wall_y[0], 2)) < 100);
	snake_lefts[0] = snake_x;
	snake_tops[0] = snake_y;
}

function move_snake() {
	var old = direction;
	direction = better_direction();
	direction %= 4;
	switch (direction) {
		case 1: snake_y -= 10; break;
		case 2: snake_x += 10; break;
		case 3: snake_y += 10; break;
		case 0: snake_x -= 10; break;
	}
	if (snake_y <= -10) snake_y = 700;
	else if (snake_y >= 700) snake_y = 0;
	if (snake_x <= -10) snake_x = 1000;
	else if (snake_x >= 1000) snake_x = 0;
	var col_index = collision();
	if (col_index != -1) {
		if (score == temp_score) {
			temp_score += 10 * wall_x.length;
			score += 10 * wall_x.length;
		}
		else temp_score += 10 * wall_x.length;
		if (temp_score > score) score = temp_score;
		x_locations[col_index] = 10 * Math.floor(Math.random() * 99);
		y_locations[col_index] = 10 * Math.floor(Math.random() * 69);
		snake_parts++;
		update_gradient();
	}
	for (i = snake_parts - 1; i > 0; i--) {
		snake_lefts[i] = snake_lefts[i - 1];
		snake_tops[i] = snake_tops[i - 1];
	}
	snake_lefts[0] = snake_x;
	snake_tops[0] = snake_y;
	if (duplicates()) {
		var games;
		if (localStorage.getItem("numgames") === null) localStorage.setItem("numgames", String(1));
		else {
			games = parseInt(localStorage.getItem("numgames"));
			localStorage.setItem("numgames", String(games + 1));
		}
		if (localStorage.getItem("avg") === null) localStorage.setItem("avg", String(score));
		else {
			var avg = parseInt(localStorage.getItem("avg"));
			avg *= games;
			avg += score;
			avg /= games + 1;
			localStorage.setItem("avg", String(avg));
		}
		document.getElementById("rating").innerHTML = "AI strength: " + localStorage.getItem("avg");
		ctx.font = "48px Lucida Sans Unicode";
		ctx.fillStyle = "#009900";
		ctx.fillText("GAME OVER", 350, 350);
		ctx.fillStyle = "#0000ff";
		clearInterval(timer);
		clearInterval(move_wall);
		dead = true;
		setTimeout(start_game, 3000);
		return;
	}
	paintComponent();
}

function duplicates() {
	for (j = i + 1; j < snake_parts; j++) {
		if (snake_lefts[j] == snake_x && snake_tops[j] == snake_y) return true;
	}
	return false;
}

function collision() {
	for (i = 0; i < x_locations.length; i++) {
		if (snake_x >= x_locations[i] && snake_x <= x_locations[i] + 10 && snake_y >= y_locations[i] && snake_y <= y_locations[i] + 10) return i;
		if (snake_x + 10 >= x_locations[i] && snake_x + 10 <= x_locations[i] + 10 && snake_y >= y_locations[i] && snake_y <= y_locations[i] + 10) return i;
		if (snake_x >= x_locations[i] && snake_x <= x_locations[i] + 10 && snake_y + 10 >= y_locations[i] && snake_y + 10 <= y_locations[i] + 10) return i;
		if (snake_x + 10 >= x_locations[i] && snake_x + 10 <= x_locations[i] + 10 && snake_y + 10 >= y_locations[i] && snake_y + 10 <= y_locations[i] + 10) return i;
	}
	return -1;
}

function paintComponent() {
	ctx.clearRect(0, 0, c.width, c.height);
	last_moved_direction = direction;
	ctx.fillStyle = "#000000";
	for (i = 0; i < x_locations.length; i++) {
		ctx.fillRect(x_locations[i], y_locations[i], 10, 10);
	}
	ctx.strokeStyle = "#ff0000";
	ctx.fillStyle = "#ff0000";
	for (i = 0; i < wall_x.length; i++) {
		ctx.beginPath();
		ctx.ellipse(wall_x[i], wall_y[i], radius, radius, 0, 0, 2 * Math.PI);
		ctx.fill();
	}
	for (i = 0; i < snake_parts; i++) {
		ctx.fillStyle = "rgb(" + colors[i] + ", " + colors[i] + ", " + 255 + ")";
		ctx.fillRect(snake_lefts[i], snake_tops[i], 10, 10);
	}
	ctx.font = "48px Lucida Sans Unicode";
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fillText("Score: " + score, 50, 50);
	if (dead) {
		ctx.font = "48px Lucida Sans Unicode";
		ctx.fillStyle = "#009900";
		var games;
		if (localStorage.getItem("numgames") === null) localStorage.setItem("numgames", String(1));
		else {
			games = parseInt(localStorage.getItem("numgames"));
			localStorage.setItem("numgames", String(games + 1));
		}
		if (localStorage.getItem("avg") === null) localStorage.setItem("avg", String(score));
		else {
			var avg = parseInt(localStorage.getItem("avg"));
			avg *= games;
			avg += score;
			avg /= games + 1;
			localStorage.setItem("avg", String(avg));
		}
		document.getElementById("rating").innerHTML = "AI strength: " + localStorage.getItem("avg");
		ctx.fillText("GAME OVER", 350, 350);
		ctx.fillStyle = "#0000ff";
		setTimeout(start_game, 3000);
	}
}