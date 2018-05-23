var _sph = undefined;

define([
  "util", "vectormath", "kdtree", "const", "linear_algebra", "binomial_table", "smoothmask"
], function(util, vectormath, kdtree, cconst, linalg, binomial_table, smoothmask) {
  "use strict";
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
  
  //"optional" fract
  function optfract(f) {
    //return Math.fract(f);
    return f;
  }
  
  let binomials = undefined;
  
  if (binomial_table === undefined) {
    //kind of sick of rjs errors, perhaps the time has come for es6 modules
    
    let timer = window.setInterval(() => {
      if (_binomial_table === undefined) {
        return;
      }
      
      binomial_table = _binomial_table;
      binomials = binomial_table.binomial_table;
      
      console.log(binomial_table);
      window.clearInterval(timer);
    }, 150);
    //throw new Error("module load error");
  }
  
  let Solver = exports.Solver = class Solver {
    constructor(dimen) {
      this.reset(dimen);
    }
    
    loadJSON(obj) {
      this.points = obj.points;
      
      return this;
    }
    
    toJSON() {
      return {
        points : this.points,
        dimen  : this.dimen
      };
    }
    
    reset(dimen) {
      this.dimen = dimen;
      this.points = [];
      this.totpoint = 0;
      this.tick = 0;
      this.r = 0;
      this.totbase = 0.0;
      this.maxgen = 1.0;
      
      this.cur_r = 0;
      this.cur_t = (cconst.RANGE-1) / cconst.RANGE;
      this.cur_t_i = cconst.RANGE-1;
      
      this.throw();
    }
    
    throw() {
      let totpoint = this.dimen*this.dimen*0.95;
      let ps = this.points;
      
      let genstart = totpoint*cconst.GENSTART;
      let maxgen = totpoint + genstart;
      
      this.maxgen = maxgen;
      let dimen2 = Math.floor(Math.sqrt(totpoint));
      this.r = undefined;
      
      //cumulative distribution function (histogram) for 
      //calculating point radius from modified (non-linear) gen threshold
      let cdf = new Float64Array(1024);

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
        
        let gen = i / totpoint;
        
        gen = Math.max(gen-cconst.GENSTART, 0)/(1.0 - cconst.GENSTART);
        gen = 1.0 - cconst.TONE_CURVE.evaluate(1.0 - gen);
        
        let ci = ~~(gen * cdf.length * 0.9999999);
        cdf[ci]++;

        ps[pi] = ps[pi+POLDX] = ps[pi+PSTARTX] = x;
        ps[pi+1] = ps[pi+POLDY] = ps[pi+PSTARTY] = y;

        ps[pi+PGEN] = ps[pi+POGEN] = gen;
      }
      
      for (let i=1; i<cdf.length; i++) {
        cdf[i] += cdf[i-1];
      }

      for (let pi=0; pi<ps.length; pi += PTOT) {
          let gen = ps[pi+PGEN];
          let ci = ~~(gen*cdf.length*0.9999999);

          let r = cconst.RADMUL / Math.sqrt(1 + cdf[ci]);
          ps[pi+PR] = r;
      }

      //XXX get rid of prior radius calculations 
      this.r = this.cur_r = cconst.RADMUL / Math.sqrt(this.points.length/PTOT);
    }
    
    makeKDTree(ctx) {
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
        
        totpoint++;
        visit[pi] = 1;
        pi *= PTOT;

        if (ctx.SIMPLE_MODE && (ps[pi+PGEN]) > ctx.SOLVE_LEVEL) {
          continue;
        }
        
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
        
        ps[pi] = optfract(ps[pi]);
        ps[pi+1] = optfract(ps[pi+1]);
      }
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
      ctx = ctx === undefined ? cconst : ctx;
      
      let ps = this.points;
      let searchfac = ctx.SEARCHRAD;
      
      let x1, y1, r1, sumdx, sumdy, sumw, sumtot, searchr, gen1, off, pi1;
      let max_r = undefined;
      
      ctx = ctx.copy();
      ctx.SIMPLE_MODE = false;
      ctx.ADV_SOLVE = false;
      
      let tree = this.makeKDTree(ctx);
      let tot = ps.length / PTOT;
      
      if (tot == 0) {
        return;
      }
      
      let callback = (pi2) => {
        if (pi1 == pi2) {
          return;
        }
        
        let x2 = ps[pi2], y2 = ps[pi2+1], r2 = ps[pi2+PR], gen2 = ps[pi2+PGEN];
        
        let dx = x2-x1-off[0];
        let dy = y2-y1-off[1];
        
        let dis = dx*dx + dy*dy;
        
        if (dis == 0.0 || dis >= searchr*searchr) {
          return;
        }
        
        dis = dis != 0.0 ? Math.sqrt(dis) : 0.0;
        let w = 1.0 - dis/searchr;
        
        //w = ctx.SPH_CURVE.evaluate(w);
        
        let g1 = gen1 - gen2 + 1.0;
        let g2 = (gen1+0.0001) / (gen2+0.0001);
        
        //g = Math.pow(g, ctx.PARAM1 + Math.pow(1.0-gen1, ctx.PARAM3)*ctx.PARAM2);
        g1 = Math.pow(g1, ctx.PARAM1);
        g2 = Math.pow(g2, ctx.PARAM4);
        
        //w *= 0.00001+g*dis;
        //w = g/dis;
        //w *= -g;
        
        //w += g*ctx.PARAM2;
        //w *= g+ctx.PARAM2;
        w = Math.pow(w, g2*ctx.PARAM2 + ctx.PARAM3);
        w *= g1*ctx.PARAM5 + 1.0 - ctx.PARAM5;
        
        //w *= Math.pow(g, ctx.PARAM1);
        
        dx /= dis;
        dy /= dis;
        
        //let r = r1;
        //let f = dis - this.r/g*0.25;
        
        //dx *= f;
        //dy *= f;
        
        /*
        if (gen2 > gen1) {
          //return;
          //w *= 0.6;
          let d = 0.001;
          w *= (gen1+d)/(gen2+d);
        }*/
        
        sumdx += dx*w;
        sumdy += dy*w;
        sumw += w;
        sumtot += 1.0;
      }

      let r = this.cur_r = ctx.RADMUL / Math.sqrt(tot);
      let fac = ctx.SPH_SPEED*0.5;// * 0.45;
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let r1 = ps[pi+PR];
        
        max_r = max_r === undefined ? r1 : Math.max(max_r, r1);
      }
      
      for (pi1=0; pi1<ps.length; pi1 += PTOT) {
        sumdx = sumdy = sumw = sumtot = 0.0;
        
        x1 = ps[pi1], y1 = ps[pi1+1], r1 = ps[pi1+PR], gen1 = ps[pi1+PGEN];
        
        searchr = max_r*searchfac;
        //searchr = (r1+max_r)*0.5*searchfac;
        //searchr = r1*searchfac;
        
        for (off of gridoffs) {
          tree.forEachPoint(x1+off[0], y1+off[1], searchr, callback);
        }
        
        if (sumtot == 0.0 || sumw == 0.0) {
          continue;
        }
        
        sumdx /= sumw;
        sumdy /= sumw;
        
        let fac2 = Math.pow(1.0 - r1/max_r, 2.0) + 0.125;
        fac2 *= 0.5;
        
        ps[pi1] += -sumdx*fac2*fac;
        ps[pi1+1] += -sumdy*fac2*fac;
      }
      
      for (pi1=0; pi1<ps.length; pi1 += PTOT) {
        ps[pi1] = Math.fract(ps[pi1]);
        ps[pi1+1] = Math.fract(ps[pi1+1]);
        
        ps[pi1+PSTARTX] = ps[pi1];
        ps[pi1+PSTARTY] = ps[pi1+1];
      }
    }
  }
  
  return exports;
});










