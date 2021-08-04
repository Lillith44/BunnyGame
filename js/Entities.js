var player;




Entity = function (type, id, x, y, width, height, img) {
	var self = {
		type: type,
		id:id,
		x : x, 
		y : y, 
		width: width, 
		height: height,
		img: img,
		};
	self.update = function() {
		self.updatePosition();
		self.draw();
	}
	self.draw = function() {
		ctx.save();
	
		var x = self.x - player.x;
		var y = self.y - player.y;
	
	x += WIDTH/2;
	y += HEIGHT/2;
	
	x -= self.width/2;
	y -= self.height/2;
	
	ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height);
	
	ctx.restore();
	}
	
	self.getDistance= function ( entity2) {   //return distance (number)
	var vx = self.x - entity2.x;
	var vy = self.y - entity2.y;
	return Math.sqrt(vx*vx+vy*vy);
}
	self.testCollision= function (entity2){  //return if colliding (true/false)
	var rect1 = {
		x:self.x-self.width/2, 
		y:self.y-self.height/2, 
		width:self.width,
		height:self.height,
	}
	var rect2 = {
		x:entity2.x-entity2.width/2, 
		y:entity2.y-entity2.height/2, 
		width:entity2.width,
		height:entity2.height,
	}
	return textCollisionRectRect(rect1, rect2);
}
	self.updatePosition = function(){}
	return self;
	}

Actor = function (type, id, x, y, width, height,img, hp, atkSpd) {
 var self = Entity(type, id, x, y, width, height, img);
 
 self.hp = hp;
 self.hpMax = hp;
 self.attackCounter = 0;
 self.aimAngle = 0;
 self.atkSpd = atkSpd;

 self.spriteAnimCounter = 0;

 self.pressingDown = false;
 self.pressingUp = false;
 self.pressingLeft = false;
 self.pressingRight = false;
 self.maxMoveSpd = 3;
 self.draw = function() {
	ctx.save();

	var x = self.x - player.x;
	var y = self.y - player.y;

x += WIDTH/2;
y += HEIGHT/2;

x -= self.width/2;
y -= self.height/2;

var frameWidth = self.img.width/3;
var frameHeight = self.img.height/4;

var aimAngle = self.aimAngle;
if(aimAngle < 0) 
	aimAngle = 360 + aimAngle;

//if(type === 'player') 
//	console.log(type + ' aimAngle = ' + aimAngle  )

var directionMod = 2;
if(aimAngle >= 45 && aimAngle < 135)
	directionMod = 0;
else if(aimAngle >= 135 && aimAngle < 225)
	directionMod = 1;
else if(aimAngle >= 225 && aimAngle < 315)
	directionMod = 3;

var walkingMod = Math.floor(self.spriteAnimCounter) % 3;

ctx.drawImage(self.img, walkingMod*frameWidth, directionMod*frameHeight, frameWidth, frameHeight, x, y, self.width, self.height);


ctx.restore();
}
self.updatePosition = function () {
	var oldX = self.x;
	var oldY = self.y;

	//if right bumper touches a wall, you can't go right
	

	var leftBumper = {x:self.x - 5, y:self.y};
	var rightBumper = {x:self.x + 15, y:self.y};
	var upBumper = {x:self.x, y:self.y -5};
	var downBumper = {x:self.x, y:self.y +5};

	if(Maps.current.isPositionWall(rightBumper)){
		self.x -= 5;
	} else {
		if(self.pressingRight)
		self.x += self.maxMoveSpd;
	}
	if(Maps.current.isPositionWall(leftBumper)){
		self.x += 5;
	} else {
		if(self.pressingLeft)
		self.x -= self.maxMoveSpd;
	}
	if(Maps.current.isPositionWall(downBumper)){
		self.y -= 5;
	} else {
		if(self.pressingDown)
		self.y += self.maxMoveSpd;
	}
	if(Maps.current.isPositionWall(upBumper)){
		self.y += 5;
	} else {
		if(self.pressingUp)
		self.y -= self.maxMoveSpd;
	}

	//ispositionvalid
	if (self.x < self.width / 2)
		self.x = self.width / 2;
	if (self.x > Maps.current.width - self.width / 2)
		self.x = Maps.current.width - self.width / 2;
	if (self.y < self.height / 2)
		self.y = self.height / 2;
	if (self.y > Maps.current.height - self.height / 2)
		self.y = Maps.current.height - self.height / 2;

}
 var super_update = self.update;
 self.update = function () {
	super_update();
	self.attackCounter += self.atkSpd;
	
		if(self.hp <= 0) 
			self.onDeath();
}
self.onDeath = function(){};

 self.performAttack = function() {
	if(self.attackCounter > 25){	//every 1 sec
			self.attackCounter = 0;
			bullet.generate(self);
	}
}
	self.performSpecialAttack = function() {
		if(self.attackCounter > 50) {   //every 1 sec
			self.attackCounter = 0;
			/*
			for(var i = 0 ; i < 360; i++){
				bullet.generate(self,i);
			}
			*/
			bullet.generate(self,self.aimAngle - 5);
			bullet.generate(self,self.aimAngle);
			bullet.generate(self,self.aimAngle + 5);
			}
		}
	
return self;
}

