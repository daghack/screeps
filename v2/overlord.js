var Overlord = function Overlord() {
	if (!Memory.overlord) {
		initialize_overlord();
	}
};

function initialize_overlord() {
	console.log("Initializing Overlord");
	Memory.overlord = {};
};

Overlord.prototype.tick = function() {
	console.log("Overlord Tick");
};

module.exports = Overlord;
