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

Overlord.prototype.register_spawn = function(spawn, id) {
	if (!_.includes(Memory.overlord.registered_spawns, id)) {
		console.log("Registering Spawn: " + id);
		Memory.overlord.registered_spawns.push(id);
	}
};

Overlord.prototype.register_creep = function(creep, id) {
};

Overlord.prototype.register_flag = function(flag, flag_name) {
};

Overlord.prototype.register_structure = function(structure, id) {
	switch(structure.structureType) {
		case STRUCTURE_SPAWN:
			this.register_spawn(structure, id);
			break;
		default:
			break;
	}
};

module.exports = Overlord;
