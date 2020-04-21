var Manager = function Manager(name, update_interval) {
	this.name = name;
	this.update_interval = update_interval;
};
add_memory(Manager.prototype, 'managers', manager => manager.name);
memory_property(Manager.prototype, 'initialized', false);
memory_property(Manager.prototype, 'start_tick', 0);
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
		spawner.schedule_upgrader(this);
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
	this.start_tick = Game.time;
	this.initialized = true;
};

Manager.prototype.schedule_withdraw = function(creep, amount) {
	let richest_source_id = _.sortByOrder(this.sources, [source_id => {
		let source = Game.getObjectById(source_id);
		return source.available_resources();
	}], ['desc'])[0];
	let richest_source = Game.getObjectById(richest_source_id);
	amount = richest_source.schedule_withdraw(creep, amount);
	return {source_id : richest_source_id, amount : amount};
};

Manager.prototype.ticks_alive = function() {
	return Game.time - this.start_tick;
};

Manager.prototype.schedule_build = function(room, struct, poslike, overwrite) {
	let pos = new RoomPosition(poslike.x, poslike.y, room.name);
	let pos_str = pos.to_str();
	if (!this.buildset[pos_str] || overwrite) {
		this.buildset[pos_str] = {x : pos.x, y : pos.y, room : pos.roomName, struct : struct};
	}
};

Manager.prototype.critical_build_set = function() {
	let nrw = site => site.structureType != STRUCTURE_ROAD && site.structureType != STRUCTURE_ROAD;
	return  _.filter(this.buildset, nrw);
};

Manager.prototype.create_construction = function(build_order, key, critical) {
	let room = Game.rooms[build_order.room];
	if (room.createConstructionSite(build_order.x, build_order.y, build_order.struct) == OK) {
		return key;
	} else {
		let color = 'white';
		if (critical) {
			color = 'red';
		}
		room.visual.circle(build_order,
			{fill : 'transparent', lineStyle : 'dashed', radius : 0.4, stroke : color}
		);
	}
};

Manager.prototype.tick = function() {
	console.log("Manager Tick");
	if (Game.time % this.update_interval == 0) {
		console.log("Manager Update");
	}

	let todel = [];
	let critical = this.critical_build_set();
	_.forEach(critical, (build_order, key) => {
		let k = this.create_construction(build_order, key, true);
		if (k) {
			todel.push(k)
		}
	});
	_.forEach(todel, key => delete this.buildset[key]);

	todel = [];
	_.forEach(this.buildset, (build_order, key) => {
		let k = this.create_construction(build_order, key);
		if (k) {
			todel.push(k)
		}
	});
	_.forEach(todel, key => delete this.buildset[key]);

	_.forEach(this.sources, source_id => {
		let source = Game.getObjectById(source_id);
		source.tick(this);
	});
	_.forEach(this.spawners, spawner_name => {
		let spawn = Game.spawns[spawner_name];
		spawn.tick(this);
	});
};

Manager.prototype.schedule_creep = function(name, body, opts, body2) {
	if (body2) {
		if (this.ticks_alive() > 100) {
			body = body2;
		}
	}
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

StructureSpawn.prototype.tick = function(manager) {
	console.log("Spawner " + this.name + " Tick");
	console.log("Creep Set Hauler Tick");
	this.tick_creep_set(manager, this.haulers, 'tick_hauler', 2, 'schedule_hauler');
	console.log("Creep Set Builder Tick");
	this.tick_creep_set(manager, this.builders, 'tick_builder', 2, 'schedule_builder');
	console.log("Creep Set Upgrader Tick");
	this.tick_creep_set(manager, this.upgraders, 'tick_upgrader', 2, 'schedule_upgrader');
	if (this.spawning) {
		let creep = Game.creeps[this.spawning.name];
		if (creep && !creep.assigned) {
			let owner = Game.getObjectById(creep.assigned_to);
			owner.assign_worker(creep);
		}
		return;
	}
	if (!this.isActive() || this.spawn_queue.length == 0) {
		return;
	}
	let next_spawn = this.spawn_queue[0];
	let err = this.spawnCreep(next_spawn.body, next_spawn.name, next_spawn.opts);
	if (err == OK) {
		this.spawn_queue.shift();
	} else if (err == -3) {
		next_spawn.name = next_spawn.name + _.random(0, 1111);
		this.spawnCreep(next_spawn.body, next_spawn.name, next_spawn.opts);
	} else {
		console.log("SPAWN ERROR: ", err);
	}
};

StructureSpawn.prototype.assign_worker = function(worker) {
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
	let name = _.uniqueId("HAULER_");
	let body = [CARRY, MOVE];
	manager.schedule_creep(name, body, {memory : {assigned_to : this.id}}, [CARRY, CARRY, MOVE, MOVE]);
	this.haulers.number_requested += 1;
};

StructureSpawn.prototype.schedule_builder = function(manager) {
	let name = _.uniqueId("BUILDER_");
	let body = [WORK, CARRY, MOVE, MOVE];
	manager.schedule_creep(name, body, {memory : {assigned_to : this.id}});
	this.builders.number_requested += 1;
};

StructureSpawn.prototype.schedule_upgrader = function(manager) {
	let name = _.uniqueId("UPGRADER_");
	manager.schedule_creep(name, [CARRY, WORK, MOVE, MOVE], {memory : {assigned_to : this.id}});
	this.upgraders.number_requested += 1;
};

StructureSpawn.prototype.tick_hauler = function(creep, manager) {
	if (!creep.work_order.target) {
		creep.work_order = {target : this.id, action : 'transfer_energy'};
		creep.invalidate_path_cache();
	}
	creep.perform_work_order(manager);
};

function findClosestCritical(pos) {
	let nrw = obj => obj.structureType != STRUCTURE_ROAD && obj.structureType != STRUCTURE_WALL;
	return pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter: nrw});
}

function findClosestNonCritical(pos) {
	return pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
}

StructureSpawn.prototype.tick_builder = function(creep, manager) {
	let retarget = false;
	if (!creep.work_order.target || !Game.getObjectById(creep.work_order.target)) {
		retarget = true;
	}
	if (retarget) {
		let build_target = null;
		let closest_critical = findClosestCritical(this.pos);
		if (closest_critical) {
			build_target = closest_critical;
		} else {
			let closest_noncritical = findClosestNonCritical(this.pos);
			if (closest_noncritical) {
				build_target = closest_noncritical;
			}
		}
		if (build_target) {
			creep.work_order = {target : build_target.id, action : 'build'};
		} else {
			// Repair???
		}
		creep.invalidate_path_cache();
	}
	creep.perform_work_order(manager);
};

StructureSpawn.prototype.tick_upgrader = function(creep, manager) {
	if (!creep.work_order.target) {
		creep.work_order = {target : creep.room.controller.id, action : 'upgradeController'};
		creep.invalidate_path_cache();
	}
	creep.perform_work_order(manager);
};

StructureSpawn.prototype.tick_creep_set = function(manager, set, tick_func_key, count, schedule_func_key) {
	let toremove = [];
	_.forEach(set.names, worker_name => {
		let creep = Game.creeps[worker_name];
		if (creep) {
			if (creep.spawning) {
				return;
			}
			this[tick_func_key](creep, manager);
		} else {
			toremove.push(worker_name);
		}
	});
	_.forEach(toremove, worker_name => {
		_.remove(set.names, val => val == worker_name);
	});
	if (set.names.length + set.number_requested < count) {
		this[schedule_func_key](manager);
	}
};

module.exports = {
	Manager : Manager
};
