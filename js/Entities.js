var player;
var enemyList = {};
var upgradeList = {};
var bulletList = {};

Entity = function (type, id, x, y, spdX, spdY, width, height, color) {
	var self = {
		type: type,
		id:id,
		x : x, 
		spdX : spdX,
		y : y, 
		spdY : spdY,
		width: width, 
		height: height,
		color: color,
		};
		self.update = function() {
			self.updatePosition();
			self.draw();
		}
		self.updatePosition = function() {
			self.x += self.spdX;
			self.y += self.spdY;
					
			if(self.x < 0 || self.x > WIDTH){
				self.spdX = -self.spdX;
			}
			if(self.y < 0 || self.y > HEIGHT){
				self.spdY = -self.spdY;
			}
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
};
self.draw = function() {
	ctx.save();
	ctx.fillStyle =  self.color;
	ctx.fillRect(self.x-self.width/2, self.y-self.height/2, self.width,self.height );
	ctx.restore();
	}
	return self;
	}



Actor = function (type, id, x, y, spdX, spdY, width, height,color, hp, atkSpd) {
 var self = Entity(type, id, x, y, spdX, spdY, width, height, color);
 
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
var self = Actor('player', 'myId', 50, 40, 30, 5, 20, 20, 'green', 10, 1)

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
				if(self.x > WIDTH-self.width/2)
					self.x = WIDTH - self.width/2;
				if(self.y < self.height/2)
					self.y = self.height/2;
				if(self.y > HEIGHT - self.height/2)
					self.y = HEIGHT - self.height/2;
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
 

Enemy = function (id,x, y, spdX, spdY, width, height) {
	var self = Actor('enemy', id, x, y, spdX, spdY, width, height, 'red', 10, 1) 
	var super_update = self.update;
	self.update = function() {
	super_update();
	self.performAttack();
	
	var isColliding = player.testCollision(self);
	if(isColliding){
		player.hp = player.hp - 1;
		
		}
		}
	enemyList[id] = self;
};

randomlyGenerateEnemy = function() {
	var x  = Math.random()*WIDTH;
	var y = Math.random()*HEIGHT;
	var height = 10 + Math.random()*30;
	var width = 10 + Math.random()*30;
	var id = Math.random();
	var spdX = 5 + Math.random() * 7;
	var spdY = 5 + Math.random() * 7;
	Enemy(id,x, y,spdX,  spdY,  width, height);
}

upgrade = function ( id,x, y, spdX, spdY,  width, height, color, category) {
var self = Entity('upgrade', id, x, y, spdX, spdY, width, height, color) 

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
	var x  = Math.random()*WIDTH;
	var y = Math.random()*HEIGHT;
	var height = 10 ;
	var width = 10 ;
	var id = Math.random();
	var spdX = 0;
	var spdY = 0;
	
	if (Math.random() <0.5) {
		var category = 'score';
		var color = 'orange';
	}else { 
		var category = 'atkSpd';
		var color = 'purple';
	}
	
	upgrade(id, x, y, spdX, spdY, width, height, color ,category);
}

bullet = function (id,x, y,spdX,  spdY,  width, height) {
var self = Entity('bullet', id, x, y, spdX, spdY, width, height, 'black') 
	self.timer = 0;
	
	var super_update = self.update;
	self.update = function() {
	super_update();
	var toRemove = false;
		self.timer++;
		if(self.timer > 75) {
			toRemove = true;
		}
	
		for(var key2 in enemyList) {
			/*
			var isColliding = self.testCollision(enemyList[key2]);
			if(isColliding){
				toRemove= true;
				delete enemyList[key2];
				break;
				}
				*/
		}
		if(toRemove) {
			delete bulletList[self.id];
			}
			
	}
	bulletList[id] = self;
}
generateBullet= function(actor, aimOverwrite) {
	var x  = actor.x;
	var y = actor.y;
	var height = 10 ;
	var width = 10 ;
	var id = Math.random();
	
	var angle;
	if(aimOverwrite !== undefined) 
			angle = aimOverwrite;
		else angle = actor.aimAngle
	
	var spdX = Math.cos(angle/180*Math.PI)*5;
	var spdY = Math.sin(angle/180*Math.PI)*5;
	bullet(id,x, y, spdX, spdY, width, height);
}
