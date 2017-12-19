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
