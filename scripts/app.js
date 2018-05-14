var _app = undefined; //for debugging purposes only.  don't write code with it

define([
  "util", "sph", "const", "events", "ui", "smoothmask"
], function(util, sph, cconst, events, ui, smoothmask) {
  'use strict';
  
  var exports = _app = {};
  
  window.STARTUP_FILE_NAME = "startup_file_spha4";
  
  var AppState = exports.AppState = class AppState extends events.EventHandler {
    report() {
      let str = "";
      
      for (let arg of arguments) {
        str += arg + " ";
      }
      str += "<br>"
      
      this.reportbuf.shift();
      this.reportbuf.push(str);
      
      let s = "";
      for (let line of this.reportbuf) {
        if (line === undefined) {
          continue;
        }
        s += line + "\n";
      }
      
      let div = document.getElementById("reportbox");
      div.innerHTML = s;
    }
    
    constructor() {
      super();
      
      this.reportbuf = new Array(5);
      
      this.mask_canvas = document.createElement("canvas");
      this.mask_g = this.mask_canvas.getContext("2d");
      
      this.last_save = 0;
      this.canvas = document.getElementById("canvas2d");
      this.g = this.canvas.getContext("2d");
      
      this.points = [];
      this.sph = new sph.Solver();
      this.sph.points = this.points;
      
      this.makeGUI();
      
      this.mask = undefined;
      this.reset();
    }
    
    makeGUI() {
      if (this.gui !== undefined) {
        this.gui.destroy();
      }
      
      this.gui = new ui.UI(STARTUP_FILE_NAME + "_", cconst);
      
      this.gui.button("reset", "Reset", () => {
        this.reset();
        window.redraw_all();
      });

      this.gui.check("SIMPLE_MODE", "Solve Mode");
      
      this.gui.button("load_image", "Load Test Image", () => {
        this.load_image().then((data) => {
            this.image = data;
            window.redraw_all();
            
            localStorage.startup_image_bn4 = data.dataurl;
        });
      });
      
      this.gui.button("reset_tick", "Reset Tick", () => {
        this.sph.tick = 0;
        window.redraw_all();
      });

      this.gui.button("savemask", "Download Mask", () => {
        this.download_mask();
      });
     
      this.gui.button("savemask", "Save to cache", () => {
        this.save_mask_to_cache();
      });
     
      let panel = this.gui.panel("Basic Settings");
      
      panel.slider("DIMEN", "Dimen", 64, 3.0, 256, 1.0, true, true);
      //panel.slider("TIMER_STEPS", "TimerSteps", 300, 1.0, 1024*32, 1.0, true, true);
      panel.slider("POINTSCALE", "Point Scale", 1.0, 0.0, 2.0, 0.001, false, true);
      
      panel = this.gui.panel("SPH Curve");
      cconst.SPH_CURVE = panel.curve("SPH_CURVE", "Filter Curve", cconst.SPH_CURVE).curve;

      panel = this.gui.panel("Image Curve");
      cconst.IMAGE_CURVE = panel.curve("IMAGE_CURVE", "Image Curve", cconst.IMAGE_CURVE).curve;
      
      panel = this.gui.panel("Tone Curve");
      cconst.TONE_CURVE = panel.curve("TONE_CURVE", "Tone Curve", cconst.TONE_CURVE).curve;
      
      panel = this.gui.panel("Settings2");
      panel.slider("PREPOWER", "PrePower", 1, 0.001, 9.0, 0.0001, false, true);
      panel.slider("RANGE", "Range", 255, 2, 255, 1, true, true);
      panel.slider("PATH_DEGREE", "Path Degree", 4, 1, 8, 1, true, true);
      panel.slider("PRESTEPS", "PreSteps", 16, 0, 1024, 1, true, true);
      panel.slider("ADV_STEPS", "AdvSteps", 32, 0, 255, 1, true, true);
      panel.slider("RADMUL", "Radius Factor", 0.8, 0.0, 1.0, 0.001, false, true);
      panel.slider("DV_DAMPING", "Damping", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("GENSTART", "GenStart", 0.05, 0.001, 0.5, 0.001, false, true);
      panel.close();      
    
      panel = this.gui.panel("Settings1");
    
      panel.check("ADV_SOLVE", "AdvancedSolve");
      panel.check("UPDATE_START_COS", "UpdateStartCos");
      
      panel.check("DRAW_TEST", "Draw Test");
      panel.slider("REPEAT", "Test Repeat", 5, 1, 45, 1, true, true);
      
      panel.slider("DISPLAY_LEVEL", "Display Level", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("STARTCO_BLEND", "Offset Blend", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("SOLVE_LEVEL", "Solve Level", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("PULL_FACTOR", "Pull Factor", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("PATH_SMOOTH_FACTOR", "Path Smoothing", 1.0, 0.0, 1.0, 0.001, false, true);
      
      panel.slider("SPH_SPEED", "Speed", 1.0, 0.005, 16.0, 0.01, false, true);
      panel.slider("SEARCHRAD", "Search Rad", 3.0, 0.1, 15.0, 0.01, false, true);
      //panel.slider("EXPONENT", "Exponent", 1.0, 0.001, 18.0, 0.001, false, true);
      
      panel = this.gui.panel("Draw Settings");
      
      panel.check("DRAW_KDTREE", "Draw kdtree");
      panel.check("SMALL_MASK", "Small Mask Mode");
      panel.check("XLARGE_MASK", "Extra Large Mask Mode");
      panel.check("SHOW_RADII", "Show Point Radius");
      panel.check("SHOW_PATHS", "Show Paths");
      
      this.gui.load();
    }
    
    load_image(dataurl) {
      let doaccept;
      
      let promise = new Promise((accept, reject) => {
        doaccept = accept;
      });
      
      let onload = (e) => {
        let data = e.target.result;
        let image = new Image();
        
        image.src = data;
        image.onload = (e) => {
          console.log("got image", image.width, image.height);
          
          let canvas = document.createElement("canvas");
          let g = canvas.getContext("2d");
          
          canvas.width = image.width;
          canvas.height = image.height;
          
          g.drawImage(image, 0, 0);
          let idata = g.getImageData(0, 0, image.width, image.height);
          
          let dataurl = canvas.toDataURL();
          idata.dataurl = dataurl;
          
          doaccept(idata);
        }
      };
      
      if (dataurl !== undefined) {
        onload({target : {result : dataurl}});
        return promise;
      }
      
      let input = document.createElement("input");
      input.type = "file";
      
      input.addEventListener("change", function(e) {
        let files = this.files;
        console.log("got file", e, files)
            
        if (files.length == 0) return;
        
        var reader = new FileReader();
        var this2 = this;
        
        reader.onload = onload;
        
        reader.readAsDataURL(files[0]);
      });
      
      input.click();
      return promise;
    }
    
    save_smoothmask() {
      let ps = this.sph.points;
      
      let pset = new smoothmask.PointSet(this.sph.dimen);
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let path = this.sph.getPath(pi, true);
        
        let gen = ps[pi+PGEN];
        gen = 1.0 - cconst.TONE_CURVE.evaluate(1.0 - gen);

        let p = new smoothmask.MaskPoint(pi/PTOT, gen, ps[pi+PR]); //, smoothmask.CurveTypes.LINEAR_NONUNIFORM);
        path.fillMaskPoint(p);
        //p.compress();
        
        pset.points.push(p);
      }
      
      /*
      let json = JSON.stringify(pset, (key, val) => {
        if (typeof val == "number") {
          let a = val.toFixed(5);
          let b = val.toString();
          
          return a.length < b.length ? a : b;
        }
        
        return val;
      });//*/
      
      return pset;
    }
    
    download_mask() {
      let file = this.save_mask();
      let blob = new Blob([file], {type : 'text/smooth-mask'});
      let url = URL.createObjectURL(blob);
      
      let a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", "smoothmask_" + this.sph.dimen + ".smask");
      a.setAttribute("target", "_blank");

      console.log("URL", url);
      
      a.click();
      window.a = a;
    }
    
    save_mask_to_cache() {
      console.log("saving pointset mask to local storage...");
      this.report("saving pointset mask to local storage...");

      localStorage.startup_mask_bn4 = this.save_mask();
      
      /*
      this.save_mask(true).then((url) => {
        console.log("saving mask to local storage...");
        this.report("saving mask to local storage...");
        localStorage.startup_mask_bn4 = url;
      });
      //*/
    }

    save_mask() {
      let buf = this.save_smoothmask().toBinary().toString();
      buf = "SMOOTHMASK" + buf;

      return buf;
    }

    reset() {
      let dimen;
      let mscale;
      let msize;
      
      if (cconst.USE_MASK && "sph_analyzer_ps" in localStorage) {
        this.points = JSON.parse(localStorage.sph_analyzer_ps);
        mscale = cconst.SMALL_MASK ? 1.0 : (cconst.XLARGE_MASK ? 8 : 4);
        
        dimen = Math.ceil(Math.sqrt(this.points.length/PTOT*1.2))*mscale;
        msize = dimen;
      } else {
        mscale = cconst.SMALL_MASK ? 1.0 : (cconst.XLARGE_MASK ? 8 : 4);
        dimen = cconst.DIMEN;
        
        msize = dimen*mscale;
      }
      
      this.mask_size = msize;
      this.mask = new ImageData(msize, msize);
      
      let md = this.mask.data;
      
      for (let i=0; i<md.length; i += 4) {
        md[i+3] = 255;
      }
      
      this.sph.reset(dimen);
      
      if (window.redraw_all !== undefined)
        window.redraw_all();
    }
    
    step() {
      this.sph.step();
      
      console.log("Done.");
      window.redraw_all();
    }
    
    setsize() {
      var w = window.innerWidth, h = window.innerHeight;
      
      var eventfire = this.canvas.width != w || this.canvas.height != h;
      
      if (this.canvas.width != w)
        this.canvas.width = w;
      if (this.canvas.height != h)
        this.canvas.height = h;
      
      if (eventfire)
        this.on_resize([w, h]);
    }
    
    draw() {
      this.setsize();
      
      let g = this.g;
      g.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      let w = this.canvas.width, h = this.canvas.height;
      let scale = w*0.5;
      
      g.save();
      
      g.scale(w*0.5, h*0.5);
      
      g.translate(0.25, 0.25);
      g.scale(1.0, w/h);
      
      g.fillStyle = g.strokeStyle = "black";
      
      g.beginPath();
      g.lineWidth /= scale;
      g.rect(0, 0, 1, 1);
      g.stroke();
      
      let ps = this.sph.points;
      g.beginPath();
      
      let mdata = this.mask.data;
      mdata.fill(255, 0, mdata.length);
      for (let i=0; i<mdata.length; i += 4) {
        mdata[i+3] = 255;
      }
      
      if (cconst.SHOW_PATHS) {
        let steps = 32, ds = 1.0 / steps;
        
        for (let i=0; i<ps.length; i += PTOT) {
          let path = this.sph.getPath(i);
          if (path === undefined) {
            continue;
          }
          
          let gen = ps[i+PGEN];
          if (gen > cconst.DISPLAY_LEVEL)
            continue;
          
          let r = this.sph.r*0.75*cconst.POINTSCALE;
          let lastp = undefined;
          
          g.beginPath();
          g.lineWidth = r*0.05;
          
          for (let s=0, j=0; j<steps; j++, s += ds) {
            if (s < gen) {
              continue;
            }
            
            let p = path.evaluate(s);
            
            if (lastp !== undefined && p.vectorDistance(lastp) > 0.25) {
              //sudden jump, probably caused by points wrapping around.
              //during solve
              
              //for now, just break
              break;
            }
            
            if (lastp === undefined) {
              g.moveTo(p[0], p[1]);
            } else {
              g.lineTo(p[0], p[1]);
            }
            
            lastp = p;
          }
          
          g.stroke();
        }
      }
      
      let solve_limit = this.timer !== undefined ? this.sph.cur_t : cconst.SOLVE_LEVEL;

      let repeat = cconst.DRAW_TEST ? cconst.REPEAT : 1;
      
      for (let rx=0; rx<repeat; rx++) {
      for (let ry=0; ry<repeat; ry++) {
      
      let offx = rx/repeat, offy = ry/repeat;
      for (let i=0; i<ps.length; i += PTOT) {
        let x = ps[i], y = ps[i+1], gen = ps[i+PGEN], r = ps[i+PR], val = ps[i+PVAL];
        
        if (cconst.DRAW_TEST) {
            x = ps[i+PSTARTX];
            y = ps[i+PSTARTY];            
        }

        x = x/repeat + offx;
        y = y/repeat + offy;

        let f = x;
        
        if (cconst.DRAW_TEST && this.image !== undefined) {
            let idata = this.image.data;
            let size = Math.max(this.image.width, this.image.height);

            let ix = ~~(x * size);
            let iy = ~~(y * size);

            if (ix < 0 || iy < 0 || ix >= this.image.width || iy >= this.image.height) {
                continue;
            }

            let idx = (iy*this.image.width + ix)*4;
            let s = (idata[idx]/255 + idata[idx+1]/255 + idata[idx+2]/255) / 3.0;

            f = s;
        }
        
        if (cconst.IMAGE_CURVE !== undefined && cconst.IMAGE_CURVE.evaluate !== undefined) {
            f = cconst.IMAGE_CURVE.evaluate(f);
        }
        
        f = f != 0.0 ? f**0.75 : f;
        let ff = 1.0 - Math.pow(1.0 - f, 2.0);
        f = f*0.5 + ff*0.5;

        if (gen > 1.0-f && cconst.DRAW_TEST) {
          continue;
        }
        
        let path = this.sph.getPath(i);
        if (path !== undefined) {
          let drawlvl;
          
          if (!cconst.DRAW_TEST) {
            drawlvl = Math.min(solve_limit, cconst.DISPLAY_LEVEL);
          } else {
            drawlvl = 1.0 - f;
          }
          
          let p = path.evaluate(drawlvl*0.999999);
          
          //x = Math.fract(p[0])/repeat+offx;
          //y = Math.fract(p[1])/repeat+offy;
          
          x = p[0]/repeat + offx;
          y = p[1]/repeat + offy;
        }
        
        x = ps[i+PSTARTX]/repeat + offx + (x - ps[i+PSTARTX]/repeat-offx) * cconst.STARTCO_BLEND;
        y = ps[i+PSTARTY]/repeat + offy + (y - ps[i+PSTARTY]/repeat-offy) * cconst.STARTCO_BLEND;
        
        //x = Math.fract(x);
        //y = Math.fract(y);
        
        //let w = r;
        let w;
        
        if (gen > solve_limit) {
          w = this.sph.r;
        } else {
          w = cconst.SIMPLE_MODE ? this.sph.cur_r : this.sph.r;
        }
        
        w *= cconst.POINTSCALE;
        
        f = 1.0 - gen;
        
        if (1.0-f > cconst.DISPLAY_LEVEL) {
          continue;
        }
        
        let alpha = gen > solve_limit ? 0.2 : 1.0;
        
        let ix = ~~(x*this.mask_size + 0.5);
        let iy = ~~(y*this.mask_size + 0.5);
        let idx = (iy*this.mask_size + ix)*4;
        
        let mgen = gen; //gen < cconst.START_THRESHOLD ? 0.0 : gen;
        
        let mf = 0.0; //mgen;
        
        let f1 = ~~(val*255*3);
        let f2=0, f3 = 0;
        
        if (f1 > 255) {
          f2 = f1 - 255;
          f1 = 255;
        }
        
        if (f2 > 255) {
          f3 = f2 - 255;
          f2 = 255;
          f1 = 0;
        }
        //f1=f2=f3=~~(val*255);
        //f1=f2=f3=~~((1.0-mf)*255);
        f1=~~((1.0-Math.sqrt(mf))*255), f2=f3=0.0;
        
        mf = ~~(mf*240 + 15);
        mdata[idx] = mf;
        mdata[idx+1] = mf;
        mdata[idx+2] = mf;
        
        g.beginPath();
        g.moveTo(x, y);
        g.arc(x, y, w/repeat, -Math.PI, Math.PI);
        if (cconst.DRAW_COLORS && !cconst.DRAW_TEST) {
          
          g.fillStyle = "rgba("+f1+","+f2+","+f3+","+alpha+")";
        } else {
          g.fillStyle = "black";
        }
        g.fill();
        
        if (cconst.SHOW_RADII) {
          r = ps[i+PR]*cconst.SEARCHRAD/repeat;
          
          g.beginPath();
          g.moveTo(x, y);
          g.arc(x, y, r, -Math.PI, Math.PI);
          
          if (cconst.DRAW_COLORS && !cconst.DRAW_TEST) {
            g.fillStyle = "rgba("+f1+","+f2+","+f3+","+(0.1*alpha)+")";
          } else {
            g.fillStyle = "black";
          }
          
          g.fill();
        }
        
        //g.rect(x-w*0.5, y-w*0.5, w, w);
      }
      
      g.fill();
      }
      }
      
      if (cconst.DRAW_KDTREE && this.sph.kdtree !== undefined) {
        this.sph.kdtree.draw(g);
      }
      
      g.restore();
      g.putImageData(this.mask, 10, 10)
    }
    
    save() {
      return JSON.stringify(this);
    }
    
    load(str) {
      this.loadJSON(JSON.parse(str));
      this.reset();
      this.gui.update();
      
      return this;
    }
    
    toJSON() {
      let cconsts2 = {};
      for (let k in cconst) {
        let v = cconst[k];
        
        if (k == k.toUpperCase() && typeof v != "function") {
          cconsts2[k] = v;
        }
      }
      
      return {
        version : cconst.APP_VERSION,
        consts  : cconsts2
      };
    }
    
    loadJSON(obj) {
      cconst.loadJSON(obj.consts);
      
      window.redraw_all();
      return this;
    }
    
    on_resize(newsize) {
      console.log("resize event");
    }
    
    on_mousedown(e) {
    }
    
    on_mousemove(e) {
    }
    
    on_mouseup(e) {
    }
    
    on_tick() {
      if (this.gui !== undefined) {
        this.gui.on_tick();
      }
      
      if (util.time_ms() - this.last_save > 900) {
        //console.log("autosaving");
        localStorage[STARTUP_FILE_NAME] = this.save();
        
        this.last_save = util.time_ms();
      }
    }
    
    on_keydown(e) {
      console.log(e.keyCode);
      
      if (e.ctrlKey || e.shiftKey || e.altKey || e.commandKey)
        return;
      
      switch (e.keyCode) {
        case 69: //ekey
          this.toggle_timer_loop();
          break;
        case 82: //rkey
          this.reset()
          break;
        case 68: //dkey
          this.step();
          window.redraw_all();
          break;
        case 76: //lkey
          this.sph.jitter();
          window.redraw_all();
          break;
        case 75: //kkey
          //this.sph.smoothPaths(cconst, 1.0, cconst.SmoothModes.POLYFIT);
          this.sph.compressPaths(cconst);
          window.redraw_all();
          break;
        default:
          break;
      }
    }
    
    toggle_timer_loop() {
      if (this.timer === undefined) {
        let i = 0;
        this.timer = window.setInterval(() => {
          let time = util.time_ms();
          
          while (util.time_ms() - time < 50) {
            //if (i > cconst.TIMER_STEPS) {
            //  window.clearInterval(this.timer);
            //  this.timer = undefined;
            //}
            
            this.sph.step();
            this.gui.redrawCurves();
            window.redraw_all();
            //this.step();
            if (i % 8 == 0) {
              this.report(i, "totbase", this.sph.totbase);
            }
            i++;
          }
        }, 32);
      } else {
        window.clearInterval(this.timer);
        this.timer = undefined;
      }
    }
  }
  
  function start() {
    var animreq = undefined;
    function dodraw() {
      animreq = undefined;
      _appstate.draw();
    }
    
    window.redraw_all = function redraw_all() {
      if (animreq !== undefined) {
        return;
      }
      
      animreq = requestAnimationFrame(dodraw);
    }
    
    window._appstate = new AppState();
    
    var canvas = document.getElementById("canvas2d");
    _appstate.pushModal(canvas, true);

    if (STARTUP_FILE_NAME in localStorage) {
      try {
        _appstate.load(localStorage[STARTUP_FILE_NAME]);
      } catch(error) {
        util.print_stack(error);
        console.log("failed to load startup file");
        
        window._appstate = new AppState();
        _appstate.pushModal(canvas, true);
        
        console.log("started!");
        window.redraw_all();
      }
      
    } else {
      //make base file
      console.log("started!");
      window.redraw_all();
    }
    
    if ("startup_image_bn4" in localStorage) {
      _appstate.load_image(localStorage.startup_image_bn4).then((idata) => {
        _appstate.image = idata;
        window.redraw_all();
      });
    }
    
    window.setInterval(function() {
      _appstate.on_tick();
    }, 250);
  }

  start();
  
  return exports;
});
