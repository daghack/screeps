var Manager = function Manager(name, update_interval) {
	this.name = name;
	this.update_interval = update_interval;
}
add_memory(Manager.prototype, 'managers', manager => manager.name);
//memory_property(Manager.prototype, 'rooms', Object, true);
memory_property(Manager.prototype, 'buildset', Object, true);
memory_property(Manager.prototype, 'sources', Array, true);
memory_property(Manager.prototype, 'creeps', Object, true);
memory_property(Manager.prototype, 'spawners', Array, true);

Manager.prototype.initialize = function(room) {
	let sources = room.find(FIND_SOURCES);
	_.forEach(sources, source => {
		source.init(this);
	});
};

Manager.prototype.tick = function() {
	if (Game.time % this.update_interval == 0) {
		console.log("Manager Update");
	}
	_.forEach(this.sources, source => {
		source.tick(manager);
	});
	_.forEach(this.spawners, spawner => {
		spawner.tick();
	});
};

Manager.prototype.schedule_creep = function(name, body, opts) {
	let minscore = 1000000;
	let selected_spawn = "";
	_.forEach(this.spawners, spawner => {
		let piq = spawner.parts_in_queue();
		if (piq < minscore) {
			minscore = piq;
			selected_spawn = spawner.name;
		}
	});
	Game.spawns[selected_spawn].add_to_queue(name, body, opts);
};

memory_property(StructureSpawn.prototype, 'spawn_queue', Array, true);

StructureSpawn.prototype.add_to_queue = function(name, body, opts) {
	this.spawn_queue.push({name : name, body : body, opts : opts});
	return this.parts_in_queue();
};

StructureSpawn.prototype.parts_in_queue = function() {
	return _.sum(this.spawn_queue, body => body.length);
};

StructureSpawn.prototype.tick = function() {
	if (!this.isActive() || this.spawning || this.spawn_queue.length == 0) {
		return;
	}
	let next_spawn = this.spawn_queue[0];
	if (this.spawnCreep(next_spawn.body, next_spawn.name, next_spawn.opts) == OK) {
		this.spawn_queue.shift();
	}
};

module.exports = {
	Manager : Manager
};
