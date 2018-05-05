var _app = undefined; //for debugging purposes only.  don't write code with it

define([
  "util", "sph", "const", "events", "ui"
], function(util, sph, cconst, events, ui) {
  'use strict';
  
  var exports = _app = {};
  
  window.STARTUP_FILE_NAME = "startup_file_spha3";
  
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

      this.gui.button("loadmask", "Load Mask", () => this.load_mask());
      this.gui.check("USE_MASK", "Use Mask");

      this.gui.button("reset_tick", "Reset Tick", () => {
        this.sph.tick = 0;
        window.redraw_all();
      });
      
      this.gui.button("savemask", "Save to cache", () => {
        this.save_mask_to_cache();
      });
     
      let panel = this.gui.panel("Basic Settings");
      
      panel.slider("DIMEN", "Dimen", 64, 3.0, 256, 1.0, true, true);
      panel.slider("TIMER_STEPS", "TimerSteps", 300, 1.0, 1024*32, 1.0, true, true);
      panel.slider("POINTSCALE", "Point Scale", 1.0, 0.0, 2.0, 0.001, false, true);
      
      panel = this.gui.panel("Tone Curve");
      cconst.TONE_CURVE = panel.curve("TONE_CURVE", "Tone Curve", cconst.TONE_CURVE).curve;
      
      panel = this.gui.panel("SPH Curve");
      cconst.SPH_CURVE = panel.curve("SPH_CURVE", "Filter Curve", cconst.SPH_CURVE).curve;

      panel = this.gui.panel("Gen Curve");
      let cw = panel.curve("GEN_CURVE", "Filter Curve", cconst.GEN_CURVE);
      
      //cw.overlay_curvefunc = cconst.gen_curve;
      cconst.GEN_CURVE = cw.curve;
      
      panel = this.gui.panel("Settings");
      
      panel.slider("DISPLAY_LEVEL2", "Display Level", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("SPH_SPEED", "Speed", 1.0, 0.005, 16.0, 0.01, false, true);
      panel.slider("SEARCHRAD", "Search Rad", 3.0, 0.1, 15.0, 0.01, false, true);
      //panel.slider("SEARCHRAD2", "Search Rad2", 4.0, 0.1, 15.0, 0.01, false, true);
      //panel.slider("DISPLAY_LEVEL1", "Display Level 1", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("START_THRESHOLD", "StartThresh", 0.2, 0.0, 1.0, 0.001, false, true);
      panel.slider("GENSTART", "GenStart", 0.05, 0.001, 0.5, 0.001, false, true);
      panel.slider("DV_DAMPING", "Damping", 1.0, 0.0, 1.0, 0.001, false, true);
      panel.slider("PARAM", "Param", 1.0, 0.001, 18.0, 0.001, false, true);
      panel.slider("PARAM2", "Param2", 0.0, 0.0, 18.5, 0.001, false, true);
      panel.slider("PARAM3", "Param3", 0.0000001, 0.000001, 1.5, 0.001, false, true);
      panel.slider("PARAM4", "Param4", 4.0, 0.0001, 18.0, 0.001, false, true);
      panel.slider("PARAM5", "Param5", 1.0, 0.0001, 8.0, 0.001, false, true);
      panel.check("TONE_MASK", "Tone Mask");
      //panel.slider("EXPONENT", "Exponent", 1.0, 0.001, 18.0, 0.001, false, true);
      
      panel = this.gui.panel("Settings2");
      
      panel.slider("PREPOWER", "PrePower", 1.0, 0.001, 5.0, 0.001, false, true);
      panel.check("PROG_BASE_LAYER", "ProgBaseLayer");
      panel.check("TONE_IN_SOLVER", "ToneInSolver");
      
      panel = this.gui.panel("Draw Settings");
      
      panel.check("DRAW_KDTREE", "Draw kdtree");
      panel.check("SMALL_MASK", "Small Mask Mode");
      panel.check("XLARGE_MASK", "Extra Large Mask Mode");
      panel.check("SHOW_RADII", "Show Point Radius");
      
      this.gui.load();
    }
    
    load_image() {
      let input = document.createElement("input");
      input.type = "file";
      
      let doaccept;
      
      let promise = new Promise((accept, reject) => {
        doaccept = accept;
      });
      
      input.addEventListener("change", function(e) {
        let files = this.files;
        console.log("got file", e, files)
            
        if (files.length == 0) return;
        
        var reader = new FileReader();
        var this2 = this;
        
        reader.onload = (e) => {
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
            
            doaccept(idata);
          }
        };
        
        reader.readAsDataURL(files[0]);
      });
      
      input.click();
      return promise;
    }
    
    load_mask() {
      this.load_image().then((img) => {
        let ps = this.points = this.sph.points = [];
        
        let idata = img.data;
        let w = img.width, h = img.height;
        
        let totpoint = 0;
        console.log("loading mask. . .");
        
        for (let i=0; i<w*h; i++) {
          let ix = i % w, iy = ~~(i / w);
          let idx = i*4;
          
          if (idata[idx] == 0) {
            continue;
          }
          
          let x = ix / w, y = iy / h;
          let pi = ps.length;
          
          for (let j=0; j<PTOT; j++) {
            ps.push(0);
          }
          
          ps[pi] = ps[pi+POLDX] = x;
          ps[pi+1] = ps[pi+POLDY] = y;
          ps[pi+PGEN] = 1.0 - idata[idx] / 255;
          
          totpoint++;
        }
        
        let mscale = img.width / Math.sqrt(totpoint);

        //round to nearest power of two
        mscale = Math.floor(0.5 + Math.log(mscale) / Math.log(2.0));
        mscale = Math.pow(2.0, mscale);
        
        console.log("totpoint:", totpoint);
        console.log("mask multiplication factor:", mscale);
        window.redraw_all();
        
        localStorage.sph_analyzer_ps = JSON.stringify(ps);
      });
    }
    
    save_mask_to_cache() {
      this.save_mask(true).then((url) => {
        console.log("saving mask to local storage...");
        this.report("saving mask to local storage...");
        localStorage.startup_mask_bn4 = url;
      });
    }

    save_mask(use_toDataURL) {
      var mask = this.mask;
      
      this.mask_canvas.width = mask.width;
      this.mask_canvas.height = mask.height;
      
      var mg = this.mask_g;
      mg.clearRect(0, 0, mask.width, mask.height);
      mg.putImageData(mask, 0, 0);
      
      return new Promise((accept, reject) => {
        if (use_toDataURL) {
          accept(this.mask_canvas.toDataURL());
        } else {
          this.mask_canvas.toBlob((blob) => {
            let url = URL.createObjectURL(blob);
            
            accept(url);
          });
        }
      });
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
      
      if (cconst.USE_MASK) {
        this.sph.points = this.points;
      } else {
        this.sph.throw();
        this.points = this.sph.points;
      }
      
      this.sph.calcRadii();
      
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
      mdata.fill(0, 0, mdata.length);
      for (let i=0; i<mdata.length; i += 4) {
        mdata[i+3] = 255;
      }
      
      for (let i=0; i<ps.length; i += PTOT) {
        let x = ps[i], y = ps[i+1], gen = ps[i+PGEN], r = ps[i+PR], val = ps[i+PVAL];
        //let w = r;
        let w = this.sph.r;
        
        w *= cconst.POINTSCALE;
        
        let f = 1.0 - gen;
        
        if (1.0-f > cconst.DISPLAY_LEVEL2 || 1.0-f < cconst.DISPLAY_LEVEL1) {
          continue;
        }
        
        let ix = ~~(x*this.mask_size + 0.5);
        let iy = ~~(y*this.mask_size + 0.5);
        let idx = (iy*this.mask_size + ix)*4;
        
        let mgen = gen; //gen < cconst.START_THRESHOLD ? 0.0 : gen;
        
        if (cconst.GEN_CURVE === undefined || cconst.GEN_CURVE.inverse === undefined) { //wait for curve? stupidly hackish!
          window.redraw_all();
          return;
        }
        
        let mf = mgen;
        mf = cconst.gen_curve_inv(mf, cconst);
        mf = mf != 0.0 ? Math.pow(mf, 1.0 / cconst.PREPOWER) : 0.0;
        
        mf = (cconst.TONE_IN_SOLVER || !cconst.TONE_MASK) ? 1.0 - mgen : 1.0 - cconst.tonefunc(mf, cconst);
        //mf = 1.0 - mgen; //XXX
        
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
        g.arc(x, y, w, -Math.PI, Math.PI);
        if (cconst.DRAW_COLORS) {
          
          g.fillStyle = "rgba("+f1+","+f2+","+f3+",1.0)";
        } else {
          g.fillStyle = "black";
        }
        g.fill();
        
        if (cconst.SHOW_RADII) {
          g.beginPath();
          g.moveTo(x, y);
          g.arc(x, y, r, -Math.PI, Math.PI);
          
          if (cconst.DRAW_COLORS) {
            g.fillStyle = "rgba("+f1+","+f2+","+f3+",0.1)";
          } else {
            g.fillStyle = "black";
          }
          
          g.fill();
        }
        
        //g.rect(x-w*0.5, y-w*0.5, w, w);
      }
      
      g.fill();
      
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
          this.sph.smooth();
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
          
          while (util.time_ms() - time < 32) {
            if (i > cconst.TIMER_STEPS) {
              window.clearInterval(this.timer);
              this.timer = undefined;
            }
            
            this.sph.smooth();
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
    
    window.setInterval(function() {
      _appstate.on_tick();
    }, 250);
  }

  start();
  
  return exports;
});
