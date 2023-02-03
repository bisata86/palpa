
var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var math = require('mathjs')
app.use(express.static(__dirname + '/', {
    maxage: process.env.NODE_ENV == "production" ? '0d' : '0d'
})) 

var port = process.env.PORT || 3000;


app.get('/', function(req, res){
  res.sendfile('./index.html');
}); 




var baseLab = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]

        function getIt(d1,d2) {
            var a = [];
            for (var i = 0; i < d1; i++) {
                var r = [0]
                for (var j = 1; j < d2-1; j++) {
                    if(i==0 || i==d1-1) r.push(0)
                    else {
                        if(i==1 || i==d1-2 || j==1 || j==d2-2)  r.push(1)
                        else {
                            var t = rint(0,10)
                            if(t<=1) r.push(0)
                            else r.push(1)
                        }
                    }
                }
                r.push(0)
                a.push(r);
            }
            return a;
        }
        baseLab = JSON.parse(JSON.stringify(getIt(23,15)))

var clab = createLab(baseLab);
var fullLabs = clab.labs;
var walls = clab.walls;

var users = [];
var items = [];
var itemsInterval;


io.set('origins', '*:*');
io.on('connection', function (socket){
  clearInterval(itemsInterval);
  addItems()
  itemsInterval=setInterval(function(){
    addItems()
  },1000)



  socket.on('addbot', function(data){
  	  addBot();
  });

  function addBot() {
     //return false;
     var user = getRandomBot();
     user.id=Math.random().toString(36).replace(/[^a-z]+/g, '');
     user.life=100;
     user.rpos= getFreePos();
     user.dead=false
     user.kills=0
     user.power=25,
     user.ammo=0,
     users.push(user);
     io.sockets.emit('user',user)
     if(user.movespeed!=-1) 
     moveBot(user,user.movespeed,user.movedistance)
     fireBot(user,user.firerate)
  }

  function moveBot(user,time,dist) {
    if(user.dead) return;
     var data = {d:dist,angle1:rint(-180,180),angle2:0};
     function doit(user,data){
        var mv = moveUser(user,data);
        user.a1 = data.angle1;
        user.a2 = data.angle2;
        io.sockets.emit('user',user)
        if(mv=='again') {
          setTimeout(function(){
            doit(user,data);
          },100)
        } else {
          setTimeout(function(){
            moveBot(user,time,dist)
          },time)
        }
      }
     doit(user,data);



  }

  function fireBot(user,rate) {
    if(user.dead) return;
      if(user.angle) user.angle+=2;
     fire(user,{angle1:(user.angle?(user.angle):rint(-180,180)),angle2:(user.angle2?user.angle2:rint(-10,10))})
     setTimeout(function(){
        fireBot(user,rate)
     },rate)
  }

  socket.on('addUser', function(data){

     var user = {
      id:socket.id,
      name:data.name,
      life:100,
      rpos: getFreePos(),
      dead:false,
      v:0,
      o:0,
      kills:0,
      power:25,
      ammo:0,
    }
     users.push(user);
     io.sockets.emit('user',user)
     for (var i = 0; i < users.length; i++) {
       if(!users[i].dead)
          socket.emit('user',users[i])
     }
     checkAloneAddBot();
     setTimeout(function(){
        addItems()
     },1000)
  });
  socket.on('getLab', function(data){
    socket.emit('lab',{lab:fullLabs,users:users});
  }); 
  socket.on('fire',function(data){
  	var user = findUser(socket.id);
  	if(!user) return;
    if(user.dead) return;
    if(user.power==50) {
        user.ammo--;
        if(user.ammo<=0) {
            user.power=25;
        }
        socket.emit('user',user)
    }

  	fire(user,data);
  })
  function fire(user,data) {
    if(true) {
      var position = user
      var dimi = 1;
      inters = [];
      for (var i = 0; i < walls.length; i++) {
        if(walls[i].type=='off') {
          var intersections =  getIntersections(position,data.angle1,data.angle2,walls[i].lines);
          for (var n = 0; n < intersections.length; n++) {
            intersections[n].p = walls[i].pos
            intersections[n].o = intersections[n].line.type
            intersections[n].z = intersections[n].line.z
            intersections[n].pinters.z = -intersections[n].line.z+intersections[n].distaa
            intersections[n].dist2 =  math.distance([position.rpos.x, position.rpos.y, position.rpos.z], [intersections[n].pinters.x, intersections[n].pinters.y, intersections[n].pinters.z])
            inters.push(intersections[n]);
          }
        }
      }


      if(true) {
        var acino = {
          from:{
            x:(position.rpos.x),
            y:(position.rpos.y)
          },
          to:{
            x:(position.rpos.x),
            y:(position.rpos.y)-100
          },
          angle:data?data.angle1:0,
          angle2:data?data.angle2:0
        };
        var acino2 = rotate(acino.to.x,acino.to.y,acino.from.x,acino.from.y,-acino.angle)
        var smem = 0
        if(true) {
          if(data.angle2>55 || data.angle2<-55) {
            smem=100
          }
          else if(data.angle2>50 || data.angle2<-50) {
            smem=70
          }
          else if(data.angle2>47.5 || data.angle2<-47.5) {
            smem=60
          }
          else if(data.angle2>45 || data.angle2<-45) {
            smem=50
          }
          else if(data.angle2>15 || data.angle2<-15) {
            smem = Math.abs(data.angle2)-10
          } 
          
        }
        acino.to.x = acino2[0]
        acino.to.y = acino2[1]
        var fcino = {
                  from:{
                    x:-(position.rpos.z),
                    y:0
                  },
                  to:{
                    x:-(position.rpos.z),
                    y:-(100+smem)
                  },
                  angle2:data?data.angle2:0
                };
        var fcino2 = rotate(fcino.to.x,fcino.to.y,fcino.from.x,fcino.from.y,-fcino.angle2)
        var porcodio = {from:position.rpos}
        porcodio.to = {x:acino.to.x,y:acino.to.y,z:fcino2[0]}
        porcodio.id = position.id
        if(data.angle2<0) {
          var sarcone = (math.intersect([porcodio.from.x, porcodio.from.y, -porcodio.from.z+1],  [porcodio.to.x, porcodio.to.y, porcodio.to.z], [0, 0, 1, 1]))
          porcodio.to = {x:sarcone[0],y:sarcone[1],z:sarcone[2]}

          var calcD = math.distance([position.rpos.x, position.rpos.y, position.rpos.z], [porcodio.to.x, porcodio.to.y, porcodio.to.z])
          inters.push({pinters:porcodio.to,dist2:calcD,p:{x:porcodio.to.x,y:porcodio.to.y}});
           sarcone = (math.intersect([porcodio.from.x, porcodio.from.y, -porcodio.from.z+1],  [porcodio.to.x, porcodio.to.y, porcodio.to.z], [0, 0, 1, 0]))
          porcodio.to = {x:sarcone[0],y:sarcone[1],z:sarcone[2]}
          try {
          if(
            fullLabs[0][Math.floor(porcodio.to.y)][Math.floor(porcodio.to.x)] &&
            fullLabs[0][Math.floor(porcodio.to.y)][Math.floor(porcodio.to.x)].type=='off'
            )
            {
            calcD = math.distance([position.rpos.x, position.rpos.y, position.rpos.z], [porcodio.to.x, porcodio.to.y, porcodio.to.z])
            inters.push({pinters:porcodio.to,dist2:calcD,p:{x:porcodio.to.x,y:porcodio.to.y}});
          }
        } catch (e) {}
        } else {
          inters.push({pinters:porcodio.to,dist2:10000,p:{x:porcodio.to.x,y:porcodio.to.y}});
        }
        
      }




      inters.sort(function (a, b) {
        return a.dist2 - b.dist2
      });
      if(inters.length!=0) {
        inters = [inters[0]]
        var limit = inters[0];
        for (var dd = 0; dd < inters.length; dd++) {
          var porcodio = {from:position.rpos}
          porcodio.to = {x:inters[dd].pinters.x,y:inters[dd].pinters.y,z:inters[dd].pinters.z}
          porcodio.id = position.id
          porcodio.a1 = data.angle1
          porcodio.a2 = data.angle2
          io.sockets.emit('bullet',porcodio)

          
        }        
      }



      //enemy hit
      var cino = {
        from:{
          x:(position.rpos.x),
          y:(position.rpos.y)
        },
        to:{
          x:(position.rpos.x),
          y:position.rpos.y-baseLab.length*2
        },
        angle:data?data.angle1:0,
        angle2:data?data.angle2:0
      };
      var cino2 = rotate(cino.to.x,cino.to.y,cino.from.x,cino.from.y,-cino.angle)
      cino.to.x = cino2[0]
      cino.to.y = cino2[1]
      for (var g = 0; g < users.length; g++) {
        if(!users[g].dead && users[g].id!=user.id) {
          var dist1 
          if(limit)
            dist1 = dist((position.rpos.x),(position.rpos.y),limit.p.x,limit.p.y);
          var dist2 = dist((position.rpos.x),(position.rpos.y),users[g].rpos.x,users[g].rpos.y);
          if(dist2<dist1 || !dist1) {
            var x1 = cino.from.x;
            var y1 = cino.from.y;
            var x2 = cino.to.x;
            var y2 = cino.to.y;
            var m = (y1-y2)/(x1-x2);
            var n = (-x1*m)+y1;
            var tt = findCircleLineIntersections(.2, users[g].rpos.x, users[g].rpos.y, m, n) 
            if(tt) { // pass horizontal axis
              cino = {
                from:{
                  x:-(position.rpos.z),
                  y:0
                },
                to:{
                  x:-(position.rpos.z),
                  y:100
                },
                angle:data?data.angle1:0,
                angle2:data?data.angle2:0
              };
              cino2 = rotate(cino.to.x,cino.to.y,cino.from.x,cino.from.y,cino.angle2)
              cino.to.x = cino2[0]
              cino.to.y = cino2[1]

              liner = cino
                var cline = {
                    from:{
                      x:-dimi/6-(users[g].rpos.z),
                      y:dist2,
                    },
                    to:{
                      x:+dimi/2-(users[g].rpos.z),
                      y:dist2,
                    },
                    angle:data?data.angle1:0,
                  };
                  var piru = checkLineIntersection(liner.from.x, liner.from.y, liner.to.x, liner.to.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y)
                  if(piru  && piru.seg2 && piru.seg1) {  // pass vertical axis
                    
                    users[g].life-=user.power
                    if(users[g].life<=0) { 
                      users[g].dead = true;
                      users[g].killedby = {name:user.name,id:user.id};
                      user.kills++;
                      checkAloneAddBot()
                    }
                    io.sockets.emit('user',user);
                    io.sockets.emit('hit',users[g]);
                    io.sockets.emit('user',users[g]);
                    break
                  }
            }
          }
        }
      }
    }
  }
  socket.on('jump', function(data){
    var user = findUser(socket.id);
    if(user) {
       if(user.dead) return;
       user.rpos.z+=.5
       var data = {d:0,angle1:0,angle2:0}
       function doit(user,data){
          var mv = moveUser(user,data);
          io.sockets.emit('user',user)
          if(mv=='again') {
            setTimeout(function(){
              doit(user,data);
            },100)
          }
        }
       doit(user,data);
    }
  }); 
  socket.on('move', function(data){
    var user = findUser(socket.id);
    if(user) {
       if(user.dead) return;
        function doit(user,data){
          var mv = moveUser(user,data);
          user.a1 = data.angle1;
          user.a2 = data.angle2;
          io.sockets.emit('user',user)
          if(mv=='again') {
            setTimeout(function(){
              data.d=-.01
              doit(user,data);
            },100)
          }
        }
       doit(user,data);
       checkForItems(user);

    } else {
      socket.emit('reload')
    }
  }); 
  socket.on('disconnect', function() {
    var user = findUser(socket.id);
      if(user) {
         user.dead=true;
         user.killedby='----------';
         io.sockets.emit('user',user) 
      }
  });
  var aloneTimeout;
  function checkAloneAddBot(){
       //return false;
       clearTimeout(aloneTimeout)
       aloneTimeout = setTimeout(function(){
          var t = countAliveUsers();
          console.log('countAliveUsers '+t)
          if(t<=1) addBot()
       },1000)
  }
  // setInterval(function(){
  //     var t = countAliveUsers();
  //     console.log('countAliveUsers '+t)
  //     if(t<=5) addBot()
  //  },5000)
  function addItems() {
    //return false;
    var lifeCounter = 0;
    var misteryCounter = 0;
     for (var i = 0; i < items.length; i++) {
       if(items[i].type=='bonuslife' && !items[i].taken) lifeCounter++
        if(items[i].type=='mistery' && !items[i].taken) misteryCounter++
     }
     if(lifeCounter<=1) {
      var item = {
        id:Math.random().toString(36).replace(/[^a-z]+/g, ''),
        type:'bonuslife',
        rpos: getFreePos()
      }
     items.push(item);
   }
   if(misteryCounter<=1) {
      var item = {
        id:Math.random().toString(36).replace(/[^a-z]+/g, ''),
        type:'mistery',
        rpos: getFreePos()
      }
     items.push(item);
   }
   for (var i = 0; i < items.length; i++) {
      io.sockets.emit('item',items[i])
    }
  }
  function checkForItems(user){
       for (var i = 0; i < items.length; i++) {
         if(
          !items[i].taken &&
          Math.floor(items[i].rpos.x) == Math.floor(user.rpos.x) &&
          Math.floor(items[i].rpos.y) == Math.floor(user.rpos.y) &&
          Math.floor(items[i].rpos.z) == Math.floor(user.rpos.z) 
          ) {
            if(items[i].type=='bonuslife') {
              if(user.life<100) {
                user.life+=25;
                items[i].taken = true;
                io.sockets.emit('user',user)
                io.sockets.emit('item',items[i])
              } else {
                socket.emit('message','Already max energy')
              }
            }
            else 
            if(items[i].type=='mistery') {
              if(true) {
                user.power = 50;
                user.ammo += 15;
                items[i].taken = true;
                io.sockets.emit('item',items[i])
                socket.emit('user',user)
                socket.emit('message','rifle + 15 ammo')
              } else {
                
              }
            }
            
         }
       }
       // if(taken) {
       //  items= items.splice(i, cid); 
       // }

  }
});

