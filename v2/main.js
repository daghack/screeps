var r = require('msg_receiver');

class SpawnerReceiver extends r.Receiver {
	constructor(spawner) {
		super(["spawn"]);
		this.spawner = spawner;
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
	overlord.broadcast("spawn", {});
};