Player = function () {

	var self = Actor('player', 'myId', 300, 300, 50, 45, Img.player, 10, 1)
	self.pressingMouseLeft = false;
	self.pressingMouseRight = false;
	self.maxMoveSpd = 10;

	var super_update = self.update;
	self.update = function () {
		super_update();
		if(self.pressingRight || self.pressingLeft || self.pressingDown || self.pressingUp)
			self.spriteAnimCounter += 0.2;
		if (self.pressingMouseLeft)
			self.performAttack();
		if (self.pressingMouseRight)
			self.performSpecialAttack();
	}

	self.onDeath = function () {
		var timeSurvived = Date.now() - timeWhenGameStarted;
		console.log('You lost! You survived for ' + timeSurvived + 'ms');
		startNewGame();
	}

	self.pressingDown = false;
	self.pressingUp = false;
	self.pressingLeft = false;
	self.pressingRight = false;

	
	return self;

}
 

Enemy = function (id,x, y, width, height, img, hp, atkSpd) {
	var self = Actor('enemy', id, x, y, width, height, img, hp, atkSpd) 
	Enemy.list[id] = self;
	
	self.toRemove = false;
	
	var super_update = self.update;
	self.update = function() {
		super_update();
		self.spriteAnimCounter += 0.2;
		self.updateAim();
		self.updateKeyPress();
		self.performAttack();
	}
	self.updateAim = function() {
		var diffX = player.x - self.x;
		var diffY = player.y - self.y;

		self.aimAngle = Math.atan2(diffY, diffX) / Math.PI *180
	}
	self.updateKeyPress = function() {
		var diffX = player.x - self.x;
		var diffY = player.y - self.y;

		self.pressingUp = diffY < -3;
		self.pressingDown = diffY > 3;
		self.pressingLeft = diffX < -3;
		self.pressingRight = diffX > 3;
	}
	var super_draw = self.draw;
	self.draw = function() {
		super_draw();
			var x = self.x - player.x + WIDTH/2;
			var y = self.y - player.y + HEIGHT/2 - self.height/2 - 20;
		ctx.save();
		ctx.fillStyle = 'red';
		var width = 100*self.hp/self.hpMax;
		if(width < 0) 
			width = 0;
		ctx.fillRect(x-50, y, width, 10);
		
		ctx.strokeStyle = 'black';
		ctx.strokeRect(x-50, y, 100, 10);

		ctx.restore();
	}

	self.onDeath = function(){
		self.toRemove = true;
	}
	
	
};
Enemy.list = {};
Enemy.update = function() {
	if(frameCount % 100 === 0) //every 4 sec 
	Enemy.randomlyGenerate();
for(var key in Enemy.list) {
	Enemy.list[key].update();
}
for(var key in Enemy.list) {
	if(Enemy.list[key].toRemove)
	 delete Enemy.list[key]
}
}
Enemy.randomlyGenerate = function() {
	var x  = Math.random()*Maps.current.width;
	var y = Math.random()*Maps.current.height;
	var height = 70
	var width = 70
	var id = Math.random();
	if(Math.random() <0.5)
		Enemy(id,x, y, width, height, Img.goat, 3, 1);
	else
		Enemy(id,x, y, width, height, Img.crow, 1, 3);
}

