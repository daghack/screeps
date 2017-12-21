Room.prototype.sources = function() {
	return this.find(FIND_SOURCES);
};

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

Room.prototype.cost_matrix = function(ignore_creeps) {
	if(!this._cost_matrix) {
		let cmatrix = new PathFinder.CostMatrix();
		this.find(FIND_STRUCTURES).forEach(function(struct) {
			if (struct.structureType == STRUCTURE_ROAD) {
				cmatrix.set(struct.pos.x, struct.pos.y, 1);
			} else if (struct.structureType != STRUCTURE_CONTAINER &&
				(struct.structureType != STRUCTURE_RAMPART || !struct.my)) {
				cmatrix.set(struct.pos.x, struct.pos.y, 255);
			}
		});
		this.find(FIND_CONSTRUCTION_SITES).forEach(function(struct) {
			if (struct.structureType == STRUCTURE_ROAD) {
				cmatrix.set(struct.pos.x, struct.pos.y, 1);
			} else if (struct.structureType != STRUCTURE_CONTAINER &&
				(struct.structureType != STRUCTURE_RAMPART || !struct.my)) {
				cmatrix.set(struct.pos.x, struct.pos.y, 255);
			}
		});
		_.forEach(this.sources(), source => {
			_.forEach(source.slots, slot => {
				cmatrix.set(slot.x, slot.y, 50);
			});
		});
		let cmatrix_creeps = cmatrix.clone();
		let room_creeps = this.find(FIND_CREEPS);
		_.forEach(room_creeps, creep => {
			cmatrix_creeps.set(creep.pos.x, creep.pos.y, 50);
		});
		this._cost_matrix = cmatrix;
		this._cost_matrix_creeps = cmatrix_creeps;
	}
	if (ignore_creeps) {
		return this._cost_matrix;
	} else {
		return this._cost_matrix_creeps;
	}
};
