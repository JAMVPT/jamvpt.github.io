## 🎮 Controls  
> #### ⭐ **Space Portion (2D)**  
> W/S - Move forwards/backwards  
> A/D - Rotate Counter-Clockwise/Clockwise  
> Space - Stop Rotating  
> Scroll up/down - Zoom in/out  
> / + 0 - Teleport to orbit around The Sun  
> / + 1 - Teleport to orbit around Mercury  
> / + 2 - Teleport to orbit around Venus  
> / + 3 - Teleport to orbit around Earth  
> / + 4 - Teleport to orbit around The Moon  
> / + 5 - Teleport to orbit around Mars  
> / + 6 - Teleport to orbit around Jupiter  
> / + 7 - Teleport to orbit around Saturn  
> / + 8 - Teleport to orbit around Uranus  
> / + 9 - Teleport to orbit around Neptune  

> #### 🌎 **Planet Portion (3D)**  
> W/A/S/D - Move  
> Space - Jump  
> E - Return to orbit  
> Click and Drag - Look Around  
---

## 🎨 Title  
Solar System Explorer  

---

## ✨ Description   
I chose this concept because I enjoy space and thought it would be fun to make a game involving orbital mechanics.  
I also was just messing around with trying to make 3D visuals and then realized it would be really cool to be able to land on the planets (and moon and sun) and explore.  

---

## ⚙️ Setup  
You can put the path to the HTML file into your browser or you will need to download p5.js on vs code or any IDE for that matter as well as a live server add on to run it via the html file.   

---

## 🔍 Reflection  
Things I could add:  
- Allow adjusting of controls and settings like FOV
- Show the controls in-game
- ⭐ Space:
    - Add other moons, asteroids, and commets
    - Make the orbit display be affected by all the bodies and not just the one you are orbiting. (This is really noticable when orbiting earth/moon and mercury)
    - On a similar note the orbit that you spawn in gets effected by other bodies and therefore doesn't work
    - Add animations to the rocket
- 🌎 Planet:  
    - Add surface scatter (Like rocks and trees)
    - Have an actual sky and not just the fog color
    - Show the sun while on the other planets
    - Have the sun move (I tried and it didn't look good so I removed it. So implement it wo that it looks good)
    - Fix edge cases with triangle sorting (z-buffer)
    - Add a landing animation
    - Add water to earth
    - Have the planet curve down in the distance
    - Have the planet loop like a real planet

The largest challenge I faced was time/scope which is why the experience isn't very polished. Other than that this project did require me to learn alot like orbital physics including all the math in displayOrbit() (The white and cyan lines), 3D rendering, Collision detection in 3D, and how to program Perlin Noise.  