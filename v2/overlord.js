class Overlord {
	constructor() {
		if (!Memory.overlord) {
			console.log("Initializing Overlord");
			Memory.overlord = {
				registered_spawns: [],
			};
		}
	}

	tick() {
		console.log("Overlord Tick");
		_.remove(Memory.overlord.registered_spawns, function(id) {
			var spawn = Game.getObjectById(id);
			if (!spawn) {
				return true;
			}
			this.run_spawn(spawn);
			return false;
		});
	}

	run_spawn(spawn) {
	}

	is_spawn_registered(id) {
		return !_.includes(Memory.overlord.registered_spawns, id);
	}

	register_spawn(spawn, id) {
		if (this.is_spawn_registered(id)) {
			console.log("Registering Spawn: " + id);
			Memory.overlord.registered_spawns.push(id);
		}
	}

	register_creep(creep, id) {
	}

	register_flag(flag, id) {
	}

	register_structure(structure, id) {
		switch(structure.structureType) {
			case STRUCTURE_SPAWN:
				this.register_spawn(structure, id);
				break;
			default:
				break;
		}
	}
};


module.exports = {"Overlord": Overlord};
