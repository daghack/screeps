memory_property(Creep.prototype, 'assigned', false);
memory_property(Creep.prototype, 'assigned_to', NONE);
memory_property(Creep.prototype, 'task', NONE);
memory_property(Creep.prototype, 'target', NONE);
memory_property(Creep.prototype, 'order', NONE);

Creep.prototype.upgradeRoom = function(room) {
	if (this.upgradeController(room.controller) == ERR_NOT_IN_RANGE) {
		this.moveTo(room.controller, {visualizePathStyle:{}});
	}
};

Creep.prototype.harvestRoom = function(room) {
	var sources = room.find(FIND_SOURCES);
	if (this.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		this.moveTo(sources[0], {visualizePathStyle:{}});
	}
};

Creep.prototype.spawnfillRoom = function(room) {
	var spawns = room.find(FIND_MY_STRUCTURES, {filter : {structureType : STRUCTURE_SPAWN}});
	if (this.transfer(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		this.moveTo(spawns[0], {visualizePathStyle:{}});
	}
};

Creep.prototype.empty = function() {
	return _.sum(this.carry) == 0;
};

Creep.prototype.full = function() {
	return _.sum(this.carry) == this.carryCapacity;
};

Creep.prototype.action = function(room, roles, default_module) {
	if (roles[this.role]) {
		roles[this.role].action(this, room);
	} else {
		//Default Behavior
		default_module.action(this, room);
	}
};

Creep.prototype.transition = function(room, roles, default_module) {
	if (roles[this.role]) {
		roles[this.role].transition(this, room);
	} else {
		//Default Behavior
		default_module.transition(this, room);
	}
};
