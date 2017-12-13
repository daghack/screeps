var NONE = "none";
var HARVEST = "harvest";
var UPGRADE = "upgrade";

Creep.prototype.upgradeRoom = function(room) {
		if (this.upgradeController(room.controller) == ERR_NOT_IN_RANGE) {
			this.moveTo(room.controller, {visualizePathStyle:{}});
		}
}

Creep.prototype.harvestRoom = function(room) {
	var sources = room.find(FIND_SOURCES);
	if (this.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		this.moveTo(sources[0], {visualizePathStyle:{}});
	}
};

Creep.prototype.set_task = function(task) {
	this.memory["task"] = task;
};

Creep.prototype.get_task = function() {
	if (!this.memory["task"]) {
		return NONE;
	}
	return this.memory["task"];
};

Creep.prototype.empty = function() {
	return _.sum(this.carry) == 0;
};

Creep.prototype.full = function() {
	return _.sum(this.carry) == this.carryCapacity;
};

Creep.prototype.transition = function() {
	if (this.empty()) {
		this.set_task(HARVEST);
	} else if (this.full()) {
		this.set_task(UPGRADE);
	}
};

Creep.prototype.action = function(room) {
	if (this.get_task() == HARVEST) {
		this.harvestRoom(room)
	} else if (this.get_task() == UPGRADE) {
		this.upgradeRoom(room)
	}
};

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
