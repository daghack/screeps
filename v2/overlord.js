var Overlord = function Overlord() {
	if (!Memory.overlord) {
		initialize_overlord();
	}
};

function initialize_overlord() {
	console.log("Initializing Overlord");
	Memory.overlord = {};
};

Overlord.tick = function() {
};

module.exports = Overlord;