function createLab(lb) {
  var main = [];
  var ll = [];
  var e = getEmpyLayer(lb);
  ll.push(baseLab,e)
  var layers = ll.length;
  for (var i = 0; i < layers; i++) {
    var fullLab = []
    for (var a = 0; a < ll[i].length; a++) {
      var row = []
      for (var b = 0; b < ll[i][a].length; b++) {
        var obj = {gap:0};

        if(ll[i][a][b]==0) {
          obj.type='off'
        } else {
          obj.type='on'
        }
        row.push(obj)
      }
      fullLab.push(row)
    }
    main.push(fullLab)
  }
  for (var j = 0; j < main.length; j++) {
    if(j>0) {
      for (var i = 0; i < main[j].length; i++) {
        for (var k = 0; k < main[j][i].length; k++) {
          if( main[j-1][i][k].type=='off' ) {
            main[j][i][k].gap = 1;
            main[j-1][i][k].gap = 1
          }
        }
      }
    }
  }

  var w = [];
  for (var i = 0; i < main.length; i++) {
    w = w.concat(getSquares(main[i],i))
  }


  //add stairs start
  var cols = [1,main[0][0].length-2]
  for (var k = cols.length - 1; k >= 0; k--) {
    for (var i = main[0].length - 2; i > 1; i--) {
      var sgapp = 2
      for (var bb = 0; bb < Math.floor(main[1].length/2); bb++) {
        var sgapp = bb
        if(i==main[0].length-(bb+2) || i==bb+1) {
          var cgap = .2*(bb-1)
          if(cgap>=1.8) cgap = 1.8
          if(cgap<=0) cgap = 0
          if(cgap==1) {
            main[1][i][cols[k]].gap = cgap;
            main[0][i][cols[k]].gap = cgap;
          }
          else if(cgap<1) {
            main[0][i][cols[k]].gap = cgap;
            main[1][i][cols[k]].gap = cgap;
          } else {
            main[1][i][cols[k]].gap = cgap;
          }
        }
      }
    }
  }
  //add stairs end

  return {labs:main,walls:w}
} 

