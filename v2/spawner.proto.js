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

StructureSpawn.prototype.tick_builder = function(creep, manager) {
	let retarget = false;
	if (!creep.work_order.target || !Game.getObjectById(creep.work_order.target)) {
		retarget = true;
	}
	if (retarget) {
		let closest_site = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
		if (closest_site) {
			creep.work_order = {target : closest_site.id, action : 'build'};
		} else {
			//Repair shit?
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
	//if (creep.full()) {
	//	creep.task = 'upgrade';
	//	creep.cache_index = creep.cached_path.length;
	//} else if (creep.empty()) {
	//	creep.task = 'gather';
	//	creep.cache_index = creep.cached_path.length;
	//}
	//if (creep.task == 'upgrade') {
	//	if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
	//		creep.travelTo(creep.room.controller);
	//	}
	//} else if (creep.task == 'gather') {
	//	let targ = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
	//	if (targ) {
	//		if (creep.pickup(targ) == ERR_NOT_IN_RANGE) {
	//			creep.travelTo(targ);
	//		}
	//	}
	//}
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
