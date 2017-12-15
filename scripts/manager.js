var Manager = function Manager(name, update_interval) {
	this.name = name;
	this.update_interval = update_interval;
};
add_memory(Manager.prototype, 'managers', manager => manager.name);
memory_property(Manager.prototype, 'initialized', false);
memory_property(Manager.prototype, 'buildset', Object, true);
memory_property(Manager.prototype, 'sources', Array, true);
memory_property(Manager.prototype, 'creeps', Object, true);
memory_property(Manager.prototype, 'spawners', Array, true);

Manager.prototype.initialize = function(room) {
	if (this.initialized) {
		return;
	}
	console.log("Initializing Manager");
	let sources = room.find(FIND_SOURCES);
	_.forEach(sources, source => {
		source.init(this);
		this.sources.push(source.id);
		let cpath = source.pos.findPathTo(room.controller, {ignoreCreeps : true, ignoreRoads : true});
		_.forEach(cpath, pos => {
			this.schedule_build(room, STRUCTURE_ROAD, pos);
		});
	});
	_.forEach(Game.spawns, spawner => {
		this.spawners.push(spawner.name);
	});
	sources[0].schedule_harvester(this);
	_.forEach(Game.spawns, spawner => {
		spawner.haulers = {number_requested : 0, names : []};
		spawner.builders = {number_requested : 0, names : []};
		spawner.upgraders = {number_requested : 0, names : []};
		spawner.schedule_hauler(this);
		spawner.schedule_builder(this);
		_.forEach(sources, source => {
			let spath = spawner.pos.findPathTo(source, {ignoreCreeps : true, ignoreRoads : true});
			_.forEach(spath, pos => {
				this.schedule_build(spawner.room, STRUCTURE_ROAD, pos);
			});
		});
		let cpath = spawner.pos.findPathTo(spawner.room.controller, {ignoreCreeps : true, ignoreRoads : true});
		_.forEach(cpath, pos => {
			this.schedule_build(spawner.room, STRUCTURE_ROAD, pos);
		});
	});
	this.initialized = true;
};

Manager.prototype.schedule_build = function(room, struct, poslike) {
	let pos = new RoomPosition(poslike.x, poslike.y, room.name);
	let pos_str = pos.to_str();
	if (!this.buildset[pos_str]) {
		this.buildset[pos_str] = {x : pos.x, y : pos.y, room : pos.roomName, struct : struct};
	}
};

Manager.prototype.tick = function() {
	console.log("Manager Tick");
	if (Game.time % this.update_interval == 0) {
		console.log("Manager Update");
	}

	let todel = [];
	_.forEach(this.buildset, (build_order, key) => {
		let room = Game.rooms[build_order.room];
		if (room.createConstructionSite(build_order.x, build_order.y, build_order.struct) == OK) {
			todel.push(key);
		} else {
			room.visual.circle(build_order,
				{fill : 'transparent', lineStyle : 'dashed', radius : 0.4, stroke : 'white'}
			);
		}
	});
	_.forEach(todel, key => delete this.buildset[key]);

	_.forEach(this.sources, source_id => {
		let source = Game.getObjectById(source_id);
		source.tick(this);
	});
	_.forEach(this.spawners, spawner_name => {
		let spawn = Game.spawns[spawner_name];
		spawn.tick();
	});
};

Manager.prototype.schedule_creep = function(name, body, opts) {
	let minscore = 1000000;
	let selected_spawn = "";
	_.forEach(this.spawners, function(spawner_name) {
		let piq = Game.spawns[spawner_name].parts_in_queue();
		if (piq < minscore) {
			minscore = piq;
			selected_spawn = spawner_name;
		}
	});
	if (selected_spawn == "") {
		return -1;
	}
	Game.spawns[selected_spawn].add_to_queue(name, body, opts);
	return 0;
};

memory_property(StructureSpawn.prototype, 'spawn_queue', Array, true);
memory_property(StructureSpawn.prototype, 'haulers', Object, true);
memory_property(StructureSpawn.prototype, 'upgraders', Object, true);
memory_property(StructureSpawn.prototype, 'builders', Object, true);

StructureSpawn.prototype.add_to_queue = function(name, body, opts) {
	this.spawn_queue.push({name : name, body : body, opts : opts});
	return this.parts_in_queue();
};