upgrade = function ( id,x, y,  width, height, img, category) {
var self = Entity('upgrade', id, x, y, width, height, img) 

	self.category = category,
	upgrade.list[id] = self;
}
upgrade.list = {};
upgrade.update = function() {
	if(frameCount % 75 === 0) 
		upgrade.randomlyGenerate();
	for(var key in upgrade.list) {
	upgrade.list[key].update();
	var isColliding = player.testCollision( upgrade.list[key]);
	if(isColliding){
		if(upgrade.list[key].category === 'score') 
			score += 100;
		if(upgrade.list[key].category=== 'atkSpd')  
			player.atkSpd += 3;
		if(upgrade.list[key].category === 'potion')
			player.hp = 10;
		delete upgrade.list[key];
		
		}
	}
}	

upgrade.randomlyGenerate= function() {
	var x  = Math.random()*Maps.current.width;
	var y = Math.random()*Maps.current.height;
	var height = 20 ;
	var width = 32 ;
	var id = Math.random();
	
	if (id <0.5) {
		var category = 'score';
		var img = Img.update1;
	} else if (id >0.5 && id< 0.8){ 
		var category = 'atkSpd';
		var img = Img.update2;
	} else {
		var category = 'potion';
		var img = Img.potion;
	}
	
	upgrade(id, x, y, width, height, img ,category);
}

bullet = function (id,x, y, spdX, spdY, width, height, combatType) {
var self = Entity('bullet', id, x, y, width, height, Img.bullet) 
	self.timer = 0;
	self.combatType = combatType;
	self.spdX = spdX;
	self.spdY = spdY;
	self.toRemove = false;

	var super_update = self.update;
	self.update = function() {
		super_update();
		var toRemove = false;
		self.timer++;
		if(self.timer > 75) {
			self.toRemove = true;
		}
		if(self.combatType === 'player'){ //bullet was shot by player
			for(var key2 in Enemy.list){
				
				if(self.testCollision(Enemy.list[key2])){
					self.toRemove= true;
					Enemy.list[key2].hp -= 1;
					break;
				}
			}
		} else if(self.combatType === 'enemy') {
			if(self.testCollision(player)){
				self.toRemove = true;
				player.hp -= 1;
			}
		}
		if(Maps.current.isPositionWall(self)) {
			self.toRemove = true;
		}
	}

	self.updatePosition =  function() {
			self.x += self.spdX;
			self.y += self.spdY;
					
			if(self.x < 0 || self.x > Maps.current.width){
				self.spdX = -self.spdX;
			}
			if(self.y < 0 || self.y > Maps.current.height){
				self.spdY = -self.spdY;
			}
	}

	bullet.list[id] = self;
}
bullet.list = {};
bullet.update = function() {
	for(var key in bullet.list) {
		var b  = bullet.list[key];
		b.update();


		if(b.toRemove) {
			delete bullet.list[key];
		}

		
 	}
}
bullet.generate= function(actor, aimOverwrite) {
	var x  = actor.x;
	var y = actor.y;
	var height = 25 ;
	var width = 25 ;
	var id = Math.random();
	
	var angle;
	if(aimOverwrite !== undefined) 
			angle = aimOverwrite;
		else angle = actor.aimAngle
	
	var spdX = Math.cos(angle/180*Math.PI)*5;
	var spdY = Math.sin(angle/180*Math.PI)*5;
	bullet(id,x, y, spdX, spdY, width, height, actor.type);
}
