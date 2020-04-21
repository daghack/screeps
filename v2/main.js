var ov = require('overlord');

function restart_memory() {
	console.log("MEMORY RESTARTED");
	Memory = _.forEach(Memory, function(val, key, mem) {
		return mem[key] = {};
	});
	delete Memory.overlord;
	Memory.restart_memory = false;
	overlord = new ov.Overlord();
};

function clean_memory() {
};

var overlord = new ov.Overlord();

module.exports.loop = function() {
	if (Memory.restart_memory) {
		restart_memory();
	}
	_.each(Game.structures, overlord.register_structure);
	_.each(Game.creeps, overlord.register_creep);
	_.each(Game.flags, overlord.register_flag);
	overlord.tick();
};
