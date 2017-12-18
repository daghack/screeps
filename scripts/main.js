require('proto');
require('creep.proto');
require('source.proto');
var m = require('manager');

function clean_memory() {
	if (!Memory.init) {
		_.forEach(Memory, (v, k) => delete Memory[k]);
		Memory.init = true;
		return true;
	}
	_.forEach (Memory.creeps, (creep, name) => {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	});
	return false;
}

module.exports.loop = function () {
	if(clean_memory()) {
		return;
	}
	let manager = new m.Manager('main manager', 15);
	_.forEach(Game.spawns, spawn => {
		manager.initialize(spawn.room);
		manager.tick();
		return;
	});
};
