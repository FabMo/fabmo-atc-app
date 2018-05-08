
var fabmo = new FabMoDashboard()
var TOOLS = [1,2,3,4,5,6];

var okButtonHandler = null;
var cancelButtonHandler = null;

function goToolList() {
	showScreen('screen-tools');
}

function goHome() {
	showScreen('screen-home');
}

function pickupTool(num) {
	console.log("Picking up tool " + num);
	fabmo.runSBP('&Tool=' + num + '\nC9\n');
}

function doCalibrate() {
	fabmo.showDRO(function() { console.log("done")});
	doModal({
		title : 'Calibrate ATC',
		text : 'Install an empty tool holder <em>upside down</em> in the first tool slot, and using the manual drive function of the tool, position the spindle (with an empty tool cup installed) above the first tool holder.',
		image : 'images/calibrate1.jpg'
	}).then(function resolve() {
		console.log("resolved");
		fabmo.runSBP('C101\n');
	}, function reject() {
		console.error("Rejected calibration modal.");
	});
}

function doHome() {
	fabmo.runSBP('C2\n');
}

function doZZero() {
	fabmo.runSBP('C3\n');
}

function doMeasureTool() {
	fabmo.runSBP('C102\n');
}

function initToolTable() {
	var toolTable = document.getElementById('table-tools');
	toolTable.innerHTML = '';
	TOOLS.forEach(function(i) {

		var tool = document.createElement('tr');
		tool.id = 'tool-' + i + '-row';
		// Tool ID
		var numCell = document.createElement('th');
		numCell.innerHTML = '' + i;
		tool.appendChild(numCell);

		// X Location
		var x = document.createElement('td');
		x.id = 'tool' + i + '-x';
		x.innerHTML = '';
		tool.appendChild(x);

		// Y Location
		var y = document.createElement('td');
		y.id = 'tool' + i + '-y';
		y.innerHTML = '';
		tool.appendChild(y);

		// Tool length (distance to prox)
		var length = document.createElement('td');
		length.id = 'tool' + i + '-length';
		length.innerHTML = '';
		tool.appendChild(length);

		// Button for tool pickup
		var controls = document.createElement('td');
		controls.style = "width: 1%"
		controls.innerHTML = '<a id="pickup-' + i + '-button" class="button noselect">Pick Up</a>';
		var pickup = function(evt) {
			pickupTool(i);
		}
		controls.firstElementChild.addEventListener('click',pickup);

		tool.appendChild(controls);
		toolTable.appendChild(tool);
	});

	document.getElementById('btn-back-tools').addEventListener('click', function(evt) {
		goHome();
	});

	document.getElementById('btn-measure-tool').addEventListener('click', function(evt) {
		doMeasureTool();
	});

}

function updateToolTable() {
	fabmo.getConfig(function(err, config) {
		if(err) { 
			log.error("Problem getting config: " + err)
		}
		
		var vars = config.opensbp.variables;
		TOOLS.forEach(function(i) {
			var row = document.getElementById('tool-' + i + '-row');
			var button = document.getElementById('pickup-' + i + '-button')
			if(vars['CurrentTool'] == i) {
				row.className = 'is-selected';
				button.style.display = 'none ';
			} else {
				row.className = '';
				button.style.display = 'block';
			}

			var x = document.getElementById('tool' + i + '-x');
			x.innerHTML = vars['Tool' + i + 'X'].toFixed(3);

			var y = document.getElementById('tool' + i + '-y');
			y.innerHTML = vars['Tool' + i + 'Y'].toFixed(3);

			var length = document.getElementById('tool' + i + '-length');
			length.innerHTML = vars['Tool' + i + 'Length'].toFixed(3);

		});

	});
}

function initMenu() {
	document.getElementById('menu-tools').addEventListener('click', function(evt) {
		goToolList();
	});

	document.getElementById('menu-calibrate').addEventListener('click', function(evt) {
		doCalibrate();
	});

	document.getElementById('menu-home').addEventListener('click', function(evt) {
		doHome();
	});

	document.getElementById('menu-zzero').addEventListener('click', function(evt) {
		doZZero();
	});

}
function init(options) {
	options = options || {};

	initToolTable();
	updateToolTable();
	initMenu();
	showScreen('screen-home');

	fabmo.on('status', function(status) {
		if(status['state'] == 'idle') {
			updateToolTable();
		}
	})
}
