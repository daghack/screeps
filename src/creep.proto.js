memory_property(Creep.prototype, 'assigned', false);
memory_property(Creep.prototype, 'assigned_to', NONE);
memory_property(Creep.prototype, 'task', NONE);
memory_property(Creep.prototype, 'target', NONE);
memory_property(Creep.prototype, 'work_order', Object, true);
memory_property(Creep.prototype, 'move_status', true);
memory_property(Creep.prototype, 'last_pos', Object, true);

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
					if (opts && opts.ignore_creeps) {
						return Game.rooms[roomname].cost_matrix();
					} else {
						return Game.rooms[roomname].cost_matrix(true);
					}
				}
			}
		}
	);
	if (ret.incomplete) {
		return ERR_NO_PATH;
	}
	this.room.visual.poly(ret.path, {stroke : 'aqua', lineStyle : 'dashed', strokeWidth : 0.5});
	let pos = ret.path[0];
	let err = this.move(this.pos.getDirectionTo(pos));
	return err;
};

Creep.prototype.travelTo = function(t) {
	let err = OK;
	if (this.move_status && this.last_pos.x == this.pos.x && this.last_pos.y == this.pos.y) {
		err = this.travelToFunc(t, {ignore_creeps : false});
	} else {
		err = this.travelToFunc(t);
	}
	if (err == OK) {
		this.move_status = true;
	} else {
		this.move_status = false;
	}
	this.last_pos = this.pos;
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
