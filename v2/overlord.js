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

Overlord.tick = function() {
	console.log("Overlord Tick");
	_.remove(Memory.overlord.registered_spawns, function(id) {
		var spawn = Game.getObjectById(id);
		if (!spawn) {
			return true;
		}
		this.run_spawn(spawn);
		return false;
	});
};

Overlord.run_spawn = function(spawn) {
};

Overlord.is_spawn_registered = function(id) {
	return !_.includes(Memory.overlord.registered_spawns, id);
};

Overlord.register_spawn = function(spawn, id) {
	if (this.is_spawn_registered(id)) {
		console.log("Registering Spawn: " + id);
		Memory.overlord.registered_spawns.push(id);
	}
};

Overlord.register_creep = function(creep, id) {
};

Overlord.register_flag = function(flag, flag_name) {
};

Overlord.register_structure = function(structure, id) {
	switch(structure.structureType) {
		case STRUCTURE_SPAWN:
			this.register_spawn(structure, id);
			break;
		default:
			break;
	}
};

module.exports = {"Overlord": Overlord};
