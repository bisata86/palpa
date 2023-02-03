		class JoystickController
		{
			// stickID: ID of HTML element (representing joystick) that will be dragged
			// maxDistance: maximum amount joystick can move in any direction
			// deadzone: joystick must move at least this amount from origin to register value change
			constructor( stickID, maxDistance, deadzone )
			{
				this.id = stickID;
				let stick = document.getElementById(stickID);

				// location from which drag begins, used to calculate offsets
				this.dragStart = null;

				// track touch identifier in case multiple joysticks present
				this.touchId = null;
				
				this.active = false;
				this.value = { x: 0, y: 0 }; 

				let self = this;

				function handleDown(event)
				{
				    self.active = true;

					// all drag movements are instantaneous
					stick.style.transition = '0s';

					// touch event fired before mouse event; prevent redundant mouse event from firing
					event.preventDefault();

				    if (event.changedTouches)
				    	self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
				    else
				    	self.dragStart = { x: event.clientX, y: event.clientY };

					// if this is a touch event, keep track of which one
				    if (event.changedTouches)
				    	self.touchId = event.changedTouches[0].identifier;
				}
				
				function handleMove(event) 
				{
				    if ( !self.active ) return;

				    // if this is a touch event, make sure it is the right one
				    // also handle multiple simultaneous touchmove events
				    let touchmoveId = null;
				    if (event.changedTouches)
				    {
				    	for (let i = 0; i < event.changedTouches.length; i++)
				    	{
				    		if (self.touchId == event.changedTouches[i].identifier)
				    		{
				    			touchmoveId = i;
				    			event.clientX = event.changedTouches[i].clientX;
				    			event.clientY = event.changedTouches[i].clientY;
				    		}
				    	}

				    	if (touchmoveId == null) return;
				    }

				    const xDiff = event.clientX - self.dragStart.x;
				    const yDiff = event.clientY - self.dragStart.y;
				    const angle = Math.atan2(yDiff, xDiff);
					const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
					const xPosition = distance * Math.cos(angle);
					const yPosition = distance * Math.sin(angle);

					// move stick image to new position
				    stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

					// deadzone adjustment
					const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
				    const xPosition2 = distance2 * Math.cos(angle);
					const yPosition2 = distance2 * Math.sin(angle);
				    const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
				    const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));
				    
				    self.value = { x: xPercent, y: yPercent };
				  }

				function handleUp(event) 
				{
				    if ( !self.active ) return;

				    // if this is a touch event, make sure it is the right one
				    if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

				    // transition the joystick position back to center
				    stick.style.transition = '.2s';
				    stick.style.transform = `translate3d(0px, 0px, 0px)`;

				    // reset everything
				    self.value = { x: 0, y: 0 };
				    self.touchId = null;
				    self.active = false;
				}

				stick.addEventListener('mousedown', handleDown);
				stick.addEventListener('touchstart', handleDown);
				document.addEventListener('mousemove', handleMove, {passive: false});
				document.addEventListener('touchmove', handleMove, {passive: false});
				document.addEventListener('mouseup', handleUp);
				document.addEventListener('touchend', handleUp);
			}
		}
		function rint(min, max) { 
		    return Math.floor(Math.random() * (max - min + 1) + min)
		}
		function getRandomName() {
			var animals = ['tiger','crocodile','eagle','wolf','bear']
			var car = ['angry','crazy','killer','ultimate','scary','agressive','arrogant','careless','cruel']
			return  car[Math.floor(Math.random() * car.length)]+' '+animals[Math.floor(Math.random() * animals.length)]
		}

		function isMobile() {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
			        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
				return true;
			}  
			return false;    		    
		}
		function equation_plane(x1 , y1 , z1 , x2 ,
		    y2 , z2 , x3 , y3, z3) {
		        var a1 = x2 - x1;
		        var b1 = y2 - y1;
		        var c1 = z2 - z1;
		        var a2 = x3 - x1;
		        var b2 = y3 - y1;
		        var c2 = z3 - z1;
		        var a = b1 * c2 - b2 * c1;
		        var b = a2 * c1 - a1 * c2;
		        var c = a1 * b2 - b1 * a2;
		        var d = (-a * x1 - b * y1 - c * z1);
		        console.log("equation of plane is " + a + " x + "
		        + b + " y + " + c + " z + " + d + " = 0.");
		    }
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
		function isLeft( a,  b,  c){
			return ((b.X - a.X)*(c.Y - a.Y) - (b.Y - a.Y)*(c.X - a.X)) > 0;
		}

		/*  lab = [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
            
        ]*/

  //lab = genLab(9,15)
  // console.log(lab)
  // function genLab(a,b) {
  //   var s = [], e = []
  //   for (var i = 0; i <= a; i++) {
  //     if(i==0 || i==a) s.push(0)
  //     else s.push(1)
  //     e.push(0)
  //   }
  //   var u = []
  //   for (var i = 0; i <= b; i++) {
  //     if(i==0 || i==b) u.push(e)
  //     else u.push(s)
  //   }
  //   return u
  // }


  // lab = [
  //           [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //           [0, 1, 1, 1, 1, 1, 1, 1, 0],
  //           [0, 1, 1, 1, 1, 1, 1, 1, 0],
  //           [0, 1, 1, 1, 1, 1, 1, 1, 0],
  //           [0, 1, 1, 1, 1, 1, 1, 1, 0],
  //           [0, 1, 1, 1, 1, 1, 1, 1, 0],
  //           [0, 1, 1, 1, 1, 1, 1, 1, 0],
  //           [0, 1, 1, 1, 1, 1, 1, 1, 0],
  //           [0, 0, 0, 0, 0, 0, 0, 0, 0]
  //       ]

/*lab = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
            [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]*/


/*  lab = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0],
        ]*/

    // lab = [
    //         [0, 0, 0, 0],
    //         [0, 1, 1, 0],
    //         [0, 1, 1, 0],
    //         [0, 0, 0 ,0],
    //     ]
     /*lab = [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]
        ]*/