function getFreePos() {
  var rlab = fullLabs[rint(0,((fullLabs.length-1)))]
  var rr = rint(0,((rlab.length-1)))
  var rt = rint(0,rlab[0].length-1)
  while(rlab[rr][rt].type=='off') {
    rr = rint(0,((rlab.length-1)))
    rt = rint(0,rlab[0].length-1)
  }
  var ro = rlab[rr][rt].gap
  rr += .5
  rt += .5
  ro += .5
  return {x:rt,y:rr,z:ro}
}

function getIntersections(ipos,angle1,angle2,lines) {
    var position = ipos
    var dimi = 1;
    var cino = {
      from:{
        x:(position.rpos.x),
        y:(position.rpos.y)
      },
      to:{
        x:(position.rpos.x),
        y:((position.rpos.y-100))
      }
    };
    var cino2 = rotate(cino.to.x,cino.to.y,cino.from.x,cino.from.y,-angle1)
    cino.to.x = cino2[0]
    cino.to.y = cino2[1]
    var  liner = cino
    var inters = [];
    for (var g = 0; g < lines.length; g++) {
      var cline = lines[g]
      var piru = checkLineIntersection(liner.from.x, liner.from.y, liner.to.x, liner.to.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y)
      if(piru && piru.seg2 && piru.seg1) { //pass horizontal axis;
        var distance2 = dist(position.rpos.x, position.rpos.y, piru.x, piru.y)
        cino = {
          from:{
            x:-(position.rpos.z-.5),
            y:0
          },
          to:{
            x:-(position.rpos.z-.5),
            y:100
          },
          angle2:angle2
        };
        cino2 = rotate(cino.to.x,cino.to.y,cino.from.x,cino.from.y,cino.angle2)
        cino.to.x = cino2[0]
        cino.to.y = cino2[1]
        var cliner = cino
        var gappo;
        if(cline.plane) {
          gappo = Math.abs(position.rpos.x-piru.x)
        } else {
          gappo = cline.z
        }
        var ccline = {
            from:{
              x:-dimi/2 - gappo,
              y:distance2,
            },
            to:{
              x:+dimi/2 - gappo,
              y:distance2, 
            }
          };
          var piru2 = checkLineIntersection(cliner.from.x, cliner.from.y, cliner.to.x, cliner.to.y, ccline.from.x, ccline.from.y, ccline.to.x, ccline.to.y)
          if(piru2  && piru2.seg2 && piru2.seg1) {  // pass vertical axis
            var rdistance = dist(ccline.from.x, ccline.from.y, piru2.x, piru2.y)
            var distance = dist(cline.from.x, cline.from.y, piru.x, piru.y)
            var pinters = {x:piru.x,y: piru.y,z:.5}
            inters.push({dist:distance,line:cline,dist2:distance2,distaa:rdistance,pinters:pinters})
          }
      }
    }
    return inters;
}


