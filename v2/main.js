require('manager');

function restart_memory() {
	Memory = _.forEach(Memory, function(val, key, mem) {
		return mem[key] = {};
	});
};

module.exports.loop = function() {
	if (Memory.restart_memory) {
		restart_memory();
	}
	Memory.restart_memory = false;
};
