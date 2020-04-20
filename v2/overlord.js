var Overlord = function Overlord() {
	if (!Memory.overlord) {
		initialize_overlord();
	}
};

function initialize_overlord() {
	console.log("Initializing Overlord");
	Memory.overlord = {
		registered_spawns: [],
	};
};

Overlord.prototype.tick = function() {
	console.log("Overlord Tick");
};

Overlord.prototype.register_spawn = function(spawn) {
	if (!_.includes(Memory.overlord.registered_spawns, spawn.id)) {
		console.log("Registering Spawn: " + spawn.id);
		Memory.overlord.registered_spawns.push(spawn.id);
	}
};

module.exports = Overlord;