function moveUser(user,data) {
      var cino = {
        from:{
          x:(user.rpos.x),
          y:(user.rpos.y)
        },
        to:{
          x:(user.rpos.x),
          y:(user.rpos.y+data.d)
        },
        angle:data?data.angle1:0,
        angle2:data?data.angle2:0
      };
      var cino2 = rotate(cino.to.x,cino.to.y,cino.from.x,cino.from.y,-cino.angle)
      cino.to.x = cino2[0]
      cino.to.y = cino2[1]
        var inters = false;
        var intersectionLines = [];
        var currlab;
        if(user.rpos.z-.5 >= 1)  {
          currlab = fullLabs[1]
        } else {
          currlab = fullLabs[0]
        }
        var zoneOff = calcZoneOff(user.rpos.z-.5,currlab)
         for (var i = 0; i < zoneOff.length; i++) {
          var cline = zoneOff[i]
          var ddd = pDistance(user.rpos.x, user.rpos.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y)
          if(ddd<.1) {            
            if(user.savedpos) {
                console.log('dei problemi')
                user.rpos.x = user.savedpos.x;
                user.rpos.y = user.savedpos.y;
                user.rpos.z = user.savedpos.z;
                
            } else {
                console.log('grossi !!!!!!!')
            }
            //return false;

         }
       }
       delete user.savedpos
       for (var i = 0; i < zoneOff.length; i++) {
         var cline = zoneOff[i]
          var ddd = pDistance(cino.to.x, cino.to.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y)
          var piru = checkLineIntersection(cino.from.x, cino.from.y, cino.to.x, cino.to.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y)
          if(ddd<.1 || (piru && piru.seg2 && piru.seg1)) {
            inters = true;
            cline.drist = pDistance(user.rpos.x, user.rpos.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y);
            intersectionLines.push(cline)
            /*break;
            return false;*/
          }
       }
       if(!inters) {
         
         user.rpos.y = cino2[1] 
         user.rpos.x = cino2[0]
         
         //return true;
      }
      else {
        intersectionLines.sort(function (a, b) {
          return a.drist - b.drist
        });
        if(intersectionLines[0].type=='frontwall' || intersectionLines[0].type=='backwall') {
            try {
              if(currlab[Math.floor(user.rpos.y)][Math.floor(cino2[0])].type=='on') {
                user.savedpos = {x:user.rpos.x,y:user.rpos.y,z:user.rpos.z}
                user.rpos.x = cino2[0] 
              }
            } catch(e) {
              console.log('slide 1 fail')
            }
        } else if(intersectionLines[0].type=='walll' || intersectionLines[0].type=='wallr')  {
            try {
              if(currlab[Math.floor(cino2[1])][Math.floor(user.rpos.x)].type=='on') {
                user.savedpos = {x:user.rpos.x,y:user.rpos.y,z:user.rpos.z}
                user.rpos.y = cino2[1] 
              }
            } catch(e) {
              console.log('slide 2 fail')
            }
        }
        console.log('slide')
        //return false;
      }
      var newZpos = (currlab[Math.floor(user.rpos.y)][Math.floor(user.rpos.x)].gap)+.5
      if(user.rpos.z>newZpos) {
          user.rpos.z-=.25;
          console.log('again')
          return 'again';
       } else {
         user.rpos.z = newZpos
         return false;
       }
}

