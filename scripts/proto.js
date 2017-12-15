global.NONE = 'none';
global.HARVEST = 'harvest';
global.UPGRADE = 'upgrade';
global.SPAWNFILL = 'spawnfill';
global.memory_property = function(obj, key, def, is_constructor) {
	Object.defineProperty(obj, key, {
		get : function() {
			if (!this.memory[key]) {
				if(is_constructor) {
					// Because defineProperty only ever is called once, def will by default be a shared object.
					// For constants this is fine, but if we want a list or object, we need to pass in the constructor.
					// This will cause def to be the constructor so that each time we fetch,
					// if we don't already have something at that key in the memory, we'll generate the new object.
					this.memory[key] = new def();
				} else {
					this.memory[key] = def;
				}
			}
			return this.memory[key];
		},
		set : function(x) {
			this.memory[key] = x;
		}
	});
};

global.add_memory = function(obj, tag, unique_id) {
	if (!Memory[tag]) {
		Memory[tag] = {};
	}
	Object.defineProperty(obj, 'memory', {
		get : function() {
			let obj_id = unique_id(obj);
			if (!Memory[tag][obj_id]) {
				Memory[tag][obj_id] = {};
			}
			return Memory[tag][obj_id];
		},
		set : function(x) {
			Memory[tag][unique_id(obj)] = x;
		}
	})
};

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

memory_property(Creep.prototype, 'task', NONE);
memory_property(Creep.prototype, 'self_managed', false);
memory_property(Creep.prototype, 'role', NONE);

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

Room.prototype.sources = function() {
	return this.find(FIND_SOURCES);
};

memory_property(Room.prototype, 'buildlist', Object, true);

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

memory_property(StructureSpawn.prototype, 'creep_count', 0);

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
			let cpath = source.pos.findPathTo(this.room.controller, {ignoreCreeps : true, ignoreRoads : true});
			_.forEach(cpath, position => {
				this.room.add_to_build(position, STRUCTURE_ROAD);
			});
		});
		let cpath = this.pos.findPathTo(this.room.controller, {ignoreCreeps : true, ignoreRoads : true});
		_.forEach(cpath, position => {
			this.room.add_to_build(position, STRUCTURE_ROAD);
		});
		this.memory.road_orders_issued = true;
	}
};

Room.prototype.buildlist_visual = function() {
	_.forEach(this.buildlist, position => {
		this.visual.circle(position, {fill : 'transparent', lineStyle : 'dashed', radius : 0.5, stroke : 'white'});
	});
};
