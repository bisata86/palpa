
		var mdim = $(window).width()
		if (mdim > 600) mdim = 600
		$("head *").last().after("<style type='text/css'>:root {--main-dim: " + mdim + "px;}</style>");
		//$("head *").last().after("<style type='text/css'>.backwall {transform: translateZ(" + mdim + "px) translateY(-" + mdim + "px);</style>");
		var cssSrt = "";
		for (var i = 0; i < 24; i++) {
			var cane = (140+(1*i));
			cane = cane+50
			cssSrt += " .roomClass[data-y='"+i+"'] .floor {background:rgba("+cane+","+cane+","+cane+");}"
			cane = cane-50
			cssSrt += " .roomClass[data-y='"+i+"'] .frontwall {background:rgba("+cane+","+cane+","+cane+");}"
			cssSrt += " .roomClass[data-y='"+i+"'] .backwall {background:rgba("+cane+","+cane+","+cane+");}"
			cane = cane-10
			cssSrt += " .roomClass[data-y='"+i+"'] .walll {background:rgba("+cane+","+cane+","+cane+");}"
			cssSrt += " .roomClass[data-y='"+i+"'] .wallr {background:rgba("+cane+","+cane+","+cane+");}"

		}
		$("head *").last().after("<style type='text/css'>" + cssSrt + "</style>");


		$(function() {
 
		    var position = {
		    		name: getRandomName(),
			        level:3,
			        angle : 0,
			        enemies : [ 
			    	]
			    }
			var labs = []
		    var aimState = 'arrows'
		    var keyInterval;
		    var keyboardBusy = false;
		    var keyInterval2;
		    var keyboardBusy2 = false;
		    var debug = false;
		    var fireInterval;
		    var enemyInterval;
		    var ismobile = isMobile();
		    var ret = localStorage.getItem("thelabdebug")
		    if (ret) {
		        debug = ret == 'true';
		        $("#debug").prop("checked", debug)
		    }
		    var ret = localStorage.getItem("bullets")
		    var showBullets
		    if (ret) {
		        showBullets = ret == 'true'
		    }
		    var ret = localStorage.getItem("music")
		    var musicEnabled
		    if (ret) {
		        musicEnabled = ret == 'true'
		    }
		    $("#debug").on("change", function() {
		        var k = $("#debug").prop("checked") == true;
		        localStorage.setItem("thelabdebug", k)
		        debug = k == true;
		        applyDebug(debug)
		    });
		    $("#addbot").on("change", function() {
		        socket.emit('addbot')
		    });

		    var ret = localStorage.getItem("thelabname")
		    if (ret) {
		        position.name = ret;
		    }
		    var prev = showBullets ? 'checked' : ''
		    var prev2 = musicEnabled ? 'checked' : ''
		    var bulletChoice = "<div class='smallInfo'><label for='bullets'>Show bullets</label><input type='checkbox' "+prev+" id='bullets'></input><span> Press B in gameplay</span></div>"
		    var musicChoice = "<div class='smallInfo'><label for='music'>Music</label><input type='checkbox' "+prev2+" id='music'></input><span> Press M in gameplay</span></div>"
		    panelize('<div class="skull"></div><div>CHOOSE YOUR NAME</div><br><input id="name" type="text" value="'+position.name+'"></input><br><br>'+bulletChoice+musicChoice,function(){
		    	socket.emit('addUser',{name:position.name})
		    	socket.emit('getLab')
		    	if(musicEnabled) {
		    		$("body").append("<video style='display:none;'><source src='./music/music.mp3'></source></video>");
		    	  	$("video")[0].play();
		    	}
		    	$('.panel').addClass('pnone');
			    socket.on('lab', function(data){
		        	labs = data.lab
		        	$('.skull').addClass('open')
		        	if (window.location.href.indexOf('localhost') != -1) {
					       start();
			        } else {
			        	setTimeout(function(){
			        		start();
			        	},500)
		        	}
		        })
		        socket.on('message', function(data){
		        	notify(data)
		        })
		        socket.on('reload', function(data){
		        	document.exitPointerLock();
		        	$('.mirino').remove();
			    	$('.canej').hide();
    				panelize('<div class="palpa"></div>DISCONNECTED',cb,'RETRY')
	    			function cb(){
	    				window.location.reload()
	    			}
    				return;
		        })
		        socket.on('hit', function(data){
		        	$("#"+data.id).addClass('hit');
		        	setTimeout(function(){
		        		$('#'+data.id).removeClass('hit');
		        	},50)
		        })
			    socket.on('user', updateUser)

		        socket.on('console', function(data){
		        	console.log(data)
		        })
		        socket.on('bullet', function(data){
		        	if(!showBullets)
		        		return false;
		        	var cid = Math.random().toString(36).replace(/[^a-z]+/g, '');
		        	$(".room").append('<div class="bullet" id="'+cid+'"><div></div></div>')
		        	$("#"+data.id+' .vilGun').css('transform','rotateX('+(-data.a2+90)+'deg)')
		        	$("#"+data.id+' .vilFront').css("transform"," rotateY("+data.a1+"deg)")
		        	function findId(el) {
		        		return el.id==data.id
		        	}
		        	var ciuno = position.enemies.find(findId);
		        	if(ciuno) {
			        	ciuno.a1 = data.a1
			        	ciuno.a2 = data.a2
			        	if(ciuno.power>25) $("#"+cid).addClass('red')
		        	}
		        	var tz1 = ((mdim * (data.from.y)))
		        	var tx1 = (mdim * (data.from.x))-mdim/40
		        	var ty1 = (mdim * (-data.from.z+1))-mdim/40
			        
			        var tz = ((mdim * (data.to.y)))
	        		var tx = ((mdim * (data.to.x)))-mdim/40
	        		var ty = (((mdim* (data.to.z))))-mdim/40


			        var a = Math.abs(tz1 - tz);
					var b = Math.abs(tx1 - tx);
					var c = Math.abs(ty1 - ty);
					var distance = Math.sqrt(a * a + b * b + c * c);
					var fast = distance/(mdim*13)
					$("#"+cid).css('transition-duration',fast+'s')
					$("#"+cid).css("transform", "translateZ(" + tz1 + "px) translateX(" + tx1 + "px) translateY(" + ty1 + "px)")
			        if(data.id==socket.id) {
			        	if(position.power>25) $("#"+cid).addClass('red')
			        	$("#"+cid).css('visibility','hidden');
			    	}
			        setTimeout(function(){
			        	$("#"+cid).css("transform", "translateZ(" + tz + "px) translateX(" + tx + "px) translateY(" + ty + "px)")
			        	$("#"+cid).css('visibility','visible');
			        	setTimeout(function(){
				        	$("#"+cid).remove();
				        },(fast*1000)+1000)
			        },10)
			        
		        })
		        socket.on('wallhole', function(data){

		        	let slamoz = $('.roomClass[data-y="'+(data.p.y)+'"][data-x="'+(data.p.x)+'"][data-z="'+(data.z)+'"] > .'+data.wall)
		        	
		        	var cid = Math.random().toString(36).replace(/[^a-z]+/g, '');
		        	slamoz.append('<div class="hole" id="'+cid+'"></div>')
		        	var ttt = (data.dist*100)
		        	var ttt2 = (data.distaa*100)
		        	if(data.wall=='frontwall' || data.wall=='backwall') {
		        		$('#'+cid).css('top','calc('+ttt2+"%"+' - '+mdim/60+'px)')
		        		$('#'+cid).css('left','calc('+ttt+"%"+' - '+mdim/60+'px)')

		        	}
		        	else if(data.wall=='walll' || data.wall=='wallr') {
		        		$('#'+cid).css('top','calc('+ttt+"%"+' - '+mdim/60+'px)')
		        		$('#'+cid).css('left','calc('+(100-ttt2)+"%"+' - '+mdim/60+'px)')

		        	}
		        	setTimeout(function(){		        		
		        		$('#'+cid).remove();
		        	},10000)
		        })
		        socket.on('item', function(data){
		        	if(data.taken) {
		        		$("#"+data.id).remove()
		        	} else {
		        		if($("#"+data.id).length==0) {
			        		$(".room").append('<div class="item '+data.type+'" id="'+data.id+'"></div>') //<div class="vilFront"><div class="vilLat"></div></div>
			        		$("#"+data.id).css("transform", "translateZ(" + ((mdim * (data.rpos.y))) + "px) translateX(" + ((mdim * (data.rpos.x))-mdim/2) + "px)  translateY(" + ((mdim * -(data.rpos.z-.5))) + "px)")
		        		}
		        	}
		        })

		    },'JOIN')
		   
			
			$('#bullets').on("change",function(){
				var tt = $(this).is(":checked");
				showBullets = tt
				localStorage.setItem("bullets",showBullets)
			})
			$('#music').on("change",function(){
				var tt = $(this).is(":checked");
				musicEnabled = tt
				localStorage.setItem("music",musicEnabled)
			})
			

	    	function updateUser(data) {
	        	if(data.id==socket.id) {
	        		
	        		//lock=true;
	        		state = 'done'
	        		$('.info .me span').html(data.name+' '+data.kills+ ' kills'+'<div class="life"><div></div></div><div class="ammo"></div><div class="ammod">'+(data.ammo==0?"infinite":data.ammo)+'</div>')
		    		if(data.dead) {
		    			$('.mirino').remove();
		    			$('.canej').hide();
		    			document.exitPointerLock();
	    				panelize('<div class="palpa"></div>killed by '+data.killedby.name,cb)
		    			function cb(){
		    				window.location.reload()
		    			}
	    				return;
	    			}

			    	position.rpos = data.rpos;
	    			position.angle = 0;
	    			position.v = data.v;
	    			position.life = data.life;
	    			position.ammo = data.ammo;
	    			position.power = data.power;
	    			if(position.power==25) {
	    				$('.gun').removeClass('rifle')
	    			} else {
	    				$('.gun').addClass('rifle')
	    			}

	        	} else {
	        		var found = false;
	        		for (var i = 0; i < position.enemies.length; i++) {
	        			if(position.enemies[i].id==data.id) {
	        				found = true;
	        				position.enemies[i].dead = data.dead
	        				if(data.dead && data.killedby.id==socket.id) {
			    				notify('You killed '+data.name);
			    				
			    			}
	        				position.enemies[i].pos = data.rpos
	        				position.enemies[i].kills = data.kills
	        				position.enemies[i].life = data.life
	        				position.enemies[i].dead = data.dead
	        				position.enemies[i].power = data.power;
	        				position.enemies[i].a1 = data.a1
	        				position.enemies[i].a2 = data.a2
	        			}
	        		}
	        		if(!found) {
	        			position.enemies.push({pos:data.rpos,life:data.life,id:data.id,name:data.name,kills:data.kills,dead:data.dead})
	        		}
	        		drawEnemies(position)
	        	}
	        	
	        }

		    function applyDebug(g) {
		        if (g) {
		        	// mir.x = 0;
		        	// mir.y = 0;
		            $(".scene").css('transform', 'scale(.04) rotateX(-80deg) translateZ(00px) translateY(0px) translateX(0px)');
		            $(".scene").css('perspective', (mdim * 20) + 'px');
		            //$('.sky').addClass('hidden')
		            $('.gun').addClass('hidden')
		            $('.mirino').addClass('hidden')
		            //$('.room > .floor').addClass('debug')
		            
		        } else {
		            $(".scene").css('transform', 'rotateX(0deg)');
		            $(".scene").css('perspective', ((mdim)/1.7) + 'px');
		            $('.gun').removeClass('hidden')
		            $('.mirino').removeClass('hidden')
		            //$('.room > .floor').removeClass('debug')
		        }

		    }
		    function start() {
		    	$('.info').show();
		    	$("body").append("<div class='scene'></div>")
		    	$("body").append("<div class='gun'><div></div></div>")
		    	$("body").append("<div class='life'><div></div></div>")
		    	$("body").append("<div class='mirino'></div>")
		    	if (window.location.href.indexOf('localhost') != -1) {
				   	$('label[for="debug"]').show()
		    		$('label[for="addbot"]').show()
		        } else {
		        	/*$('label[for="addbot"]').show()
		        	$('label[for="addbot"]').css('left',10)*/
		    	}
			    if (ismobile) {
    				let joystick1 = new JoystickController("stick1", 64, 8);
    				let joystick2 = new JoystickController("stick2", 64, 8);
        		    var mobileDisableTurn = false;
        		    var mobileFireEnabled = true
        		    var activeRightMira = false;
        		    var savedValue;
				    function update() {

				    	if(joystick1.active) {
				    		savedValue = null
				    		activeRightMira = false;
				    	} else {
				    		if(!savedValue)
				    			savedValue = mir.x;
				    		activeRightMira = true;	
				    	}
				    	//console.log(savedValue)
				    	
				     	if(activeRightMira) {
					     	var ddd = -joystick2.value.x*25
					     	if(Math.abs(ddd)<45)
					     	mir.x = savedValue+ddd
		  					/*if(ddd<savedValue ||  ddd>savedValue)
					     		mir.x =ddd*/
				     	}
				     	// if(!joystick2.active && savedValue) {
				     	// 	if(mir.x>savedValue) mir.x-=.5
				     	// 	if(mir.x<savedValue) mir.x+=.5
				     	// }


				     	mir.x -= joystick1.value.x*5
				     	anggleXtoSend = mir.x;
				     	var dd = -joystick2.value.y*25
	  					if(dd<80 && dd>-80)
				     		mir.y =dd
				     	if(!joystick2.active) {
				     		if(mir.y>0) mir.y-=.5
				     		if(mir.y<0) mir.y+=.5
				     	}
				     	
				    	if(Math.abs(joystick1.value.y)>.1) {
					    	var distMove = joystick1.value.y/10;
					    	if(Math.abs(distMove)<=.1) {
					    		if (distMove>0) distMove = .1
					    		if (distMove<0) distMove = -.1
					    	}
					        socket.emit('move',{d:distMove,angle1:anggleXtoSend,angle2:anggleYtoSend})
				    	}
				        if(joystick2.active) {
				        	if(mobileFireEnabled) {
				        		mobileFireEnabled = false;
				        		socket.emit('fire',{angle1:anggleXtoSend,angle2:anggleYtoSend})
				    			firingProcedure();
				    			setTimeout(function(){
				    				mobileFireEnabled = true;
				    			},250)
				    		}
				        }
				        moveUserFrame(position)
				        window.requestAnimationFrame(update)

				    }
				    window.requestAnimationFrame(update);
			        $(".canej").show()
			    } else {
		    		$(".mirino").addClass("toclick")
		    		function cane() {
		    			 moveUserFrame(position)
		    			 window.requestAnimationFrame(cane)
		    		}
		    		window.requestAnimationFrame(cane);
			    }
		    	bindKeys()
		    	createRoom(position)
		    	applyDebug(debug)
		    	drawEnemies(position)
		    	$(".panel").fadeOut()
		    	//$(".panel").remove();
		        $('.overlay').fadeOut();
		        setTimeout(function(){
		        	$(".panel").remove();
		        	$('.overlay').remove();
		        },500)
		    	// enemyInterval = setInterval(function(){
			    // 	drawEnemies(position)
			    // },400)
		    }


		    
		    var moveDist = .1

		    function bindKeys() {
		    	document.onkeydown = function(e) {
			        switch (e.which) {
			        	case 37:
			            case 65: 
			            	if(debug) {
			            	mir.x+=90
			            	}
			            	else {
			            	if(!keyboardBusy2) {
			            		keyboardBusy2 = true;
				            	ff(-moveDist)
				            	function ff(a){
				            		socket.emit('move',{d:a,angle1:anggleXtoSend+90,angle2:anggleYtoSend})
				            		keyInterval2 = setTimeout(function(){
				            			var s = a-moveDist >= -.4  ? a-moveDist : -.4;
				            			ff(s)
				            		},100)
				            	}
			                }
			          		}
					         e.preventDefault();
		            		return;
			                break;
			            case 38 :
			            case 87 : 
			            	if(!keyboardBusy) {
			            		keyboardBusy = true;
				            	ff(-moveDist)
				            	function ff(a){
				            		socket.emit('move',{d:a,angle1:anggleXtoSend,angle2:anggleYtoSend})
				            		keyInterval = setTimeout(function(){
				            			var s = a-moveDist >= -.4  ? a-moveDist : -.4;
				            			ff(s)
				            		},100)
				            	}
			                }
					        e.preventDefault();
					        return;
			                break;
			            case 68:
			            case 39: 
			            if(debug) {
			            	mir.x+=90
			            	}
			            	else {
			            	if(!keyboardBusy2) {
			            		keyboardBusy2 = true;
				            	ff(moveDist)
				            	function ff(a){
				            		socket.emit('move',{d:a,angle1:anggleXtoSend+90,angle2:anggleYtoSend})
				            		keyInterval2 = setTimeout(function(){
				            			var s = a+moveDist >= .4  ? a+moveDist : .4;
				            			ff(s)
				            		},100)
				            	}
			                }
			            }
					        e.preventDefault();
		            		return;
			                break;
			            case 83:
			            case 40: 
			                if(!keyboardBusy) { 	
			            		keyboardBusy = true;
				            	ff(moveDist)
				            	function ff(a){
				            		socket.emit('move',{d:a,angle1:anggleXtoSend,angle2:anggleYtoSend})
				            		keyInterval = setTimeout(function(){
				            			var s = a+moveDist <= .4  ? a+moveDist : .4;
				            			ff(s)
				            		},100)
				            	}
			                }
					        e.preventDefault();
					        e.preventDefault();
					        return;
			                break;
			            case 32:
			            socket.emit('jump')
			            /*if(!fireStop) {
			            		fireStop = true;
			            		socket.emit('fire',{angle1:anggleXtoSend,angle2:anggleYtoSend})
				            //clearInterval(fireInterval);
				            //fireInterval = setInterval(function(){
				            	firingProcedure();
				            //},100)
					            setTimeout(function(){
					            	fireStop = false;
					            },250)
			        	}*/
			            break;
			            return;
			            case 66:
			            showBullets = !showBullets
			            localStorage.setItem("bullets",showBullets)
			            if(showBullets) notify("Bullets enabled")
			            if(!showBullets) notify("Bullets disabled")
			            break;
			            case 77:
			            musicEnabled = !musicEnabled
			            localStorage.setItem("music",musicEnabled)
			            if(musicEnabled) {
			            	notify("Music enabled")
			            	if($("video").length) {
			            		$("video")[0].play();
			            	} else {
			            		$("body").append("<video style='display:none;'><source src='./music/music.mp3'></source></video>");
		    	  				$("video")[0].play();
			            	}
			            } else {
			            	notify("Music disabled")
			            	if($("video").length) {
			            		$("video")[0].pause();
			            	}
			            }
			            break;
			            default:
			            return; 
			        }
			        // moveLogic(position)
			        // position.y = 0
			        e.preventDefault(); // prevent the default action (scroll / move caret)
			    };
			    var fireStop = false;
			    document.onkeyup = function(e) {
			    	if([38,87,83,40].includes(e.which)) {
				        clearInterval(keyInterval)
				        keyboardBusy = false;
				    }
				    if([37,65,68,39].includes(e.which)) {
				        clearInterval(keyInterval2)
				        keyboardBusy2 = false;
				    }
				    if(e.which==32) {
			            clearInterval(fireInterval);
				    }
				    e.preventDefault();
			    };
			    var prevv;
			    var prevvv;
			    document.onmousemove = function(e){
			      //console.log(e)
			      if(prevv) {
			      	if(prevv!=e.clientX || prevvv!=e.clientY) {
			      		prevv = e.clientX
			      		prevvv = e.clientY
			      		if(!ismobile)
			      			$('.mirino').addClass("toclick");
			      		aimState='arrows'
			      		return
			      	} else {
			      	}
			      } else {
				      prevv = e.clientX
				      prevvv = e.clientY
			  	  }
			      if(state == 'initial') return;
			      if(state == 'waiting') return;
			      if(debug) return;
				  mir.x -= e.movementX/10
				  var dd = mir.y - e.movementY/10
				  if(dd<60 && dd>-60)
				  	mir.y = dd

				  
				}
				var fireInterval
				document.onmousedown = function(e){
					if($('.panel').length) {

					}
					else if(e.target.nodeName=='LABEL' || e.target.nodeName=='BUTTON' || e.target.nodeName=='INPUT') {

					}
					else if(state == 'done' || state == 'locked') {
						//state = 'locked'
						
						if(aimState=='arrows' && !ismobile) {
							$('.mirino').removeClass("toclick");
							document.body.requestPointerLock();
							aimState='mouse'
						} else {
							clearInterval(fireInterval)
							socket.emit('fire',{angle1:anggleXtoSend,angle2:anggleYtoSend})
								firingProcedure();
							fireInterval = setInterval(function(){
								socket.emit('fire',{angle1:anggleXtoSend,angle2:anggleYtoSend})
								firingProcedure();
							},250)
							
						}
						
						
					} else {
						
					}
				}
				document.onmouseup = function(e){
					clearInterval(fireInterval)
				}



		    }
		    var lock = false;
		    var state = 'initial';

		    var pause = true;
			var mir = {x:0,y:0}
			var anggleXtoSend = 0
			var anggleYtoSend = 0
			var prevTrasformation = null;
		    function moveUserFrame(p) {
		    	//console.log($('.roomClass > div').length)
		    	if(!p.rpos) return;
		        p.y = 0;
		        var t = 0
		        var t2 = (-p.rpos.x)* mdim +mdim/2
		        var t3 = (-p.rpos.y)* mdim +mdim/2
		        var t5 = 0;
		        var t6 = (p.rpos.z-.5) * mdim;
		        t=t-mir.x
		        t5=t5+mir.y
		        anggleXtoSend = mir.x;
		        anggleYtoSend = mir.y;
		        if(!p.savedLife) {
		        	p.savedLife = p.life;
		        }
		        if(p.life<p.savedLife) {
		        	p.savedLife = p.life;
		        	$('body').append('<div class="blood"></div>');
		        	setTimeout(function(){
		        		$('.blood').remove();
		        	},200)
		        }
		        if(p.life>p.savedLife) {
		        	p.savedLife = p.life;
		        	$('body').append('<div class="green"></div>');
		        	setTimeout(function(){
		        		$('.green').remove();
		        	},200)
		        }
		        $('.me .life div').css('width',p.life+'%')
		        var transformation = "rotateX(" + t5 + "deg) rotateY(" + t + "deg)  translateZ(" + (t3) + "px) translateX(" + t2 + "px) translateY(" + t6 + "px)"
		        var props = ['-webkit-transform','-moz-transform','-ms-transform','-o-transform','transform']
		        var str = ".room, .enemiesCont {";
		        for (var i = 0; i < props.length; i++) {
		        	str += props[i]+':'+transformation+';'
		       		
		       	}
		       	str += '}'

		       	if(prevTrasformation!=transformation) {
			       	$("#transformation").remove();
			        $("head *").last().after("<style id='transformation' type='text/css'>" + str +"</style>");
		    	}
		    	prevTrasformation = transformation 
		    }
		    function createRoom(p) {
		        $(".room").remove()

		        $(".scene").append("<div class='room'></div>")
  				for (var vv = 0; vv < labs.length; vv++) {
  					var labo = labs[vv];
  					for (var a = 0; a < labo.length; a++) {
	  					for (var b = 0; b < labo[a].length; b++) {
	  						appendDynRoom(Math.random().toString(36).replace(/[^a-z]+/g, ''), b, a, labo[a][b].type, vv, labo)
	  					}
	  				}
  				}


		        function appendDynRoom(d, a, b, c , e, f) {
		        	

		            $(".room").append("<div class='" + d + "room roomClass' data-x='" + a + "' data-y='" + b + "' data-z='" + e + "'></div>")
		            if(f[b][a].type == 'on' && e==0) {
		            	$("." + d + "room").append("<div class='floor'></div>")
		            }

		            if(f[b][a].gap) {
		            	if((a==1 || a==f[0].length-2) && b!=0 && b!=f.length-1) {
		            		$("." + d + "room").append("<div class='floors'><div></div><div></div><div></div><div></div><div></div></div>")
		            		$("." + d + "room .floors").css("transform", "rotateX(-90deg) translateZ(" + (mdim * (-f[b][a].gap+e)) + "px)")
	            		}
		            }

		            if(f[b][a].type == 'off') {
		            	if((a==0 || a==f[b].length-1) &&  (b==0 || b==f.length-1 )) {
		            		// gli angoli
		            	}
		            	else if(a==f[b].length-1) {
		            		$("." + d + "room").append("<div class='walll'></div>")
		            	}
		            	else if(a==0) {
		            		$("." + d + "room").append("<div class='wallr'></div>")
		            	}
		            	else if(b==0) {
		            		$("." + d + "room").append("<div class='backwall'></div>")
		            	}
		            	else if(b==f.length-1) {
		            		$("." + d + "room").append("<div class='frontwall'></div>")
		            	} else {
			            	$("." + d + "room").append("<div class='topwall'></div>")
				            $("." + d + "room").append("<div class='frontwall'></div>")
				            $("." + d + "room").append("<div class='walll'></div>")
				            $("." + d + "room").append("<div class='wallr'></div>")
				            $("." + d + "room").append("<div class='backwall'></div>")
			        	}
		        	}
		            $("." + d + "room").css("transform", "translateZ(" + (mdim * b) + "px) translateX(" + (mdim * a) + "px) translateY(" + (mdim * -e) + "px)")
		        }		       
		    }
		    function drawEnemies(p) {
		    	console.log('drawEnemies')
		    	//$(".enemiesCont").remove();
		    	/*if($(".enemiesCont").length==0)
		        $(".scene").append("<div class='enemiesCont'></div>")*/
		    	var counterEnemy = 0
		    	var list = [];
		    	for (var b = 0; b < p.enemies.length; b++) {
		    		if(!p.enemies[b].dead) {
		    			list.push({name:p.enemies[b].name,kills:p.enemies[b].kills,life:p.enemies[b].life})
		    			counterEnemy++;
		        		var id = p.enemies[b].id
		        		if($("#"+id).length==0 && !p.enemies[b].dead)
		        			$(".room").append('<div class="villain '+(p.enemies[b].name.indexOf('massacre')!=-1?'manu':'')+'" id="'+id+'"><div class="vilFront"><div class="vilLat"></div><div class="vilGun"><div class="side"></div><div class="sidelat"></div></div></div></div>');
		        		$("#"+id).css("transform", "translateZ(" + ((mdim * (p.enemies[b].pos.y))) + "px) translateX(" + ((mdim * (p.enemies[b].pos.x))-mdim/2) + "px) translateY(" + ((mdim * -(p.enemies[b].pos.z-.5))) + "px)");
	        			$("#"+id+' .vilFront').css("transform"," rotateY("+p.enemies[b].a1+"deg)")
	        			$("#"+id+' .vilGun').css("transform"," rotateX("+(-p.enemies[b].a2+90)+"deg)")

	        		} else {
	        			let cc = $('#'+p.enemies[b].id);
	        			cc.addClass('fade');
	        			setTimeout(function(){
	        				cc.addClass('out');
	        			},10)
	        			setTimeout(function(){
	        				cc.remove();
	        			},1000)
	        			
	        		}
	        	}
	        	$('.info .en').show()
	        	var htmlInfo = "";
	        	for (var il = 0; il < list.length; il++) {
	        		if(!list[il].dead)
	        		htmlInfo += "<div>-"+list[il].name+" "+list[il].kills+"</div>"
	        		//htmlInfo += "<div>"+list[il].name+" "+list[il].kills+"</div><div class='life'><div style='width:"+list[il].life+"%'></div></div>"

	        	}
	        	if(htmlInfo)
	        	$('.info .en span').html('<div class="saparator"></div>'+htmlInfo)
	        	else $('.info .en span').html('<div class="saparator"></div>'+'no enemies')
		    }
		    function firingProcedure() {
		            $(".gun").addClass('fire')
		            setTimeout(function(){
		            	$(".gun").removeClass('fire')
		            },30)
		    }

		    function panelize(h,cb,textButton) {
		    	$(".panel").remove();
		        $('.overlay').remove();
		    	$("body").append("<div class='overlay'></div>")
		        $("body").append("<div class='panel'></div>")
		        $(".panel").append("<div class='content'>"+h+"</div>")
		        if(typeof cb == 'function') {
		        	$(".panel").append("<button class='button'>"+(textButton ? textButton : 'GO')+"</button>")
		        }
		        $('.button').off("click").on("click",function(){
		        	if($('#name').length) {
		        		var c = $('#name').val();
		        		localStorage.setItem('thelabname',c)
		        		position.name = c;
		        	}
		        	cb();
		        })	
				if (window.location.href.indexOf('localhost') != -1) {
				       //if(textButton.indexOf('JOIN')!=-1) $('.button').last().click()
		        }


		    }
		    function notify(h) {
		    	$(".nots").remove();
		        $("body").append("<div class='nots'></div>")
		        $(".nots").append("<div class='content'>"+h+"</div>")
		        setTimeout(function(){
		        	$(".nots").remove();
		        },1000)
		    }

		});
	
		