function countAliveUsers() {
  var count = 0;
  for (var i = 0; i < users.length; i++) {
    if(users[i].dead==false) {
      count++
    }
  }
  return count;
}

function findUser(d) {
	for (var i = 0; i < users.length; i++) {
		if(users[i].id==d) {
			return users[i];
		}
	}
	return false;
}
function rint(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function checkLineIntersectionms(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

function checkLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) { var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1); if (denom == 0) { return null; } ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom; ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom; return { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1), seg1: ua >= 0 && ua <= 1, seg2: ub >= 0 && ub <= 1 }; }

function rotate(x, y, xm, ym, a) {
    var cos = Math.cos,
        sin = Math.sin,

        a = a * Math.PI / 180, // Convert to radians because that is what
                               // JavaScript likes

        // Subtract midpoints, so that midpoint is translated to origin
        // and add it in the end again
        xr = (x - xm) * cos(a) - (y - ym) * sin(a)   + xm,
        yr = (x - xm) * sin(a) + (y - ym) * cos(a)   + ym;

    return [xr, yr];
}

function diff (num1, num2) {
  if (num1 > num2) {
    return (num1 - num2);
  } else {
    return (num2 - num1);
  }
};

function findCircleLineIntersections(r, h, k, m, b) {
  var A,B,C;
    A = 1 + m * m;
    B = -2 * h + 2 * m * b - 2 * k * m;
    C = h * h + b * b + k * k - 2 * k * b - r * r;
    delta = B * B - 4 * A * C;
    if (delta < 0) {
        return false;
    }
    if (delta >= 0) {
        x1 = (-B + Math.sqrt(delta)) / (2 * A);
        x2 = (-B - Math.sqrt(delta)) / (2 * A);
        y1 = m * x1 + b;
        y2 = m * x2 + b;
        return [[x1,y1],[x2,y2]];
    }
}
function dist (x1, y1, x2, y2) {
  var deltaX = diff(x1, x2);
  var deltaY = diff(y1, y2);
  var dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  return (dist);
};

