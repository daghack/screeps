memory_property(Creep.prototype, 'assigned', false);
memory_property(Creep.prototype, 'assigned_to', NONE);
memory_property(Creep.prototype, 'task', NONE);
memory_property(Creep.prototype, 'target', NONE);
memory_property(Creep.prototype, 'work_order', Object, true);
memory_property(Creep.prototype, 'scheduled_withdraw', Object, true);
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
	if (!t) {
		return [];
	}
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
	this.cached_path = path;
	this.cache_index = 0;
};

Creep.prototype.travelTo = function(t) {
	if (this.move_status && this.last_pos.x == this.pos.x && this.last_pos.y == this.pos.y) {
		this.recache_path(t, false);
	} else if (this.cache_index >= this.cached_path.length) {
		this.recache_path(t, true);
	}
	this.room.visual.poly(this.cached_path.slice(this.cache_index),
		{stroke : 'aqua', lineStyle : 'dashed', strokeWidth : 0.5, opacity : 0.3}
	);
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
		return [];
	}
};

Creep.prototype.perform_work_order = function(manager) {
	if (this.empty()) {
		this.task = 'gather';
		this.scheduled_withdraw = {};
	}
	if (this.task == 'gather') {
		if (!this.scheduled_withdraw.source_id) {
			this.scheduled_withdraw = manager.schedule_withdraw(this, this.carryCapacity);
		}
		let source = Game.getObjectById(this.scheduled_withdraw.source_id);
		let highest_slot = _.sortByOrder(source.slots, ['energy_available'], ['desc'])[0];
		let slot_room_pos = new RoomPosition(highest_slot.x, highest_slot.y, highest_slot.roomName);
		if (this.pos.isNearTo(slot_room_pos)) {
			let energy = slot_room_pos.lookFor(LOOK_ENERGY)[0];
			this.pickup(energy);
		} else {
			this.travelTo(slot_room_pos);
		}
		let total_held = _.sum(this.carry);
		if (this.scheduled_withdraw.amount >= total_held) {
			this.task = 'perform';
		}
	} else {
		if (this.work_order) {
			let t = Game.getObjectById(this.work_order.target);
			if (this.pos.isNearTo(t)) {
				this[this.work_order.action](t);
			} else {
				this.travelTo(t);
			}
		} else {
			//Default Action?
		}
	}
};

Creep.prototype.transfer_energy = function(spawn) {
	return this.transfer(spawn, RESOURCE_ENERGY);
};
