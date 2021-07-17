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

Player = function() {
var self = Actor('player', 'myId', 50, 40, 50, 45, Img.player, 10, 1)

var super_update = self.update;
self.update = function() {
	super_update();
	if(self.pressingMouseLeft) 
		self.performAttack();
	if(self.pressingMouseRight) 
		self.performSpecialAttack();
}

self.updatePosition = function() {

				if(self.pressingRight)
					self.x += 10;
				if(self.pressingLeft)
					self.x -= 10;	
				if(self.pressingDown)
					self.y += 10;	
				if(self.pressingUp)
					self.y -= 10;	
 
				//ispositionvalid
				if(self.x < self.width/2)
					self.x = self.width/2;
				if(self.x > currentMap.width-self.width/2)
					self.x = currentMap.width - self.width/2;
				if(self.y < self.height/2)
					self.y = self.height/2;
				if(self.y > currentMap.height - self.height/2)
					self.y = currentMap.height - self.height/2;
			}
			self.onDeath = function(){
				var timeSurvived = Date.now() - timeWhenGameStarted;
				console.log('You lost! You survived for ' + timeSurvived + 'ms');
				startNewGame();
			}
	
	self.pressingDown=false;
	self.pressingUp= false;
	self.pressingLeft= false;
	self.pressingRight= false;

	self.pressingMouseLeft = false;
	self.pressingMouseRight = false;
	return self;

}
 

Enemy = function (id,x, y, width, height, img, hp, atkSpd) {
	var self = Actor('enemy', id, x, y, width, height, img, hp, atkSpd) 
	Enemy.list[id] = self;
	
	self.toRemove = false;
	
	var super_update = self.update;
	self.update = function() {
		super_update();
		self.updateAim();
		self.performAttack();
	}
	self.updateAim = function() {
		var diffX = player.x - self.x;
		var diffY = player.y - self.y;

		self.aimAngle = Math.atan2(diffY, diffX) / Math.PI *180
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
	
	self.updatePosition = function(){
		var diffX = player.x - self.x;
		var diffY = player.y - self.y;

		if(diffX > 0) 
			self.x += 3;
		else 
			self.x -= 3;
		
		if(diffY > 0)
			self.y += 3;
		else
			self.y -= 3;
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
	var x  = Math.random()*currentMap.width;
	var y = Math.random()*currentMap.height;
	var height = 70
	var width = 40
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
		
		delete upgrade.list[key];
		
		}
	}
}	

upgrade.randomlyGenerate= function() {
	var x  = Math.random()*currentMap.width;
	var y = Math.random()*currentMap.height;
	var height = 20 ;
	var width = 32 ;
	var id = Math.random();
	
	if (Math.random() <0.5) {
		var category = 'score';
		var img = Img.update1;
	}else { 
		var category = 'atkSpd';
		var img = Img.update2;
	}
	
	upgrade(id, x, y, width, height, img ,category);
}

bullet = function (id,x, y, spdX, spdY, width, height, combatType) {
var self = Entity('bullet', id, x, y, width, height, Img.bullet) 
	self.timer = 0;
	self.combatType = combatType;
	self.spdX = spdX;
	self.spdY = spdY;

	self.updatePosition =  function() {
			self.x += self.spdX;
			self.y += self.spdY;
					
			if(self.x < 0 || self.x > currentMap.width){
				self.spdX = -self.spdX;
			}
			if(self.y < 0 || self.y > currentMap.height){
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
	
		var toRemove = false;
		b.timer++;
		if(b.timer > 75) {
			toRemove = true;
		}
		if(b.combatType === 'player'){ //bullet was shot by player
			for(var key2 in Enemy.list){
				
				if(b.testCollision(Enemy.list[key2])){
					toRemove= true;
					Enemy.list[key2].hp -= 1;
					break;
				}
			}
		} else if(b.combatType === 'enemy') {
			if(b.testCollision(player)){
				toRemove = true;
				player.hp -= 1;
			}
		}


		if(toRemove) {
			delete bullet.list[self.id];
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
