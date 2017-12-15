function Manager(name) {
	this.name = name;
}
add_memory(Manager.prototype, 'managers', manager => manager.name);
memory_property(Manager.prototype, 'buildset', Object, true);
