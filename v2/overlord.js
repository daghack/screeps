class Overlord {
	constructor() {
		self = this;
		if (!Memory.overlord) {
			console.log("Initializing Overlord");
			Memory.overlord = {
				registered_spawns: [],
				registered_creeps: [],
				registered_flags: [],
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
			self.run_spawn(spawn);
			return false;
		});
	}

	run_spawn(spawn) {
	}

	is_spawn_registered(id) {
		return !_.includes(Memory.overlord.registered_spawns, id);
	}

	register_spawn(spawn, id) {
		if (self.is_spawn_registered(id)) {
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
				self.register_spawn(structure, id);
				break;
			default:
				break;
		}
	}
};


module.exports = {"Overlord": Overlord};
