global.NONE = 'none';
global.HARVEST = 'harvest';
global.UPGRADE = 'upgrade';
global.SPAWNFILL = 'spawnfill';
global.memory_property = function(obj, key, def, is_constructor) {
	if (!obj[key]) {
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
	}
};

global.add_memory = function(obj, tag, unique_id) {
	if (!Memory[tag]) {
		Memory[tag] = {};
	}
	Object.defineProperty(obj, 'memory', {
		get : function() {
			let obj_id = unique_id(this);
			if (!Memory[tag][obj_id]) {
				Memory[tag][obj_id] = {};
			}
			return Memory[tag][obj_id];
		},
		set : function(x) {
			Memory[tag][unique_id(this)] = x;
		}
	});
};

global.to_str = function (obj) {
	return obj.x + '_' + obj.y;
};

RoomPosition.prototype.to_str = function () {
	return this.roomName + "_" + this.x + '_' + this.y;
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

Room.prototype.adjacent_nonwall = function(pos) {
	let top_b = Math.max(0, pos.y-1);
	let bottom_b = Math.min(49, pos.y+1);
	let left_b = Math.max(0, pos.x-1);
	let right_b = Math.min(49, pos.x+1);
	let area = this.lookAtArea(top_b, left_b, bottom_b, right_b, true);
	return _.filter(area, obj => {
		return obj.type == 'terrain' && obj.terrain != 'wall';
	});
};

//memory_property(StructureSpawn.prototype, 'creep_count', 0);
//
//StructureSpawn.prototype.spawn = function(role) {
//	let ret = this.spawnCreep(role.parts, role.role + '_' + this.creep_count, {memory : {role : role.role}});
//	if (ret == OK) {
//		this.creep_count += 1;
//	}
//	return ret;
//};
//
//StructureSpawn.prototype.add_initial_build_orders = function() {
//	if (!this.memory.road_orders_issued) {
//		let sources = this.room.find(FIND_SOURCES);
//		_.forEach(sources, source => {
//			let spath = this.pos.findPathTo(source, {ignoreCreeps : true, ignoreRoads : true});
//			_.forEach(spath, position => {
//				this.room.add_to_build(position, STRUCTURE_ROAD);
//			});
//			let cpath = source.pos.findPathTo(this.room.controller, {ignoreCreeps : true, ignoreRoads : true});
//			_.forEach(cpath, position => {
//				this.room.add_to_build(position, STRUCTURE_ROAD);
//			});
//		});
//		let cpath = this.pos.findPathTo(this.room.controller, {ignoreCreeps : true, ignoreRoads : true});
//		_.forEach(cpath, position => {
//			this.room.add_to_build(position, STRUCTURE_ROAD);
//		});
//		this.memory.road_orders_issued = true;
//	}
//};

Room.prototype.buildlist_visual = function() {
	_.forEach(this.buildlist, position => {
		this.visual.circle(position, {fill : 'transparent', lineStyle : 'dashed', radius : 0.5, stroke : 'white'});
	});
};
