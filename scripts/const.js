var _const = undefined;

define([
], function() {
  'use strict';
  
  var exports = _const = {};
  
  exports._save_exclude = {
    _save_exclude : 1,
    SPH_CURVE     : 1,
    GEN_CURVE     : 1,
    TONE_CURVE    : 1
  };

  exports.gen_curve = function(s, ctx) {
    ctx = ctx === undefined ? exports : ctx;
    
    /*
    s = (1.0-s)*(1.0-s);
    return Math.exp(-(s*ctx.PARAM4)/(2.0*ctx.PARAM5*ctx.PARAM5));
    //*/
    
    return exports.GEN_CURVE.evaluate(s);
  }
  
  exports.gen_curve_inv = function(s, ctx) {
    /*
    let f;
    
    if (s == 0.0) return 0.0;
    
    f = 2.0*Math.log(1 / s) / ctx.PARAM4;
    f = f != 0.0 ? Math.sqrt(f) : 0.0;
    f *= Math.abs(ctx.PARAM5);

    return 1.0-f//Math.sqrt(f);
    
    //*/
    return exports.GEN_CURVE.inverse(s);
  }
  
  exports.APP_VERSION = 0.0001;
  
  exports.DIMEN = 64;
  exports.USE_MASK = false;
  
  exports.PROG_BASE_LAYER = false;
  exports.EXPONENT = 1.0;
  exports.PREPOWER = 2.0;  
  exports.TONE_IN_SOLVER = false;
  exports.KEEP_UNIFORM = false;
  exports.DRAW_COLORS = true;
  exports.SEARCHRAD = 5.0;
  exports.RMUL = 1.0;
  exports.SPH_SPEED = 1.0;
  exports.DISPLAY_LEVEL1 = 0.0;
  exports.DISPLAY_LEVEL2 = 1.0;
  exports.POINTSCALE = 1.0;
  
  exports.PARAM = 4.0;
  exports.PARAM2 = 0.0;
  exports.PARAM3 = 0.001;
  exports.PARAM4 = 5.0;
  exports.PARAM5 = 0.7;
  
  exports.TIMER_STEPS = 300;
  exports.START_THRESHOLD = 0.0;
  exports.GENSTART = 0.1;
  exports.SMALL_MASK = false;
  exports.XLARGE_MASK = false;
  exports.SHOW_RADII = true;
  exports.DV_DAMPING = 0.4;
  exports.VOIDCLUSTER = true;
  exports.ALTERNATE = false; //alternate between void-cluster and sph mode
  exports.GUASS_MIN = 0.1;
  exports.GUASS_POW = 1.0;
  exports.SCALE_GAUSS = false;
  exports.SCALE_RADIUS = false;
  exports.RADIUS_POW = 1.0;
  exports.PROPEGATE_W = true;
  exports.INITIAL_W_POWER = 4.0;
  exports.DRAW_KDTREE = false;
  exports.TONE_MASK = true;
  exports.SEARCHRAD2 = 4.0;
  
  //curve code lives in ui.js
  exports.CURVE_DEFAULTS = {
    SPH_CURVE  : undefined,
    GEN_CURVE  : {"points":[{"0":0,"1":0,"eid":77,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":78}},
    TONE_CURVE :{"points":[{"0":0.06875000000000006,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.13749999999999993,"1":0.5625,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":0.44375,"1":0.8062500000000001,"eid":9,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":10}}
  };
  
  exports.SPH_CURVE = exports.CURVE_DEFAULTS.SPH_CURVE;
  exports.GEN_CURVE = exports.CURVE_DEFAULTS.GEN_CURVE;
  exports.TONE_CURVE = exports.CURVE_DEFAULTS.TONE_CURVE;
  
  exports.EXP2 = 4.0;
 
  /*mask toning function
    
    Used either prior to solving or after, see TONE_IN_SOLVER.
    If after, any transformation applied prior to solve is first reversed 
    and then toning is applied (see PrePower, it applies pow(generation, PrePower) prior to solve,
    *but only if if TONE_IN_SOLVER is off*
   */
  exports.tonefunc = function(gen, ctx) {
    return ctx.TONE_CURVE.evaluate(gen);
    /*
    gen = 1.0 - gen;
    let t = 0.75;
    gen = Math.pow(gen, 1.5)*(1.0-t) + Math.pow(gen, ctx.EXPONENT)*t;
    gen = 1.0 - gen;
    //*/
    
    let off = exports.GENSTART; 
    //off = ctx.EXPONENT;
    gen = Math.max((gen - off) / (1.0 - off), 0.0);
    
    let exp2 = 3.25; //ctx.EXP2
    let exp1 = 0.7; //ctx.EXP2; //0.7;  //ctx.EXPONENT
    
    gen = 1.0 - Math.exp(-gen*exp2);
    gen = gen != 0.0 ? Math.pow(gen, exp1) : 0.0;
    
    return gen;
  }
  
  exports.tonefunc_inv = function(f, ctx) {
    return ctx.TONE_CURVE.inverse(gen);
  }
  
  exports.Equations = {
    W5       : 0,
    W4       : 1,
    W3       : 2,
    GUASSIAN : 3,
    CUBIC    : 4,
    POW      : 5
  };
  
  //points "data structure"
  window.PX=0;
  window.PY=1;
  window.POLDX=2;
  window.POLDY=3;
  window.PDX=4;
  window.PDY=5;
  window.PR=6;
  window.PR2=7
  window.PGEN=8;
  window.PSDX=9;
  window.PSDY=10;
  window.PSW=11;
  window.PSNUM=12;
  window.PVAL=13;
  window.POGEN=14;
  window.PTOT=15;
  
  exports.copy = function() {
    return this.toJSON();
  }
  
  exports.toJSON = function() {
    let ret = {};
    
    for (let k in this) {
      let v = this[k];
      
      if (k in exports._save_exclude) {
        continue;
      }
      
      if (typeof v == "function") {
        continue;
      }
      
      if (k[0] == "_") {
        continue;
      }
      
      ret[k] = v;
    }
    
    return ret;
  }
  
  exports.loadJSON = function loadJSON(obj) {
    for (let k in obj) {
      if (k in exports._save_exclude) {
        continue;
      }
      
      if (k[0] != "_") {
        exports[k] = obj[k];
      }
    }
  }
  
  
  function load(obj) {
    for (let k in obj) {
      exports[k] = obj[k];
    }
  }
 
  let defaults;
 //defaults = {"APP_VERSION":0.0001,"DIMEN":32,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.02,"PREPOWER":2,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"DRAW_COLORS":true,"SEARCHRAD":4.46,"RMUL":1,"SPH_SPEED":0.55,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.369,"PARAM":1,"PARAM2":7.555,"PARAM3":0.005,"TIMER_STEPS":33554432,"START_THRESHOLD":0.000575,"GENSTART":0.011,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"DV_DAMPING":1,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":1.5,"EXP2":3.35,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1};
 
 //defaults = {"APP_VERSION":0.0001,"DIMEN":28,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.02,"PREPOWER":0.5,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"DRAW_COLORS":true,"SEARCHRAD":4.97,"RMUL":1,"SPH_SPEED":1.49,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.406,"PARAM":1.826,"PARAM2":3.959,"PARAM3":0.186,"PARAM4":3,"PARAM5":0.721,"TIMER_STEPS":33554432,"START_THRESHOLD":0,"GENSTART":0.1,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"DV_DAMPING":1,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":3.35,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1};
 
 defaults = {"APP_VERSION":0.0001,"DIMEN":28,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":0.5,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"DRAW_COLORS":true,"SEARCHRAD":4,"RMUL":1,"SPH_SPEED":4.69,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.406,"PARAM":0.45,"PARAM2":3.751,"PARAM3":0.000001,"PARAM4":4,"PARAM5":0.721,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"GENSTART":0.05,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"DV_DAMPING":1,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}},"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1};
 
  load(defaults);
 
  return exports;
});
