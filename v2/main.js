var r = require('msg_receiver');

class SpawnerReceiver extends r.Receiver {
	constructor(spawner) {
		super(["spawn", spawner.id]);
		this.spawner = spawner;
	}

	handle_msg(label, msg) {
		switch(label) {
			case "spawn":
				if (this.spawner.spawning) {
					return false;
				}
				let bodycost = _.reduce(msg.body, (sum, part) => BODYPART_COST[part] + sum, 0);
				if (bodycost > this.spawner.store.getUsedCapacity(RESOURCE_ENERGY)) {
					return false;
				}
				let name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
				let spawn_result = this.spawner.spawnCreep(msg.body, name);
				if (spawn_result == 0) {
					return true;
				} else {
					console.log(`Spawn failure: ${spawn_result}`);
					return false;
				}
			default:
		}
		return false;
	}
};

function restart_memory() {
	console.log("MEMORY RESTARTED");
	Memory = _.forEach(Memory, function(val, key, mem) {
		delete mem[key];
	});
	Memory.creeps = {};
	Memory.spawns = {};
	Memory.rooms = {};
	Memory.flags = {};
	Memory.restart_memory = false;
};

function clean_memory() {
};

module.exports.loop = function() {
	if (Memory.restart_memory) {
		restart_memory();
	}
	let overlord = new r.ParentReceiver();
	_.each(Game.spawns, function(spawn) {
		let recv = new SpawnerReceiver(spawn);
		overlord.register_receiver(recv);
	});
	overlord.broadcast("spawn", {body: [MOVE, WORK, CARRY]});
};
