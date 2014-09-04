function GameObjectsFactory() {}

GameObjectsFactory.prototype.typeMap = {
	'blueTank': BlueTank,
	'greenTank': GreenTank
};

GameObjectsFactory.prototype.createObject = function(type, id) {
	return new this.typeMap[type](id);
};