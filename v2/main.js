require('overlord');

function restart_memory() {
	Memory = _.forEach(Memory, function(val, key, mem) {
		return mem[key] = {};
	});
	delete Memory.overlord;
	Memory.restart_memory = false;
};

overlord = new Overlord();

module.exports.loop = function() {
	if (Memory.restart_memory) {
		restart_memory();
	}
	overlord.tick();
};