StructureSpawn.prototype.parts_in_queue = function() {
	return _.sum(this.spawn_queue, body => body.length);
};

StructureSpawn.prototype.tick = function() {
	console.log("Spawner " + this.name + " Tick");
	let toremove = [];
	_.forEach(this.haulers.names, hauler_name => {
		let creep = Game.creeps[hauler_name];
		if (creep) {
			this.tick_hauler(creep);
		} else {
			toremove.push(hauler_name);
		}
	});
	_.forEach(toremove, hauler_name => {
		_.remove(this.haulers, val => val == hauler_name);
	});
	toremove = [];
	_.forEach(this.builders.names, builder_name => {
		let creep = Game.creeps[builder_name];
		if (creep) {
			this.tick_builder(creep);
		} else {
			toremove.push(builder_name);
		}
	});
	_.forEach(toremove, builder_name => {
		_.remove(this.builders, val => val == builder_name);
	});
	if (this.spawning) {
		let creep = Game.creeps[this.spawning.name];
		if (creep && !creep.assigned) {
			let owner = Game.getObjectById(creep.assigned_to); owner.assign_worker(creep);
		}
		return;
	}
	if (!this.isActive() || this.spawn_queue.length == 0) {
		return;
	}
	let next_spawn = this.spawn_queue[0];
	if (this.spawnCreep(next_spawn.body, next_spawn.name, next_spawn.opts) == OK) {
		this.spawn_queue.shift();
	}
};

StructureSpawn.prototype.assign_worker = function(worker) {
	if (worker.assigned) {
		return;
	}
	let worker_type = worker.name.split("_")[0];
	if (worker_type == "HAULER") {
		this.haulers.names.push(worker.name);
		this.haulers.number_requested -= 1;
	} else if (worker_type == "BUILDER") {
		this.builders.names.push(worker.name);
		this.builders.number_requested -= 1;
	} else if (worker_type == "UPGRADER") {
		this.upgraders.names.push(worker.name);
		this.upgraders.number_requested -= 1;
	}
	worker.assigned = true;
};

StructureSpawn.prototype.schedule_hauler = function(manager) {
	let name = "HAULER_" + _.random(0, Number.MAX_SAFE_INTEGER);
	manager.schedule_creep(name, [CARRY, CARRY, MOVE], {memory : {assigned_to : this.id}});
	this.haulers.number_requested += 1;
};

StructureSpawn.prototype.schedule_builder = function(manager) {
	let name = "BUILDER_" + _.random(0, Number.MAX_SAFE_INTEGER);
	manager.schedule_creep(name, [CARRY, WORK, MOVE, MOVE], {memory : {assigned_to : this.id}});
	this.builders.number_requested += 1;
};

StructureSpawn.prototype.schedule_upgrader = function(manager) {
	let name = "UPGRADER_" + _.random(0, Number.MAX_SAFE_INTEGER);
	manager.schedule_creep(name, [CARRY, WORK, MOVE, MOVE], {memory : {assigned_to : this.id}});
	this.upgraders.number_requested += 1;
};

StructureSpawn.prototype.tick_hauler = function(creep) {
	if (creep.full()) {
		creep.task = 'return';
	} else if (creep.empty()) {
		creep.task = 'gather';
	}
	if (creep.task == 'return') {
		if (creep.transfer(this, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(this);
		}
	} else if (creep.task == 'gather') {
		let targ = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
		if (targ) {
			if (creep.pickup(targ) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targ);
			}
		}
	}
};

StructureSpawn.prototype.tick_builder = function(creep) {
	if (creep.full()) {
		creep.task = 'build';
	} else if (creep.empty()) {
		creep.task = 'gather';
	}
	if (creep.task == 'build') {
		let targ = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
		if (targ) {
			if (creep.build(targ) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targ);
			}
		}
		let targ2 = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
		if (targ2) {
			creep.pickup(targ2);
		}
	} else if (creep.task == 'gather') {
		let targ = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
		if (targ) {
			if (creep.pickup(targ) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targ);
			}
		}
		let targ2 = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
		if (targ2) {
			creep.build(targ2);
		}
	}
};

module.exports = {
	Manager : Manager
};
