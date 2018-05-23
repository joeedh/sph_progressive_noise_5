var _const = undefined;

define([
], function() {
  'use strict';
  
  var exports = _const = {};
  
  exports._save_exclude = {
    _save_exclude : 1,
    SPH_CURVE     : 1,
    GEN_CURVE     : 1,
    TONE_CURVE    : 1,
    IMAGE_CURVE   : 1
  };
  
  exports.SmoothModes = {
    SIMPLE  : 1,
    POLYFIT : 2
  };
  
  exports.PATH_DEGREE = 8;
  
  exports.SPH_CURVE = exports.GEN_CURVE = exports.TONE_CURVE = exports.IMAGE_CURVE = undefined;
  
  exports.DRAW_TEST = false;
  exports.DIMEN = 32;
  exports.MAX_SCALE = 8.0;
  exports.RADMUL = 0.8;
  exports.PATH_SMOOTH_FACTOR = 1.0;
  exports.SIMPLE_MODE = false;
  exports.DISPLAY_LEVEL = 1;
  exports.SOLVE_LEVEL = 1;
  exports.DV_DAMPING = 1.0;
  exports.GENSTART = 0.0;
  exports.PULL_FACTOR = 0.05;
  exports.RANGE = 255;
  exports.REPEAT = 5;
  exports.STARTCO_BLEND = 1.0;
  exports.PRESTEPS = 16;
  exports.PARAM1 = 0;
  exports.PARAM2 = 0;
  exports.PARAM3 = 0;
  exports.PARAM4 = 0;
  exports.PARAM5 = 0;
  exports.PARAM6 = 0;
  
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
  window.PSTARTX = 15;
  window.PSTARTY = 16;
  window.PTOT=17;
  
  exports.copy = function() {
    let ret = {};
    
    for (let k in this) {
      ret[k] = this[k];
    }
    
    return ret;
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
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"DRAW_TEST":true,"DIMEN":28,"MAX_SCALE":8,"RADMUL":0.8,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.1,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":10,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":6.7725,"PARAM2":1.1402,"PARAM3":0.1264,"PARAM4":3,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"DRAW_COLORS":true,"SEARCHRAD":2,"RMUL":1,"SPH_SPEED":4.15,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.35,"PARAM":0.45,"PARAM5":0.721,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}},"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32};
 
  load(defaults);
 
  return exports;
});
