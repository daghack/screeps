var Manager = function Manager(name, update_interval) {
	this.name = name;
	this.update_interval = update_interval;
};
add_memory(Manager.prototype, 'managers', manager => manager.name);
//memory_property(Manager.prototype, 'rooms', Object, true);
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
	});
	_.forEach(Game.spawns, spawner => {
		this.spawners.push(spawner.name);
	});
	sources[0].schedule_harvester(this);
	_.forEach(Game.spawns, spawner => {
		spawner.schedule_hauler(this);
	});
	this.initialized = true;
};

Manager.prototype.tick = function() {
	console.log("Manager Tick");
	if (Game.time % this.update_interval == 0) {
		console.log("Manager Update");
	}
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
memory_property(StructureSpawn.prototype, 'haulers', Array, true);

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
	_.forEach(this.haulers, hauler_name => {
		let creep = Game.creeps[hauler_name];
		if (creep) {
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
		} else {
			toremove.push(hauler_name);
		}
	});
	_.forEach(toremove, hauler_name => {
		_.remove(this.haulers, val => val == hauler_name);
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

StructureSpawn.prototype.assign_worker = function(hauler) {
	if (hauler.assigned) {
		return;
	}
	this.haulers.push(hauler.name);
	hauler.assigned = true;
};

StructureSpawn.prototype.schedule_hauler = function(manager) {
	let name = "HAULER" + _.random(0, Number.MAX_SAFE_INTEGER);
	manager.schedule_creep(name, [CARRY, MOVE], {memory : {assigned_to : this.id}});
};

module.exports = {
	Manager : Manager
};
