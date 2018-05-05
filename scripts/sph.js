var _sph = undefined;

define([
  "util", "vectormath", "kdtree", "const"
], function(util, vectormath, kdtree, cconst) {
  "use strict";
  
  function urand(steps=4) {
    let ret = 0;
    
    for (let i=0; i<steps; i++) {
      ret += util.random();
    }
    
    return ret / steps;
  }
  
  let exports = _sph = {};
  let gridoffs = [
    [0, 0],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    
    [0, 1],
    [1, 1],
    [1, 0],
    
    [1, -1],
    [0, -1]
  ];
  
  let weightfuncs = [
    (w, r, pxsize, param) => w*w*w*w*w,
    (w, r, pxsize, param) => w*w*w*w,
    (w, r, pxsize, param) => w*w*w,
    
    //from original paper: http://cv.ulichney.com/papers/1993-void-cluster.pdf
    //r in guassian is multiplied by pixel size
    (w, r, pxsize, param, r1, r2, max_r, gen1, gen2, cconst_ctx) => {
      if (cconst_ctx.SCALE_GAUSS) {// && r2 > r1) {
        let fac;
        
        /*
        fac = r1/r2;
        Math.max(fac*(1.0-cconst_ctx.GUASS_MIN) + cconst_ctx.GUASS_MIN, cconst_ctx.GUASS_MIN);
        //*/
        
        //*
        if (gen1 > 1.0) {
          console.log("gen1", gen1, gen2);
          throw new Error();
        }
        
        fac = r2/r1; //gen1//max_r/r1; //r1/r2;
        fac = Math.pow(fac, cconst_ctx.GUASS_POW);
        
        //fac = fac*fac*fac;
        //fac = Math.pow(Math.abs(fac), 0.15)*Math.sign(fac);
        fac = cconst_ctx.W_PARAM + (cconst_ctx.GUASS_MIN - cconst_ctx.W_PARAM) * fac;
        //*/
        param *= fac;
      }
      
      //param *= Math.max(r1/max_r*(1.0-cconst_ctx.GUASS_MIN) + cconst_ctx.GUASS_MIN, cconst_ctx.GUASS_MIN);
      
      return Math.exp(-(r*r*pxsize*pxsize)/(2.0*param*param));
    },
    (w, r, pxsize, param) => w*w*(3.0 - 2.0*w),
    (w, r, pxsize, param) => Math.pow(w, param)
  ];
  
  let weightfunc = exports.weightfunc = function weightfunc(f, r, r1, r2, max_r, voidcluster, gen1, gen2, cconst_ctx) {
    let pxsize = cconst_ctx.DIMEN;
    let eq = voidcluster ? cconst_ctx.W_EQUATION : cconst_ctx.SPH_EQUATION;
    let param = voidcluster ? cconst_ctx.W_PARAM : cconst_ctx.SPH_PARAM;
    
    return weightfuncs[eq](1.0 - f, r, pxsize, param, r1, r2, max_r, gen1, gen2, cconst_ctx);
  }
  
  let calcradius = function(totpoint, cconst_ctx) {
    return cconst_ctx.RMUL / Math.sqrt(totpoint) / Math.sqrt(2.0);
    //return cconst.RMUL * 1.0 / Math.sqrt(totpoint * 2.0 * Math.sqrt(3.0));
  }
  
  let Solver = exports.Solver = class Solver {
    constructor(dimen) {
      this.reset(dimen);
    }
    
    reset(dimen) {
      this.dimen = dimen;
      this.points = [];
      this.totpoint = 0;
      this.tick = 0;
      this.r = 0;
      this.totbase = 0.0;
      this.maxgen = 1.0;
    }
    
    throw2() {
      let totpoint = this.dimen*this.dimen*0.95;
      let ps = this.points;
      
      let genstart = totpoint*cconst.GENSTART;
      let maxgen = totpoint + genstart;
      
      this.maxgen = maxgen;
      let dimen2 = Math.floor(Math.sqrt(totpoint));
      
      for (let i=0; i<totpoint; i++) {
        let i2 = i;
        
        let ix = i2 % dimen2, iy = ~~(i2 / dimen2);
        let x = ix/dimen2, y = iy/dimen2;
        
        let pi = ps.length;
        for (let j=0; j<PTOT; j++) {
          ps.push(0.0);
        }
        
        let gen = i/totpoint;
        gen = Math.fract(gen*Math.PI*363.324 + y*23.24);
        
        if (cconst.TONE_IN_SOLVER) {
          gen = cconst.tonefunc(gen, cconst);
        } else {
          //gen = Math.sqrt(gen);
          gen = Math.pow(gen, cconst.PREPOWER);
        }
        
        let r = 0.8 / Math.sqrt(2 + gen*totpoint);
        
        ps[pi] = x;
        ps[pi+1] = y;
        ps[pi+PGEN] = gen;
        ps[pi+POGEN] = gen;
        ps[pi+PR] = r;
      }
    }

    throw() {
      let totpoint = this.dimen*this.dimen*0.95;
      let ps = this.points;
      
      let genstart = totpoint*cconst.GENSTART;
      let maxgen = totpoint + genstart;
      
      this.maxgen = maxgen;
      let dimen2 = Math.floor(Math.sqrt(totpoint));
      this.r = undefined;
      
      for (let i=0; i<totpoint; i++) {
        //let i2 = ~~(Math.random()*totpoint*0.9999);
        //let ix = i2 % dimen2, iy = ~~(i2 / dimen2);
        let x = util.random(), y = util.random();
        //let x = ix/dimen2, y = iy/dimen2;
        //x += (util.random()-0.5)/dimen2/3.0;
        //y += (util.random()-0.5)/dimen2/3.0;
        
        let pi = ps.length;
        for (let j=0; j<PTOT; j++) {
          ps.push(0.0);
        }
        
        let ff = genstart / totpoint;
        
        let gen = i/totpoint;
        gen = cconst.GENSTART + gen*(1.0 - cconst.GENSTART);
        //gen = ff + gen*(1.0 - ff);
        
        if (cconst.TONE_IN_SOLVER) {
          gen = cconst.tonefunc(gen, cconst);
        } else {
          //gen = Math.sqrt(gen);
          gen = Math.pow(gen, cconst.PREPOWER);
        }
        
        let r = 0.8 / Math.sqrt(genstart + gen*totpoint);
        
        ps[pi] = x;
        ps[pi+1] = y;
        ps[pi+PGEN] = gen;
        ps[pi+POGEN] = gen;
        ps[pi+PR] = r;
        
        this.r = this.r === undefined ? r : Math.min(r, this.r);
      }
      
      //XXX get rid of prior radius calculations 
      this.r = 1.0 / Math.sqrt(this.points.length/PTOT);
    }
    
    makeKDTree() {
      let kd = this.kdtree = new kdtree.KDTree([-2.5, -2.5, -2.5], [2.5, 2.5, 2.5]);
      
      let ps = this.points;
      let co = [0, 0, 0];
      let visit = {};
      let totpoint = 0;

      while (totpoint < ps.length/PTOT) {
        let pi = ~~(Math.random()*0.999999*ps.length/PTOT);
        if (pi in visit) {
          continue;
        }
        
        visit[pi] = 1;
        pi *= PTOT;
        totpoint++;
        
      //for (let pi=0; pi<ps.length; pi += PTOT) {
        kd.insert(ps[pi], ps[pi+1], pi);
      }
      
      return kd;
    }

    updateVelocity(ctx) {
      ctx = ctx === undefined ? cconst : ctx;
      
      let ps = this.points;
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let fac = ctx.DV_DAMPING;
        let dx, dy, mindv=1e17;

        //calc derivatives.  complicated by toroidal domain
        for (let off of gridoffs) {
          let dx2 = ps[pi] - (ps[pi+POLDX] + off[0]);
          let dy2 = ps[pi+1] - (ps[pi+POLDY] + off[1]);
          let dis = dx2*dx2 + dy2*dy2;
          
          if (dis < mindv) {
            mindv = dis;
            ps[pi+PDX] = dx2;
            ps[pi+PDY] = dy2;
          }
        }
        
        ps[pi+PDX] *= fac;
        ps[pi+PDY] *= fac;
        
        ps[pi+POLDX] = ps[pi];
        ps[pi+POLDY] = ps[pi+1];
      }
    }
    
    applyVelocity(ctx) {
      ctx = ctx === undefined ? cconst : ctx;
      
      let ps = this.points;
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        ps[pi] += ps[pi+PDX];
        ps[pi+1] += ps[pi+PDY];
        
        ps[pi] = Math.fract(ps[pi]);
        ps[pi+1] = Math.fract(ps[pi+1]);
      }
    }
    
    calcRadii(ctx) {
      if (!cconst.USE_MASK) {
        return;
      }
      
      let tree = this.makeKDTree();
      let totpoint = this.points.length/PTOT;
      let ps = this.points;
      
      this.r = 0.5 / Math.sqrt(totpoint);
      let sumdis = 0.0, sumtot = 0.0, searchr, x1, y1, gen1, pi;
      
      let callback = (pi2) => {
        if (pi2 == pi) {
          return;
        }
        let x2 = ps[pi2], y2 = ps[pi2+1], gen2 = ps[pi2+PGEN];
        
        let dx = x2-x1, dy = y2-y1;
        let dis = dx*dx + dy*dy;
        
        if (dis == 0.0 || dis > searchr*searchr) {
          return;
        }
        
        if (gen2 > gen1) {
          return;
        }
        
        dis = Math.sqrt(dis);
        
        let w = 1.0 - dis/searchr;
        
        w = w*w*w;
        let w2 = (1.0 + gen1) / (1.0 + gen2);
        w *= w2*w2;
        
        sumdis += dis*w;
        sumtot += w;
      }
      
      let minr = undefined;
      
      for (pi=0; pi<ps.length; pi += PTOT) {
        x1 = ps[pi], y1 = ps[pi+1], gen1 = ps[pi+PGEN];
        let r = 6.0 / Math.sqrt(ps.length/PTOT*0.075 + gen1*ps.length/PTOT);
        
        searchr = r;
        sumdis = sumtot = 0.0;
        tree.forEachPoint(x1, y1, searchr, callback);
        
        if (sumtot != 0.0) {
          r = sumdis / sumtot * 0.5; //why do I have to multiply by 1/2?
          ps[pi+PR] = r;
          
          minr = minr === undefined ? r : Math.min(minr, r);
        } else { //estimate
          r = 1.5 / Math.sqrt(ps.length/PTOT*0.075 + gen1*ps.length/PTOT);
          ps[pi+PR] = r;
        }
        
        /*
        r = 0.9 / Math.sqrt(ps.length/PTOT);
        ps[pi+PR] = r;
        //*/
      }
      
      this.r = minr;
    }
    
    jitter() {
      let ps = this.points;
      let size = this.r;
      
      for (let i=0; i<ps.length; i += PTOT) {
        ps[i] += (util.random()-0.5)*2.0*size;
        ps[i+1] += (util.random()-0.5)*2.0*size;
        
        ps[i] = Math.min(Math.max(ps[i], 0.0), 1.0);
        ps[i+1] = Math.min(Math.max(ps[i+1], 0.0), 1.0);
      }
    }
    
    step(ctx) {
      this.smooth();
    }
    
    step_old(ctx) {
      let tree = this.makeKDTree();
      let totpoint = this.points.length/PTOT;
      let ps = this.points;
      
      let maxr = undefined, minr = undefined;
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let r = ps[pi+PR];
        
        maxr = maxr === undefined ? r : Math.max(r, maxr);
        minr = minr === undefined ? r : Math.min(r, minr);
      }
      
      let pi, sumgen = 0.0, sumr = 0.0, sumdis = 0.0, sumtot = 0.0, searchr, x1, y1, gen1, r1, sumtot2;
      
      let callback = (pi2) => {
        if (pi2 == pi) {
          return;
        }
        
        let x2 = ps[pi2], y2 = ps[pi2+1], gen2 = ps[pi2+PGEN], r2 = ps[pi2+PR];
        
        let dx = x2-x1, dy = y2-y1;
        let dis = dx*dx + dy*dy;
        
        if (dis == 0.0 || dis > searchr*searchr) {
          return;
        }
        
        if (gen2 > gen1) {
          return;
        }
        
        dis = Math.sqrt(dis);
        
        let w = 1.0 - dis/searchr;
        
        w = w*w*(3.0 - 2.0*w);
        //w *= w;
        
        let g = Math.abs(gen1-gen2);
        
        sumr += r2*w;
        sumgen += g*w;
        sumdis += dis*w;
        sumtot += w;
        sumtot2 += 1.0;
      }
      
      for (pi=0; pi<ps.length; pi += PTOT) {
        x1 = ps[pi], y1 = ps[pi+1], gen1 = ps[pi+PGEN], r1 = ps[pi+PR];
        let r = r1*4.0;
        
        searchr = r1*2.0;
        sumdis = sumtot = sumgen = sumr = sumtot2 = 0.0;
        
        tree.forEachPoint(x1, y1, searchr, callback);
        
        if (sumtot == 0.0) {
          continue;
        }
        
        //sumgen /= sumtot;
        sumdis /= sumtot;
        sumr /= sumtot;
        
        let f;
        
        //f = (sumr*sumr*Math.PI)/this.r*4.0;
        f = sumgen / sumtot;
        
        ps[pi+PVAL] = f;
      }
      
      console.log("Step done");
    }
    
    smooth(ctx) {
      this.applyVelocity(ctx);
      this.smooth_intern(ctx);
      this.updateVelocity(ctx);
      this.tick++;
    }
    
    smooth_intern(ctx) {
      ctx = ctx === undefined ? cconst : ctx;
      
      window.minfac = window.maxfac = undefined;
      
      let param = 0.5 + this.tick*0.125;
      
      param = Math.min(param, ctx.PARAM);
      window.param = param;
      
      const thresh = ctx.START_THRESHOLD;
      let ps = this.points;
      
      let searchfac = ctx.SEARCHRAD;
      let speed = ctx.SPH_SPEED;
      
      let sumdx, sumdy, sumw, sumtot, x1, y1, r1, pi1, gen1, searchr, off;
      let testgen;
      
      let tree = this.makeKDTree();
      
      this.totbase = 0;
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let gen = ps[pi+POGEN];
        
        ps[pi+PGEN] = ctx.gen_curve(gen, ctx);
        
        if (ps[pi+PGEN] < thresh) {
          this.totbase++;
        }
        
        ps[pi+POLDX] = ps[pi];
        ps[pi+POLDY] = ps[pi+1];
      }
      
      let callback = (pi2) => {
        if (pi2 == pi1) {
          return;
        }
        
        let x2 = ps[pi2+POLDX], y2 = ps[pi2+POLDY], r2 = ps[pi2+PR], gen2 = ps[pi2+PGEN];
        let searchr2 = searchr;
        
        let dx = x1+off[0] - x2, dy = y1+off[1] - y2;
        let dis = dx*dx + dy*dy;
        
        if (testgen) {
        //  searchr2 = this.r * ((a+dd) / (b+dd) * ctx.PARAM + ctx.PARAM2);
        }
        
        if (dis == 0.0) {// || dis > searchr2*searchr2) {
          return;
        }
        
        dis = Math.sqrt(dis);
        let w = 1.0 - dis / searchr2;

        //*
        if (gen2 > gen1 && (testgen || ctx.PROG_BASE_LAYER)) { //ctx.PROG_BASE_LAYER && !testgen && gen2 > gen1) {
          //w *= 0.7;
          
          if (!testgen) {
            let f = (gen1-gen2) / thresh;
            w *= f;
            //w *= 0.0;
            //dis *= 0.0;
            return;
          }
          //return;
        } else if (!ctx.PROG_BASE_LAYER && !testgen && gen2 > thresh) {
          w *= 0.0;
          dis *= 0.0;
          //return;
        }//*/
        
        if (/*ctx.PROG_BASE_LAYER ||*/ testgen) {
          //so, this little equation actually *works*.  bleh!
          let a = gen1, b = gen2;
          a = Math.pow(a, ctx.PARAM4);
          b = Math.pow(b, ctx.PARAM4);
          //a = ctx.SPH_CURVE.evaluate(a);
          //b = ctx.SPH_CURVE.evaluate(b);
          
          //let a = r2, b = r1;
          
          //this one works too.  why?
          //let dd = (1.0-b)*ctx.PARAM3 + 0.01;
          
          let dd = ctx.PARAM3*this.r + 0.000001;
          //let r = 0.8 / Math.sqrt(this.points.length/PTOT+1);
          
          let fac = (b+dd) / (a+dd);
          //dd = ctx.PARAM3
          //w = Math.pow(w, ctx.PARAM2 + param*fac);
          
          fac = param*fac + ctx.PARAM2 + 0.0001;
          if (isNaN(fac)) {
            throw new Error("NaN");
          }
          
          if (isNaN(w)) {
            console.log(dis, searchr);
            throw new Error("NaN");
          }
          
          let w0 = w;
          //w = Math.exp(-(1.0-w)/(fac*fac));
          //w = Math.exp(-dis*ctx.PARAM*(b+dd)/(a+dd));
          
          //w = 1.0 / (1.0 + dis*ctx.PARAM); //*(a+dd)/(b+dd));
          
          //w = Math.pow(w, fac);
          
          //w = dis/searchr;
          
          fac = (b + dd) / (a + dd);

          let max = 1.0 / (ctx.PARAM3*this.r);
          //fac = Math.pow(fac/max, 2.0)*max;
          
          //fac = ctx.SPH_CURVE.evaluate(fac/max)*max;
          //w = w * (1.0 + ctx.SPH_CURVE.evaluate(fac/max));
          
          minfac = minfac === undefined ? fac : Math.min(minfac, fac);
          maxfac = maxfac === undefined ? fac : Math.max(maxfac, fac);
          
          fac = fac*param + ctx.PARAM2;
          //w = ctx.SPH_CURVE.evaluate(w);
          w = Math.pow(w, fac);
          //w = Math.exp(w*fac) / Math.exp(fac);
          
          if (isNaN(w)) {
            console.log(w0, dis, fac);
            throw new Error("NaN");
          }
          //w *= w*w*w;
          
        } else {
          //w = ctx.SPH_CURVE.evaluate(w);
          w = Math.pow(w, 5.0);
        }
        
        if (isNaN(w)) {
          w = 0.0;
        }
        //if (isNaN(w)) {
        //  throw new Error("NaN");
        //}
        
        sumdx += dx*w;
        sumdy += dy*w;
        sumw += w;
        sumtot += 1.0;
      } 
      
      let maxr = undefined; 
      let threshtot = 0.0;
      
      for (let pi1=0; pi1<ps.length; pi1 += PTOT) {
        let r1 = ps[pi1+PR], gen1 = ps[pi1+PGEN];
        
        threshtot += gen1 < thresh;
        
        maxr = maxr === undefined ? r1 : Math.max(r1, maxr);
      }
      
      let startr = 0.8 / Math.sqrt(threshtot+1);
      let do_startlvl = Math.random() < 0.2;
      
      //for (let _i=0; _i<ps.length; _i += PTOT) {
      //  pi1 = Math.floor(Math.random()*0.99999*ps.length/PTOT)*PTOT;
        
      for (let pi1=0; pi1<ps.length; pi1 += PTOT) {
        x1 = ps[pi1+POLDX], y1 = ps[pi1+POLDY], r1 = ps[pi1+PR], gen1 = ps[pi1+PGEN];
        
        let searchr3;
        
        //make sure initial "layer" is uniform
        if (gen1 < thresh) {
          if (!do_startlvl) {
            //continue;
          }
          
          //r1 = startr;
          //searchr = startr*ctx.SEARCHRAD2;
          
          searchr = r1*ctx.SEARCHRAD2;
          searchr3 = searchr;
          
          testgen = false;
        } else {
          let fac = threshtot / (ps.length / PTOT);
          
          let gen = gen1*ps.length/PTOT;
          gen += threshtot;
          
          r1 = 0.9 / Math.sqrt(ps.length/PTOT);
          
          testgen = true;
          searchr = r1*searchfac;

          /*
          searchr3 = 0.9 / Math.sqrt(gen) * ctx.SEARCHRAD2;
          searchr3 = searchr3 != 0.0 ? Math.pow(searchr3, 2.0) : 0.0;
          searchr3 = Math.max(searchr3, searchr);
          //*/
          
          searchr3 = searchr;
        }
        
        //searchr = this.r * searchfac * 2.5;
        sumdx = sumdy = sumw = sumtot = 0.0;
        
        //off = gridoffs[0];
        for (off of gridoffs) {
          tree.forEachPoint(x1+off[0], y1+off[1], searchr3, callback);
        }
        if (sumw == 0.0) {
          continue;
        }
        
        sumdx /= sumw;
        sumdy /= sumw;
        
        let fac = speed*0.1//*Math.pow(0.01 + gen1, 2.0);
        
        if (gen1 < thresh) {
          fac *= ctx.PROG_BASE_LAYER ? 0.05 : 0.45;
        }
        
        ps[pi1] += sumdx*fac;
        ps[pi1+1] += sumdy*fac;
        
        ps[pi1] = Math.fract(ps[pi1]);
        ps[pi1+1] = Math.fract(ps[pi1+1]);
        //ps[pi1] = Math.min(Math.max(ps[pi1], 0.0), 1.0);
        //ps[pi1+1] = Math.min(Math.max(ps[pi1+1], 0.0), 1.0);
      }
    }
  }
  
  return exports;
});










