var Overlord = require('overlord');

function restart_memory() {
	Memory = _.forEach(Memory, function(val, key, mem) {
		return mem[key] = {};
	});
	delete Memory.overlord;
	Memory.restart_memory = false;
};

var overlord = new Overlord();

module.exports.loop = function() {
	if (Memory.restart_memory) {
		restart_memory();
	}
	overlord.tick();
	_.each(Game.spawns, overlord.register_spawn);
};