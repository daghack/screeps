global.NONE = 'none';
global.HARVEST = 'harvest';
global.UPGRADE = 'upgrade';
global.SPAWNFILL = 'spawnfill';

function to_str(pos) {
	return pos.x + '_' + pos.y;
}

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

Object.defineProperty(Creep.prototype, 'task', {
	get : function() {
		if (!this.memory.task) {
			return NONE;
		}
		return this.memory.task;
	},
	set : function(t) {
		this.memory.task = t;
	}
});

Object.defineProperty(Creep.prototype, 'role', {
	get : function() {
		if (!this.memory.role) {
			return NONE;
		}
		return this.memory.role;
	},
	set : function(r) {
		this.memory.role = r;
	}
});

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

Source.prototype.slots = function() {
	return this.room.adjacent_plains(this.pos);
};

Room.prototype.sources = function() {
	return this.find(FIND_SOURCES);
};

Object.defineProperty(Room.prototype, 'buildlist', {
	get : function() {
		if (!this.memory.buildlist) {
			this.memory.buildlist = {};
		}
		return this.memory.buildlist;
	},
	set : function(x) {
		this.memory.buildlist = x;
	},
	writeable : true
});

Room.prototype.add_to_build = function(position, structure) {
	let index = to_str(position);
	if (!this.buildlist[index]) {
		this.buildlist[index] = { x : position.x, y : position.y, struct : structure };
	}
};

Room.prototype.adjacent_plains = function(pos) {
	let top_b = Math.max(0, pos.y-1);
	let bottom_b = Math.min(49, pos.y+1);
	let left_b = Math.max(0, pos.x-1);
	let right_b = Math.min(49, pos.x+1);
	let area = this.lookAtArea(top_b, left_b, bottom_b, right_b, true);
	return _.filter(area, {type : 'terrain', terrain: 'plain'});
};

Object.defineProperty(StructureSpawn.prototype, 'creep_count', {
	get : function() {
		if(!this.memory.creep_count) {
			return 0;
		}
		return this.memory.creep_count;
	},
	set : function(x) {
		this.memory.creep_count = x;
	}
});

StructureSpawn.prototype.spawn = function(role) {
	let ret = this.spawnCreep(role.parts, role.role + '_' + this.creep_count, {memory : {role : role.role}});
	if (ret == OK) {
		this.creep_count += 1;
	}
	return ret;
};

StructureSpawn.prototype.add_initial_build_orders = function() {
	if (!this.memory.road_orders_issued) {
		let sources = this.room.find(FIND_SOURCES);
		_.forEach(sources, source => {
			let spath = this.pos.findPathTo(source, {ignoreCreeps : true, ignoreRoads : true});
			_.forEach(spath, position => {
				this.room.add_to_build(position, STRUCTURE_ROAD);
			});
			let cpath = this.pos.findPathTo(this.room.controller, {ignoreCreeps : true, ignoreRoads : true});
			_.forEach(cpath, position => {
				this.room.add_to_build(position, STRUCTURE_ROAD);
			});
		});
		this.memory.road_orders_issued = true;
	}
	return OK;
};

Room.prototype.buildlist_visual = function() {
	_.forEach(this.buildlist, position => {
		this.visual.circle(position, {fill : 'transparent', lineStyle : 'dashed', radius : 0.5, stroke : 'white'});
	});
};
