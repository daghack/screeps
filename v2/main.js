require('manager');

function restart_memory() {
	Memory = _.mapObject(Memory, function(val, key) {
		return {};
	});
};

module.exports.loop = function() {
	if (Memory.restart_memory) {
		restart_memory();
	}
	Memory.restart_memory = false;
};
