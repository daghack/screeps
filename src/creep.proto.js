memory_property(Creep.prototype, 'assigned', false);
memory_property(Creep.prototype, 'assigned_to', NONE);
memory_property(Creep.prototype, 'task', NONE);
memory_property(Creep.prototype, 'target', NONE);
memory_property(Creep.prototype, 'work_order', Object, true);
memory_property(Creep.prototype, 'move_status', true);
memory_property(Creep.prototype, 'last_pos', Object, true);
memory_property(Creep.prototype, 'cached_path', Array, true);
memory_property(Creep.prototype, 'cache_index', 0);

Creep.prototype.empty = function() {
	return _.sum(this.carry) == 0;
};

Creep.prototype.full = function() {
	return _.sum(this.carry) == this.carryCapacity;
};

Creep.prototype.travelToFunc = function(t, opts) {
	let goal = {};
	if (t.pos) {
		goal = {pos : t.pos, range : 1};
	} else {
		goal = {pos : t, range : 0};
	}
	let ret = PathFinder.search(
		this.pos, goal, {
			plainCost : 2,
			swampCost : 6,
			roomCallback : roomname => {
				if (!Game.rooms[roomname]) {
					return new PathFinder.CostMatrix();
				} else {
					return Game.rooms[roomname].cost_matrix(opts && opts.ignore_creeps);
				}
			}
		}
	);
	if (ret.incomplete) {
		return [];
	} else {
		return ret.path;
	}
};

Creep.prototype.recache_path = function(t, ignore_creeps) {
	let path = this.travelToFunc(t, {ignore_creeps : ignore_creeps});
	this.room.visual.poly(path, {stroke : 'aqua', lineStyle : 'dashed', strokeWidth : 0.5, opacity : 0.3});
	this.cached_path = path;
	this.cache_index = 0;
};

Creep.prototype.travelTo = function(t) {
	if (this.cache_index >= this.cached_path.length) {
		this.recache_path(t, true);
	} else if (this.move_status && this.last_pos.x == this.pos.x && this.last_pos.y == this.pos.y) {
		this.recache_path(t, false);
	}
	let cached_pos = this.cached_path[this.cache_index];
	let room_pos = new RoomPosition(cached_pos.x, cached_pos.y, cached_pos.roomName);
	let direction = this.pos.getDirectionTo(room_pos);
	let err = this.move(direction);
	if (err == OK) {
		this.cache_index += 1;
		this.move_status = true;
	} else {
		this.move_status = false;
	}
	this.last_pos = this.pos;
	return err;
};

Creep.prototype.travelToTarget = function(opts) {
	let t = Game.getObjectById(this.target);
	if (t) {
		return this.travelTo(t);
	} else {
		return ERR_INVALID_TARGET;
	}
};

Creep.prototype.perform_work_order = function() {
	//If empty, go get energy.
	if (this.work_order) {
		let t = Game.getObjectById(this.work_order.target);
		if (this.pos.isNearTo(t)) {
			this[this.work_order.action](t);
		} else {
			this.travelTo(t);
		}
	} else {
	}
};
