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
  
  let TX=0, TY=1, TR=2, TGEN=3, TTIME=4, TTOT=5;
  
  let path_eval_cache = util.cachering.fromConstructor(vectormath.Vector2, 64);
  
  let Path = exports.Path = class Path extends Array {
    constructor(pi, x, y) {
      super();
      
      this.pi = pi;
      
      //pre-allocate points
      for (let i=0; i<cconst.RANGE; i++) {
        let ti = this.length;
        
        for (let j=0; j<TTOT; j++) {
          this.push(0);
        }
        
        this[ti] = x;
        this[ti+1] = y;
        this[ti+TTIME] = i / cconst.RANGE;
        this[ti+TGEN] = -1; //flag as not used yet
      }
    }
    
    toJSON() {
      let array = [];
      for (let v of this) {
        array.push(v);
      }
      
      return {
        pi   : this.pi,
        data : array
      }        
    }

    loadJSON(obj) {
      this.pi = obj.pi;
      this.length = obj.data.length;
      
      for (let i=0; i<obj.data.length; i++) {
        this[i] = obj.data[i];
      }
      
      return this;
    }
    
    fit_smooth(ctx, factor) {
      let degree = ctx.PATH_DEGREE;
      
      //berstein (bezier) version
      function poly(cs, t) {
        let sum = 0.0;
        
        for (let i=0; i<cs.length; i++) {
          let w = binomials[degree][i] * t**i * (1.0 - t)**(degree - i);
          
          sum += w*cs[i];
        }
        
        return sum;
      }
      /*
      function poly(cs, t) {
        let sum = cs[0];
        
        for (let i=1; i<cs.length; i++) {
          sum += cs[i]*t;
          
          t *= t;
        }
        
        return sum;
      }//*/
      
      let xcs = new Array(degree+1), ycs = new Array(degree+1);
      xcs.length = degree+1;
      ycs.length = degree+1;
      
      xcs[0] = this[0];
      xcs[xcs.length-1] = this[this.length-TTOT];
      ycs[0] = this[1];
      ycs[ycs.length-1] = this[this.length-TTOT+1];
      
      for (let i=1; i<xcs.length-1; i++) {
        if (i > xcs.length/2) {
          xcs[i] = xcs[xcs.length-1];
          ycs[i] = ycs[ycs.length-1];
        } else {
          xcs[i] = xcs[0];
          ycs[i] = ycs[0];
        }
      }
      
      let msize = 2*(degree-1);
      let matrix = new linalg.Matrix(msize, msize);
      matrix.fill(0, 0, matrix.length);
      
      let error = () => {
        let steps = msize;
        let dt = 1.0 / (steps+2), t = dt;
        let err = 0.0;
        
        for (let j=0; j<steps; j++, t += dt) {
          for (let i=0; i<steps; i++) {
            let ti = (~~(t * this.length / TTOT))*TTOT;
            let ci, clist;
            let axis;
            
            if (i >= degree-1) {
              ci = i - (degree-1) + 1;
              clist = ycs;
              axis = 1;
            } else {
              ci = i+1;
              clist = xcs;
              axis = 0;
            }
            
            let df = 0.0001;
            let mul = 1;//ctx.DIMEN*8;
            
            let a = this[ti+axis]*mul;
            let b = poly(clist, t)*mul;
            
            let orig = clist[ci];
            
            clist[ci] += df;
            let c = poly(clist, t)*mul;
            
            clist[ci] = orig;
            
            if (isNaN(a) || isNaN(b) || isNaN(c)) {
              console.log(axis, this, ti, i, j, clist, c, ci);
              throw new Error("NaN");
            }
            
            let g = ((c - a)*(c - a) - (b - a)*(b - a)) / df;
            
            let idx = (j*msize + i);
            
            matrix[idx] = g;
            
            err += (b - a)*(b - a);

            if (Math.abs(g) > 0.00001) {
              let r1 = (b-a) * (b-a);
              
              //clist[ci] += -r1/g*0.98;
              clist[ci] += -g*0.35;
            }
          }
        }
        
        /*
        //console.log(matrix);
        //matrix.transpose();
        
        let det = matrix.determinant();
        if (Math.abs(det) > 0.001 && Math.abs(det) < 1e6) {
          matrix.invert();
          
          let vec = xcs.slice(1, degree).concat(ycs.slice(1, degree));
          
          if (vec.length != msize) {
            console.log(vec.length, msize);
            throw new Error("error!");
          }
          
          for (let i=0; i<vec.length; i++) {
            let sum = 0.0;
            
            for (let j=0; j<vec.length; j++) {
              let idx = i*msize + j;
              //let idx = j*msize + i;
              
              sum += matrix[idx]*vec[j];
            }
            
            vec[i] = sum;
          }
          
          console.log(vec);
          for (let i=1; i<degree; i++) {
            xcs[i] = vec[i-1];
            ycs[i] = vec[i-1+(degree-1)];
          }
          
          console.log(det, matrix.toString(3));
        }
        //*/
        
        return err != 0.0 ? Math.sqrt(err) : 0.0;
      }
      
      console.log(" ");
      let steps = 512;
      
      error();
      //*
      console.log("err", error().toFixed(5));
      for (let i=0; i<steps; i++) {
        error();
      }
      console.log("err", error().toFixed(5));
      //*/
      
      xcs[0] = this[0];
      xcs[xcs.length-1] = this[this.length-TTOT];
      
      ycs[0] = this[1];
      ycs[ycs.length-1] = this[this.length-TTOT+1];
      
      for (let ti=0; ti < this.length; ti += TTOT) {
        let t = ti / this.length;
        
        //break;
        
        let x = poly(xcs, t);
        let y = poly(ycs, t);
        
        this[ti] += (x - this[ti]) * factor;
        this[ti+1] += (y - this[ti+1]) * factor;
      }
    }
    
    smooth(ctx, factor, mode) {
      mode = mode === undefined ? cconst.SmoothModes.SIMPLE : mode;
      
      switch (mode) {
        case cconst.SmoothModes.SIMPLE:
          this.simple_smooth(ctx, factor);
          break;
        case cconst.SmoothModes.POLYFIT:
          this.fit_smooth(ctx, factor);
          break;
        default:
          throw new Error("unknown smoothing mode " + mode);
      }
    }
    
    simple_smooth(ctx, factor) {
      let cpy = this.slice(0, this.length);
      
      for (let ti=0; ti<this.length; ti += TTOT) {
        let nx, ny;
        
        if (ti == 0) {
          nx = (cpy[ti] + cpy[ti+TTOT])*0.5;
          ny = (cpy[ti+1] + cpy[ti+TTOT+1])*0.5;
        } else if (ti == this.length - TTOT) {
          nx = (cpy[ti-TTOT] + cpy[ti])*0.5;
          ny = (cpy[ti-TTOT+1] + cpy[ti+1])*0.5;
        } else {
          nx = (cpy[ti-TTOT] + cpy[ti] + cpy[ti+TTOT]) / 3.0;
          ny = (cpy[ti-TTOT+1] + cpy[ti+1] + cpy[ti+TTOT+1]) / 3.0;
        }
        
        this[ti] += (nx-this[ti])*factor;
        this[ti+1] += (ny-this[ti+1])*factor;
      }
    }
    
    find(t) {
      //XXX not sure I'm going to need this anymore
      //let totpoint = ~~(this.length/TTOT);
      
      //totpoint -= 1;

      //return Math.floor(totpoint*t + 0.5)*TTOT;

      if (t == 1.0) t = 0.9999999;
      
      let start = 0.0;
      let end = 0.9999999;
      let mid = (start+end) * 0.5;
      
      for (let i=0; i<25; i++) {
        let ti1 = Math.floor(start*this.length/TTOT)*TTOT;
        let ti2 = Math.floor(mid*this.length/TTOT)*TTOT;
        let ti3 = Math.floor(end*this.length/TTOT)*TTOT;
        
        if (Math.abs(this[ti1+TTIME]-t) < 0.00001)
          return ti1;
        if (Math.abs(this[ti2+TTIME]-t) < 0.00001)
          return ti2;
        if (Math.abs(this[ti3+TTIME]-t) < 0.00001)
          return ti3;
        
        if (this[ti2 + TTIME] > t) {
          end = mid;
        } else {
          start = mid;
        }
        
        mid = (start + end)*0.5;
      }
      
      return Math.floor(mid*this.length/TTOT)*TTOT;
    }
    
    testFind() {
      for (let i=0; i<cconst.RANGE; i++) {
        let ti = this.find(i/cconst.RANGE);
        
        if (ti === undefined) {
          console.log("Error!" + i);
        }
      }
    }
    
    loadMaskPoint(p) {
        let offs = p.offsets;
        this.length = 0;

        let fieldlen = p.fieldlen;
        let ctype = p.curvetype;
        
        let is_nonuniform = ctype == smoothmask.CurveTypes.LINEAR_NONUNIFORM;

        for (let i=0; i<offs.length; i += fieldlen) {
            let ti = this.length;

            for (let j=0; j<TTOT; j++) {
                this.push(0);
            }

            this[ti] = offs[i];
            this[ti+1] = offs[i+1];

            if (is_nonuniform) {
                this[ti+TTIME] = offs[i+2];
            }
        }

        return this;
    }

    fillMaskPoint(p) {
      for (let ti=0; ti<this.length; ti += TTOT) {
        p.offsets.push(this[ti]);
        p.offsets.push(this[ti+1]);

        if (p.curvetype == smoothmask.CurveTypes.LINEAR_NONUNIFORM) {
            p.offsets.push(this[ti+TTIME]);
        }
      }
      
      return this;
    }
    
    update(t, x, y, r, gen, _is_recurse) {
      let ti;
      
      ti = this.find(t);
      ti = ti === undefined ? this.length : ti;
      
      /*
      for (ti=0; ti<this.length; ti += TTOT) {
        if (this[ti+TTIME] == t) {
          break;
        }
      }
      //*/
      
      if (ti == this.length && _is_recurse) {
        console.log(arguments);
        throw new Error("bug in Path.update()");
      }
      
      if (ti == this.length) {
        console.log("inserting new point for", this.pi);
        
        //insert a new point
        for (let j=0; j<TTOT; j++) {
          this.push(0);
        }
        
        this[ti+TTIME] = t;
        
        this.sort();
        return this.update(t, x, y, r, gen, true);
      }
      
      this[ti] = x;
      this[ti+1] = y;
      this[ti+TR] = r;
      this[ti+TGEN] = gen;
    }
    
    evaluate(t) {
      t *= 0.9999999;
      
      //t = Math.floor(t*cconst.RANGE + 0.5)/cconst.RANGE;
      
      let ti = this.find(t);
      
      let ret = path_eval_cache.next();
      
      if (ti === undefined) {
        return ret.zero();
      }
      
      ret[0] = this[ti];
      ret[1] = this[ti+1];
      
      return ret;

      /*
      let ti;
      
      let ret = path_eval_cache.next();
      
      if (this.length == 0) {
        return ret.zero();
      }
      
      for (ti=0; ti<this.length; ti += TTOT) {
        if (this[ti+TGEN] == -1) {
          continue; //point hasn't gotten data yet
        }
        
        if (this[ti+TTIME] > t) {
          break;
        }
      }
      
      if (ti == TTOT && ti > 0) {
        ti -= TTOT;
        
        ret[0] = this[ti], ret[1] = this[ti+1];
        return ret;
      } else { //if (ti == 0) {
        ret[0] = this[ti], ret[1] = this[ti+1];
        return ret;
      }
      //*/
      
      /*
      ti -= TTOT;
      let t2 = (t - this[ti+TTIME]) / (this[ti+TTOT+TTIME] - this[ti+TTIME]);
      
      ret[0] = this[ti] + (this[ti+TTOT] - this[ti]) * t2;
      ret[1] = this[ti+1] + (this[ti+TTOT+1] - this[ti+1]) * t2;
      
      return ret;
      //*/
    }
    
    sort() {
      let list = [];
      
      for (let ti=0; ti<this.length; ti += TTOT) {
        list.push(ti);
      }
      
      list.sort((a, b) => {
        return this[a+TTIME] - this[b+TTIME];
      });
      
      let cpy = this.slice(0, this.length);
      let ti2 = 0;
      
      for (let ti of list) {
        for (let j=0; j<TTOT; j++) {
          this[ti2+j] = cpy[ti+j];
        }
        
        ti2 += TTOT;
      }
    }
  };
  
  let Solver = exports.Solver = class Solver {
    constructor(dimen) {
      this.reset(dimen);
    }
    
    loadJSON(obj) {
      this.points = obj.points;
      this.paths = obj.paths;
      
      for (let k in this.paths) {
        let path = new Path();
        
        path.loadJSON(this.paths[k]);
        this.paths[k] = path;
      }
      
      return this;
    }
    
    toJSON() {
      return {
        points : this.points,
        paths  : this.paths,
        dimen  : this.dimen
      };
    }
    
    reset(dimen) {
      this.dimen = dimen;
      this.points = [];
      this.totpoint = 0;
      this.tick = 0;
      this.r = 0;
      this.paths = {};
      this.totbase = 0.0;
      this.maxgen = 1.0;
      this.totpath = 0;
      
      this.cur_r = 0;
      this.cur_t = (cconst.RANGE-1) / cconst.RANGE;
      this.cur_t_i = cconst.RANGE-1;
      
      this.throw();
      
      let steps = cconst.PRESTEPS;
      for (let i=0; i<steps; i++) {
        if (Math.random() > 0.1) {
          console.log(i, "of", steps)
        }
        this.step_base_generate(cconst);
      }
    }
    
    getPath(pi, create_if_nonexisting) {
      if (create_if_nonexisting && !(pi in this.paths)) {
        this.paths[pi] = new Path(pi, this.points[pi], this.points[pi+1]);
      }
      
      return this.paths[pi];
    }
    
    compressPaths(ctx) {
        for (let k in this.paths) {
            let path = this.paths[k];

            let p = new smoothmask.MaskPoint(undefined, undefined, undefined, smoothmask.CurveTypes.LINEAR_NONUNIFORM);
            
            path.fillMaskPoint(p);
            p.compress();
            path.loadMaskPoint(p);

        }
    }

    updatePath(pi, ctx) {
      if (ctx === undefined) {
        throw new Error("ctx cannot be undefined");
      }
      
      let path = this.getPath(pi, true);
      
      let ps = this.points;
      let x = ps[pi], y = ps[pi+1], r = ps[pi+PR], gen = ps[pi+PGEN];
      
      //find center of existing path points
      let cx=0, cy=0, ctot=0;
      
      for (let ti=0; ti<path.length; ti += TTOT) {
        cx += path[ti];
        cy += path[ti+1];
        ctot++;
      }
      
      if (ctot != 0.0) {
        cx /= ctot;
        cy /= ctot;
      }
      
      let mindis = undefined;
      let minoff = undefined;
      
      //find appropriate toroidal offset
      //by finding grid offset that minimizes distance to centroid of path
      for (let off of gridoffs) {
        let dx = x+off[0] - cx;
        let dy = y+off[1] - cy;
        
        let dis = dx*dx + dy*dy;
        
        if (mindis === undefined || dis < mindis) {
          mindis = dis;
          minoff = off;
        }
      }
      
      x += minoff[0];
      y += minoff[1];
      
      let t = Math.floor(ctx.SOLVE_LEVEL*ctx.RANGE + 0.01/ctx.RANGE)/ctx.RANGE;
      
      path.update(t, x, y, r, gen);
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
        gen = Math.pow(gen, cconst.PREPOWER);
        
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
    
    advanced_solve(ctx) {
      ctx = ctx.copy();
      
      this.cur_t = this.cur_t_i / ctx.RANGE + 0.00001;
      ctx.SOLVE_LEVEL = this.cur_t;
      
      //load last solve for this level
      let ps = this.points;
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let path = this.getPath(pi, true);
        
        let ti = path.find(this.cur_t);
        
        if (ti === undefined && Math.random() > 0.9) {
          console.warn("ti was undefined", this.cur_t, this.cur_t*ctx.RANGE);
          continue;
        }
        
        if (path[ti+TGEN] == -1) {
          continue;
        }
        
        //ps[pi] = Math.fract(path[ti]);
        //ps[pi+1] = Math.fract(path[ti+1]);
      }
      
      for (let i=0; i<32; i++) {
        this.step_simple(ctx);
      }
      
      if (ctx.UPDATE_START_COS)
        this.updateStartCos(ctx);
      
      //profiler said this is slow, so do it every third frame
      if (this.cur_t_i % 3 == 0) {
         this.smoothPaths(ctx);
      }
      
      this.cur_t_i--;
      
      if (this.cur_t_i < 0) {
        this.cur_t_i = ctx.RANGE - 1;
      }

      _appstate.report("cur_t", this.cur_t.toFixed(3));
    }
    
    updateStartCos(ctx) {
      let ps = this.points;
      
      //update startx/starty positions
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let path = this.getPath(pi);
        
        if (path === undefined) {
          console.log("no paths!");
          continue;
        }
        
        let sumx = 0, sumy = 0, sumtot = 0;
        for (let ti=0; ti<path.length; ti += TTOT) {
          if (path[ti+TGEN] == -1) continue;
          
          sumx += path[ti];
          sumy += path[ti+1];
          sumtot++;
        }
        
        if (sumtot == 0.0)
          continue;
        
        sumx /= sumtot;
        sumy /= sumtot;
        
        ps[pi+PSTARTX] = sumx;
        ps[pi+PSTARTY] = sumy;
      }
    }
    
    step(ctx) {
      ctx = ctx === undefined ? cconst : ctx;
      
      if (ctx.ADV_SOLVE && ctx.SIMPLE_MODE) {
        this.advanced_solve(ctx);
      } else if (ctx.SIMPLE_MODE) {
        //this.applyVelocity(ctx);
        this.step_simple(ctx);
        
        if (ctx.UPDATE_START_COS)
          this.updateStartCos(ctx);
        
        //this.updateVelocity(ctx);
      } else {
        this.step_base_generate(ctx.copy());
      }
    }
    
    step_simple(ctx) {
      let ps = this.points;
      let searchfac = ctx.SEARCHRAD;
      
      let x1, y1, r1, sumdx, sumdy, sumw, sumtot, searchr, gen1, off, pi1;
      
      let tree = this.makeKDTree(ctx);
      
      let tot = 0;
      for (pi1=0; pi1<ps.length; pi1 += PTOT) {
        let gen = ps[pi1+PGEN];
        
        tot += gen <= ctx.SOLVE_LEVEL;
      }
      
      if (tot == 0) {
        return;
      }
      
      let callback = (pi2) => {
        if (pi1 == pi2) {
          return;
        }
        
        if (ps[pi2+PGEN] > ctx.SOLVE_LEVEL) {
          return;
        }
        
        let x2 = ps[pi2], y2 = ps[pi2+1], r2 = ps[pi2+PR], gen2 = ps[pi2+PGEN];
        
        let dx = x2-x1-off[0];
        let dy = y2-y1-off[1];
        
        let dis = dx*dx + dy*dy;
        
        if (dis >= searchr*searchr) {
          return;
        }
        
        dis = dis != 0.0 ? Math.sqrt(dis) : 0.0;
        let w = 1.0 - dis/searchr;
        
        w = ctx.SPH_CURVE.evaluate(w);
        
        sumdx += dx*w;
        sumdy += dy*w;
        sumw += w;
        sumtot += 1.0;
      }

      let r = this.cur_r = ctx.RADMUL / Math.sqrt(tot);
      let fac = ctx.SPH_SPEED * 0.0625;
      
      for (pi1=0; pi1<ps.length; pi1 += PTOT) {
        sumdx = sumdy = sumw = sumtot = 0.0;
        
        x1 = ps[pi1], y1 = ps[pi1+1], r1 = ps[pi1+PR], gen1 = ps[pi1+PGEN];
        
        if (gen1 > ctx.SOLVE_LEVEL) {
          continue;
        }
        
        searchr = r*searchfac;
        
        for (off of gridoffs) {
          tree.forEachPoint(x1+off[0], y1+off[1], searchr, callback);
        }
        
        if (sumtot == 0.0 || sumw == 0.0) {
          continue;
        }
        
        sumdx /= sumw;
        sumdy /= sumw;
        
        ps[pi1] += -sumdx*fac;
        ps[pi1+1] += -sumdy*fac;
      }
      
      for (pi1=0; pi1<ps.length; pi1 += PTOT) {
        let gen1 = ps[pi1+PGEN];
        
        if (gen1 > ctx.SOLVE_LEVEL) {
          continue;
        }
  
        //pull towards starting positions (generated by step_base_generate()) a bit
        let dx = ps[pi1+PSTARTX] - ps[pi1];
        let dy = ps[pi1+PSTARTY] - ps[pi1+1];
        
        ps[pi1] += dx*ctx.PULL_FACTOR;
        ps[pi1+1] += dy*ctx.PULL_FACTOR;
        
        /*
        if (ps[pi1] > 1.0) {
          ps[pi1] -= 1.0;
          ps[pi1+PSTARTX] -= 1.0;
        } else if (ps[pi1] < 0.0) {
          ps[pi1] += 1.0;
          ps[pi1+PSTARTX] += 1.0;
        }
        
        if (ps[pi1+1] > 1.0) {
          ps[pi1+1] -= 1.0;
          ps[pi1+PSTARTY] -= 1.0;
        } else if (ps[pi1+1] < 0.0) {
          ps[pi1+1] += 1.0;
          ps[pi1+PSTARTY] += 1.0;
        }
        //*/
        
        //update paths
        this.updatePath(pi1, ctx);
      }
    }
    
    step_base_generate(ctx) {
      let ps = this.points;
      let searchfac = ctx.SEARCHRAD;
      
      let x1, y1, r1, sumdx, sumdy, sumw, sumtot, searchr, gen1, off, pi1;
      
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
        
        if (dis >= searchr*searchr) {
          return;
        }
        
        dis = dis != 0.0 ? Math.sqrt(dis) : 0.0;
        let w = 1.0 - dis/searchr;
        
        w = ctx.SPH_CURVE.evaluate(w);
        
        if (gen2 > gen1) {
          //return;
          //w *= 0.6;
          let d = 0.001;
          w *= (gen1+d)/(gen2+d);
        }
        
        sumdx += dx*w;
        sumdy += dy*w;
        sumw += w;
        sumtot += 1.0;
      }

      let r = this.cur_r = ctx.RADMUL / Math.sqrt(tot);
      let fac = ctx.SPH_SPEED;// * 0.45;
      
      let max_r = undefined;
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let r1 = ps[pi+PR];
        
        max_r = max_r === undefined ? r1 : Math.max(max_r, r1);
      }
      
      for (pi1=0; pi1<ps.length; pi1 += PTOT) {
        sumdx = sumdy = sumw = sumtot = 0.0;
        
        x1 = ps[pi1], y1 = ps[pi1+1], r1 = ps[pi1+PR], gen1 = ps[pi1+PGEN];
        
        //searchr = max_r*searchfac;
        //searchr = (r1+max_r)*0.5*searchfac;
        searchr = r1*searchfac;
        
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

    step_base_generate_old(ctx) {
      ctx = ctx.copy();
      
      let settings = {"DIMEN":28,"MAX_SCALE":8,"RADMUL":0.8,"SIMPLE_MODE":false,"APP_VERSION":0.0001,"USE_MASK":false,"PROG_BASE_LAYER":true,"EXPONENT":0.1,"PREPOWER":0.5,"TONE_IN_SOLVER":false,"KEEP_UNIFORM":false,"DRAW_COLORS":true,"SEARCHRAD":4,"RMUL":1,"SPH_SPEED":4.69,"DISPLAY_LEVEL1":0,"DISPLAY_LEVEL2":1,"POINTSCALE":0.406,"PARAM":0.45,"PARAM2":3.751,"PARAM3":0.000001,"PARAM4":4,"PARAM5":0.721,"TIMER_STEPS":11074,"START_THRESHOLD":0.3,"GENSTART":0.05,"SMALL_MASK":false,"XLARGE_MASK":true,"SHOW_RADII":false,"DV_DAMPING":1,"VOIDCLUSTER":true,"ALTERNATE":false,"GUASS_MIN":0.1,"GUASS_POW":1,"SCALE_GAUSS":false,"SCALE_RADIUS":false,"RADIUS_POW":1,"PROPEGATE_W":true,"INITIAL_W_POWER":4,"DRAW_KDTREE":false,"TONE_MASK":true,"SEARCHRAD2":3.96,"CURVE_DEFAULTS":{"TONE_CURVE":{"points":[{"0":0.13125,"1":0,"eid":1,"flag":0,"deg":3,"tangent":1},{"0":0.26249999999999996,"1":0.6,"eid":5,"flag":1,"deg":3,"tangent":1},{"0":1,"1":1,"eid":2,"flag":0,"deg":3,"tangent":1},{"0":1,"1":1,"eid":3,"flag":0,"deg":3,"tangent":1}],"eidgen":{"_cur":9}}},"EXP2":0.8,"Equations":{"W5":0,"W4":1,"W3":2,"GUASSIAN":3,"CUBIC":4,"POW":5},"W_EQUATION":3,"SPH_EQUATION":0,"W_PARAM":0.6,"W_PARAM2":0.4,"SPH_PARAM":1};
      
      ctx.loadJSON(settings);
      
      this.applyVelocity(ctx);
      this.step_base_generate_intern(ctx);
      this.updateVelocity(ctx);
      this.tick++;
      
      let ps = this.points;
      for (let pi=0; pi<ps.length; pi += PTOT) {
        ps[pi+PSTARTX] = ps[pi];
        ps[pi+PSTARTY] = ps[pi+1];
      }
    }

        
    smoothPaths(ctx, factor, mode) {
      ctx = ctx === undefined ? cconst : ctx;
      factor = factor === undefined ? ctx.PATH_SMOOTH_FACTOR : factor;
      
      let ps = this.points;
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let path = this.getPath(pi);
        
        if (path === undefined) {
          continue;
        }
        
        path.smooth(ctx, factor, mode);
      }
    }
    
    step_base_generate_intern(ctx) {
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
      
      let tree = this.makeKDTree(ctx);
      
      this.totbase = 0;
      
      for (let pi=0; pi<ps.length; pi += PTOT) {
        let gen = ps[pi+POGEN];
        
        ps[pi+PGEN] = ctx.GEN_CURVE.evaluate(gen);
        
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










