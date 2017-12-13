Creep.prototype.moveTowards = function(target) {
	if (this.getRangeTo(target) > 1) {
		this.moveTo(target);
	}
};

Creep.prototype.upgrade = function(room) {
		if (creep.upgradeController(room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(room.controller);
		}
}

Source.prototype.slots = function() {
	return this.room.adjacent_plains(this.pos);
};

Room.prototype.sources = function() {
	return this.find(FIND_SOURCES);
};

Room.prototype.adjacent_plains = function(pos) {
	let top_b = Math.max(0, pos.y-1)
	let bottom_b = Math.min(49, pos.y+1)
	let left_b = Math.max(0, pos.x-1)
	let right_b = Math.min(49, pos.x+1)
	let area = this.lookAtArea(top_b, left_b, bottom_b, right_b, true);
	return _.filter(area, {type : 'terrain', terrain: 'plain'});
};

function clean_memory() {
	_.forEach (Memory.creeps, (creep, name) => {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	});
};

module.exports.loop = function () {
	clean_memory()
	_.forEach (Game.creeps, creep => {
		var sources = creep.room.find(FIND_SOURCES);
		for (let source of sources) {
			console.log(source.slots().length);
		}
		if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(sources[0]);
		}
	});
};
