var player;
var enemyList = {};
var upgradeList = {};
var bulletList = {};

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
		self.updatePosition = function(){}
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
};
	return self;
	}



Actor = function (type, id, x, y, width, height,img, hp, atkSpd) {
 var self = Entity(type, id, x, y, width, height, img);
 
 self.hp = hp;
 self.attackCounter = 0;
 self.aimAngle = 0;
 self.atkSpd = atkSpd;
 
 var super_update = self.update;
 self.update = function () {
	super_update();
	self.attackCounter += self.atkSpd;
}
 self.performAttack = function() {
	if(self.attackCounter > 25){	//every 1 sec
			self.attackCounter = 0;
			generateBullet(self);
	}
}
	self.performSpecialAttack = function() {
		if(self.attackCounter > 50) {   //every 1 sec
			self.attackCounter = 0;
			/*
			for(var i = 0 ; i < 360; i++){
				generateBullet(self,i);
			}
			*/
			generateBullet(self,self.aimAngle - 5);
			generateBullet(self,self.aimAngle);
			generateBullet(self,self.aimAngle + 5);
			}
		}
	
return self;
}

Player = function() {
var self = Actor('player', 'myId', 50, 40, 50, 45, Img.player, 10, 1)

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
		var super_update = self.update;

		self.update = function () {
		super_update();
		if (self.hp <= 0) {
			var timeSurvived = Date.now() - timeWhenGameStarted;
			
			console.log('You lost! You survived for ' + timeSurvived + 'ms');
			
			startNewGame();
			}
		}

	self.pressingDown=false;
	self.pressingUp= false;
	self.pressingLeft= false;
	self.pressingRight= false;
	return self;

}
 

Enemy = function (id,x, y, width, height) {
	var self = Actor('enemy', id, x, y, width, height, Img.enemy, 10, 1) 
	var super_update = self.update;
	self.update = function() {
		super_update();
		self.performAttack();
		self.updateAim();
			}
	enemyList[id] = self;
	

	self.updateAim = function() {
		var diffX = player.x - self.x;
		var diffY = player.y - self.y;

		self.aimAngle = Math.atan2(diffY, diffX) / Math.PI *180
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

randomlyGenerateEnemy = function() {
	var x  = Math.random()*currentMap.width;
	var y = Math.random()*currentMap.height;
	var height = 70
	var width = 40
	var id = Math.random();
	Enemy(id,x, y, width, height);
}

upgrade = function ( id,x, y,  width, height, img, category) {
var self = Entity('upgrade', id, x, y, width, height, img) 

var super_update =  self.update;
self.update = function() {
super_update();
var isColliding = player.testCollision( self);
	if(isColliding){
		if(self.category === 'score') 
			score += 100;
		if(self.category=== 'atkSpd')  
			player.atkSpd += 3;
		
		delete upgradeList[self.id];
		
		}
		}
	self.category = category,
	upgradeList[id] = self;
}
randomlyGenerateUpgrade= function() {
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

	bulletList[id] = self;
}

generateBullet= function(actor, aimOverwrite) {
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
