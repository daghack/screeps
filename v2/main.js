require('proto');
require('room.proto');
require('creep.proto');
require('source.proto');

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
};
