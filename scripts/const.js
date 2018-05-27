var _const = undefined;

define([
], function() {
  'use strict';
  
  var exports = _const = {};
  
  exports._save_exclude = {
    _save_exclude : 1,
    //SPH_CURVE     : 1,
    //RADIUS_CURVE     : 1,
    //TONE_CURVE    : 1,
    //IMAGE_CURVE   : 1
  };
  
  exports.SmoothModes = {
    SIMPLE  : 1,
    POLYFIT : 2
  };
  
  exports.PATH_DEGREE = 8;
  
  exports.SPH_CURVE = exports.RADIUS_CURVE = exports.TONE_CURVE = exports.IMAGE_CURVE = undefined;
  exports.APPLY_TONING = false;
  
  exports.SEARCHRAD = 1.5;
  exports.CMYK_SEARCHRAD = 4;
  
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
  exports.PARAM7 = 0;
  exports.DRAW_INTENSITY = false;
  exports.DRAW_COLORS = true;
  exports.IMAGE_COLORS = true;
  exports.USE_IMAGE = true;
  exports.GENSTEPS = 255;
  
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
  window.PCOLOR = 17;
  window.PTOT=18;
  
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
      for (let k in this) {
        
      }
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
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"DRAW_TEST":true,"DIMEN":22,"MAX_SCALE":8,"RADMUL":0.8,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.01,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":12,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":5,"PARAM2":0.7,"PARAM3":1.0276,"PARAM4":-0.5494,"PARAM5":1,"PARAM6":0,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"DRAW_INTENSITY":true,"SEARCHRAD":2,"RMUL":1,"SPH_SPEED":5.41,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.28,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}},"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32};
 
 
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"DRAW_TEST":true,"DIMEN":17,"MAX_SCALE":8,"RADMUL":0.8,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.01,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":10,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":4,"PARAM2":0.04,"PARAM3":2.0414,"PARAM4":0.5,"PARAM5":1,"PARAM6":0,"DRAW_INTENSITY":true,"DRAW_COLORS":true,"USE_IMAGE":false,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"SEARCHRAD":1.3,"RMUL":1,"SPH_SPEED":1.6300000000000001,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.3,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}},"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32};
 
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"SEARCHRAD":1.4,"CMYK_SEARCHRAD":2,"DRAW_TEST":true,"DIMEN":24,"MAX_SCALE":8,"RADMUL":0.8,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.01,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":9,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":1.5,"PARAM2":0.2,"PARAM3":2.5,"PARAM4":0.5,"PARAM5":1,"PARAM6":0.9,"PARAM7":1.5,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":false,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":1.27,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.24,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}},"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4};
 
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0.49375000000000013,"eid":10,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":11}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.23124999999999998,"1":0.6312500000000001,"eid":23,"flag":0,"deg":3,"tangent":1},{"0":0.5187500000000002,"1":0.9500000000000002,"eid":17,"flag":0,"deg":3,"tangent":1},{"0":0.96875,"1":1,"eid":3,"flag":1,"deg":3,"tangent":1}],"eidgen":{"_cur":24}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"SEARCHRAD":1.4,"CMYK_SEARCHRAD":2,"DRAW_TEST":true,"DIMEN":24,"MAX_SCALE":8,"RADMUL":0.8,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.01,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":9,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":1.5,"PARAM2":0.2,"PARAM3":2.5,"PARAM4":0.5,"PARAM5":1,"PARAM6":0.9,"PARAM7":1.5,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":false,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":1.27,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.24,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4};
 
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.4375,"1":0.14375000000000004,"eid":12,"flag":0,"deg":3,"tangent":1},{"0":0.5687500000000001,"1":0.08750000000000013,"eid":10,"flag":0,"deg":3,"tangent":1},{"0":0.8375000000000001,"1":0.7125,"eid":11,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":13}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.23124999999999998,"1":0.6312500000000001,"eid":23,"flag":0,"deg":3,"tangent":1},{"0":0.5187500000000002,"1":0.9500000000000002,"eid":17,"flag":0,"deg":3,"tangent":1},{"0":0.96875,"1":1,"eid":3,"flag":1,"deg":3,"tangent":1}],"eidgen":{"_cur":24}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"SEARCHRAD":1.75,"CMYK_SEARCHRAD":2,"DRAW_TEST":true,"DIMEN":32,"MAX_SCALE":8,"RADMUL":0.8,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.05,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":10,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":2,"PARAM2":0.2,"PARAM3":2.7173000000000003,"PARAM4":0.5,"PARAM5":1,"PARAM6":0.9,"PARAM7":1.2,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":true,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":1.2,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.3,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}}};
 
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.2812500000000001,"1":0.30000000000000004,"eid":12,"flag":1,"deg":3,"tangent":1},{"0":0.6875000000000003,"1":0.6312499999999999,"eid":11,"flag":0,"deg":3,"tangent":1},{"0":1,"1":0.9187500000000001,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":0.9125,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":14}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.23124999999999998,"1":0.6312500000000001,"eid":23,"flag":0,"deg":3,"tangent":1},{"0":0.5187500000000002,"1":0.9500000000000002,"eid":17,"flag":0,"deg":3,"tangent":1},{"0":0.96875,"1":1,"eid":3,"flag":1,"deg":3,"tangent":1}],"eidgen":{"_cur":24}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"SEARCHRAD":1.6,"CMYK_SEARCHRAD":2,"DRAW_TEST":false,"DIMEN":28,"MAX_SCALE":8,"RADMUL":0.8,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.05,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":12,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":2,"PARAM2":0.2,"PARAM3":2.7173000000000003,"PARAM4":0.5,"PARAM5":1,"PARAM6":0.9,"PARAM7":1.5,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":true,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":0.5,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.325,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}}}
 
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.3750000000000002,"1":0.15000000000000013,"eid":12,"flag":0,"deg":3,"tangent":1},{"0":0.6187500000000005,"1":0.7562499999999996,"eid":11,"flag":1,"deg":3,"tangent":1},{"0":0.9937499999999999,"1":0.8374999999999999,"eid":3,"flag":0,"deg":3,"tangent":1},{"0":1,"1":0.88125,"eid":2,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":15}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.2125,"1":0.6312500000000001,"eid":23,"flag":1,"deg":3,"tangent":1},{"0":0.5312500000000001,"1":0.9000000000000001,"eid":17,"flag":0,"deg":3,"tangent":1},{"0":0.96875,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":24}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"APPLY_TONING":false,"SEARCHRAD":2.5,"CMYK_SEARCHRAD":2,"DRAW_TEST":true,"DIMEN":28,"MAX_SCALE":1,"RADMUL":0.9,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.05,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":6,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":2,"PARAM2":0.5,"PARAM3":3,"PARAM4":1,"PARAM5":1,"PARAM6":1,"PARAM7":1,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":false,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":0.15,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.2,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}}};
 

 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.45625000000000027,"1":0.03125000000000022,"eid":12,"flag":0,"deg":3,"tangent":1},{"0":0.475,"1":0.15000000000000013,"eid":15,"flag":1,"deg":3,"tangent":1},{"0":0.8187500000000004,"1":0.8499999999999996,"eid":11,"flag":1,"deg":3,"tangent":1},{"0":0.9937499999999999,"1":0.8374999999999999,"eid":3,"flag":0,"deg":3,"tangent":1},{"0":1,"1":0.88125,"eid":2,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":16}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.2125,"1":0.6312500000000001,"eid":23,"flag":1,"deg":3,"tangent":1},{"0":0.5312500000000001,"1":0.9000000000000001,"eid":17,"flag":0,"deg":3,"tangent":1},{"0":0.96875,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":24}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"APPLY_TONING":false,"SEARCHRAD":3,"CMYK_SEARCHRAD":2,"DRAW_TEST":true,"DIMEN":28,"MAX_SCALE":1,"RADMUL":0.9,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.05,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":8,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":2,"PARAM2":0.5,"PARAM3":3,"PARAM4":1,"PARAM5":1,"PARAM6":1.5,"PARAM7":1.5,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":false,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":0.15,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.2,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}}};
 
 defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.45625000000000027,"1":0.03125000000000022,"eid":12,"flag":0,"deg":3,"tangent":1},{"0":0.475,"1":0.15000000000000013,"eid":15,"flag":1,"deg":3,"tangent":1},{"0":0.8187500000000004,"1":0.8499999999999996,"eid":11,"flag":1,"deg":3,"tangent":1},{"0":0.9937499999999999,"1":0.8374999999999999,"eid":3,"flag":0,"deg":3,"tangent":1},{"0":1,"1":0.88125,"eid":2,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":16}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.3125,"1":0.8250000000000002,"eid":28,"flag":0,"deg":3,"tangent":1},{"0":0.7875,"1":0.95625,"eid":27,"flag":0,"deg":3,"tangent":1},{"0":0.9749999999999998,"1":1,"eid":3,"flag":1,"deg":3,"tangent":1}],"eidgen":{"_cur":29}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"APPLY_TONING":true,"SEARCHRAD":3,"CMYK_SEARCHRAD":1,"DRAW_TEST":true,"DIMEN":28,"MAX_SCALE":1,"RADMUL":0.95,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.05,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":6,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":2,"PARAM2":0.5,"PARAM3":2,"PARAM4":0.7,"PARAM5":1,"PARAM6":0.8,"PARAM7":1,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":false,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":0.2,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.2,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}}};
 
  defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.45625000000000027,"1":0.03125000000000022,"eid":12,"flag":0,"deg":3,"tangent":1},{"0":0.475,"1":0.15000000000000013,"eid":15,"flag":1,"deg":3,"tangent":1},{"0":0.8187500000000004,"1":0.8499999999999996,"eid":11,"flag":1,"deg":3,"tangent":1},{"0":0.9937499999999999,"1":0.8374999999999999,"eid":3,"flag":0,"deg":3,"tangent":1},{"0":1,"1":0.88125,"eid":2,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":16}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.3125,"1":0.8250000000000002,"eid":28,"flag":0,"deg":3,"tangent":1},{"0":0.7875,"1":0.95625,"eid":27,"flag":0,"deg":3,"tangent":1},{"0":0.9749999999999998,"1":1,"eid":3,"flag":1,"deg":3,"tangent":1}],"eidgen":{"_cur":29}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"APPLY_TONING":false,"SEARCHRAD":3,"CMYK_SEARCHRAD":3,"DRAW_TEST":true,"DIMEN":28,"MAX_SCALE":1,"RADMUL":0.95,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.05,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":9,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":2,"PARAM2":0.5,"PARAM3":2,"PARAM4":0.7,"PARAM5":1,"PARAM6":0.8,"PARAM7":1,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":false,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":0.2,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.2,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}}};
  
  defaults = {"SmoothModes":{"SIMPLE":1,"POLYFIT":2},"PATH_DEGREE":8,"IMAGE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.14375000000000002,"1":0.012499999999999956,"eid":16,"flag":1,"deg":3,"tangent":1},{"0":0.675,"1":0.0062500000000002,"eid":15,"flag":0,"deg":3,"tangent":1},{"0":0.7062500000000005,"1":0.9812499999999998,"eid":11,"flag":0,"deg":3,"tangent":1},{"0":0.9999999999999999,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":17}},"TONE_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":28,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":30}},"SPH_CURVE":{"points":[{"0":0,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.25625,"1":0.07499999999999996,"eid":7,"flag":0,"deg":3,"tangent":1},{"0":0.5,"1":0,"eid":8,"flag":0,"deg":3,"tangent":1},{"0":0.65625,"1":0.09375,"eid":5,"flag":0,"deg":3,"tangent":1},{"0":0.7500000000000001,"1":0.07500000000000018,"eid":4,"flag":0,"deg":3,"tangent":1},{"0":0.9187500000000001,"1":0.8375,"eid":6,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}},"APPLY_TONING":false,"SEARCHRAD":3,"CMYK_SEARCHRAD":3,"DRAW_TEST":true,"DIMEN":28,"MAX_SCALE":1,"RADMUL":0.95,"PATH_SMOOTH_FACTOR":1,"SIMPLE_MODE":true,"DISPLAY_LEVEL":1,"SOLVE_LEVEL":1,"DV_DAMPING":1,"GENSTART":0.05,"PULL_FACTOR":0.05,"RANGE":255,"REPEAT":8,"STARTCO_BLEND":1,"PRESTEPS":16,"PARAM1":2,"PARAM2":0.5,"PARAM3":2,"PARAM4":0.7,"PARAM5":1,"PARAM6":0.8,"PARAM7":1,"DRAW_INTENSITY":false,"DRAW_COLORS":false,"IMAGE_COLORS":true,"USE_IMAGE":true,"GENSTEPS":4096,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":1,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"RMUL":1,"SPH_SPEED":0.2,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.2,"PARAM":0.45,"TIMER_STEPS":33554432,"START_THRESHOLD":0.3,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1,"SHOW_PATHS":false,"UPDATE_START_COS":false,"ADV_SOLVE":false,"ADV_STEPS":32,"CMYRK_SEARCHRAD":4,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}}};
  
  load(defaults);
  
  return exports;
});
