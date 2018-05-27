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
  
  function calcradius(gen, maxgen, ctx) {
    let b = ctx.RADMUL / Math.sqrt(1 + maxgen);
    let a = b*ctx.MAX_SCALE;
    
    gen = Math.min(Math.max(gen, 0.0), 1.0)*0.99999999;
    if (ctx.RADIUS_CURVE !== undefined) {
      gen = ctx.RADIUS_CURVE.evaluate(gen);
    }

    return a + (b - a)*gen;
    
    return ctx.RADMUL / Math.sqrt(1 + gen*maxgen);
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
      this.cmyk_tick = 0;
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
      let totpoint = Math.ceil(this.dimen*this.dimen*0.95);
      let ps = this.points;
      
      let genstart = totpoint*cconst.GENSTART;
      
      let dimen2 = Math.floor(Math.sqrt(totpoint));
      this.r = undefined;
      
      //cumulative distribution function (histogram) for 
      //calculating point radius from modified (non-linear) gen threshold
      let cdf = new Float64Array(1024);

      for (let i=0; i<totpoint; i++) {
        let ix = i % dimen2, iy = ~~(i / dimen2);
        let x = ix/dimen2, y = iy/dimen2;

        //let x = util.random(), y = util.random();

        let rfac = 1.5;
        
        x += (util.random()-0.5)/dimen2*rfac;
        y += (util.random()-0.5)/dimen2*rfac;
        x = Math.fract(x);
        y = Math.fract(y);

        let pi = ps.length;
        for (let j=0; j<PTOT; j++) {
          ps.push(0.0);
        }
        
        let gen = Math.fract(ix*3.3234 + iy*0.539 + util.random()*0.05);
        
        gen = Math.max(gen-cconst.GENSTART, 0)/(1.0 - cconst.GENSTART);
        ps[pi+POGEN] = gen;
        
        gen = 1.0 - cconst.TONE_CURVE.evaluate(1.0 - gen);
        gen = Math.floor(gen*cconst.GENSTEPS)/cconst.GENSTEPS;
        
        let ci = ~~(gen * cdf.length * 0.9999999);
        cdf[ci]++;

        ps[pi] = ps[pi+POLDX] = ps[pi+PSTARTX] = x;
        ps[pi+1] = ps[pi+POLDY] = ps[pi+PSTARTY] = y;

        ps[pi+PGEN] = gen;
        //let gi = ~~(gen * totpoint);
        let gi = i;
        
        ps[pi+PCOLOR] = gi % 4;
      }
      
      for (let i=1; i<cdf.length; i++) {
        cdf[i] += cdf[i-1];
      }

      let maxgen = cdf[cdf.length-1];
      this.maxgen = maxgen;
            
      for (let pi=0; pi<ps.length; pi += PTOT) {
          let gen = ps[pi+PGEN];
          let ci = ~~(gen*cdf.length*0.9999999);

          let r = calcradius(cdf[ci]/maxgen, maxgen, cconst);
          ps[pi+PR] = r;
      }

      this.r = this.cur_r = calcradius(1.0, maxgen, cconst);
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
      this.cmyk_tick++;
      
      ctx = ctx === undefined ? cconst : ctx;
      
      let ps = this.points;
      let searchfac = ctx.SEARCHRAD;
      let cmyk_searchfac = ctx.CMYK_SEARCHRAD;

      let ct = Math.min(this.cmyk_tick / 64, 1.0);
      
      cmyk_searchfac += (0.6 - cmyk_searchfac) * (1.0 - ct);

      this.ct = cmyk_searchfac.toFixed(3);
      
      let x1, y1, r1, sumdx, sumdy, sumw, sumtot, searchr, gen1, off, pi1, color1, sumcolorw, sumcolortot;
      let sumcmyk = [0, 0, 0, 0], sumcolor=0;
      
      let max_r = undefined;
      
      ctx = ctx.copy();
      ctx.SIMPLE_MODE = false;
      ctx.ADV_SOLVE = false;
      
      let tree = this.makeKDTree(ctx);
      let tot = ps.length / PTOT;
      
      if (tot == 0) {
        return;
      }
      
      let calcweight = (w, r1, r2, gen1, gen2) => {
        
        /*
        off factor;
        off period;
        
        k1 := 1;
        k2 := 2;
        k3 := 3;
        k4 := 1;
        k5 := 1;
        d := 0.0;
        
        g1 := gen1 - gen2 + 1.0;
        g2 := (gen2+d) / (gen1+d);
        g1 := g1**k1;
        g2 := g2**k4;
        
        fw := w; comment: 1.0 - dis/searchr;
        fw := fw**(g2*k2 + k3);
        fw := fw*(g1*k5 + 1.0-k5);
        
        */
        let g1 = gen1 - gen2 + 1.0;
        let g2 = (gen2+0.0001) / (gen1+0.0001);
        
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
        
        if (gen1 < gen2) {
          w *= ctx.PARAM6;
          w = Math.pow(w, ctx.PARAM7);
        }
        //w *= Math.pow(g, ctx.PARAM1);
        return w;
      } 
           
      let callback = (pi2) => {
        if (pi1 == pi2) {
          return;
        }
        
        let x2 = ps[pi2], y2 = ps[pi2+1], r2 = ps[pi2+PR], gen2 = ps[pi2+PGEN], color2 = ps[pi2+PCOLOR];
        
        let dx = x2-x1-off[0];
        let dy = y2-y1-off[1];
        
        let dis = dx*dx + dy*dy;
        
        if (dis == 0.0 || dis >= searchr*searchr) {
          return;
        }
        
        dis = dis != 0.0 ? Math.sqrt(dis) : 0.0;
        let w = 1.0 - dis/searchr;
        
        w = calcweight(w, r1, r2, gen1, gen2);

        //w = ctx.SPH_CURVE.evaluate(w);
        
        dx /= dis;
        dy /= dis;
        
        sumdx += dx*w;
        sumdy += dy*w;
        sumw += w;
        sumtot += 1.0;
      }

      let cmyk_callback = (pi2) => {
        if (pi1 == pi2) {
          return;
        }
        
        let x2 = ps[pi2], y2 = ps[pi2+1], r2 = ps[pi2+PR], gen2 = ps[pi2+PGEN], color2 = ps[pi2+PCOLOR];
        
        let dx = x2 - x1-off[0];
        let dy = y2 - y1-off[1];
        
        let dis = dx*dx + dy*dy;
        
        if (dis == 0.0 || dis >= searchr*searchr) {
          return;
        }
        
        dis = dis != 0.0 ? Math.sqrt(dis) : 0.0;
        let w = 1.0 - dis/searchr;
        
        w = calcweight(w, r1, r2, gen1, gen2);
        w *= w*w;
        
        sumcolor += color2*w;
        sumcmyk[color2] += w;
        
        sumcolorw += w;
        sumcolortot += 1.0;
      }

      let fac = ctx.SPH_SPEED*0.5;// * 0.45;
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let r1 = ps[pi+PR];
        
        max_r = max_r === undefined ? r1 : Math.max(max_r, r1);
      }
      
      let swaps = [[], [], [], []];
      let bins = [[], [], [], []];
          
      for (pi1=0; pi1<ps.length; pi1 += PTOT) {
        sumdx = sumdy = sumw = sumtot = sumcolor = sumcolorw = sumcolortot = 0.0;
        
        for (let i=0; i<4; i++) {
          sumcmyk[i] = 0;
        }
        
        x1 = ps[pi1], y1 = ps[pi1+1], r1 = ps[pi1+PR], gen1 = ps[pi1+PGEN], color1 = ps[pi1+PCOLOR];
        
        //searchr = (r1+max_r)*0.5*searchfac;
        //searchr = r1*searchfac;
        
        for (off of gridoffs) {
          searchr = max_r*searchfac;
          tree.forEachPoint(x1+off[0], y1+off[1], searchr, callback);

          searchr = max_r*cmyk_searchfac;
          tree.forEachPoint(x1+off[0], y1+off[1], searchr, cmyk_callback);
        }
        
        if (sumtot == 0.0 || sumw == 0.0) {
          continue;
        }
        
        sumdx /= sumw;
        sumdy /= sumw;
        
        let fac2 = Math.pow(1.0 - r1/max_r, 2.0) + 0.125;
        fac2 *= 0.5;
        fac2 = 0.1;
        
        ps[pi1] += -sumdx*fac2*fac;
        ps[pi1+1] += -sumdy*fac2*fac;
        
        if (sumcolorw == 0.0) {
          continue;
        }

        if (sumcolor / sumcolorw >= 4) {
          throw new Error("sumcolor corruption");
        }

        sumcolor = (~~((sumcolor + color1) / (sumcolorw + 1))) % 4;
        //sumcolor = (~~(sumcolor / sumcolorw)) % 4;
        
        let mini=0, maxi=0, minc=0, maxc=0;
        
        for (let i=0; i<4; i++) {
          sumcmyk[i] /= sumcolortot;
          
          if (i==0 || sumcmyk[i] > maxc) {
            maxc = sumcmyk[i];
            maxi = i;
          }
          
          if (i == 0 || sumcmyk[i] < minc) {
            minc = sumcmyk[i];
            mini = i;
          }
        }
        
        //mini = sumcolor;
        if (mini != color1) {
          swaps[mini].push(pi1);
          bins[mini].push(pi1);
        }
        //if (color1 != sumcolor) {
        //  swaps[sumcolor].push(pi1);
        // bins[color1].push(pi1);
        //}
      }

      for (let i=0; i<4; i++) {
        swaps[i].sort();
        bins[i].sort();
      }
      
      //for (let )
      let steplen = swaps[0].length + swaps[1].length + swaps[2].length + swaps[3].length;
      for (let step=0; step<steplen; step++) {
        let i = ~~(Math.random()*3.999999);
        
        for (let i2=0; i2<swaps[i].length; i2++) {
          let pi1 = swaps[i][i2];
          let rj = ~~(Math.random()*2.999999);
          let j = (i + rj) % 4;
          
          j = ps[pi1+PCOLOR];
          
          if (j == undefined) {
            throw new Error("eek!");
          }

          if (swaps[j].length == 0) {
            continue;
          }
          
          let k;
          for (k=0; k<swaps[j].length; k++) {
            if (ps[swaps[j][k]+PCOLOR] == i) {
              break;
            }
          }

          if (k == swaps[j].length) {
            continue;
          }
          
          let pi2 = swaps[j][k];
          
          let t = ps[pi1+PCOLOR];
          ps[pi1+PCOLOR] = i;//ps[pi2+PCOLOR];
          ps[pi2+PCOLOR] = j;//t;
          
          //remove from lists
          swaps[i][i2] = swaps[i][swaps[i].length-1];
          swaps[j][k] = swaps[j][swaps[j].length-1];

          swaps[i].pop();
          swaps[j].pop();

          i2--;
        }
      }
      console.log(swaps);
      
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