function pDistance(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function isPointInRectangle(x,y,rect){
  return(x>rect.x && x<rect.x+rect.width && y>rect.y && y<rect.y+rect.height);
}
function getRandomBot() {
  var car = ['crazy','killer','scary','agressive','arrogant','careless','cruel']
  var bots = [
      {
        name:'random bot',//car[Math.floor(Math.random() * car.length)]+' bot',
        firerate:rint(500,2000),
        movespeed:rint(500,2000),
        movedistance:Math.random()
      },
      {
        name:'gunner bot',
        firerate:250,
        movespeed:rint(1000,2000),
        movedistance:Math.random()
      },
      {
        name:'fast bot',
        firerate:rint(1000,2000),
        movespeed:300,
        movedistance:Math.random()
      },
      {
        name:'dummy bot',
        firerate:3000,
        movespeed:-1,
        movedistance:.1
      },
      {
        name:'turret bot',
        firerate:250,
        movespeed:-1,
        movedistance:0,
        angle:1,
        angle2:rint(-5,5)
      }
  ]
 //return  bots[0];
  //return  bots[bots.length-2];
  return  bots[Math.floor(Math.random() * bots.length)];
}

function getSquares(l,z) {
  var ddim = 1;
  var squares = [];
  var lines = [];
  for (var a = 0; a < l.length; a++) {
    for (var b = 0; b < l[a].length; b++) {
      //if(l[a][b]==0) {
        if(l[a][b].type=='off') {
        lines = []
        var squarePos = {pos:{x:b,y:a}};
        //left
        //if(b!=l[a].length-1)
        var line = {type:'walll',from:{x:b*ddim,y:a*ddim},to:{x:b*ddim,y:(a*ddim)+ddim},z:z,squarePos:squarePos}
         lines.push(line)
        //bottom
        line = {type:'backwall',from:{x:b*ddim,y:(a*ddim)+ddim},to:{x:(b*ddim)+ddim,y:(a*ddim)+ddim},z:z,squarePos:squarePos}
        //if(a!=l.length-1)
        lines.push(line)
        //right
        line = {type:'wallr',from:{x:(b*ddim)+ddim,y:a*ddim},to:{x:(b*ddim)+ddim,y:(a*ddim)+ddim},z:z,squarePos:squarePos}
        //if(b!=0)
        lines.push(line)
        //top
        line = {type:'frontwall',from:{x:b*ddim,y:a*ddim},to:{x:(b*ddim)+ddim,y:a*ddim},z:z,squarePos:squarePos}
        lines.push(line)

        /*line = {type:'topwall',from:{x:b*ddim,y:a*ddim},to:{x:(b*ddim)+ddim,y:a*ddim},z:z+1,squarePos:squarePos,plane:'o'}
        lines.push(line)*/

        squares.push({pos:{x:b,y:a},type:l[a][b].type,lines:lines})
      }
    }
  }
  return squares
}
function calcZoneOff(dY,l){
  var ddim = 1;
  var fullLab = l
  var z = []
  for (var a = 0; a < fullLab.length; a++) {
    for (var b = 0; b < fullLab[a].length; b++) {
      if(fullLab[a][b].type=='off' || (fullLab[a][b].gap>dY+.25)) {
        //left
        var line = {type:'walll',from:{x:b*ddim,y:a*ddim},to:{x:b*ddim,y:(a*ddim)+ddim}}
        z.push(line)
        //bottom
        line = {type:'backwall',from:{x:b*ddim,y:(a*ddim)+ddim},to:{x:(b*ddim)+ddim,y:(a*ddim)+ddim}}
        z.push(line)
        //right
        line = {type:'wallr',from:{x:(b*ddim)+ddim,y:a*ddim},to:{x:(b*ddim)+ddim,y:(a*ddim)+ddim}}
        z.push(line)
        //top
        line = {type:'frontwall',from:{x:b*ddim,y:a*ddim},to:{x:(b*ddim)+ddim,y:a*ddim}}
        z.push(line)
      }
    }
  }
  return z;
}

function getEmpyLayer(l) {
    var t = []
    for (var i = 0; i < l.length; i++) {
      var y = [];
      for (var k = 0; k < l[i].length; k++) {
        if(k==0 || k==l[i].length-1 || i==0 || i==l.length-1) y.push(0)
        else y.push(1)
      }
      t.push(y)
    }
    return t;
}



http.listen(port, function(){
  console.log('server up on port: '+port);
});
