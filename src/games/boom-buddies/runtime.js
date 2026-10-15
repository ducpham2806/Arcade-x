import {artSprite, installArt, bossPose, drawWardrobe, cosmeticBlast, iconPath, WEAR_ANCHORS} from './art-v3.js';
// Recovered reviewed runtime; keeps bundled third-party notices.
let mountBoom;
(() => {
  var _g = Object.create;
  var Pr = Object.defineProperty;
  var bg = Object.getOwnPropertyDescriptor;
  var xg = Object.getOwnPropertyNames;
  var yg = Object.getPrototypeOf, Lg = Object.prototype.hasOwnProperty;
  var Sa = (e, a) => () => (a || e((a = { exports: {} }).exports, a), a.exports);
  var vg = (e, a, t, l) => {
    if (a && typeof a == "object" || typeof a == "function") for (let o of xg(a)) !Lg.call(e, o) && o !== t && Pr(e, o, { get: () => a[o], enumerable: !(l = bg(a, o)) || l.enumerable });
    return e;
  };
  var at = (e, a, t) => (t = e != null ? _g(yg(e)) : {}, vg(a || !e || !e.__esModule ? Pr(t, "default", { value: e, enumerable: true }) : t, e));
  var Wr = Sa((se) => {
    "use strict";
    function Pn(e, a) {
      var t = e.length;
      e.push(a);
      e: for (; 0 < t; ) {
        var l = t - 1 >>> 1, o = e[l];
        if (0 < Hs(o, a)) e[l] = a, e[t] = o, t = l;
        else break e;
      }
    }
    function Ca(e) {
      return e.length === 0 ? null : e[0];
    }
    function Es(e) {
      if (e.length === 0) return null;
      var a = e[0], t = e.pop();
      if (t !== a) {
        e[0] = t;
        e: for (var l = 0, o = e.length, s = o >>> 1; l < s; ) {
          var i = 2 * (l + 1) - 1, n = e[i], u = i + 1, r = e[u];
          if (0 > Hs(n, t)) u < o && 0 > Hs(r, n) ? (e[l] = r, e[u] = t, l = u) : (e[l] = n, e[i] = t, l = i);
          else if (u < o && 0 > Hs(r, t)) e[l] = r, e[u] = t, l = u;
          else break e;
        }
      }
      return a;
    }
    function Hs(e, a) {
      var t = e.sortIndex - a.sortIndex;
      return t !== 0 ? t : e.id - a.id;
    }
    se.unstable_now = void 0;
    typeof performance == "object" && typeof performance.now == "function" ? (Fr = performance, se.unstable_now = function() {
      return Fr.now();
    }) : (En = Date, Xr = En.now(), se.unstable_now = function() {
      return En.now() - Xr;
    });
    var Fr, En, Xr, Da = [], tt = [], wg = 1, sa = null, De = 3, Fn = false, xo = false, yo = false, Xn = false, jr = typeof setTimeout == "function" ? setTimeout : null, Yr = typeof clearTimeout == "function" ? clearTimeout : null, Vr = typeof setImmediate < "u" ? setImmediate : null;
    function Us(e) {
      for (var a = Ca(tt); a !== null; ) {
        if (a.callback === null) Es(tt);
        else if (a.startTime <= e) Es(tt), a.sortIndex = a.expirationTime, Pn(Da, a);
        else break;
        a = Ca(tt);
      }
    }
    function Vn(e) {
      if (yo = false, Us(e), !xo) if (Ca(Da) !== null) xo = true, cl || (cl = true, dl());
      else {
        var a = Ca(tt);
        a !== null && Kn(Vn, a.startTime - e);
      }
    }
    var cl = false, Lo = -1, Qr = 5, Zr = -1;
    function Jr() {
      return Xn ? true : !(se.unstable_now() - Zr < Qr);
    }
    function Nn() {
      if (Xn = false, cl) {
        var e = se.unstable_now();
        Zr = e;
        var a = true;
        try {
          e: {
            xo = false, yo && (yo = false, Yr(Lo), Lo = -1), Fn = true;
            var t = De;
            try {
              a: {
                for (Us(e), sa = Ca(Da); sa !== null && !(sa.expirationTime > e && Jr()); ) {
                  var l = sa.callback;
                  if (typeof l == "function") {
                    sa.callback = null, De = sa.priorityLevel;
                    var o = l(sa.expirationTime <= e);
                    if (e = se.unstable_now(), typeof o == "function") {
                      sa.callback = o, Us(e), a = true;
                      break a;
                    }
                    sa === Ca(Da) && Es(Da), Us(e);
                  } else Es(Da);
                  sa = Ca(Da);
                }
                if (sa !== null) a = true;
                else {
                  var s = Ca(tt);
                  s !== null && Kn(Vn, s.startTime - e), a = false;
                }
              }
              break e;
            } finally {
              sa = null, De = t, Fn = false;
            }
            a = void 0;
          }
        } finally {
          a ? dl() : cl = false;
        }
      }
    }
    var dl;
    typeof Vr == "function" ? dl = function() {
      Vr(Nn);
    } : typeof MessageChannel < "u" ? (Gn = new MessageChannel(), Kr = Gn.port2, Gn.port1.onmessage = Nn, dl = function() {
      Kr.postMessage(null);
    }) : dl = function() {
      jr(Nn, 0);
    };
    var Gn, Kr;
    function Kn(e, a) {
      Lo = jr(function() {
        e(se.unstable_now());
      }, a);
    }
    se.unstable_IdlePriority = 5;
    se.unstable_ImmediatePriority = 1;
    se.unstable_LowPriority = 4;
    se.unstable_NormalPriority = 3;
    se.unstable_Profiling = null;
    se.unstable_UserBlockingPriority = 2;
    se.unstable_cancelCallback = function(e) {
      e.callback = null;
    };
    se.unstable_forceFrameRate = function(e) {
      0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : Qr = 0 < e ? Math.floor(1e3 / e) : 5;
    };
    se.unstable_getCurrentPriorityLevel = function() {
      return De;
    };
    se.unstable_next = function(e) {
      switch (De) {
        case 1:
        case 2:
        case 3:
          var a = 3;
          break;
        default:
          a = De;
      }
      var t = De;
      De = a;
      try {
        return e();
      } finally {
        De = t;
      }
    };
    se.unstable_requestPaint = function() {
      Xn = true;
    };
    se.unstable_runWithPriority = function(e, a) {
      switch (e) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          e = 3;
      }
      var t = De;
      De = e;
      try {
        return a();
      } finally {
        De = t;
      }
    };
    se.unstable_scheduleCallback = function(e, a, t) {
      var l = se.unstable_now();
      switch (typeof t == "object" && t !== null ? (t = t.delay, t = typeof t == "number" && 0 < t ? l + t : l) : t = l, e) {
        case 1:
          var o = -1;
          break;
        case 2:
          o = 250;
          break;
        case 5:
          o = 1073741823;
          break;
        case 4:
          o = 1e4;
          break;
        default:
          o = 5e3;
      }
      return o = t + o, e = { id: wg++, callback: a, priorityLevel: e, startTime: t, expirationTime: o, sortIndex: -1 }, t > l ? (e.sortIndex = t, Pn(tt, e), Ca(Da) === null && e === Ca(tt) && (yo ? (Yr(Lo), Lo = -1) : yo = true, Kn(Vn, t - l))) : (e.sortIndex = o, Pn(Da, e), xo || Fn || (xo = true, cl || (cl = true, dl()))), e;
    };
    se.unstable_shouldYield = Jr;
    se.unstable_wrapCallback = function(e) {
      var a = De;
      return function() {
        var t = De;
        De = a;
        try {
          return e.apply(this, arguments);
        } finally {
          De = t;
        }
      };
    };
  });
  var ed = Sa((Qx, $r) => {
    "use strict";
    $r.exports = Wr();
  });
  var dd = Sa((D) => {
    "use strict";
    var Qn = Symbol.for("react.transitional.element"), Sg = Symbol.for("react.portal"), Cg = Symbol.for("react.fragment"), kg = Symbol.for("react.strict_mode"), Ig = Symbol.for("react.profiler"), Tg = Symbol.for("react.consumer"), Mg = Symbol.for("react.context"), Ag = Symbol.for("react.forward_ref"), Bg = Symbol.for("react.suspense"), Dg = Symbol.for("react.memo"), sd = Symbol.for("react.lazy"), Rg = Symbol.for("react.activity"), ad = Symbol.iterator;
    function zg(e) {
      return e === null || typeof e != "object" ? null : (e = ad && e[ad] || e["@@iterator"], typeof e == "function" ? e : null);
    }
    var id = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } }, nd = Object.assign, ud = {};
    function ml(e, a, t) {
      this.props = e, this.context = a, this.refs = ud, this.updater = t || id;
    }
    ml.prototype.isReactComponent = {};
    ml.prototype.setState = function(e, a) {
      if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, e, a, "setState");
    };
    ml.prototype.forceUpdate = function(e) {
      this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    };
    function fd() {
    }
    fd.prototype = ml.prototype;
    function Zn(e, a, t) {
      this.props = e, this.context = a, this.refs = ud, this.updater = t || id;
    }
    var Jn = Zn.prototype = new fd();
    Jn.constructor = Zn;
    nd(Jn, ml.prototype);
    Jn.isPureReactComponent = true;
    var td = Array.isArray;
    function Yn() {
    }
    var ee = { H: null, A: null, T: null, S: null }, rd = Object.prototype.hasOwnProperty;
    function Wn(e, a, t) {
      var l = t.ref;
      return { $typeof: Qn, type: e, key: a, ref: l !== void 0 ? l : null, props: t };
    }
    function Og(e, a) {
      return Wn(e.type, a, e.props);
    }
    function $n(e) {
      return typeof e == "object" && e !== null && e.$typeof === Qn;
    }
    function qg(e) {
      var a = { "=": "=0", ":": "=2" };
      return "$" + e.replace(/[=:]/g, function(t) {
        return a[t];
      });
    }
    var ld = /\/+/g;
    function jn(e, a) {
      return typeof e == "object" && e !== null && e.key != null ? qg("" + e.key) : a.toString(36);
    }
    function Hg(e) {
      switch (e.status) {
        case "fulfilled":
          return e.value;
        case "rejected":
          throw e.reason;
        default:
          switch (typeof e.status == "string" ? e.then(Yn, Yn) : (e.status = "pending", e.then(function(a) {
            e.status === "pending" && (e.status = "fulfilled", e.value = a);
          }, function(a) {
            e.status === "pending" && (e.status = "rejected", e.reason = a);
          })), e.status) {
            case "fulfilled":
              return e.value;
            case "rejected":
              throw e.reason;
          }
      }
      throw e;
    }
    function pl(e, a, t, l, o) {
      var s = typeof e;
      (s === "undefined" || s === "boolean") && (e = null);
      var i = false;
      if (e === null) i = true;
      else switch (s) {
        case "bigint":
        case "string":
        case "number":
          i = true;
          break;
        case "object":
          switch (e.$typeof) {
            case Qn:
            case Sg:
              i = true;
              break;
            case sd:
              return i = e._init, pl(i(e._payload), a, t, l, o);
          }
      }
      if (i) return o = o(e), i = l === "" ? "." + jn(e, 0) : l, td(o) ? (t = "", i != null && (t = i.replace(ld, "</body>/") + "/"), pl(o, a, t, "", function(r) {
        return r;
      })) : o != null && ($n(o) && (o = Og(o, t + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ld, "</body>/") + "/") + i)), a.push(o)), 1;
      i = 0;
      var n = l === "" ? "." : l + ":";
      if (td(e)) for (var u = 0; u < e.length; u++) l = e[u], s = n + jn(l, u), i += pl(l, a, t, s, o);
      else if (u = zg(e), typeof u == "function") for (e = u.call(e), u = 0; !(l = e.next()).done; ) l = l.value, s = n + jn(l, u++), i += pl(l, a, t, s, o);
      else if (s === "object") {
        if (typeof e.then == "function") return pl(Hg(e), a, t, l, o);
        throw a = String(e), Error("Objects are not valid as a React child (found: " + (a === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
      }
      return i;
    }
    function Ns(e, a, t) {
      if (e == null) return e;
      var l = [], o = 0;
      return pl(e, l, "", "", function(s) {
        return a.call(t, s, o++);
      }), l;
    }
    function Ug(e) {
      if (e._status === -1) {
        var a = e._result;
        a = a(), a.then(function(t) {
          (e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
        }, function(t) {
          (e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
        }), e._status === -1 && (e._status = 0, e._result = a);
      }
      if (e._status === 1) return e._result.default;
      throw e._result;
    }
    var od = typeof reportError == "function" ? reportError : function(e) {
      if (typeof window == "object" && typeof window.ErrorEvent == "function") {
        var a = new window.ErrorEvent("error", { bubbles: true, cancelable: true, message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e), error: e });
        if (!window.dispatchEvent(a)) return;
      } else if (typeof process == "object" && typeof process.emit == "function") {
        process.emit("uncaughtException", e);
        return;
      }
      console.error(e);
    }, Eg = { map: Ns, forEach: function(e, a, t) {
      Ns(e, function() {
        a.apply(this, arguments);
      }, t);
    }, count: function(e) {
      var a = 0;
      return Ns(e, function() {
        a++;
      }), a;
    }, toArray: function(e) {
      return Ns(e, function(a) {
        return a;
      }) || [];
    }, only: function(e) {
      if (!$n(e)) throw Error("React.Children.only expected to receive a single React element child.");
      return e;
    } };
    D.Activity = Rg;
    D.Children = Eg;
    D.Component = ml;
    D.Fragment = Cg;
    D.Profiler = Ig;
    D.PureComponent = Zn;
    D.StrictMode = kg;
    D.Suspense = Bg;
    D.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ee;
    D.__COMPILER_RUNTIME = { __proto__: null, c: function(e) {
      return ee.H.useMemoCache(e);
    } };
    D.cache = function(e) {
      return function() {
        return e.apply(null, arguments);
      };
    };
    D.cacheSignal = function() {
      return null;
    };
    D.cloneElement = function(e, a, t) {
      if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
      var l = nd({}, e.props), o = e.key;
      if (a != null) for (s in a.key !== void 0 && (o = "" + a.key), a) !rd.call(a, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && a.ref === void 0 || (l[s] = a[s]);
      var s = arguments.length - 2;
      if (s === 1) l.children = t;
      else if (1 < s) {
        for (var i = Array(s), n = 0; n < s; n++) i[n] = arguments[n + 2];
        l.children = i;
      }
      return Wn(e.type, o, l);
    };
    D.createContext = function(e) {
      return e = { $typeof: Mg, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null }, e.Provider = e, e.Consumer = { $typeof: Tg, _context: e }, e;
    };
    D.createElement = function(e, a, t) {
      var l, o = {}, s = null;
      if (a != null) for (l in a.key !== void 0 && (s = "" + a.key), a) rd.call(a, l) && l !== "key" && l !== "__self" && l !== "__source" && (o[l] = a[l]);
      var i = arguments.length - 2;
      if (i === 1) o.children = t;
      else if (1 < i) {
        for (var n = Array(i), u = 0; u < i; u++) n[u] = arguments[u + 2];
        o.children = n;
      }
      if (e && e.defaultProps) for (l in i = e.defaultProps, i) o[l] === void 0 && (o[l] = i[l]);
      return Wn(e, s, o);
    };
    D.createRef = function() {
      return { current: null };
    };
    D.forwardRef = function(e) {
      return { $typeof: Ag, render: e };
    };
    D.isValidElement = $n;
    D.lazy = function(e) {
      return { $typeof: sd, _payload: { _status: -1, _result: e }, _init: Ug };
    };
    D.memo = function(e, a) {
      return { $typeof: Dg, type: e, compare: a === void 0 ? null : a };
    };
    D.startTransition = function(e) {
      var a = ee.T, t = {};
      ee.T = t;
      try {
        var l = e(), o = ee.S;
        o !== null && o(t, l), typeof l == "object" && l !== null && typeof l.then == "function" && l.then(Yn, od);
      } catch (s) {
        od(s);
      } finally {
        a !== null && t.types !== null && (a.types = t.types), ee.T = a;
      }
    };
    D.unstable_useCacheRefresh = function() {
      return ee.H.useCacheRefresh();
    };
    D.use = function(e) {
      return ee.H.use(e);
    };
    D.useActionState = function(e, a, t) {
      return ee.H.useActionState(e, a, t);
    };
    D.useCallback = function(e, a) {
      return ee.H.useCallback(e, a);
    };
    D.useContext = function(e) {
      return ee.H.useContext(e);
    };
    D.useDebugValue = function() {
    };
    D.useDeferredValue = function(e, a) {
      return ee.H.useDeferredValue(e, a);
    };
    D.useEffect = function(e, a) {
      return ee.H.useEffect(e, a);
    };
    D.useEffectEvent = function(e) {
      return ee.H.useEffectEvent(e);
    };
    D.useId = function() {
      return ee.H.useId();
    };
    D.useImperativeHandle = function(e, a, t) {
      return ee.H.useImperativeHandle(e, a, t);
    };
    D.useInsertionEffect = function(e, a) {
      return ee.H.useInsertionEffect(e, a);
    };
    D.useLayoutEffect = function(e, a) {
      return ee.H.useLayoutEffect(e, a);
    };
    D.useMemo = function(e, a) {
      return ee.H.useMemo(e, a);
    };
    D.useOptimistic = function(e, a) {
      return ee.H.useOptimistic(e, a);
    };
    D.useReducer = function(e, a, t) {
      return ee.H.useReducer(e, a, t);
    };
    D.useRef = function(e) {
      return ee.H.useRef(e);
    };
    D.useState = function(e) {
      return ee.H.useState(e);
    };
    D.useSyncExternalStore = function(e, a, t) {
      return ee.H.useSyncExternalStore(e, a, t);
    };
    D.useTransition = function() {
      return ee.H.useTransition();
    };
    D.version = "19.2.8";
  });
  var hl = Sa((Jx, cd) => {
    "use strict";
    cd.exports = dd();
  });
  var md = Sa((Oe) => {
    "use strict";
    var Ng = hl();
    function pd(e) {
      var a = "https://react.dev/errors/" + e;
      if (1 < arguments.length) {
        a += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var t = 2; t < arguments.length; t++) a += "&args[]=" + encodeURIComponent(arguments[t]);
      }
      return "Minified React error #" + e + "; visit " + a + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    function lt() {
    }
    var ze = { d: { f: lt, r: function() {
      throw Error(pd(522));
    }, D: lt, C: lt, L: lt, m: lt, X: lt, S: lt, M: lt }, p: 0, findDOMNode: null }, Gg = Symbol.for("react.portal");
    function Pg(e, a, t) {
      var l = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return { $typeof: Gg, key: l == null ? null : "" + l, children: e, containerInfo: a, implementation: t };
    }
    var vo = Ng.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function Gs(e, a) {
      if (e === "font") return "";
      if (typeof a == "string") return a === "use-credentials" ? a : "";
    }
    Oe.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ze;
    Oe.createPortal = function(e, a) {
      var t = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!a || a.nodeType !== 1 && a.nodeType !== 9 && a.nodeType !== 11) throw Error(pd(299));
      return Pg(e, a, null, t);
    };
    Oe.flushSync = function(e) {
      var a = vo.T, t = ze.p;
      try {
        if (vo.T = null, ze.p = 2, e) return e();
      } finally {
        vo.T = a, ze.p = t, ze.d.f();
      }
    };
    Oe.preconnect = function(e, a) {
      typeof e == "string" && (a ? (a = a.crossOrigin, a = typeof a == "string" ? a === "use-credentials" ? a : "" : void 0) : a = null, ze.d.C(e, a));
    };
    Oe.prefetchDNS = function(e) {
      typeof e == "string" && ze.d.D(e);
    };
    Oe.preinit = function(e, a) {
      if (typeof e == "string" && a && typeof a.as == "string") {
        var t = a.as, l = Gs(t, a.crossOrigin), o = typeof a.integrity == "string" ? a.integrity : void 0, s = typeof a.fetchPriority == "string" ? a.fetchPriority : void 0;
        t === "style" ? ze.d.S(e, typeof a.precedence == "string" ? a.precedence : void 0, { crossOrigin: l, integrity: o, fetchPriority: s }) : t === "script" && ze.d.X(e, { crossOrigin: l, integrity: o, fetchPriority: s, nonce: typeof a.nonce == "string" ? a.nonce : void 0 });
      }
    };
    Oe.preinitModule = function(e, a) {
      if (typeof e == "string") if (typeof a == "object" && a !== null) {
        if (a.as == null || a.as === "script") {
          var t = Gs(a.as, a.crossOrigin);
          ze.d.M(e, { crossOrigin: t, integrity: typeof a.integrity == "string" ? a.integrity : void 0, nonce: typeof a.nonce == "string" ? a.nonce : void 0 });
        }
      } else a == null && ze.d.M(e);
    };
    Oe.preload = function(e, a) {
      if (typeof e == "string" && typeof a == "object" && a !== null && typeof a.as == "string") {
        var t = a.as, l = Gs(t, a.crossOrigin);
        ze.d.L(e, t, { crossOrigin: l, integrity: typeof a.integrity == "string" ? a.integrity : void 0, nonce: typeof a.nonce == "string" ? a.nonce : void 0, type: typeof a.type == "string" ? a.type : void 0, fetchPriority: typeof a.fetchPriority == "string" ? a.fetchPriority : void 0, referrerPolicy: typeof a.referrerPolicy == "string" ? a.referrerPolicy : void 0, imageSrcSet: typeof a.imageSrcSet == "string" ? a.imageSrcSet : void 0, imageSizes: typeof a.imageSizes == "string" ? a.imageSizes : void 0, media: typeof a.media == "string" ? a.media : void 0 });
      }
    };
    Oe.preloadModule = function(e, a) {
      if (typeof e == "string") if (a) {
        var t = Gs(a.as, a.crossOrigin);
        ze.d.m(e, { as: typeof a.as == "string" && a.as !== "script" ? a.as : void 0, crossOrigin: t, integrity: typeof a.integrity == "string" ? a.integrity : void 0 });
      } else ze.d.m(e);
    };
    Oe.requestFormReset = function(e) {
      ze.d.r(e);
    };
    Oe.unstable_batchedUpdates = function(e, a) {
      return e(a);
    };
    Oe.useFormState = function(e, a, t) {
      return vo.H.useFormState(e, a, t);
    };
    Oe.useFormStatus = function() {
      return vo.H.useHostTransitionStatus();
    };
    Oe.version = "19.2.8";
  });
  var _d = Sa(($x, gd) => {
    "use strict";
    function hd() {
      if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(hd);
      } catch (e) {
        console.error(e);
      }
    }
    hd(), gd.exports = md();
  });
  var Mh = Sa((pn) => {
    "use strict";
    var ye = ed(), Fc = hl(), Fg = _d();
    function v(e) {
      var a = "https://react.dev/errors/" + e;
      if (1 < arguments.length) {
        a += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var t = 2; t < arguments.length; t++) a += "&args[]=" + encodeURIComponent(arguments[t]);
      }
      return "Minified React error #" + e + "; visit " + a + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    function Xc(e) {
      return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
    }
    function us(e) {
      var a = e, t = e;
      if (e.alternate) for (; a.return; ) a = a.return;
      else {
        e = a;
        do
          a = e, (a.flags & 4098) !== 0 && (t = a.return), e = a.return;
        while (e);
      }
      return a.tag === 3 ? t : null;
    }
    function Vc(e) {
      if (e.tag === 13) {
        var a = e.memoizedState;
        if (a === null && (e = e.alternate, e !== null && (a = e.memoizedState)), a !== null) return a.dehydrated;
      }
      return null;
    }
    function Kc(e) {
      if (e.tag === 31) {
        var a = e.memoizedState;
        if (a === null && (e = e.alternate, e !== null && (a = e.memoizedState)), a !== null) return a.dehydrated;
      }
      return null;
    }
    function bd(e) {
      if (us(e) !== e) throw Error(v(188));
    }
    function Xg(e) {
      var a = e.alternate;
      if (!a) {
        if (a = us(e), a === null) throw Error(v(188));
        return a !== e ? null : e;
      }
      for (var t = e, l = a; ; ) {
        var o = t.return;
        if (o === null) break;
        var s = o.alternate;
        if (s === null) {
          if (l = o.return, l !== null) {
            t = l;
            continue;
          }
          break;
        }
        if (o.child === s.child) {
          for (s = o.child; s; ) {
            if (s === t) return bd(o), e;
            if (s === l) return bd(o), a;
            s = s.sibling;
          }
          throw Error(v(188));
        }
        if (t.return !== l.return) t = o, l = s;
        else {
          for (var i = false, n = o.child; n; ) {
            if (n === t) {
              i = true, t = o, l = s;
              break;
            }
            if (n === l) {
              i = true, l = o, t = s;
              break;
            }
            n = n.sibling;
          }
          if (!i) {
            for (n = s.child; n; ) {
              if (n === t) {
                i = true, t = s, l = o;
                break;
              }
              if (n === l) {
                i = true, l = s, t = o;
                break;
              }
              n = n.sibling;
            }
            if (!i) throw Error(v(189));
          }
        }
        if (t.alternate !== l) throw Error(v(190));
      }
      if (t.tag !== 3) throw Error(v(188));
      return t.stateNode.current === t ? e : a;
    }
    function jc(e) {
      var a = e.tag;
      if (a === 5 || a === 26 || a === 27 || a === 6) return e;
      for (e = e.child; e !== null; ) {
        if (a = jc(e), a !== null) return a;
        e = e.sibling;
      }
      return null;
    }
    var le = Object.assign, Vg = Symbol.for("react.element"), Ps = Symbol.for("react.transitional.element"), Ao = Symbol.for("react.portal"), Ll = Symbol.for("react.fragment"), Yc = Symbol.for("react.strict_mode"), Ru = Symbol.for("react.profiler"), Qc = Symbol.for("react.consumer"), Na = Symbol.for("react.context"), Mf = Symbol.for("react.forward_ref"), zu = Symbol.for("react.suspense"), Ou = Symbol.for("react.suspense_list"), Af = Symbol.for("react.memo"), ot = Symbol.for("react.lazy");
    Symbol.for("react.scope");
    var qu = Symbol.for("react.activity");
    Symbol.for("react.legacy_hidden");
    Symbol.for("react.tracing_marker");
    var Kg = Symbol.for("react.memo_cache_sentinel");
    Symbol.for("react.view_transition");
    var xd = Symbol.iterator;
    function wo(e) {
      return e === null || typeof e != "object" ? null : (e = xd && e[xd] || e["@@iterator"], typeof e == "function" ? e : null);
    }
    var jg = Symbol.for("react.client.reference");
    function Hu(e) {
      if (e == null) return null;
      if (typeof e == "function") return e.$typeof === jg ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case Ll:
          return "Fragment";
        case Ru:
          return "Profiler";
        case Yc:
          return "StrictMode";
        case zu:
          return "Suspense";
        case Ou:
          return "SuspenseList";
        case qu:
          return "Activity";
      }
      if (typeof e == "object") switch (e.$typeof) {
        case Ao:
          return "Portal";
        case Na:
          return e.displayName || "Context";
        case Qc:
          return (e._context.displayName || "Context") + ".Consumer";
        case Mf:
          var a = e.render;
          return e = e.displayName, e || (e = a.displayName || a.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case Af:
          return a = e.displayName || null, a !== null ? a : Hu(e.type) || "Memo";
        case ot:
          a = e._payload, e = e._init;
          try {
            return Hu(e(a));
          } catch {
          }
      }
      return null;
    }
    var Bo = Array.isArray, A = Fc.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, X = Fg.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Xt = { pending: false, data: null, method: null, action: null }, Uu = [], vl = -1;
    function Aa(e) {
      return { current: e };
    }
    function Ce(e) {
      0 > vl || (e.current = Uu[vl], Uu[vl] = null, vl--);
    }
    function W(e, a) {
      vl++, Uu[vl] = e.current, e.current = a;
    }
    var Ma = Aa(null), Yo = Aa(null), ht = Aa(null), Li = Aa(null);
    function vi(e, a) {
      switch (W(ht, a), W(Yo, e), W(Ma, null), a.nodeType) {
        case 9:
        case 11:
          e = (e = a.documentElement) && (e = e.namespaceURI) ? kc(e) : 0;
          break;
        default:
          if (e = a.tagName, a = a.namespaceURI) a = kc(a), e = hh(a, e);
          else switch (e) {
            case "svg":
              e = 1;
              break;
            case "math":
              e = 2;
              break;
            default:
              e = 0;
          }
      }
      Ce(Ma), W(Ma, e);
    }
    function Nl() {
      Ce(Ma), Ce(Yo), Ce(ht);
    }
    function Eu(e) {
      e.memoizedState !== null && W(Li, e);
      var a = Ma.current, t = hh(a, e.type);
      a !== t && (W(Yo, e), W(Ma, t));
    }
    function wi(e) {
      Yo.current === e && (Ce(Ma), Ce(Yo)), Li.current === e && (Ce(Li), ss._currentValue = Xt);
    }
    var eu, yd;
    function Nt(e) {
      if (eu === void 0) try {
        throw Error();
      } catch (t) {
        var a = t.stack.trim().match(/\n( *(at )?)/);
        eu = a && a[1] || "", yd = -1 < t.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < t.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
      return `
` + eu + e + yd;
    }
    var au = false;
    function tu(e, a) {
      if (!e || au) return "";
      au = true;
      var t = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var l = { DetermineComponentFrameRoot: function() {
          try {
            if (a) {
              var x = function() {
                throw Error();
              };
              if (Object.defineProperty(x.prototype, "props", { set: function() {
                throw Error();
              } }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(x, []);
                } catch (d) {
                  var m = d;
                }
                Reflect.construct(e, [], x);
              } else {
                try {
                  x.call();
                } catch (d) {
                  m = d;
                }
                e.call(x.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (d) {
                m = d;
              }
              (x = e()) && typeof x.catch == "function" && x.catch(function() {
              });
            }
          } catch (d) {
            if (d && m && typeof d.stack == "string") return [d.stack, m.stack];
          }
          return [null, null];
        } };
        l.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var o = Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot, "name");
        o && o.configurable && Object.defineProperty(l.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
        var s = l.DetermineComponentFrameRoot(), i = s[0], n = s[1];
        if (i && n) {
          var u = i.split(`
`), r = n.split(`
`);
          for (o = l = 0; l < u.length && !u[l].includes("DetermineComponentFrameRoot"); ) l++;
          for (; o < r.length && !r[o].includes("DetermineComponentFrameRoot"); ) o++;
          if (l === u.length || o === r.length) for (l = u.length - 1, o = r.length - 1; 1 <= l && 0 <= o && u[l] !== r[o]; ) o--;
          for (; 1 <= l && 0 <= o; l--, o--) if (u[l] !== r[o]) {
            if (l !== 1 || o !== 1) do
              if (l--, o--, 0 > o || u[l] !== r[o]) {
                var _ = `
` + u[l].replace(" at new ", " at ");
                return e.displayName && _.includes("<anonymous>") && (_ = _.replace("<anonymous>", e.displayName)), _;
              }
            while (1 <= l && 0 <= o);
            break;
          }
        }
      } finally {
        au = false, Error.prepareStackTrace = t;
      }
      return (t = e ? e.displayName || e.name : "") ? Nt(t) : "";
    }
    function Yg(e, a) {
      switch (e.tag) {
        case 26:
        case 27:
        case 5:
          return Nt(e.type);
        case 16:
          return Nt("Lazy");
        case 13:
          return e.child !== a && a !== null ? Nt("Suspense Fallback") : Nt("Suspense");
        case 19:
          return Nt("SuspenseList");
        case 0:
        case 15:
          return tu(e.type, false);
        case 11:
          return tu(e.type.render, false);
        case 1:
          return tu(e.type, true);
        case 31:
          return Nt("Activity");
        default:
          return "";
      }
    }
    function Ld(e) {
      try {
        var a = "", t = null;
        do
          a += Yg(e, t), t = e, e = e.return;
        while (e);
        return a;
      } catch (l) {
        return `
Error generating stack: ` + l.message + `
` + l.stack;
      }
    }
    var Nu = Object.prototype.hasOwnProperty, Bf = ye.unstable_scheduleCallback, lu = ye.unstable_cancelCallback, Qg = ye.unstable_shouldYield, Zg = ye.unstable_requestPaint, We = ye.unstable_now, Jg = ye.unstable_getCurrentPriorityLevel, Zc = ye.unstable_ImmediatePriority, Jc = ye.unstable_UserBlockingPriority, Si = ye.unstable_NormalPriority, Wg = ye.unstable_LowPriority, Wc = ye.unstable_IdlePriority, $g = ye.log, e_ = ye.unstable_setDisableYieldValue, fs = null, $e = null;
    function rt(e) {
      if (typeof $g == "function" && e_(e), $e && typeof $e.setStrictMode == "function") try {
        $e.setStrictMode(fs, e);
      } catch {
      }
    }
    var ea = Math.clz32 ? Math.clz32 : l_, a_ = Math.log, t_ = Math.LN2;
    function l_(e) {
      return e >>>= 0, e === 0 ? 32 : 31 - (a_(e) / t_ | 0) | 0;
    }
    var Fs = 256, Xs = 262144, Vs = 4194304;
    function Gt(e) {
      var a = e & 42;
      if (a !== 0) return a;
      switch (e & -e) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return e & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return e & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return e;
      }
    }
    function Zi(e, a, t) {
      var l = e.pendingLanes;
      if (l === 0) return 0;
      var o = 0, s = e.suspendedLanes, i = e.pingedLanes;
      e = e.warmLanes;
      var n = l & 134217727;
      return n !== 0 ? (l = n & ~s, l !== 0 ? o = Gt(l) : (i &= n, i !== 0 ? o = Gt(i) : t || (t = n & ~e, t !== 0 && (o = Gt(t))))) : (n = l & ~s, n !== 0 ? o = Gt(n) : i !== 0 ? o = Gt(i) : t || (t = l & ~e, t !== 0 && (o = Gt(t)))), o === 0 ? 0 : a !== 0 && a !== o && (a & s) === 0 && (s = o & -o, t = a & -a, s >= t || s === 32 && (t & 4194048) !== 0) ? a : o;
    }
    function rs(e, a) {
      return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & a) === 0;
    }
    function o_(e, a) {
      switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return a + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return a + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function $c() {
      var e = Vs;
      return Vs <<= 1, (Vs & 62914560) === 0 && (Vs = 4194304), e;
    }
    function ou(e) {
      for (var a = [], t = 0; 31 > t; t++) a.push(e);
      return a;
    }
    function ds(e, a) {
      e.pendingLanes |= a, a !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
    }
    function s_(e, a, t, l, o, s) {
      var i = e.pendingLanes;
      e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= t, e.entangledLanes &= t, e.errorRecoveryDisabledLanes &= t, e.shellSuspendCounter = 0;
      var n = e.entanglements, u = e.expirationTimes, r = e.hiddenUpdates;
      for (t = i & ~t; 0 < t; ) {
        var _ = 31 - ea(t), x = 1 << _;
        n[_] = 0, u[_] = -1;
        var m = r[_];
        if (m !== null) for (r[_] = null, _ = 0; _ < m.length; _++) {
          var d = m[_];
          d !== null && (d.lane &= -536870913);
        }
        t &= ~x;
      }
      l !== 0 && ep(e, l, 0), s !== 0 && o === 0 && e.tag !== 0 && (e.suspendedLanes |= s & ~(i & ~a));
    }
    function ep(e, a, t) {
      e.pendingLanes |= a, e.suspendedLanes &= ~a;
      var l = 31 - ea(a);
      e.entangledLanes |= a, e.entanglements[l] = e.entanglements[l] | 1073741824 | t & 261930;
    }
    function ap(e, a) {
      var t = e.entangledLanes |= a;
      for (e = e.entanglements; t; ) {
        var l = 31 - ea(t), o = 1 << l;
        o & a | e[l] & a && (e[l] |= a), t &= ~o;
      }
    }
    function tp(e, a) {
      var t = a & -a;
      return t = (t & 42) !== 0 ? 1 : Df(t), (t & (e.suspendedLanes | a)) !== 0 ? 0 : t;
    }
    function Df(e) {
      switch (e) {
        case 2:
          e = 1;
          break;
        case 8:
          e = 4;
          break;
        case 32:
          e = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          e = 128;
          break;
        case 268435456:
          e = 134217728;
          break;
        default:
          e = 0;
      }
      return e;
    }
    function Rf(e) {
      return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
    }
    function lp() {
      var e = X.p;
      return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : kh(e.type));
    }
    function vd(e, a) {
      var t = X.p;
      try {
        return X.p = e, a();
      } finally {
        X.p = t;
      }
    }
    var Tt = Math.random().toString(36).slice(2), Ie = "__reactFiber$" + Tt, Fe = "__reactProps$" + Tt, Jl = "__reactContainer$" + Tt, Gu = "__reactEvents$" + Tt, i_ = "__reactListeners$" + Tt, n_ = "__reactHandles$" + Tt, wd = "__reactResources$" + Tt, cs = "__reactMarker$" + Tt;
    function zf(e) {
      delete e[Ie], delete e[Fe], delete e[Gu], delete e[i_], delete e[n_];
    }
    function wl(e) {
      var a = e[Ie];
      if (a) return a;
      for (var t = e.parentNode; t; ) {
        if (a = t[Jl] || t[Ie]) {
          if (t = a.alternate, a.child !== null || t !== null && t.child !== null) for (e = Bc(e); e !== null; ) {
            if (t = e[Ie]) return t;
            e = Bc(e);
          }
          return a;
        }
        e = t, t = e.parentNode;
      }
      return null;
    }
    function Wl(e) {
      if (e = e[Ie] || e[Jl]) {
        var a = e.tag;
        if (a === 5 || a === 6 || a === 13 || a === 31 || a === 26 || a === 27 || a === 3) return e;
      }
      return null;
    }
    function Do(e) {
      var a = e.tag;
      if (a === 5 || a === 26 || a === 27 || a === 6) return e.stateNode;
      throw Error(v(33));
    }
    function Rl(e) {
      var a = e[wd];
      return a || (a = e[wd] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), a;
    }
    function Se(e) {
      e[cs] = true;
    }
    var op = /* @__PURE__ */ new Set(), sp = {};
    function el(e, a) {
      Gl(e, a), Gl(e + "Capture", a);
    }
    function Gl(e, a) {
      for (sp[e] = a, e = 0; e < a.length; e++) op.add(a[e]);
    }
    var u_ = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Sd = {}, Cd = {};
    function f_(e) {
      return Nu.call(Cd, e) ? true : Nu.call(Sd, e) ? false : u_.test(e) ? Cd[e] = true : (Sd[e] = true, false);
    }
    function ii(e, a, t) {
      if (f_(a)) if (t === null) e.removeAttribute(a);
      else {
        switch (typeof t) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(a);
            return;
          case "boolean":
            var l = a.toLowerCase().slice(0, 5);
            if (l !== "data-" && l !== "aria-") {
              e.removeAttribute(a);
              return;
            }
        }
        e.setAttribute(a, "" + t);
      }
    }
    function Ks(e, a, t) {
      if (t === null) e.removeAttribute(a);
      else {
        switch (typeof t) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(a);
            return;
        }
        e.setAttribute(a, "" + t);
      }
    }
    function Ra(e, a, t, l) {
      if (l === null) e.removeAttribute(t);
      else {
        switch (typeof l) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(t);
            return;
        }
        e.setAttributeNS(a, t, "" + l);
      }
    }
    function na(e) {
      switch (typeof e) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return e;
        case "object":
          return e;
        default:
          return "";
      }
    }
    function ip(e) {
      var a = e.type;
      return (e = e.nodeName) && e.toLowerCase() === "input" && (a === "checkbox" || a === "radio");
    }
    function r_(e, a, t) {
      var l = Object.getOwnPropertyDescriptor(e.constructor.prototype, a);
      if (!e.hasOwnProperty(a) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
        var o = l.get, s = l.set;
        return Object.defineProperty(e, a, { configurable: true, get: function() {
          return o.call(this);
        }, set: function(i) {
          t = "" + i, s.call(this, i);
        } }), Object.defineProperty(e, a, { enumerable: l.enumerable }), { getValue: function() {
          return t;
        }, setValue: function(i) {
          t = "" + i;
        }, stopTracking: function() {
          e._valueTracker = null, delete e[a];
        } };
      }
    }
    function Pu(e) {
      if (!e._valueTracker) {
        var a = ip(e) ? "checked" : "value";
        e._valueTracker = r_(e, a, "" + e[a]);
      }
    }
    function np(e) {
      if (!e) return false;
      var a = e._valueTracker;
      if (!a) return true;
      var t = a.getValue(), l = "";
      return e && (l = ip(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== t ? (a.setValue(e), true) : false;
    }
    function Ci(e) {
      if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    var d_ = /[\n"\\]/g;
    function ra(e) {
      return e.replace(d_, function(a) {
        return "\\" + a.charCodeAt(0).toString(16) + " ";
      });
    }
    function Fu(e, a, t, l, o, s, i, n) {
      e.name = "", i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" ? e.type = i : e.removeAttribute("type"), a != null ? i === "number" ? (a === 0 && e.value === "" || e.value != a) && (e.value = "" + na(a)) : e.value !== "" + na(a) && (e.value = "" + na(a)) : i !== "submit" && i !== "reset" || e.removeAttribute("value"), a != null ? Xu(e, i, na(a)) : t != null ? Xu(e, i, na(t)) : l != null && e.removeAttribute("value"), o == null && s != null && (e.defaultChecked = !!s), o != null && (e.checked = o && typeof o != "function" && typeof o != "symbol"), n != null && typeof n != "function" && typeof n != "symbol" && typeof n != "boolean" ? e.name = "" + na(n) : e.removeAttribute("name");
    }
    function up(e, a, t, l, o, s, i, n) {
      if (s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" && (e.type = s), a != null || t != null) {
        if (!(s !== "submit" && s !== "reset" || a != null)) {
          Pu(e);
          return;
        }
        t = t != null ? "" + na(t) : "", a = a != null ? "" + na(a) : t, n || a === e.value || (e.value = a), e.defaultValue = a;
      }
      l = l ?? o, l = typeof l != "function" && typeof l != "symbol" && !!l, e.checked = n ? e.checked : !!l, e.defaultChecked = !!l, i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" && (e.name = i), Pu(e);
    }
    function Xu(e, a, t) {
      a === "number" && Ci(e.ownerDocument) === e || e.defaultValue === "" + t || (e.defaultValue = "" + t);
    }
    function zl(e, a, t, l) {
      if (e = e.options, a) {
        a = {};
        for (var o = 0; o < t.length; o++) a["$" + t[o]] = true;
        for (t = 0; t < e.length; t++) o = a.hasOwnProperty("$" + e[t].value), e[t].selected !== o && (e[t].selected = o), o && l && (e[t].defaultSelected = true);
      } else {
        for (t = "" + na(t), a = null, o = 0; o < e.length; o++) {
          if (e[o].value === t) {
            e[o].selected = true, l && (e[o].defaultSelected = true);
            return;
          }
          a !== null || e[o].disabled || (a = e[o]);
        }
        a !== null && (a.selected = true);
      }
    }
    function fp(e, a, t) {
      if (a != null && (a = "" + na(a), a !== e.value && (e.value = a), t == null)) {
        e.defaultValue !== a && (e.defaultValue = a);
        return;
      }
      e.defaultValue = t != null ? "" + na(t) : "";
    }
    function rp(e, a, t, l) {
      if (a == null) {
        if (l != null) {
          if (t != null) throw Error(v(92));
          if (Bo(l)) {
            if (1 < l.length) throw Error(v(93));
            l = l[0];
          }
          t = l;
        }
        t == null && (t = ""), a = t;
      }
      t = na(a), e.defaultValue = t, l = e.textContent, l === t && l !== "" && l !== null && (e.value = l), Pu(e);
    }
    function Pl(e, a) {
      if (a) {
        var t = e.firstChild;
        if (t && t === e.lastChild && t.nodeType === 3) {
          t.nodeValue = a;
          return;
        }
      }
      e.textContent = a;
    }
    var c_ = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
    function kd(e, a, t) {
      var l = a.indexOf("--") === 0;
      t == null || typeof t == "boolean" || t === "" ? l ? e.setProperty(a, "") : a === "float" ? e.cssFloat = "" : e[a] = "" : l ? e.setProperty(a, t) : typeof t != "number" || t === 0 || c_.has(a) ? a === "float" ? e.cssFloat = t : e[a] = ("" + t).trim() : e[a] = t + "px";
    }
    function dp(e, a, t) {
      if (a != null && typeof a != "object") throw Error(v(62));
      if (e = e.style, t != null) {
        for (var l in t) !t.hasOwnProperty(l) || a != null && a.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
        for (var o in a) l = a[o], a.hasOwnProperty(o) && t[o] !== l && kd(e, o, l);
      } else for (var s in a) a.hasOwnProperty(s) && kd(e, s, a[s]);
    }
    function Of(e) {
      if (e.indexOf("-") === -1) return false;
      switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return false;
        default:
          return true;
      }
    }
    var p_ = /* @__PURE__ */ new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]]), m_ = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function ni(e) {
      return m_.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
    }
    function Ga() {
    }
    var Vu = null;
    function qf(e) {
      return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
    }
    var Sl = null, Ol = null;
    function Id(e) {
      var a = Wl(e);
      if (a && (e = a.stateNode)) {
        var t = e[Fe] || null;
        e: switch (e = a.stateNode, a.type) {
          case "input":
            if (Fu(e, t.value, t.defaultValue, t.defaultValue, t.checked, t.defaultChecked, t.type, t.name), a = t.name, t.type === "radio" && a != null) {
              for (t = e; t.parentNode; ) t = t.parentNode;
              for (t = t.querySelectorAll('input[name="' + ra("" + a) + '"][type="radio"]'), a = 0; a < t.length; a++) {
                var l = t[a];
                if (l !== e && l.form === e.form) {
                  var o = l[Fe] || null;
                  if (!o) throw Error(v(90));
                  Fu(l, o.value, o.defaultValue, o.defaultValue, o.checked, o.defaultChecked, o.type, o.name);
                }
              }
              for (a = 0; a < t.length; a++) l = t[a], l.form === e.form && np(l);
            }
            break e;
          case "textarea":
            fp(e, t.value, t.defaultValue);
            break e;
          case "select":
            a = t.value, a != null && zl(e, !!t.multiple, a, false);
        }
      }
    }
    var su = false;
    function cp(e, a, t) {
      if (su) return e(a, t);
      su = true;
      try {
        var l = e(a);
        return l;
      } finally {
        if (su = false, (Sl !== null || Ol !== null) && (fn(), Sl && (a = Sl, e = Ol, Ol = Sl = null, Id(a), e))) for (a = 0; a < e.length; a++) Id(e[a]);
      }
    }
    function Qo(e, a) {
      var t = e.stateNode;
      if (t === null) return null;
      var l = t[Fe] || null;
      if (l === null) return null;
      t = l[a];
      e: switch (a) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (l = !l.disabled) || (e = e.type, l = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !l;
          break e;
        default:
          e = false;
      }
      if (e) return null;
      if (t && typeof t != "function") throw Error(v(231, a, typeof t));
      return t;
    }
    var Ka = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Ku = false;
    if (Ka) try {
      gl = {}, Object.defineProperty(gl, "passive", { get: function() {
        Ku = true;
      } }), window.addEventListener("test", gl, gl), window.removeEventListener("test", gl, gl);
    } catch {
      Ku = false;
    }
    var gl, dt = null, Hf = null, ui = null;
    function pp() {
      if (ui) return ui;
      var e, a = Hf, t = a.length, l, o = "value" in dt ? dt.value : dt.textContent, s = o.length;
      for (e = 0; e < t && a[e] === o[e]; e++) ;
      var i = t - e;
      for (l = 1; l <= i && a[t - l] === o[s - l]; l++) ;
      return ui = o.slice(e, 1 < l ? 1 - l : void 0);
    }
    function fi(e) {
      var a = e.keyCode;
      return "charCode" in e ? (e = e.charCode, e === 0 && a === 13 && (e = 13)) : e = a, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
    }
    function js() {
      return true;
    }
    function Td() {
      return false;
    }
    function Xe(e) {
      function a(t, l, o, s, i) {
        this._reactName = t, this._targetInst = o, this.type = l, this.nativeEvent = s, this.target = i, this.currentTarget = null;
        for (var n in e) e.hasOwnProperty(n) && (t = e[n], this[n] = t ? t(s) : s[n]);
        return this.isDefaultPrevented = (s.defaultPrevented != null ? s.defaultPrevented : s.returnValue === false) ? js : Td, this.isPropagationStopped = Td, this;
      }
      return le(a.prototype, { preventDefault: function() {
        this.defaultPrevented = true;
        var t = this.nativeEvent;
        t && (t.preventDefault ? t.preventDefault() : typeof t.returnValue != "unknown" && (t.returnValue = false), this.isDefaultPrevented = js);
      }, stopPropagation: function() {
        var t = this.nativeEvent;
        t && (t.stopPropagation ? t.stopPropagation() : typeof t.cancelBubble != "unknown" && (t.cancelBubble = true), this.isPropagationStopped = js);
      }, persist: function() {
      }, isPersistent: js }), a;
    }
    var al = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
      return e.timeStamp || Date.now();
    }, defaultPrevented: 0, isTrusted: 0 }, Ji = Xe(al), ps = le({}, al, { view: 0, detail: 0 }), h_ = Xe(ps), iu, nu, So, Wi = le({}, ps, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Uf, button: 0, buttons: 0, relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    }, movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== So && (So && e.type === "mousemove" ? (iu = e.screenX - So.screenX, nu = e.screenY - So.screenY) : nu = iu = 0, So = e), iu);
    }, movementY: function(e) {
      return "movementY" in e ? e.movementY : nu;
    } }), Md = Xe(Wi), g_ = le({}, Wi, { dataTransfer: 0 }), __ = Xe(g_), b_ = le({}, ps, { relatedTarget: 0 }), uu = Xe(b_), x_ = le({}, al, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), y_ = Xe(x_), L_ = le({}, al, { clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    } }), v_ = Xe(L_), w_ = le({}, al, { data: 0 }), Ad = Xe(w_), S_ = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, C_ = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, k_ = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function I_(e) {
      var a = this.nativeEvent;
      return a.getModifierState ? a.getModifierState(e) : (e = k_[e]) ? !!a[e] : false;
    }
    function Uf() {
      return I_;
    }
    var T_ = le({}, ps, { key: function(e) {
      if (e.key) {
        var a = S_[e.key] || e.key;
        if (a !== "Unidentified") return a;
      }
      return e.type === "keypress" ? (e = fi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? C_[e.keyCode] || "Unidentified" : "";
    }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Uf, charCode: function(e) {
      return e.type === "keypress" ? fi(e) : 0;
    }, keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }, which: function(e) {
      return e.type === "keypress" ? fi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    } }), M_ = Xe(T_), A_ = le({}, Wi, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Bd = Xe(A_), B_ = le({}, ps, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Uf }), D_ = Xe(B_), R_ = le({}, al, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), z_ = Xe(R_), O_ = le({}, Wi, { deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    }, deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    }, deltaZ: 0, deltaMode: 0 }), q_ = Xe(O_), H_ = le({}, al, { newState: 0, oldState: 0 }), U_ = Xe(H_), E_ = [9, 13, 27, 32], Ef = Ka && "CompositionEvent" in window, Oo = null;
    Ka && "documentMode" in document && (Oo = document.documentMode);
    var N_ = Ka && "TextEvent" in window && !Oo, mp = Ka && (!Ef || Oo && 8 < Oo && 11 >= Oo), Dd = " ", Rd = false;
    function hp(e, a) {
      switch (e) {
        case "keyup":
          return E_.indexOf(a.keyCode) !== -1;
        case "keydown":
          return a.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
          return true;
        default:
          return false;
      }
    }
    function gp(e) {
      return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
    }
    var Cl = false;
    function G_(e, a) {
      switch (e) {
        case "compositionend":
          return gp(a);
        case "keypress":
          return a.which !== 32 ? null : (Rd = true, Dd);
        case "textInput":
          return e = a.data, e === Dd && Rd ? null : e;
        default:
          return null;
      }
    }
    function P_(e, a) {
      if (Cl) return e === "compositionend" || !Ef && hp(e, a) ? (e = pp(), ui = Hf = dt = null, Cl = false, e) : null;
      switch (e) {
        case "paste":
          return null;
        case "keypress":
          if (!(a.ctrlKey || a.altKey || a.metaKey) || a.ctrlKey && a.altKey) {
            if (a.char && 1 < a.char.length) return a.char;
            if (a.which) return String.fromCharCode(a.which);
          }
          return null;
        case "compositionend":
          return mp && a.locale !== "ko" ? null : a.data;
        default:
          return null;
      }
    }
    var F_ = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
    function zd(e) {
      var a = e && e.nodeName && e.nodeName.toLowerCase();
      return a === "input" ? !!F_[e.type] : a === "textarea";
    }
    function _p(e, a, t, l) {
      Sl ? Ol ? Ol.push(l) : Ol = [l] : Sl = l, a = Fi(a, "onChange"), 0 < a.length && (t = new Ji("onChange", "change", null, t, l), e.push({ event: t, listeners: a }));
    }
    var qo = null, Zo = null;
    function X_(e) {
      ch(e, 0);
    }
    function $i(e) {
      var a = Do(e);
      if (np(a)) return e;
    }
    function Od(e, a) {
      if (e === "change") return a;
    }
    var bp = false;
    Ka && (Ka ? (Qs = "oninput" in document, Qs || (fu = document.createElement("div"), fu.setAttribute("oninput", "return;"), Qs = typeof fu.oninput == "function"), Ys = Qs) : Ys = false, bp = Ys && (!document.documentMode || 9 < document.documentMode));
    var Ys, Qs, fu;
    function qd() {
      qo && (qo.detachEvent("onpropertychange", xp), Zo = qo = null);
    }
    function xp(e) {
      if (e.propertyName === "value" && $i(Zo)) {
        var a = [];
        _p(a, Zo, e, qf(e)), cp(X_, a);
      }
    }
    function V_(e, a, t) {
      e === "focusin" ? (qd(), qo = a, Zo = t, qo.attachEvent("onpropertychange", xp)) : e === "focusout" && qd();
    }
    function K_(e) {
      if (e === "selectionchange" || e === "keyup" || e === "keydown") return $i(Zo);
    }
    function j_(e, a) {
      if (e === "click") return $i(a);
    }
    function Y_(e, a) {
      if (e === "input" || e === "change") return $i(a);
    }
    function Q_(e, a) {
      return e === a && (e !== 0 || 1 / e === 1 / a) || e !== e && a !== a;
    }
    var ta = typeof Object.is == "function" ? Object.is : Q_;
    function Jo(e, a) {
      if (ta(e, a)) return true;
      if (typeof e != "object" || e === null || typeof a != "object" || a === null) return false;
      var t = Object.keys(e), l = Object.keys(a);
      if (t.length !== l.length) return false;
      for (l = 0; l < t.length; l++) {
        var o = t[l];
        if (!Nu.call(a, o) || !ta(e[o], a[o])) return false;
      }
      return true;
    }
    function Hd(e) {
      for (; e && e.firstChild; ) e = e.firstChild;
      return e;
    }
    function Ud(e, a) {
      var t = Hd(e);
      e = 0;
      for (var l; t; ) {
        if (t.nodeType === 3) {
          if (l = e + t.textContent.length, e <= a && l >= a) return { node: t, offset: a - e };
          e = l;
        }
        e: {
          for (; t; ) {
            if (t.nextSibling) {
              t = t.nextSibling;
              break e;
            }
            t = t.parentNode;
          }
          t = void 0;
        }
        t = Hd(t);
      }
    }
    function yp(e, a) {
      return e && a ? e === a ? true : e && e.nodeType === 3 ? false : a && a.nodeType === 3 ? yp(e, a.parentNode) : "contains" in e ? e.contains(a) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(a) & 16) : false : false;
    }
    function Lp(e) {
      e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
      for (var a = Ci(e.document); a instanceof e.HTMLIFrameElement; ) {
        try {
          var t = typeof a.contentWindow.location.href == "string";
        } catch {
          t = false;
        }
        if (t) e = a.contentWindow;
        else break;
        a = Ci(e.document);
      }
      return a;
    }
    function Nf(e) {
      var a = e && e.nodeName && e.nodeName.toLowerCase();
      return a && (a === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || a === "textarea" || e.contentEditable === "true");
    }
    var Z_ = Ka && "documentMode" in document && 11 >= document.documentMode, kl = null, ju = null, Ho = null, Yu = false;
    function Ed(e, a, t) {
      var l = t.window === t ? t.document : t.nodeType === 9 ? t : t.ownerDocument;
      Yu || kl == null || kl !== Ci(l) || (l = kl, "selectionStart" in l && Nf(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = { anchorNode: l.anchorNode, anchorOffset: l.anchorOffset, focusNode: l.focusNode, focusOffset: l.focusOffset }), Ho && Jo(Ho, l) || (Ho = l, l = Fi(ju, "onSelect"), 0 < l.length && (a = new Ji("onSelect", "select", null, a, t), e.push({ event: a, listeners: l }), a.target = kl)));
    }
    function Et(e, a) {
      var t = {};
      return t[e.toLowerCase()] = a.toLowerCase(), t["Webkit" + e] = "webkit" + a, t["Moz" + e] = "moz" + a, t;
    }
    var Il = { animationend: Et("Animation", "AnimationEnd"), animationiteration: Et("Animation", "AnimationIteration"), animationstart: Et("Animation", "AnimationStart"), transitionrun: Et("Transition", "TransitionRun"), transitionstart: Et("Transition", "TransitionStart"), transitioncancel: Et("Transition", "TransitionCancel"), transitionend: Et("Transition", "TransitionEnd") }, ru = {}, vp = {};
    Ka && (vp = document.createElement("div").style, "AnimationEvent" in window || (delete Il.animationend.animation, delete Il.animationiteration.animation, delete Il.animationstart.animation), "TransitionEvent" in window || delete Il.transitionend.transition);
    function tl(e) {
      if (ru[e]) return ru[e];
      if (!Il[e]) return e;
      var a = Il[e], t;
      for (t in a) if (a.hasOwnProperty(t) && t in vp) return ru[e] = a[t];
      return e;
    }
    var wp = tl("animationend"), Sp = tl("animationiteration"), Cp = tl("animationstart"), J_ = tl("transitionrun"), W_ = tl("transitionstart"), $_ = tl("transitioncancel"), kp = tl("transitionend"), Ip = /* @__PURE__ */ new Map(), Qu = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    Qu.push("scrollEnd");
    function La(e, a) {
      Ip.set(e, a), el(a, [e]);
    }
    var ki = typeof reportError == "function" ? reportError : function(e) {
      if (typeof window == "object" && typeof window.ErrorEvent == "function") {
        var a = new window.ErrorEvent("error", { bubbles: true, cancelable: true, message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e), error: e });
        if (!window.dispatchEvent(a)) return;
      } else if (typeof process == "object" && typeof process.emit == "function") {
        process.emit("uncaughtException", e);
        return;
      }
      console.error(e);
    }, ia = [], Tl = 0, Gf = 0;
    function en() {
      for (var e = Tl, a = Gf = Tl = 0; a < e; ) {
        var t = ia[a];
        ia[a++] = null;
        var l = ia[a];
        ia[a++] = null;
        var o = ia[a];
        ia[a++] = null;
        var s = ia[a];
        if (ia[a++] = null, l !== null && o !== null) {
          var i = l.pending;
          i === null ? o.next = o : (o.next = i.next, i.next = o), l.pending = o;
        }
        s !== 0 && Tp(t, o, s);
      }
    }
    function an(e, a, t, l) {
      ia[Tl++] = e, ia[Tl++] = a, ia[Tl++] = t, ia[Tl++] = l, Gf |= l, e.lanes |= l, e = e.alternate, e !== null && (e.lanes |= l);
    }
    function Pf(e, a, t, l) {
      return an(e, a, t, l), Ii(e);
    }
    function ll(e, a) {
      return an(e, null, null, a), Ii(e);
    }
    function Tp(e, a, t) {
      e.lanes |= t;
      var l = e.alternate;
      l !== null && (l.lanes |= t);
      for (var o = false, s = e.return; s !== null; ) s.childLanes |= t, l = s.alternate, l !== null && (l.childLanes |= t), s.tag === 22 && (e = s.stateNode, e === null || e._visibility & 1 || (o = true)), e = s, s = s.return;
      return e.tag === 3 ? (s = e.stateNode, o && a !== null && (o = 31 - ea(t), e = s.hiddenUpdates, l = e[o], l === null ? e[o] = [a] : l.push(a), a.lane = t | 536870912), s) : null;
    }
    function Ii(e) {
      if (50 < Ko) throw Ko = 0, _f = null, Error(v(185));
      for (var a = e.return; a !== null; ) e = a, a = e.return;
      return e.tag === 3 ? e.stateNode : null;
    }
    var Ml = {};
    function eb(e, a, t, l) {
      this.tag = e, this.key = t, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = a, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
    }
    function Ze(e, a, t, l) {
      return new eb(e, a, t, l);
    }
    function Ff(e) {
      return e = e.prototype, !(!e || !e.isReactComponent);
    }
    function Fa(e, a) {
      var t = e.alternate;
      return t === null ? (t = Ze(e.tag, a, e.key, e.mode), t.elementType = e.elementType, t.type = e.type, t.stateNode = e.stateNode, t.alternate = e, e.alternate = t) : (t.pendingProps = a, t.type = e.type, t.flags = 0, t.subtreeFlags = 0, t.deletions = null), t.flags = e.flags & 65011712, t.childLanes = e.childLanes, t.lanes = e.lanes, t.child = e.child, t.memoizedProps = e.memoizedProps, t.memoizedState = e.memoizedState, t.updateQueue = e.updateQueue, a = e.dependencies, t.dependencies = a === null ? null : { lanes: a.lanes, firstContext: a.firstContext }, t.sibling = e.sibling, t.index = e.index, t.ref = e.ref, t.refCleanup = e.refCleanup, t;
    }
    function Mp(e, a) {
      e.flags &= 65011714;
      var t = e.alternate;
      return t === null ? (e.childLanes = 0, e.lanes = a, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = t.childLanes, e.lanes = t.lanes, e.child = t.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = t.memoizedProps, e.memoizedState = t.memoizedState, e.updateQueue = t.updateQueue, e.type = t.type, a = t.dependencies, e.dependencies = a === null ? null : { lanes: a.lanes, firstContext: a.firstContext }), e;
    }
    function ri(e, a, t, l, o, s) {
      var i = 0;
      if (l = e, typeof e == "function") Ff(e) && (i = 1);
      else if (typeof e == "string") i = lx(e, t, Ma.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
      else e: switch (e) {
        case qu:
          return e = Ze(31, t, a, o), e.elementType = qu, e.lanes = s, e;
        case Ll:
          return Vt(t.children, o, s, a);
        case Yc:
          i = 8, o |= 24;
          break;
        case Ru:
          return e = Ze(12, t, a, o | 2), e.elementType = Ru, e.lanes = s, e;
        case zu:
          return e = Ze(13, t, a, o), e.elementType = zu, e.lanes = s, e;
        case Ou:
          return e = Ze(19, t, a, o), e.elementType = Ou, e.lanes = s, e;
        default:
          if (typeof e == "object" && e !== null) switch (e.$typeof) {
            case Na:
              i = 10;
              break e;
            case Qc:
              i = 9;
              break e;
            case Mf:
              i = 11;
              break e;
            case Af:
              i = 14;
              break e;
            case ot:
              i = 16, l = null;
              break e;
          }
          i = 29, t = Error(v(130, e === null ? "null" : typeof e, "")), l = null;
      }
      return a = Ze(i, t, a, o), a.elementType = e, a.type = l, a.lanes = s, a;
    }
    function Vt(e, a, t, l) {
      return e = Ze(7, e, l, a), e.lanes = t, e;
    }
    function du(e, a, t) {
      return e = Ze(6, e, null, a), e.lanes = t, e;
    }
    function Ap(e) {
      var a = Ze(18, null, null, 0);
      return a.stateNode = e, a;
    }
    function cu(e, a, t) {
      return a = Ze(4, e.children !== null ? e.children : [], e.key, a), a.lanes = t, a.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, a;
    }
    var Nd = /* @__PURE__ */ new WeakMap();
    function da(e, a) {
      if (typeof e == "object" && e !== null) {
        var t = Nd.get(e);
        return t !== void 0 ? t : (a = { value: e, source: a, stack: Ld(a) }, Nd.set(e, a), a);
      }
      return { value: e, source: a, stack: Ld(a) };
    }
    var Al = [], Bl = 0, Ti = null, Wo = 0, ua = [], fa = 0, St = null, ka = 1, Ia = "";
    function Ua(e, a) {
      Al[Bl++] = Wo, Al[Bl++] = Ti, Ti = e, Wo = a;
    }
    function Bp(e, a, t) {
      ua[fa++] = ka, ua[fa++] = Ia, ua[fa++] = St, St = e;
      var l = ka;
      e = Ia;
      var o = 32 - ea(l) - 1;
      l &= ~(1 << o), t += 1;
      var s = 32 - ea(a) + o;
      if (30 < s) {
        var i = o - o % 5;
        s = (l & (1 << i) - 1).toString(32), l >>= i, o -= i, ka = 1 << 32 - ea(a) + o | t << o | l, Ia = s + e;
      } else ka = 1 << s | t << o | l, Ia = e;
    }
    function Xf(e) {
      e.return !== null && (Ua(e, 1), Bp(e, 1, 0));
    }
    function Vf(e) {
      for (; e === Ti; ) Ti = Al[--Bl], Al[Bl] = null, Wo = Al[--Bl], Al[Bl] = null;
      for (; e === St; ) St = ua[--fa], ua[fa] = null, Ia = ua[--fa], ua[fa] = null, ka = ua[--fa], ua[fa] = null;
    }
    function Dp(e, a) {
      ua[fa++] = ka, ua[fa++] = Ia, ua[fa++] = St, ka = a.id, Ia = a.overflow, St = e;
    }
    var Te = null, te = null, N = false, gt = null, ca = false, Zu = Error(v(519));
    function Ct(e) {
      var a = Error(v(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", ""));
      throw $o(da(a, e)), Zu;
    }
    function Gd(e) {
      var a = e.stateNode, t = e.type, l = e.memoizedProps;
      switch (a[Ie] = e, a[Fe] = l, t) {
        case "dialog":
          H("cancel", a), H("close", a);
          break;
        case "iframe":
        case "object":
        case "embed":
          H("load", a);
          break;
        case "video":
        case "audio":
          for (t = 0; t < ls.length; t++) H(ls[t], a);
          break;
        case "source":
          H("error", a);
          break;
        case "img":
        case "image":
        case "link":
          H("error", a), H("load", a);
          break;
        case "details":
          H("toggle", a);
          break;
        case "input":
          H("invalid", a), up(a, l.value, l.defaultValue, l.checked, l.defaultChecked, l.type, l.name, true);
          break;
        case "select":
          H("invalid", a);
          break;
        case "textarea":
          H("invalid", a), rp(a, l.value, l.defaultValue, l.children);
      }
      t = l.children, typeof t != "string" && typeof t != "number" && typeof t != "bigint" || a.textContent === "" + t || l.suppressHydrationWarning === true || mh(a.textContent, t) ? (l.popover != null && (H("beforetoggle", a), H("toggle", a)), l.onScroll != null && H("scroll", a), l.onScrollEnd != null && H("scrollend", a), l.onClick != null && (a.onclick = Ga), a = true) : a = false, a || Ct(e, true);
    }
    function Pd(e) {
      for (Te = e.return; Te; ) switch (Te.tag) {
        case 5:
        case 31:
        case 13:
          ca = false;
          return;
        case 27:
        case 3:
          ca = true;
          return;
        default:
          Te = Te.return;
      }
    }
    function _l(e) {
      if (e !== Te) return false;
      if (!N) return Pd(e), N = true, false;
      var a = e.tag, t;
      if ((t = a !== 3 && a !== 27) && ((t = a === 5) && (t = e.type, t = !(t !== "form" && t !== "button") || vf(e.type, e.memoizedProps)), t = !t), t && te && Ct(e), Pd(e), a === 13) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(v(317));
        te = Ac(e);
      } else if (a === 31) {
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(v(317));
        te = Ac(e);
      } else a === 27 ? (a = te, Mt(e.type) ? (e = kf, kf = null, te = e) : te = a) : te = Te ? ma(e.stateNode.nextSibling) : null;
      return true;
    }
    function Qt() {
      te = Te = null, N = false;
    }
    function pu() {
      var e = gt;
      return e !== null && (Ge === null ? Ge = e : Ge.push.apply(Ge, e), gt = null), e;
    }
    function $o(e) {
      gt === null ? gt = [e] : gt.push(e);
    }
    var Ju = Aa(null), ol = null, Pa = null;
    function it(e, a, t) {
      W(Ju, a._currentValue), a._currentValue = t;
    }
    function Xa(e) {
      e._currentValue = Ju.current, Ce(Ju);
    }
    function Wu(e, a, t) {
      for (; e !== null; ) {
        var l = e.alternate;
        if ((e.childLanes & a) !== a ? (e.childLanes |= a, l !== null && (l.childLanes |= a)) : l !== null && (l.childLanes & a) !== a && (l.childLanes |= a), e === t) break;
        e = e.return;
      }
    }
    function $u(e, a, t, l) {
      var o = e.child;
      for (o !== null && (o.return = e); o !== null; ) {
        var s = o.dependencies;
        if (s !== null) {
          var i = o.child;
          s = s.firstContext;
          e: for (; s !== null; ) {
            var n = s;
            s = o;
            for (var u = 0; u < a.length; u++) if (n.context === a[u]) {
              s.lanes |= t, n = s.alternate, n !== null && (n.lanes |= t), Wu(s.return, t, e), l || (i = null);
              break e;
            }
            s = n.next;
          }
        } else if (o.tag === 18) {
          if (i = o.return, i === null) throw Error(v(341));
          i.lanes |= t, s = i.alternate, s !== null && (s.lanes |= t), Wu(i, t, e), i = null;
        } else i = o.child;
        if (i !== null) i.return = o;
        else for (i = o; i !== null; ) {
          if (i === e) {
            i = null;
            break;
          }
          if (o = i.sibling, o !== null) {
            o.return = i.return, i = o;
            break;
          }
          i = i.return;
        }
        o = i;
      }
    }
    function $l(e, a, t, l) {
      e = null;
      for (var o = a, s = false; o !== null; ) {
        if (!s) {
          if ((o.flags & 524288) !== 0) s = true;
          else if ((o.flags & 262144) !== 0) break;
        }
        if (o.tag === 10) {
          var i = o.alternate;
          if (i === null) throw Error(v(387));
          if (i = i.memoizedProps, i !== null) {
            var n = o.type;
            ta(o.pendingProps.value, i.value) || (e !== null ? e.push(n) : e = [n]);
          }
        } else if (o === Li.current) {
          if (i = o.alternate, i === null) throw Error(v(387));
          i.memoizedState.memoizedState !== o.memoizedState.memoizedState && (e !== null ? e.push(ss) : e = [ss]);
        }
        o = o.return;
      }
      e !== null && $u(a, e, t, l), a.flags |= 262144;
    }
    function Mi(e) {
      for (e = e.firstContext; e !== null; ) {
        if (!ta(e.context._currentValue, e.memoizedValue)) return true;
        e = e.next;
      }
      return false;
    }
    function Zt(e) {
      ol = e, Pa = null, e = e.dependencies, e !== null && (e.firstContext = null);
    }
    function Me(e) {
      return Rp(ol, e);
    }
    function Zs(e, a) {
      return ol === null && Zt(e), Rp(e, a);
    }
    function Rp(e, a) {
      var t = a._currentValue;
      if (a = { context: a, memoizedValue: t, next: null }, Pa === null) {
        if (e === null) throw Error(v(308));
        Pa = a, e.dependencies = { lanes: 0, firstContext: a }, e.flags |= 524288;
      } else Pa = Pa.next = a;
      return t;
    }
    var ab = typeof AbortController < "u" ? AbortController : function() {
      var e = [], a = this.signal = { aborted: false, addEventListener: function(t, l) {
        e.push(l);
      } };
      this.abort = function() {
        a.aborted = true, e.forEach(function(t) {
          return t();
        });
      };
    }, tb = ye.unstable_scheduleCallback, lb = ye.unstable_NormalPriority, _e = { $typeof: Na, Consumer: null, Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0 };
    function Kf() {
      return { controller: new ab(), data: /* @__PURE__ */ new Map(), refCount: 0 };
    }
    function ms(e) {
      e.refCount--, e.refCount === 0 && tb(lb, function() {
        e.controller.abort();
      });
    }
    var Uo = null, ef = 0, Fl = 0, ql = null;
    function ob(e, a) {
      if (Uo === null) {
        var t = Uo = [];
        ef = 0, Fl = _r(), ql = { status: "pending", value: void 0, then: function(l) {
          t.push(l);
        } };
      }
      return ef++, a.then(Fd, Fd), a;
    }
    function Fd() {
      if (--ef === 0 && Uo !== null) {
        ql !== null && (ql.status = "fulfilled");
        var e = Uo;
        Uo = null, Fl = 0, ql = null;
        for (var a = 0; a < e.length; a++) (0, e[a])();
      }
    }
    function sb(e, a) {
      var t = [], l = { status: "pending", value: null, reason: null, then: function(o) {
        t.push(o);
      } };
      return e.then(function() {
        l.status = "fulfilled", l.value = a;
        for (var o = 0; o < t.length; o++) (0, t[o])(a);
      }, function(o) {
        for (l.status = "rejected", l.reason = o, o = 0; o < t.length; o++) (0, t[o])(void 0);
      }), l;
    }
    var Xd = A.S;
    A.S = function(e, a) {
      jm = We(), typeof a == "object" && a !== null && typeof a.then == "function" && ob(e, a), Xd !== null && Xd(e, a);
    };
    var Kt = Aa(null);
    function jf() {
      var e = Kt.current;
      return e !== null ? e : J.pooledCache;
    }
    function di(e, a) {
      a === null ? W(Kt, Kt.current) : W(Kt, a.pool);
    }
    function zp() {
      var e = jf();
      return e === null ? null : { parent: _e._currentValue, pool: e };
    }
    var eo = Error(v(460)), Yf = Error(v(474)), tn = Error(v(542)), Ai = { then: function() {
    } };
    function Vd(e) {
      return e = e.status, e === "fulfilled" || e === "rejected";
    }
    function Op(e, a, t) {
      switch (t = e[t], t === void 0 ? e.push(a) : t !== a && (a.then(Ga, Ga), a = t), a.status) {
        case "fulfilled":
          return a.value;
        case "rejected":
          throw e = a.reason, jd(e), e;
        default:
          if (typeof a.status == "string") a.then(Ga, Ga);
          else {
            if (e = J, e !== null && 100 < e.shellSuspendCounter) throw Error(v(482));
            e = a, e.status = "pending", e.then(function(l) {
              if (a.status === "pending") {
                var o = a;
                o.status = "fulfilled", o.value = l;
              }
            }, function(l) {
              if (a.status === "pending") {
                var o = a;
                o.status = "rejected", o.reason = l;
              }
            });
          }
          switch (a.status) {
            case "fulfilled":
              return a.value;
            case "rejected":
              throw e = a.reason, jd(e), e;
          }
          throw jt = a, eo;
      }
    }
    function Pt(e) {
      try {
        var a = e._init;
        return a(e._payload);
      } catch (t) {
        throw t !== null && typeof t == "object" && typeof t.then == "function" ? (jt = t, eo) : t;
      }
    }
    var jt = null;
    function Kd() {
      if (jt === null) throw Error(v(459));
      var e = jt;
      return jt = null, e;
    }
    function jd(e) {
      if (e === eo || e === tn) throw Error(v(483));
    }
    var Hl = null, es = 0;
    function Js(e) {
      var a = es;
      return es += 1, Hl === null && (Hl = []), Op(Hl, e, a);
    }
    function Co(e, a) {
      a = a.props.ref, e.ref = a !== void 0 ? a : null;
    }
    function Ws(e, a) {
      throw a.$typeof === Vg ? Error(v(525)) : (e = Object.prototype.toString.call(a), Error(v(31, e === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : e)));
    }
    function qp(e) {
      function a(g, c) {
        if (e) {
          var h = g.deletions;
          h === null ? (g.deletions = [c], g.flags |= 16) : h.push(c);
        }
      }
      function t(g, c) {
        if (!e) return null;
        for (; c !== null; ) a(g, c), c = c.sibling;
        return null;
      }
      function l(g) {
        for (var c = /* @__PURE__ */ new Map(); g !== null; ) g.key !== null ? c.set(g.key, g) : c.set(g.index, g), g = g.sibling;
        return c;
      }
      function o(g, c) {
        return g = Fa(g, c), g.index = 0, g.sibling = null, g;
      }
      function s(g, c, h) {
        return g.index = h, e ? (h = g.alternate, h !== null ? (h = h.index, h < c ? (g.flags |= 67108866, c) : h) : (g.flags |= 67108866, c)) : (g.flags |= 1048576, c);
      }
      function i(g) {
        return e && g.alternate === null && (g.flags |= 67108866), g;
      }
      function n(g, c, h, b) {
        return c === null || c.tag !== 6 ? (c = du(h, g.mode, b), c.return = g, c) : (c = o(c, h), c.return = g, c);
      }
      function u(g, c, h, b) {
        var C = h.type;
        return C === Ll ? _(g, c, h.props.children, b, h.key) : c !== null && (c.elementType === C || typeof C == "object" && C !== null && C.$typeof === ot && Pt(C) === c.type) ? (c = o(c, h.props), Co(c, h), c.return = g, c) : (c = ri(h.type, h.key, h.props, null, g.mode, b), Co(c, h), c.return = g, c);
      }
      function r(g, c, h, b) {
        return c === null || c.tag !== 4 || c.stateNode.containerInfo !== h.containerInfo || c.stateNode.implementation !== h.implementation ? (c = cu(h, g.mode, b), c.return = g, c) : (c = o(c, h.children || []), c.return = g, c);
      }
      function _(g, c, h, b, C) {
        return c === null || c.tag !== 7 ? (c = Vt(h, g.mode, b, C), c.return = g, c) : (c = o(c, h), c.return = g, c);
      }
      function x(g, c, h) {
        if (typeof c == "string" && c !== "" || typeof c == "number" || typeof c == "bigint") return c = du("" + c, g.mode, h), c.return = g, c;
        if (typeof c == "object" && c !== null) {
          switch (c.$typeof) {
            case Ps:
              return h = ri(c.type, c.key, c.props, null, g.mode, h), Co(h, c), h.return = g, h;
            case Ao:
              return c = cu(c, g.mode, h), c.return = g, c;
            case ot:
              return c = Pt(c), x(g, c, h);
          }
          if (Bo(c) || wo(c)) return c = Vt(c, g.mode, h, null), c.return = g, c;
          if (typeof c.then == "function") return x(g, Js(c), h);
          if (c.$typeof === Na) return x(g, Zs(g, c), h);
          Ws(g, c);
        }
        return null;
      }
      function m(g, c, h, b) {
        var C = c !== null ? c.key : null;
        if (typeof h == "string" && h !== "" || typeof h == "number" || typeof h == "bigint") return C !== null ? null : n(g, c, "" + h, b);
        if (typeof h == "object" && h !== null) {
          switch (h.$typeof) {
            case Ps:
              return h.key === C ? u(g, c, h, b) : null;
            case Ao:
              return h.key === C ? r(g, c, h, b) : null;
            case ot:
              return h = Pt(h), m(g, c, h, b);
          }
          if (Bo(h) || wo(h)) return C !== null ? null : _(g, c, h, b, null);
          if (typeof h.then == "function") return m(g, c, Js(h), b);
          if (h.$typeof === Na) return m(g, c, Zs(g, h), b);
          Ws(g, h);
        }
        return null;
      }
      function d(g, c, h, b, C) {
        if (typeof b == "string" && b !== "" || typeof b == "number" || typeof b == "bigint") return g = g.get(h) || null, n(c, g, "" + b, C);
        if (typeof b == "object" && b !== null) {
          switch (b.$typeof) {
            case Ps:
              return g = g.get(b.key === null ? h : b.key) || null, u(c, g, b, C);
            case Ao:
              return g = g.get(b.key === null ? h : b.key) || null, r(c, g, b, C);
            case ot:
              return b = Pt(b), d(g, c, h, b, C);
          }
          if (Bo(b) || wo(b)) return g = g.get(h) || null, _(c, g, b, C, null);
          if (typeof b.then == "function") return d(g, c, h, Js(b), C);
          if (b.$typeof === Na) return d(g, c, h, Zs(c, b), C);
          Ws(c, b);
        }
        return null;
      }
      function y(g, c, h, b) {
        for (var C = null, O = null, k = c, B = c = 0, T = null; k !== null && B < h.length; B++) {
          k.index > B ? (T = k, k = null) : T = k.sibling;
          var q = m(g, k, h[B], b);
          if (q === null) {
            k === null && (k = T);
            break;
          }
          e && k && q.alternate === null && a(g, k), c = s(q, c, B), O === null ? C = q : O.sibling = q, O = q, k = T;
        }
        if (B === h.length) return t(g, k), N && Ua(g, B), C;
        if (k === null) {
          for (; B < h.length; B++) k = x(g, h[B], b), k !== null && (c = s(k, c, B), O === null ? C = k : O.sibling = k, O = k);
          return N && Ua(g, B), C;
        }
        for (k = l(k); B < h.length; B++) T = d(k, g, B, h[B], b), T !== null && (e && T.alternate !== null && k.delete(T.key === null ? B : T.key), c = s(T, c, B), O === null ? C = T : O.sibling = T, O = T);
        return e && k.forEach(function(ba) {
          return a(g, ba);
        }), N && Ua(g, B), C;
      }
      function S(g, c, h, b) {
        if (h == null) throw Error(v(151));
        for (var C = null, O = null, k = c, B = c = 0, T = null, q = h.next(); k !== null && !q.done; B++, q = h.next()) {
          k.index > B ? (T = k, k = null) : T = k.sibling;
          var ba = m(g, k, q.value, b);
          if (ba === null) {
            k === null && (k = T);
            break;
          }
          e && k && ba.alternate === null && a(g, k), c = s(ba, c, B), O === null ? C = ba : O.sibling = ba, O = ba, k = T;
        }
        if (q.done) return t(g, k), N && Ua(g, B), C;
        if (k === null) {
          for (; !q.done; B++, q = h.next()) q = x(g, q.value, b), q !== null && (c = s(q, c, B), O === null ? C = q : O.sibling = q, O = q);
          return N && Ua(g, B), C;
        }
        for (k = l(k); !q.done; B++, q = h.next()) q = d(k, g, B, q.value, b), q !== null && (e && q.alternate !== null && k.delete(q.key === null ? B : q.key), c = s(q, c, B), O === null ? C = q : O.sibling = q, O = q);
        return e && k.forEach(function(Ds) {
          return a(g, Ds);
        }), N && Ua(g, B), C;
      }
      function M(g, c, h, b) {
        if (typeof h == "object" && h !== null && h.type === Ll && h.key === null && (h = h.props.children), typeof h == "object" && h !== null) {
          switch (h.$typeof) {
            case Ps:
              e: {
                for (var C = h.key; c !== null; ) {
                  if (c.key === C) {
                    if (C = h.type, C === Ll) {
                      if (c.tag === 7) {
                        t(g, c.sibling), b = o(c, h.props.children), b.return = g, g = b;
                        break e;
                      }
                    } else if (c.elementType === C || typeof C == "object" && C !== null && C.$typeof === ot && Pt(C) === c.type) {
                      t(g, c.sibling), b = o(c, h.props), Co(b, h), b.return = g, g = b;
                      break e;
                    }
                    t(g, c);
                    break;
                  } else a(g, c);
                  c = c.sibling;
                }
                h.type === Ll ? (b = Vt(h.props.children, g.mode, b, h.key), b.return = g, g = b) : (b = ri(h.type, h.key, h.props, null, g.mode, b), Co(b, h), b.return = g, g = b);
              }
              return i(g);
            case Ao:
              e: {
                for (C = h.key; c !== null; ) {
                  if (c.key === C) if (c.tag === 4 && c.stateNode.containerInfo === h.containerInfo && c.stateNode.implementation === h.implementation) {
                    t(g, c.sibling), b = o(c, h.children || []), b.return = g, g = b;
                    break e;
                  } else {
                    t(g, c);
                    break;
                  }
                  else a(g, c);
                  c = c.sibling;
                }
                b = cu(h, g.mode, b), b.return = g, g = b;
              }
              return i(g);
            case ot:
              return h = Pt(h), M(g, c, h, b);
          }
          if (Bo(h)) return y(g, c, h, b);
          if (wo(h)) {
            if (C = wo(h), typeof C != "function") throw Error(v(150));
            return h = C.call(h), S(g, c, h, b);
          }
          if (typeof h.then == "function") return M(g, c, Js(h), b);
          if (h.$typeof === Na) return M(g, c, Zs(g, h), b);
          Ws(g, h);
        }
        return typeof h == "string" && h !== "" || typeof h == "number" || typeof h == "bigint" ? (h = "" + h, c !== null && c.tag === 6 ? (t(g, c.sibling), b = o(c, h), b.return = g, g = b) : (t(g, c), b = du(h, g.mode, b), b.return = g, g = b), i(g)) : t(g, c);
      }
      return function(g, c, h, b) {
        try {
          es = 0;
          var C = M(g, c, h, b);
          return Hl = null, C;
        } catch (k) {
          if (k === eo || k === tn) throw k;
          var O = Ze(29, k, null, g.mode);
          return O.lanes = b, O.return = g, O;
        } finally {
        }
      };
    }
    var Jt = qp(true), Hp = qp(false), st = false;
    function Qf(e) {
      e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, lanes: 0, hiddenCallbacks: null }, callbacks: null };
    }
    function af(e, a) {
      e = e.updateQueue, a.updateQueue === e && (a.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, callbacks: null });
    }
    function _t(e) {
      return { lane: e, tag: 0, payload: null, callback: null, next: null };
    }
    function bt(e, a, t) {
      var l = e.updateQueue;
      if (l === null) return null;
      if (l = l.shared, (F & 2) !== 0) {
        var o = l.pending;
        return o === null ? a.next = a : (a.next = o.next, o.next = a), l.pending = a, a = Ii(e), Tp(e, null, t), a;
      }
      return an(e, l, a, t), Ii(e);
    }
    function Eo(e, a, t) {
      if (a = a.updateQueue, a !== null && (a = a.shared, (t & 4194048) !== 0)) {
        var l = a.lanes;
        l &= e.pendingLanes, t |= l, a.lanes = t, ap(e, t);
      }
    }
    function mu(e, a) {
      var t = e.updateQueue, l = e.alternate;
      if (l !== null && (l = l.updateQueue, t === l)) {
        var o = null, s = null;
        if (t = t.firstBaseUpdate, t !== null) {
          do {
            var i = { lane: t.lane, tag: t.tag, payload: t.payload, callback: null, next: null };
            s === null ? o = s = i : s = s.next = i, t = t.next;
          } while (t !== null);
          s === null ? o = s = a : s = s.next = a;
        } else o = s = a;
        t = { baseState: l.baseState, firstBaseUpdate: o, lastBaseUpdate: s, shared: l.shared, callbacks: l.callbacks }, e.updateQueue = t;
        return;
      }
      e = t.lastBaseUpdate, e === null ? t.firstBaseUpdate = a : e.next = a, t.lastBaseUpdate = a;
    }
    var tf = false;
    function No() {
      if (tf) {
        var e = ql;
        if (e !== null) throw e;
      }
    }
    function Go(e, a, t, l) {
      tf = false;
      var o = e.updateQueue;
      st = false;
      var s = o.firstBaseUpdate, i = o.lastBaseUpdate, n = o.shared.pending;
      if (n !== null) {
        o.shared.pending = null;
        var u = n, r = u.next;
        u.next = null, i === null ? s = r : i.next = r, i = u;
        var _ = e.alternate;
        _ !== null && (_ = _.updateQueue, n = _.lastBaseUpdate, n !== i && (n === null ? _.firstBaseUpdate = r : n.next = r, _.lastBaseUpdate = u));
      }
      if (s !== null) {
        var x = o.baseState;
        i = 0, _ = r = u = null, n = s;
        do {
          var m = n.lane & -536870913, d = m !== n.lane;
          if (d ? (E & m) === m : (l & m) === m) {
            m !== 0 && m === Fl && (tf = true), _ !== null && (_ = _.next = { lane: 0, tag: n.tag, payload: n.payload, callback: null, next: null });
            e: {
              var y = e, S = n;
              m = a;
              var M = t;
              switch (S.tag) {
                case 1:
                  if (y = S.payload, typeof y == "function") {
                    x = y.call(M, x, m);
                    break e;
                  }
                  x = y;
                  break e;
                case 3:
                  y.flags = y.flags & -65537 | 128;
                case 0:
                  if (y = S.payload, m = typeof y == "function" ? y.call(M, x, m) : y, m == null) break e;
                  x = le({}, x, m);
                  break e;
                case 2:
                  st = true;
              }
            }
            m = n.callback, m !== null && (e.flags |= 64, d && (e.flags |= 8192), d = o.callbacks, d === null ? o.callbacks = [m] : d.push(m));
          } else d = { lane: m, tag: n.tag, payload: n.payload, callback: n.callback, next: null }, _ === null ? (r = _ = d, u = x) : _ = _.next = d, i |= m;
          if (n = n.next, n === null) {
            if (n = o.shared.pending, n === null) break;
            d = n, n = d.next, d.next = null, o.lastBaseUpdate = d, o.shared.pending = null;
          }
        } while (true);
        _ === null && (u = x), o.baseState = u, o.firstBaseUpdate = r, o.lastBaseUpdate = _, s === null && (o.shared.lanes = 0), It |= i, e.lanes = i, e.memoizedState = x;
      }
    }
    function Up(e, a) {
      if (typeof e != "function") throw Error(v(191, e));
      e.call(a);
    }
    function Ep(e, a) {
      var t = e.callbacks;
      if (t !== null) for (e.callbacks = null, e = 0; e < t.length; e++) Up(t[e], a);
    }
    var Xl = Aa(null), Bi = Aa(0);
    function Yd(e, a) {
      e = Za, W(Bi, e), W(Xl, a), Za = e | a.baseLanes;
    }
    function lf() {
      W(Bi, Za), W(Xl, Xl.current);
    }
    function Zf() {
      Za = Bi.current, Ce(Xl), Ce(Bi);
    }
    var la = Aa(null), pa = null;
    function nt(e) {
      var a = e.alternate;
      W(ce, ce.current & 1), W(la, e), pa === null && (a === null || Xl.current !== null || a.memoizedState !== null) && (pa = e);
    }
    function of(e) {
      W(ce, ce.current), W(la, e), pa === null && (pa = e);
    }
    function Np(e) {
      e.tag === 22 ? (W(ce, ce.current), W(la, e), pa === null && (pa = e)) : ut(e);
    }
    function ut() {
      W(ce, ce.current), W(la, la.current);
    }
    function Qe(e) {
      Ce(la), pa === e && (pa = null), Ce(ce);
    }
    var ce = Aa(0);
    function Di(e) {
      for (var a = e; a !== null; ) {
        if (a.tag === 13) {
          var t = a.memoizedState;
          if (t !== null && (t = t.dehydrated, t === null || Sf(t) || Cf(t))) return a;
        } else if (a.tag === 19 && (a.memoizedProps.revealOrder === "forwards" || a.memoizedProps.revealOrder === "backwards" || a.memoizedProps.revealOrder === "unstable_legacy-backwards" || a.memoizedProps.revealOrder === "together")) {
          if ((a.flags & 128) !== 0) return a;
        } else if (a.child !== null) {
          a.child.return = a, a = a.child;
          continue;
        }
        if (a === e) break;
        for (; a.sibling === null; ) {
          if (a.return === null || a.return === e) return null;
          a = a.return;
        }
        a.sibling.return = a.return, a = a.sibling;
      }
      return null;
    }
    var ja = 0, R = null, Q = null, he = null, Ri = false, Ul = false, Wt = false, zi = 0, as = 0, El = null, ib = 0;
    function fe() {
      throw Error(v(321));
    }
    function Jf(e, a) {
      if (a === null) return false;
      for (var t = 0; t < a.length && t < e.length; t++) if (!ta(e[t], a[t])) return false;
      return true;
    }
    function Wf(e, a, t, l, o, s) {
      return ja = s, R = a, a.memoizedState = null, a.updateQueue = null, a.lanes = 0, A.H = e === null || e.memoizedState === null ? _m : fr, Wt = false, s = t(l, o), Wt = false, Ul && (s = Pp(a, t, l, o)), Gp(e), s;
    }
    function Gp(e) {
      A.H = ts;
      var a = Q !== null && Q.next !== null;
      if (ja = 0, he = Q = R = null, Ri = false, as = 0, El = null, a) throw Error(v(300));
      e === null || be || (e = e.dependencies, e !== null && Mi(e) && (be = true));
    }
    function Pp(e, a, t, l) {
      R = e;
      var o = 0;
      do {
        if (Ul && (El = null), as = 0, Ul = false, 25 <= o) throw Error(v(301));
        if (o += 1, he = Q = null, e.updateQueue != null) {
          var s = e.updateQueue;
          s.lastEffect = null, s.events = null, s.stores = null, s.memoCache != null && (s.memoCache.index = 0);
        }
        A.H = bm, s = a(t, l);
      } while (Ul);
      return s;
    }
    function nb() {
      var e = A.H, a = e.useState()[0];
      return a = typeof a.then == "function" ? hs(a) : a, e = e.useState()[0], (Q !== null ? Q.memoizedState : null) !== e && (R.flags |= 1024), a;
    }
    function $f() {
      var e = zi !== 0;
      return zi = 0, e;
    }
    function er(e, a, t) {
      a.updateQueue = e.updateQueue, a.flags &= -2053, e.lanes &= ~t;
    }
    function ar(e) {
      if (Ri) {
        for (e = e.memoizedState; e !== null; ) {
          var a = e.queue;
          a !== null && (a.pending = null), e = e.next;
        }
        Ri = false;
      }
      ja = 0, he = Q = R = null, Ul = false, as = zi = 0, El = null;
    }
    function qe() {
      var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
      return he === null ? R.memoizedState = he = e : he = he.next = e, he;
    }
    function pe() {
      if (Q === null) {
        var e = R.alternate;
        e = e !== null ? e.memoizedState : null;
      } else e = Q.next;
      var a = he === null ? R.memoizedState : he.next;
      if (a !== null) he = a, Q = e;
      else {
        if (e === null) throw R.alternate === null ? Error(v(467)) : Error(v(310));
        Q = e, e = { memoizedState: Q.memoizedState, baseState: Q.baseState, baseQueue: Q.baseQueue, queue: Q.queue, next: null }, he === null ? R.memoizedState = he = e : he = he.next = e;
      }
      return he;
    }
    function ln() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function hs(e) {
      var a = as;
      return as += 1, El === null && (El = []), e = Op(El, e, a), a = R, (he === null ? a.memoizedState : he.next) === null && (a = a.alternate, A.H = a === null || a.memoizedState === null ? _m : fr), e;
    }
    function on(e) {
      if (e !== null && typeof e == "object") {
        if (typeof e.then == "function") return hs(e);
        if (e.$typeof === Na) return Me(e);
      }
      throw Error(v(438, String(e)));
    }
    function tr(e) {
      var a = null, t = R.updateQueue;
      if (t !== null && (a = t.memoCache), a == null) {
        var l = R.alternate;
        l !== null && (l = l.updateQueue, l !== null && (l = l.memoCache, l != null && (a = { data: l.data.map(function(o) {
          return o.slice();
        }), index: 0 })));
      }
      if (a == null && (a = { data: [], index: 0 }), t === null && (t = ln(), R.updateQueue = t), t.memoCache = a, t = a.data[a.index], t === void 0) for (t = a.data[a.index] = Array(e), l = 0; l < e; l++) t[l] = Kg;
      return a.index++, t;
    }
    function Ya(e, a) {
      return typeof a == "function" ? a(e) : a;
    }
    function ci(e) {
      var a = pe();
      return lr(a, Q, e);
    }
    function lr(e, a, t) {
      var l = e.queue;
      if (l === null) throw Error(v(311));
      l.lastRenderedReducer = t;
      var o = e.baseQueue, s = l.pending;
      if (s !== null) {
        if (o !== null) {
          var i = o.next;
          o.next = s.next, s.next = i;
        }
        a.baseQueue = o = s, l.pending = null;
      }
      if (s = e.baseState, o === null) e.memoizedState = s;
      else {
        a = o.next;
        var n = i = null, u = null, r = a, _ = false;
        do {
          var x = r.lane & -536870913;
          if (x !== r.lane ? (E & x) === x : (ja & x) === x) {
            var m = r.revertLane;
            if (m === 0) u !== null && (u = u.next = { lane: 0, revertLane: 0, gesture: null, action: r.action, hasEagerState: r.hasEagerState, eagerState: r.eagerState, next: null }), x === Fl && (_ = true);
            else if ((ja & m) === m) {
              r = r.next, m === Fl && (_ = true);
              continue;
            } else x = { lane: 0, revertLane: r.revertLane, gesture: null, action: r.action, hasEagerState: r.hasEagerState, eagerState: r.eagerState, next: null }, u === null ? (n = u = x, i = s) : u = u.next = x, R.lanes |= m, It |= m;
            x = r.action, Wt && t(s, x), s = r.hasEagerState ? r.eagerState : t(s, x);
          } else m = { lane: x, revertLane: r.revertLane, gesture: r.gesture, action: r.action, hasEagerState: r.hasEagerState, eagerState: r.eagerState, next: null }, u === null ? (n = u = m, i = s) : u = u.next = m, R.lanes |= x, It |= x;
          r = r.next;
        } while (r !== null && r !== a);
        if (u === null ? i = s : u.next = n, !ta(s, e.memoizedState) && (be = true, _ && (t = ql, t !== null))) throw t;
        e.memoizedState = s, e.baseState = i, e.baseQueue = u, l.lastRenderedState = s;
      }
      return o === null && (l.lanes = 0), [e.memoizedState, l.dispatch];
    }
    function hu(e) {
      var a = pe(), t = a.queue;
      if (t === null) throw Error(v(311));
      t.lastRenderedReducer = e;
      var l = t.dispatch, o = t.pending, s = a.memoizedState;
      if (o !== null) {
        t.pending = null;
        var i = o = o.next;
        do
          s = e(s, i.action), i = i.next;
        while (i !== o);
        ta(s, a.memoizedState) || (be = true), a.memoizedState = s, a.baseQueue === null && (a.baseState = s), t.lastRenderedState = s;
      }
      return [s, l];
    }
    function Fp(e, a, t) {
      var l = R, o = pe(), s = N;
      if (s) {
        if (t === void 0) throw Error(v(407));
        t = t();
      } else t = a();
      var i = !ta((Q || o).memoizedState, t);
      if (i && (o.memoizedState = t, be = true), o = o.queue, or(Kp.bind(null, l, o, e), [e]), o.getSnapshot !== a || i || he !== null && he.memoizedState.tag & 1) {
        if (l.flags |= 2048, Vl(9, { destroy: void 0 }, Vp.bind(null, l, o, t, a), null), J === null) throw Error(v(349));
        s || (ja & 127) !== 0 || Xp(l, a, t);
      }
      return t;
    }
    function Xp(e, a, t) {
      e.flags |= 16384, e = { getSnapshot: a, value: t }, a = R.updateQueue, a === null ? (a = ln(), R.updateQueue = a, a.stores = [e]) : (t = a.stores, t === null ? a.stores = [e] : t.push(e));
    }
    function Vp(e, a, t, l) {
      a.value = t, a.getSnapshot = l, jp(a) && Yp(e);
    }
    function Kp(e, a, t) {
      return t(function() {
        jp(a) && Yp(e);
      });
    }
    function jp(e) {
      var a = e.getSnapshot;
      e = e.value;
      try {
        var t = a();
        return !ta(e, t);
      } catch {
        return true;
      }
    }
    function Yp(e) {
      var a = ll(e, 2);
      a !== null && Pe(a, e, 2);
    }
    function sf(e) {
      var a = qe();
      if (typeof e == "function") {
        var t = e;
        if (e = t(), Wt) {
          rt(true);
          try {
            t();
          } finally {
            rt(false);
          }
        }
      }
      return a.memoizedState = a.baseState = e, a.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ya, lastRenderedState: e }, a;
    }
    function Qp(e, a, t, l) {
      return e.baseState = t, lr(e, Q, typeof l == "function" ? l : Ya);
    }
    function ub(e, a, t, l, o) {
      if (nn(e)) throw Error(v(485));
      if (e = a.action, e !== null) {
        var s = { payload: o, action: e, next: null, isTransition: true, status: "pending", value: null, reason: null, listeners: [], then: function(i) {
          s.listeners.push(i);
        } };
        A.T !== null ? t(true) : s.isTransition = false, l(s), t = a.pending, t === null ? (s.next = a.pending = s, Zp(a, s)) : (s.next = t.next, a.pending = t.next = s);
      }
    }
    function Zp(e, a) {
      var t = a.action, l = a.payload, o = e.state;
      if (a.isTransition) {
        var s = A.T, i = {};
        A.T = i;
        try {
          var n = t(o, l), u = A.S;
          u !== null && u(i, n), Qd(e, a, n);
        } catch (r) {
          nf(e, a, r);
        } finally {
          s !== null && i.types !== null && (s.types = i.types), A.T = s;
        }
      } else try {
        s = t(o, l), Qd(e, a, s);
      } catch (r) {
        nf(e, a, r);
      }
    }
    function Qd(e, a, t) {
      t !== null && typeof t == "object" && typeof t.then == "function" ? t.then(function(l) {
        Zd(e, a, l);
      }, function(l) {
        return nf(e, a, l);
      }) : Zd(e, a, t);
    }
    function Zd(e, a, t) {
      a.status = "fulfilled", a.value = t, Jp(a), e.state = t, a = e.pending, a !== null && (t = a.next, t === a ? e.pending = null : (t = t.next, a.next = t, Zp(e, t)));
    }
    function nf(e, a, t) {
      var l = e.pending;
      if (e.pending = null, l !== null) {
        l = l.next;
        do
          a.status = "rejected", a.reason = t, Jp(a), a = a.next;
        while (a !== l);
      }
      e.action = null;
    }
    function Jp(e) {
      e = e.listeners;
      for (var a = 0; a < e.length; a++) (0, e[a])();
    }
    function Wp(e, a) {
      return a;
    }
    function Jd(e, a) {
      if (N) {
        var t = J.formState;
        if (t !== null) {
          e: {
            var l = R;
            if (N) {
              if (te) {
                a: {
                  for (var o = te, s = ca; o.nodeType !== 8; ) {
                    if (!s) {
                      o = null;
                      break a;
                    }
                    if (o = ma(o.nextSibling), o === null) {
                      o = null;
                      break a;
                    }
                  }
                  s = o.data, o = s === "F!" || s === "F" ? o : null;
                }
                if (o) {
                  te = ma(o.nextSibling), l = o.data === "F!";
                  break e;
                }
              }
              Ct(l);
            }
            l = false;
          }
          l && (a = t[0]);
        }
      }
      return t = qe(), t.memoizedState = t.baseState = a, l = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Wp, lastRenderedState: a }, t.queue = l, t = mm.bind(null, R, l), l.dispatch = t, l = sf(false), s = ur.bind(null, R, false, l.queue), l = qe(), o = { state: a, dispatch: null, action: e, pending: null }, l.queue = o, t = ub.bind(null, R, o, s, t), o.dispatch = t, l.memoizedState = e, [a, t, false];
    }
    function Wd(e) {
      var a = pe();
      return $p(a, Q, e);
    }
    function $p(e, a, t) {
      if (a = lr(e, a, Wp)[0], e = ci(Ya)[0], typeof a == "object" && a !== null && typeof a.then == "function") try {
        var l = hs(a);
      } catch (i) {
        throw i === eo ? tn : i;
      }
      else l = a;
      a = pe();
      var o = a.queue, s = o.dispatch;
      return t !== a.memoizedState && (R.flags |= 2048, Vl(9, { destroy: void 0 }, fb.bind(null, o, t), null)), [l, s, e];
    }
    function fb(e, a) {
      e.action = a;
    }
    function $d(e) {
      var a = pe(), t = Q;
      if (t !== null) return $p(a, t, e);
      pe(), a = a.memoizedState, t = pe();
      var l = t.queue.dispatch;
      return t.memoizedState = e, [a, l, false];
    }
    function Vl(e, a, t, l) {
      return e = { tag: e, create: t, deps: l, inst: a, next: null }, a = R.updateQueue, a === null && (a = ln(), R.updateQueue = a), t = a.lastEffect, t === null ? a.lastEffect = e.next = e : (l = t.next, t.next = e, e.next = l, a.lastEffect = e), e;
    }
    function em() {
      return pe().memoizedState;
    }
    function pi(e, a, t, l) {
      var o = qe();
      R.flags |= e, o.memoizedState = Vl(1 | a, { destroy: void 0 }, t, l === void 0 ? null : l);
    }
    function sn(e, a, t, l) {
      var o = pe();
      l = l === void 0 ? null : l;
      var s = o.memoizedState.inst;
      Q !== null && l !== null && Jf(l, Q.memoizedState.deps) ? o.memoizedState = Vl(a, s, t, l) : (R.flags |= e, o.memoizedState = Vl(1 | a, s, t, l));
    }
    function ec(e, a) {
      pi(8390656, 8, e, a);
    }
    function or(e, a) {
      sn(2048, 8, e, a);
    }
    function rb(e) {
      R.flags |= 4;
      var a = R.updateQueue;
      if (a === null) a = ln(), R.updateQueue = a, a.events = [e];
      else {
        var t = a.events;
        t === null ? a.events = [e] : t.push(e);
      }
    }
    function am(e) {
      var a = pe().memoizedState;
      return rb({ ref: a, nextImpl: e }), function() {
        if ((F & 2) !== 0) throw Error(v(440));
        return a.impl.apply(void 0, arguments);
      };
    }
    function tm(e, a) {
      return sn(4, 2, e, a);
    }
    function lm(e, a) {
      return sn(4, 4, e, a);
    }
    function om(e, a) {
      if (typeof a == "function") {
        e = e();
        var t = a(e);
        return function() {
          typeof t == "function" ? t() : a(null);
        };
      }
      if (a != null) return e = e(), a.current = e, function() {
        a.current = null;
      };
    }
    function sm(e, a, t) {
      t = t != null ? t.concat([e]) : null, sn(4, 4, om.bind(null, a, e), t);
    }
    function sr() {
    }
    function im(e, a) {
      var t = pe();
      a = a === void 0 ? null : a;
      var l = t.memoizedState;
      return a !== null && Jf(a, l[1]) ? l[0] : (t.memoizedState = [e, a], e);
    }
    function nm(e, a) {
      var t = pe();
      a = a === void 0 ? null : a;
      var l = t.memoizedState;
      if (a !== null && Jf(a, l[1])) return l[0];
      if (l = e(), Wt) {
        rt(true);
        try {
          e();
        } finally {
          rt(false);
        }
      }
      return t.memoizedState = [l, a], l;
    }
    function ir(e, a, t) {
      return t === void 0 || (ja & 1073741824) !== 0 && (E & 261930) === 0 ? e.memoizedState = a : (e.memoizedState = t, e = Qm(), R.lanes |= e, It |= e, t);
    }
    function um(e, a, t, l) {
      return ta(t, a) ? t : Xl.current !== null ? (e = ir(e, t, l), ta(e, a) || (be = true), e) : (ja & 42) === 0 || (ja & 1073741824) !== 0 && (E & 261930) === 0 ? (be = true, e.memoizedState = t) : (e = Qm(), R.lanes |= e, It |= e, a);
    }
    function fm(e, a, t, l, o) {
      var s = X.p;
      X.p = s !== 0 && 8 > s ? s : 8;
      var i = A.T, n = {};
      A.T = n, ur(e, false, a, t);
      try {
        var u = o(), r = A.S;
        if (r !== null && r(n, u), u !== null && typeof u == "object" && typeof u.then == "function") {
          var _ = sb(u, l);
          Po(e, a, _, aa(e));
        } else Po(e, a, l, aa(e));
      } catch (x) {
        Po(e, a, { then: function() {
        }, status: "rejected", reason: x }, aa());
      } finally {
        X.p = s, i !== null && n.types !== null && (i.types = n.types), A.T = i;
      }
    }
    function db() {
    }
    function uf(e, a, t, l) {
      if (e.tag !== 5) throw Error(v(476));
      var o = rm(e).queue;
      fm(e, o, a, Xt, t === null ? db : function() {
        return dm(e), t(l);
      });
    }
    function rm(e) {
      var a = e.memoizedState;
      if (a !== null) return a;
      a = { memoizedState: Xt, baseState: Xt, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ya, lastRenderedState: Xt }, next: null };
      var t = {};
      return a.next = { memoizedState: t, baseState: t, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Ya, lastRenderedState: t }, next: null }, e.memoizedState = a, e = e.alternate, e !== null && (e.memoizedState = a), a;
    }
    function dm(e) {
      var a = rm(e);
      a.next === null && (a = e.alternate.memoizedState), Po(e, a.next.queue, {}, aa());
    }
    function nr() {
      return Me(ss);
    }
    function cm() {
      return pe().memoizedState;
    }
    function pm() {
      return pe().memoizedState;
    }
    function cb(e) {
      for (var a = e.return; a !== null; ) {
        switch (a.tag) {
          case 24:
          case 3:
            var t = aa();
            e = _t(t);
            var l = bt(a, e, t);
            l !== null && (Pe(l, a, t), Eo(l, a, t)), a = { cache: Kf() }, e.payload = a;
            return;
        }
        a = a.return;
      }
    }
    function pb(e, a, t) {
      var l = aa();
      t = { lane: l, revertLane: 0, gesture: null, action: t, hasEagerState: false, eagerState: null, next: null }, nn(e) ? hm(a, t) : (t = Pf(e, a, t, l), t !== null && (Pe(t, e, l), gm(t, a, l)));
    }
    function mm(e, a, t) {
      var l = aa();
      Po(e, a, t, l);
    }
    function Po(e, a, t, l) {
      var o = { lane: l, revertLane: 0, gesture: null, action: t, hasEagerState: false, eagerState: null, next: null };
      if (nn(e)) hm(a, o);
      else {
        var s = e.alternate;
        if (e.lanes === 0 && (s === null || s.lanes === 0) && (s = a.lastRenderedReducer, s !== null)) try {
          var i = a.lastRenderedState, n = s(i, t);
          if (o.hasEagerState = true, o.eagerState = n, ta(n, i)) return an(e, a, o, 0), J === null && en(), false;
        } catch {
        } finally {
        }
        if (t = Pf(e, a, o, l), t !== null) return Pe(t, e, l), gm(t, a, l), true;
      }
      return false;
    }
    function ur(e, a, t, l) {
      if (l = { lane: 2, revertLane: _r(), gesture: null, action: l, hasEagerState: false, eagerState: null, next: null }, nn(e)) {
        if (a) throw Error(v(479));
      } else a = Pf(e, t, l, 2), a !== null && Pe(a, e, 2);
    }
    function nn(e) {
      var a = e.alternate;
      return e === R || a !== null && a === R;
    }
    function hm(e, a) {
      Ul = Ri = true;
      var t = e.pending;
      t === null ? a.next = a : (a.next = t.next, t.next = a), e.pending = a;
    }
    function gm(e, a, t) {
      if ((t & 4194048) !== 0) {
        var l = a.lanes;
        l &= e.pendingLanes, t |= l, a.lanes = t, ap(e, t);
      }
    }
    var ts = { readContext: Me, use: on, useCallback: fe, useContext: fe, useEffect: fe, useImperativeHandle: fe, useLayoutEffect: fe, useInsertionEffect: fe, useMemo: fe, useReducer: fe, useRef: fe, useState: fe, useDebugValue: fe, useDeferredValue: fe, useTransition: fe, useSyncExternalStore: fe, useId: fe, useHostTransitionStatus: fe, useFormState: fe, useActionState: fe, useOptimistic: fe, useMemoCache: fe, useCacheRefresh: fe };
    ts.useEffectEvent = fe;
    var _m = { readContext: Me, use: on, useCallback: function(e, a) {
      return qe().memoizedState = [e, a === void 0 ? null : a], e;
    }, useContext: Me, useEffect: ec, useImperativeHandle: function(e, a, t) {
      t = t != null ? t.concat([e]) : null, pi(4194308, 4, om.bind(null, a, e), t);
    }, useLayoutEffect: function(e, a) {
      return pi(4194308, 4, e, a);
    }, useInsertionEffect: function(e, a) {
      pi(4, 2, e, a);
    }, useMemo: function(e, a) {
      var t = qe();
      a = a === void 0 ? null : a;
      var l = e();
      if (Wt) {
        rt(true);
        try {
          e();
        } finally {
          rt(false);
        }
      }
      return t.memoizedState = [l, a], l;
    }, useReducer: function(e, a, t) {
      var l = qe();
      if (t !== void 0) {
        var o = t(a);
        if (Wt) {
          rt(true);
          try {
            t(a);
          } finally {
            rt(false);
          }
        }
      } else o = a;
      return l.memoizedState = l.baseState = o, e = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: o }, l.queue = e, e = e.dispatch = pb.bind(null, R, e), [l.memoizedState, e];
    }, useRef: function(e) {
      var a = qe();
      return e = { current: e }, a.memoizedState = e;
    }, useState: function(e) {
      e = sf(e);
      var a = e.queue, t = mm.bind(null, R, a);
      return a.dispatch = t, [e.memoizedState, t];
    }, useDebugValue: sr, useDeferredValue: function(e, a) {
      var t = qe();
      return ir(t, e, a);
    }, useTransition: function() {
      var e = sf(false);
      return e = fm.bind(null, R, e.queue, true, false), qe().memoizedState = e, [false, e];
    }, useSyncExternalStore: function(e, a, t) {
      var l = R, o = qe();
      if (N) {
        if (t === void 0) throw Error(v(407));
        t = t();
      } else {
        if (t = a(), J === null) throw Error(v(349));
        (E & 127) !== 0 || Xp(l, a, t);
      }
      o.memoizedState = t;
      var s = { value: t, getSnapshot: a };
      return o.queue = s, ec(Kp.bind(null, l, s, e), [e]), l.flags |= 2048, Vl(9, { destroy: void 0 }, Vp.bind(null, l, s, t, a), null), t;
    }, useId: function() {
      var e = qe(), a = J.identifierPrefix;
      if (N) {
        var t = Ia, l = ka;
        t = (l & ~(1 << 32 - ea(l) - 1)).toString(32) + t, a = "_" + a + "R_" + t, t = zi++, 0 < t && (a += "H" + t.toString(32)), a += "_";
      } else t = ib++, a = "_" + a + "r_" + t.toString(32) + "_";
      return e.memoizedState = a;
    }, useHostTransitionStatus: nr, useFormState: Jd, useActionState: Jd, useOptimistic: function(e) {
      var a = qe();
      a.memoizedState = a.baseState = e;
      var t = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null };
      return a.queue = t, a = ur.bind(null, R, true, t), t.dispatch = a, [e, a];
    }, useMemoCache: tr, useCacheRefresh: function() {
      return qe().memoizedState = cb.bind(null, R);
    }, useEffectEvent: function(e) {
      var a = qe(), t = { impl: e };
      return a.memoizedState = t, function() {
        if ((F & 2) !== 0) throw Error(v(440));
        return t.impl.apply(void 0, arguments);
      };
    } }, fr = { readContext: Me, use: on, useCallback: im, useContext: Me, useEffect: or, useImperativeHandle: sm, useInsertionEffect: tm, useLayoutEffect: lm, useMemo: nm, useReducer: ci, useRef: em, useState: function() {
      return ci(Ya);
    }, useDebugValue: sr, useDeferredValue: function(e, a) {
      var t = pe();
      return um(t, Q.memoizedState, e, a);
    }, useTransition: function() {
      var e = ci(Ya)[0], a = pe().memoizedState;
      return [typeof e == "boolean" ? e : hs(e), a];
    }, useSyncExternalStore: Fp, useId: cm, useHostTransitionStatus: nr, useFormState: Wd, useActionState: Wd, useOptimistic: function(e, a) {
      var t = pe();
      return Qp(t, Q, e, a);
    }, useMemoCache: tr, useCacheRefresh: pm };
    fr.useEffectEvent = am;
    var bm = { readContext: Me, use: on, useCallback: im, useContext: Me, useEffect: or, useImperativeHandle: sm, useInsertionEffect: tm, useLayoutEffect: lm, useMemo: nm, useReducer: hu, useRef: em, useState: function() {
      return hu(Ya);
    }, useDebugValue: sr, useDeferredValue: function(e, a) {
      var t = pe();
      return Q === null ? ir(t, e, a) : um(t, Q.memoizedState, e, a);
    }, useTransition: function() {
      var e = hu(Ya)[0], a = pe().memoizedState;
      return [typeof e == "boolean" ? e : hs(e), a];
    }, useSyncExternalStore: Fp, useId: cm, useHostTransitionStatus: nr, useFormState: $d, useActionState: $d, useOptimistic: function(e, a) {
      var t = pe();
      return Q !== null ? Qp(t, Q, e, a) : (t.baseState = e, [e, t.queue.dispatch]);
    }, useMemoCache: tr, useCacheRefresh: pm };
    bm.useEffectEvent = am;
    function gu(e, a, t, l) {
      a = e.memoizedState, t = t(l, a), t = t == null ? a : le({}, a, t), e.memoizedState = t, e.lanes === 0 && (e.updateQueue.baseState = t);
    }
    var ff = { enqueueSetState: function(e, a, t) {
      e = e._reactInternals;
      var l = aa(), o = _t(l);
      o.payload = a, t != null && (o.callback = t), a = bt(e, o, l), a !== null && (Pe(a, e, l), Eo(a, e, l));
    }, enqueueReplaceState: function(e, a, t) {
      e = e._reactInternals;
      var l = aa(), o = _t(l);
      o.tag = 1, o.payload = a, t != null && (o.callback = t), a = bt(e, o, l), a !== null && (Pe(a, e, l), Eo(a, e, l));
    }, enqueueForceUpdate: function(e, a) {
      e = e._reactInternals;
      var t = aa(), l = _t(t);
      l.tag = 2, a != null && (l.callback = a), a = bt(e, l, t), a !== null && (Pe(a, e, t), Eo(a, e, t));
    } };
    function ac(e, a, t, l, o, s, i) {
      return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, s, i) : a.prototype && a.prototype.isPureReactComponent ? !Jo(t, l) || !Jo(o, s) : true;
    }
    function tc(e, a, t, l) {
      e = a.state, typeof a.componentWillReceiveProps == "function" && a.componentWillReceiveProps(t, l), typeof a.UNSAFE_componentWillReceiveProps == "function" && a.UNSAFE_componentWillReceiveProps(t, l), a.state !== e && ff.enqueueReplaceState(a, a.state, null);
    }
    function $t(e, a) {
      var t = a;
      if ("ref" in a) {
        t = {};
        for (var l in a) l !== "ref" && (t[l] = a[l]);
      }
      if (e = e.defaultProps) {
        t === a && (t = le({}, t));
        for (var o in e) t[o] === void 0 && (t[o] = e[o]);
      }
      return t;
    }
    function xm(e) {
      ki(e);
    }
    function ym(e) {
      console.error(e);
    }
    function Lm(e) {
      ki(e);
    }
    function Oi(e, a) {
      try {
        var t = e.onUncaughtError;
        t(a.value, { componentStack: a.stack });
      } catch (l) {
        setTimeout(function() {
          throw l;
        });
      }
    }
    function lc(e, a, t) {
      try {
        var l = e.onCaughtError;
        l(t.value, { componentStack: t.stack, errorBoundary: a.tag === 1 ? a.stateNode : null });
      } catch (o) {
        setTimeout(function() {
          throw o;
        });
      }
    }
    function rf(e, a, t) {
      return t = _t(t), t.tag = 3, t.payload = { element: null }, t.callback = function() {
        Oi(e, a);
      }, t;
    }
    function vm(e) {
      return e = _t(e), e.tag = 3, e;
    }
    function wm(e, a, t, l) {
      var o = t.type.getDerivedStateFromError;
      if (typeof o == "function") {
        var s = l.value;
        e.payload = function() {
          return o(s);
        }, e.callback = function() {
          lc(a, t, l);
        };
      }
      var i = t.stateNode;
      i !== null && typeof i.componentDidCatch == "function" && (e.callback = function() {
        lc(a, t, l), typeof o != "function" && (xt === null ? xt = /* @__PURE__ */ new Set([this]) : xt.add(this));
        var n = l.stack;
        this.componentDidCatch(l.value, { componentStack: n !== null ? n : "" });
      });
    }
    function mb(e, a, t, l, o) {
      if (t.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
        if (a = t.alternate, a !== null && $l(a, t, o, true), t = la.current, t !== null) {
          switch (t.tag) {
            case 31:
            case 13:
              return pa === null ? Ni() : t.alternate === null && re === 0 && (re = 3), t.flags &= -257, t.flags |= 65536, t.lanes = o, l === Ai ? t.flags |= 16384 : (a = t.updateQueue, a === null ? t.updateQueue = /* @__PURE__ */ new Set([l]) : a.add(l), Iu(e, l, o)), false;
            case 22:
              return t.flags |= 65536, l === Ai ? t.flags |= 16384 : (a = t.updateQueue, a === null ? (a = { transitions: null, markerInstances: null, retryQueue: /* @__PURE__ */ new Set([l]) }, t.updateQueue = a) : (t = a.retryQueue, t === null ? a.retryQueue = /* @__PURE__ */ new Set([l]) : t.add(l)), Iu(e, l, o)), false;
          }
          throw Error(v(435, t.tag));
        }
        return Iu(e, l, o), Ni(), false;
      }
      if (N) return a = la.current, a !== null ? ((a.flags & 65536) === 0 && (a.flags |= 256), a.flags |= 65536, a.lanes = o, l !== Zu && (e = Error(v(422), { cause: l }), $o(da(e, t)))) : (l !== Zu && (a = Error(v(423), { cause: l }), $o(da(a, t))), e = e.current.alternate, e.flags |= 65536, o &= -o, e.lanes |= o, l = da(l, t), o = rf(e.stateNode, l, o), mu(e, o), re !== 4 && (re = 2)), false;
      var s = Error(v(520), { cause: l });
      if (s = da(s, t), Vo === null ? Vo = [s] : Vo.push(s), re !== 4 && (re = 2), a === null) return true;
      l = da(l, t), t = a;
      do {
        switch (t.tag) {
          case 3:
            return t.flags |= 65536, e = o & -o, t.lanes |= e, e = rf(t.stateNode, l, e), mu(t, e), false;
          case 1:
            if (a = t.type, s = t.stateNode, (t.flags & 128) === 0 && (typeof a.getDerivedStateFromError == "function" || s !== null && typeof s.componentDidCatch == "function" && (xt === null || !xt.has(s)))) return t.flags |= 65536, o &= -o, t.lanes |= o, o = vm(o), wm(o, e, t, l), mu(t, o), false;
        }
        t = t.return;
      } while (t !== null);
      return false;
    }
    var rr = Error(v(461)), be = false;
    function ke(e, a, t, l) {
      a.child = e === null ? Hp(a, null, t, l) : Jt(a, e.child, t, l);
    }
    function oc(e, a, t, l, o) {
      t = t.render;
      var s = a.ref;
      if ("ref" in l) {
        var i = {};
        for (var n in l) n !== "ref" && (i[n] = l[n]);
      } else i = l;
      return Zt(a), l = Wf(e, a, t, i, s, o), n = $f(), e !== null && !be ? (er(e, a, o), Qa(e, a, o)) : (N && n && Xf(a), a.flags |= 1, ke(e, a, l, o), a.child);
    }
    function sc(e, a, t, l, o) {
      if (e === null) {
        var s = t.type;
        return typeof s == "function" && !Ff(s) && s.defaultProps === void 0 && t.compare === null ? (a.tag = 15, a.type = s, Sm(e, a, s, l, o)) : (e = ri(t.type, null, l, a, a.mode, o), e.ref = a.ref, e.return = a, a.child = e);
      }
      if (s = e.child, !dr(e, o)) {
        var i = s.memoizedProps;
        if (t = t.compare, t = t !== null ? t : Jo, t(i, l) && e.ref === a.ref) return Qa(e, a, o);
      }
      return a.flags |= 1, e = Fa(s, l), e.ref = a.ref, e.return = a, a.child = e;
    }
    function Sm(e, a, t, l, o) {
      if (e !== null) {
        var s = e.memoizedProps;
        if (Jo(s, l) && e.ref === a.ref) if (be = false, a.pendingProps = l = s, dr(e, o)) (e.flags & 131072) !== 0 && (be = true);
        else return a.lanes = e.lanes, Qa(e, a, o);
      }
      return df(e, a, t, l, o);
    }
    function Cm(e, a, t, l) {
      var o = l.children, s = e !== null ? e.memoizedState : null;
      if (e === null && a.stateNode === null && (a.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), l.mode === "hidden") {
        if ((a.flags & 128) !== 0) {
          if (s = s !== null ? s.baseLanes | t : t, e !== null) {
            for (l = a.child = e.child, o = 0; l !== null; ) o = o | l.lanes | l.childLanes, l = l.sibling;
            l = o & ~s;
          } else l = 0, a.child = null;
          return ic(e, a, s, t, l);
        }
        if ((t & 536870912) !== 0) a.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && di(a, s !== null ? s.cachePool : null), s !== null ? Yd(a, s) : lf(), Np(a);
        else return l = a.lanes = 536870912, ic(e, a, s !== null ? s.baseLanes | t : t, t, l);
      } else s !== null ? (di(a, s.cachePool), Yd(a, s), ut(a), a.memoizedState = null) : (e !== null && di(a, null), lf(), ut(a));
      return ke(e, a, o, t), a.child;
    }
    function Ro(e, a) {
      return e !== null && e.tag === 22 || a.stateNode !== null || (a.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }), a.sibling;
    }
    function ic(e, a, t, l, o) {
      var s = jf();
      return s = s === null ? null : { parent: _e._currentValue, pool: s }, a.memoizedState = { baseLanes: t, cachePool: s }, e !== null && di(a, null), lf(), Np(a), e !== null && $l(e, a, l, true), a.childLanes = o, null;
    }
    function mi(e, a) {
      return a = qi({ mode: a.mode, children: a.children }, e.mode), a.ref = e.ref, e.child = a, a.return = e, a;
    }
    function nc(e, a, t) {
      return Jt(a, e.child, null, t), e = mi(a, a.pendingProps), e.flags |= 2, Qe(a), a.memoizedState = null, e;
    }
    function hb(e, a, t) {
      var l = a.pendingProps, o = (a.flags & 128) !== 0;
      if (a.flags &= -129, e === null) {
        if (N) {
          if (l.mode === "hidden") return e = mi(a, l), a.lanes = 536870912, Ro(null, e);
          if (of(a), (e = te) ? (e = _h(e, ca), e = e !== null && e.data === "&" ? e : null, e !== null && (a.memoizedState = { dehydrated: e, treeContext: St !== null ? { id: ka, overflow: Ia } : null, retryLane: 536870912, hydrationErrors: null }, t = Ap(e), t.return = a, a.child = t, Te = a, te = null)) : e = null, e === null) throw Ct(a);
          return a.lanes = 536870912, null;
        }
        return mi(a, l);
      }
      var s = e.memoizedState;
      if (s !== null) {
        var i = s.dehydrated;
        if (of(a), o) if (a.flags & 256) a.flags &= -257, a = nc(e, a, t);
        else if (a.memoizedState !== null) a.child = e.child, a.flags |= 128, a = null;
        else throw Error(v(558));
        else if (be || $l(e, a, t, false), o = (t & e.childLanes) !== 0, be || o) {
          if (l = J, l !== null && (i = tp(l, t), i !== 0 && i !== s.retryLane)) throw s.retryLane = i, ll(e, i), Pe(l, e, i), rr;
          Ni(), a = nc(e, a, t);
        } else e = s.treeContext, te = ma(i.nextSibling), Te = a, N = true, gt = null, ca = false, e !== null && Dp(a, e), a = mi(a, l), a.flags |= 4096;
        return a;
      }
      return e = Fa(e.child, { mode: l.mode, children: l.children }), e.ref = a.ref, a.child = e, e.return = a, e;
    }
    function hi(e, a) {
      var t = a.ref;
      if (t === null) e !== null && e.ref !== null && (a.flags |= 4194816);
      else {
        if (typeof t != "function" && typeof t != "object") throw Error(v(284));
        (e === null || e.ref !== t) && (a.flags |= 4194816);
      }
    }
    function df(e, a, t, l, o) {
      return Zt(a), t = Wf(e, a, t, l, void 0, o), l = $f(), e !== null && !be ? (er(e, a, o), Qa(e, a, o)) : (N && l && Xf(a), a.flags |= 1, ke(e, a, t, o), a.child);
    }
    function uc(e, a, t, l, o, s) {
      return Zt(a), a.updateQueue = null, t = Pp(a, l, t, o), Gp(e), l = $f(), e !== null && !be ? (er(e, a, s), Qa(e, a, s)) : (N && l && Xf(a), a.flags |= 1, ke(e, a, t, s), a.child);
    }
    function fc(e, a, t, l, o) {
      if (Zt(a), a.stateNode === null) {
        var s = Ml, i = t.contextType;
        typeof i == "object" && i !== null && (s = Me(i)), s = new t(l, s), a.memoizedState = s.state !== null && s.state !== void 0 ? s.state : null, s.updater = ff, a.stateNode = s, s._reactInternals = a, s = a.stateNode, s.props = l, s.state = a.memoizedState, s.refs = {}, Qf(a), i = t.contextType, s.context = typeof i == "object" && i !== null ? Me(i) : Ml, s.state = a.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (gu(a, t, i, l), s.state = a.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof s.getSnapshotBeforeUpdate == "function" || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (i = s.state, typeof s.componentWillMount == "function" && s.componentWillMount(), typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount(), i !== s.state && ff.enqueueReplaceState(s, s.state, null), Go(a, l, s, o), No(), s.state = a.memoizedState), typeof s.componentDidMount == "function" && (a.flags |= 4194308), l = true;
      } else if (e === null) {
        s = a.stateNode;
        var n = a.memoizedProps, u = $t(t, n);
        s.props = u;
        var r = s.context, _ = t.contextType;
        i = Ml, typeof _ == "object" && _ !== null && (i = Me(_));
        var x = t.getDerivedStateFromProps;
        _ = typeof x == "function" || typeof s.getSnapshotBeforeUpdate == "function", n = a.pendingProps !== n, _ || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (n || r !== i) && tc(a, s, l, i), st = false;
        var m = a.memoizedState;
        s.state = m, Go(a, l, s, o), No(), r = a.memoizedState, n || m !== r || st ? (typeof x == "function" && (gu(a, t, x, l), r = a.memoizedState), (u = st || ac(a, t, u, l, m, r, i)) ? (_ || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (typeof s.componentWillMount == "function" && s.componentWillMount(), typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount()), typeof s.componentDidMount == "function" && (a.flags |= 4194308)) : (typeof s.componentDidMount == "function" && (a.flags |= 4194308), a.memoizedProps = l, a.memoizedState = r), s.props = l, s.state = r, s.context = i, l = u) : (typeof s.componentDidMount == "function" && (a.flags |= 4194308), l = false);
      } else {
        s = a.stateNode, af(e, a), i = a.memoizedProps, _ = $t(t, i), s.props = _, x = a.pendingProps, m = s.context, r = t.contextType, u = Ml, typeof r == "object" && r !== null && (u = Me(r)), n = t.getDerivedStateFromProps, (r = typeof n == "function" || typeof s.getSnapshotBeforeUpdate == "function") || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (i !== x || m !== u) && tc(a, s, l, u), st = false, m = a.memoizedState, s.state = m, Go(a, l, s, o), No();
        var d = a.memoizedState;
        i !== x || m !== d || st || e !== null && e.dependencies !== null && Mi(e.dependencies) ? (typeof n == "function" && (gu(a, t, n, l), d = a.memoizedState), (_ = st || ac(a, t, _, l, m, d, u) || e !== null && e.dependencies !== null && Mi(e.dependencies)) ? (r || typeof s.UNSAFE_componentWillUpdate != "function" && typeof s.componentWillUpdate != "function" || (typeof s.componentWillUpdate == "function" && s.componentWillUpdate(l, d, u), typeof s.UNSAFE_componentWillUpdate == "function" && s.UNSAFE_componentWillUpdate(l, d, u)), typeof s.componentDidUpdate == "function" && (a.flags |= 4), typeof s.getSnapshotBeforeUpdate == "function" && (a.flags |= 1024)) : (typeof s.componentDidUpdate != "function" || i === e.memoizedProps && m === e.memoizedState || (a.flags |= 4), typeof s.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && m === e.memoizedState || (a.flags |= 1024), a.memoizedProps = l, a.memoizedState = d), s.props = l, s.state = d, s.context = u, l = _) : (typeof s.componentDidUpdate != "function" || i === e.memoizedProps && m === e.memoizedState || (a.flags |= 4), typeof s.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && m === e.memoizedState || (a.flags |= 1024), l = false);
      }
      return s = l, hi(e, a), l = (a.flags & 128) !== 0, s || l ? (s = a.stateNode, t = l && typeof t.getDerivedStateFromError != "function" ? null : s.render(), a.flags |= 1, e !== null && l ? (a.child = Jt(a, e.child, null, o), a.child = Jt(a, null, t, o)) : ke(e, a, t, o), a.memoizedState = s.state, e = a.child) : e = Qa(e, a, o), e;
    }
    function rc(e, a, t, l) {
      return Qt(), a.flags |= 256, ke(e, a, t, l), a.child;
    }
    var _u = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
    function bu(e) {
      return { baseLanes: e, cachePool: zp() };
    }
    function xu(e, a, t) {
      return e = e !== null ? e.childLanes & ~t : 0, a && (e |= Je), e;
    }
    function km(e, a, t) {
      var l = a.pendingProps, o = false, s = (a.flags & 128) !== 0, i;
      if ((i = s) || (i = e !== null && e.memoizedState === null ? false : (ce.current & 2) !== 0), i && (o = true, a.flags &= -129), i = (a.flags & 32) !== 0, a.flags &= -33, e === null) {
        if (N) {
          if (o ? nt(a) : ut(a), (e = te) ? (e = _h(e, ca), e = e !== null && e.data !== "&" ? e : null, e !== null && (a.memoizedState = { dehydrated: e, treeContext: St !== null ? { id: ka, overflow: Ia } : null, retryLane: 536870912, hydrationErrors: null }, t = Ap(e), t.return = a, a.child = t, Te = a, te = null)) : e = null, e === null) throw Ct(a);
          return Cf(e) ? a.lanes = 32 : a.lanes = 536870912, null;
        }
        var n = l.children;
        return l = l.fallback, o ? (ut(a), o = a.mode, n = qi({ mode: "hidden", children: n }, o), l = Vt(l, o, t, null), n.return = a, l.return = a, n.sibling = l, a.child = n, l = a.child, l.memoizedState = bu(t), l.childLanes = xu(e, i, t), a.memoizedState = _u, Ro(null, l)) : (nt(a), cf(a, n));
      }
      var u = e.memoizedState;
      if (u !== null && (n = u.dehydrated, n !== null)) {
        if (s) a.flags & 256 ? (nt(a), a.flags &= -257, a = yu(e, a, t)) : a.memoizedState !== null ? (ut(a), a.child = e.child, a.flags |= 128, a = null) : (ut(a), n = l.fallback, o = a.mode, l = qi({ mode: "visible", children: l.children }, o), n = Vt(n, o, t, null), n.flags |= 2, l.return = a, n.return = a, l.sibling = n, a.child = l, Jt(a, e.child, null, t), l = a.child, l.memoizedState = bu(t), l.childLanes = xu(e, i, t), a.memoizedState = _u, a = Ro(null, l));
        else if (nt(a), Cf(n)) {
          if (i = n.nextSibling && n.nextSibling.dataset, i) var r = i.dgst;
          i = r, l = Error(v(419)), l.stack = "", l.digest = i, $o({ value: l, source: null, stack: null }), a = yu(e, a, t);
        } else if (be || $l(e, a, t, false), i = (t & e.childLanes) !== 0, be || i) {
          if (i = J, i !== null && (l = tp(i, t), l !== 0 && l !== u.retryLane)) throw u.retryLane = l, ll(e, l), Pe(i, e, l), rr;
          Sf(n) || Ni(), a = yu(e, a, t);
        } else Sf(n) ? (a.flags |= 192, a.child = e.child, a = null) : (e = u.treeContext, te = ma(n.nextSibling), Te = a, N = true, gt = null, ca = false, e !== null && Dp(a, e), a = cf(a, l.children), a.flags |= 4096);
        return a;
      }
      return o ? (ut(a), n = l.fallback, o = a.mode, u = e.child, r = u.sibling, l = Fa(u, { mode: "hidden", children: l.children }), l.subtreeFlags = u.subtreeFlags & 65011712, r !== null ? n = Fa(r, n) : (n = Vt(n, o, t, null), n.flags |= 2), n.return = a, l.return = a, l.sibling = n, a.child = l, Ro(null, l), l = a.child, n = e.child.memoizedState, n === null ? n = bu(t) : (o = n.cachePool, o !== null ? (u = _e._currentValue, o = o.parent !== u ? { parent: u, pool: u } : o) : o = zp(), n = { baseLanes: n.baseLanes | t, cachePool: o }), l.memoizedState = n, l.childLanes = xu(e, i, t), a.memoizedState = _u, Ro(e.child, l)) : (nt(a), t = e.child, e = t.sibling, t = Fa(t, { mode: "visible", children: l.children }), t.return = a, t.sibling = null, e !== null && (i = a.deletions, i === null ? (a.deletions = [e], a.flags |= 16) : i.push(e)), a.child = t, a.memoizedState = null, t);
    }
    function cf(e, a) {
      return a = qi({ mode: "visible", children: a }, e.mode), a.return = e, e.child = a;
    }
    function qi(e, a) {
      return e = Ze(22, e, null, a), e.lanes = 0, e;
    }
    function yu(e, a, t) {
      return Jt(a, e.child, null, t), e = cf(a, a.pendingProps.children), e.flags |= 2, a.memoizedState = null, e;
    }
    function dc(e, a, t) {
      e.lanes |= a;
      var l = e.alternate;
      l !== null && (l.lanes |= a), Wu(e.return, a, t);
    }
    function Lu(e, a, t, l, o, s) {
      var i = e.memoizedState;
      i === null ? e.memoizedState = { isBackwards: a, rendering: null, renderingStartTime: 0, last: l, tail: t, tailMode: o, treeForkCount: s } : (i.isBackwards = a, i.rendering = null, i.renderingStartTime = 0, i.last = l, i.tail = t, i.tailMode = o, i.treeForkCount = s);
    }
    function Im(e, a, t) {
      var l = a.pendingProps, o = l.revealOrder, s = l.tail;
      l = l.children;
      var i = ce.current, n = (i & 2) !== 0;
      if (n ? (i = i & 1 | 2, a.flags |= 128) : i &= 1, W(ce, i), ke(e, a, l, t), l = N ? Wo : 0, !n && e !== null && (e.flags & 128) !== 0) e: for (e = a.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && dc(e, t, a);
        else if (e.tag === 19) dc(e, t, a);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === a) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === a) break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
      switch (o) {
        case "forwards":
          for (t = a.child, o = null; t !== null; ) e = t.alternate, e !== null && Di(e) === null && (o = t), t = t.sibling;
          t = o, t === null ? (o = a.child, a.child = null) : (o = t.sibling, t.sibling = null), Lu(a, false, o, t, s, l);
          break;
        case "backwards":
        case "unstable_legacy-backwards":
          for (t = null, o = a.child, a.child = null; o !== null; ) {
            if (e = o.alternate, e !== null && Di(e) === null) {
              a.child = o;
              break;
            }
            e = o.sibling, o.sibling = t, t = o, o = e;
          }
          Lu(a, true, t, null, s, l);
          break;
        case "together":
          Lu(a, false, null, null, void 0, l);
          break;
        default:
          a.memoizedState = null;
      }
      return a.child;
    }
    function Qa(e, a, t) {
      if (e !== null && (a.dependencies = e.dependencies), It |= a.lanes, (t & a.childLanes) === 0) if (e !== null) {
        if ($l(e, a, t, false), (t & a.childLanes) === 0) return null;
      } else return null;
      if (e !== null && a.child !== e.child) throw Error(v(153));
      if (a.child !== null) {
        for (e = a.child, t = Fa(e, e.pendingProps), a.child = t, t.return = a; e.sibling !== null; ) e = e.sibling, t = t.sibling = Fa(e, e.pendingProps), t.return = a;
        t.sibling = null;
      }
      return a.child;
    }
    function dr(e, a) {
      return (e.lanes & a) !== 0 ? true : (e = e.dependencies, !!(e !== null && Mi(e)));
    }
    function gb(e, a, t) {
      switch (a.tag) {
        case 3:
          vi(a, a.stateNode.containerInfo), it(a, _e, e.memoizedState.cache), Qt();
          break;
        case 27:
        case 5:
          Eu(a);
          break;
        case 4:
          vi(a, a.stateNode.containerInfo);
          break;
        case 10:
          it(a, a.type, a.memoizedProps.value);
          break;
        case 31:
          if (a.memoizedState !== null) return a.flags |= 128, of(a), null;
          break;
        case 13:
          var l = a.memoizedState;
          if (l !== null) return l.dehydrated !== null ? (nt(a), a.flags |= 128, null) : (t & a.child.childLanes) !== 0 ? km(e, a, t) : (nt(a), e = Qa(e, a, t), e !== null ? e.sibling : null);
          nt(a);
          break;
        case 19:
          var o = (e.flags & 128) !== 0;
          if (l = (t & a.childLanes) !== 0, l || ($l(e, a, t, false), l = (t & a.childLanes) !== 0), o) {
            if (l) return Im(e, a, t);
            a.flags |= 128;
          }
          if (o = a.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), W(ce, ce.current), l) break;
          return null;
        case 22:
          return a.lanes = 0, Cm(e, a, t, a.pendingProps);
        case 24:
          it(a, _e, e.memoizedState.cache);
      }
      return Qa(e, a, t);
    }
    function Tm(e, a, t) {
      if (e !== null) if (e.memoizedProps !== a.pendingProps) be = true;
      else {
        if (!dr(e, t) && (a.flags & 128) === 0) return be = false, gb(e, a, t);
        be = (e.flags & 131072) !== 0;
      }
      else be = false, N && (a.flags & 1048576) !== 0 && Bp(a, Wo, a.index);
      switch (a.lanes = 0, a.tag) {
        case 16:
          e: {
            var l = a.pendingProps;
            if (e = Pt(a.elementType), a.type = e, typeof e == "function") Ff(e) ? (l = $t(e, l), a.tag = 1, a = fc(null, a, e, l, t)) : (a.tag = 0, a = df(null, a, e, l, t));
            else {
              if (e != null) {
                var o = e.$typeof;
                if (o === Mf) {
                  a.tag = 11, a = oc(null, a, e, l, t);
                  break e;
                } else if (o === Af) {
                  a.tag = 14, a = sc(null, a, e, l, t);
                  break e;
                }
              }
              throw a = Hu(e) || e, Error(v(306, a, ""));
            }
          }
          return a;
        case 0:
          return df(e, a, a.type, a.pendingProps, t);
        case 1:
          return l = a.type, o = $t(l, a.pendingProps), fc(e, a, l, o, t);
        case 3:
          e: {
            if (vi(a, a.stateNode.containerInfo), e === null) throw Error(v(387));
            l = a.pendingProps;
            var s = a.memoizedState;
            o = s.element, af(e, a), Go(a, l, null, t);
            var i = a.memoizedState;
            if (l = i.cache, it(a, _e, l), l !== s.cache && $u(a, [_e], t, true), No(), l = i.element, s.isDehydrated) if (s = { element: l, isDehydrated: false, cache: i.cache }, a.updateQueue.baseState = s, a.memoizedState = s, a.flags & 256) {
              a = rc(e, a, l, t);
              break e;
            } else if (l !== o) {
              o = da(Error(v(424)), a), $o(o), a = rc(e, a, l, t);
              break e;
            } else {
              switch (e = a.stateNode.containerInfo, e.nodeType) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
              }
              for (te = ma(e.firstChild), Te = a, N = true, gt = null, ca = true, t = Hp(a, null, l, t), a.child = t; t; ) t.flags = t.flags & -3 | 4096, t = t.sibling;
            }
            else {
              if (Qt(), l === o) {
                a = Qa(e, a, t);
                break e;
              }
              ke(e, a, l, t);
            }
            a = a.child;
          }
          return a;
        case 26:
          return hi(e, a), e === null ? (t = Rc(a.type, null, a.pendingProps, null)) ? a.memoizedState = t : N || (t = a.type, e = a.pendingProps, l = Xi(ht.current).createElement(t), l[Ie] = a, l[Fe] = e, Ae(l, t, e), Se(l), a.stateNode = l) : a.memoizedState = Rc(a.type, e.memoizedProps, a.pendingProps, e.memoizedState), null;
        case 27:
          return Eu(a), e === null && N && (l = a.stateNode = bh(a.type, a.pendingProps, ht.current), Te = a, ca = true, o = te, Mt(a.type) ? (kf = o, te = ma(l.firstChild)) : te = o), ke(e, a, a.pendingProps.children, t), hi(e, a), e === null && (a.flags |= 4194304), a.child;
        case 5:
          return e === null && N && ((o = l = te) && (l = Xb(l, a.type, a.pendingProps, ca), l !== null ? (a.stateNode = l, Te = a, te = ma(l.firstChild), ca = false, o = true) : o = false), o || Ct(a)), Eu(a), o = a.type, s = a.pendingProps, i = e !== null ? e.memoizedProps : null, l = s.children, vf(o, s) ? l = null : i !== null && vf(o, i) && (a.flags |= 32), a.memoizedState !== null && (o = Wf(e, a, nb, null, null, t), ss._currentValue = o), hi(e, a), ke(e, a, l, t), a.child;
        case 6:
          return e === null && N && ((e = t = te) && (t = Vb(t, a.pendingProps, ca), t !== null ? (a.stateNode = t, Te = a, te = null, e = true) : e = false), e || Ct(a)), null;
        case 13:
          return km(e, a, t);
        case 4:
          return vi(a, a.stateNode.containerInfo), l = a.pendingProps, e === null ? a.child = Jt(a, null, l, t) : ke(e, a, l, t), a.child;
        case 11:
          return oc(e, a, a.type, a.pendingProps, t);
        case 7:
          return ke(e, a, a.pendingProps, t), a.child;
        case 8:
          return ke(e, a, a.pendingProps.children, t), a.child;
        case 12:
          return ke(e, a, a.pendingProps.children, t), a.child;
        case 10:
          return l = a.pendingProps, it(a, a.type, l.value), ke(e, a, l.children, t), a.child;
        case 9:
          return o = a.type._context, l = a.pendingProps.children, Zt(a), o = Me(o), l = l(o), a.flags |= 1, ke(e, a, l, t), a.child;
        case 14:
          return sc(e, a, a.type, a.pendingProps, t);
        case 15:
          return Sm(e, a, a.type, a.pendingProps, t);
        case 19:
          return Im(e, a, t);
        case 31:
          return hb(e, a, t);
        case 22:
          return Cm(e, a, t, a.pendingProps);
        case 24:
          return Zt(a), l = Me(_e), e === null ? (o = jf(), o === null && (o = J, s = Kf(), o.pooledCache = s, s.refCount++, s !== null && (o.pooledCacheLanes |= t), o = s), a.memoizedState = { parent: l, cache: o }, Qf(a), it(a, _e, o)) : ((e.lanes & t) !== 0 && (af(e, a), Go(a, null, null, t), No()), o = e.memoizedState, s = a.memoizedState, o.parent !== l ? (o = { parent: l, cache: l }, a.memoizedState = o, a.lanes === 0 && (a.memoizedState = a.updateQueue.baseState = o), it(a, _e, l)) : (l = s.cache, it(a, _e, l), l !== o.cache && $u(a, [_e], t, true))), ke(e, a, a.pendingProps.children, t), a.child;
        case 29:
          throw a.pendingProps;
      }
      throw Error(v(156, a.tag));
    }
    function za(e) {
      e.flags |= 4;
    }
    function vu(e, a, t, l, o) {
      if ((a = (e.mode & 32) !== 0) && (a = false), a) {
        if (e.flags |= 16777216, (o & 335544128) === o) if (e.stateNode.complete) e.flags |= 8192;
        else if (Wm()) e.flags |= 8192;
        else throw jt = Ai, Yf;
      } else e.flags &= -16777217;
    }
    function cc(e, a) {
      if (a.type !== "stylesheet" || (a.state.loading & 4) !== 0) e.flags &= -16777217;
      else if (e.flags |= 16777216, !Lh(a)) if (Wm()) e.flags |= 8192;
      else throw jt = Ai, Yf;
    }
    function $s(e, a) {
      a !== null && (e.flags |= 4), e.flags & 16384 && (a = e.tag !== 22 ? $c() : 536870912, e.lanes |= a, Kl |= a);
    }
    function ko(e, a) {
      if (!N) switch (e.tailMode) {
        case "hidden":
          a = e.tail;
          for (var t = null; a !== null; ) a.alternate !== null && (t = a), a = a.sibling;
          t === null ? e.tail = null : t.sibling = null;
          break;
        case "collapsed":
          t = e.tail;
          for (var l = null; t !== null; ) t.alternate !== null && (l = t), t = t.sibling;
          l === null ? a || e.tail === null ? e.tail = null : e.tail.sibling = null : l.sibling = null;
      }
    }
    function ae(e) {
      var a = e.alternate !== null && e.alternate.child === e.child, t = 0, l = 0;
      if (a) for (var o = e.child; o !== null; ) t |= o.lanes | o.childLanes, l |= o.subtreeFlags & 65011712, l |= o.flags & 65011712, o.return = e, o = o.sibling;
      else for (o = e.child; o !== null; ) t |= o.lanes | o.childLanes, l |= o.subtreeFlags, l |= o.flags, o.return = e, o = o.sibling;
      return e.subtreeFlags |= l, e.childLanes = t, a;
    }
    function _b(e, a, t) {
      var l = a.pendingProps;
      switch (Vf(a), a.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return ae(a), null;
        case 1:
          return ae(a), null;
        case 3:
          return t = a.stateNode, l = null, e !== null && (l = e.memoizedState.cache), a.memoizedState.cache !== l && (a.flags |= 2048), Xa(_e), Nl(), t.pendingContext && (t.context = t.pendingContext, t.pendingContext = null), (e === null || e.child === null) && (_l(a) ? za(a) : e === null || e.memoizedState.isDehydrated && (a.flags & 256) === 0 || (a.flags |= 1024, pu())), ae(a), null;
        case 26:
          var o = a.type, s = a.memoizedState;
          return e === null ? (za(a), s !== null ? (ae(a), cc(a, s)) : (ae(a), vu(a, o, null, l, t))) : s ? s !== e.memoizedState ? (za(a), ae(a), cc(a, s)) : (ae(a), a.flags &= -16777217) : (e = e.memoizedProps, e !== l && za(a), ae(a), vu(a, o, e, l, t)), null;
        case 27:
          if (wi(a), t = ht.current, o = a.type, e !== null && a.stateNode != null) e.memoizedProps !== l && za(a);
          else {
            if (!l) {
              if (a.stateNode === null) throw Error(v(166));
              return ae(a), null;
            }
            e = Ma.current, _l(a) ? Gd(a, e) : (e = bh(o, l, t), a.stateNode = e, za(a));
          }
          return ae(a), null;
        case 5:
          if (wi(a), o = a.type, e !== null && a.stateNode != null) e.memoizedProps !== l && za(a);
          else {
            if (!l) {
              if (a.stateNode === null) throw Error(v(166));
              return ae(a), null;
            }
            if (s = Ma.current, _l(a)) Gd(a, s);
            else {
              var i = Xi(ht.current);
              switch (s) {
                case 1:
                  s = i.createElementNS("http://www.w3.org/2000/svg", o);
                  break;
                case 2:
                  s = i.createElementNS("http://www.w3.org/1998/Math/MathML", o);
                  break;
                default:
                  switch (o) {
                    case "svg":
                      s = i.createElementNS("http://www.w3.org/2000/svg", o);
                      break;
                    case "math":
                      s = i.createElementNS("http://www.w3.org/1998/Math/MathML", o);
                      break;
                    case "script":
                      s = i.createElement("div"), s.innerHTML = "<script><\/script>", s = s.removeChild(s.firstChild);
                      break;
                    case "select":
                      s = typeof l.is == "string" ? i.createElement("select", { is: l.is }) : i.createElement("select"), l.multiple ? s.multiple = true : l.size && (s.size = l.size);
                      break;
                    default:
                      s = typeof l.is == "string" ? i.createElement(o, { is: l.is }) : i.createElement(o);
                  }
              }
              s[Ie] = a, s[Fe] = l;
              e: for (i = a.child; i !== null; ) {
                if (i.tag === 5 || i.tag === 6) s.appendChild(i.stateNode);
                else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
                  i.child.return = i, i = i.child;
                  continue;
                }
                if (i === a) break e;
                for (; i.sibling === null; ) {
                  if (i.return === null || i.return === a) break e;
                  i = i.return;
                }
                i.sibling.return = i.return, i = i.sibling;
              }
              a.stateNode = s;
              e: switch (Ae(s, o, l), o) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  l = !!l.autoFocus;
                  break e;
                case "img":
                  l = true;
                  break e;
                default:
                  l = false;
              }
              l && za(a);
            }
          }
          return ae(a), vu(a, a.type, e === null ? null : e.memoizedProps, a.pendingProps, t), null;
        case 6:
          if (e && a.stateNode != null) e.memoizedProps !== l && za(a);
          else {
            if (typeof l != "string" && a.stateNode === null) throw Error(v(166));
            if (e = ht.current, _l(a)) {
              if (e = a.stateNode, t = a.memoizedProps, l = null, o = Te, o !== null) switch (o.tag) {
                case 27:
                case 5:
                  l = o.memoizedProps;
              }
              e[Ie] = a, e = !!(e.nodeValue === t || l !== null && l.suppressHydrationWarning === true || mh(e.nodeValue, t)), e || Ct(a, true);
            } else e = Xi(e).createTextNode(l), e[Ie] = a, a.stateNode = e;
          }
          return ae(a), null;
        case 31:
          if (t = a.memoizedState, e === null || e.memoizedState !== null) {
            if (l = _l(a), t !== null) {
              if (e === null) {
                if (!l) throw Error(v(318));
                if (e = a.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(v(557));
                e[Ie] = a;
              } else Qt(), (a.flags & 128) === 0 && (a.memoizedState = null), a.flags |= 4;
              ae(a), e = false;
            } else t = pu(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = t), e = true;
            if (!e) return a.flags & 256 ? (Qe(a), a) : (Qe(a), null);
            if ((a.flags & 128) !== 0) throw Error(v(558));
          }
          return ae(a), null;
        case 13:
          if (l = a.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
            if (o = _l(a), l !== null && l.dehydrated !== null) {
              if (e === null) {
                if (!o) throw Error(v(318));
                if (o = a.memoizedState, o = o !== null ? o.dehydrated : null, !o) throw Error(v(317));
                o[Ie] = a;
              } else Qt(), (a.flags & 128) === 0 && (a.memoizedState = null), a.flags |= 4;
              ae(a), o = false;
            } else o = pu(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = o), o = true;
            if (!o) return a.flags & 256 ? (Qe(a), a) : (Qe(a), null);
          }
          return Qe(a), (a.flags & 128) !== 0 ? (a.lanes = t, a) : (t = l !== null, e = e !== null && e.memoizedState !== null, t && (l = a.child, o = null, l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (o = l.alternate.memoizedState.cachePool.pool), s = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (s = l.memoizedState.cachePool.pool), s !== o && (l.flags |= 2048)), t !== e && t && (a.child.flags |= 8192), $s(a, a.updateQueue), ae(a), null);
        case 4:
          return Nl(), e === null && br(a.stateNode.containerInfo), ae(a), null;
        case 10:
          return Xa(a.type), ae(a), null;
        case 19:
          if (Ce(ce), l = a.memoizedState, l === null) return ae(a), null;
          if (o = (a.flags & 128) !== 0, s = l.rendering, s === null) if (o) ko(l, false);
          else {
            if (re !== 0 || e !== null && (e.flags & 128) !== 0) for (e = a.child; e !== null; ) {
              if (s = Di(e), s !== null) {
                for (a.flags |= 128, ko(l, false), e = s.updateQueue, a.updateQueue = e, $s(a, e), a.subtreeFlags = 0, e = t, t = a.child; t !== null; ) Mp(t, e), t = t.sibling;
                return W(ce, ce.current & 1 | 2), N && Ua(a, l.treeForkCount), a.child;
              }
              e = e.sibling;
            }
            l.tail !== null && We() > Ui && (a.flags |= 128, o = true, ko(l, false), a.lanes = 4194304);
          }
          else {
            if (!o) if (e = Di(s), e !== null) {
              if (a.flags |= 128, o = true, e = e.updateQueue, a.updateQueue = e, $s(a, e), ko(l, true), l.tail === null && l.tailMode === "hidden" && !s.alternate && !N) return ae(a), null;
            } else 2 * We() - l.renderingStartTime > Ui && t !== 536870912 && (a.flags |= 128, o = true, ko(l, false), a.lanes = 4194304);
            l.isBackwards ? (s.sibling = a.child, a.child = s) : (e = l.last, e !== null ? e.sibling = s : a.child = s, l.last = s);
          }
          return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = We(), e.sibling = null, t = ce.current, W(ce, o ? t & 1 | 2 : t & 1), N && Ua(a, l.treeForkCount), e) : (ae(a), null);
        case 22:
        case 23:
          return Qe(a), Zf(), l = a.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (a.flags |= 8192) : l && (a.flags |= 8192), l ? (t & 536870912) !== 0 && (a.flags & 128) === 0 && (ae(a), a.subtreeFlags & 6 && (a.flags |= 8192)) : ae(a), t = a.updateQueue, t !== null && $s(a, t.retryQueue), t = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (t = e.memoizedState.cachePool.pool), l = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (l = a.memoizedState.cachePool.pool), l !== t && (a.flags |= 2048), e !== null && Ce(Kt), null;
        case 24:
          return t = null, e !== null && (t = e.memoizedState.cache), a.memoizedState.cache !== t && (a.flags |= 2048), Xa(_e), ae(a), null;
        case 25:
          return null;
        case 30:
          return null;
      }
      throw Error(v(156, a.tag));
    }
    function bb(e, a) {
      switch (Vf(a), a.tag) {
        case 1:
          return e = a.flags, e & 65536 ? (a.flags = e & -65537 | 128, a) : null;
        case 3:
          return Xa(_e), Nl(), e = a.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (a.flags = e & -65537 | 128, a) : null;
        case 26:
        case 27:
        case 5:
          return wi(a), null;
        case 31:
          if (a.memoizedState !== null) {
            if (Qe(a), a.alternate === null) throw Error(v(340));
            Qt();
          }
          return e = a.flags, e & 65536 ? (a.flags = e & -65537 | 128, a) : null;
        case 13:
          if (Qe(a), e = a.memoizedState, e !== null && e.dehydrated !== null) {
            if (a.alternate === null) throw Error(v(340));
            Qt();
          }
          return e = a.flags, e & 65536 ? (a.flags = e & -65537 | 128, a) : null;
        case 19:
          return Ce(ce), null;
        case 4:
          return Nl(), null;
        case 10:
          return Xa(a.type), null;
        case 22:
        case 23:
          return Qe(a), Zf(), e !== null && Ce(Kt), e = a.flags, e & 65536 ? (a.flags = e & -65537 | 128, a) : null;
        case 24:
          return Xa(_e), null;
        case 25:
          return null;
        default:
          return null;
      }
    }
    function Mm(e, a) {
      switch (Vf(a), a.tag) {
        case 3:
          Xa(_e), Nl();
          break;
        case 26:
        case 27:
        case 5:
          wi(a);
          break;
        case 4:
          Nl();
          break;
        case 31:
          a.memoizedState !== null && Qe(a);
          break;
        case 13:
          Qe(a);
          break;
        case 19:
          Ce(ce);
          break;
        case 10:
          Xa(a.type);
          break;
        case 22:
        case 23:
          Qe(a), Zf(), e !== null && Ce(Kt);
          break;
        case 24:
          Xa(_e);
      }
    }
    function gs(e, a) {
      try {
        var t = a.updateQueue, l = t !== null ? t.lastEffect : null;
        if (l !== null) {
          var o = l.next;
          t = o;
          do {
            if ((t.tag & e) === e) {
              l = void 0;
              var s = t.create, i = t.inst;
              l = s(), i.destroy = l;
            }
            t = t.next;
          } while (t !== o);
        }
      } catch (n) {
        K(a, a.return, n);
      }
    }
    function kt(e, a, t) {
      try {
        var l = a.updateQueue, o = l !== null ? l.lastEffect : null;
        if (o !== null) {
          var s = o.next;
          l = s;
          do {
            if ((l.tag & e) === e) {
              var i = l.inst, n = i.destroy;
              if (n !== void 0) {
                i.destroy = void 0, o = a;
                var u = t, r = n;
                try {
                  r();
                } catch (_) {
                  K(o, u, _);
                }
              }
            }
            l = l.next;
          } while (l !== s);
        }
      } catch (_) {
        K(a, a.return, _);
      }
    }
    function Am(e) {
      var a = e.updateQueue;
      if (a !== null) {
        var t = e.stateNode;
        try {
          Ep(a, t);
        } catch (l) {
          K(e, e.return, l);
        }
      }
    }
    function Bm(e, a, t) {
      t.props = $t(e.type, e.memoizedProps), t.state = e.memoizedState;
      try {
        t.componentWillUnmount();
      } catch (l) {
        K(e, a, l);
      }
    }
    function Fo(e, a) {
      try {
        var t = e.ref;
        if (t !== null) {
          switch (e.tag) {
            case 26:
            case 27:
            case 5:
              var l = e.stateNode;
              break;
            case 30:
              l = e.stateNode;
              break;
            default:
              l = e.stateNode;
          }
          typeof t == "function" ? e.refCleanup = t(l) : t.current = l;
        }
      } catch (o) {
        K(e, a, o);
      }
    }
    function Ta(e, a) {
      var t = e.ref, l = e.refCleanup;
      if (t !== null) if (typeof l == "function") try {
        l();
      } catch (o) {
        K(e, a, o);
      } finally {
        e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
      }
      else if (typeof t == "function") try {
        t(null);
      } catch (o) {
        K(e, a, o);
      }
      else t.current = null;
    }
    function Dm(e) {
      var a = e.type, t = e.memoizedProps, l = e.stateNode;
      try {
        e: switch (a) {
          case "button":
          case "input":
          case "select":
          case "textarea":
            t.autoFocus && l.focus();
            break e;
          case "img":
            t.src ? l.src = t.src : t.srcSet && (l.srcset = t.srcSet);
        }
      } catch (o) {
        K(e, e.return, o);
      }
    }
    function wu(e, a, t) {
      try {
        var l = e.stateNode;
        Ub(l, e.type, t, a), l[Fe] = a;
      } catch (o) {
        K(e, e.return, o);
      }
    }
    function Rm(e) {
      return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Mt(e.type) || e.tag === 4;
    }
    function Su(e) {
      e: for (; ; ) {
        for (; e.sibling === null; ) {
          if (e.return === null || Rm(e.return)) return null;
          e = e.return;
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
          if (e.tag === 27 && Mt(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
          e.child.return = e, e = e.child;
        }
        if (!(e.flags & 2)) return e.stateNode;
      }
    }
    function pf(e, a, t) {
      var l = e.tag;
      if (l === 5 || l === 6) e = e.stateNode, a ? (t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t).insertBefore(e, a) : (a = t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t, a.appendChild(e), t = t._reactRootContainer, t != null || a.onclick !== null || (a.onclick = Ga));
      else if (l !== 4 && (l === 27 && Mt(e.type) && (t = e.stateNode, a = null), e = e.child, e !== null)) for (pf(e, a, t), e = e.sibling; e !== null; ) pf(e, a, t), e = e.sibling;
    }
    function Hi(e, a, t) {
      var l = e.tag;
      if (l === 5 || l === 6) e = e.stateNode, a ? t.insertBefore(e, a) : t.appendChild(e);
      else if (l !== 4 && (l === 27 && Mt(e.type) && (t = e.stateNode), e = e.child, e !== null)) for (Hi(e, a, t), e = e.sibling; e !== null; ) Hi(e, a, t), e = e.sibling;
    }
    function zm(e) {
      var a = e.stateNode, t = e.memoizedProps;
      try {
        for (var l = e.type, o = a.attributes; o.length; ) a.removeAttributeNode(o[0]);
        Ae(a, l, t), a[Ie] = e, a[Fe] = t;
      } catch (s) {
        K(e, e.return, s);
      }
    }
    var Ea = false, ge = false, Cu = false, pc = typeof WeakSet == "function" ? WeakSet : Set, we = null;
    function xb(e, a) {
      if (e = e.containerInfo, yf = Yi, e = Lp(e), Nf(e)) {
        if ("selectionStart" in e) var t = { start: e.selectionStart, end: e.selectionEnd };
        else e: {
          t = (t = e.ownerDocument) && t.defaultView || window;
          var l = t.getSelection && t.getSelection();
          if (l && l.rangeCount !== 0) {
            t = l.anchorNode;
            var o = l.anchorOffset, s = l.focusNode;
            l = l.focusOffset;
            try {
              t.nodeType, s.nodeType;
            } catch {
              t = null;
              break e;
            }
            var i = 0, n = -1, u = -1, r = 0, _ = 0, x = e, m = null;
            a: for (; ; ) {
              for (var d; x !== t || o !== 0 && x.nodeType !== 3 || (n = i + o), x !== s || l !== 0 && x.nodeType !== 3 || (u = i + l), x.nodeType === 3 && (i += x.nodeValue.length), (d = x.firstChild) !== null; ) m = x, x = d;
              for (; ; ) {
                if (x === e) break a;
                if (m === t && ++r === o && (n = i), m === s && ++_ === l && (u = i), (d = x.nextSibling) !== null) break;
                x = m, m = x.parentNode;
              }
              x = d;
            }
            t = n === -1 || u === -1 ? null : { start: n, end: u };
          } else t = null;
        }
        t = t || { start: 0, end: 0 };
      } else t = null;
      for (Lf = { focusedElem: e, selectionRange: t }, Yi = false, we = a; we !== null; ) if (a = we, e = a.child, (a.subtreeFlags & 1028) !== 0 && e !== null) e.return = a, we = e;
      else for (; we !== null; ) {
        switch (a = we, s = a.alternate, e = a.flags, a.tag) {
          case 0:
            if ((e & 4) !== 0 && (e = a.updateQueue, e = e !== null ? e.events : null, e !== null)) for (t = 0; t < e.length; t++) o = e[t], o.ref.impl = o.nextImpl;
            break;
          case 11:
          case 15:
            break;
          case 1:
            if ((e & 1024) !== 0 && s !== null) {
              e = void 0, t = a, o = s.memoizedProps, s = s.memoizedState, l = t.stateNode;
              try {
                var y = $t(t.type, o);
                e = l.getSnapshotBeforeUpdate(y, s), l.__reactInternalSnapshotBeforeUpdate = e;
              } catch (S) {
                K(t, t.return, S);
              }
            }
            break;
          case 3:
            if ((e & 1024) !== 0) {
              if (e = a.stateNode.containerInfo, t = e.nodeType, t === 9) wf(e);
              else if (t === 1) switch (e.nodeName) {
                case "HEAD":
                case "HTML":
                case "BODY":
                  wf(e);
                  break;
                default:
                  e.textContent = "";
              }
            }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          default:
            if ((e & 1024) !== 0) throw Error(v(163));
        }
        if (e = a.sibling, e !== null) {
          e.return = a.return, we = e;
          break;
        }
        we = a.return;
      }
    }
    function Om(e, a, t) {
      var l = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          qa(e, t), l & 4 && gs(5, t);
          break;
        case 1:
          if (qa(e, t), l & 4) if (e = t.stateNode, a === null) try {
            e.componentDidMount();
          } catch (i) {
            K(t, t.return, i);
          }
          else {
            var o = $t(t.type, a.memoizedProps);
            a = a.memoizedState;
            try {
              e.componentDidUpdate(o, a, e.__reactInternalSnapshotBeforeUpdate);
            } catch (i) {
              K(t, t.return, i);
            }
          }
          l & 64 && Am(t), l & 512 && Fo(t, t.return);
          break;
        case 3:
          if (qa(e, t), l & 64 && (e = t.updateQueue, e !== null)) {
            if (a = null, t.child !== null) switch (t.child.tag) {
              case 27:
              case 5:
                a = t.child.stateNode;
                break;
              case 1:
                a = t.child.stateNode;
            }
            try {
              Ep(e, a);
            } catch (i) {
              K(t, t.return, i);
            }
          }
          break;
        case 27:
          a === null && l & 4 && zm(t);
        case 26:
        case 5:
          qa(e, t), a === null && l & 4 && Dm(t), l & 512 && Fo(t, t.return);
          break;
        case 12:
          qa(e, t);
          break;
        case 31:
          qa(e, t), l & 4 && Um(e, t);
          break;
        case 13:
          qa(e, t), l & 4 && Em(e, t), l & 64 && (e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null && (t = Tb.bind(null, t), Kb(e, t))));
          break;
        case 22:
          if (l = t.memoizedState !== null || Ea, !l) {
            a = a !== null && a.memoizedState !== null || ge, o = Ea;
            var s = ge;
            Ea = l, (ge = a) && !s ? Ha(e, t, (t.subtreeFlags & 8772) !== 0) : qa(e, t), Ea = o, ge = s;
          }
          break;
        case 30:
          break;
        default:
          qa(e, t);
      }
    }
    function qm(e) {
      var a = e.alternate;
      a !== null && (e.alternate = null, qm(a)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (a = e.stateNode, a !== null && zf(a)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
    }
    var ie = null, Ne = false;
    function Oa(e, a, t) {
      for (t = t.child; t !== null; ) Hm(e, a, t), t = t.sibling;
    }
    function Hm(e, a, t) {
      if ($e && typeof $e.onCommitFiberUnmount == "function") try {
        $e.onCommitFiberUnmount(fs, t);
      } catch {
      }
      switch (t.tag) {
        case 26:
          ge || Ta(t, a), Oa(e, a, t), t.memoizedState ? t.memoizedState.count-- : t.stateNode && (t = t.stateNode, t.parentNode.removeChild(t));
          break;
        case 27:
          ge || Ta(t, a);
          var l = ie, o = Ne;
          Mt(t.type) && (ie = t.stateNode, Ne = false), Oa(e, a, t), jo(t.stateNode), ie = l, Ne = o;
          break;
        case 5:
          ge || Ta(t, a);
        case 6:
          if (l = ie, o = Ne, ie = null, Oa(e, a, t), ie = l, Ne = o, ie !== null) if (Ne) try {
            (ie.nodeType === 9 ? ie.body : ie.nodeName === "HTML" ? ie.ownerDocument.body : ie).removeChild(t.stateNode);
          } catch (s) {
            K(t, a, s);
          }
          else try {
            ie.removeChild(t.stateNode);
          } catch (s) {
            K(t, a, s);
          }
          break;
        case 18:
          ie !== null && (Ne ? (e = ie, Tc(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, t.stateNode), Zl(e)) : Tc(ie, t.stateNode));
          break;
        case 4:
          l = ie, o = Ne, ie = t.stateNode.containerInfo, Ne = true, Oa(e, a, t), ie = l, Ne = o;
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          kt(2, t, a), ge || kt(4, t, a), Oa(e, a, t);
          break;
        case 1:
          ge || (Ta(t, a), l = t.stateNode, typeof l.componentWillUnmount == "function" && Bm(t, a, l)), Oa(e, a, t);
          break;
        case 21:
          Oa(e, a, t);
          break;
        case 22:
          ge = (l = ge) || t.memoizedState !== null, Oa(e, a, t), ge = l;
          break;
        default:
          Oa(e, a, t);
      }
    }
    function Um(e, a) {
      if (a.memoizedState === null && (e = a.alternate, e !== null && (e = e.memoizedState, e !== null))) {
        e = e.dehydrated;
        try {
          Zl(e);
        } catch (t) {
          K(a, a.return, t);
        }
      }
    }
    function Em(e, a) {
      if (a.memoizedState === null && (e = a.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
        Zl(e);
      } catch (t) {
        K(a, a.return, t);
      }
    }
    function yb(e) {
      switch (e.tag) {
        case 31:
        case 13:
        case 19:
          var a = e.stateNode;
          return a === null && (a = e.stateNode = new pc()), a;
        case 22:
          return e = e.stateNode, a = e._retryCache, a === null && (a = e._retryCache = new pc()), a;
        default:
          throw Error(v(435, e.tag));
      }
    }
    function ei(e, a) {
      var t = yb(e);
      a.forEach(function(l) {
        if (!t.has(l)) {
          t.add(l);
          var o = Mb.bind(null, e, l);
          l.then(o, o);
        }
      });
    }
    function Ue(e, a) {
      var t = a.deletions;
      if (t !== null) for (var l = 0; l < t.length; l++) {
        var o = t[l], s = e, i = a, n = i;
        e: for (; n !== null; ) {
          switch (n.tag) {
            case 27:
              if (Mt(n.type)) {
                ie = n.stateNode, Ne = false;
                break e;
              }
              break;
            case 5:
              ie = n.stateNode, Ne = false;
              break e;
            case 3:
            case 4:
              ie = n.stateNode.containerInfo, Ne = true;
              break e;
          }
          n = n.return;
        }
        if (ie === null) throw Error(v(160));
        Hm(s, i, o), ie = null, Ne = false, s = o.alternate, s !== null && (s.return = null), o.return = null;
      }
      if (a.subtreeFlags & 13886) for (a = a.child; a !== null; ) Nm(a, e), a = a.sibling;
    }
    var ya = null;
    function Nm(e, a) {
      var t = e.alternate, l = e.flags;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Ue(a, e), Ee(e), l & 4 && (kt(3, e, e.return), gs(3, e), kt(5, e, e.return));
          break;
        case 1:
          Ue(a, e), Ee(e), l & 512 && (ge || t === null || Ta(t, t.return)), l & 64 && Ea && (e = e.updateQueue, e !== null && (l = e.callbacks, l !== null && (t = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = t === null ? l : t.concat(l))));
          break;
        case 26:
          var o = ya;
          if (Ue(a, e), Ee(e), l & 512 && (ge || t === null || Ta(t, t.return)), l & 4) {
            var s = t !== null ? t.memoizedState : null;
            if (l = e.memoizedState, t === null) if (l === null) if (e.stateNode === null) {
              e: {
                l = e.type, t = e.memoizedProps, o = o.ownerDocument || o;
                a: switch (l) {
                  case "title":
                    s = o.getElementsByTagName("title")[0], (!s || s[cs] || s[Ie] || s.namespaceURI === "http://www.w3.org/2000/svg" || s.hasAttribute("itemprop")) && (s = o.createElement(l), o.head.insertBefore(s, o.querySelector("head > title"))), Ae(s, l, t), s[Ie] = e, Se(s), l = s;
                    break e;
                  case "link":
                    var i = Oc("link", "href", o).get(l + (t.href || ""));
                    if (i) {
                      for (var n = 0; n < i.length; n++) if (s = i[n], s.getAttribute("href") === (t.href == null || t.href === "" ? null : t.href) && s.getAttribute("rel") === (t.rel == null ? null : t.rel) && s.getAttribute("title") === (t.title == null ? null : t.title) && s.getAttribute("crossorigin") === (t.crossOrigin == null ? null : t.crossOrigin)) {
                        i.splice(n, 1);
                        break a;
                      }
                    }
                    s = o.createElement(l), Ae(s, l, t), o.head.appendChild(s);
                    break;
                  case "meta":
                    if (i = Oc("meta", "content", o).get(l + (t.content || ""))) {
                      for (n = 0; n < i.length; n++) if (s = i[n], s.getAttribute("content") === (t.content == null ? null : "" + t.content) && s.getAttribute("name") === (t.name == null ? null : t.name) && s.getAttribute("property") === (t.property == null ? null : t.property) && s.getAttribute("http-equiv") === (t.httpEquiv == null ? null : t.httpEquiv) && s.getAttribute("charset") === (t.charSet == null ? null : t.charSet)) {
                        i.splice(n, 1);
                        break a;
                      }
                    }
                    s = o.createElement(l), Ae(s, l, t), o.head.appendChild(s);
                    break;
                  default:
                    throw Error(v(468, l));
                }
                s[Ie] = e, Se(s), l = s;
              }
              e.stateNode = l;
            } else qc(o, e.type, e.stateNode);
            else e.stateNode = zc(o, l, e.memoizedProps);
            else s !== l ? (s === null ? t.stateNode !== null && (t = t.stateNode, t.parentNode.removeChild(t)) : s.count--, l === null ? qc(o, e.type, e.stateNode) : zc(o, l, e.memoizedProps)) : l === null && e.stateNode !== null && wu(e, e.memoizedProps, t.memoizedProps);
          }
          break;
        case 27:
          Ue(a, e), Ee(e), l & 512 && (ge || t === null || Ta(t, t.return)), t !== null && l & 4 && wu(e, e.memoizedProps, t.memoizedProps);
          break;
        case 5:
          if (Ue(a, e), Ee(e), l & 512 && (ge || t === null || Ta(t, t.return)), e.flags & 32) {
            o = e.stateNode;
            try {
              Pl(o, "");
            } catch (y) {
              K(e, e.return, y);
            }
          }
          l & 4 && e.stateNode != null && (o = e.memoizedProps, wu(e, o, t !== null ? t.memoizedProps : o)), l & 1024 && (Cu = true);
          break;
        case 6:
          if (Ue(a, e), Ee(e), l & 4) {
            if (e.stateNode === null) throw Error(v(162));
            l = e.memoizedProps, t = e.stateNode;
            try {
              t.nodeValue = l;
            } catch (y) {
              K(e, e.return, y);
            }
          }
          break;
        case 3:
          if (bi = null, o = ya, ya = Vi(a.containerInfo), Ue(a, e), ya = o, Ee(e), l & 4 && t !== null && t.memoizedState.isDehydrated) try {
            Zl(a.containerInfo);
          } catch (y) {
            K(e, e.return, y);
          }
          Cu && (Cu = false, Gm(e));
          break;
        case 4:
          l = ya, ya = Vi(e.stateNode.containerInfo), Ue(a, e), Ee(e), ya = l;
          break;
        case 12:
          Ue(a, e), Ee(e);
          break;
        case 31:
          Ue(a, e), Ee(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, ei(e, l)));
          break;
        case 13:
          Ue(a, e), Ee(e), e.child.flags & 8192 && e.memoizedState !== null != (t !== null && t.memoizedState !== null) && (un = We()), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, ei(e, l)));
          break;
        case 22:
          o = e.memoizedState !== null;
          var u = t !== null && t.memoizedState !== null, r = Ea, _ = ge;
          if (Ea = r || o, ge = _ || u, Ue(a, e), ge = _, Ea = r, Ee(e), l & 8192) e: for (a = e.stateNode, a._visibility = o ? a._visibility & -2 : a._visibility | 1, o && (t === null || u || Ea || ge || Ft(e)), t = null, a = e; ; ) {
            if (a.tag === 5 || a.tag === 26) {
              if (t === null) {
                u = t = a;
                try {
                  if (s = u.stateNode, o) i = s.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none";
                  else {
                    n = u.stateNode;
                    var x = u.memoizedProps.style, m = x != null && x.hasOwnProperty("display") ? x.display : null;
                    n.style.display = m == null || typeof m == "boolean" ? "" : ("" + m).trim();
                  }
                } catch (y) {
                  K(u, u.return, y);
                }
              }
            } else if (a.tag === 6) {
              if (t === null) {
                u = a;
                try {
                  u.stateNode.nodeValue = o ? "" : u.memoizedProps;
                } catch (y) {
                  K(u, u.return, y);
                }
              }
            } else if (a.tag === 18) {
              if (t === null) {
                u = a;
                try {
                  var d = u.stateNode;
                  o ? Mc(d, true) : Mc(u.stateNode, false);
                } catch (y) {
                  K(u, u.return, y);
                }
              }
            } else if ((a.tag !== 22 && a.tag !== 23 || a.memoizedState === null || a === e) && a.child !== null) {
              a.child.return = a, a = a.child;
              continue;
            }
            if (a === e) break e;
            for (; a.sibling === null; ) {
              if (a.return === null || a.return === e) break e;
              t === a && (t = null), a = a.return;
            }
            t === a && (t = null), a.sibling.return = a.return, a = a.sibling;
          }
          l & 4 && (l = e.updateQueue, l !== null && (t = l.retryQueue, t !== null && (l.retryQueue = null, ei(e, t))));
          break;
        case 19:
          Ue(a, e), Ee(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, ei(e, l)));
          break;
        case 30:
          break;
        case 21:
          break;
        default:
          Ue(a, e), Ee(e);
      }
    }
    function Ee(e) {
      var a = e.flags;
      if (a & 2) {
        try {
          for (var t, l = e.return; l !== null; ) {
            if (Rm(l)) {
              t = l;
              break;
            }
            l = l.return;
          }
          if (t == null) throw Error(v(160));
          switch (t.tag) {
            case 27:
              var o = t.stateNode, s = Su(e);
              Hi(e, s, o);
              break;
            case 5:
              var i = t.stateNode;
              t.flags & 32 && (Pl(i, ""), t.flags &= -33);
              var n = Su(e);
              Hi(e, n, i);
              break;
            case 3:
            case 4:
              var u = t.stateNode.containerInfo, r = Su(e);
              pf(e, r, u);
              break;
            default:
              throw Error(v(161));
          }
        } catch (_) {
          K(e, e.return, _);
        }
        e.flags &= -3;
      }
      a & 4096 && (e.flags &= -4097);
    }
    function Gm(e) {
      if (e.subtreeFlags & 1024) for (e = e.child; e !== null; ) {
        var a = e;
        Gm(a), a.tag === 5 && a.flags & 1024 && a.stateNode.reset(), e = e.sibling;
      }
    }
    function qa(e, a) {
      if (a.subtreeFlags & 8772) for (a = a.child; a !== null; ) Om(e, a.alternate, a), a = a.sibling;
    }
    function Ft(e) {
      for (e = e.child; e !== null; ) {
        var a = e;
        switch (a.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            kt(4, a, a.return), Ft(a);
            break;
          case 1:
            Ta(a, a.return);
            var t = a.stateNode;
            typeof t.componentWillUnmount == "function" && Bm(a, a.return, t), Ft(a);
            break;
          case 27:
            jo(a.stateNode);
          case 26:
          case 5:
            Ta(a, a.return), Ft(a);
            break;
          case 22:
            a.memoizedState === null && Ft(a);
            break;
          case 30:
            Ft(a);
            break;
          default:
            Ft(a);
        }
        e = e.sibling;
      }
    }
    function Ha(e, a, t) {
      for (t = t && (a.subtreeFlags & 8772) !== 0, a = a.child; a !== null; ) {
        var l = a.alternate, o = e, s = a, i = s.flags;
        switch (s.tag) {
          case 0:
          case 11:
          case 15:
            Ha(o, s, t), gs(4, s);
            break;
          case 1:
            if (Ha(o, s, t), l = s, o = l.stateNode, typeof o.componentDidMount == "function") try {
              o.componentDidMount();
            } catch (r) {
              K(l, l.return, r);
            }
            if (l = s, o = l.updateQueue, o !== null) {
              var n = l.stateNode;
              try {
                var u = o.shared.hiddenCallbacks;
                if (u !== null) for (o.shared.hiddenCallbacks = null, o = 0; o < u.length; o++) Up(u[o], n);
              } catch (r) {
                K(l, l.return, r);
              }
            }
            t && i & 64 && Am(s), Fo(s, s.return);
            break;
          case 27:
            zm(s);
          case 26:
          case 5:
            Ha(o, s, t), t && l === null && i & 4 && Dm(s), Fo(s, s.return);
            break;
          case 12:
            Ha(o, s, t);
            break;
          case 31:
            Ha(o, s, t), t && i & 4 && Um(o, s);
            break;
          case 13:
            Ha(o, s, t), t && i & 4 && Em(o, s);
            break;
          case 22:
            s.memoizedState === null && Ha(o, s, t), Fo(s, s.return);
            break;
          case 30:
            break;
          default:
            Ha(o, s, t);
        }
        a = a.sibling;
      }
    }
    function cr(e, a) {
      var t = null;
      e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (t = e.memoizedState.cachePool.pool), e = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (e = a.memoizedState.cachePool.pool), e !== t && (e != null && e.refCount++, t != null && ms(t));
    }
    function pr(e, a) {
      e = null, a.alternate !== null && (e = a.alternate.memoizedState.cache), a = a.memoizedState.cache, a !== e && (a.refCount++, e != null && ms(e));
    }
    function xa(e, a, t, l) {
      if (a.subtreeFlags & 10256) for (a = a.child; a !== null; ) Pm(e, a, t, l), a = a.sibling;
    }
    function Pm(e, a, t, l) {
      var o = a.flags;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          xa(e, a, t, l), o & 2048 && gs(9, a);
          break;
        case 1:
          xa(e, a, t, l);
          break;
        case 3:
          xa(e, a, t, l), o & 2048 && (e = null, a.alternate !== null && (e = a.alternate.memoizedState.cache), a = a.memoizedState.cache, a !== e && (a.refCount++, e != null && ms(e)));
          break;
        case 12:
          if (o & 2048) {
            xa(e, a, t, l), e = a.stateNode;
            try {
              var s = a.memoizedProps, i = s.id, n = s.onPostCommit;
              typeof n == "function" && n(i, a.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
            } catch (u) {
              K(a, a.return, u);
            }
          } else xa(e, a, t, l);
          break;
        case 31:
          xa(e, a, t, l);
          break;
        case 13:
          xa(e, a, t, l);
          break;
        case 23:
          break;
        case 22:
          s = a.stateNode, i = a.alternate, a.memoizedState !== null ? s._visibility & 2 ? xa(e, a, t, l) : Xo(e, a) : s._visibility & 2 ? xa(e, a, t, l) : (s._visibility |= 2, xl(e, a, t, l, (a.subtreeFlags & 10256) !== 0 || false)), o & 2048 && cr(i, a);
          break;
        case 24:
          xa(e, a, t, l), o & 2048 && pr(a.alternate, a);
          break;
        default:
          xa(e, a, t, l);
      }
    }
    function xl(e, a, t, l, o) {
      for (o = o && ((a.subtreeFlags & 10256) !== 0 || false), a = a.child; a !== null; ) {
        var s = e, i = a, n = t, u = l, r = i.flags;
        switch (i.tag) {
          case 0:
          case 11:
          case 15:
            xl(s, i, n, u, o), gs(8, i);
            break;
          case 23:
            break;
          case 22:
            var _ = i.stateNode;
            i.memoizedState !== null ? _._visibility & 2 ? xl(s, i, n, u, o) : Xo(s, i) : (_._visibility |= 2, xl(s, i, n, u, o)), o && r & 2048 && cr(i.alternate, i);
            break;
          case 24:
            xl(s, i, n, u, o), o && r & 2048 && pr(i.alternate, i);
            break;
          default:
            xl(s, i, n, u, o);
        }
        a = a.sibling;
      }
    }
    function Xo(e, a) {
      if (a.subtreeFlags & 10256) for (a = a.child; a !== null; ) {
        var t = e, l = a, o = l.flags;
        switch (l.tag) {
          case 22:
            Xo(t, l), o & 2048 && cr(l.alternate, l);
            break;
          case 24:
            Xo(t, l), o & 2048 && pr(l.alternate, l);
            break;
          default:
            Xo(t, l);
        }
        a = a.sibling;
      }
    }
    var zo = 8192;
    function bl(e, a, t) {
      if (e.subtreeFlags & zo) for (e = e.child; e !== null; ) Fm(e, a, t), e = e.sibling;
    }
    function Fm(e, a, t) {
      switch (e.tag) {
        case 26:
          bl(e, a, t), e.flags & zo && e.memoizedState !== null && ox(t, ya, e.memoizedState, e.memoizedProps);
          break;
        case 5:
          bl(e, a, t);
          break;
        case 3:
        case 4:
          var l = ya;
          ya = Vi(e.stateNode.containerInfo), bl(e, a, t), ya = l;
          break;
        case 22:
          e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = zo, zo = 16777216, bl(e, a, t), zo = l) : bl(e, a, t));
          break;
        default:
          bl(e, a, t);
      }
    }
    function Xm(e) {
      var a = e.alternate;
      if (a !== null && (e = a.child, e !== null)) {
        a.child = null;
        do
          a = e.sibling, e.sibling = null, e = a;
        while (e !== null);
      }
    }
    function Io(e) {
      var a = e.deletions;
      if ((e.flags & 16) !== 0) {
        if (a !== null) for (var t = 0; t < a.length; t++) {
          var l = a[t];
          we = l, Km(l, e);
        }
        Xm(e);
      }
      if (e.subtreeFlags & 10256) for (e = e.child; e !== null; ) Vm(e), e = e.sibling;
    }
    function Vm(e) {
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          Io(e), e.flags & 2048 && kt(9, e, e.return);
          break;
        case 3:
          Io(e);
          break;
        case 12:
          Io(e);
          break;
        case 22:
          var a = e.stateNode;
          e.memoizedState !== null && a._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (a._visibility &= -3, gi(e)) : Io(e);
          break;
        default:
          Io(e);
      }
    }
    function gi(e) {
      var a = e.deletions;
      if ((e.flags & 16) !== 0) {
        if (a !== null) for (var t = 0; t < a.length; t++) {
          var l = a[t];
          we = l, Km(l, e);
        }
        Xm(e);
      }
      for (e = e.child; e !== null; ) {
        switch (a = e, a.tag) {
          case 0:
          case 11:
          case 15:
            kt(8, a, a.return), gi(a);
            break;
          case 22:
            t = a.stateNode, t._visibility & 2 && (t._visibility &= -3, gi(a));
            break;
          default:
            gi(a);
        }
        e = e.sibling;
      }
    }
    function Km(e, a) {
      for (; we !== null; ) {
        var t = we;
        switch (t.tag) {
          case 0:
          case 11:
          case 15:
            kt(8, t, a);
            break;
          case 23:
          case 22:
            if (t.memoizedState !== null && t.memoizedState.cachePool !== null) {
              var l = t.memoizedState.cachePool.pool;
              l != null && l.refCount++;
            }
            break;
          case 24:
            ms(t.memoizedState.cache);
        }
        if (l = t.child, l !== null) l.return = t, we = l;
        else e: for (t = e; we !== null; ) {
          l = we;
          var o = l.sibling, s = l.return;
          if (qm(l), l === t) {
            we = null;
            break e;
          }
          if (o !== null) {
            o.return = s, we = o;
            break e;
          }
          we = s;
        }
      }
    }
    var Lb = { getCacheForType: function(e) {
      var a = Me(_e), t = a.data.get(e);
      return t === void 0 && (t = e(), a.data.set(e, t)), t;
    }, cacheSignal: function() {
      return Me(_e).controller.signal;
    } }, vb = typeof WeakMap == "function" ? WeakMap : Map, F = 0, J = null, U = null, E = 0, V = 0, Ye = null, ct = false, ao = false, mr = false, Za = 0, re = 0, It = 0, Yt = 0, hr = 0, Je = 0, Kl = 0, Vo = null, Ge = null, mf = false, un = 0, jm = 0, Ui = 1 / 0, Ei = null, xt = null, xe = 0, yt = null, jl = null, Va = 0, hf = 0, gf = null, Ym = null, Ko = 0, _f = null;
    function aa() {
      return (F & 2) !== 0 && E !== 0 ? E & -E : A.T !== null ? _r() : lp();
    }
    function Qm() {
      if (Je === 0) if ((E & 536870912) === 0 || N) {
        var e = Xs;
        Xs <<= 1, (Xs & 3932160) === 0 && (Xs = 262144), Je = e;
      } else Je = 536870912;
      return e = la.current, e !== null && (e.flags |= 32), Je;
    }
    function Pe(e, a, t) {
      (e === J && (V === 2 || V === 9) || e.cancelPendingCommit !== null) && (Yl(e, 0), pt(e, E, Je, false)), ds(e, t), ((F & 2) === 0 || e !== J) && (e === J && ((F & 2) === 0 && (Yt |= t), re === 4 && pt(e, E, Je, false)), Ba(e));
    }
    function Zm(e, a, t) {
      if ((F & 6) !== 0) throw Error(v(327));
      var l = !t && (a & 127) === 0 && (a & e.expiredLanes) === 0 || rs(e, a), o = l ? Cb(e, a) : ku(e, a, true), s = l;
      do {
        if (o === 0) {
          ao && !l && pt(e, a, 0, false);
          break;
        } else {
          if (t = e.current.alternate, s && !wb(t)) {
            o = ku(e, a, false), s = false;
            continue;
          }
          if (o === 2) {
            if (s = a, e.errorRecoveryDisabledLanes & s) var i = 0;
            else i = e.pendingLanes & -536870913, i = i !== 0 ? i : i & 536870912 ? 536870912 : 0;
            if (i !== 0) {
              a = i;
              e: {
                var n = e;
                o = Vo;
                var u = n.current.memoizedState.isDehydrated;
                if (u && (Yl(n, i).flags |= 256), i = ku(n, i, false), i !== 2) {
                  if (mr && !u) {
                    n.errorRecoveryDisabledLanes |= s, Yt |= s, o = 4;
                    break e;
                  }
                  s = Ge, Ge = o, s !== null && (Ge === null ? Ge = s : Ge.push.apply(Ge, s));
                }
                o = i;
              }
              if (s = false, o !== 2) continue;
            }
          }
          if (o === 1) {
            Yl(e, 0), pt(e, a, 0, true);
            break;
          }
          e: {
            switch (l = e, s = o, s) {
              case 0:
              case 1:
                throw Error(v(345));
              case 4:
                if ((a & 4194048) !== a) break;
              case 6:
                pt(l, a, Je, !ct);
                break e;
              case 2:
                Ge = null;
                break;
              case 3:
              case 5:
                break;
              default:
                throw Error(v(329));
            }
            if ((a & 62914560) === a && (o = un + 300 - We(), 10 < o)) {
              if (pt(l, a, Je, !ct), Zi(l, 0, true) !== 0) break e;
              Va = a, l.timeoutHandle = gh(mc.bind(null, l, t, Ge, Ei, mf, a, Je, Yt, Kl, ct, s, "Throttled", -0, 0), o);
              break e;
            }
            mc(l, t, Ge, Ei, mf, a, Je, Yt, Kl, ct, s, null, -0, 0);
          }
        }
        break;
      } while (true);
      Ba(e);
    }
    function mc(e, a, t, l, o, s, i, n, u, r, _, x, m, d) {
      if (e.timeoutHandle = -1, x = a.subtreeFlags, x & 8192 || (x & 16785408) === 16785408) {
        x = { stylesheets: null, count: 0, imgCount: 0, imgBytes: 0, suspenseyImages: [], waitingForImages: true, waitingForViewTransition: false, unsuspend: Ga }, Fm(a, s, x);
        var y = (s & 62914560) === s ? un - We() : (s & 4194048) === s ? jm - We() : 0;
        if (y = sx(x, y), y !== null) {
          Va = s, e.cancelPendingCommit = y(gc.bind(null, e, a, s, t, l, o, i, n, u, _, x, null, m, d)), pt(e, s, i, !r);
          return;
        }
      }
      gc(e, a, s, t, l, o, i, n, u);
    }
    function wb(e) {
      for (var a = e; ; ) {
        var t = a.tag;
        if ((t === 0 || t === 11 || t === 15) && a.flags & 16384 && (t = a.updateQueue, t !== null && (t = t.stores, t !== null))) for (var l = 0; l < t.length; l++) {
          var o = t[l], s = o.getSnapshot;
          o = o.value;
          try {
            if (!ta(s(), o)) return false;
          } catch {
            return false;
          }
        }
        if (t = a.child, a.subtreeFlags & 16384 && t !== null) t.return = a, a = t;
        else {
          if (a === e) break;
          for (; a.sibling === null; ) {
            if (a.return === null || a.return === e) return true;
            a = a.return;
          }
          a.sibling.return = a.return, a = a.sibling;
        }
      }
      return true;
    }
    function pt(e, a, t, l) {
      a &= ~hr, a &= ~Yt, e.suspendedLanes |= a, e.pingedLanes &= ~a, l && (e.warmLanes |= a), l = e.expirationTimes;
      for (var o = a; 0 < o; ) {
        var s = 31 - ea(o), i = 1 << s;
        l[s] = -1, o &= ~i;
      }
      t !== 0 && ep(e, t, a);
    }
    function fn() {
      return (F & 6) === 0 ? (_s(0, false), false) : true;
    }
    function gr() {
      if (U !== null) {
        if (V === 0) var e = U.return;
        else e = U, Pa = ol = null, ar(e), Hl = null, es = 0, e = U;
        for (; e !== null; ) Mm(e.alternate, e), e = e.return;
        U = null;
      }
    }
    function Yl(e, a) {
      var t = e.timeoutHandle;
      t !== -1 && (e.timeoutHandle = -1, Gb(t)), t = e.cancelPendingCommit, t !== null && (e.cancelPendingCommit = null, t()), Va = 0, gr(), J = e, U = t = Fa(e.current, null), E = a, V = 0, Ye = null, ct = false, ao = rs(e, a), mr = false, Kl = Je = hr = Yt = It = re = 0, Ge = Vo = null, mf = false, (a & 8) !== 0 && (a |= a & 32);
      var l = e.entangledLanes;
      if (l !== 0) for (e = e.entanglements, l &= a; 0 < l; ) {
        var o = 31 - ea(l), s = 1 << o;
        a |= e[o], l &= ~s;
      }
      return Za = a, en(), t;
    }
    function Jm(e, a) {
      R = null, A.H = ts, a === eo || a === tn ? (a = Kd(), V = 3) : a === Yf ? (a = Kd(), V = 4) : V = a === rr ? 8 : a !== null && typeof a == "object" && typeof a.then == "function" ? 6 : 1, Ye = a, U === null && (re = 1, Oi(e, da(a, e.current)));
    }
    function Wm() {
      var e = la.current;
      return e === null ? true : (E & 4194048) === E ? pa === null : (E & 62914560) === E || (E & 536870912) !== 0 ? e === pa : false;
    }
    function $m() {
      var e = A.H;
      return A.H = ts, e === null ? ts : e;
    }
    function eh() {
      var e = A.A;
      return A.A = Lb, e;
    }
    function Ni() {
      re = 4, ct || (E & 4194048) !== E && la.current !== null || (ao = true), (It & 134217727) === 0 && (Yt & 134217727) === 0 || J === null || pt(J, E, Je, false);
    }
    function ku(e, a, t) {
      var l = F;
      F |= 2;
      var o = $m(), s = eh();
      (J !== e || E !== a) && (Ei = null, Yl(e, a)), a = false;
      var i = re;
      e: do
        try {
          if (V !== 0 && U !== null) {
            var n = U, u = Ye;
            switch (V) {
              case 8:
                gr(), i = 6;
                break e;
              case 3:
              case 2:
              case 9:
              case 6:
                la.current === null && (a = true);
                var r = V;
                if (V = 0, Ye = null, Dl(e, n, u, r), t && ao) {
                  i = 0;
                  break e;
                }
                break;
              default:
                r = V, V = 0, Ye = null, Dl(e, n, u, r);
            }
          }
          Sb(), i = re;
          break;
        } catch (_) {
          Jm(e, _);
        }
      while (true);
      return a && e.shellSuspendCounter++, Pa = ol = null, F = l, A.H = o, A.A = s, U === null && (J = null, E = 0, en()), i;
    }
    function Sb() {
      for (; U !== null; ) ah(U);
    }
    function Cb(e, a) {
      var t = F;
      F |= 2;
      var l = $m(), o = eh();
      J !== e || E !== a ? (Ei = null, Ui = We() + 500, Yl(e, a)) : ao = rs(e, a);
      e: do
        try {
          if (V !== 0 && U !== null) {
            a = U;
            var s = Ye;
            a: switch (V) {
              case 1:
                V = 0, Ye = null, Dl(e, a, s, 1);
                break;
              case 2:
              case 9:
                if (Vd(s)) {
                  V = 0, Ye = null, hc(a);
                  break;
                }
                a = function() {
                  V !== 2 && V !== 9 || J !== e || (V = 7), Ba(e);
                }, s.then(a, a);
                break e;
              case 3:
                V = 7;
                break e;
              case 4:
                V = 5;
                break e;
              case 7:
                Vd(s) ? (V = 0, Ye = null, hc(a)) : (V = 0, Ye = null, Dl(e, a, s, 7));
                break;
              case 5:
                var i = null;
                switch (U.tag) {
                  case 26:
                    i = U.memoizedState;
                  case 5:
                  case 27:
                    var n = U;
                    if (i ? Lh(i) : n.stateNode.complete) {
                      V = 0, Ye = null;
                      var u = n.sibling;
                      if (u !== null) U = u;
                      else {
                        var r = n.return;
                        r !== null ? (U = r, rn(r)) : U = null;
                      }
                      break a;
                    }
                }
                V = 0, Ye = null, Dl(e, a, s, 5);
                break;
              case 6:
                V = 0, Ye = null, Dl(e, a, s, 6);
                break;
              case 8:
                gr(), re = 6;
                break e;
              default:
                throw Error(v(462));
            }
          }
          kb();
          break;
        } catch (_) {
          Jm(e, _);
        }
      while (true);
      return Pa = ol = null, A.H = l, A.A = o, F = t, U !== null ? 0 : (J = null, E = 0, en(), re);
    }
    function kb() {
      for (; U !== null && !Qg(); ) ah(U);
    }
    function ah(e) {
      var a = Tm(e.alternate, e, Za);
      e.memoizedProps = e.pendingProps, a === null ? rn(e) : U = a;
    }
    function hc(e) {
      var a = e, t = a.alternate;
      switch (a.tag) {
        case 15:
        case 0:
          a = uc(t, a, a.pendingProps, a.type, void 0, E);
          break;
        case 11:
          a = uc(t, a, a.pendingProps, a.type.render, a.ref, E);
          break;
        case 5:
          ar(a);
        default:
          Mm(t, a), a = U = Mp(a, Za), a = Tm(t, a, Za);
      }
      e.memoizedProps = e.pendingProps, a === null ? rn(e) : U = a;
    }
    function Dl(e, a, t, l) {
      Pa = ol = null, ar(a), Hl = null, es = 0;
      var o = a.return;
      try {
        if (mb(e, o, a, t, E)) {
          re = 1, Oi(e, da(t, e.current)), U = null;
          return;
        }
      } catch (s) {
        if (o !== null) throw U = o, s;
        re = 1, Oi(e, da(t, e.current)), U = null;
        return;
      }
      a.flags & 32768 ? (N || l === 1 ? e = true : ao || (E & 536870912) !== 0 ? e = false : (ct = e = true, (l === 2 || l === 9 || l === 3 || l === 6) && (l = la.current, l !== null && l.tag === 13 && (l.flags |= 16384))), th(a, e)) : rn(a);
    }
    function rn(e) {
      var a = e;
      do {
        if ((a.flags & 32768) !== 0) {
          th(a, ct);
          return;
        }
        e = a.return;
        var t = _b(a.alternate, a, Za);
        if (t !== null) {
          U = t;
          return;
        }
        if (a = a.sibling, a !== null) {
          U = a;
          return;
        }
        U = a = e;
      } while (a !== null);
      re === 0 && (re = 5);
    }
    function th(e, a) {
      do {
        var t = bb(e.alternate, e);
        if (t !== null) {
          t.flags &= 32767, U = t;
          return;
        }
        if (t = e.return, t !== null && (t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null), !a && (e = e.sibling, e !== null)) {
          U = e;
          return;
        }
        U = e = t;
      } while (e !== null);
      re = 6, U = null;
    }
    function gc(e, a, t, l, o, s, i, n, u) {
      e.cancelPendingCommit = null;
      do
        dn();
      while (xe !== 0);
      if ((F & 6) !== 0) throw Error(v(327));
      if (a !== null) {
        if (a === e.current) throw Error(v(177));
        if (s = a.lanes | a.childLanes, s |= Gf, s_(e, t, s, i, n, u), e === J && (U = J = null, E = 0), jl = a, yt = e, Va = t, hf = s, gf = o, Ym = l, (a.subtreeFlags & 10256) !== 0 || (a.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Ab(Si, function() {
          return nh(), null;
        })) : (e.callbackNode = null, e.callbackPriority = 0), l = (a.flags & 13878) !== 0, (a.subtreeFlags & 13878) !== 0 || l) {
          l = A.T, A.T = null, o = X.p, X.p = 2, i = F, F |= 4;
          try {
            xb(e, a, t);
          } finally {
            F = i, X.p = o, A.T = l;
          }
        }
        xe = 1, lh(), oh(), sh();
      }
    }
    function lh() {
      if (xe === 1) {
        xe = 0;
        var e = yt, a = jl, t = (a.flags & 13878) !== 0;
        if ((a.subtreeFlags & 13878) !== 0 || t) {
          t = A.T, A.T = null;
          var l = X.p;
          X.p = 2;
          var o = F;
          F |= 4;
          try {
            Nm(a, e);
            var s = Lf, i = Lp(e.containerInfo), n = s.focusedElem, u = s.selectionRange;
            if (i !== n && n && n.ownerDocument && yp(n.ownerDocument.documentElement, n)) {
              if (u !== null && Nf(n)) {
                var r = u.start, _ = u.end;
                if (_ === void 0 && (_ = r), "selectionStart" in n) n.selectionStart = r, n.selectionEnd = Math.min(_, n.value.length);
                else {
                  var x = n.ownerDocument || document, m = x && x.defaultView || window;
                  if (m.getSelection) {
                    var d = m.getSelection(), y = n.textContent.length, S = Math.min(u.start, y), M = u.end === void 0 ? S : Math.min(u.end, y);
                    !d.extend && S > M && (i = M, M = S, S = i);
                    var g = Ud(n, S), c = Ud(n, M);
                    if (g && c && (d.rangeCount !== 1 || d.anchorNode !== g.node || d.anchorOffset !== g.offset || d.focusNode !== c.node || d.focusOffset !== c.offset)) {
                      var h = x.createRange();
                      h.setStart(g.node, g.offset), d.removeAllRanges(), S > M ? (d.addRange(h), d.extend(c.node, c.offset)) : (h.setEnd(c.node, c.offset), d.addRange(h));
                    }
                  }
                }
              }
              for (x = [], d = n; d = d.parentNode; ) d.nodeType === 1 && x.push({ element: d, left: d.scrollLeft, top: d.scrollTop });
              for (typeof n.focus == "function" && n.focus(), n = 0; n < x.length; n++) {
                var b = x[n];
                b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
              }
            }
            Yi = !!yf, Lf = yf = null;
          } finally {
            F = o, X.p = l, A.T = t;
          }
        }
        e.current = a, xe = 2;
      }
    }
    function oh() {
      if (xe === 2) {
        xe = 0;
        var e = yt, a = jl, t = (a.flags & 8772) !== 0;
        if ((a.subtreeFlags & 8772) !== 0 || t) {
          t = A.T, A.T = null;
          var l = X.p;
          X.p = 2;
          var o = F;
          F |= 4;
          try {
            Om(e, a.alternate, a);
          } finally {
            F = o, X.p = l, A.T = t;
          }
        }
        xe = 3;
      }
    }
    function sh() {
      if (xe === 4 || xe === 3) {
        xe = 0, Zg();
        var e = yt, a = jl, t = Va, l = Ym;
        (a.subtreeFlags & 10256) !== 0 || (a.flags & 10256) !== 0 ? xe = 5 : (xe = 0, jl = yt = null, ih(e, e.pendingLanes));
        var o = e.pendingLanes;
        if (o === 0 && (xt = null), Rf(t), a = a.stateNode, $e && typeof $e.onCommitFiberRoot == "function") try {
          $e.onCommitFiberRoot(fs, a, void 0, (a.current.flags & 128) === 128);
        } catch {
        }
        if (l !== null) {
          a = A.T, o = X.p, X.p = 2, A.T = null;
          try {
            for (var s = e.onRecoverableError, i = 0; i < l.length; i++) {
              var n = l[i];
              s(n.value, { componentStack: n.stack });
            }
          } finally {
            A.T = a, X.p = o;
          }
        }
        (Va & 3) !== 0 && dn(), Ba(e), o = e.pendingLanes, (t & 261930) !== 0 && (o & 42) !== 0 ? e === _f ? Ko++ : (Ko = 0, _f = e) : Ko = 0, _s(0, false);
      }
    }
    function ih(e, a) {
      (e.pooledCacheLanes &= a) === 0 && (a = e.pooledCache, a != null && (e.pooledCache = null, ms(a)));
    }
    function dn() {
      return lh(), oh(), sh(), nh();
    }
    function nh() {
      if (xe !== 5) return false;
      var e = yt, a = hf;
      hf = 0;
      var t = Rf(Va), l = A.T, o = X.p;
      try {
        X.p = 32 > t ? 32 : t, A.T = null, t = gf, gf = null;
        var s = yt, i = Va;
        if (xe = 0, jl = yt = null, Va = 0, (F & 6) !== 0) throw Error(v(331));
        var n = F;
        if (F |= 4, Vm(s.current), Pm(s, s.current, i, t), F = n, _s(0, false), $e && typeof $e.onPostCommitFiberRoot == "function") try {
          $e.onPostCommitFiberRoot(fs, s);
        } catch {
        }
        return true;
      } finally {
        X.p = o, A.T = l, ih(e, a);
      }
    }
    function _c(e, a, t) {
      a = da(t, a), a = rf(e.stateNode, a, 2), e = bt(e, a, 2), e !== null && (ds(e, 2), Ba(e));
    }
    function K(e, a, t) {
      if (e.tag === 3) _c(e, e, t);
      else for (; a !== null; ) {
        if (a.tag === 3) {
          _c(a, e, t);
          break;
        } else if (a.tag === 1) {
          var l = a.stateNode;
          if (typeof a.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (xt === null || !xt.has(l))) {
            e = da(t, e), t = vm(2), l = bt(a, t, 2), l !== null && (wm(t, l, a, e), ds(l, 2), Ba(l));
            break;
          }
        }
        a = a.return;
      }
    }
    function Iu(e, a, t) {
      var l = e.pingCache;
      if (l === null) {
        l = e.pingCache = new vb();
        var o = /* @__PURE__ */ new Set();
        l.set(a, o);
      } else o = l.get(a), o === void 0 && (o = /* @__PURE__ */ new Set(), l.set(a, o));
      o.has(t) || (mr = true, o.add(t), e = Ib.bind(null, e, a, t), a.then(e, e));
    }
    function Ib(e, a, t) {
      var l = e.pingCache;
      l !== null && l.delete(a), e.pingedLanes |= e.suspendedLanes & t, e.warmLanes &= ~t, J === e && (E & t) === t && (re === 4 || re === 3 && (E & 62914560) === E && 300 > We() - un ? (F & 2) === 0 && Yl(e, 0) : hr |= t, Kl === E && (Kl = 0)), Ba(e);
    }
    function uh(e, a) {
      a === 0 && (a = $c()), e = ll(e, a), e !== null && (ds(e, a), Ba(e));
    }
    function Tb(e) {
      var a = e.memoizedState, t = 0;
      a !== null && (t = a.retryLane), uh(e, t);
    }
    function Mb(e, a) {
      var t = 0;
      switch (e.tag) {
        case 31:
        case 13:
          var l = e.stateNode, o = e.memoizedState;
          o !== null && (t = o.retryLane);
          break;
        case 19:
          l = e.stateNode;
          break;
        case 22:
          l = e.stateNode._retryCache;
          break;
        default:
          throw Error(v(314));
      }
      l !== null && l.delete(a), uh(e, t);
    }
    function Ab(e, a) {
      return Bf(e, a);
    }
    var Gi = null, yl = null, bf = false, Pi = false, Tu = false, mt = 0;
    function Ba(e) {
      e !== yl && e.next === null && (yl === null ? Gi = yl = e : yl = yl.next = e), Pi = true, bf || (bf = true, Db());
    }
    function _s(e, a) {
      if (!Tu && Pi) {
        Tu = true;
        do
          for (var t = false, l = Gi; l !== null; ) {
            if (!a) if (e !== 0) {
              var o = l.pendingLanes;
              if (o === 0) var s = 0;
              else {
                var i = l.suspendedLanes, n = l.pingedLanes;
                s = (1 << 31 - ea(42 | e) + 1) - 1, s &= o & ~(i & ~n), s = s & 201326741 ? s & 201326741 | 1 : s ? s | 2 : 0;
              }
              s !== 0 && (t = true, bc(l, s));
            } else s = E, s = Zi(l, l === J ? s : 0, l.cancelPendingCommit !== null || l.timeoutHandle !== -1), (s & 3) === 0 || rs(l, s) || (t = true, bc(l, s));
            l = l.next;
          }
        while (t);
        Tu = false;
      }
    }
    function Bb() {
      fh();
    }
    function fh() {
      Pi = bf = false;
      var e = 0;
      mt !== 0 && Nb() && (e = mt);
      for (var a = We(), t = null, l = Gi; l !== null; ) {
        var o = l.next, s = rh(l, a);
        s === 0 ? (l.next = null, t === null ? Gi = o : t.next = o, o === null && (yl = t)) : (t = l, (e !== 0 || (s & 3) !== 0) && (Pi = true)), l = o;
      }
      xe !== 0 && xe !== 5 || _s(e, false), mt !== 0 && (mt = 0);
    }
    function rh(e, a) {
      for (var t = e.suspendedLanes, l = e.pingedLanes, o = e.expirationTimes, s = e.pendingLanes & -62914561; 0 < s; ) {
        var i = 31 - ea(s), n = 1 << i, u = o[i];
        u === -1 ? ((n & t) === 0 || (n & l) !== 0) && (o[i] = o_(n, a)) : u <= a && (e.expiredLanes |= n), s &= ~n;
      }
      if (a = J, t = E, t = Zi(e, e === a ? t : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), l = e.callbackNode, t === 0 || e === a && (V === 2 || V === 9) || e.cancelPendingCommit !== null) return l !== null && l !== null && lu(l), e.callbackNode = null, e.callbackPriority = 0;
      if ((t & 3) === 0 || rs(e, t)) {
        if (a = t & -t, a === e.callbackPriority) return a;
        switch (l !== null && lu(l), Rf(t)) {
          case 2:
          case 8:
            t = Jc;
            break;
          case 32:
            t = Si;
            break;
          case 268435456:
            t = Wc;
            break;
          default:
            t = Si;
        }
        return l = dh.bind(null, e), t = Bf(t, l), e.callbackPriority = a, e.callbackNode = t, a;
      }
      return l !== null && l !== null && lu(l), e.callbackPriority = 2, e.callbackNode = null, 2;
    }
    function dh(e, a) {
      if (xe !== 0 && xe !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
      var t = e.callbackNode;
      if (dn() && e.callbackNode !== t) return null;
      var l = E;
      return l = Zi(e, e === J ? l : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), l === 0 ? null : (Zm(e, l, a), rh(e, We()), e.callbackNode != null && e.callbackNode === t ? dh.bind(null, e) : null);
    }
    function bc(e, a) {
      if (dn()) return null;
      Zm(e, a, true);
    }
    function Db() {
      Pb(function() {
        (F & 6) !== 0 ? Bf(Zc, Bb) : fh();
      });
    }
    function _r() {
      if (mt === 0) {
        var e = Fl;
        e === 0 && (e = Fs, Fs <<= 1, (Fs & 261888) === 0 && (Fs = 256)), mt = e;
      }
      return mt;
    }
    function xc(e) {
      return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : ni("" + e);
    }
    function yc(e, a) {
      var t = a.ownerDocument.createElement("input");
      return t.name = a.name, t.value = a.value, e.id && t.setAttribute("form", e.id), a.parentNode.insertBefore(t, a), e = new FormData(e), t.parentNode.removeChild(t), e;
    }
    function Rb(e, a, t, l, o) {
      if (a === "submit" && t && t.stateNode === o) {
        var s = xc((o[Fe] || null).action), i = l.submitter;
        i && (a = (a = i[Fe] || null) ? xc(a.formAction) : i.getAttribute("formAction"), a !== null && (s = a, i = null));
        var n = new Ji("action", "action", null, l, o);
        e.push({ event: n, listeners: [{ instance: null, listener: function() {
          if (l.defaultPrevented) {
            if (mt !== 0) {
              var u = i ? yc(o, i) : new FormData(o);
              uf(t, { pending: true, data: u, method: o.method, action: s }, null, u);
            }
          } else typeof s == "function" && (n.preventDefault(), u = i ? yc(o, i) : new FormData(o), uf(t, { pending: true, data: u, method: o.method, action: s }, s, u));
        }, currentTarget: o }] });
      }
    }
    for (ai = 0; ai < Qu.length; ai++) ti = Qu[ai], Lc = ti.toLowerCase(), vc = ti[0].toUpperCase() + ti.slice(1), La(Lc, "on" + vc);
    var ti, Lc, vc, ai;
    La(wp, "onAnimationEnd");
    La(Sp, "onAnimationIteration");
    La(Cp, "onAnimationStart");
    La("dblclick", "onDoubleClick");
    La("focusin", "onFocus");
    La("focusout", "onBlur");
    La(J_, "onTransitionRun");
    La(W_, "onTransitionStart");
    La($_, "onTransitionCancel");
    La(kp, "onTransitionEnd");
    Gl("onMouseEnter", ["mouseout", "mouseover"]);
    Gl("onMouseLeave", ["mouseout", "mouseover"]);
    Gl("onPointerEnter", ["pointerout", "pointerover"]);
    Gl("onPointerLeave", ["pointerout", "pointerover"]);
    el("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
    el("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
    el("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
    el("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
    el("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
    el("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var ls = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), zb = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ls));
    function ch(e, a) {
      a = (a & 4) !== 0;
      for (var t = 0; t < e.length; t++) {
        var l = e[t], o = l.event;
        l = l.listeners;
        e: {
          var s = void 0;
          if (a) for (var i = l.length - 1; 0 <= i; i--) {
            var n = l[i], u = n.instance, r = n.currentTarget;
            if (n = n.listener, u !== s && o.isPropagationStopped()) break e;
            s = n, o.currentTarget = r;
            try {
              s(o);
            } catch (_) {
              ki(_);
            }
            o.currentTarget = null, s = u;
          }
          else for (i = 0; i < l.length; i++) {
            if (n = l[i], u = n.instance, r = n.currentTarget, n = n.listener, u !== s && o.isPropagationStopped()) break e;
            s = n, o.currentTarget = r;
            try {
              s(o);
            } catch (_) {
              ki(_);
            }
            o.currentTarget = null, s = u;
          }
        }
      }
    }
    function H(e, a) {
      var t = a[Gu];
      t === void 0 && (t = a[Gu] = /* @__PURE__ */ new Set());
      var l = e + "__bubble";
      t.has(l) || (ph(a, e, 2, false), t.add(l));
    }
    function Mu(e, a, t) {
      var l = 0;
      a && (l |= 4), ph(t, e, l, a);
    }
    var li = "_reactListening" + Math.random().toString(36).slice(2);
    function br(e) {
      if (!e[li]) {
        e[li] = true, op.forEach(function(t) {
          t !== "selectionchange" && (zb.has(t) || Mu(t, false, e), Mu(t, true, e));
        });
        var a = e.nodeType === 9 ? e : e.ownerDocument;
        a === null || a[li] || (a[li] = true, Mu("selectionchange", false, a));
      }
    }
    function ph(e, a, t, l) {
      switch (kh(a)) {
        case 2:
          var o = ux;
          break;
        case 8:
          o = fx;
          break;
        default:
          o = vr;
      }
      t = o.bind(null, a, t, e), o = void 0, !Ku || a !== "touchstart" && a !== "touchmove" && a !== "wheel" || (o = true), l ? o !== void 0 ? e.addEventListener(a, t, { capture: true, passive: o }) : e.addEventListener(a, t, true) : o !== void 0 ? e.addEventListener(a, t, { passive: o }) : e.addEventListener(a, t, false);
    }
    function Au(e, a, t, l, o) {
      var s = l;
      if ((a & 1) === 0 && (a & 2) === 0 && l !== null) e: for (; ; ) {
        if (l === null) return;
        var i = l.tag;
        if (i === 3 || i === 4) {
          var n = l.stateNode.containerInfo;
          if (n === o) break;
          if (i === 4) for (i = l.return; i !== null; ) {
            var u = i.tag;
            if ((u === 3 || u === 4) && i.stateNode.containerInfo === o) return;
            i = i.return;
          }
          for (; n !== null; ) {
            if (i = wl(n), i === null) return;
            if (u = i.tag, u === 5 || u === 6 || u === 26 || u === 27) {
              l = s = i;
              continue e;
            }
            n = n.parentNode;
          }
        }
        l = l.return;
      }
      cp(function() {
        var r = s, _ = qf(t), x = [];
        e: {
          var m = Ip.get(e);
          if (m !== void 0) {
            var d = Ji, y = e;
            switch (e) {
              case "keypress":
                if (fi(t) === 0) break e;
              case "keydown":
              case "keyup":
                d = M_;
                break;
              case "focusin":
                y = "focus", d = uu;
                break;
              case "focusout":
                y = "blur", d = uu;
                break;
              case "beforeblur":
              case "afterblur":
                d = uu;
                break;
              case "click":
                if (t.button === 2) break e;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                d = Md;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                d = __;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                d = D_;
                break;
              case wp:
              case Sp:
              case Cp:
                d = y_;
                break;
              case kp:
                d = z_;
                break;
              case "scroll":
              case "scrollend":
                d = h_;
                break;
              case "wheel":
                d = q_;
                break;
              case "copy":
              case "cut":
              case "paste":
                d = v_;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                d = Bd;
                break;
              case "toggle":
              case "beforetoggle":
                d = U_;
            }
            var S = (a & 4) !== 0, M = !S && (e === "scroll" || e === "scrollend"), g = S ? m !== null ? m + "Capture" : null : m;
            S = [];
            for (var c = r, h; c !== null; ) {
              var b = c;
              if (h = b.stateNode, b = b.tag, b !== 5 && b !== 26 && b !== 27 || h === null || g === null || (b = Qo(c, g), b != null && S.push(os(c, b, h))), M) break;
              c = c.return;
            }
            0 < S.length && (m = new d(m, y, null, t, _), x.push({ event: m, listeners: S }));
          }
        }
        if ((a & 7) === 0) {
          e: {
            if (m = e === "mouseover" || e === "pointerover", d = e === "mouseout" || e === "pointerout", m && t !== Vu && (y = t.relatedTarget || t.fromElement) && (wl(y) || y[Jl])) break e;
            if ((d || m) && (m = _.window === _ ? _ : (m = _.ownerDocument) ? m.defaultView || m.parentWindow : window, d ? (y = t.relatedTarget || t.toElement, d = r, y = y ? wl(y) : null, y !== null && (M = us(y), S = y.tag, y !== M || S !== 5 && S !== 27 && S !== 6) && (y = null)) : (d = null, y = r), d !== y)) {
              if (S = Md, b = "onMouseLeave", g = "onMouseEnter", c = "mouse", (e === "pointerout" || e === "pointerover") && (S = Bd, b = "onPointerLeave", g = "onPointerEnter", c = "pointer"), M = d == null ? m : Do(d), h = y == null ? m : Do(y), m = new S(b, c + "leave", d, t, _), m.target = M, m.relatedTarget = h, b = null, wl(_) === r && (S = new S(g, c + "enter", y, t, _), S.target = h, S.relatedTarget = M, b = S), M = b, d && y) a: {
                for (S = Ob, g = d, c = y, h = 0, b = g; b; b = S(b)) h++;
                b = 0;
                for (var C = c; C; C = S(C)) b++;
                for (; 0 < h - b; ) g = S(g), h--;
                for (; 0 < b - h; ) c = S(c), b--;
                for (; h--; ) {
                  if (g === c || c !== null && g === c.alternate) {
                    S = g;
                    break a;
                  }
                  g = S(g), c = S(c);
                }
                S = null;
              }
              else S = null;
              d !== null && wc(x, m, d, S, false), y !== null && M !== null && wc(x, M, y, S, true);
            }
          }
          e: {
            if (m = r ? Do(r) : window, d = m.nodeName && m.nodeName.toLowerCase(), d === "select" || d === "input" && m.type === "file") var O = Od;
            else if (zd(m)) if (bp) O = Y_;
            else {
              O = K_;
              var k = V_;
            }
            else d = m.nodeName, !d || d.toLowerCase() !== "input" || m.type !== "checkbox" && m.type !== "radio" ? r && Of(r.elementType) && (O = Od) : O = j_;
            if (O && (O = O(e, r))) {
              _p(x, O, t, _);
              break e;
            }
            k && k(e, m, r), e === "focusout" && r && m.type === "number" && r.memoizedProps.value != null && Xu(m, "number", m.value);
          }
          switch (k = r ? Do(r) : window, e) {
            case "focusin":
              (zd(k) || k.contentEditable === "true") && (kl = k, ju = r, Ho = null);
              break;
            case "focusout":
              Ho = ju = kl = null;
              break;
            case "mousedown":
              Yu = true;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              Yu = false, Ed(x, t, _);
              break;
            case "selectionchange":
              if (Z_) break;
            case "keydown":
            case "keyup":
              Ed(x, t, _);
          }
          var B;
          if (Ef) e: {
            switch (e) {
              case "compositionstart":
                var T = "onCompositionStart";
                break e;
              case "compositionend":
                T = "onCompositionEnd";
                break e;
              case "compositionupdate":
                T = "onCompositionUpdate";
                break e;
            }
            T = void 0;
          }
          else Cl ? hp(e, t) && (T = "onCompositionEnd") : e === "keydown" && t.keyCode === 229 && (T = "onCompositionStart");
          T && (mp && t.locale !== "ko" && (Cl || T !== "onCompositionStart" ? T === "onCompositionEnd" && Cl && (B = pp()) : (dt = _, Hf = "value" in dt ? dt.value : dt.textContent, Cl = true)), k = Fi(r, T), 0 < k.length && (T = new Ad(T, e, null, t, _), x.push({ event: T, listeners: k }), B ? T.data = B : (B = gp(t), B !== null && (T.data = B)))), (B = N_ ? G_(e, t) : P_(e, t)) && (T = Fi(r, "onBeforeInput"), 0 < T.length && (k = new Ad("onBeforeInput", "beforeinput", null, t, _), x.push({ event: k, listeners: T }), k.data = B)), Rb(x, e, r, t, _);
        }
        ch(x, a);
      });
    }
    function os(e, a, t) {
      return { instance: e, listener: a, currentTarget: t };
    }
    function Fi(e, a) {
      for (var t = a + "Capture", l = []; e !== null; ) {
        var o = e, s = o.stateNode;
        if (o = o.tag, o !== 5 && o !== 26 && o !== 27 || s === null || (o = Qo(e, t), o != null && l.unshift(os(e, o, s)), o = Qo(e, a), o != null && l.push(os(e, o, s))), e.tag === 3) return l;
        e = e.return;
      }
      return [];
    }
    function Ob(e) {
      if (e === null) return null;
      do
        e = e.return;
      while (e && e.tag !== 5 && e.tag !== 27);
      return e || null;
    }
    function wc(e, a, t, l, o) {
      for (var s = a._reactName, i = []; t !== null && t !== l; ) {
        var n = t, u = n.alternate, r = n.stateNode;
        if (n = n.tag, u !== null && u === l) break;
        n !== 5 && n !== 26 && n !== 27 || r === null || (u = r, o ? (r = Qo(t, s), r != null && i.unshift(os(t, r, u))) : o || (r = Qo(t, s), r != null && i.push(os(t, r, u)))), t = t.return;
      }
      i.length !== 0 && e.push({ event: a, listeners: i });
    }
    var qb = /\r\n?/g, Hb = /\u0000|\uFFFD/g;
    function Sc(e) {
      return (typeof e == "string" ? e : "" + e).replace(qb, `
`).replace(Hb, "");
    }
    function mh(e, a) {
      return a = Sc(a), Sc(e) === a;
    }
    function Y(e, a, t, l, o, s) {
      switch (t) {
        case "children":
          typeof l == "string" ? a === "body" || a === "textarea" && l === "" || Pl(e, l) : (typeof l == "number" || typeof l == "bigint") && a !== "body" && Pl(e, "" + l);
          break;
        case "className":
          Ks(e, "class", l);
          break;
        case "tabIndex":
          Ks(e, "tabindex", l);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          Ks(e, t, l);
          break;
        case "style":
          dp(e, l, s);
          break;
        case "data":
          if (a !== "object") {
            Ks(e, "data", l);
            break;
          }
        case "src":
        case "href":
          if (l === "" && (a !== "a" || t !== "href")) {
            e.removeAttribute(t);
            break;
          }
          if (l == null || typeof l == "function" || typeof l == "symbol" || typeof l == "boolean") {
            e.removeAttribute(t);
            break;
          }
          l = ni("" + l), e.setAttribute(t, l);
          break;
        case "action":
        case "formAction":
          if (typeof l == "function") {
            e.setAttribute(t, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
            break;
          } else typeof s == "function" && (t === "formAction" ? (a !== "input" && Y(e, a, "name", o.name, o, null), Y(e, a, "formEncType", o.formEncType, o, null), Y(e, a, "formMethod", o.formMethod, o, null), Y(e, a, "formTarget", o.formTarget, o, null)) : (Y(e, a, "encType", o.encType, o, null), Y(e, a, "method", o.method, o, null), Y(e, a, "target", o.target, o, null)));
          if (l == null || typeof l == "symbol" || typeof l == "boolean") {
            e.removeAttribute(t);
            break;
          }
          l = ni("" + l), e.setAttribute(t, l);
          break;
        case "onClick":
          l != null && (e.onclick = Ga);
          break;
        case "onScroll":
          l != null && H("scroll", e);
          break;
        case "onScrollEnd":
          l != null && H("scrollend", e);
          break;
        case "dangerouslySetInnerHTML":
          if (l != null) {
            if (typeof l != "object" || !("__html" in l)) throw Error(v(61));
            if (t = l.__html, t != null) {
              if (o.children != null) throw Error(v(60));
              e.innerHTML = t;
            }
          }
          break;
        case "multiple":
          e.multiple = l && typeof l != "function" && typeof l != "symbol";
          break;
        case "muted":
          e.muted = l && typeof l != "function" && typeof l != "symbol";
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
          break;
        case "autoFocus":
          break;
        case "xlinkHref":
          if (l == null || typeof l == "function" || typeof l == "boolean" || typeof l == "symbol") {
            e.removeAttribute("xlink:href");
            break;
          }
          t = ni("" + l), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", t);
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(t, "" + l) : e.removeAttribute(t);
          break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
          l && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(t, "") : e.removeAttribute(t);
          break;
        case "capture":
        case "download":
          l === true ? e.setAttribute(t, "") : l !== false && l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(t, l) : e.removeAttribute(t);
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          l != null && typeof l != "function" && typeof l != "symbol" && !isNaN(l) && 1 <= l ? e.setAttribute(t, l) : e.removeAttribute(t);
          break;
        case "rowSpan":
        case "start":
          l == null || typeof l == "function" || typeof l == "symbol" || isNaN(l) ? e.removeAttribute(t) : e.setAttribute(t, l);
          break;
        case "popover":
          H("beforetoggle", e), H("toggle", e), ii(e, "popover", l);
          break;
        case "xlinkActuate":
          Ra(e, "http://www.w3.org/1999/xlink", "xlink:actuate", l);
          break;
        case "xlinkArcrole":
          Ra(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", l);
          break;
        case "xlinkRole":
          Ra(e, "http://www.w3.org/1999/xlink", "xlink:role", l);
          break;
        case "xlinkShow":
          Ra(e, "http://www.w3.org/1999/xlink", "xlink:show", l);
          break;
        case "xlinkTitle":
          Ra(e, "http://www.w3.org/1999/xlink", "xlink:title", l);
          break;
        case "xlinkType":
          Ra(e, "http://www.w3.org/1999/xlink", "xlink:type", l);
          break;
        case "xmlBase":
          Ra(e, "http://www.w3.org/XML/1998/namespace", "xml:base", l);
          break;
        case "xmlLang":
          Ra(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", l);
          break;
        case "xmlSpace":
          Ra(e, "http://www.w3.org/XML/1998/namespace", "xml:space", l);
          break;
        case "is":
          ii(e, "is", l);
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          (!(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (t = p_.get(t) || t, ii(e, t, l));
      }
    }
    function xf(e, a, t, l, o, s) {
      switch (t) {
        case "style":
          dp(e, l, s);
          break;
        case "dangerouslySetInnerHTML":
          if (l != null) {
            if (typeof l != "object" || !("__html" in l)) throw Error(v(61));
            if (t = l.__html, t != null) {
              if (o.children != null) throw Error(v(60));
              e.innerHTML = t;
            }
          }
          break;
        case "children":
          typeof l == "string" ? Pl(e, l) : (typeof l == "number" || typeof l == "bigint") && Pl(e, "" + l);
          break;
        case "onScroll":
          l != null && H("scroll", e);
          break;
        case "onScrollEnd":
          l != null && H("scrollend", e);
          break;
        case "onClick":
          l != null && (e.onclick = Ga);
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          if (!sp.hasOwnProperty(t)) e: {
            if (t[0] === "o" && t[1] === "n" && (o = t.endsWith("Capture"), a = t.slice(2, o ? t.length - 7 : void 0), s = e[Fe] || null, s = s != null ? s[t] : null, typeof s == "function" && e.removeEventListener(a, s, o), typeof l == "function")) {
              typeof s != "function" && s !== null && (t in e ? e[t] = null : e.hasAttribute(t) && e.removeAttribute(t)), e.addEventListener(a, l, o);
              break e;
            }
            t in e ? e[t] = l : l === true ? e.setAttribute(t, "") : ii(e, t, l);
          }
      }
    }
    function Ae(e, a, t) {
      switch (a) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "img":
          H("error", e), H("load", e);
          var l = false, o = false, s;
          for (s in t) if (t.hasOwnProperty(s)) {
            var i = t[s];
            if (i != null) switch (s) {
              case "src":
                l = true;
                break;
              case "srcSet":
                o = true;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(v(137, a));
              default:
                Y(e, a, s, i, t, null);
            }
          }
          o && Y(e, a, "srcSet", t.srcSet, t, null), l && Y(e, a, "src", t.src, t, null);
          return;
        case "input":
          H("invalid", e);
          var n = s = i = o = null, u = null, r = null;
          for (l in t) if (t.hasOwnProperty(l)) {
            var _ = t[l];
            if (_ != null) switch (l) {
              case "name":
                o = _;
                break;
              case "type":
                i = _;
                break;
              case "checked":
                u = _;
                break;
              case "defaultChecked":
                r = _;
                break;
              case "value":
                s = _;
                break;
              case "defaultValue":
                n = _;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (_ != null) throw Error(v(137, a));
                break;
              default:
                Y(e, a, l, _, t, null);
            }
          }
          up(e, s, n, u, r, i, o, false);
          return;
        case "select":
          H("invalid", e), l = i = s = null;
          for (o in t) if (t.hasOwnProperty(o) && (n = t[o], n != null)) switch (o) {
            case "value":
              s = n;
              break;
            case "defaultValue":
              i = n;
              break;
            case "multiple":
              l = n;
            default:
              Y(e, a, o, n, t, null);
          }
          a = s, t = i, e.multiple = !!l, a != null ? zl(e, !!l, a, false) : t != null && zl(e, !!l, t, true);
          return;
        case "textarea":
          H("invalid", e), s = o = l = null;
          for (i in t) if (t.hasOwnProperty(i) && (n = t[i], n != null)) switch (i) {
            case "value":
              l = n;
              break;
            case "defaultValue":
              o = n;
              break;
            case "children":
              s = n;
              break;
            case "dangerouslySetInnerHTML":
              if (n != null) throw Error(v(91));
              break;
            default:
              Y(e, a, i, n, t, null);
          }
          rp(e, l, o, s);
          return;
        case "option":
          for (u in t) if (t.hasOwnProperty(u) && (l = t[u], l != null)) switch (u) {
            case "selected":
              e.selected = l && typeof l != "function" && typeof l != "symbol";
              break;
            default:
              Y(e, a, u, l, t, null);
          }
          return;
        case "dialog":
          H("beforetoggle", e), H("toggle", e), H("cancel", e), H("close", e);
          break;
        case "iframe":
        case "object":
          H("load", e);
          break;
        case "video":
        case "audio":
          for (l = 0; l < ls.length; l++) H(ls[l], e);
          break;
        case "image":
          H("error", e), H("load", e);
          break;
        case "details":
          H("toggle", e);
          break;
        case "embed":
        case "source":
        case "link":
          H("error", e), H("load", e);
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
          for (r in t) if (t.hasOwnProperty(r) && (l = t[r], l != null)) switch (r) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(v(137, a));
            default:
              Y(e, a, r, l, t, null);
          }
          return;
        default:
          if (Of(a)) {
            for (_ in t) t.hasOwnProperty(_) && (l = t[_], l !== void 0 && xf(e, a, _, l, t, void 0));
            return;
          }
      }
      for (n in t) t.hasOwnProperty(n) && (l = t[n], l != null && Y(e, a, n, l, t, null));
    }
    function Ub(e, a, t, l) {
      switch (a) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "input":
          var o = null, s = null, i = null, n = null, u = null, r = null, _ = null;
          for (d in t) {
            var x = t[d];
            if (t.hasOwnProperty(d) && x != null) switch (d) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                u = x;
              default:
                l.hasOwnProperty(d) || Y(e, a, d, null, l, x);
            }
          }
          for (var m in l) {
            var d = l[m];
            if (x = t[m], l.hasOwnProperty(m) && (d != null || x != null)) switch (m) {
              case "type":
                s = d;
                break;
              case "name":
                o = d;
                break;
              case "checked":
                r = d;
                break;
              case "defaultChecked":
                _ = d;
                break;
              case "value":
                i = d;
                break;
              case "defaultValue":
                n = d;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (d != null) throw Error(v(137, a));
                break;
              default:
                d !== x && Y(e, a, m, d, l, x);
            }
          }
          Fu(e, i, n, u, r, _, s, o);
          return;
        case "select":
          d = i = n = m = null;
          for (s in t) if (u = t[s], t.hasOwnProperty(s) && u != null) switch (s) {
            case "value":
              break;
            case "multiple":
              d = u;
            default:
              l.hasOwnProperty(s) || Y(e, a, s, null, l, u);
          }
          for (o in l) if (s = l[o], u = t[o], l.hasOwnProperty(o) && (s != null || u != null)) switch (o) {
            case "value":
              m = s;
              break;
            case "defaultValue":
              n = s;
              break;
            case "multiple":
              i = s;
            default:
              s !== u && Y(e, a, o, s, l, u);
          }
          a = n, t = i, l = d, m != null ? zl(e, !!t, m, false) : !!l != !!t && (a != null ? zl(e, !!t, a, true) : zl(e, !!t, t ? [] : "", false));
          return;
        case "textarea":
          d = m = null;
          for (n in t) if (o = t[n], t.hasOwnProperty(n) && o != null && !l.hasOwnProperty(n)) switch (n) {
            case "value":
              break;
            case "children":
              break;
            default:
              Y(e, a, n, null, l, o);
          }
          for (i in l) if (o = l[i], s = t[i], l.hasOwnProperty(i) && (o != null || s != null)) switch (i) {
            case "value":
              m = o;
              break;
            case "defaultValue":
              d = o;
              break;
            case "children":
              break;
            case "dangerouslySetInnerHTML":
              if (o != null) throw Error(v(91));
              break;
            default:
              o !== s && Y(e, a, i, o, l, s);
          }
          fp(e, m, d);
          return;
        case "option":
          for (var y in t) if (m = t[y], t.hasOwnProperty(y) && m != null && !l.hasOwnProperty(y)) switch (y) {
            case "selected":
              e.selected = false;
              break;
            default:
              Y(e, a, y, null, l, m);
          }
          for (u in l) if (m = l[u], d = t[u], l.hasOwnProperty(u) && m !== d && (m != null || d != null)) switch (u) {
            case "selected":
              e.selected = m && typeof m != "function" && typeof m != "symbol";
              break;
            default:
              Y(e, a, u, m, l, d);
          }
          return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
          for (var S in t) m = t[S], t.hasOwnProperty(S) && m != null && !l.hasOwnProperty(S) && Y(e, a, S, null, l, m);
          for (r in l) if (m = l[r], d = t[r], l.hasOwnProperty(r) && m !== d && (m != null || d != null)) switch (r) {
            case "children":
            case "dangerouslySetInnerHTML":
              if (m != null) throw Error(v(137, a));
              break;
            default:
              Y(e, a, r, m, l, d);
          }
          return;
        default:
          if (Of(a)) {
            for (var M in t) m = t[M], t.hasOwnProperty(M) && m !== void 0 && !l.hasOwnProperty(M) && xf(e, a, M, void 0, l, m);
            for (_ in l) m = l[_], d = t[_], !l.hasOwnProperty(_) || m === d || m === void 0 && d === void 0 || xf(e, a, _, m, l, d);
            return;
          }
      }
      for (var g in t) m = t[g], t.hasOwnProperty(g) && m != null && !l.hasOwnProperty(g) && Y(e, a, g, null, l, m);
      for (x in l) m = l[x], d = t[x], !l.hasOwnProperty(x) || m === d || m == null && d == null || Y(e, a, x, m, l, d);
    }
    function Cc(e) {
      switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
          return true;
        default:
          return false;
      }
    }
    function Eb() {
      if (typeof performance.getEntriesByType == "function") {
        for (var e = 0, a = 0, t = performance.getEntriesByType("resource"), l = 0; l < t.length; l++) {
          var o = t[l], s = o.transferSize, i = o.initiatorType, n = o.duration;
          if (s && n && Cc(i)) {
            for (i = 0, n = o.responseEnd, l += 1; l < t.length; l++) {
              var u = t[l], r = u.startTime;
              if (r > n) break;
              var _ = u.transferSize, x = u.initiatorType;
              _ && Cc(x) && (u = u.responseEnd, i += _ * (u < n ? 1 : (n - r) / (u - r)));
            }
            if (--l, a += 8 * (s + i) / (o.duration / 1e3), e++, 10 < e) break;
          }
        }
        if (0 < e) return a / e / 1e6;
      }
      return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
    }
    var yf = null, Lf = null;
    function Xi(e) {
      return e.nodeType === 9 ? e : e.ownerDocument;
    }
    function kc(e) {
      switch (e) {
        case "http://www.w3.org/2000/svg":
          return 1;
        case "http://www.w3.org/1998/Math/MathML":
          return 2;
        default:
          return 0;
      }
    }
    function hh(e, a) {
      if (e === 0) switch (a) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
      return e === 1 && a === "foreignObject" ? 0 : e;
    }
    function vf(e, a) {
      return e === "textarea" || e === "noscript" || typeof a.children == "string" || typeof a.children == "number" || typeof a.children == "bigint" || typeof a.dangerouslySetInnerHTML == "object" && a.dangerouslySetInnerHTML !== null && a.dangerouslySetInnerHTML.__html != null;
    }
    var Bu = null;
    function Nb() {
      var e = window.event;
      return e && e.type === "popstate" ? e === Bu ? false : (Bu = e, true) : (Bu = null, false);
    }
    var gh = typeof setTimeout == "function" ? setTimeout : void 0, Gb = typeof clearTimeout == "function" ? clearTimeout : void 0, Ic = typeof Promise == "function" ? Promise : void 0, Pb = typeof queueMicrotask == "function" ? queueMicrotask : typeof Ic < "u" ? function(e) {
      return Ic.resolve(null).then(e).catch(Fb);
    } : gh;
    function Fb(e) {
      setTimeout(function() {
        throw e;
      });
    }
    function Mt(e) {
      return e === "head";
    }
    function Tc(e, a) {
      var t = a, l = 0;
      do {
        var o = t.nextSibling;
        if (e.removeChild(t), o && o.nodeType === 8) if (t = o.data, t === "/$" || t === "/&") {
          if (l === 0) {
            e.removeChild(o), Zl(a);
            return;
          }
          l--;
        } else if (t === "$" || t === "$?" || t === "$~" || t === "$!" || t === "&") l++;
        else if (t === "html") jo(e.ownerDocument.documentElement);
        else if (t === "head") {
          t = e.ownerDocument.head, jo(t);
          for (var s = t.firstChild; s; ) {
            var i = s.nextSibling, n = s.nodeName;
            s[cs] || n === "SCRIPT" || n === "STYLE" || n === "LINK" && s.rel.toLowerCase() === "stylesheet" || t.removeChild(s), s = i;
          }
        } else t === "body" && jo(e.ownerDocument.body);
        t = o;
      } while (t);
      Zl(a);
    }
    function Mc(e, a) {
      var t = e;
      e = 0;
      do {
        var l = t.nextSibling;
        if (t.nodeType === 1 ? a ? (t._stashedDisplay = t.style.display, t.style.display = "none") : (t.style.display = t._stashedDisplay || "", t.getAttribute("style") === "" && t.removeAttribute("style")) : t.nodeType === 3 && (a ? (t._stashedText = t.nodeValue, t.nodeValue = "") : t.nodeValue = t._stashedText || ""), l && l.nodeType === 8) if (t = l.data, t === "/$") {
          if (e === 0) break;
          e--;
        } else t !== "$" && t !== "$?" && t !== "$~" && t !== "$!" || e++;
        t = l;
      } while (t);
    }
    function wf(e) {
      var a = e.firstChild;
      for (a && a.nodeType === 10 && (a = a.nextSibling); a; ) {
        var t = a;
        switch (a = a.nextSibling, t.nodeName) {
          case "HTML":
          case "HEAD":
          case "BODY":
            wf(t), zf(t);
            continue;
          case "SCRIPT":
          case "STYLE":
            continue;
          case "LINK":
            if (t.rel.toLowerCase() === "stylesheet") continue;
        }
        e.removeChild(t);
      }
    }
    function Xb(e, a, t, l) {
      for (; e.nodeType === 1; ) {
        var o = t;
        if (e.nodeName.toLowerCase() !== a.toLowerCase()) {
          if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
        } else if (l) {
          if (!e[cs]) switch (a) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (s = e.getAttribute("rel"), s === "stylesheet" && e.hasAttribute("data-precedence")) break;
              if (s !== o.rel || e.getAttribute("href") !== (o.href == null || o.href === "" ? null : o.href) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin) || e.getAttribute("title") !== (o.title == null ? null : o.title)) break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (s = e.getAttribute("src"), (s !== (o.src == null ? null : o.src) || e.getAttribute("type") !== (o.type == null ? null : o.type) || e.getAttribute("crossorigin") !== (o.crossOrigin == null ? null : o.crossOrigin)) && s && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
              return e;
            default:
              return e;
          }
        } else if (a === "input" && e.type === "hidden") {
          var s = o.name == null ? null : "" + o.name;
          if (o.type === "hidden" && e.getAttribute("name") === s) return e;
        } else return e;
        if (e = ma(e.nextSibling), e === null) break;
      }
      return null;
    }
    function Vb(e, a, t) {
      if (a === "") return null;
      for (; e.nodeType !== 3; ) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = ma(e.nextSibling), e === null)) return null;
      return e;
    }
    function _h(e, a) {
      for (; e.nodeType !== 8; ) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !a || (e = ma(e.nextSibling), e === null)) return null;
      return e;
    }
    function Sf(e) {
      return e.data === "$?" || e.data === "$~";
    }
    function Cf(e) {
      return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
    }
    function Kb(e, a) {
      var t = e.ownerDocument;
      if (e.data === "$~") e._reactRetry = a;
      else if (e.data !== "$?" || t.readyState !== "loading") a();
      else {
        var l = function() {
          a(), t.removeEventListener("DOMContentLoaded", l);
        };
        t.addEventListener("DOMContentLoaded", l), e._reactRetry = l;
      }
    }
    function ma(e) {
      for (; e != null; e = e.nextSibling) {
        var a = e.nodeType;
        if (a === 1 || a === 3) break;
        if (a === 8) {
          if (a = e.data, a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&" || a === "F!" || a === "F") break;
          if (a === "/$" || a === "/&") return null;
        }
      }
      return e;
    }
    var kf = null;
    function Ac(e) {
      e = e.nextSibling;
      for (var a = 0; e; ) {
        if (e.nodeType === 8) {
          var t = e.data;
          if (t === "/$" || t === "/&") {
            if (a === 0) return ma(e.nextSibling);
            a--;
          } else t !== "$" && t !== "$!" && t !== "$?" && t !== "$~" && t !== "&" || a++;
        }
        e = e.nextSibling;
      }
      return null;
    }
    function Bc(e) {
      e = e.previousSibling;
      for (var a = 0; e; ) {
        if (e.nodeType === 8) {
          var t = e.data;
          if (t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&") {
            if (a === 0) return e;
            a--;
          } else t !== "/$" && t !== "/&" || a++;
        }
        e = e.previousSibling;
      }
      return null;
    }
    function bh(e, a, t) {
      switch (a = Xi(t), e) {
        case "html":
          if (e = a.documentElement, !e) throw Error(v(452));
          return e;
        case "head":
          if (e = a.head, !e) throw Error(v(453));
          return e;
        case "body":
          if (e = a.body, !e) throw Error(v(454));
          return e;
        default:
          throw Error(v(451));
      }
    }
    function jo(e) {
      for (var a = e.attributes; a.length; ) e.removeAttributeNode(a[0]);
      zf(e);
    }
    var ha = /* @__PURE__ */ new Map(), Dc = /* @__PURE__ */ new Set();
    function Vi(e) {
      return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
    }
    var Ja = X.d;
    X.d = { f: jb, r: Yb, D: Qb, C: Zb, L: Jb, m: Wb, X: ex, S: $b, M: ax };
    function jb() {
      var e = Ja.f(), a = fn();
      return e || a;
    }
    function Yb(e) {
      var a = Wl(e);
      a !== null && a.tag === 5 && a.type === "form" ? dm(a) : Ja.r(e);
    }
    var to = typeof document > "u" ? null : document;
    function xh(e, a, t) {
      var l = to;
      if (l && typeof a == "string" && a) {
        var o = ra(a);
        o = 'link[rel="' + e + '"][href="' + o + '"]', typeof t == "string" && (o += '[crossorigin="' + t + '"]'), Dc.has(o) || (Dc.add(o), e = { rel: e, crossOrigin: t, href: a }, l.querySelector(o) === null && (a = l.createElement("link"), Ae(a, "link", e), Se(a), l.head.appendChild(a)));
      }
    }
    function Qb(e) {
      Ja.D(e), xh("dns-prefetch", e, null);
    }
    function Zb(e, a) {
      Ja.C(e, a), xh("preconnect", e, a);
    }
    function Jb(e, a, t) {
      Ja.L(e, a, t);
      var l = to;
      if (l && e && a) {
        var o = 'link[rel="preload"][as="' + ra(a) + '"]';
        a === "image" && t && t.imageSrcSet ? (o += '[imagesrcset="' + ra(t.imageSrcSet) + '"]', typeof t.imageSizes == "string" && (o += '[imagesizes="' + ra(t.imageSizes) + '"]')) : o += '[href="' + ra(e) + '"]';
        var s = o;
        switch (a) {
          case "style":
            s = Ql(e);
            break;
          case "script":
            s = lo(e);
        }
        ha.has(s) || (e = le({ rel: "preload", href: a === "image" && t && t.imageSrcSet ? void 0 : e, as: a }, t), ha.set(s, e), l.querySelector(o) !== null || a === "style" && l.querySelector(bs(s)) || a === "script" && l.querySelector(xs(s)) || (a = l.createElement("link"), Ae(a, "link", e), Se(a), l.head.appendChild(a)));
      }
    }
    function Wb(e, a) {
      Ja.m(e, a);
      var t = to;
      if (t && e) {
        var l = a && typeof a.as == "string" ? a.as : "script", o = 'link[rel="modulepreload"][as="' + ra(l) + '"][href="' + ra(e) + '"]', s = o;
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            s = lo(e);
        }
        if (!ha.has(s) && (e = le({ rel: "modulepreload", href: e }, a), ha.set(s, e), t.querySelector(o) === null)) {
          switch (l) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              if (t.querySelector(xs(s))) return;
          }
          l = t.createElement("link"), Ae(l, "link", e), Se(l), t.head.appendChild(l);
        }
      }
    }
    function $b(e, a, t) {
      Ja.S(e, a, t);
      var l = to;
      if (l && e) {
        var o = Rl(l).hoistableStyles, s = Ql(e);
        a = a || "default";
        var i = o.get(s);
        if (!i) {
          var n = { loading: 0, preload: null };
          if (i = l.querySelector(bs(s))) n.loading = 5;
          else {
            e = le({ rel: "stylesheet", href: e, "data-precedence": a }, t), (t = ha.get(s)) && xr(e, t);
            var u = i = l.createElement("link");
            Se(u), Ae(u, "link", e), u._p = new Promise(function(r, _) {
              u.onload = r, u.onerror = _;
            }), u.addEventListener("load", function() {
              n.loading |= 1;
            }), u.addEventListener("error", function() {
              n.loading |= 2;
            }), n.loading |= 4, _i(i, a, l);
          }
          i = { type: "stylesheet", instance: i, count: 1, state: n }, o.set(s, i);
        }
      }
    }
    function ex(e, a) {
      Ja.X(e, a);
      var t = to;
      if (t && e) {
        var l = Rl(t).hoistableScripts, o = lo(e), s = l.get(o);
        s || (s = t.querySelector(xs(o)), s || (e = le({ src: e, async: true }, a), (a = ha.get(o)) && yr(e, a), s = t.createElement("script"), Se(s), Ae(s, "link", e), t.head.appendChild(s)), s = { type: "script", instance: s, count: 1, state: null }, l.set(o, s));
      }
    }
    function ax(e, a) {
      Ja.M(e, a);
      var t = to;
      if (t && e) {
        var l = Rl(t).hoistableScripts, o = lo(e), s = l.get(o);
        s || (s = t.querySelector(xs(o)), s || (e = le({ src: e, async: true, type: "module" }, a), (a = ha.get(o)) && yr(e, a), s = t.createElement("script"), Se(s), Ae(s, "link", e), t.head.appendChild(s)), s = { type: "script", instance: s, count: 1, state: null }, l.set(o, s));
      }
    }
    function Rc(e, a, t, l) {
      var o = (o = ht.current) ? Vi(o) : null;
      if (!o) throw Error(v(446));
      switch (e) {
        case "meta":
        case "title":
          return null;
        case "style":
          return typeof t.precedence == "string" && typeof t.href == "string" ? (a = Ql(t.href), t = Rl(o).hoistableStyles, l = t.get(a), l || (l = { type: "style", instance: null, count: 0, state: null }, t.set(a, l)), l) : { type: "void", instance: null, count: 0, state: null };
        case "link":
          if (t.rel === "stylesheet" && typeof t.href == "string" && typeof t.precedence == "string") {
            e = Ql(t.href);
            var s = Rl(o).hoistableStyles, i = s.get(e);
            if (i || (o = o.ownerDocument || o, i = { type: "stylesheet", instance: null, count: 0, state: { loading: 0, preload: null } }, s.set(e, i), (s = o.querySelector(bs(e))) && !s._p && (i.instance = s, i.state.loading = 5), ha.has(e) || (t = { rel: "preload", as: "style", href: t.href, crossOrigin: t.crossOrigin, integrity: t.integrity, media: t.media, hrefLang: t.hrefLang, referrerPolicy: t.referrerPolicy }, ha.set(e, t), s || tx(o, e, t, i.state))), a && l === null) throw Error(v(528, ""));
            return i;
          }
          if (a && l !== null) throw Error(v(529, ""));
          return null;
        case "script":
          return a = t.async, t = t.src, typeof t == "string" && a && typeof a != "function" && typeof a != "symbol" ? (a = lo(t), t = Rl(o).hoistableScripts, l = t.get(a), l || (l = { type: "script", instance: null, count: 0, state: null }, t.set(a, l)), l) : { type: "void", instance: null, count: 0, state: null };
        default:
          throw Error(v(444, e));
      }
    }
    function Ql(e) {
      return 'href="' + ra(e) + '"';
    }
    function bs(e) {
      return 'link[rel="stylesheet"][' + e + "]";
    }
    function yh(e) {
      return le({}, e, { "data-precedence": e.precedence, precedence: null });
    }
    function tx(e, a, t, l) {
      e.querySelector('link[rel="preload"][as="style"][' + a + "]") ? l.loading = 1 : (a = e.createElement("link"), l.preload = a, a.addEventListener("load", function() {
        return l.loading |= 1;
      }), a.addEventListener("error", function() {
        return l.loading |= 2;
      }), Ae(a, "link", t), Se(a), e.head.appendChild(a));
    }
    function lo(e) {
      return '[src="' + ra(e) + '"]';
    }
    function xs(e) {
      return "script[async]" + e;
    }
    function zc(e, a, t) {
      if (a.count++, a.instance === null) switch (a.type) {
        case "style":
          var l = e.querySelector('style[data-href~="' + ra(t.href) + '"]');
          if (l) return a.instance = l, Se(l), l;
          var o = le({}, t, { "data-href": t.href, "data-precedence": t.precedence, href: null, precedence: null });
          return l = (e.ownerDocument || e).createElement("style"), Se(l), Ae(l, "style", o), _i(l, t.precedence, e), a.instance = l;
        case "stylesheet":
          o = Ql(t.href);
          var s = e.querySelector(bs(o));
          if (s) return a.state.loading |= 4, a.instance = s, Se(s), s;
          l = yh(t), (o = ha.get(o)) && xr(l, o), s = (e.ownerDocument || e).createElement("link"), Se(s);
          var i = s;
          return i._p = new Promise(function(n, u) {
            i.onload = n, i.onerror = u;
          }), Ae(s, "link", l), a.state.loading |= 4, _i(s, t.precedence, e), a.instance = s;
        case "script":
          return s = lo(t.src), (o = e.querySelector(xs(s))) ? (a.instance = o, Se(o), o) : (l = t, (o = ha.get(s)) && (l = le({}, t), yr(l, o)), e = e.ownerDocument || e, o = e.createElement("script"), Se(o), Ae(o, "link", l), e.head.appendChild(o), a.instance = o);
        case "void":
          return null;
        default:
          throw Error(v(443, a.type));
      }
      else a.type === "stylesheet" && (a.state.loading & 4) === 0 && (l = a.instance, a.state.loading |= 4, _i(l, t.precedence, e));
      return a.instance;
    }
    function _i(e, a, t) {
      for (var l = t.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), o = l.length ? l[l.length - 1] : null, s = o, i = 0; i < l.length; i++) {
        var n = l[i];
        if (n.dataset.precedence === a) s = n;
        else if (s !== o) break;
      }
      s ? s.parentNode.insertBefore(e, s.nextSibling) : (a = t.nodeType === 9 ? t.head : t, a.insertBefore(e, a.firstChild));
    }
    function xr(e, a) {
      e.crossOrigin == null && (e.crossOrigin = a.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = a.referrerPolicy), e.title == null && (e.title = a.title);
    }
    function yr(e, a) {
      e.crossOrigin == null && (e.crossOrigin = a.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = a.referrerPolicy), e.integrity == null && (e.integrity = a.integrity);
    }
    var bi = null;
    function Oc(e, a, t) {
      if (bi === null) {
        var l = /* @__PURE__ */ new Map(), o = bi = /* @__PURE__ */ new Map();
        o.set(t, l);
      } else o = bi, l = o.get(t), l || (l = /* @__PURE__ */ new Map(), o.set(t, l));
      if (l.has(e)) return l;
      for (l.set(e, null), t = t.getElementsByTagName(e), o = 0; o < t.length; o++) {
        var s = t[o];
        if (!(s[cs] || s[Ie] || e === "link" && s.getAttribute("rel") === "stylesheet") && s.namespaceURI !== "http://www.w3.org/2000/svg") {
          var i = s.getAttribute(a) || "";
          i = e + i;
          var n = l.get(i);
          n ? n.push(s) : l.set(i, [s]);
        }
      }
      return l;
    }
    function qc(e, a, t) {
      e = e.ownerDocument || e, e.head.insertBefore(t, a === "title" ? e.querySelector("head > title") : null);
    }
    function lx(e, a, t) {
      if (t === 1 || a.itemProp != null) return false;
      switch (e) {
        case "meta":
        case "title":
          return true;
        case "style":
          if (typeof a.precedence != "string" || typeof a.href != "string" || a.href === "") break;
          return true;
        case "link":
          if (typeof a.rel != "string" || typeof a.href != "string" || a.href === "" || a.onLoad || a.onError) break;
          switch (a.rel) {
            case "stylesheet":
              return e = a.disabled, typeof a.precedence == "string" && e == null;
            default:
              return true;
          }
        case "script":
          if (a.async && typeof a.async != "function" && typeof a.async != "symbol" && !a.onLoad && !a.onError && a.src && typeof a.src == "string") return true;
      }
      return false;
    }
    function Lh(e) {
      return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
    }
    function ox(e, a, t, l) {
      if (t.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== false) && (t.state.loading & 4) === 0) {
        if (t.instance === null) {
          var o = Ql(l.href), s = a.querySelector(bs(o));
          if (s) {
            a = s._p, a !== null && typeof a == "object" && typeof a.then == "function" && (e.count++, e = Ki.bind(e), a.then(e, e)), t.state.loading |= 4, t.instance = s, Se(s);
            return;
          }
          s = a.ownerDocument || a, l = yh(l), (o = ha.get(o)) && xr(l, o), s = s.createElement("link"), Se(s);
          var i = s;
          i._p = new Promise(function(n, u) {
            i.onload = n, i.onerror = u;
          }), Ae(s, "link", l), t.instance = s;
        }
        e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(t, a), (a = t.state.preload) && (t.state.loading & 3) === 0 && (e.count++, t = Ki.bind(e), a.addEventListener("load", t), a.addEventListener("error", t));
      }
    }
    var Du = 0;
    function sx(e, a) {
      return e.stylesheets && e.count === 0 && xi(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(t) {
        var l = setTimeout(function() {
          if (e.stylesheets && xi(e, e.stylesheets), e.unsuspend) {
            var s = e.unsuspend;
            e.unsuspend = null, s();
          }
        }, 6e4 + a);
        0 < e.imgBytes && Du === 0 && (Du = 62500 * Eb());
        var o = setTimeout(function() {
          if (e.waitingForImages = false, e.count === 0 && (e.stylesheets && xi(e, e.stylesheets), e.unsuspend)) {
            var s = e.unsuspend;
            e.unsuspend = null, s();
          }
        }, (e.imgBytes > Du ? 50 : 800) + a);
        return e.unsuspend = t, function() {
          e.unsuspend = null, clearTimeout(l), clearTimeout(o);
        };
      } : null;
    }
    function Ki() {
      if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
        if (this.stylesheets) xi(this, this.stylesheets);
        else if (this.unsuspend) {
          var e = this.unsuspend;
          this.unsuspend = null, e();
        }
      }
    }
    var ji = null;
    function xi(e, a) {
      e.stylesheets = null, e.unsuspend !== null && (e.count++, ji = /* @__PURE__ */ new Map(), a.forEach(ix, e), ji = null, Ki.call(e));
    }
    function ix(e, a) {
      if (!(a.state.loading & 4)) {
        var t = ji.get(e);
        if (t) var l = t.get(null);
        else {
          t = /* @__PURE__ */ new Map(), ji.set(e, t);
          for (var o = e.querySelectorAll("link[data-precedence],style[data-precedence]"), s = 0; s < o.length; s++) {
            var i = o[s];
            (i.nodeName === "LINK" || i.getAttribute("media") !== "not all") && (t.set(i.dataset.precedence, i), l = i);
          }
          l && t.set(null, l);
        }
        o = a.instance, i = o.getAttribute("data-precedence"), s = t.get(i) || l, s === l && t.set(null, o), t.set(i, o), this.count++, l = Ki.bind(this), o.addEventListener("load", l), o.addEventListener("error", l), s ? s.parentNode.insertBefore(o, s.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(o, e.firstChild)), a.state.loading |= 4;
      }
    }
    var ss = { $typeof: Na, Provider: null, Consumer: null, _currentValue: Xt, _currentValue2: Xt, _threadCount: 0 };
    function nx(e, a, t, l, o, s, i, n, u) {
      this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = ou(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ou(0), this.hiddenUpdates = ou(null), this.identifierPrefix = l, this.onUncaughtError = o, this.onCaughtError = s, this.onRecoverableError = i, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = u, this.incompleteTransitions = /* @__PURE__ */ new Map();
    }
    function vh(e, a, t, l, o, s, i, n, u, r, _, x) {
      return e = new nx(e, a, t, i, u, r, _, x, n), a = 1, s === true && (a |= 24), s = Ze(3, null, null, a), e.current = s, s.stateNode = e, a = Kf(), a.refCount++, e.pooledCache = a, a.refCount++, s.memoizedState = { element: l, isDehydrated: t, cache: a }, Qf(s), e;
    }
    function wh(e) {
      return e ? (e = Ml, e) : Ml;
    }
    function Sh(e, a, t, l, o, s) {
      o = wh(o), l.context === null ? l.context = o : l.pendingContext = o, l = _t(a), l.payload = { element: t }, s = s === void 0 ? null : s, s !== null && (l.callback = s), t = bt(e, l, a), t !== null && (Pe(t, e, a), Eo(t, e, a));
    }
    function Hc(e, a) {
      if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
        var t = e.retryLane;
        e.retryLane = t !== 0 && t < a ? t : a;
      }
    }
    function Lr(e, a) {
      Hc(e, a), (e = e.alternate) && Hc(e, a);
    }
    function Ch(e) {
      if (e.tag === 13 || e.tag === 31) {
        var a = ll(e, 67108864);
        a !== null && Pe(a, e, 67108864), Lr(e, 67108864);
      }
    }
    function Uc(e) {
      if (e.tag === 13 || e.tag === 31) {
        var a = aa();
        a = Df(a);
        var t = ll(e, a);
        t !== null && Pe(t, e, a), Lr(e, a);
      }
    }
    var Yi = true;
    function ux(e, a, t, l) {
      var o = A.T;
      A.T = null;
      var s = X.p;
      try {
        X.p = 2, vr(e, a, t, l);
      } finally {
        X.p = s, A.T = o;
      }
    }
    function fx(e, a, t, l) {
      var o = A.T;
      A.T = null;
      var s = X.p;
      try {
        X.p = 8, vr(e, a, t, l);
      } finally {
        X.p = s, A.T = o;
      }
    }
    function vr(e, a, t, l) {
      if (Yi) {
        var o = If(l);
        if (o === null) Au(e, a, l, Qi, t), Ec(e, l);
        else if (dx(o, e, a, t, l)) l.stopPropagation();
        else if (Ec(e, l), a & 4 && -1 < rx.indexOf(e)) {
          for (; o !== null; ) {
            var s = Wl(o);
            if (s !== null) switch (s.tag) {
              case 3:
                if (s = s.stateNode, s.current.memoizedState.isDehydrated) {
                  var i = Gt(s.pendingLanes);
                  if (i !== 0) {
                    var n = s;
                    for (n.pendingLanes |= 2, n.entangledLanes |= 2; i; ) {
                      var u = 1 << 31 - ea(i);
                      n.entanglements[1] |= u, i &= ~u;
                    }
                    Ba(s), (F & 6) === 0 && (Ui = We() + 500, _s(0, false));
                  }
                }
                break;
              case 31:
              case 13:
                n = ll(s, 2), n !== null && Pe(n, s, 2), fn(), Lr(s, 2);
            }
            if (s = If(l), s === null && Au(e, a, l, Qi, t), s === o) break;
            o = s;
          }
          o !== null && l.stopPropagation();
        } else Au(e, a, l, null, t);
      }
    }
    function If(e) {
      return e = qf(e), wr(e);
    }
    var Qi = null;
    function wr(e) {
      if (Qi = null, e = wl(e), e !== null) {
        var a = us(e);
        if (a === null) e = null;
        else {
          var t = a.tag;
          if (t === 13) {
            if (e = Vc(a), e !== null) return e;
            e = null;
          } else if (t === 31) {
            if (e = Kc(a), e !== null) return e;
            e = null;
          } else if (t === 3) {
            if (a.stateNode.current.memoizedState.isDehydrated) return a.tag === 3 ? a.stateNode.containerInfo : null;
            e = null;
          } else a !== e && (e = null);
        }
      }
      return Qi = e, null;
    }
    function kh(e) {
      switch (e) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 8;
        case "message":
          switch (Jg()) {
            case Zc:
              return 2;
            case Jc:
              return 8;
            case Si:
            case Wg:
              return 32;
            case Wc:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var Tf = false, Lt = null, vt = null, wt = null, is = /* @__PURE__ */ new Map(), ns = /* @__PURE__ */ new Map(), ft = [], rx = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
    function Ec(e, a) {
      switch (e) {
        case "focusin":
        case "focusout":
          Lt = null;
          break;
        case "dragenter":
        case "dragleave":
          vt = null;
          break;
        case "mouseover":
        case "mouseout":
          wt = null;
          break;
        case "pointerover":
        case "pointerout":
          is.delete(a.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          ns.delete(a.pointerId);
      }
    }
    function To(e, a, t, l, o, s) {
      return e === null || e.nativeEvent !== s ? (e = { blockedOn: a, domEventName: t, eventSystemFlags: l, nativeEvent: s, targetContainers: [o] }, a !== null && (a = Wl(a), a !== null && Ch(a)), e) : (e.eventSystemFlags |= l, a = e.targetContainers, o !== null && a.indexOf(o) === -1 && a.push(o), e);
    }
    function dx(e, a, t, l, o) {
      switch (a) {
        case "focusin":
          return Lt = To(Lt, e, a, t, l, o), true;
        case "dragenter":
          return vt = To(vt, e, a, t, l, o), true;
        case "mouseover":
          return wt = To(wt, e, a, t, l, o), true;
        case "pointerover":
          var s = o.pointerId;
          return is.set(s, To(is.get(s) || null, e, a, t, l, o)), true;
        case "gotpointercapture":
          return s = o.pointerId, ns.set(s, To(ns.get(s) || null, e, a, t, l, o)), true;
      }
      return false;
    }
    function Ih(e) {
      var a = wl(e.target);
      if (a !== null) {
        var t = us(a);
        if (t !== null) {
          if (a = t.tag, a === 13) {
            if (a = Vc(t), a !== null) {
              e.blockedOn = a, vd(e.priority, function() {
                Uc(t);
              });
              return;
            }
          } else if (a === 31) {
            if (a = Kc(t), a !== null) {
              e.blockedOn = a, vd(e.priority, function() {
                Uc(t);
              });
              return;
            }
          } else if (a === 3 && t.stateNode.current.memoizedState.isDehydrated) {
            e.blockedOn = t.tag === 3 ? t.stateNode.containerInfo : null;
            return;
          }
        }
      }
      e.blockedOn = null;
    }
    function yi(e) {
      if (e.blockedOn !== null) return false;
      for (var a = e.targetContainers; 0 < a.length; ) {
        var t = If(e.nativeEvent);
        if (t === null) {
          t = e.nativeEvent;
          var l = new t.constructor(t.type, t);
          Vu = l, t.target.dispatchEvent(l), Vu = null;
        } else return a = Wl(t), a !== null && Ch(a), e.blockedOn = t, false;
        a.shift();
      }
      return true;
    }
    function Nc(e, a, t) {
      yi(e) && t.delete(a);
    }
    function cx() {
      Tf = false, Lt !== null && yi(Lt) && (Lt = null), vt !== null && yi(vt) && (vt = null), wt !== null && yi(wt) && (wt = null), is.forEach(Nc), ns.forEach(Nc);
    }
    function oi(e, a) {
      e.blockedOn === a && (e.blockedOn = null, Tf || (Tf = true, ye.unstable_scheduleCallback(ye.unstable_NormalPriority, cx)));
    }
    var si = null;
    function Gc(e) {
      si !== e && (si = e, ye.unstable_scheduleCallback(ye.unstable_NormalPriority, function() {
        si === e && (si = null);
        for (var a = 0; a < e.length; a += 3) {
          var t = e[a], l = e[a + 1], o = e[a + 2];
          if (typeof l != "function") {
            if (wr(l || t) === null) continue;
            break;
          }
          var s = Wl(t);
          s !== null && (e.splice(a, 3), a -= 3, uf(s, { pending: true, data: o, method: t.method, action: l }, l, o));
        }
      }));
    }
    function Zl(e) {
      function a(u) {
        return oi(u, e);
      }
      Lt !== null && oi(Lt, e), vt !== null && oi(vt, e), wt !== null && oi(wt, e), is.forEach(a), ns.forEach(a);
      for (var t = 0; t < ft.length; t++) {
        var l = ft[t];
        l.blockedOn === e && (l.blockedOn = null);
      }
      for (; 0 < ft.length && (t = ft[0], t.blockedOn === null); ) Ih(t), t.blockedOn === null && ft.shift();
      if (t = (e.ownerDocument || e).$reactFormReplay, t != null) for (l = 0; l < t.length; l += 3) {
        var o = t[l], s = t[l + 1], i = o[Fe] || null;
        if (typeof s == "function") i || Gc(t);
        else if (i) {
          var n = null;
          if (s && s.hasAttribute("formAction")) {
            if (o = s, i = s[Fe] || null) n = i.formAction;
            else if (wr(o) !== null) continue;
          } else n = i.action;
          typeof n == "function" ? t[l + 1] = n : (t.splice(l, 3), l -= 3), Gc(t);
        }
      }
    }
    function Th() {
      function e(s) {
        s.canIntercept && s.info === "react-transition" && s.intercept({ handler: function() {
          return new Promise(function(i) {
            return o = i;
          });
        }, focusReset: "manual", scroll: "manual" });
      }
      function a() {
        o !== null && (o(), o = null), l || setTimeout(t, 20);
      }
      function t() {
        if (!l && !navigation.transition) {
          var s = navigation.currentEntry;
          s && s.url != null && navigation.navigate(s.url, { state: s.getState(), info: "react-transition", history: "replace" });
        }
      }
      if (typeof navigation == "object") {
        var l = false, o = null;
        return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", a), navigation.addEventListener("navigateerror", a), setTimeout(t, 100), function() {
          l = true, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", a), navigation.removeEventListener("navigateerror", a), o !== null && (o(), o = null);
        };
      }
    }
    function Sr(e) {
      this._internalRoot = e;
    }
    cn.prototype.render = Sr.prototype.render = function(e) {
      var a = this._internalRoot;
      if (a === null) throw Error(v(409));
      var t = a.current, l = aa();
      Sh(t, l, e, a, null, null);
    };
    cn.prototype.unmount = Sr.prototype.unmount = function() {
      var e = this._internalRoot;
      if (e !== null) {
        this._internalRoot = null;
        var a = e.containerInfo;
        Sh(e.current, 2, null, e, null, null), fn(), a[Jl] = null;
      }
    };
    function cn(e) {
      this._internalRoot = e;
    }
    cn.prototype.unstable_scheduleHydration = function(e) {
      if (e) {
        var a = lp();
        e = { blockedOn: null, target: e, priority: a };
        for (var t = 0; t < ft.length && a !== 0 && a < ft[t].priority; t++) ;
        ft.splice(t, 0, e), t === 0 && Ih(e);
      }
    };
    var Pc = Fc.version;
    if (Pc !== "19.2.8") throw Error(v(527, Pc, "19.2.8"));
    X.findDOMNode = function(e) {
      var a = e._reactInternals;
      if (a === void 0) throw typeof e.render == "function" ? Error(v(188)) : (e = Object.keys(e).join(","), Error(v(268, e)));
      return e = Xg(a), e = e !== null ? jc(e) : null, e = e === null ? null : e.stateNode, e;
    };
    var px = { bundleType: 0, version: "19.2.8", rendererPackageName: "react-dom", currentDispatcherRef: A, reconcilerVersion: "19.2.8" };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && (Mo = __REACT_DEVTOOLS_GLOBAL_HOOK__, !Mo.isDisabled && Mo.supportsFiber)) try {
      fs = Mo.inject(px), $e = Mo;
    } catch {
    }
    var Mo;
    pn.createRoot = function(e, a) {
      if (!Xc(e)) throw Error(v(299));
      var t = false, l = "", o = xm, s = ym, i = Lm;
      return a != null && (a.unstable_strictMode === true && (t = true), a.identifierPrefix !== void 0 && (l = a.identifierPrefix), a.onUncaughtError !== void 0 && (o = a.onUncaughtError), a.onCaughtError !== void 0 && (s = a.onCaughtError), a.onRecoverableError !== void 0 && (i = a.onRecoverableError)), a = vh(e, 1, false, null, null, t, l, null, o, s, i, Th), e[Jl] = a.current, br(e), new Sr(a);
    };
    pn.hydrateRoot = function(e, a, t) {
      if (!Xc(e)) throw Error(v(299));
      var l = false, o = "", s = xm, i = ym, n = Lm, u = null;
      return t != null && (t.unstable_strictMode === true && (l = true), t.identifierPrefix !== void 0 && (o = t.identifierPrefix), t.onUncaughtError !== void 0 && (s = t.onUncaughtError), t.onCaughtError !== void 0 && (i = t.onCaughtError), t.onRecoverableError !== void 0 && (n = t.onRecoverableError), t.formState !== void 0 && (u = t.formState)), a = vh(e, 1, true, a, t ?? null, l, o, u, s, i, n, Th), a.context = wh(null), t = a.current, l = aa(), l = Df(l), o = _t(l), o.callback = null, bt(t, o, l), t = l, a.current.lanes = t, ds(a, t), Ba(a), e[Jl] = a.current, br(e), new cn(a);
    };
    pn.version = "19.2.8";
  });
  var Dh = Sa((a0, Bh) => {
    "use strict";
    function Ah() {
      if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ah);
      } catch (e) {
        console.error(e);
      }
    }
    Ah(), Bh.exports = Mh();
  });
  var ig = Sa((wn) => {
    "use strict";
    var Gx = Symbol.for("react.transitional.element"), Px = Symbol.for("react.fragment");
    function sg(e, a, t) {
      var l = null;
      if (t !== void 0 && (l = "" + t), a.key !== void 0 && (l = "" + a.key), "key" in a) {
        t = {};
        for (var o in a) o !== "key" && (t[o] = a[o]);
      } else t = a;
      return a = t.ref, { $typeof: Gx, type: e, key: l, ref: a !== void 0 ? a : null, props: t };
    }
    wn.Fragment = Px;
    wn.jsx = sg;
    wn.jsxs = sg;
  });
  var Bs = Sa((ky, ng) => {
    "use strict";
    ng.exports = ig();
  });
  var fg = at(Dh(), 1);
  var z = at(hl(), 1);
  var hn = at(hl());
  var Rh = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), mx = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (a, t, l) => l ? l.toUpperCase() : t.toLowerCase()), Cr = (e) => {
    let a = mx(e);
    return a.charAt(0).toUpperCase() + a.slice(1);
  }, mn = (...e) => e.filter((a, t, l) => !!a && a.trim() !== "" && l.indexOf(a) === t).join(" ").trim(), zh = (e) => {
    for (let a in e) if (a.startsWith("aria-") || a === "role" || a === "title") return true;
  };
  var ys = at(hl());
  var Oh = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  var qh = (0, ys.forwardRef)(({ color: e = "currentColor", size: a = 24, strokeWidth: t = 2, absoluteStrokeWidth: l, className: o = "", children: s, iconNode: i, ...n }, u) => (0, ys.createElement)("svg", { ref: u, ...Oh, width: a, height: a, stroke: e, strokeWidth: l ? Number(t) * 24 / Number(a) : t, className: mn("lucide", o), ...!s && !zh(n) && { "aria-hidden": "true" }, ...n }, [...i.map(([r, _]) => (0, ys.createElement)(r, _)), ...Array.isArray(s) ? s : [s]]));
  var Z = (e, a) => {
    let t = (0, hn.forwardRef)(({ className: l, ...o }, s) => (0, hn.createElement)(qh, { ref: s, iconNode: a, className: mn(`lucide-${Rh(Cr(e))}`, `lucide-${e}`, l), ...o }));
    return t.displayName = Cr(e), t;
  };
  var hx = [["path", { d: "M12 5v14", key: "s699le" }], ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]], Ls = Z("arrow-down", hx);
  var gx = [["path", { d: "m12 19-7-7 7-7", key: "1l729n" }], ["path", { d: "M19 12H5", key: "x3x0zl" }]], oo = Z("arrow-left", gx);
  var _x = [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]], sl = Z("arrow-right", _x);
  var bx = [["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }], ["path", { d: "M12 19V5", key: "x0mq9r" }]], vs = Z("arrow-up", bx);
  var xx = [["path", { d: "M12 7v14", key: "1akyts" }], ["path", { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z", key: "ruj8y" }]], ws = Z("book-open", xx);
  var yx = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], il = Z("check", yx);
  var Lx = [["rect", { x: "3", y: "8", width: "18", height: "4", rx: "1", key: "bkv52" }], ["path", { d: "M12 8v13", key: "1c76mn" }], ["path", { d: "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7", key: "6wjy6b" }], ["path", { d: "M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5", key: "1ihvrl" }]], so = Z("gift", Lx);
  var vx = [["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]], nl = Z("lock", vx);
  var wx = [["path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0", key: "1r0f0z" }], ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]], Ss = Z("map-pin", wx);
  var Sx = [["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }], ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]], Cs = Z("pause", Sx);
  var Cx = [["path", { d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915", key: "1i5ecw" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]], io = Z("settings", Cx);
  var kx = [["path", { d: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z", key: "1wgbhj" }]], ks = Z("shirt", kx);
  var Ix = [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }], ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]], no = Z("user", Ix);
  var Tx = [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]], Is = Z("x", Tx);
  var Hh = [{ id: 1, chapter: 1, stage: 1, name: "Th\u1EE9c D\u1EADy", width: 9, height: 9, targetText: "Ph\xE1 8 t\u01B0\u1EDDng m\u1EC1m", goals: [{ kind: "wall", target: 8 }], seconds: 0, enemies: 0, enemyText: "Kh\xF4ng c\xF3", fast: 60, bonusText: "D\u01B0\u1EDBi 60s", coins: 30, shards: 1 }, { id: 2, chapter: 1, stage: 2, name: "Slime \u0110\u1EA7u Ti\xEAn", width: 9, height: 9, targetText: "Di\u1EC7t 3 Slime R\u1EC9", goals: [{ kind: "kill", target: 3 }], seconds: 0, enemies: 3, enemyText: "3 Slime", fast: 60, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 35, shards: 1 }, { id: 3, chapter: 1, stage: 3, name: "Kho B\xE1u Trong T\u01B0\u1EDDng", width: 9, height: 11, targetText: "Nh\u1EB7t 3 Tinh Th\u1EC3", goals: [{ kind: "collect", target: 3 }], seconds: 150, enemies: 2, enemyText: "2 Slime", fast: 90, bonusText: "D\u01B0\u1EDBi 90s", coins: 40, shards: 1 }, { id: 4, chapter: 1, stage: 4, name: "B\u1EE5i R\xEAu", width: 9, height: 11, targetText: "Di\u1EC7t 6 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 6 }], seconds: 180, enemies: 6, enemyText: "3 Slime, 3 Chu\u1ED9t M\xE1y", fast: 117, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 45, shards: 1 }, { id: 5, chapter: 1, stage: 5, name: "S\u01B0\u01A1ng M\xF9 L\xE0ng", width: 9, height: 13, targetText: "S\u1ED1ng s\xF3t 60s r\u1ED3i t\xECm c\u1ED5ng", goals: [{ kind: "survive", target: 60 }], seconds: 0, enemies: 6, enemyText: "4 Slime, 2 Chu\u1ED9t", fast: 60, bonusText: "Nh\u1EB7t 2 item", coins: 50, shards: 1 }, { id: 6, chapter: 1, stage: 6, name: "Gi\u1EA3i C\u1EE9u D\xE2n L\xE0ng", width: 9, height: 13, targetText: "Gi\u1EA3i c\u1EE9u 3 d\xE2n l\xE0ng trong l\u1ED3ng", goals: [{ kind: "rescue", target: 3 }], seconds: 200, enemies: 5, enemyText: "5 Slime/Chu\u1ED9t", fast: 130, bonusText: "C\u1EE9u c\u1EA3 3 kh\xF4ng ai b\u1ECB th\u01B0\u01A1ng", coins: 55, shards: 1 }, { id: 7, chapter: 1, stage: 7, name: "C\xE1nh \u0110\u1ED3ng Th\xF9ng N\u1ED5", width: 9, height: 13, targetText: "Ph\xE1 3 th\xF9ng n\u1ED5 + di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }, { kind: "barrel", target: 3 }], seconds: 240, enemies: 9, enemyText: "4 Slime, 3 Chu\u1ED9t, 2 Binh Gi\xE1p", fast: 156, bonusText: "D\xF9ng \xEDt nh\u1EA5t 1 chu\u1ED7i n\u1ED5 3 bom", coins: 60, shards: 2 }, { id: 8, chapter: 1, stage: 8, name: "BOSS: G\u1EA5u R\u1EC9 S\xE9t", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + l\xEDnh ph\u1EE5", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 150, shards: 3 }, { id: 9, chapter: 2, stage: 1, name: "Khu R\u1EEBng T\u1ED1i", width: 9, height: 11, targetText: "Ph\xE1 15 t\u01B0\u1EDDng", goals: [{ kind: "wall", target: 15 }], seconds: 180, enemies: 3, enemyText: "3 N\u1EA5m L\xF9n", fast: 90, bonusText: "D\u01B0\u1EDBi 90s", coins: 35, shards: 1 }, { id: 10, chapter: 2, stage: 2, name: "N\u1EA5m Ph\xE2n Th\xE2n", width: 9, height: 11, targetText: "Di\u1EC7t 10 n\u1EA5m (t\xEDnh c\u1EA3 n\u1EA5m nh\u1ECF)", goals: [{ kind: "kill", target: 10 }], seconds: 200, enemies: 10, enemyText: "4 N\u1EA5m L\xF9n", fast: 130, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 40, shards: 1 }, { id: 11, chapter: 2, stage: 3, name: "M\u01B0a B\xE0o T\u1EED", width: 9, height: 13, targetText: "Nh\u1EB7t 4 Tinh Th\u1EC3", goals: [{ kind: "collect", target: 4 }], seconds: 210, enemies: 5, enemyText: "3 N\u1EA5m, 2 Ong", fast: 136, bonusText: "N\xE9 h\u1EBFt \xF4 \u0111\u1ED9c", coins: 45, shards: 1 }, { id: 12, chapter: 2, stage: 4, name: "B\u01B0\u1EDBm B\xE0o T\u1EED", width: 9, height: 13, targetText: "Di\u1EC7t 7 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 7 }], seconds: 220, enemies: 7, enemyText: "3 B\u01B0\u1EDBm, 3 N\u1EA5m, 1 Ong", fast: 150, bonusText: "D\u01B0\u1EDBi 150s", coins: 50, shards: 1 }, { id: 13, chapter: 2, stage: 5, name: "\u0110\xEAm Ph\xE1t Quang", width: 9, height: 13, targetText: "Th\u1EAFp s\xE1ng 5 c\xE2y n\u1EA5m \u0111\xE8n", goals: [{ kind: "switch", target: 5 }], seconds: 240, enemies: 6, enemyText: "4 N\u1EA5m, 2 B\u01B0\u1EDBm", fast: 100, bonusText: "Th\u1EAFp h\u1EBFt trong 100s", coins: 55, shards: 1 }, { id: 14, chapter: 2, stage: 6, name: "Gi\u1EA3i C\u1EE9u D\xE2n N\u1EA5m", width: 9, height: 15, targetText: "C\u1EE9u 4 d\xE2n n\u1EA5m b\u1ECB r\u1EC5 tr\xF3i", goals: [{ kind: "rescue", target: 4 }], seconds: 250, enemies: 7, enemyText: "4 Ong, 3 N\u1EA5m", fast: 162, bonusText: "C\u1EE9u c\u1EA3 4 kh\xF4ng th\u01B0\u01A1ng vong", coins: 60, shards: 1 }, { id: 15, chapter: 2, stage: 7, name: "M\xEA Cung R\u1EC5 C\xE2y", width: 9, height: 15, targetText: "Di\u1EC7t 10 + ph\xE1 25 t\u01B0\u1EDDng", goals: [{ kind: "kill", target: 10 }, { kind: "wall", target: 25 }], seconds: 270, enemies: 10, enemyText: "4 N\u1EA5m, 3 B\u01B0\u1EDBm, 3 Ong", fast: 176, bonusText: "Chu\u1ED7i n\u1ED5 4 bom", coins: 65, shards: 2 }, { id: 16, chapter: 2, stage: 8, name: "BOSS: N\u1EEF Ho\xE0ng B\xE0o T\u1EED", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + N\u1EA5m L\xF9n", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 180, shards: 3 }, { id: 17, chapter: 3, stage: 1, name: "C\u1EEDa H\u1EA7m", width: 9, height: 11, targetText: "Ph\xE1 12 t\u01B0\u1EDDng \u0111\xE1", goals: [{ kind: "wall", target: 12 }], seconds: 200, enemies: 3, enemyText: "3 D\u01A1i", fast: 100, bonusText: "D\u01B0\u1EDBi 100s", coins: 40, shards: 1 }, { id: 18, chapter: 3, stage: 2, name: "Ray Xe Go\xF2ng", width: 9, height: 13, targetText: "Di\u1EC7t 5 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 5 }], seconds: 210, enemies: 6, enemyText: "4 D\u01A1i, 2 Chu\u1ED9t Ch\u0169i", fast: 136, bonusText: "D\u1EE5 2 \u0111\u1ECBch v\xE0o xe go\xF2ng", coins: 45, shards: 1 }, { id: 19, chapter: 3, stage: 3, name: "M\u1EA1ch Qu\u1EB7ng", width: 9, height: 13, targetText: "Nh\u1EB7t 5 qu\u1EB7ng", goals: [{ kind: "collect", target: 5 }], seconds: 220, enemies: 5, enemyText: "3 Chu\u1ED9t Ch\u0169i, 2 Golem", fast: 150, bonusText: "D\u01B0\u1EDBi 150s", coins: 50, shards: 1 }, { id: 20, chapter: 3, stage: 4, name: "Chu\u1ED9t Ch\u0169i", width: 9, height: 13, targetText: "Di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }], seconds: 230, enemies: 8, enemyText: "5 Chu\u1ED9t Ch\u0169i, 2 D\u01A1i", fast: 150, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 55, shards: 1 }, { id: 21, chapter: 3, stage: 5, name: "S\u1EADp H\u1EA7m", width: 9, height: 13, targetText: "S\u1ED1ng s\xF3t 75s", goals: [{ kind: "survive", target: 75 }], seconds: 0, enemies: 6, enemyText: "3 D\u01A1i, 3 Chu\u1ED9t", fast: 60, bonusText: "Kh\xF4ng b\u1ECB \u0111\xE1 r\u01A1i tr\xFAng", coins: 60, shards: 1 }, { id: 22, chapter: 3, stage: 6, name: "Gi\u1EA3i C\u1EE9u Th\u1EE3 M\u1ECF", width: 9, height: 15, targetText: "C\u1EE9u 4 th\u1EE3 m\u1ECF", goals: [{ kind: "rescue", target: 4 }], seconds: 260, enemies: 7, enemyText: "4 Golem, 3 D\u01A1i", fast: 180, bonusText: "C\u1EE9u \u0111\u1EE7 4 trong 180s", coins: 65, shards: 1 }, { id: 23, chapter: 3, stage: 7, name: "M\xEA Cung Pha L\xEA", width: 9, height: 15, targetText: "K\xEDch ho\u1EA1t 4 c\xF4ng t\u1EAFc theo th\u1EE9 t\u1EF1 + di\u1EC7t 6 Golem", goals: [{ kind: "kill", target: 6 }, { kind: "switch", target: 4 }], seconds: 290, enemies: 9, enemyText: "6 Golem, 3 Chu\u1ED9t", fast: 188, bonusText: "Kh\xF4ng d\xF9ng booster", coins: 70, shards: 2 }, { id: 24, chapter: 3, stage: 8, name: "BOSS: S\xE2u Khoan Kh\u1ED5ng L\u1ED3", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + Chu\u1ED9t Ch\u0169i", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 200, shards: 3 }, { id: 25, chapter: 4, stage: 1, name: "B\xE3o C\xE1t \u0110\u1EA7u Ti\xEAn", width: 9, height: 11, targetText: "Ph\xE1 18 t\u01B0\u1EDDng", goals: [{ kind: "wall", target: 18 }], seconds: 200, enemies: 3, enemyText: "3 B\u1ECD C\u1EA1p", fast: 100, bonusText: "D\u01B0\u1EDBi 100s", coins: 45, shards: 1 }, { id: 26, chapter: 4, stage: 2, name: "X\xE1c \u01AF\u1EDBp T\xE1i Sinh", width: 9, height: 13, targetText: "Di\u1EC7t 6 X\xE1c \u01AF\u1EDBp (h\u1ED3i sinh t\xEDnh 1 l\u1EA7n)", goals: [{ kind: "kill", target: 6 }], seconds: 220, enemies: 6, enemyText: "6 X\xE1c \u01AF\u1EDBp", fast: 143, bonusText: "Kh\xF4ng \u0111\u1EC3 h\u1ED3i sinh", coins: 50, shards: 1 }, { id: 27, chapter: 4, stage: 3, name: "B\u1EABy Gai", width: 9, height: 13, targetText: "Nh\u1EB7t 4 Ng\u1ECDc C\u1ED5", goals: [{ kind: "collect", target: 4 }], seconds: 230, enemies: 5, enemyText: "3 B\u1ECD C\u1EA1p, 2 X\xE1c \u01AF\u1EDBp", fast: 150, bonusText: "Kh\xF4ng d\xEDnh gai", coins: 55, shards: 1 }, { id: 28, chapter: 4, stage: 4, name: "Kho B\xE1u Pharaoh", width: 9, height: 13, targetText: "Nh\u1EB7t 5 ng\u1ECDc, tr\xE1nh b\u1EABy", goals: [{ kind: "collect", target: 5 }], seconds: 240, enemies: 5, enemyText: "2 Linh H\u1ED3n, 3 B\u1ECD C\u1EA1p", fast: 160, bonusText: "D\u01B0\u1EDBi 160s", coins: 60, shards: 1 }, { id: 29, chapter: 4, stage: 5, name: "C\u01A1n B\xE3o C\xE1t", width: 9, height: 15, targetText: "S\u1ED1ng s\xF3t 70s", goals: [{ kind: "survive", target: 70 }], seconds: 0, enemies: 4, enemyText: "4 B\u1ECD C\u1EA1p", fast: 60, bonusText: "Kh\xF4ng b\u1ECB \u0111\u1EA9y v\xE0o gai", coins: 65, shards: 1 }, { id: 30, chapter: 4, stage: 6, name: "Gi\u1EA3i M\xE3 T\u01B0\u1EE3ng H\xECnh", width: 9, height: 15, targetText: "K\xEDch ho\u1EA1t 4 k\xFD hi\u1EC7u theo th\u1EE9 t\u1EF1 hi\u1EC3n th\u1ECB", goals: [{ kind: "switch", target: 4 }], seconds: 260, enemies: 6, enemyText: "4 X\xE1c \u01AF\u1EDBp, 2 Linh H\u1ED3n", fast: 169, bonusText: "\u0110\xFAng th\u1EE9 t\u1EF1 l\u1EA7n \u0111\u1EA7u", coins: 70, shards: 1 }, { id: 31, chapter: 4, stage: 7, name: "Trong Kim T\u1EF1 Th\xE1p", width: 9, height: 15, targetText: "Di\u1EC7t 10 + k\xEDch ho\u1EA1t 3 c\xF4ng t\u1EAFc", goals: [{ kind: "kill", target: 10 }, { kind: "switch", target: 3 }], seconds: 300, enemies: 10, enemyText: "10 h\u1ED7n h\u1EE3p", fast: 195, bonusText: "Chu\u1ED7i n\u1ED5 4 bom", coins: 75, shards: 2 }, { id: 32, chapter: 4, stage: 8, name: "BOSS: Pharaoh C\xE1t", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + X\xE1c \u01AF\u1EDBp", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 220, shards: 3 }, { id: 33, chapter: 5, stage: 1, name: "B\u1EBFn C\u1EA3ng", width: 9, height: 13, targetText: "Ph\xE1 20 t\u01B0\u1EDDng", goals: [{ kind: "wall", target: 20 }], seconds: 220, enemies: 3, enemyText: "3 Cua Gi\xE1p", fast: 110, bonusText: "D\u01B0\u1EDBi 110s", coins: 50, shards: 1 }, { id: 34, chapter: 5, stage: 2, name: "Th\u1EE7y Tri\u1EC1u", width: 9, height: 13, targetText: "Di\u1EC7t 6 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 6 }], seconds: 230, enemies: 6, enemyText: "4 Cua, 2 H\u1EA3i \xC2u", fast: 150, bonusText: "Kh\xF4ng b\u1ECB cu\u1ED1n", coins: 55, shards: 1 }, { id: 35, chapter: 5, stage: 3, name: "Th\xF9ng Rum", width: 9, height: 15, targetText: "Ph\xE1 5 th\xF9ng rum + nh\u1EB7t 3 Tinh Th\u1EC3", goals: [{ kind: "barrel", target: 5 }, { kind: "collect", target: 3 }], seconds: 250, enemies: 3, enemyText: "3 H\u1EA3i T\u1EB7c", fast: 162, bonusText: "Chu\u1ED7i n\u1ED5 3 th\xF9ng", coins: 60, shards: 1 }, { id: 36, chapter: 5, stage: 4, name: "Kh\u1EA9u \u0110\u1EA1i B\xE1c", width: 9, height: 15, targetText: "Di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }], seconds: 260, enemies: 8, enemyText: "3 H\u1EA3i T\u1EB7c, 3 Cua, 2 H\u1EA3i \xC2u", fast: 169, bonusText: "Kh\xF4ng tr\xFAng \u0111\u1EA1n", coins: 65, shards: 1 }, { id: 37, chapter: 5, stage: 5, name: "B\xE3o Bi\u1EC3n", width: 9, height: 15, targetText: "S\u1ED1ng s\xF3t 80s", goals: [{ kind: "survive", target: 80 }], seconds: 0, enemies: 7, enemyText: "4 H\u1EA3i \xC2u, 3 Cua", fast: 60, bonusText: "Nh\u1EB7t 3 item", coins: 70, shards: 1 }, { id: 38, chapter: 5, stage: 6, name: "Gi\u1EA3i C\u1EE9u Th\u1EE7y Th\u1EE7", width: 9, height: 15, targetText: "C\u1EE9u 4 th\u1EE7y th\u1EE7 \u1EDF c\xE1c l\u1ED3ng", goals: [{ kind: "rescue", target: 4 }], seconds: 280, enemies: 8, enemyText: "4 H\u1EA3i T\u1EB7c, 4 Cua", fast: 200, bonusText: "C\u1EE9u \u0111\u1EE7 4 d\u01B0\u1EDBi 200s", coins: 75, shards: 1 }, { id: 39, chapter: 5, stage: 7, name: "Hang Kho B\xE1u", width: 9, height: 15, targetText: "Nh\u1EB7t 6 r\u01B0\u01A1ng + di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }, { kind: "collect", target: 6 }], seconds: 300, enemies: 8, enemyText: "8 h\u1ED7n h\u1EE3p", fast: 195, bonusText: "M\u1EDF r\u01B0\u01A1ng b\xED m\u1EADt", coins: 80, shards: 2 }, { id: 40, chapter: 5, stage: 8, name: "BOSS: Thuy\u1EC1n Tr\u01B0\u1EDFng H\u1EA1c S\u1EAFt", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + H\u1EA3i T\u1EB7c", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 240, shards: 3 }, { id: 41, chapter: 6, stage: 1, name: "\u0110\u01B0\u1EDDng Tr\u01B0\u1EE3t", width: 9, height: 13, targetText: "Ph\xE1 16 t\u01B0\u1EDDng", goals: [{ kind: "wall", target: 16 }], seconds: 220, enemies: 3, enemyText: "3 C\xE1nh C\u1EE5t", fast: 100, bonusText: "D\u01B0\u1EDBi 100s", coins: 55, shards: 1 }, { id: 42, chapter: 6, stage: 2, name: "T\u01B0\u1EDDng B\u0103ng", width: 9, height: 13, targetText: "Ph\xE1 6 t\u01B0\u1EDDng b\u0103ng", goals: [{ kind: "ice", target: 6 }], seconds: 230, enemies: 3, enemyText: "3 Ng\u01B0\u1EDDi Tuy\u1EBFt", fast: 150, bonusText: "D\xF9ng 2 Bom L\u1EEDa", coins: 60, shards: 1 }, { id: 43, chapter: 6, stage: 3, name: "Ng\u01B0\u1EDDi Tuy\u1EBFt", width: 9, height: 15, targetText: "Di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }], seconds: 250, enemies: 8, enemyText: "4 Ng\u01B0\u1EDDi Tuy\u1EBFt, 2 S\xF3i", fast: 162, bonusText: "Kh\xF4ng d\xEDnh c\u1EA7u tuy\u1EBFt", coins: 65, shards: 1 }, { id: 44, chapter: 6, stage: 4, name: "Hang B\u0103ng", width: 9, height: 15, targetText: "Gi\u1EA3i ph\xF3ng 5 Tinh Th\u1EC3 \u0111\xF3ng b\u0103ng", goals: [{ kind: "collect", target: 5 }], seconds: 260, enemies: 6, enemyText: "3 S\xF3i, 3 C\xE1nh C\u1EE5t", fast: 170, bonusText: "D\u01B0\u1EDBi 170s", coins: 70, shards: 1 }, { id: 45, chapter: 6, stage: 5, name: "B\xE3o Tuy\u1EBFt", width: 9, height: 15, targetText: "S\u1ED1ng s\xF3t 80s", goals: [{ kind: "survive", target: 80 }], seconds: 0, enemies: 7, enemyText: "4 S\xF3i, 3 Ng\u01B0\u1EDDi Tuy\u1EBFt", fast: 60, bonusText: "Gi\u1EEF nhi\u1EC7t kh\xF4ng v\u1EC1 0", coins: 75, shards: 1 }, { id: 46, chapter: 6, stage: 6, name: "Gi\u1EA3i C\u1EE9u C\xE1nh C\u1EE5t", width: 9, height: 15, targetText: "C\u1EE9u 4 ch\xFA c\xE1nh c\u1EE5t", goals: [{ kind: "rescue", target: 4 }], seconds: 270, enemies: 8, enemyText: "5 Ng\u01B0\u1EDDi Tuy\u1EBFt, 3 S\xF3i", fast: 176, bonusText: "C\u1EE9u \u0111\u1EE7 4 kh\xF4ng b\u1ECB th\u01B0\u01A1ng", coins: 80, shards: 1 }, { id: 47, chapter: 6, stage: 7, name: "C\u1EA7u B\u0103ng N\u1EE9t", width: 9, height: 15, targetText: "Di\u1EC7t 10 + ph\xE1 4 c\u1ED9t b\u0103ng", goals: [{ kind: "kill", target: 10 }, { kind: "ice", target: 4 }], seconds: 300, enemies: 10, enemyText: "10 h\u1ED7n h\u1EE3p", fast: 195, bonusText: "Kh\xF4ng r\u01A1i xu\u1ED1ng n\u01B0\u1EDBc", coins: 85, shards: 2 }, { id: 48, chapter: 6, stage: 8, name: "BOSS: Yeti B\u0103ng Gi\xE1", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + S\xF3i B\u0103ng", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 260, shards: 3 }, { id: 49, chapter: 7, stage: 1, name: "C\u1ED5ng Th\xE0nh", width: 9, height: 13, targetText: "Ph\xE1 22 t\u01B0\u1EDDng", goals: [{ kind: "wall", target: 22 }], seconds: 230, enemies: 3, enemyText: "3 Robot Tu\u1EA7n Tra", fast: 110, bonusText: "D\u01B0\u1EDBi 110s", coins: 60, shards: 1 }, { id: 50, chapter: 7, stage: 2, name: "B\u0103ng Chuy\u1EC1n", width: 9, height: 15, targetText: "Di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }], seconds: 250, enemies: 8, enemyText: "4 Tu\u1EA7n Tra, 3 Drone", fast: 162, bonusText: "Kh\xF4ng b\u1ECB \u0111\u1EA9y v\xE0o \u0111\u1ECBch", coins: 65, shards: 1 }, { id: 51, chapter: 7, stage: 3, name: "D\u1ECBch Chuy\u1EC3n", width: 9, height: 15, targetText: "Nh\u1EB7t 5 Tinh Th\u1EC3", goals: [{ kind: "collect", target: 5 }], seconds: 260, enemies: 6, enemyText: "3 Drone, 3 Ph\xE1 Ho\u1EA1i", fast: 169, bonusText: "D\u1ECBch chuy\u1EC3n bom th\xE0nh c\xF4ng 2 l\u1EA7n", coins: 70, shards: 1 }, { id: 52, chapter: 7, stage: 4, name: "R\xE0o Laser", width: 9, height: 15, targetText: "Ph\xE1 8 tr\u1EA1m laser", goals: [{ kind: "machine", target: 8 }], seconds: 270, enemies: 6, enemyText: "4 Ph\xE1 Ho\u1EA1i, 2 Tu\u1EA7n Tra", fast: 176, bonusText: "Kh\xF4ng ch\u1EA1m laser", coins: 75, shards: 1 }, { id: 53, chapter: 7, stage: 5, name: "M\u1EA5t \u0110i\u1EC7n", width: 9, height: 15, targetText: "S\u1ED1ng s\xF3t 80s, sau \u0111\xF3 kh\u1EDFi \u0111\u1ED9ng l\u1EA1i l\u01B0\u1EDBi \u0111i\u1EC7n", goals: [{ kind: "survive", target: 80 }, { kind: "switch", target: 1 }], seconds: 0, enemies: 5, enemyText: "5 Drone", fast: 60, bonusText: "Gi\u1EEF \u0111\u1EE7 3 tim", coins: 80, shards: 1 }, { id: 54, chapter: 7, stage: 6, name: "K\u1EBB Ph\u1EA3n B\u1ED9i", width: 9, height: 15, targetText: "C\u1EE9u 4 robot + \u0111\u1ED1i \u0111\u1EA7u Gizmo", goals: [{ kind: "rescue", target: 4 }], seconds: 280, enemies: 6, enemyText: "6 Ph\xE1 Ho\u1EA1i", fast: 182, bonusText: "C\u1EE9u \u0111\u1EE7 4", coins: 85, shards: 1 }, { id: 55, chapter: 7, stage: 7, name: "Nh\xE0 M\xE1y R\u1EC9 S\xE9t", width: 9, height: 17, targetText: "Di\u1EC7t 12 + ph\xE1 3 m\xE1y ph\xE1t", goals: [{ kind: "kill", target: 12 }, { kind: "machine", target: 3 }], seconds: 320, enemies: 12, enemyText: "12 h\u1ED7n h\u1EE3p", fast: 208, bonusText: "Chu\u1ED7i n\u1ED5 4 bom", coins: 90, shards: 2 }, { id: 56, chapter: 7, stage: 8, name: "BOSS: Robot T\u1ED5ng Qu\u1EA3n MK-7", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + Drone", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 280, shards: 3 }, { id: 57, chapter: 8, stage: 1, name: "Ch\xE2n N\xFAi L\u1EEDa", width: 9, height: 13, targetText: "Ph\xE1 22 t\u01B0\u1EDDng", goals: [{ kind: "wall", target: 22 }], seconds: 240, enemies: 3, enemyText: "3 Qu\u1EF7 L\u1EEDa", fast: 120, bonusText: "D\u01B0\u1EDBi 120s", coins: 65, shards: 1 }, { id: 58, chapter: 8, stage: 2, name: "D\xF2ng Dung Nham", width: 9, height: 15, targetText: "Di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }], seconds: 260, enemies: 8, enemyText: "4 Qu\u1EF7 L\u1EEDa, 2 D\u01A1i", fast: 169, bonusText: "Kh\xF4ng ch\u1EA1m dung nham", coins: 70, shards: 1 }, { id: 59, chapter: 8, stage: 3, name: "\u0110\xE1 N\xF3ng", width: 9, height: 15, targetText: "Nh\u1EB7t 5 Tinh Th\u1EC3", goals: [{ kind: "collect", target: 5 }], seconds: 270, enemies: 5, enemyText: "3 Golem, 2 D\u01A1i", fast: 176, bonusText: "Kh\xF4ng d\xEDnh \u0111\xE1 n\u1ED5", coins: 75, shards: 1 }, { id: 60, chapter: 8, stage: 4, name: "C\u1EA7u \u0110\xE1 N\u1ED5i", width: 9, height: 15, targetText: "Qua 3 v\xF9ng dung nham, di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }, { kind: "visit", target: 3 }], seconds: 290, enemies: 8, enemyText: "5 Qu\u1EF7, 3 Golem", fast: 188, bonusText: "Kh\xF4ng r\u01A1i xu\u1ED1ng", coins: 80, shards: 1 }, { id: 61, chapter: 8, stage: 5, name: "Phun Tr\xE0o", width: 9, height: 15, targetText: "S\u1ED1ng s\xF3t 90s", goals: [{ kind: "survive", target: 90 }], seconds: 0, enemies: 7, enemyText: "4 D\u01A1i, 3 Qu\u1EF7", fast: 60, bonusText: "Gi\u1EEF \u0111\u1EE7 3 tim", coins: 85, shards: 1 }, { id: 62, chapter: 8, stage: 6, name: "\u0110i T\xECm B\xF9m", width: 9, height: 17, targetText: "T\xECm 3 d\u1EA5u v\u1EBFt c\u1EE7a B\xF9m + di\u1EC7t 6 Golem", goals: [{ kind: "kill", target: 6 }, { kind: "collect", target: 3 }], seconds: 300, enemies: 10, enemyText: "6 Golem, 4 D\u01A1i", fast: 195, bonusText: "T\xECm \u0111\u1EE7 kh\xF4ng d\xF9ng Radar", coins: 90, shards: 1 }, { id: 63, chapter: 8, stage: 7, name: "Hang L\u1EEDa", width: 9, height: 17, targetText: "Di\u1EC7t 12 + ph\xE1 3 l\xF2 r\xE8n", goals: [{ kind: "kill", target: 12 }, { kind: "machine", target: 3 }], seconds: 330, enemies: 12, enemyText: "12 h\u1ED7n h\u1EE3p", fast: 214, bonusText: "Chu\u1ED7i n\u1ED5 4 bom", coins: 95, shards: 2 }, { id: 64, chapter: 8, stage: 8, name: "BOSS: R\u1ED3ng Dung Nham", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + Qu\u1EF7 L\u1EEDa", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 300, shards: 3 }, { id: 65, chapter: 9, stage: 1, name: "C\u1ED5ng L\xE2u \u0110\xE0i", width: 9, height: 13, targetText: "Ph\xE1 24 t\u01B0\u1EDDng", goals: [{ kind: "wall", target: 24 }], seconds: 250, enemies: 3, enemyText: "3 B\u1ED9 X\u01B0\u01A1ng", fast: 120, bonusText: "D\u01B0\u1EDBi 120s", coins: 70, shards: 1 }, { id: 66, chapter: 9, stage: 2, name: "C\u1EEDa Ma", width: 9, height: 15, targetText: "Di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }], seconds: 270, enemies: 8, enemyText: "4 Ma M\u1EDD, 3 B\u1ED9 X\u01B0\u01A1ng", fast: 176, bonusText: "Kh\xF4ng l\u1EA1c ph\xF2ng", coins: 75, shards: 1 }, { id: 67, chapter: 9, stage: 3, name: "G\u01B0\u01A1ng Ma", width: 9, height: 15, targetText: "Nh\u1EB7t 5 Tinh Th\u1EC3", goals: [{ kind: "collect", target: 5 }], seconds: 280, enemies: 6, enemyText: "3 Ma, 3 D\u01A1i Ma", fast: 182, bonusText: "D\xF9ng ph\u1EA3n chi\u1EBFu di\u1EC7t 2 \u0111\u1ECBch", coins: 80, shards: 1 }, { id: 68, chapter: 9, stage: 4, name: "\u0110\xE8n L\u1ED3ng", width: 9, height: 15, targetText: "Th\u1EAFp 6 \u0111\xE8n + di\u1EC7t 8 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 8 }, { kind: "switch", target: 6 }], seconds: 300, enemies: 9, enemyText: "5 Ma, 4 B\u1ED9 X\u01B0\u01A1ng", fast: 150, bonusText: "Th\u1EAFp h\u1EBFt trong 150s", coins: 85, shards: 1 }, { id: 69, chapter: 9, stage: 5, name: "\u0110\xEAm T\u1ED1i Th\u1EB3m", width: 9, height: 15, targetText: "S\u1ED1ng s\xF3t 90s", goals: [{ kind: "survive", target: 90 }], seconds: 0, enemies: 9, enemyText: "6 Ma, 3 D\u01A1i Ma", fast: 60, bonusText: "Kh\xF4ng b\u1ECB ch\u1EA1m", coins: 90, shards: 1 }, { id: 70, chapter: 9, stage: 6, name: "Gi\u1EA3i C\u1EE9u B\xF9m", width: 9, height: 17, targetText: "Ph\xE1 4 phong \u1EA5n giam B\xF9m", goals: [{ kind: "machine", target: 4 }], seconds: 320, enemies: 8, enemyText: "8 h\u1ED7n h\u1EE3p", fast: 208, bonusText: "Ph\xE1 \u0111\xFAng th\u1EE9 t\u1EF1", coins: 95, shards: 1 }, { id: 71, chapter: 9, stage: 7, name: "S\u1EF1 Th\u1EADt C\u1EE7a Vua", width: 9, height: 17, targetText: "Di\u1EC7t 12 + gi\u1EA3i 3 c\xE2u \u0111\u1ED1 g\u01B0\u01A1ng", goals: [{ kind: "kill", target: 12 }, { kind: "switch", target: 3 }], seconds: 340, enemies: 12, enemyText: "12 h\u1ED7n h\u1EE3p", fast: 221, bonusText: "Kh\xF4ng d\xF9ng booster", coins: 100, shards: 2 }, { id: 72, chapter: 9, stage: 8, name: "BOSS: Hi\u1EC7p S\u0129 B\xF3ng \u0110\xEAm", width: 9, height: 11, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "Boss + Ma M\u1EDD", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 320, shards: 3 }, { id: 73, chapter: 10, stage: 1, name: "C\u1ED5ng Ph\xE1o \u0110\xE0i", width: 9, height: 15, targetText: "Ph\xE1 28 t\u01B0\u1EDDng + di\u1EC7t 6 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 6 }, { kind: "wall", target: 28 }], seconds: 280, enemies: 11, enemyText: "R\xEAu + N\u1EA5m", fast: 150, bonusText: "D\u01B0\u1EDBi 150s", coins: 75, shards: 1 }, { id: 74, chapter: 10, stage: 2, name: "M\u1ECF T\u1ED1i Th\u01B0\u1EE3ng", width: 9, height: 15, targetText: "Nh\u1EB7t 6 Tinh Th\u1EC3", goals: [{ kind: "collect", target: 6 }], seconds: 300, enemies: 11, enemyText: "H\u1EA7m m\u1ECF + Sa m\u1EA1c", fast: 195, bonusText: "Kh\xF4ng d\xEDnh b\u1EABy", coins: 80, shards: 1 }, { id: 75, chapter: 10, stage: 3, name: "H\u1EA1m \u0110\u1ED9i B\u0103ng", width: 9, height: 17, targetText: "Di\u1EC7t 12 k\u1EBB th\xF9", goals: [{ kind: "kill", target: 12 }], seconds: 320, enemies: 12, enemyText: "\u0110\u1EA3o h\u1EA3i t\u1EB7c + Tuy\u1EBFt", fast: 208, bonusText: "Kh\xF4ng r\u01A1i xu\u1ED1ng", coins: 85, shards: 1 }, { id: 76, chapter: 10, stage: 4, name: "X\u01B0\u1EDFng Ch\u1EBF T\u1EA1o", width: 9, height: 17, targetText: "Ph\xE1 4 m\xE1y ph\xE1t + di\u1EC7t 10", goals: [{ kind: "kill", target: 10 }, { kind: "machine", target: 4 }], seconds: 340, enemies: 11, enemyText: "C\u01A1 kh\xED + N\xFAi l\u1EEDa", fast: 221, bonusText: "Chu\u1ED7i n\u1ED5 5 bom", coins: 90, shards: 1 }, { id: 77, chapter: 10, stage: 5, name: "H\xE0nh Lang B\xF3ng T\u1ED1i", width: 9, height: 17, targetText: "S\u1ED1ng s\xF3t 100s + th\u1EAFp 5 \u0111\xE8n", goals: [{ kind: "switch", target: 5 }, { kind: "survive", target: 100 }, { kind: "switch", target: 5 }], seconds: 0, enemies: 11, enemyText: "B\xF3ng ma + S\u01B0\u01A1ng m\xF9", fast: 60, bonusText: "Kh\xF4ng b\u1ECB ch\u1EA1m", coins: 95, shards: 1 }, { id: 78, chapter: 10, stage: 6, name: "H\u1ED9i T\u1EE5 B\u1EA1n B\xE8", width: 9, height: 17, targetText: "C\u1EE9u to\xE0n b\u1ED9 b\u1EA1n b\xE8 \u1EDF 9 ch\u01B0\u01A1ng", goals: [{ kind: "rescue", target: 9 }], seconds: 360, enemies: 11, enemyText: "T\u1EA5t c\u1EA3", fast: 234, bonusText: "C\u1EE9u \u0111\u1EE7 kh\xF4ng ai b\u1ECB th\u01B0\u01A1ng", coins: 100, shards: 1 }, { id: 79, chapter: 10, stage: 7, name: "L\u1ED1i V\xE0o Ph\xF2ng L\xF5i", width: 9, height: 17, targetText: "Di\u1EC7t 15 + k\xEDch ho\u1EA1t 4 c\xF4ng t\u1EAFc", goals: [{ kind: "kill", target: 15 }, { kind: "switch", target: 4 }], seconds: 380, enemies: 15, enemyText: "T\u1EA5t c\u1EA3", fast: 247, bonusText: "Kh\xF4ng d\xF9ng booster", coins: 105, shards: 2 }, { id: 80, chapter: 10, stage: 8, name: "BOSS CU\u1ED0I: Vua R\u1EC9 S\xE9t", width: 9, height: 13, targetText: "H\u1EA1 boss", goals: [{ kind: "boss", target: 1 }], seconds: 0, enemies: 0, enemyText: "T\u1ED5ng h\u1EE3p", fast: 180, bonusText: "Kh\xF4ng m\u1EA5t tim", coins: 500, shards: 5 }];
  var Uh = { note: "Placeholder boss 160x176 (th\xE2n boss ~3x3 \xF4); m\u1ED7i boss c\xF3 3 giai \u0111o\u1EA1n + khung l\u1ED9 \u0111i\u1EC3m y\u1EBFu + icon thanh m\xE1u", bosses: [{ id: "gau_ri_set", name_vi: "G\u1EA5u R\u1EC9 S\xE9t", chapter: 1, hp_hits: 9, phases: 3, weak_point: "L\u01B0ng, l\u1ED9 khi \u0111\xE2m t\u01B0\u1EDDng v\xE0 cho\xE1ng 4 gi\xE2y", canvas: [160, 176], frames: { phase1: "png_boss/frames/gau_ri_set_p1.png", phase2: "png_boss/frames/gau_ri_set_p2.png", phase3: "png_boss/frames/gau_ri_set_p3.png", weak_exposed: "png_boss/frames/gau_ri_set_weak.png" }, icon: "png_boss/icons/icon_gau_ri_set.png" }, { id: "nu_hoang_bao_tu", name_vi: "N\u1EEF Ho\xE0ng B\xE0o T\u1EED", chapter: 2, hp_hits: 12, phases: 3, weak_point: "N\xF3n n\u1EA5m h\u1EA1 th\u1EA5p sau khi phun b\xE0o t\u1EED", canvas: [160, 176], frames: { phase1: "png_boss/frames/nu_hoang_bao_tu_p1.png", phase2: "png_boss/frames/nu_hoang_bao_tu_p2.png", phase3: "png_boss/frames/nu_hoang_bao_tu_p3.png", weak_exposed: "png_boss/frames/nu_hoang_bao_tu_weak.png" }, icon: "png_boss/icons/icon_nu_hoang_bao_tu.png" }, { id: "sau_khoan", name_vi: "S\xE2u Khoan Kh\u1ED5ng L\u1ED3", chapter: 3, hp_hits: 15, phases: 3, weak_point: "M\u0169i khoan tr\xEAn \u0111\u1EA7u khi tr\u1ED3i l\xEAn", canvas: [160, 176], frames: { phase1: "png_boss/frames/sau_khoan_p1.png", phase2: "png_boss/frames/sau_khoan_p2.png", phase3: "png_boss/frames/sau_khoan_p3.png", weak_exposed: "png_boss/frames/sau_khoan_weak.png" }, icon: "png_boss/icons/icon_sau_khoan.png" }, { id: "pharaoh_cat", name_vi: "Pharaoh C\xE1t", chapter: 4, hp_hits: 18, phases: 3, weak_point: "M\u1EB7t n\u1EA1 v\xE0ng khi 4 tr\u1EE5 \u0111\xE1 c\xF9ng s\xE1ng", canvas: [160, 176], frames: { phase1: "png_boss/frames/pharaoh_cat_p1.png", phase2: "png_boss/frames/pharaoh_cat_p2.png", phase3: "png_boss/frames/pharaoh_cat_p3.png", weak_exposed: "png_boss/frames/pharaoh_cat_weak.png" }, icon: "png_boss/icons/icon_pharaoh_cat.png" }, { id: "thuyen_truong_hac_sat", name_vi: "Thuy\u1EC1n Tr\u01B0\u1EDFng H\u1EA1c S\u1EAFt", chapter: 5, hp_hits: 21, phases: 3, weak_point: "B\xE1nh l\xE1i \u1EDF \u0111u\xF4i thuy\u1EC1n khi neo b\u1ECB g\u1EE1", canvas: [160, 176], frames: { phase1: "png_boss/frames/thuyen_truong_hac_sat_p1.png", phase2: "png_boss/frames/thuyen_truong_hac_sat_p2.png", phase3: "png_boss/frames/thuyen_truong_hac_sat_p3.png", weak_exposed: "png_boss/frames/thuyen_truong_hac_sat_weak.png" }, icon: "png_boss/icons/icon_thuyen_truong_hac_sat.png" }, { id: "yeti_bang_gia", name_vi: "Yeti B\u0103ng Gi\xE1", chapter: 6, hp_hits: 24, phases: 3, weak_point: "Kh\u1ED1i b\u0103ng tr\xEAn \u0111\u1EA7u (Bom L\u1EEDa ho\u1EB7c n\u1ED5 d\xE2y chuy\u1EC1n)", canvas: [160, 176], frames: { phase1: "png_boss/frames/yeti_bang_gia_p1.png", phase2: "png_boss/frames/yeti_bang_gia_p2.png", phase3: "png_boss/frames/yeti_bang_gia_p3.png", weak_exposed: "png_boss/frames/yeti_bang_gia_weak.png" }, icon: "png_boss/icons/icon_yeti_bang_gia.png" }, { id: "robot_mk7", name_vi: "Robot T\u1ED5ng Qu\u1EA3n MK-7", chapter: 7, hp_hits: 27, phases: 3, weak_point: "L\xF5i n\u0103ng l\u01B0\u1EE3ng \u1EDF ng\u1EF1c khi gi\xE1p tr\u01B0\u1EE3t ra", canvas: [160, 176], frames: { phase1: "png_boss/frames/robot_mk7_p1.png", phase2: "png_boss/frames/robot_mk7_p2.png", phase3: "png_boss/frames/robot_mk7_p3.png", weak_exposed: "png_boss/frames/robot_mk7_weak.png" }, icon: "png_boss/icons/icon_robot_mk7.png" }, { id: "rong_dung_nham", name_vi: "R\u1ED3ng Dung Nham", chapter: 8, hp_hits: 30, phases: 3, weak_point: "B\u1EE5ng khi r\u1ED3ng h\u1EA1 c\xE1nh", canvas: [160, 176], frames: { phase1: "png_boss/frames/rong_dung_nham_p1.png", phase2: "png_boss/frames/rong_dung_nham_p2.png", phase3: "png_boss/frames/rong_dung_nham_p3.png", weak_exposed: "png_boss/frames/rong_dung_nham_weak.png" }, icon: "png_boss/icons/icon_rong_dung_nham.png" }, { id: "hiep_si_bong_dem", name_vi: "Hi\u1EC7p S\u0129 B\xF3ng \u0110\xEAm", chapter: 9, hp_hits: 33, phases: 3, weak_point: "Th\xE2n th\u1EADt khi \u0111\u1EE9ng d\u01B0\u1EDBi \xE1nh \u0111\xE8n", canvas: [160, 176], frames: { phase1: "png_boss/frames/hiep_si_bong_dem_p1.png", phase2: "png_boss/frames/hiep_si_bong_dem_p2.png", phase3: "png_boss/frames/hiep_si_bong_dem_p3.png", weak_exposed: "png_boss/frames/hiep_si_bong_dem_weak.png" }, icon: "png_boss/icons/icon_hiep_si_bong_dem.png" }, { id: "vua_ri_set", name_vi: "Vua R\u1EC9 S\xE9t", chapter: 10, hp_hits: 45, phases: 3, weak_point: "L\xF5i T\u1ED1i \u1EDF ng\u1EF1c khi \xE1o gi\xE1p bong ra", canvas: [160, 176], frames: { phase1: "png_boss/frames/vua_ri_set_p1.png", phase2: "png_boss/frames/vua_ri_set_p2.png", phase3: "png_boss/frames/vua_ri_set_p3.png", weak_exposed: "png_boss/frames/vua_ri_set_weak.png" }, icon: "png_boss/icons/icon_vua_ri_set.png" }] };
  var Eh = { note: "Overlay 48x64 c\u0103n theo pip_base_nohat.png; th\u1EE9 t\u1EF1 gh\xE9p: back, base, outfit, shoes, hair, face, hat. Cosmetic ch\u1EC9 l\xE0m \u0111\u1EB9p.", items: [{ slot: "hat", id: "mu_gau", vi: "M\u0169 G\u1EA5u", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set1", overlay: "png_cos/wear_hat/mu_gau.png", icon: "png_cos/icons/icon_mu_gau.png", canvas: [48, 64] }, { slot: "hat", id: "mu_nam_hoang_gia", vi: "M\u0169 N\u1EA5m Ho\xE0ng Gia", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set2", overlay: "png_cos/wear_hat/mu_nam_hoang_gia.png", icon: "png_cos/icons/icon_mu_nam_hoang_gia.png", canvas: [48, 64] }, { slot: "hat", id: "mu_tho_mo_vang", vi: "M\u0169 Th\u1EE3 M\u1ECF V\xE0ng", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set3", overlay: "png_cos/wear_hat/mu_tho_mo_vang.png", icon: "png_cos/icons/icon_mu_tho_mo_vang.png", canvas: [48, 64] }, { slot: "hat", id: "mu_pharaoh", vi: "M\u0169 Pharaoh", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set4", overlay: "png_cos/wear_hat/mu_pharaoh.png", icon: "png_cos/icons/icon_mu_pharaoh.png", canvas: [48, 64] }, { slot: "hat", id: "mu_thuyen_truong", vi: "M\u0169 Thuy\u1EC1n Tr\u01B0\u1EDFng", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set5", overlay: "png_cos/wear_hat/mu_thuyen_truong.png", icon: "png_cos/icons/icon_mu_thuyen_truong.png", canvas: [48, 64] }, { slot: "hat", id: "mu_yeti", vi: "M\u0169 Yeti", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set6", overlay: "png_cos/wear_hat/mu_yeti.png", icon: "png_cos/icons/icon_mu_yeti.png", canvas: [48, 64] }, { slot: "hat", id: "mu_robot", vi: "M\u0169 Robot", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set7", overlay: "png_cos/wear_hat/mu_robot.png", icon: "png_cos/icons/icon_mu_robot.png", canvas: [48, 64] }, { slot: "hat", id: "mu_rong_con", vi: "M\u0169 R\u1ED3ng Con", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set8", overlay: "png_cos/wear_hat/mu_rong_con.png", icon: "png_cos/icons/icon_mu_rong_con.png", canvas: [48, 64] }, { slot: "hat", id: "mu_hiep_si", vi: "M\u0169 Hi\u1EC7p S\u0129", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set9", overlay: "png_cos/wear_hat/mu_hiep_si.png", icon: "png_cos/icons/icon_mu_hiep_si.png", canvas: [48, 64] }, { slot: "hat", id: "vuong_mien_loi_sang", vi: "V\u01B0\u01A1ng Mi\u1EC7n L\xF5i S\xE1ng", rarity: "Huy\u1EC1n tho\u1EA1i", set: "set10", overlay: "png_cos/wear_hat/vuong_mien_loi_sang.png", icon: "png_cos/icons/icon_vuong_mien_loi_sang.png", canvas: [48, 64] }, { slot: "hat", id: "mu_len", vi: "M\u0169 Len", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hat/mu_len.png", icon: "png_cos/icons/icon_mu_len.png", canvas: [48, 64] }, { slot: "hat", id: "mu_cao_boi", vi: "M\u0169 Cao B\u1ED3i", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hat/mu_cao_boi.png", icon: "png_cos/icons/icon_mu_cao_boi.png", canvas: [48, 64] }, { slot: "hat", id: "mu_dau_bep", vi: "M\u0169 \u0110\u1EA7u B\u1EBFp", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hat/mu_dau_bep.png", icon: "png_cos/icons/icon_mu_dau_bep.png", canvas: [48, 64] }, { slot: "hat", id: "mu_phu_thuy", vi: "M\u0169 Ph\xF9 Th\u1EE7y", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hat/mu_phu_thuy.png", icon: "png_cos/icons/icon_mu_phu_thuy.png", canvas: [48, 64] }, { slot: "hair", id: "toc_choi_xu", vi: "T\xF3c Ch\u1ED5i X\xF9", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hair/toc_choi_xu.png", icon: "png_cos/icons/icon_toc_choi_xu.png", canvas: [48, 64] }, { slot: "hair", id: "toc_hai_bim", vi: "T\xF3c Hai B\xEDm", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hair/toc_hai_bim.png", icon: "png_cos/icons/icon_toc_hai_bim.png", canvas: [48, 64] }, { slot: "hair", id: "toc_mohawk_neon", vi: "T\xF3c Mohawk Neon", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hair/toc_mohawk_neon.png", icon: "png_cos/icons/icon_toc_mohawk_neon.png", canvas: [48, 64] }, { slot: "hair", id: "toc_trang_bac", vi: "T\xF3c Tr\u1EAFng B\u1EA1c", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_hair/toc_trang_bac.png", icon: "png_cos/icons/icon_toc_trang_bac.png", canvas: [48, 64] }, { slot: "hair", id: "toc_lua", vi: "T\xF3c L\u1EEDa", rarity: "Hi\u1EBFm", set: "", overlay: "png_cos/wear_hair/toc_lua.png", icon: "png_cos/icons/icon_toc_lua.png", canvas: [48, 64] }, { slot: "hair", id: "toc_cau_vong", vi: "T\xF3c C\u1EA7u V\u1ED3ng", rarity: "Hi\u1EBFm", set: "", overlay: "png_cos/wear_hair/toc_cau_vong.png", icon: "png_cos/icons/icon_toc_cau_vong.png", canvas: [48, 64] }, { slot: "face", id: "kinh_mat", vi: "K\xEDnh M\xE1t", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_face/kinh_mat.png", icon: "png_cos/icons/icon_kinh_mat.png", canvas: [48, 64] }, { slot: "face", id: "kinh_phi_cong", vi: "K\xEDnh Phi C\xF4ng", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_face/kinh_phi_cong.png", icon: "png_cos/icons/icon_kinh_phi_cong.png", canvas: [48, 64] }, { slot: "face", id: "mat_na_meo", vi: "M\u1EB7t N\u1EA1 M\xE8o", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_face/mat_na_meo.png", icon: "png_cos/icons/icon_mat_na_meo.png", canvas: [48, 64] }, { slot: "face", id: "rau_gia", vi: "R\xE2u Gi\u1EA3", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_face/rau_gia.png", icon: "png_cos/icons/icon_rau_gia.png", canvas: [48, 64] }, { slot: "face", id: "mat_na_he", vi: "M\u1EB7t N\u1EA1 H\u1EC1", rarity: "Hi\u1EBFm", set: "", overlay: "png_cos/wear_face/mat_na_he.png", icon: "png_cos/icons/icon_mat_na_he.png", canvas: [48, 64] }, { slot: "face", id: "kinh_vr", vi: "K\xEDnh VR", rarity: "Hi\u1EBFm", set: "", overlay: "png_cos/wear_face/kinh_vr.png", icon: "png_cos/icons/icon_kinh_vr.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_choang_reu", vi: "\xC1o Cho\xE0ng R\xEAu", rarity: "Hi\u1EBFm", set: "set1", overlay: "png_cos/wear_outfit/ao_choang_reu.png", icon: "png_cos/icons/icon_ao_choang_reu.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_bao_tu_tim", vi: "\xC1o B\xE0o T\u1EED T\xEDm", rarity: "Hi\u1EBFm", set: "set2", overlay: "png_cos/wear_outfit/ao_bao_tu_tim.png", icon: "png_cos/icons/icon_ao_bao_tu_tim.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_tho_mo", vi: "\xC1o Th\u1EE3 M\u1ECF", rarity: "Hi\u1EBFm", set: "set3", overlay: "png_cos/wear_outfit/ao_tho_mo.png", icon: "png_cos/icons/icon_ao_tho_mo.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_vai_co", vi: "\xC1o V\u1EA3i C\u1ED5", rarity: "Hi\u1EBFm", set: "set4", overlay: "png_cos/wear_outfit/ao_vai_co.png", icon: "png_cos/icons/icon_ao_vai_co.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_hai_tac", vi: "\xC1o H\u1EA3i T\u1EB7c", rarity: "Hi\u1EBFm", set: "set5", overlay: "png_cos/wear_outfit/ao_hai_tac.png", icon: "png_cos/icons/icon_ao_hai_tac.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_long_trang", vi: "\xC1o L\xF4ng Tr\u1EAFng", rarity: "Hi\u1EBFm", set: "set6", overlay: "png_cos/wear_outfit/ao_long_trang.png", icon: "png_cos/icons/icon_ao_long_trang.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_giap_neon", vi: "\xC1o Gi\xE1p Neon", rarity: "Hi\u1EBFm", set: "set7", overlay: "png_cos/wear_outfit/ao_giap_neon.png", icon: "png_cos/icons/icon_ao_giap_neon.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_dung_nham", vi: "\xC1o Dung Nham", rarity: "Hi\u1EBFm", set: "set8", overlay: "png_cos/wear_outfit/ao_dung_nham.png", icon: "png_cos/icons/icon_ao_dung_nham.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_bong_dem", vi: "\xC1o B\xF3ng \u0110\xEAm", rarity: "Hi\u1EBFm", set: "set9", overlay: "png_cos/wear_outfit/ao_bong_dem.png", icon: "png_cos/icons/icon_ao_bong_dem.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_anh_sang", vi: "\xC1o \xC1nh S\xE1ng", rarity: "Hi\u1EBFm", set: "set10", overlay: "png_cos/wear_outfit/ao_anh_sang.png", icon: "png_cos/icons/icon_ao_anh_sang.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_hoodie", vi: "\xC1o Hoodie", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_outfit/ao_hoodie.png", icon: "png_cos/icons/icon_ao_hoodie.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_phi_hanh_gia", vi: "\xC1o Phi H\xE0nh Gia", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_outfit/ao_phi_hanh_gia.png", icon: "png_cos/icons/icon_ao_phi_hanh_gia.png", canvas: [48, 64] }, { slot: "outfit", id: "ao_bi_ngo", vi: "\xC1o H\xF3a Trang B\xED Ng\xF4", rarity: "Th\u01B0\u1EDDng", set: "", overlay: "png_cos/wear_outfit/ao_bi_ngo.png", icon: "png_cos/icons/icon_ao_bi_ngo.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_go", vi: "Gi\xE0y G\u1ED7", rarity: "Th\u01B0\u1EDDng", set: "set1", overlay: "png_cos/wear_shoes/giay_go.png", icon: "png_cos/icons/icon_giay_go.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_nam", vi: "Gi\xE0y N\u1EA5m", rarity: "Th\u01B0\u1EDDng", set: "set2", overlay: "png_cos/wear_shoes/giay_nam.png", icon: "png_cos/icons/icon_giay_nam.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_bao_ho", vi: "Gi\xE0y B\u1EA3o H\u1ED9", rarity: "Th\u01B0\u1EDDng", set: "set3", overlay: "png_cos/wear_shoes/giay_bao_ho.png", icon: "png_cos/icons/icon_giay_bao_ho.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_cat", vi: "Gi\xE0y C\xE1t", rarity: "Th\u01B0\u1EDDng", set: "set4", overlay: "png_cos/wear_shoes/giay_cat.png", icon: "png_cos/icons/icon_giay_cat.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_da_bien", vi: "Gi\xE0y Da Bi\u1EC3n", rarity: "Th\u01B0\u1EDDng", set: "set5", overlay: "png_cos/wear_shoes/giay_da_bien.png", icon: "png_cos/icons/icon_giay_da_bien.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_tuyet", vi: "Gi\xE0y Tuy\u1EBFt", rarity: "Th\u01B0\u1EDDng", set: "set6", overlay: "png_cos/wear_shoes/giay_tuyet.png", icon: "png_cos/icons/icon_giay_tuyet.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_phan_luc", vi: "Gi\xE0y Ph\u1EA3n L\u1EF1c", rarity: "Th\u01B0\u1EDDng", set: "set7", overlay: "png_cos/wear_shoes/giay_phan_luc.png", icon: "png_cos/icons/icon_giay_phan_luc.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_than_hong", vi: "Gi\xE0y Than H\u1ED3ng", rarity: "Th\u01B0\u1EDDng", set: "set8", overlay: "png_cos/wear_shoes/giay_than_hong.png", icon: "png_cos/icons/icon_giay_than_hong.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_ma", vi: "Gi\xE0y Ma", rarity: "Th\u01B0\u1EDDng", set: "set9", overlay: "png_cos/wear_shoes/giay_ma.png", icon: "png_cos/icons/icon_giay_ma.png", canvas: [48, 64] }, { slot: "shoes", id: "giay_hao_quang", vi: "Gi\xE0y H\xE0o Quang", rarity: "Th\u01B0\u1EDDng", set: "set10", overlay: "png_cos/wear_shoes/giay_hao_quang.png", icon: "png_cos/icons/icon_giay_hao_quang.png", canvas: [48, 64] }, { slot: "back", id: "ba_lo_mam_cay", vi: "Ba L\xF4 M\u1EA7m C\xE2y", rarity: "Th\u01B0\u1EDDng", set: "set1", overlay: "png_cos/wear_back/ba_lo_mam_cay.png", icon: "png_cos/icons/icon_ba_lo_mam_cay.png", canvas: [48, 64] }, { slot: "back", id: "canh_buom_phat_quang", vi: "C\xE1nh B\u01B0\u1EDBm Ph\xE1t Quang", rarity: "Th\u01B0\u1EDDng", set: "set2", overlay: "png_cos/wear_back/canh_buom_phat_quang.png", icon: "png_cos/icons/icon_canh_buom_phat_quang.png", canvas: [48, 64] }, { slot: "back", id: "xeng_deo_lung", vi: "X\u1EBBng \u0110eo L\u01B0ng", rarity: "Th\u01B0\u1EDDng", set: "set3", overlay: "png_cos/wear_back/xeng_deo_lung.png", icon: "png_cos/icons/icon_xeng_deo_lung.png", canvas: [48, 64] }, { slot: "back", id: "khan_choang_vang", vi: "Kh\u0103n Cho\xE0ng V\xE0ng", rarity: "Th\u01B0\u1EDDng", set: "set4", overlay: "png_cos/wear_back/khan_choang_vang.png", icon: "png_cos/icons/icon_khan_choang_vang.png", canvas: [48, 64] }, { slot: "back", id: "kiem_mini", vi: "Ki\u1EBFm Mini Sau L\u01B0ng", rarity: "Th\u01B0\u1EDDng", set: "set5", overlay: "png_cos/wear_back/kiem_mini.png", icon: "png_cos/icons/icon_kiem_mini.png", canvas: [48, 64] }, { slot: "back", id: "khan_len_do", vi: "Kh\u0103n Len \u0110\u1ECF", rarity: "Th\u01B0\u1EDDng", set: "set6", overlay: "png_cos/wear_back/khan_len_do.png", icon: "png_cos/icons/icon_khan_len_do.png", canvas: [48, 64] }, { slot: "back", id: "canh_may", vi: "C\xE1nh M\xE1y", rarity: "Th\u01B0\u1EDDng", set: "set7", overlay: "png_cos/wear_back/canh_may.png", icon: "png_cos/icons/icon_canh_may.png", canvas: [48, 64] }, { slot: "back", id: "canh_lua", vi: "C\xE1nh L\u1EEDa", rarity: "Th\u01B0\u1EDDng", set: "set8", overlay: "png_cos/wear_back/canh_lua.png", icon: "png_cos/icons/icon_canh_lua.png", canvas: [48, 64] }, { slot: "back", id: "ao_choang_suong", vi: "\xC1o Cho\xE0ng S\u01B0\u01A1ng", rarity: "Th\u01B0\u1EDDng", set: "set9", overlay: "png_cos/wear_back/ao_choang_suong.png", icon: "png_cos/icons/icon_ao_choang_suong.png", canvas: [48, 64] }, { slot: "back", id: "canh_anh_sang", vi: "C\xE1nh \xC1nh S\xE1ng", rarity: "Th\u01B0\u1EDDng", set: "set10", overlay: "png_cos/wear_back/canh_anh_sang.png", icon: "png_cos/icons/icon_canh_anh_sang.png", canvas: [48, 64] }, { slot: "bomb_skin", id: "bom_trai_reu", vi: "Bom Tr\xE1i R\xEAu", rarity: "Hi\u1EBFm", set: "set1", file: "png_cos/bomb_skins/bom_trai_reu.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_nam", vi: "Bom N\u1EA5m", rarity: "Hi\u1EBFm", set: "set2", file: "png_cos/bomb_skins/bom_nam.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_pha_le", vi: "Bom Pha L\xEA", rarity: "Hi\u1EBFm", set: "set3", file: "png_cos/bomb_skins/bom_pha_le.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_ngoc_co", vi: "Bom Ng\u1ECDc C\u1ED5", rarity: "Hi\u1EBFm", set: "set4", file: "png_cos/bomb_skins/bom_ngoc_co.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_thung_rum", vi: "Bom Th\xF9ng Rum", rarity: "Hi\u1EBFm", set: "set5", file: "png_cos/bomb_skins/bom_thung_rum.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_tuyet", vi: "Bom Tuy\u1EBFt", rarity: "Hi\u1EBFm", set: "set6", file: "png_cos/bomb_skins/bom_tuyet.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_mach_dien", vi: "Bom M\u1EA1ch \u0110i\u1EC7n", rarity: "Hi\u1EBFm", set: "set7", file: "png_cos/bomb_skins/bom_mach_dien.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_magma", vi: "Bom Magma", rarity: "Hi\u1EBFm", set: "set8", file: "png_cos/bomb_skins/bom_magma.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_hon_ma", vi: "Bom H\u1ED3n Ma", rarity: "Hi\u1EBFm", set: "set9", file: "png_cos/bomb_skins/bom_hon_ma.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_loi_sang", vi: "Bom L\xF5i S\xE1ng", rarity: "Hi\u1EBFm", set: "set10", file: "png_cos/bomb_skins/bom_loi_sang.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_qua_cam", vi: "Bom Qu\u1EA3 Cam", rarity: "Th\u01B0\u1EDDng", set: "", file: "png_cos/bomb_skins/bom_qua_cam.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_ngoi_sao", vi: "Bom Ng\xF4i Sao", rarity: "Th\u01B0\u1EDDng", set: "", file: "png_cos/bomb_skins/bom_ngoi_sao.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_banh_kem", vi: "Bom B\xE1nh Kem", rarity: "Th\u01B0\u1EDDng", set: "", file: "png_cos/bomb_skins/bom_banh_kem.png", canvas: [48, 48] }, { slot: "bomb_skin", id: "bom_meo", vi: "Bom M\xE8o", rarity: "Th\u01B0\u1EDDng", set: "", file: "png_cos/bomb_skins/bom_meo.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_hoa_reu", vi: "N\u1ED5 Hoa R\xEAu", rarity: "S\u1EED thi", set: "set1", file: "png_cos/explosion_fx/fx_hoa_reu.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_bao_tu", vi: "N\u1ED5 B\xE0o T\u1EED S\xE1ng", rarity: "S\u1EED thi", set: "set2", file: "png_cos/explosion_fx/fx_bao_tu.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_tinh_the", vi: "N\u1ED5 Tinh Th\u1EC3", rarity: "S\u1EED thi", set: "set3", file: "png_cos/explosion_fx/fx_tinh_the.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_bao_cat", vi: "N\u1ED5 B\xE3o C\xE1t", rarity: "S\u1EED thi", set: "set4", file: "png_cos/explosion_fx/fx_bao_cat.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_song_bien", vi: "N\u1ED5 S\xF3ng Bi\u1EC3n", rarity: "S\u1EED thi", set: "set5", file: "png_cos/explosion_fx/fx_song_bien.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_bong_tuyet", vi: "N\u1ED5 B\xF4ng Tuy\u1EBFt", rarity: "S\u1EED thi", set: "set6", file: "png_cos/explosion_fx/fx_bong_tuyet.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_dien_tu", vi: "N\u1ED5 \u0110i\u1EC7n T\u1EEB", rarity: "S\u1EED thi", set: "set7", file: "png_cos/explosion_fx/fx_dien_tu.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_phun_trao", vi: "N\u1ED5 Phun Tr\xE0o", rarity: "S\u1EED thi", set: "set8", file: "png_cos/explosion_fx/fx_phun_trao.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_linh_hon", vi: "N\u1ED5 Linh H\u1ED3n", rarity: "S\u1EED thi", set: "set9", file: "png_cos/explosion_fx/fx_linh_hon.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_cau_vong", vi: "N\u1ED5 C\u1EA7u V\u1ED3ng S\xE1ng", rarity: "S\u1EED thi", set: "set10", file: "png_cos/explosion_fx/fx_cau_vong.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_phao_hoa", vi: "Ph\xE1o Hoa", rarity: "Hi\u1EBFm", set: "", file: "png_cos/explosion_fx/fx_phao_hoa.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_trai_tim", vi: "Tr\xE1i Tim", rarity: "Hi\u1EBFm", set: "", file: "png_cos/explosion_fx/fx_trai_tim.png", canvas: [48, 48] }, { slot: "explosion_fx", id: "fx_hoa_anh_dao", vi: "Hoa Anh \u0110\xE0o", rarity: "Hi\u1EBFm", set: "", file: "png_cos/explosion_fx/fx_hoa_anh_dao.png", canvas: [48, 48] }, { slot: "pet", id: "pet_slime_reu", vi: "Slime R\xEAu", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set1", file: "png_cos/pets/pet_slime_reu.png", canvas: [40, 40] }, { slot: "pet", id: "pet_mimi", vi: "Mimi Nh\u1ECF", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set2", file: "png_cos/pets/pet_mimi.png", canvas: [40, 40] }, { slot: "pet", id: "pet_chuot_chui", vi: "Chu\u1ED9t Ch\u0169i \u0110\u1ED9i N\xF3n", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set3", file: "png_cos/pets/pet_chuot_chui.png", canvas: [40, 40] }, { slot: "pet", id: "pet_meo_cat", vi: "M\xE8o C\xE1t", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set4", file: "png_cos/pets/pet_meo_cat.png", canvas: [40, 40] }, { slot: "pet", id: "pet_vet_bien", vi: "V\u1EB9t Bi\u1EC3n", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set5", file: "png_cos/pets/pet_vet_bien.png", canvas: [40, 40] }, { slot: "pet", id: "pet_canh_cut", vi: "C\xE1nh C\u1EE5t Con", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set6", file: "png_cos/pets/pet_canh_cut.png", canvas: [40, 40] }, { slot: "pet", id: "pet_gizmo_mini", vi: "Gizmo Mini", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set7", file: "png_cos/pets/pet_gizmo_mini.png", canvas: [40, 40] }, { slot: "pet", id: "pet_rong_lua", vi: "R\u1ED3ng L\u1EEDa Nh\u1ECF", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set8", file: "png_cos/pets/pet_rong_lua.png", canvas: [40, 40] }, { slot: "pet", id: "pet_ma_nho", vi: "Ma Nh\u1ECF \u0110\xE1ng Y\xEAu", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set9", file: "png_cos/pets/pet_ma_nho.png", canvas: [40, 40] }, { slot: "pet", id: "pet_bum_mini", vi: "B\xF9m Mini", rarity: "Pet (m\u1EDF khi h\u1EA1 boss)", set: "set10", file: "png_cos/pets/pet_bum_mini.png", canvas: [40, 40] }, { slot: "footprint", id: "dau_hoa", vi: "D\u1EA5u Hoa", rarity: "Th\u01B0\u1EDDng", set: "", file: "png_cos/footprints/dau_hoa.png", canvas: [24, 24] }, { slot: "footprint", id: "dau_sao", vi: "D\u1EA5u Sao", rarity: "Th\u01B0\u1EDDng", set: "", file: "png_cos/footprints/dau_sao.png", canvas: [24, 24] }, { slot: "footprint", id: "dau_lua_mini", vi: "D\u1EA5u L\u1EEDa Mini", rarity: "Th\u01B0\u1EDDng", set: "", file: "png_cos/footprints/dau_lua_mini.png", canvas: [24, 24] }] };
  var va = Hh, oa = Uh.bosses, ga = Eh.items, Ve = [{ name: "L\xE0ng R\xEAu Xanh", color: "#91b36d", mechanic: "B\u1EE5i r\xEAu che t\u1EA7m nh\xECn", tip: "Th\u1EA3 bom r\u1ED3i ch\u1EA1y quanh c\u1ED9t \u0111\xE1. Bom \u0111\u1EA7u ti\xEAn \u1EDF m\xE0n 1 an to\xE0n cho Pip.", enemies: ["enemy_slime_rust", "enemy_rat_machine"] }, { name: "R\u1EEBng N\u1EA5m Ph\xE1t Quang", color: "#aa8acc", mechanic: "N\u1EA5m b\u1EADt \xB7 B\xE0o t\u1EED \u0111\u1ED9c", tip: "\u0110\u1EB7t bom l\xEAn n\u1EA5m b\u1EADt \u0111\u1EC3 \u0111\u01B0a bom \u0111i xa 2 \xF4. Tr\xE1nh \xF4 b\xE0o t\u1EED b\xE1o tr\u01B0\u1EDBc.", enemies: ["enemy_nam_lun", "enemy_buom_bao_tu"] }, { name: "H\u1EA7m M\u1ECF Pha L\xEA", color: "#7ba7b4", mechanic: "Xe go\xF2ng \xB7 T\u01B0\u1EDDng \u0111\xE1 2 l\u1EDBp", tip: "\u0110\xE8n b\xE1o tr\u01B0\u1EDBc xe go\xF2ng. T\u01B0\u1EDDng \u0111\xE1 c\u1EA7n hai l\u1EA7n n\u1ED5; Bom Xuy\xEAn gi\xFAp m\u1EDF \u0111\u01B0\u1EDDng.", enemies: ["enemy_doi_hang", "enemy_golem_da"] }, { name: "Sa M\u1EA1c Kim T\u1EF1 Th\xE1p", color: "#d5ac64", mechanic: "C\xE1t l\xFAn \xB7 Gai \xB7 Gi\xF3 c\xE1t", tip: "Canh nh\u1ECBp b\u1EABy gai v\xE0 d\xF9ng g\u0103ng n\xE9m \u0111\u1EC3 \u0111\u01B0a bom qua ch\u01B0\u1EDBng ng\u1EA1i.", enemies: ["enemy_xac_uop", "enemy_bo_cap"] }, { name: "\u0110\u1EA3o H\u1EA3i T\u1EB7c", color: "#6baeb9", mechanic: "Th\u1EE7y tri\u1EC1u \xB7 \u0110\u1EA1i b\xE1c \xB7 Th\xF9ng rum", tip: "\u0110\u1EA1i b\xE1c c\xF3 v\u1EA1ch c\u1EA3nh b\xE1o. Th\xF9ng rum c\xF3 th\u1EC3 g\xE2y n\u1ED5 d\xE2y chuy\u1EC1n.", enemies: ["enemy_cua_giap", "enemy_hai_au"] }, { name: "\u0110\u1EC9nh Tuy\u1EBFt B\u0103ng", color: "#9cbad9", mechanic: "B\u0103ng tr\u01B0\u1EE3t \xB7 T\u01B0\u1EDDng b\u0103ng", tip: "Bom L\u1EEDa ho\u1EB7c m\u1ED9t bom b\u1ECB k\xEDch n\u1ED5 d\xE2y chuy\u1EC1n m\u1EDBi ph\xE1 \u0111\u01B0\u1EE3c t\u01B0\u1EDDng b\u0103ng.", enemies: ["enemy_nguoi_tuyet", "enemy_canh_cut"] }, { name: "Th\xE0nh Ph\u1ED1 C\u01A1 Kh\xED", color: "#79baa9", mechanic: "B\u0103ng chuy\u1EC1n \xB7 D\u1ECBch chuy\u1EC3n \xB7 Laser", tip: "B\u0103ng chuy\u1EC1n \u0111\u1EA9y c\u1EA3 bom v\xE0 \u0111\u1ECBch; c\u1ED5ng d\u1ECBch chuy\u1EC3n lu\xF4n c\xF3 c\u1EB7p A\u2013B.", enemies: ["enemy_robot_tuan_tra", "enemy_drone"] }, { name: "N\xFAi L\u1EEDa Nham Th\u1EA1ch", color: "#ce886d", mechanic: "Dung nham \xB7 C\u1EA7u \u0111\xE1 \xB7 \u0110\xE1 n\xF3ng", tip: "C\u1EA7u \u0111\xE1 n\u1ED5i 6 gi\xE2y. \u0110\u1ECDc d\u1EA5u c\u1EA3nh b\xE1o tr\u01B0\u1EDBc khi b\u0103ng qua dung nham.", enemies: ["enemy_quy_lua", "enemy_golem_magma"] }, { name: "L\xE2u \u0110\xE0i B\xF3ng Ma", color: "#9c8bb6", mechanic: "G\u01B0\u01A1ng ma \xB7 \u0110\xE8n l\u1ED3ng \xB7 C\u1EEDa ma", tip: "G\u01B0\u01A1ng \u0111\u1ED5i h\u01B0\u1EDBng v\u1EE5 n\u1ED5 90\xB0. Th\u1EAFp \u0111\xE8n \u0111\u1EC3 l\xE0m l\u1ED9 Ma M\u1EDD.", enemies: ["enemy_ma_mo", "enemy_bo_xuong"] }, { name: "Ph\xE1o \u0110\xE0i L\xF5i Cu\u1ED1i", color: "#c7b56a", mechanic: "T\u1ED5ng h\u1EE3p \xB7 Bom \xC1nh S\xE1ng", tip: "\u1EDE giai \u0111o\u1EA1n cu\u1ED1i, thu 9 m\u1EA3nh L\xF5i \u0111\u1EC3 n\u1EA1p m\u1ED9t Bom \xC1nh S\xE1ng.", enemies: ["enemy_ri_set_binh", "enemy_robot_tuan_tra_2"] }], gn = { wall: "Ph\xE1 t\u01B0\u1EDDng", kill: "H\u1EA1 k\u1EBB th\xF9", collect: "Thu th\u1EADp", rescue: "Gi\u1EA3i c\u1EE9u", switch: "C\xF4ng t\u1EAFc", survive: "Sinh t\u1ED3n", barrel: "Th\xF9ng n\u1ED5", ice: "Kh\u1ED1i b\u0103ng", machine: "Ph\xE1 c\u01A1 c\u1EA5u", visit: "Qua c\u1EA7u \u0111\xE1", boss: "H\u1EA1 boss" }, uo = [{ id: "bomb", name: "Bom kh\u1EDFi \u0111\u1EA7u", cost: 20, icon: "item_bomb_plus", max: 1 }, { id: "shield", name: "Khi\xEAn kh\u1EDFi \u0111\u1EA7u", cost: 20, icon: "item_shield", max: 1 }, { id: "clock", name: "+30 gi\xE2y", cost: 25, icon: "item_hourglass", max: 1 }, { id: "radar", name: "Radar c\u1ED5ng", cost: 30, icon: "item_radar", max: 1 }, { id: "treasure", name: "B\u1EA3n \u0111\u1ED3 kho b\xE1u", cost: 30, icon: "item_treasure", max: 1 }, { id: "special", name: "Bom \u0111\u1EB7c bi\u1EC7t", cost: 35, icon: "item_bomb_fire", max: 2 }, { id: "hammer", name: "B\xFAa th\u1EA7n", cost: 40, icon: "item_hammer", max: 2 }, { id: "revive", name: "H\u1ED3i sinh nh\u1ECF", cost: 60, icon: "item_revive", max: 1 }], Ts = (e, a) => Math.round(uo.find((t) => t.id === e).cost * (1 + 0.08 * (a - 1)) / 5) * 5, fo = { health: { name: "Tim", cost: [150, 300, 600, 1e3], shards: [0, 0, 5, 10], weight: 6 }, bombs: { name: "S\u1EE9c ch\u1EE9a bom", cost: [400, 1e3], shards: [0, 8], weight: 10 }, range: { name: "T\u1EA7m n\u1ED5", cost: [400, 1e3], shards: [0, 8], weight: 10 }, speed: { name: "T\u1ED1c \u0111\u1ED9", cost: [80, 120, 180, 260, 360, 500], shards: [0, 0, 0, 0, 0, 0], weight: 3 }, fuse: { name: "Ng\xF2i n\u1ED5", cost: [150, 250, 400, 600, 800], shards: [0, 0, 0, 0, 5], weight: 4 }, luck: { name: "May m\u1EAFn", cost: [50, 70, 90, 120, 150, 190, 240, 300, 370, 450], shards: Array(10).fill(0), weight: 1.5 }, guard: { name: "Ch\u1ECBu \u0111\xF2n", cost: [80, 120, 180, 260, 360, 480, 640], shards: Array(7).fill(0), weight: 3 } };
  var Ke = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, Nh = Object.keys(Ke), _n = () => ({ health: 0, bombs: 0, range: 0, speed: 0, fuse: 0, luck: 0, guard: 0 }), Dx = () => ({ wall: 0, kill: 0, collect: 0, rescue: 0, switch: 0, survive: 0, barrel: 0, ice: 0, machine: 0, visit: 0, boss: 0 }), Ms = (e, a, t) => t * e.level.width + a, j = (e, a, t) => (a < 0 || t < 0 || a >= e.level.width || t >= e.level.height ? null : e.cells[Ms(e, a, t)]) || { wall: "hard", hp: 99 }, Re = (e, a) => Math.abs(e.x - a.x) + Math.abs(e.y - a.y);
  function _a(e) {
    return e.rng = Math.imul(e.rng, 1664525) + 1013904223 >>> 0, e.rng / 4294967296;
  }
  function oe(e, a, t) {
    e.events.push({ id: ++e.sequence, kind: a, text: t }), e.events.length > 20 && e.events.shift();
  }
  var At = (e, a, t, l, o = 500) => {
    e.fx.push({ id: ++e.sequence, kind: a, x: t, y: l, at: e.time, duration: o });
  };
  function kr(e) {
    return e.level.goals.every((a) => (e.goals[a.kind] || 0) >= a.target);
  }
  function $a(e, a, t, l = false, o = false) {
    let s = j(e, a, t);
    return s.wall !== "hard" && (s.wall === "none" || l) && (!s.terrain || s.terrain !== "door" || Math.floor(e.time / 4e3) % 2 === 0) && (o || !e.bombs.some((i) => i.x === a && i.y === t)) && (!e.boss || e.boss.hp <= 0 || Math.abs(a - e.boss.x) > 1 || Math.abs(t - e.boss.y) > 1);
  }
  function Le(e) {
    return e.cells.map((a, t) => ({ t: a, i: t, x: t % e.level.width, y: Math.floor(t / e.level.width) })).filter((a) => a.t.wall === "none" && a.x > 0 && a.x < e.level.width - 1 && a.y > 0 && a.y < e.level.height - 1);
  }
  function ro(e, a, t, l) {
    let o = Le(e).filter((n) => Re(n, e.player) > 5 && $a(e,n.x,n.y) && !n.t.terrain && !n.t.switch && !n.t.item && !e.enemies.some((u) => Re(u,n)<2)), s = o[Math.floor(_a(e) * o.length)];
    if(t===void 0&&!s){
      o=Le(e).filter(n=>Re(n,e.player)>4&&$a(e,n.x,n.y)&&!['lava','spike','fire','door','conveyor','teleport'].includes(n.t.terrain)&&!e.enemies.some(u=>u.x===n.x&&u.y===n.y));
      s=o[Math.floor(_a(e)*o.length)];
    }
    if (t === void 0 && !s) return;
    let i = a || Ve[e.level.chapter - 1].enemies[Math.floor(_a(e) * 2)];
    e.enemies.push({ id: ++e.sequence, x: t ?? s.x, y: l ?? s.y, fromX: t ?? s.x, fromY: l ?? s.y, dir: "down", lastMove: e.time, next: e.time + 1400 + (e.enemies.length%4)*250, hp: /golem|giap|xac_uop|bo_xuong/.test(i) ? 2 : 1, kind: i, frozen: 0 });
  }
  // Authored blockout rules: keep an opening refuge, then vary tactical space by stage.
  function boomBlockout(e) {
    const {width:w,height:h,stage}=e.level;
    const refuge=new Set(['1,1','2,1','3,1','3,2','3,3','2,3','1,3','1,2']);
    const mid=2*Math.floor(h/4)+1;
    for(let y=2;y<h-1;y+=2)for(let x=2;x<w-1;x+=2){
      // Collection spine, cross-court, survival loop, and rescue hub.
      if((stage===3&&x===4)||(stage===4&&y===mid-1)||
         (stage===5&&(x===2||x===w-3))||(stage===6&&y===mid-1)){
        const t=j(e,x,y);t.wall='none';t.hp=1;
      }
    }
    e.layout={version:2,kind:['','training','duel','spine','crosscourt','survival-loop','rescue-hub','siege','boss-ring'][stage],refuge:[...refuge]};
    return refuge;
  }
  function boomFinishBlockout(e,refuge) {
    const cells=e.cells.map((t,i)=>({t,x:i%e.level.width,y:Math.floor(i/e.level.width)}));
    // Keep opening refuge and objective interactions free of forced movement/hazards.
    for(const c of cells)if(refuge.has(`${c.x},${c.y}`)||c.t.switch||c.t.item==='gem'||
      ['cage','ice','machine'].includes(c.t.wall)||(c.x===e.gate.x&&c.y===e.gate.y))delete c.t.terrain;
    // Keep paired traversal and visit objectives valid after safety cleanup.
    const traversable=cells.filter(c=>c.t.wall==='none'&&!c.t.switch&&!c.t.item&&!refuge.has(`${c.x},${c.y}`)&&!(c.x===e.gate.x&&c.y===e.gate.y));
    if(e.level.chapter===7||e.level.chapter===10){
      cells.forEach(c=>{if(c.t.terrain==='teleport')delete c.t.terrain;});
      const pair=[traversable[0],traversable[traversable.length-1]];
      if(pair[0]&&pair[1]&&pair[0]!==pair[1])pair.forEach(c=>c.t.terrain='teleport');
    }
    const visits=e.level.goals.find(g=>g.kind==='visit')?.target||0;
    let bridges=cells.filter(c=>c.t.wall==='none'&&c.t.terrain==='bridge').length;
    for(const c of traversable)if(bridges<visits&&!['bridge','teleport'].includes(c.t.terrain)){c.t.terrain='bridge';bridges++;}
    // A wall quota is a completion requirement, even after switches replace walls.
    const target=e.level.goals.find(g=>g.kind==='wall')?.target||0;
    let count=cells.filter(c=>!['hard','none','mirror'].includes(c.t.wall)).length;
    for(const c of cells.filter(c=>c.t.wall==='none'&&!c.t.switch&&!c.t.item&&!['bridge','teleport'].includes(c.t.terrain)&&!refuge.has(`${c.x},${c.y}`)).reverse()){
      if(count>=target)break;
      c.t.wall=e.level.chapter===3?'cracked':'soft';c.t.hp=e.level.chapter===3?2:1;count++;
    }
    if(e.level.stage===8){
      // Unbroken perimeter around the 3x3 boss footprint, with clean approaches.
      for(const c of cells)if(c.x>0&&c.x<e.level.width-1&&c.y>0&&c.y<e.level.height-1){
        if(c.x<=2||c.x>=6||c.y<=2||c.y>=6){
          c.t.wall='none';c.t.hp=1;
        }
        delete c.t.terrain;delete c.t.item;
      }
      j(e,e.gate.x,e.gate.y).wall='soft';
    }
  }
  function Gh(e, a = Date.now(), t = _n(), l = {}, o = "campaign", s = false) {
    let i = 3 + t.health, n = e.seconds ? e.seconds * 1e3 + (l.clock || 0) * 3e4 : 0, u = { version: 1, id: `${o}-${e.id}-${a}-${Date.now()}`, level: JSON.parse(JSON.stringify(e)), mode: o, seed: a >>> 0, rng: a >>> 0, time: 0, cells: [], player: { id: 0, x: 1, y: 1, fromX: 1, fromY: 1, dir: "down", lastMove: 0, next: 0, hp: i, maxHp: i, kind: "pip", frozen: 0, capacity: 1 + t.bombs + (l.bomb || 0), range: 1 + t.range, speed: 3 * (1 + t.speed * 0.05), fuse: 2500 - t.fuse * 100, shield: l.shield ? 2e4 : 0, armor: 0, passwall: 0, magnet: 0, invulnerable: 0, remote: false, kick: false, glove: false, pierce: 0, special: { fire: l.special || 0, ice: 0, blackhole: 0, light: 0 }, boots: 0 }, enemies: [], bombs: [], fx: [], warnings: [], gate: { x: e.width - 2, y: e.height - 2, revealed: false }, goals: Dx(), status: "playing", endingAt: 0, reason: "", score: 0, coins: 0, damage: 0, rescued: [], injured: 0, revived: false, usedBoosters: Object.values(l).reduce((c, h) => c + (h || 0), 0), collected: 0, lightShards: 0, placed: 0, wallsSinceDrop: 0, chainBest: 1, chainCount: 0, switchNext: 1, temperature: 100, terrainAt: 4e3, teleportAt: 0, slowUntil: 0, curseUntil: 0, radar: l.radar ? 1e4 : 0, hammer: l.hammer || 0, reviveTokens: l.revive || 0, treasure: !!l.treasure, visited: [], events: [], sequence: 0, paid: false, statGuard: t.guard, statLuck: t.luck, easy: s, limit: n };
    for (let c = 0; c < e.height; c++) for (let h = 0; h < e.width; h++) u.cells.push({ wall: h === 0 || c === 0 || h === e.width - 1 || c === e.height - 1 || h % 2 === 0 && c % 2 === 0 ? "hard" : "none", hp: 1 });
    const refuge=boomBlockout(u);
    let r = Le(u).filter((c) => !refuge.has(`${c.x},${c.y}`)).sort((c, h) => c.i - h.i);
    for (let c = r.length - 1; c > 0; c--) {
      let h = Math.floor(_a(u) * (c + 1));
      [r[c], r[h]] = [r[h], r[c]];
    }
    let _ = e.goals.find((c) => c.kind === "wall")?.target || 0, x = e.id === 1 ? 8 : Math.min(r.length - 10, Math.max(_ + 4, 16 + e.chapter * 2 + e.stage));
    for (let c of r.slice(0, x)) c.t.wall = e.chapter === 3 ? "cracked" : "soft", c.t.hp = c.t.wall === "cracked" ? 2 : 1;
    let m = r.slice(0, x).sort((c, h) => Re(h, u.player) - Re(c, u.player))[0];
    u.gate = { x: m.x, y: m.y, revealed: false };
    const objectiveCells=[...r].sort((a,b)=>a.y-b.y||a.x-b.x);
    let d = 0;
    const objectCount=e.goals.filter(g=>['collect','rescue','barrel','ice','machine','switch'].includes(g.kind)).reduce((n,g)=>n+g.target,0);
    const objectSlots=Array.from({length:objectCount},(_,i)=>objectiveCells[Math.floor((i+.5)*objectiveCells.length/objectCount)]);
    for(let i=objectSlots.length-1;i>=0;i--){const k=r.indexOf(objectSlots[i]);if(k>=0)r.splice(k,1);}
    // Dedicated, evenly spaced objective slots must not be reused by the gate.

    for (let c of e.goals) if (["collect", "rescue", "barrel", "ice", "machine", "switch"].includes(c.kind)) for (let h = 0; h < c.target; h++) {
      let b = objectSlots[d++];
      if (!b) throw Error("Level has too many objects");
      c.kind === "switch" ? (b.t.wall = "none", b.t.switch = h + 1, b.t.lit = false) : c.kind === "collect" ? (b.t.wall = "soft", b.t.hp = 1, b.t.item = "gem") : (b.t.wall = c.kind === "rescue" ? "cage" : c.kind === "barrel" ? "barrel" : c.kind === "ice" ? "ice" : "machine", b.t.hp = 1);
    }
    let y = j(u, u.gate.x, u.gate.y);
    if (y.wall === "none" || y.item || y.wall === "cage") {
      let c = r.find((h) => h.t.wall === "soft" || h.t.wall === "cracked" || h.t.wall === "ice");
      c ? u.gate = { x: c.x, y: c.y, revealed: false } : (y.wall = "soft", delete y.item, delete y.switch);
    }
    let S = ["bomb_plus", "kick", "pierce", "glove", "magnet", "bomb_fire", "hourglass", "armor", "bomb_blackhole", "shield"], M = r.find((c) => c.t.wall !== "none" && !c.t.item && c.x !== u.gate.x && c.y !== u.gate.y);
    M && (M.t.item = S[e.chapter - 1]);
    let g = { 1: "bush", 2: "bounce", 3: "rail", 4: "sand", 5: "water", 6: "ice", 7: "conveyor", 8: "lava", 9: "door", 10: "conveyor" };
    for (let c of Le(u).filter((h) => Re(h, u.player) > 3)) _a(u) < 0.19 && (c.t.terrain = g[e.chapter]);
    if (e.chapter === 7 || e.chapter === 10) {
      let c = Le(u).filter((h) => Re(h, u.player) > 3);
      c.length > 2 && (c[0].t.terrain = "teleport", c[c.length - 1].t.terrain = "teleport");
    }
    if (e.chapter === 4) for (let c of Le(u).filter((h) => h.x % 3 === 0 && h.y % 3 === 0)) c.t.terrain = "spike";
    if (e.chapter === 6 && (j(u, 1, 3).terrain = "fire", u.player.special.fire += 3), e.chapter === 8) {
      let c = Le(u).filter((h) => h.t.terrain === "lava");
      c.slice(0, Math.max(3, c.length / 2)).forEach((h) => h.t.terrain = "bridge"), e.goals.some((h) => h.kind === "visit") && c.slice(0, 3).forEach((h) => h.t.terrain = "bridge");
    }
    if (e.goals.some((c) => c.kind === "visit") && Le(u).filter((c) => Re(c, u.player) > 3).slice(0, 3).forEach((c) => c.t.terrain = "bridge"), e.chapter === 9 && [[2, 2], [6, 2], [2, e.height - 3], [6, e.height - 3]].forEach(([c, h]) => {
      let b = j(u, c, h);
      if(b.wall === "hard")b.wall = "mirror", b.hp = 99;
    }), e.stage === 8) {
      for (let h = 2; h <= 6; h++) for (let b = 2; b <= 6; b++) j(u, b, h).wall = "none";
      let c = oa[e.chapter - 1];
      u.boss = { id: c.id, x: 4, y: 4, hp: c.hp_hits, maxHp: c.hp_hits, phase: 1, weak: 0, next: 4e3, attack: "idle", attackAt: 0, stun: 0, checkpoint: c.hp_hits, retryUsed: false, pillars: [0, 0, 0, 0], anchor: true, gizmo: false, lightHits: 0 }, u.gate = { x: 7, y: e.height - 2, revealed: false }, j(u, 7, e.height - 2).wall = "soft", u.enemies = [], u.player.capacity = Math.max(2, u.player.capacity), u.player.range = Math.max(2, u.player.range), u.player.kick = e.chapter === 2, u.player.glove = e.chapter === 4, u.player.special.fire = e.chapter === 6 ? 12 : u.player.special.fire, u.player.special.blackhole = e.chapter === 9 ? 12 : 0, e.chapter === 4 && [[1, 3], [7, 3], [1, 7], [7, 7]].forEach(([h, b], C) => {
        let O = j(u, h, b);
        O.wall = "none", O.switch = C + 1;
      }), e.chapter === 9 && [[1, 3], [7, 3], [1, 7], [7, 7]].forEach(([h, b], C) => {
        let O = j(u, h, b);
        O.wall = "none", O.switch = C + 1;
      });
    }
    boomFinishBlockout(u,refuge);
    if(e.stage!==8)for (let c = 0; c < e.enemies; c++) ro(u);
    return oe(u, "start", e.name), u;
  }
  // Continuous world coordinates in tiles (48 design pixels per tile).
  function boomPosition(actor, time) {
    if (Number.isFinite(actor.px)) return {x:actor.px,y:actor.py};
    const clock=actor.frozenAt!==undefined && time<actor.frozen ? actor.frozenAt : time;
    const progress=Math.max(0,Math.min(1,(clock-actor.lastMove)/Math.max(1,actor.next-actor.lastMove)));
    return {x:actor.fromX+(actor.x-actor.fromX)*progress,y:actor.fromY+(actor.y-actor.fromY)*progress};
  }
  function boomTouches(actor,cell,time,radius=.28) {
    const p=boomPosition(actor,time);
    return Math.abs(p.x-cell.x)<.5+radius && Math.abs(p.y-cell.y)<.5+radius;
  }
  function boomAdvance(e,dt) {
    const p=e.player;
    if (!Number.isFinite(p.px)) {p.px=p.x;p.py=p.y;}
    p.moving=false;
    if(e.status!=='playing')return;
    let dir=e.moveIntent;
    const terrain=j(e,p.x,p.y).terrain;
    if (!dir && terrain==='ice')dir=p.dir;
    if (terrain==='conveyor')dir=Math.floor(e.time/10000)%2?'left':'right';
    if (!dir)return;
    p.dir=dir;
    const slow=terrain==='sand'||e.slowUntil>e.time||e.curseUntil>e.time;
    let distance=p.speed*(slow?.5:1)*(e.easy?1.1:1)*dt/1000;
    const [dx,dy]=Ke[dir], radius=.28;
    const overlaps=(b,x,y)=>Math.abs(b.x-x)<.5+radius-1e-6&&Math.abs(b.y-y)<.5+radius-1e-6;
    p.bombPass=(p.bombPass||[]).filter(id=>e.bombs.some(b=>b.id===id&&overlaps(b,p.px,p.py)));
    const clear=(x,y)=>{
      for(const ox of [-radius,radius])for(const oy of [-radius,radius]) {
        const cx=Math.floor(x+ox+.5),cy=Math.floor(y+oy+.5);
        if(!$a(e,cx,cy,p.passwall>e.time,true))return false;
      }
      return !e.bombs.some(b=>!p.bombPass.includes(b.id)&&overlaps(b,x,y));
    };
    // Kicking uses the same collision boundary as walking.
    if(p.kick){const b=e.bombs.find(b=>!p.bombPass.includes(b.id)&&overlaps(b,p.px+dx*distance,p.py+dy*distance));
      if(b&&$a(e,b.x+dx,b.y+dy)){b.x+=dx;b.y+=dy;b.dir=dir;b.next=e.time+150;}}
    while(distance>1e-8){const step=Math.min(.035,distance);distance-=step;
      let nx=p.px+dx*step,ny=p.py+dy*step;
      if(!clear(nx,ny)){
        // Round a corner by travelling toward the corridor centre, never snapping.
        const cross=dx?p.py:p.px,target=Math.round(cross),offset=target-cross;
        const tx=dx?p.px+dx*.82:target,ty=dy?p.py+dy*.82:target;
        if(Math.abs(offset)<.49&&Math.abs(offset)>.001&&$a(e,Math.round(tx),Math.round(ty),p.passwall>e.time,true)){
          nx=dx?p.px:p.px+Math.sign(offset)*Math.min(step,Math.abs(offset));
          ny=dy?p.py:p.py+Math.sign(offset)*Math.min(step,Math.abs(offset));
          if(!clear(nx,ny))break;
        }else break;
      }
      p.fromX=p.px;p.fromY=p.py;p.px=nx;p.py=ny;p.moving=true;p.lastMove=e.time;
    }
    const previousX=p.x,previousY=p.y;p.x=Math.round(p.px);p.y=Math.round(p.py);
    p.next=e.time;
    const cell=j(e,p.x,p.y);
    if(cell.terrain==='teleport'&&e.teleportAt<e.time){
      const to=Le(e).find(c=>c.t.terrain==='teleport'&&(c.x!==p.x||c.y!==p.y));
      if(to&&$a(e,to.x,to.y)){p.x=p.px=to.x;p.y=p.py=to.y;e.teleportAt=e.time+1200;oe(e,'teleport','Cổng A–B');}
    }
    if(cell.terrain==='bridge'&&!e.visited.includes(Ms(e,p.x,p.y))){e.visited.push(Ms(e,p.x,p.y));e.goals.visit++;}
    if(e.gate.revealed&&p.x===e.gate.x&&p.y===e.gate.y&&Math.hypot(p.px-p.x,p.py-p.y)<.22){
      if(kr(e)){e.status='exiting';e.endingAt=e.time+800;At(e,'gate',p.x,p.y,800);oe(e,'win','Mục tiêu hoàn thành · Đang bước qua cổng');}
      else if(previousX!==p.x||previousY!==p.y)oe(e,'gate','Cổng đã lộ — hãy hoàn thành mục tiêu còn lại');
    }
  }
  function As(e, direction) {e.moveIntent=direction;return e.status==='playing';}
  function boomDrawBlast(ctx, effect, time, cosmetic) {
    const cells=effect.cells||[],age=time-effect.at;
    if(!cells.length)return;
    const set=new Set(cells.map(c=>`${c.x},${c.y}`));
    const edges=[];
    for(const c of cells)for(const [dx,dy] of [[1,0],[0,1]])if(set.has(`${c.x+dx},${c.y+dy}`))edges.push([c.x*48+24,c.y*48+24,(c.x+dx)*48+24,(c.y+dy)*48+24]);
    const pulse=1+.07*Math.sin(age/45),fade=Math.min(1,(effect.duration-age)/130);
    ctx.save();ctx.globalAlpha=Math.max(0,fade);ctx.lineCap='round';ctx.lineJoin='round';
    const colors=effect.bombType==='ice'?['#4297c0','#87e1ff','#e8fcff']:effect.bombType==='blackhole'?['#7a46b5','#ba8cff','#f5eaff']:['#d76320','#ffb83f','#fff4a0'];
    for(let k=0;k<3;k++){
      ctx.strokeStyle=ctx.fillStyle=colors[k];ctx.lineWidth=[25,18,9][k]*pulse;
      if(k===0){ctx.shadowColor=colors[1];ctx.shadowBlur=8;}else ctx.shadowBlur=0;
      ctx.beginPath();for(const [x,y,xx,yy] of edges){ctx.moveTo(x,y);ctx.lineTo(xx,yy);}ctx.stroke();
      for(const c of cells){ctx.beginPath();ctx.arc(c.x*48+24,c.y*48+24,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}
    }
    ctx.fillStyle='#fffbe0';ctx.beginPath();ctx.arc(effect.x*48+24,effect.y*48+24,13*pulse,0,Math.PI*2);ctx.fill();
    // Short sparks stay within the affected cells; no visual fire through walls.
    for(const c of cells){const phase=(age/500+c.x*.19+c.y*.31)%1;ctx.globalAlpha=Math.max(0,fade*(1-phase));ctx.fillRect(c.x*48+12+phase*22,c.y*48+10+Math.sin(phase*6)*7,3,3);}
    ctx.restore();
  }
  function Ph(e, a = "normal") {
    if (e.status !== "playing" || e.bombs.filter((o) => o.owner === "pip").length >= Math.min(6, e.player.capacity) || e.bombs.some((o) => o.x === e.player.x && o.y === e.player.y)) return false;
    if (a !== "normal") {
      if (e.player.special[a] <= 0) return false;
      e.player.special[a]--;
    }
    let t = e.player;
    e.placed++;
    let l = { id: ++e.sequence, x: t.x, y: t.y, at: e.time + t.fuse + (e.curseUntil > e.time ? 1e3 : 0), range: Math.min(6, t.range), type: a, owner: "pip", safe: e.level.id === 1 && e.placed === 1, chain: false, next: e.time + 200, pierce: t.pierce > 0 };
    if (l.pierce && t.pierce--, j(e, l.x, l.y).terrain === "bounce") {
      let [o, s] = Ke[t.dir];
      $a(e, l.x + o * 2, l.y + s * 2) && (l.x += o * 2, l.y += s * 2, l.chain = true);
    }
    return e.bombs.push(l), (t.bombPass ||= []).push(l.id), oe(e, "bomb", "Bom \u0111\xE3 \u0111\u1EB7t"), true;
  }
  function bn(e, a) {
    let t = [{ x: a.x, y: a.y, part: "center", rotation: 0 }];
    for (let l of Nh) {
      let [o, s] = Ke[l], i = a.x, n = a.y, u = a.pierce ? 1 : 0;
      for (let r = 1; r <= a.range + (a.type === "fire" ? 1 : 0); r++) {
        i += o, n += s;
        let _ = j(e, i, n);
        if (_.wall === "hard") break;
        let x = _.wall !== "none" && _.wall !== "mirror", m = r === a.range + (a.type === "fire" ? 1 : 0) || x && u === 0, d = o > 0 ? 0 : s > 0 ? 90 : o < 0 ? 180 : 270;
        if (t.push({ x: i, y: n, part: m ? "end" : "arm", rotation: d }), _.wall === "mirror") {
          [o, s] = [-s, o];
          continue;
        }
        if (x) {
          if (u > 0) {
            u--;
            continue;
          }
          break;
        }
      }
    }
    return t;
  }
  function co(e, a = "explosion") {
    let t = e.player;
    e.status !== "playing" || t.invulnerable > e.time || (t.shield > e.time ? (t.shield = 0, oe(e, "shield", "Khi\xEAn \u0111\xE3 ch\u1EB7n m\u1ED9t \u0111\xF2n")) : (t.hp--, e.damage++, oe(e, "hit", "Pip m\u1EA5t 1 tim!"), At(e, "hit", t.x, t.y)), t.invulnerable = e.time + 1500 + e.statGuard * 100, t.hp <= 0 && (e.status = "lost", e.reason = a === "time" ? "H\u1EBFt th\u1EDDi gian" : "Pip \u0111\xE3 h\u1EBFt tim", oe(e, "lose", e.reason)));
  }
  function Rx(e, a) {
    if (a.item) return;
    e.wallsSinceDrop++;
    let t = (0.25 - (e.level.chapter - 1) * 0.011) * (1 + e.statLuck * 0.02) + (e.easy ? 0.1 : 0);
    if (e.wallsSinceDrop < 5 && _a(e) > t) return;
    e.wallsSinceDrop = 0;
    let l = ["bomb_plus", "fire", "boots", "shield", "heart", "coin", "remote", "passwall"];
    e.level.chapter >= 2 && l.push("kick", "hourglass"), e.level.chapter >= 3 && l.push("pierce", "bomb_fire", "bomb_ice"), e.level.chapter >= 4 && l.push("glove"), e.level.chapter >= 5 && l.push("magnet", "armor"), e.level.chapter >= 9 && l.push("bomb_blackhole"), e.level.id > 3 && e.level.stage !== 8 && _a(e) < 0.06 && l.push("curse"), a.item = l[Math.floor(_a(e) * l.length)];
  }
  function zx(e, a, t) {
    let l = e.boss;
    if (!l || l.hp <= 0 || !t.some((n) => Math.abs(n.x - l.x) <= 1 && Math.abs(n.y - l.y) <= 1)) return;
    let o = e.level.chapter, s = l.weak > e.time && e.time >= l.attackAt + (o === 10 ? 2000 : 1500);
    if (o === 4 && (s = l.pillars.every((n) => n > e.time)), o === 6 && (s = s && (a.type === "fire" || a.chain)), o === 9 && (s = s && e.cells.filter((n) => n.switch && n.lit).length >= (l.phase === 3 ? 2 : 1) && (l.phase !== 3 || a.type === "blackhole")), o === 10 && l.phase === 3 && (s = a.type === "light"), !s) {
      oe(e, "armor", "Boss \u0111ang c\xF3 gi\xE1p \u2014 ch\u1EDD \u0111i\u1EC3m y\u1EBFu m\u1EDF");
      return;
    }
    l.hp = Math.max(0, l.hp - (o === 10 && l.phase === 3 ? 5 : 1)), e.score += 120, At(e, "hit", l.x, l.y), oe(e, "bossHit", "Tr\xFAng \u0111i\u1EC3m y\u1EBFu!");
    let i = l.hp > l.maxHp * 2 / 3 ? 1 : l.hp > l.maxHp / 3 ? 2 : 3;
    if (l.hp === 0) {
      e.goals.boss = 1, e.gate.revealed = true, j(e, e.gate.x, e.gate.y).wall = "none", e.enemies = [], At(e, "death", l.x, l.y, 900), oe(e, "bossDefeat", "L\xF5i S\xE1ng \u0111\xE3 \u0111\u01B0\u1EE3c gi\u1EA3i ph\xF3ng!");
      return;
    }
    i > l.phase && (l.phase = i, l.checkpoint = l.hp, l.stun = e.time + 2e3, l.weak = 0, l.next = e.time + 3e3, j(e, 1, 2).item = "heart", j(e, 2, 1).item = "shield", oe(e, "phase", `Giai \u0111o\u1EA1n ${i}/3`), o === 10 && i === 3 && Fh(e));
  }
  function Fh(e) {
    Le(e).filter((a) => $a(e, a.x, a.y) && Re(a, e.player) > 0).slice(0, 9).forEach((a) => a.t.item = "light");
  }
  function Xh(e, a) {
    let t = [a], l = /* @__PURE__ */ new Set(), o = 0;
    for (; t.length; ) {
      let s = t.shift();
      if (l.has(s)) continue;
      let i = e.bombs.find((u) => u.id === s);
      if (!i) continue;
      l.add(s), e.bombs = e.bombs.filter((u) => u.id !== s), o++;
      let n = bn(e, i);
      if (e.fx.push({ id: ++e.sequence, kind: "explosion", x: i.x, y: i.y, at: e.time, duration: 500, bombType: i.type, cells: n, safe: i.safe, owner: i.owner }), oe(e, "explode", "B\xF9m!"), i.type === "blackhole") for (let u of e.enemies) Re(u, i) <= 4 && (u.x = i.x, u.y = i.y);
      for (let u of n) {
        let r = j(e, u.x, u.y), _ = e.gate.revealed;
        if (r.wall === "mirror") continue;
        if (r.switch && (e.level.chapter === 4 && e.boss ? (e.boss.pillars[r.switch - 1] = e.time + 1e4, r.lit = true) : !r.lit && (r.switch === e.switchNext || e.level.chapter === 9) ? (r.lit = true, e.goals.switch++, e.switchNext++, oe(e, "switch", `\u0110\xE3 k\xEDch ho\u1EA1t ${e.goals.switch}`)) : r.lit || oe(e, "switch", "H\xE3y k\xEDch ho\u1EA1t \u0111\xFAng th\u1EE9 t\u1EF1 s\u1ED1 tr\xEAn c\xF4ng t\u1EAFc")), r.wall !== "none" && r.wall !== "hard") {
          if (r.wall === "ice" && i.type !== "fire" && !i.chain) oe(e, "ice", "Kh\u1ED1i b\u0103ng c\u1EA7n Bom L\u1EEDa ho\u1EB7c n\u1ED5 d\xE2y chuy\u1EC1n");
          else if (r.hp--, r.hp <= 0) {
            let m = r.wall;
            if (r.wall = "none", e.goals.wall++, e.score += 25, At(e, "break", u.x, u.y), m === "barrel") {
              e.goals.barrel++;
              let d = { ...i, id: ++e.sequence, x: u.x, y: u.y, range: 1, chain: true, at: e.time };
              e.bombs.push(d), t.push(d.id);
            }
            m === "ice" && e.goals.ice++, m === "machine" && e.goals.machine++, m === "cage" ? (e.goals.rescue++, e.rescued.push({ x: u.x, y: u.y, injured: false })) : Rx(e, r), u.x === e.gate.x && u.y === e.gate.y && (e.gate.revealed = true);
          }
        }
        _ && u.x === e.gate.x && u.y === e.gate.y && !e.boss && (ro(e), _a(e) < 0.5 && ro(e), oe(e, "gatePenalty", "C\u1ED5ng tr\xFAng bom \xB7 R\u1EC9 S\xE9t Binh xu\u1EA5t hi\u1EC7n!"));
        for (let m of e.bombs.filter((d) => d.x === u.x && d.y === u.y)) m.chain = true, t.push(m.id);
        let x = e.enemies.filter((m) => m.deadUntil && m.x === u.x && m.y === u.y);
        for (let m of [...e.enemies].filter((d) => boomTouches(d,u,e.time) && d.hp > 0 && !d.deadUntil)) {
          if (i.type === "ice") {
            m.frozenAt ??= e.time; m.frozen = e.time + 4e3;
            continue;
          }
          if (!(m.kind === "enemy_ma_mo" && !e.cells.some((d, y) => d.switch && d.lit && Re({ x: y % e.level.width, y: Math.floor(y / e.level.width) }, m) < 4))) {
            if (/xac_uop|bo_xuong/.test(m.kind) && !m.revived) {
              m.deadUntil = e.time + 8e3, m.revived = true, oe(e, "mummy", "N\u1ED5 l\u1EA7n n\u1EEFa tr\u01B0\u1EDBc khi k\u1EBB th\xF9 h\u1ED3i sinh!");
              continue;
            }
            m.hp--, m.hp <= 0 && (e.goals.kill++, e.score += 100, At(e, "death", m.x, m.y), m.kind === "enemy_nam_lun" && (ro(e, "enemy_nam_small", m.x, m.y), ro(e, "enemy_nam_small", m.x, m.y)), _a(e) < 0.1 && (j(e, m.x, m.y).item = "coin"));
          }
        }
        for (let m of x) m.hp = 0, m.deadUntil = void 0, e.goals.kill++, At(e, "death", m.x, m.y);
        boomTouches(e.player,u,e.time) && !i.safe && !(i.owner === "pip" && e.player.armor > e.time) && co(e);
        for (let m of e.rescued) m.x === u.x && m.y === u.y && !m.injured && e.fx.some((d) => d.kind === "explosion" && d.at < e.time) && (m.injured = true, e.injured++);
      }
      zx(e, i, n);
    }
    e.chainBest = Math.max(e.chainBest, o), o >= 3 && e.chainCount++, e.enemies = e.enemies.filter((s) => s.hp > 0);
  }
  function Vh(e) {
    for (let a of Le(e)) {
      if (!a.t.item || Re(a, e.player) > (e.player.magnet > e.time ? 2 : 0)) continue;
      let t = a.t.item;
      delete a.t.item, e.collected++;
      let l = e.player;
      switch (t) {
        case "bomb_plus":
          l.capacity = Math.min(6, l.capacity + 1);
          break;
        case "fire":
          l.range = Math.min(6, l.range + 1);
          break;
        case "boots":
          l.boots < 3 && (l.speed += 0.3, l.boots++);
          break;
        case "shield":
          l.shield = e.time + 2e4;
          break;
        case "heart":
          l.hp = Math.min(l.maxHp, l.hp + 1);
          break;
        case "gem":
          e.goals.collect++, e.score += 60;
          break;
        case "coin":
          e.coins += 3;
          break;
        case "remote":
          l.remote = true;
          break;
        case "hourglass":
          e.limit ? e.limit += 2e4 : e.slowUntil = e.time + 5e3;
          break;
        case "magnet":
          l.magnet = e.time + 3e4;
          break;
        case "kick":
          l.kick = true;
          break;
        case "glove":
          l.glove = true;
          break;
        case "bomb_fire":
          l.special.fire = Math.min(20, l.special.fire + 3);
          break;
        case "bomb_ice":
          l.special.ice = Math.min(3, l.special.ice + 3);
          break;
        case "bomb_blackhole":
          l.special.blackhole = Math.min(20, l.special.blackhole + 3);
          break;
        case "armor":
          l.armor = e.time + 1e4;
          break;
        case "passwall":
          l.passwall = e.time + 15e3;
          break;
        case "curse":
          e.curseUntil = e.time + 1e4;
          break;
        case "pierce":
          l.pierce = Math.min(3, l.pierce + 3);
          break;
        case "light":
          e.lightShards++, e.lightShards >= 9 && (l.special.light++, e.lightShards = 0, oe(e, "light", "Bom \xC1nh S\xE1ng \u0111\xE3 n\u1EA1p!"));
          break;
      }
      At(e, "pickup", a.x, a.y), oe(e, "pickup", Ox[t]);
    }
  }
  var Ox = { bomb_plus: "Bom Th\xEAm", fire: "L\u1EEDa Lan", boots: "Gi\xE0y Gi\xF3", shield: "Khi\xEAn Bong B\xF3ng", heart: "Tim Nh\u1ECF", gem: "Tinh Th\u1EC3", coin: "Xu V\xE0ng", remote: "\u0110i\u1EC1u Khi\u1EC3n T\u1EEB Xa", hourglass: "\u0110\u1ED3ng H\u1ED3 C\xE1t", magnet: "Nam Ch\xE2m", kick: "C\xFA \u0110\xE1", glove: "G\u0103ng N\xE9m", bomb_ice: "Bom B\u0103ng", bomb_fire: "Bom L\u1EEDa", bomb_blackhole: "Bom H\u1ED1 \u0110en", armor: "\xC1o Ch\u1ED1ng N\u1ED5", curse: "Nguy\u1EC1n 10 gi\xE2y", passwall: "Xuy\xEAn T\u01B0\u1EDDng", pierce: "Bom Xuy\xEAn", light: "M\u1EA3nh L\xF5i S\xE1ng" };
  function Kh(e) {
    if (e.status !== "playing") return false;
    let a = e.player;
    if (a.remote && e.bombs.some((t) => t.owner === "pip")) {
      for (let t of [...e.bombs].filter((l) => l.owner === "pip")) Xh(e, t.id);
      return true;
    }
    if (a.glove) {
      let [t, l] = Ke[a.dir], o = e.bombs.find((s) => Re(s, a) <= 1);
      if (o) {
        for (let s = 3; s > 0; s--) if ($a(e, a.x + t * s, a.y + l * s)) return o.x = a.x + t * s, o.y = a.y + l * s, oe(e, "throw", "N\xE9m bom!"), true;
      }
    }
    if (e.hammer > 0) {
      let [t, l] = Ke[a.dir], o = j(e, a.x + t, a.y + l);
      if (o.wall === "hard" && a.x + t > 0 && a.x + t < e.level.width - 1 && a.y + l > 0 && a.y + l < e.level.height - 1) return o.wall = "none", e.hammer--, true;
    }
    return false;
  }
  function qx(e) {
    for (let a of e.enemies) {
      if (a.deadUntil) {
        e.time >= a.deadUntil && (a.deadUntil = void 0, a.hp = 1);
        continue;
      }
      if (a.frozenAt !== undefined && e.time >= a.frozen) {const pause=a.frozen-a.frozenAt;a.next+=pause;a.lastMove+=pause;delete a.frozenAt;}
      if (e.time < a.next || e.time < a.frozen) continue;
      let t = /buom|doi|drone|hai_au|ma_mo/.test(a.kind), l = Nh.filter((i) => {
        let [n, u] = Ke[i];
        return $a(e, a.x + n, a.y + u, t) && !e.enemies.some((r) => r !== a && r.x === a.x + n && r.y === a.y + u);
      });
      /ma_mo|doi|drone/.test(a.kind) && (l = l.filter((i) => {
        let [n, u] = Ke[i];
        return !e.bombs.some((r) => bn(e, r).some((_) => _.x === a.x + n && _.y === a.y + u));
      })), /rat|cap|lua|tuan_tra/.test(a.kind) && Re(a, e.player) <= 4 ? l.sort((i, n) => Re({ x: a.x + Ke[i][0], y: a.y + Ke[i][1] }, e.player) - Re({ x: a.x + Ke[n][0], y: a.y + Ke[n][1] }, e.player)) : l.length > 1 && _a(e) < 0.7 && l.includes(a.dir) && (l = [a.dir]);
      let o = l[0] || a.dir;
      if (l.length) {
        let [i, n] = Ke[o];
        a.fromX = a.x, a.fromY = a.y, a.x += i, a.y += n, a.dir = o, a.lastMove = e.time;
      }
      let s = /rat|buom/.test(a.kind) ? 1.2 : /cap|lua/.test(a.kind) ? 1.6 : /doi|drone/.test(a.kind) ? 1.4 : 0.8;
      a.next = e.time + 1e3 / (s * (1 + 0.04 * (e.level.chapter - 1)) * (e.easy ? 0.8 : 1)), /drone|nguoi_tuyet|tuan_tra_2/.test(a.kind) && _a(e) < 0.12 && e.warnings.push({ id: ++e.sequence, cells: [Ms(e, e.player.x, e.player.y)], at: e.time + 1500, duration: 500, source: "enemy", fired: false }), false;
    }
  }
  function Wa(e, a, t, l = 1500, o = 500) {
    e.warnings.push({ id: ++e.sequence, cells: a, at: e.time + l, duration: o, source: t, fired: false });
  }
  function Hx(e) {
    let a = e.boss;
    if (!a || a.hp <= 0 || a.stun > e.time || e.time < a.next) return;
    let t = e.level.chapter, l = e.player.y, o = e.player.x, s = e.cells.map((i, n) => n).filter((i) => i % e.level.width === o || Math.floor(i / e.level.width) === l);
    if (Wa(e, s, `boss-${t}`, t === 10 ? 2e3 : 1500), a.attackAt = e.time, a.attack = [["slam", "mine_drop", "enrage"], ["spore_rain", "summon_shrooms", "fog_burst"], ["emerge", "rock_drop_cast", "charge_through"], ["sandstorm_cast", "summon_mummies", "tornado_form"], ["cannon_fire", "anchor_sweep", "tide_raise"], ["ground_pound", "blizzard_cast", "freeze_floor"], ["missile_volley", "conveyor_reverse", "self_destruct"], ["fire_breath", "lava_drop", "land"], ["slash_wave", "clone_split", "merge"], ["bomb_throw", "summon_memories", "core_open"]][t - 1][a.phase - 1], a.next = e.time + 6500 / (1 + (t - 1) * 0.05), a.weak = e.time + 6500, t === 1 || t === 3) {
      a.walkUntil=e.time+400;
      let i = Math.sign(e.player.y - a.y), n = a.y;
      for (let u = 0; u < 3 && j(e, a.x, n + i).wall === "none"; u++) n += i;
      a.y = Math.min(e.level.height - 4, Math.max(3, n)), a.weak = e.time + 6500;
    }
    t === 4 && (a.weak = 0), t === 5 && (a.phase >= 2 && a.anchor && (j(e, 4, 7).wall = "machine", j(e, 4, 7).hp = 1, a.weak = 0), j(e, 4, 7).wall === "none" && (a.anchor = false)), t === 9 && e.cells.filter((n) => n.switch && n.lit).length === 0 && (a.weak = 0), t === 7 && a.phase === 3 && (a.gizmo || (a.gizmo = true, e.player.shield = e.time + 12e3, oe(e, "gizmo", "Gizmo d\u1EF1ng khi\xEAn gi\xFAp Pip!")), Wa(e, e.cells.map((i, n) => n).filter((i) => j(e, i % e.level.width, Math.floor(i / e.level.width)).wall === "none"), "self-destruct", 8e3)), a.phase >= 2 && e.enemies.length < 3 && ro(e), t === 6 && e.player.special.fire < 2 && (j(e, 1, 2).item = "bomb_fire"), t === 9 && e.player.special.blackhole < 2 && (j(e, 1, 2).item = "bomb_blackhole"), t === 10 && a.phase === 3 && e.player.special.light === 0 && !e.cells.some((i) => i.item === "light") && Fh(e), oe(e, "warning", `${oa[t - 1].name_vi} chu\u1EA9n b\u1ECB ra chi\xEAu!`);
  }
  function jh(e, a) {
    if (e.status === "won" || e.status === "lost") return;
    boomAdvance(e,Math.min(a,50));
    e.time += Math.min(a, 50), e.fx = e.fx.filter((o) => e.time - o.at < o.duration), e.warnings = e.warnings.filter((o) => e.time < o.at + o.duration);
    for (let o of [...e.bombs]) {
      if (o.dir && e.time >= o.next) {
        let [i, n] = Ke[o.dir];
        $a(e, o.x + i, o.y + n) ? (o.x += i, o.y += n) : o.dir = void 0, o.next = e.time + 150;
      }
      if (j(e, o.x, o.y).terrain === "teleport" && e.time >= o.next) {
        let i = Le(e).find((n) => n.t.terrain === "teleport" && (n.x !== o.x || n.y !== o.y));
        i && $a(e, i.x, i.y) && (o.x = i.x, o.y = i.y, o.next = e.time + 2e3);
      }
      o.at <= e.time && !(e.player.remote && o.owner === "pip") && Xh(e, o.id);
    }
    if (e.status === "exiting") {
      e.time >= e.endingAt && e.bombs.length === 0 && e.fx.length === 0 && (e.status = "won", oe(e, "result", "Pixelia l\u1EA1i s\xE1ng l\xEAn"));
      return;
    }
    for (let o of e.warnings) if (e.time >= o.at) {
      o.fired = true;
      let s = e.player;
      o.cells.includes(Ms(e, s.x, s.y)) && j(e, s.x, s.y).wall === "none" && co(e, o.source);
    }
    let t = e.player;
    for (const enemy of e.enemies) {const pos=boomPosition(enemy,e.time);if(!enemy.deadUntil&&Math.hypot(pos.x-(t.px??t.x),pos.y-(t.py??t.y))<.58)co(e,'enemy');}
    for (let o of e.fx) o.kind === "explosion" && o.cells?.some((s) => boomTouches(t,s,e.time)) && !o.safe && !(o.owner === "pip" && t.armor > e.time) && co(e);
    if (qx(e), Hx(e), Vh(e), e.goals.survive = Math.floor(e.time / 1e3), e.limit && e.time >= e.limit && e.status === "playing" && (e.status = "lost", e.reason = "H\u1EBFt th\u1EDDi gian", oe(e, "lose", e.reason)), e.time >= e.terrainAt) {
      e.terrainAt = e.time + 5e3;
      let o = e.level.chapter;
      o === 2 && Wa(e, Le(e).filter((s) => s.t.terrain === "bounce").map((s) => s.i), "spore", 1e3, 3e3), o === 3 && Wa(e, Le(e).filter((s) => s.y === Math.floor(e.level.height / 2)).map((s) => s.i), "minecart", 1500), o === 4 && Wa(e, Le(e).filter((s) => s.t.terrain === "spike").map((s) => s.i), "spike", 1e3, 1e3), o === 5 && Wa(e, Le(e).filter((s) => s.x === e.player.x).map((s) => s.i), "cannon", 1500), o === 7 && Wa(e, Le(e).filter((s) => s.y === 3 || s.y === e.level.height - 4).map((s) => s.i), "laser", 1500, 1e3), o === 8 && Wa(e, Le(e).filter((s) => s.t.terrain === "lava").map((s) => s.i), "lava", 1500, 2500), e.level.stage === 5 && (o === 3 || o === 8) && Wa(e, Le(e).filter(() => _a(e) < 0.1).map((s) => s.i), "fall", 1500);
    }
    if (e.level.chapter === 6 && t.special.fire === 0 && e.cells.some((o) => o.wall === "ice") && (j(e, 1, 2).item = "bomb_fire"), e.boss && e.level.chapter === 4) for (let o of e.cells) o.switch && (o.lit = e.boss.pillars[o.switch - 1] > e.time);
    let l = j(e, t.x, t.y);
    if (l.terrain === "fire" ? e.temperature = Math.min(100, e.temperature + 0.2) : e.level.chapter === 6 && e.level.stage === 5 && (e.temperature = Math.max(0, e.temperature - 0.012 * a), e.temperature < 25 && (e.slowUntil = e.time + 100)),  l.terrain === "water" && Math.floor(e.time / 2e4) % 2 === 1 && (e.slowUntil = e.time + 500), l.terrain === "bridge" && e.time % 12e3 > 6e3 && co(e, "lava"), e.status === "playing" && t.passwall <= e.time && l.wall !== "none") {
      let o = Le(e).find((s) => Re(s, t) <= 1);
      o ? (t.x = t.px = o.x, t.y = t.py = o.y) : co(e);
    }
  }
  function Yh(e) {
    if (e.status !== "lost" || e.revived && (!e.boss || e.boss.retryUsed)) return false;
    if (e.boss && !e.boss.retryUsed) e.boss.retryUsed = true, e.boss.hp = e.boss.checkpoint;
    else {
      if (e.reviveTokens <= 0) return false;
      e.reviveTokens--, e.revived = true;
    }
    return e.status = "playing", e.player.hp = Math.min(3, e.player.maxHp), e.player.x = e.player.px = 1, e.player.y = e.player.py = 1, e.moveIntent = null, e.player.invulnerable = e.time + 3e3, e.bombs = [], e.fx = [], e.warnings = [], e.limit && (e.limit = Math.max(e.limit, e.time + 3e4)), true;
  }
  function po(e) {
    if (e.status !== "won") return 0;
    if (e.level.stage === 8) {
      let a = [e.damage === 0, e.time < 18e4, e.usedBoosters === 0].filter(Boolean).length;
      return a === 3 ? 3 : a >= 2 ? 2 : 1;
    }
    return 1 + (e.damage === 0 && e.injured === 0 ? 1 : 0) + (e.time < e.level.fast * 1e3 ? 1 : 0);
  }
  function xn(e) {
    try {
      let a = JSON.parse(JSON.stringify(e));
      return a?.version !== 1 || !(a.mode === "endless" || va.some((t) => t.id === a.level?.id)) || a.cells.length !== a.level.width * a.level.height || !Number.isFinite(a.time) || a.player.hp < 0 || a.player.x < 0 || a.player.x >= a.level.width || a.player.y < 0 || a.player.y >= a.level.height || !["playing", "exiting", "won", "lost"].includes(a.status) ? null : a;
    } catch {
      return null;
    }
  }
  function mo() {
    return { version: 1, name: "Pip", coins: 0, shards: 0, gems: 0, reviveCoins: 1, stats: _n(), stars: {}, cores: [], owned: [], equipped: {}, tutorials: [], stories: [], paid: [], active: null, failures: {}, quests: { walls: 0, chain: 0, wins: 0, claimed: [] }, daily: {}, giftDay: "", gift: null, bestFloor: 0, prefs: { warning: true, colorblind: false, shake: true, haptics: false, sfx: true, music: false, easy: false, leftHand: false, buttonSize: 1, controls: "joystick" } };
  }
  function Qh(e = false) {
    try {
      let a = JSON.parse(localStorage.getItem(e ? "boom-buddies-review-v1" : "boom-buddies-v1") || "null");
      if (a?.version !== 1) return mo();
      let t = mo();
      return { ...t, ...a, stats: { ...t.stats, ...a.stats }, prefs: { ...t.prefs, ...a.prefs }, quests: { ...t.quests, ...a.quests }, active: xn(a.active) };
    } catch {
      return mo();
    }
  }
  function Ir(e, a = false) {
    try {
      return localStorage.setItem(a ? "boom-buddies-review-v1" : "boom-buddies-v1", JSON.stringify(e)), true;
    } catch {
      return false;
    }
  }
  var yn = (e, a, t = false) => t || a === 1 || !!e.stars[a - 1], Tr = (e) => Object.entries(fo).reduce((a, [t, l]) => a + e.stats[t] * l.weight, 0);
  function Zh(e, a) {
    let t = e.stats[a], l = fo[a];
    return t >= l.cost.length || e.coins < l.cost[t] || e.shards < l.shards[t] ? false : (e.coins -= l.cost[t], e.shards -= l.shards[t], e.stats[a]++, true);
  }
  function Jh(e) {
    let a = 0, t = 0;
    for (let [l, o] of Object.entries(fo)) {
      let s = e.stats[l];
      a += o.cost.slice(0, s).reduce((i, n) => i + n, 0), t += o.shards.slice(0, s).reduce((i, n) => i + n, 0);
    }
    e.coins += Math.floor(a * 0.8), e.shards += t, e.stats = _n();
  }
  function Wh(e, a) {
    if (a.status !== "won" || e.paid.includes(a.id)) return { coins: 0, shards: 0, gems: 0, stars: po(a) };
    e.paid.push(a.id), e.paid.length > 200 && e.paid.shift(), a.paid = true;
    let t = po(a), l = a.seed.toString(), o = a.mode === "daily" ? e.daily[l] || 0 : e.stars[a.level.id] || 0, s = o === 0, i = Math.max(0, t - o), n = (a.mode === "daily" && o >= t ? 0 : a.coins) + (a.mode === "daily" && o >= t ? 0 : s ? a.level.coins : Math.round(a.level.coins * 0.3)) + (i > 0 ? Math.round(t === 3 ? a.level.coins * 0.5 : a.level.coins * 0.2) : 0), u = t === 3 && o < 3 ? a.level.shards : 0, r = a.level.stage === 8, _ = s && r ? a.level.chapter === 10 ? 10 : 2 : 0;
    if (e.coins += n, e.shards += u, e.gems += _, e.quests.walls += a.goals.wall, e.quests.chain += a.chainCount, e.quests.wins++, e.failures[a.level.id] = 0, a.mode === "daily" && (e.daily[l] = Math.max(o, t)), a.mode === "campaign" && (e.stars[a.level.id] = Math.max(o, t), r && !e.cores.includes(a.level.chapter))) {
      e.cores.push(a.level.chapter), e.reviveCoins++;
      let x = ga.find((d) => d.slot === "hat" && d.set === `set${a.level.chapter}`);
      x && !e.owned.includes(x.id) && e.owned.push(x.id);
      let m = ga.find((d) => d.slot === "pet" && d.set === `set${a.level.chapter}`);
      m && !e.owned.includes(m.id) && e.owned.push(m.id);
    }
    return a.mode === "endless" && (e.bestFloor = Math.max(e.bestFloor, a.level.id)), { coins: n, shards: u, gems: _, stars: t };
  }
  function $h(e, a, t, l = false) {
    let o = 0, s = 0;
    for (let [i, n] of Object.entries(t)) {
      let u = i, r = uo.find((_) => _.id === u);
      if (!r || !Number.isInteger(n) || n < 0 || n > r.max || l && n > 0 && ["hammer", "radar", "treasure"].includes(u)) return false;
      o += n > 0 ? 1 : 0, s += Ts(u, a) * n;
    }
    return o > 3 || e.coins < s ? false : (e.coins -= s, true);
  }
  function Mr(e) {
    let a = ga.find((t) => t.id === e);
    return a.rarity === "Huy\u1EC1n tho\u1EA1i" ? { coins: 0, gems: 0, boss: true } : a.rarity === "S\u1EED thi" ? { coins: 0, gems: 70, boss: false } : a.rarity === "Hi\u1EBFm" ? { coins: 0, gems: 25, boss: false } : { coins: 250, gems: 0, boss: false };
  }
  function eg(e, a) {
    if (e.owned.includes(a)) return true;
    let t = Mr(a);
    return t.boss || e.coins < t.coins || e.gems < t.gems ? false : (e.coins -= t.coins, e.gems -= t.gems, e.owned.push(a), true);
  }
  function ag(e, a = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
    return e.giftDay === a ? false : (e.giftDay = a, e.gift = ["bomb", "shield", "clock", "radar"][Number(a.replaceAll("-", "")) % 4], true);
  }
  var tg = { floor_a: "tiles/png/tiles_ch1/floor_a.png", floor_b: "tiles/png/tiles_ch1/floor_b.png", hard_block: "tiles/png/tiles_ch1/hard_block.png", soft_block: "tiles/png/tiles_ch1/soft_block.png", bush: "tiles/png/tiles_ch1/bush.png", gate_locked: "tiles/png/tiles_ch1/gate_locked.png", gate_open: "tiles/png/tiles_ch1/gate_open.png", bomb_0: "tiles/png/bombs/bomb_0.png", bomb_1: "tiles/png/bombs/bomb_1.png", bomb_2: "tiles/png/bombs/bomb_2.png", explosion_center: "tiles/png/fx/explosion_center.png", explosion_arm_h: "tiles/png/fx/explosion_arm_h.png", explosion_arm_v: "tiles/png/fx/explosion_arm_v.png", explosion_end_right: "tiles/png/fx/explosion_end_right.png", item_bomb_plus: "tiles/png/items/item_bomb_plus.png", item_fire: "tiles/png/items/item_fire.png", item_boots: "tiles/png/items/item_boots.png", item_shield: "tiles/png/items/item_shield.png", item_heart: "tiles/png/items/item_heart.png", item_gem: "tiles/png/items/item_gem.png", item_coin: "tiles/png/items/item_coin.png", pip_idle_front: "tiles/png/characters/pip_idle_front.png", bum_front: "tiles/png/characters/bum_front.png", enemy_slime_rust: "tiles/png/enemies/enemy_slime_rust.png", enemy_rat_machine: "tiles/png/enemies/enemy_rat_machine.png", ch2_floor_a: "tiles/png/tiles_ch2/ch2_floor_a.png", ch2_floor_b: "tiles/png/tiles_ch2/ch2_floor_b.png", ch2_hard_block: "tiles/png/tiles_ch2/ch2_hard_block.png", ch2_soft_block: "tiles/png/tiles_ch2/ch2_soft_block.png", ch2_gate_locked: "tiles/png/tiles_ch2/ch2_gate_locked.png", ch2_gate_open: "tiles/png/tiles_ch2/ch2_gate_open.png", enemy_nam_lun: "tiles/png/enemies_ch2/enemy_nam_lun.png", enemy_buom_bao_tu: "tiles/png/enemies_ch2/enemy_buom_bao_tu.png", ch3_floor_a: "tiles/png/tiles_ch3/ch3_floor_a.png", ch3_floor_b: "tiles/png/tiles_ch3/ch3_floor_b.png", ch3_hard_block: "tiles/png/tiles_ch3/ch3_hard_block.png", ch3_soft_block: "tiles/png/tiles_ch3/ch3_soft_block.png", ch3_gate_locked: "tiles/png/tiles_ch3/ch3_gate_locked.png", ch3_gate_open: "tiles/png/tiles_ch3/ch3_gate_open.png", enemy_doi_hang: "tiles/png/enemies_ch3/enemy_doi_hang.png", enemy_golem_da: "tiles/png/enemies_ch3/enemy_golem_da.png", ch4_floor_a: "tiles/png/tiles_ch4/ch4_floor_a.png", ch4_floor_b: "tiles/png/tiles_ch4/ch4_floor_b.png", ch4_hard_block: "tiles/png/tiles_ch4/ch4_hard_block.png", ch4_soft_block: "tiles/png/tiles_ch4/ch4_soft_block.png", ch4_gate_locked: "tiles/png/tiles_ch4/ch4_gate_locked.png", ch4_gate_open: "tiles/png/tiles_ch4/ch4_gate_open.png", enemy_xac_uop: "tiles/png/enemies_ch4/enemy_xac_uop.png", enemy_bo_cap: "tiles/png/enemies_ch4/enemy_bo_cap.png", ch5_floor_a: "tiles/png/tiles_ch5/ch5_floor_a.png", ch5_floor_b: "tiles/png/tiles_ch5/ch5_floor_b.png", ch5_hard_block: "tiles/png/tiles_ch5/ch5_hard_block.png", ch5_soft_block: "tiles/png/tiles_ch5/ch5_soft_block.png", ch5_gate_locked: "tiles/png/tiles_ch5/ch5_gate_locked.png", ch5_gate_open: "tiles/png/tiles_ch5/ch5_gate_open.png", enemy_cua_giap: "tiles/png/enemies_ch5/enemy_cua_giap.png", enemy_hai_au: "tiles/png/enemies_ch5/enemy_hai_au.png", ch6_floor_a: "tiles/png/tiles_ch6/ch6_floor_a.png", ch6_floor_b: "tiles/png/tiles_ch6/ch6_floor_b.png", ch6_hard_block: "tiles/png/tiles_ch6/ch6_hard_block.png", ch6_soft_block: "tiles/png/tiles_ch6/ch6_soft_block.png", ch6_gate_locked: "tiles/png/tiles_ch6/ch6_gate_locked.png", ch6_gate_open: "tiles/png/tiles_ch6/ch6_gate_open.png", enemy_nguoi_tuyet: "tiles/png/enemies_ch6/enemy_nguoi_tuyet.png", enemy_canh_cut: "tiles/png/enemies_ch6/enemy_canh_cut.png", ch7_floor_a: "tiles/png/tiles_ch7/ch7_floor_a.png", ch7_floor_b: "tiles/png/tiles_ch7/ch7_floor_b.png", ch7_hard_block: "tiles/png/tiles_ch7/ch7_hard_block.png", ch7_soft_block: "tiles/png/tiles_ch7/ch7_soft_block.png", ch7_gate_locked: "tiles/png/tiles_ch7/ch7_gate_locked.png", ch7_gate_open: "tiles/png/tiles_ch7/ch7_gate_open.png", enemy_robot_tuan_tra: "tiles/png/enemies_ch7/enemy_robot_tuan_tra.png", enemy_drone: "tiles/png/enemies_ch7/enemy_drone.png", ch8_floor_a: "tiles/png/tiles_ch8/ch8_floor_a.png", ch8_floor_b: "tiles/png/tiles_ch8/ch8_floor_b.png", ch8_hard_block: "tiles/png/tiles_ch8/ch8_hard_block.png", ch8_soft_block: "tiles/png/tiles_ch8/ch8_soft_block.png", ch8_gate_locked: "tiles/png/tiles_ch8/ch8_gate_locked.png", ch8_gate_open: "tiles/png/tiles_ch8/ch8_gate_open.png", enemy_quy_lua: "tiles/png/enemies_ch8/enemy_quy_lua.png", enemy_golem_magma: "tiles/png/enemies_ch8/enemy_golem_magma.png", ch9_floor_a: "tiles/png/tiles_ch9/ch9_floor_a.png", ch9_floor_b: "tiles/png/tiles_ch9/ch9_floor_b.png", ch9_hard_block: "tiles/png/tiles_ch9/ch9_hard_block.png", ch9_soft_block: "tiles/png/tiles_ch9/ch9_soft_block.png", ch9_gate_locked: "tiles/png/tiles_ch9/ch9_gate_locked.png", ch9_gate_open: "tiles/png/tiles_ch9/ch9_gate_open.png", enemy_ma_mo: "tiles/png/enemies_ch9/enemy_ma_mo.png", enemy_bo_xuong: "tiles/png/enemies_ch9/enemy_bo_xuong.png", ch10_floor_a: "tiles/png/tiles_ch10/ch10_floor_a.png", ch10_floor_b: "tiles/png/tiles_ch10/ch10_floor_b.png", ch10_hard_block: "tiles/png/tiles_ch10/ch10_hard_block.png", ch10_soft_block: "tiles/png/tiles_ch10/ch10_soft_block.png", ch10_gate_locked: "tiles/png/tiles_ch10/ch10_gate_locked.png", ch10_gate_open: "tiles/png/tiles_ch10/ch10_gate_open.png", enemy_ri_set_binh: "tiles/png/enemies_ch10/enemy_ri_set_binh.png", enemy_robot_tuan_tra_2: "tiles/png/enemies_ch10/enemy_robot_tuan_tra_2.png", ch2_bounce_mushroom: "tiles/png/mech_ch2/ch2_bounce_mushroom.png", ch2_spore_cloud: "tiles/png/mech_ch2/ch2_spore_cloud.png", ch3_rail_h: "tiles/png/mech_ch3/ch3_rail_h.png", ch3_minecart: "tiles/png/mech_ch3/ch3_minecart.png", ch4_quicksand: "tiles/png/mech_ch4/ch4_quicksand.png", ch4_spike_trap: "tiles/png/mech_ch4/ch4_spike_trap.png", ch5_water: "tiles/png/mech_ch5/ch5_water.png", ch5_cannon: "tiles/png/mech_ch5/ch5_cannon.png", ch6_ice_floor: "tiles/png/mech_ch6/ch6_ice_floor.png", ch6_bonfire: "tiles/png/mech_ch6/ch6_bonfire.png", ch7_conveyor: "tiles/png/mech_ch7/ch7_conveyor.png", ch7_teleport: "tiles/png/mech_ch7/ch7_teleport.png", ch8_lava: "tiles/png/mech_ch8/ch8_lava.png", ch8_stone_bridge: "tiles/png/mech_ch8/ch8_stone_bridge.png", ch9_magic_door: "tiles/png/mech_ch9/ch9_magic_door.png", ch9_lantern: "tiles/png/mech_ch9/ch9_lantern.png", ch10_core_socket: "tiles/png/mech_ch10/ch10_core_socket.png", item_remote: "tiles/png/items/item_remote.png", item_hourglass: "tiles/png/items/item_hourglass.png", item_magnet: "tiles/png/items/item_magnet.png", item_kick: "tiles/png/items/item_kick.png", item_glove: "tiles/png/items/item_glove.png", item_bomb_ice: "tiles/png/items/item_bomb_ice.png", item_bomb_fire: "tiles/png/items/item_bomb_fire.png", item_bomb_blackhole: "tiles/png/items/item_bomb_blackhole.png", item_armor: "tiles/png/items/item_armor.png", item_curse: "tiles/png/items/item_curse.png", item_passwall: "tiles/png/items/item_passwall.png", btn_primary: "ui/png_ui/buttons/btn_primary.png", btn_secondary: "ui/png_ui/buttons/btn_secondary.png", btn_success: "ui/png_ui/buttons/btn_success.png", btn_danger: "ui/png_ui/buttons/btn_danger.png", btn_info: "ui/png_ui/buttons/btn_info.png", btn_disabled: "ui/png_ui/buttons/btn_disabled.png", btn_small_primary: "ui/png_ui/buttons/btn_small_primary.png", btn_small_secondary: "ui/png_ui/buttons/btn_small_secondary.png", btn_small_disabled: "ui/png_ui/buttons/btn_small_disabled.png", panel_card: "ui/png_ui/panels/panel_card.png", panel_header: "ui/png_ui/panels/panel_header.png", panel_dark: "ui/png_ui/panels/panel_dark.png", panel_popup: "ui/png_ui/panels/panel_popup.png", panel_boss_hud: "ui/png_ui/panels/panel_boss_hud.png", pill_currency: "ui/png_ui/hud/pill_currency.png", pill_dark: "ui/png_ui/hud/pill_dark.png", pill_timer: "ui/png_ui/hud/pill_timer.png", bar_bg: "ui/png_ui/hud/bar_bg.png", bar_fill_orange: "ui/png_ui/hud/bar_fill_orange.png", bar_fill_green: "ui/png_ui/hud/bar_fill_green.png", bar_fill_red: "ui/png_ui/hud/bar_fill_red.png", bar_fill_blue: "ui/png_ui/hud/bar_fill_blue.png", tab_active: "ui/png_ui/hud/tab_active.png", tab_inactive: "ui/png_ui/hud/tab_inactive.png", toggle_on: "ui/png_ui/hud/toggle_on.png", toggle_off: "ui/png_ui/hud/toggle_off.png", speech_bubble: "ui/png_ui/hud/speech_bubble.png", slot_common: "ui/png_ui/slots/slot_common.png", slot_rare: "ui/png_ui/slots/slot_rare.png", slot_epic: "ui/png_ui/slots/slot_epic.png", slot_legend: "ui/png_ui/slots/slot_legend.png", slot_selected: "ui/png_ui/slots/slot_selected.png", avatar_frame_wood: "ui/png_ui/frames/avatar_frame_wood.png", avatar_frame_gold: "ui/png_ui/frames/avatar_frame_gold.png", avatar_frame_core: "ui/png_ui/frames/avatar_frame_core.png", node_open: "ui/png_ui/map/node_open.png", node_cleared: "ui/png_ui/map/node_cleared.png", node_locked: "ui/png_ui/map/node_locked.png", node_boss: "ui/png_ui/map/node_boss.png", node_ring_current: "ui/png_ui/map/node_ring_current.png", star_full: "ui/png_ui/map/star_full.png", star_empty: "ui/png_ui/map/star_empty.png", chip_active: "ui/png_ui/map/chip_active.png", chip_normal: "ui/png_ui/map/chip_normal.png", chip_locked: "ui/png_ui/map/chip_locked.png", btn_bomb: "ui/png_ui/controls/btn_bomb.png", btn_item: "ui/png_ui/controls/btn_item.png", btn_pause: "ui/png_ui/controls/btn_pause.png", joystick_base: "ui/png_ui/controls/joystick_base.png", joystick_knob: "ui/png_ui/controls/joystick_knob.png", heart_full: "ui/png_ui/icons/heart_full.png", heart_empty: "ui/png_ui/icons/heart_empty.png", clock: "ui/png_ui/icons/clock.png", play: "ui/png_ui/icons/play.png", pause: "ui/png_ui/icons/pause.png", gear: "ui/png_ui/icons/gear.png", coin: "ui/png_ui/icons/coin.png", gem_ngoc: "ui/png_ui/icons/gem_ngoc.png", shard_sao: "ui/png_ui/icons/shard_sao.png", core_orb: "ui/png_ui/icons/core_orb.png", revive_coin: "ui/png_ui/icons/revive_coin.png", lock: "ui/png_ui/icons/lock.png", check: "ui/png_ui/icons/check.png", cross: "ui/png_ui/icons/cross.png", arrow_back: "ui/png_ui/icons/arrow_back.png", arrow_next: "ui/png_ui/icons/arrow_next.png", plus: "ui/png_ui/icons/plus.png", minus: "ui/png_ui/icons/minus.png", home: "ui/png_ui/icons/home.png", profile: "ui/png_ui/icons/profile.png", quest: "ui/png_ui/icons/quest.png", book: "ui/png_ui/icons/book.png", shop: "ui/png_ui/icons/shop.png", target: "ui/png_ui/icons/target.png", sound_on: "ui/png_ui/icons/sound_on.png", sound_off: "ui/png_ui/icons/sound_off.png", music: "ui/png_ui/icons/music.png", vibrate: "ui/png_ui/icons/vibrate.png", info: "ui/png_ui/icons/info.png", gift: "ui/png_ui/icons/gift.png", badge_new: "ui/png_ui/icons/badge_new.png", bomb_mini: "ui/png_ui/icons/bomb_mini.png" };
  var lg = { "items/item_armor/bob": { file: "sprites/items/item_armor/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_bomb_blackhole/bob": { file: "sprites/items/item_bomb_blackhole/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_bomb_fire/bob": { file: "sprites/items/item_bomb_fire/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_bomb_ice/bob": { file: "sprites/items/item_bomb_ice/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_bomb_plus/bob": { file: "sprites/items/item_bomb_plus/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_boots/bob": { file: "sprites/items/item_boots/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_coin/spin": { file: "sprites/items/item_coin/spin.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "items/item_curse/bob": { file: "sprites/items/item_curse/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_fire/bob": { file: "sprites/items/item_fire/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_gem/bob": { file: "sprites/items/item_gem/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_glove/bob": { file: "sprites/items/item_glove/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_heart/bob": { file: "sprites/items/item_heart/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_hourglass/bob": { file: "sprites/items/item_hourglass/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_kick/bob": { file: "sprites/items/item_kick/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_magnet/bob": { file: "sprites/items/item_magnet/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_passwall/bob": { file: "sprites/items/item_passwall/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_remote/bob": { file: "sprites/items/item_remote/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "items/item_shield/bob": { file: "sprites/items/item_shield/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "boss_sau_khoan/idle_p1": { file: "sprites/boss_sau_khoan/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_sau_khoan/idle_p2": { file: "sprites/boss_sau_khoan/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_sau_khoan/idle_p3": { file: "sprites/boss_sau_khoan/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_sau_khoan/weak_idle": { file: "sprites/boss_sau_khoan/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_sau_khoan/hit": { file: "sprites/boss_sau_khoan/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_sau_khoan/defeat": { file: "sprites/boss_sau_khoan/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "enemies/enemy_rat_machine/walk": { file: "sprites/enemies/enemy_rat_machine/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_rat_machine/hit": { file: "sprites/enemies/enemy_rat_machine/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_slime_rust/walk": { file: "sprites/enemies/enemy_slime_rust/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_slime_rust/hit": { file: "sprites/enemies/enemy_slime_rust/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_ri_set_binh/walk": { file: "sprites/enemies/enemy_ri_set_binh/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_ri_set_binh/hit": { file: "sprites/enemies/enemy_ri_set_binh/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_robot_tuan_tra_2/walk": { file: "sprites/enemies/enemy_robot_tuan_tra_2/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_robot_tuan_tra_2/hit": { file: "sprites/enemies/enemy_robot_tuan_tra_2/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_buom_bao_tu/walk": { file: "sprites/enemies/enemy_buom_bao_tu/walk.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies/enemy_buom_bao_tu/hit": { file: "sprites/enemies/enemy_buom_bao_tu/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_nam_lun/walk": { file: "sprites/enemies/enemy_nam_lun/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_nam_lun/hit": { file: "sprites/enemies/enemy_nam_lun/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_doi_hang/walk": { file: "sprites/enemies/enemy_doi_hang/walk.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies/enemy_doi_hang/hit": { file: "sprites/enemies/enemy_doi_hang/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_golem_da/walk": { file: "sprites/enemies/enemy_golem_da/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_golem_da/hit": { file: "sprites/enemies/enemy_golem_da/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_bo_cap/walk": { file: "sprites/enemies/enemy_bo_cap/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_bo_cap/hit": { file: "sprites/enemies/enemy_bo_cap/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_xac_uop/walk": { file: "sprites/enemies/enemy_xac_uop/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_xac_uop/hit": { file: "sprites/enemies/enemy_xac_uop/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_cua_giap/walk": { file: "sprites/enemies/enemy_cua_giap/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_cua_giap/hit": { file: "sprites/enemies/enemy_cua_giap/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_hai_au/walk": { file: "sprites/enemies/enemy_hai_au/walk.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies/enemy_hai_au/hit": { file: "sprites/enemies/enemy_hai_au/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_canh_cut/walk": { file: "sprites/enemies/enemy_canh_cut/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_canh_cut/hit": { file: "sprites/enemies/enemy_canh_cut/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_nguoi_tuyet/walk": { file: "sprites/enemies/enemy_nguoi_tuyet/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_nguoi_tuyet/hit": { file: "sprites/enemies/enemy_nguoi_tuyet/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_drone/walk": { file: "sprites/enemies/enemy_drone/walk.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies/enemy_drone/hit": { file: "sprites/enemies/enemy_drone/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_robot_tuan_tra/walk": { file: "sprites/enemies/enemy_robot_tuan_tra/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_robot_tuan_tra/hit": { file: "sprites/enemies/enemy_robot_tuan_tra/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_golem_magma/walk": { file: "sprites/enemies/enemy_golem_magma/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_golem_magma/hit": { file: "sprites/enemies/enemy_golem_magma/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_quy_lua/walk": { file: "sprites/enemies/enemy_quy_lua/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_quy_lua/hit": { file: "sprites/enemies/enemy_quy_lua/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_bo_xuong/walk": { file: "sprites/enemies/enemy_bo_xuong/walk.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies/enemy_bo_xuong/hit": { file: "sprites/enemies/enemy_bo_xuong/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "enemies/enemy_ma_mo/walk": { file: "sprites/enemies/enemy_ma_mo/walk.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies/enemy_ma_mo/hit": { file: "sprites/enemies/enemy_ma_mo/hit.png", w: 48, h: 48, frames: 3, fps: 12, loop: false, offset: [] }, "boss_robot_mk7/idle_p1": { file: "sprites/boss_robot_mk7/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_robot_mk7/idle_p2": { file: "sprites/boss_robot_mk7/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_robot_mk7/idle_p3": { file: "sprites/boss_robot_mk7/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_robot_mk7/weak_idle": { file: "sprites/boss_robot_mk7/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_robot_mk7/hit": { file: "sprites/boss_robot_mk7/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_robot_mk7/defeat": { file: "sprites/boss_robot_mk7/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bao_cat/center": { file: "sprites/fx_cosmetic_explosions/fx_bao_cat/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bao_cat/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_bao_cat/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bao_cat/end_right": { file: "sprites/fx_cosmetic_explosions/fx_bao_cat/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bao_tu/center": { file: "sprites/fx_cosmetic_explosions/fx_bao_tu/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bao_tu/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_bao_tu/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bao_tu/end_right": { file: "sprites/fx_cosmetic_explosions/fx_bao_tu/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bong_tuyet/center": { file: "sprites/fx_cosmetic_explosions/fx_bong_tuyet/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bong_tuyet/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_bong_tuyet/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_bong_tuyet/end_right": { file: "sprites/fx_cosmetic_explosions/fx_bong_tuyet/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_cau_vong/center": { file: "sprites/fx_cosmetic_explosions/fx_cau_vong/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_cau_vong/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_cau_vong/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_cau_vong/end_right": { file: "sprites/fx_cosmetic_explosions/fx_cau_vong/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_dien_tu/center": { file: "sprites/fx_cosmetic_explosions/fx_dien_tu/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_dien_tu/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_dien_tu/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_dien_tu/end_right": { file: "sprites/fx_cosmetic_explosions/fx_dien_tu/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_hoa_anh_dao/center": { file: "sprites/fx_cosmetic_explosions/fx_hoa_anh_dao/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_hoa_anh_dao/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_hoa_anh_dao/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_hoa_anh_dao/end_right": { file: "sprites/fx_cosmetic_explosions/fx_hoa_anh_dao/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_hoa_reu/center": { file: "sprites/fx_cosmetic_explosions/fx_hoa_reu/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_hoa_reu/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_hoa_reu/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_hoa_reu/end_right": { file: "sprites/fx_cosmetic_explosions/fx_hoa_reu/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_linh_hon/center": { file: "sprites/fx_cosmetic_explosions/fx_linh_hon/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_linh_hon/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_linh_hon/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_linh_hon/end_right": { file: "sprites/fx_cosmetic_explosions/fx_linh_hon/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_phao_hoa/center": { file: "sprites/fx_cosmetic_explosions/fx_phao_hoa/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_phao_hoa/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_phao_hoa/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_phao_hoa/end_right": { file: "sprites/fx_cosmetic_explosions/fx_phao_hoa/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_phun_trao/center": { file: "sprites/fx_cosmetic_explosions/fx_phun_trao/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_phun_trao/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_phun_trao/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_phun_trao/end_right": { file: "sprites/fx_cosmetic_explosions/fx_phun_trao/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_song_bien/center": { file: "sprites/fx_cosmetic_explosions/fx_song_bien/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_song_bien/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_song_bien/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_song_bien/end_right": { file: "sprites/fx_cosmetic_explosions/fx_song_bien/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_tinh_the/center": { file: "sprites/fx_cosmetic_explosions/fx_tinh_the/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_tinh_the/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_tinh_the/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_tinh_the/end_right": { file: "sprites/fx_cosmetic_explosions/fx_tinh_the/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_trai_tim/center": { file: "sprites/fx_cosmetic_explosions/fx_trai_tim/center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_trai_tim/arm_h": { file: "sprites/fx_cosmetic_explosions/fx_trai_tim/arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx_cosmetic_explosions/fx_trai_tim/end_right": { file: "sprites/fx_cosmetic_explosions/fx_trai_tim/end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "boss_yeti_bang_gia/idle_p1": { file: "sprites/boss_yeti_bang_gia/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_yeti_bang_gia/idle_p2": { file: "sprites/boss_yeti_bang_gia/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_yeti_bang_gia/idle_p3": { file: "sprites/boss_yeti_bang_gia/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_yeti_bang_gia/weak_idle": { file: "sprites/boss_yeti_bang_gia/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_yeti_bang_gia/hit": { file: "sprites/boss_yeti_bang_gia/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_yeti_bang_gia/defeat": { file: "sprites/boss_yeti_bang_gia/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "bombs/bomb/idle": { file: "sprites/bombs/bomb/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bomb/flash": { file: "sprites/bombs/bomb/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_banh_kem/idle": { file: "sprites/bombs/bom_banh_kem/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_banh_kem/flash": { file: "sprites/bombs/bom_banh_kem/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_hon_ma/idle": { file: "sprites/bombs/bom_hon_ma/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_hon_ma/flash": { file: "sprites/bombs/bom_hon_ma/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_loi_sang/idle": { file: "sprites/bombs/bom_loi_sang/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_loi_sang/flash": { file: "sprites/bombs/bom_loi_sang/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_mach_dien/idle": { file: "sprites/bombs/bom_mach_dien/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_mach_dien/flash": { file: "sprites/bombs/bom_mach_dien/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_magma/idle": { file: "sprites/bombs/bom_magma/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_magma/flash": { file: "sprites/bombs/bom_magma/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_meo/idle": { file: "sprites/bombs/bom_meo/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_meo/flash": { file: "sprites/bombs/bom_meo/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_nam/idle": { file: "sprites/bombs/bom_nam/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_nam/flash": { file: "sprites/bombs/bom_nam/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_ngoc_co/idle": { file: "sprites/bombs/bom_ngoc_co/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_ngoc_co/flash": { file: "sprites/bombs/bom_ngoc_co/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_ngoi_sao/idle": { file: "sprites/bombs/bom_ngoi_sao/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_ngoi_sao/flash": { file: "sprites/bombs/bom_ngoi_sao/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_pha_le/idle": { file: "sprites/bombs/bom_pha_le/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_pha_le/flash": { file: "sprites/bombs/bom_pha_le/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_qua_cam/idle": { file: "sprites/bombs/bom_qua_cam/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_qua_cam/flash": { file: "sprites/bombs/bom_qua_cam/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_thung_rum/idle": { file: "sprites/bombs/bom_thung_rum/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_thung_rum/flash": { file: "sprites/bombs/bom_thung_rum/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_trai_reu/idle": { file: "sprites/bombs/bom_trai_reu/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_trai_reu/flash": { file: "sprites/bombs/bom_trai_reu/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "bombs/bom_tuyet/idle": { file: "sprites/bombs/bom_tuyet/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "bombs/bom_tuyet/flash": { file: "sprites/bombs/bom_tuyet/flash.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "tiles_anim/ch1_gate/locked_shake": { file: "sprites/tiles_anim/ch1_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch1_gate/unlock": { file: "sprites/tiles_anim/ch1_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch1_gate/open_idle": { file: "sprites/tiles_anim/ch1_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch1_soft_block/break": { file: "sprites/tiles_anim/ch1_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch2_gate/locked_shake": { file: "sprites/tiles_anim/ch2_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch2_gate/unlock": { file: "sprites/tiles_anim/ch2_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch2_gate/open_idle": { file: "sprites/tiles_anim/ch2_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch2_soft_block/break": { file: "sprites/tiles_anim/ch2_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch3_gate/locked_shake": { file: "sprites/tiles_anim/ch3_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch3_gate/unlock": { file: "sprites/tiles_anim/ch3_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch3_gate/open_idle": { file: "sprites/tiles_anim/ch3_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch3_soft_block/break": { file: "sprites/tiles_anim/ch3_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch4_gate/locked_shake": { file: "sprites/tiles_anim/ch4_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch4_gate/unlock": { file: "sprites/tiles_anim/ch4_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch4_gate/open_idle": { file: "sprites/tiles_anim/ch4_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch4_soft_block/break": { file: "sprites/tiles_anim/ch4_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch5_gate/locked_shake": { file: "sprites/tiles_anim/ch5_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch5_gate/unlock": { file: "sprites/tiles_anim/ch5_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch5_gate/open_idle": { file: "sprites/tiles_anim/ch5_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch5_soft_block/break": { file: "sprites/tiles_anim/ch5_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch6_gate/locked_shake": { file: "sprites/tiles_anim/ch6_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch6_gate/unlock": { file: "sprites/tiles_anim/ch6_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch6_gate/open_idle": { file: "sprites/tiles_anim/ch6_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch6_soft_block/break": { file: "sprites/tiles_anim/ch6_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch7_gate/locked_shake": { file: "sprites/tiles_anim/ch7_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch7_gate/unlock": { file: "sprites/tiles_anim/ch7_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch7_gate/open_idle": { file: "sprites/tiles_anim/ch7_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch7_soft_block/break": { file: "sprites/tiles_anim/ch7_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch8_gate/locked_shake": { file: "sprites/tiles_anim/ch8_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch8_gate/unlock": { file: "sprites/tiles_anim/ch8_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch8_gate/open_idle": { file: "sprites/tiles_anim/ch8_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch8_soft_block/break": { file: "sprites/tiles_anim/ch8_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch9_gate/locked_shake": { file: "sprites/tiles_anim/ch9_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch9_gate/unlock": { file: "sprites/tiles_anim/ch9_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch9_gate/open_idle": { file: "sprites/tiles_anim/ch9_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch9_soft_block/break": { file: "sprites/tiles_anim/ch9_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch10_gate/locked_shake": { file: "sprites/tiles_anim/ch10_gate/locked_shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "tiles_anim/ch10_gate/unlock": { file: "sprites/tiles_anim/ch10_gate/unlock.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "tiles_anim/ch10_gate/open_idle": { file: "sprites/tiles_anim/ch10_gate/open_idle.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "tiles_anim/ch10_soft_block/break": { file: "sprites/tiles_anim/ch10_soft_block/break.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "tiles_anim/ch1_bush/rustle": { file: "sprites/tiles_anim/ch1_bush/rustle.png", w: 48, h: 48, frames: 4, fps: 10, loop: false, offset: [] }, "pip_bare/idle_down": { file: "sprites/pip_bare/idle_down.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_bare/idle_up": { file: "sprites/pip_bare/idle_up.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_bare/idle_left": { file: "sprites/pip_bare/idle_left.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_bare/idle_right": { file: "sprites/pip_bare/idle_right.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_bare/run_down": { file: "sprites/pip_bare/run_down.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_bare/run_up": { file: "sprites/pip_bare/run_up.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_bare/run_left": { file: "sprites/pip_bare/run_left.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_bare/run_right": { file: "sprites/pip_bare/run_right.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_bare/bomb_place_down": { file: "sprites/pip_bare/bomb_place_down.png", w: 80, h: 88, frames: 4, fps: 10, loop: false, offset: [[16, 17], [16, 14], [16, 15], [16, 14]] }, "pip_bare/hurt_down": { file: "sprites/pip_bare/hurt_down.png", w: 80, h: 88, frames: 3, fps: 10, loop: false, offset: [[14, 13], [18, 13], [15, 13]] }, "pip_bare/win_down": { file: "sprites/pip_bare/win_down.png", w: 80, h: 88, frames: 6, fps: 10, loop: false, offset: [[16, 14], [16, 8], [16, 2], [16, 0], [16, 6], [16, 14]] }, "pip_bare/spawn_down": { file: "sprites/pip_bare/spawn_down.png", w: 80, h: 88, frames: 5, fps: 10, loop: false, offset: [[16, 14], [16, 14], [16, 14], [16, 14], [16, 14]] }, "pip_bare/die_down": { file: "sprites/pip_bare/die_down.png", w: 80, h: 88, frames: 8, fps: 8, loop: false, offset: [[16, 14], [16, 14], [16, 14], [16, 14], [16, 14], [16, 14], [16, 14], [16, 14]] }, "boss_vua_ri_set/idle_p1": { file: "sprites/boss_vua_ri_set/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_vua_ri_set/idle_p2": { file: "sprites/boss_vua_ri_set/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_vua_ri_set/idle_p3": { file: "sprites/boss_vua_ri_set/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_vua_ri_set/weak_idle": { file: "sprites/boss_vua_ri_set/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_vua_ri_set/hit": { file: "sprites/boss_vua_ri_set/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_vua_ri_set/defeat": { file: "sprites/boss_vua_ri_set/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "pets_bum/pet_bum_mini/idle": { file: "sprites/pets_bum/pet_bum_mini/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_bum_mini/hop": { file: "sprites/pets_bum/pet_bum_mini/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_canh_cut/idle": { file: "sprites/pets_bum/pet_canh_cut/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_canh_cut/hop": { file: "sprites/pets_bum/pet_canh_cut/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_chuot_chui/idle": { file: "sprites/pets_bum/pet_chuot_chui/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_chuot_chui/hop": { file: "sprites/pets_bum/pet_chuot_chui/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_gizmo_mini/idle": { file: "sprites/pets_bum/pet_gizmo_mini/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_gizmo_mini/hop": { file: "sprites/pets_bum/pet_gizmo_mini/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_ma_nho/idle": { file: "sprites/pets_bum/pet_ma_nho/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_ma_nho/hop": { file: "sprites/pets_bum/pet_ma_nho/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_meo_cat/idle": { file: "sprites/pets_bum/pet_meo_cat/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_meo_cat/hop": { file: "sprites/pets_bum/pet_meo_cat/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_mimi/idle": { file: "sprites/pets_bum/pet_mimi/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_mimi/hop": { file: "sprites/pets_bum/pet_mimi/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_rong_lua/idle": { file: "sprites/pets_bum/pet_rong_lua/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_rong_lua/hop": { file: "sprites/pets_bum/pet_rong_lua/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_slime_reu/idle": { file: "sprites/pets_bum/pet_slime_reu/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_slime_reu/hop": { file: "sprites/pets_bum/pet_slime_reu/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/pet_vet_bien/idle": { file: "sprites/pets_bum/pet_vet_bien/idle.png", w: 40, h: 40, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/pet_vet_bien/hop": { file: "sprites/pets_bum/pet_vet_bien/hop.png", w: 40, h: 40, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/bum/idle": { file: "sprites/pets_bum/bum/idle.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "pets_bum/bum/jump": { file: "sprites/pets_bum/bum/jump.png", w: 48, h: 48, frames: 6, fps: 10, loop: false, offset: [] }, "pets_bum/bum/scared": { file: "sprites/pets_bum/bum/scared.png", w: 48, h: 48, frames: 4, fps: 12, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat/idle_p1": { file: "sprites/boss_thuyen_truong_hac_sat/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat/idle_p2": { file: "sprites/boss_thuyen_truong_hac_sat/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat/idle_p3": { file: "sprites/boss_thuyen_truong_hac_sat/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat/weak_idle": { file: "sprites/boss_thuyen_truong_hac_sat/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat/hit": { file: "sprites/boss_thuyen_truong_hac_sat/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_thuyen_truong_hac_sat/defeat": { file: "sprites/boss_thuyen_truong_hac_sat/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "boss_nu_hoang_bao_tu/idle_p1": { file: "sprites/boss_nu_hoang_bao_tu/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_nu_hoang_bao_tu/idle_p2": { file: "sprites/boss_nu_hoang_bao_tu/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_nu_hoang_bao_tu/idle_p3": { file: "sprites/boss_nu_hoang_bao_tu/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_nu_hoang_bao_tu/weak_idle": { file: "sprites/boss_nu_hoang_bao_tu/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_nu_hoang_bao_tu/hit": { file: "sprites/boss_nu_hoang_bao_tu/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_nu_hoang_bao_tu/defeat": { file: "sprites/boss_nu_hoang_bao_tu/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "boss_hiep_si_bong_dem/idle_p1": { file: "sprites/boss_hiep_si_bong_dem/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_hiep_si_bong_dem/idle_p2": { file: "sprites/boss_hiep_si_bong_dem/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_hiep_si_bong_dem/idle_p3": { file: "sprites/boss_hiep_si_bong_dem/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_hiep_si_bong_dem/weak_idle": { file: "sprites/boss_hiep_si_bong_dem/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_hiep_si_bong_dem/hit": { file: "sprites/boss_hiep_si_bong_dem/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_hiep_si_bong_dem/defeat": { file: "sprites/boss_hiep_si_bong_dem/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "boss_gau_ri_set/idle_p1": { file: "sprites/boss_gau_ri_set/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_gau_ri_set/idle_p2": { file: "sprites/boss_gau_ri_set/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_gau_ri_set/idle_p3": { file: "sprites/boss_gau_ri_set/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_gau_ri_set/weak_idle": { file: "sprites/boss_gau_ri_set/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_gau_ri_set/hit": { file: "sprites/boss_gau_ri_set/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_gau_ri_set/defeat": { file: "sprites/boss_gau_ri_set/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "boss_pharaoh_cat/idle_p1": { file: "sprites/boss_pharaoh_cat/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_pharaoh_cat/idle_p2": { file: "sprites/boss_pharaoh_cat/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_pharaoh_cat/idle_p3": { file: "sprites/boss_pharaoh_cat/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_pharaoh_cat/weak_idle": { file: "sprites/boss_pharaoh_cat/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_pharaoh_cat/hit": { file: "sprites/boss_pharaoh_cat/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_pharaoh_cat/defeat": { file: "sprites/boss_pharaoh_cat/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "pip_default/idle_down": { file: "sprites/pip_default/idle_down.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_default/idle_up": { file: "sprites/pip_default/idle_up.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_default/idle_left": { file: "sprites/pip_default/idle_left.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_default/idle_right": { file: "sprites/pip_default/idle_right.png", w: 48, h: 64, frames: 4, fps: 6, loop: true, offset: [[0, 0], [0, 0], [0, 1], [0, 0]] }, "pip_default/run_down": { file: "sprites/pip_default/run_down.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_default/run_up": { file: "sprites/pip_default/run_up.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_default/run_left": { file: "sprites/pip_default/run_left.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_default/run_right": { file: "sprites/pip_default/run_right.png", w: 48, h: 64, frames: 6, fps: 12, loop: true, offset: [[0, 0], [0, -2], [0, -2], [0, 0], [0, -2], [0, -2]] }, "pip_default/bomb_place_down": { file: "sprites/pip_default/bomb_place_down.png", w: 80, h: 88, frames: 4, fps: 10, loop: false, offset: [[16, 17], [16, 14], [16, 15], [16, 14]] }, "pip_default/hurt_down": { file: "sprites/pip_default/hurt_down.png", w: 80, h: 88, frames: 3, fps: 10, loop: false, offset: [[14, 13], [18, 13], [15, 13]] }, "pip_default/win_down": { file: "sprites/pip_default/win_down.png", w: 80, h: 88, frames: 6, fps: 10, loop: false, offset: [[16, 14], [16, 8], [16, 2], [16, 0], [16, 6], [16, 14]] }, "pip_default/spawn_down": { file: "sprites/pip_default/spawn_down.png", w: 80, h: 88, frames: 5, fps: 10, loop: false, offset: [[16, 14], [16, 14], [16, 14], [16, 14], [16, 14]] }, "pip_default/die_down": { file: "sprites/pip_default/die_down.png", w: 80, h: 88, frames: 8, fps: 8, loop: false, offset: [[16, 14], [16, 14], [16, 14], [16, 14], [16, 14], [16, 14], [16, 14], [16, 14]] }, "ui_anim/node_ring_current/pulse": { file: "sprites/ui_anim/node_ring_current/pulse.png", w: 56, h: 56, frames: 4, fps: 8, loop: true, offset: [] }, "ui_anim/star/pop": { file: "sprites/ui_anim/star/pop.png", w: 32, h: 32, frames: 6, fps: 12, loop: false, offset: [] }, "ui_anim/heart/break": { file: "sprites/ui_anim/heart/break.png", w: 48, h: 48, frames: 5, fps: 10, loop: false, offset: [] }, "ui_anim/coin/spin": { file: "sprites/ui_anim/coin/spin.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "ui_anim/badge_new/bounce": { file: "sprites/ui_anim/badge_new/bounce.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "ui_anim/gift/shake": { file: "sprites/ui_anim/gift/shake.png", w: 48, h: 48, frames: 4, fps: 10, loop: true, offset: [] }, "ui_anim/lock/shake": { file: "sprites/ui_anim/lock/shake.png", w: 48, h: 48, frames: 4, fps: 12, loop: false, offset: [] }, "ui_anim/core_orb/pulse": { file: "sprites/ui_anim/core_orb/pulse.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "ui_anim/btn_bomb/press": { file: "sprites/ui_anim/btn_bomb/press.png", w: 112, h: 112, frames: 3, fps: 20, loop: false, offset: [] }, "ui_anim/gem_ngoc/bob": { file: "sprites/ui_anim/gem_ngoc/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "ui_anim/shard_sao/bob": { file: "sprites/ui_anim/shard_sao/bob.png", w: 48, h: 48, frames: 6, fps: 6, loop: true, offset: [] }, "fx/explosion_center": { file: "sprites/fx/explosion_center.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/explosion_arm_h": { file: "sprites/fx/explosion_arm_h.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/explosion_end_right": { file: "sprites/fx/explosion_end_right.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/fuse_spark": { file: "sprites/fx/fuse_spark.png", w: 32, h: 32, frames: 4, fps: 12, loop: true, offset: [] }, "fx/hit_flash": { file: "sprites/fx/hit_flash.png", w: 48, h: 48, frames: 4, fps: 16, loop: false, offset: [] }, "fx/enemy_death_puff": { file: "sprites/fx/enemy_death_puff.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/pickup_sparkle": { file: "sprites/fx/pickup_sparkle.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/shield_bubble": { file: "sprites/fx/shield_bubble.png", w: 56, h: 64, frames: 4, fps: 8, loop: true, offset: [] }, "fx/dust_puff": { file: "sprites/fx/dust_puff.png", w: 32, h: 32, frames: 5, fps: 14, loop: false, offset: [] }, "fx/curse_aura": { file: "sprites/fx/curse_aura.png", w: 56, h: 56, frames: 4, fps: 8, loop: true, offset: [] }, "fx/gate_glow": { file: "sprites/fx/gate_glow.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "fx/spawn_ring": { file: "sprites/fx/spawn_ring.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/revive_burst": { file: "sprites/fx/revive_burst.png", w: 64, h: 64, frames: 6, fps: 12, loop: false, offset: [] }, "fx/star_burst_win": { file: "sprites/fx/star_burst_win.png", w: 96, h: 96, frames: 8, fps: 14, loop: false, offset: [] }, "fx/ch2_spore_cloud": { file: "sprites/fx/ch2_spore_cloud.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "fx/danger_tile": { file: "sprites/fx/danger_tile.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "fx/ch3_falling_shadow": { file: "sprites/fx/ch3_falling_shadow.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "fx/ch3_rock_impact": { file: "sprites/fx/ch3_rock_impact.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/ch3_minecart": { file: "sprites/fx/ch3_minecart.png", w: 48, h: 48, frames: 4, fps: 10, loop: true, offset: [] }, "fx/ch3_dirt_burst": { file: "sprites/fx/ch3_dirt_burst.png", w: 64, h: 64, frames: 6, fps: 14, loop: false, offset: [] }, "fx/ch4_wind_gust": { file: "sprites/fx/ch4_wind_gust.png", w: 48, h: 48, frames: 6, fps: 12, loop: true, offset: [] }, "fx/ch4_quicksand": { file: "sprites/fx/ch4_quicksand.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "fx/ch4_spike_trap": { file: "sprites/fx/ch4_spike_trap.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "fx/ch5_cannon_fire": { file: "sprites/fx/ch5_cannon_fire.png", w: 64, h: 48, frames: 5, fps: 14, loop: false, offset: [] }, "fx/ch5_cannonball_fly": { file: "sprites/fx/ch5_cannonball_fly.png", w: 32, h: 32, frames: 4, fps: 12, loop: true, offset: [] }, "fx/ch5_water_ripple": { file: "sprites/fx/ch5_water_ripple.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "fx/ch5_tide_wave": { file: "sprites/fx/ch5_tide_wave.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "fx/ch6_snowfall": { file: "sprites/fx/ch6_snowfall.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "fx/ch6_ice_shatter": { file: "sprites/fx/ch6_ice_shatter.png", w: 48, h: 48, frames: 6, fps: 14, loop: false, offset: [] }, "fx/ch6_freeze_overlay": { file: "sprites/fx/ch6_freeze_overlay.png", w: 48, h: 48, frames: 3, fps: 5, loop: true, offset: [] }, "fx/ch7_conveyor": { file: "sprites/fx/ch7_conveyor.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "fx/ch7_teleport_swirl": { file: "sprites/fx/ch7_teleport_swirl.png", w: 48, h: 48, frames: 6, fps: 12, loop: true, offset: [] }, "fx/ch7_laser_beam": { file: "sprites/fx/ch7_laser_beam.png", w: 48, h: 48, frames: 3, fps: 12, loop: true, offset: [] }, "fx/ch8_lava_shimmer": { file: "sprites/fx/ch8_lava_shimmer.png", w: 48, h: 48, frames: 4, fps: 6, loop: true, offset: [] }, "fx/ch8_lava_bubble": { file: "sprites/fx/ch8_lava_bubble.png", w: 48, h: 48, frames: 5, fps: 8, loop: false, offset: [] }, "fx/ch8_meteor_fall": { file: "sprites/fx/ch8_meteor_fall.png", w: 48, h: 64, frames: 5, fps: 12, loop: false, offset: [] }, "fx/fire_ground": { file: "sprites/fx/fire_ground.png", w: 48, h: 48, frames: 4, fps: 10, loop: true, offset: [] }, "fx/ch9_lantern_glow": { file: "sprites/fx/ch9_lantern_glow.png", w: 96, h: 96, frames: 3, fps: 6, loop: true, offset: [] }, "fx/bomb_blackhole": { file: "sprites/fx/bomb_blackhole.png", w: 64, h: 64, frames: 6, fps: 12, loop: true, offset: [] }, "fx/ch10_light_beam": { file: "sprites/fx/ch10_light_beam.png", w: 96, h: 96, frames: 6, fps: 12, loop: false, offset: [] }, "fx/boss_hit": { file: "sprites/fx/boss_hit.png", w: 48, h: 48, frames: 4, fps: 16, loop: false, offset: [] }, "boss_rong_dung_nham/idle_p1": { file: "sprites/boss_rong_dung_nham/idle_p1.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_rong_dung_nham/idle_p2": { file: "sprites/boss_rong_dung_nham/idle_p2.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_rong_dung_nham/idle_p3": { file: "sprites/boss_rong_dung_nham/idle_p3.png", w: 160, h: 176, frames: 4, fps: 8, loop: true, offset: [] }, "boss_rong_dung_nham/weak_idle": { file: "sprites/boss_rong_dung_nham/weak_idle.png", w: 160, h: 176, frames: 4, fps: 6, loop: true, offset: [] }, "boss_rong_dung_nham/hit": { file: "sprites/boss_rong_dung_nham/hit.png", w: 160, h: 176, frames: 3, fps: 12, loop: false, offset: [] }, "boss_rong_dung_nham/defeat": { file: "sprites/boss_rong_dung_nham/defeat.png", w: 160, h: 176, frames: 8, fps: 8, loop: false, offset: [] }, "boss_pharaoh_cat_actions/walk_down": { file: "sprites/boss_pharaoh_cat_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_pharaoh_cat_actions/walk_up": { file: "sprites/boss_pharaoh_cat_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_pharaoh_cat_actions/walk_left": { file: "sprites/boss_pharaoh_cat_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_pharaoh_cat_actions/walk_right": { file: "sprites/boss_pharaoh_cat_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_pharaoh_cat_actions/sandstorm_cast": { file: "sprites/boss_pharaoh_cat_actions/sandstorm_cast.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_pharaoh_cat_actions/summon_mummies": { file: "sprites/boss_pharaoh_cat_actions/summon_mummies.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_pharaoh_cat_actions/tornado_form": { file: "sprites/boss_pharaoh_cat_actions/tornado_form.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_pharaoh_cat_actions/mask_flash": { file: "sprites/boss_pharaoh_cat_actions/mask_flash.png", w: 256, h: 208, frames: 4, fps: 10, loop: true, offset: [] }, "boss_pharaoh_cat_actions/hover": { file: "sprites/boss_pharaoh_cat_actions/hover.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat_actions/walk_down": { file: "sprites/boss_thuyen_truong_hac_sat_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat_actions/walk_up": { file: "sprites/boss_thuyen_truong_hac_sat_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat_actions/walk_left": { file: "sprites/boss_thuyen_truong_hac_sat_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat_actions/walk_right": { file: "sprites/boss_thuyen_truong_hac_sat_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_thuyen_truong_hac_sat_actions/cannon_fire": { file: "sprites/boss_thuyen_truong_hac_sat_actions/cannon_fire.png", w: 256, h: 208, frames: 6, fps: 12, loop: false, offset: [] }, "boss_thuyen_truong_hac_sat_actions/hook_pull": { file: "sprites/boss_thuyen_truong_hac_sat_actions/hook_pull.png", w: 256, h: 208, frames: 5, fps: 10, loop: false, offset: [] }, "boss_thuyen_truong_hac_sat_actions/anchor_sweep": { file: "sprites/boss_thuyen_truong_hac_sat_actions/anchor_sweep.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_thuyen_truong_hac_sat_actions/tide_raise": { file: "sprites/boss_thuyen_truong_hac_sat_actions/tide_raise.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_gau_ri_set_actions/walk_down": { file: "sprites/boss_gau_ri_set_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_gau_ri_set_actions/walk_up": { file: "sprites/boss_gau_ri_set_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_gau_ri_set_actions/walk_left": { file: "sprites/boss_gau_ri_set_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_gau_ri_set_actions/walk_right": { file: "sprites/boss_gau_ri_set_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_gau_ri_set_actions/slam": { file: "sprites/boss_gau_ri_set_actions/slam.png", w: 256, h: 208, frames: 6, fps: 12, loop: false, offset: [] }, "boss_gau_ri_set_actions/charge_windup": { file: "sprites/boss_gau_ri_set_actions/charge_windup.png", w: 256, h: 208, frames: 4, fps: 10, loop: false, offset: [] }, "boss_gau_ri_set_actions/charge_down": { file: "sprites/boss_gau_ri_set_actions/charge_down.png", w: 256, h: 208, frames: 4, fps: 14, loop: true, offset: [] }, "boss_gau_ri_set_actions/charge_left": { file: "sprites/boss_gau_ri_set_actions/charge_left.png", w: 256, h: 208, frames: 4, fps: 14, loop: true, offset: [] }, "boss_gau_ri_set_actions/charge_right": { file: "sprites/boss_gau_ri_set_actions/charge_right.png", w: 256, h: 208, frames: 4, fps: 14, loop: true, offset: [] }, "boss_gau_ri_set_actions/mine_drop": { file: "sprites/boss_gau_ri_set_actions/mine_drop.png", w: 256, h: 208, frames: 5, fps: 10, loop: false, offset: [] }, "boss_gau_ri_set_actions/summon": { file: "sprites/boss_gau_ri_set_actions/summon.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_gau_ri_set_actions/enrage": { file: "sprites/boss_gau_ri_set_actions/enrage.png", w: 256, h: 208, frames: 6, fps: 12, loop: false, offset: [] }, "boss_hiep_si_bong_dem_actions/walk_down": { file: "sprites/boss_hiep_si_bong_dem_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_hiep_si_bong_dem_actions/walk_up": { file: "sprites/boss_hiep_si_bong_dem_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_hiep_si_bong_dem_actions/walk_left": { file: "sprites/boss_hiep_si_bong_dem_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_hiep_si_bong_dem_actions/walk_right": { file: "sprites/boss_hiep_si_bong_dem_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_hiep_si_bong_dem_actions/slash_wave": { file: "sprites/boss_hiep_si_bong_dem_actions/slash_wave.png", w: 256, h: 208, frames: 6, fps: 12, loop: false, offset: [] }, "boss_hiep_si_bong_dem_actions/shadow_teleport": { file: "sprites/boss_hiep_si_bong_dem_actions/shadow_teleport.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_hiep_si_bong_dem_actions/clone_split": { file: "sprites/boss_hiep_si_bong_dem_actions/clone_split.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_hiep_si_bong_dem_actions/merge": { file: "sprites/boss_hiep_si_bong_dem_actions/merge.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_hiep_si_bong_dem_actions/aura_pulse": { file: "sprites/boss_hiep_si_bong_dem_actions/aura_pulse.png", w: 256, h: 208, frames: 4, fps: 8, loop: true, offset: [] }, "boss_sau_khoan_actions/walk_down": { file: "sprites/boss_sau_khoan_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_sau_khoan_actions/walk_up": { file: "sprites/boss_sau_khoan_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_sau_khoan_actions/walk_left": { file: "sprites/boss_sau_khoan_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_sau_khoan_actions/walk_right": { file: "sprites/boss_sau_khoan_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_sau_khoan_actions/dig_down": { file: "sprites/boss_sau_khoan_actions/dig_down.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_sau_khoan_actions/rumble": { file: "sprites/boss_sau_khoan_actions/rumble.png", w: 256, h: 208, frames: 4, fps: 8, loop: true, offset: [] }, "boss_sau_khoan_actions/emerge": { file: "sprites/boss_sau_khoan_actions/emerge.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_sau_khoan_actions/drill_spin": { file: "sprites/boss_sau_khoan_actions/drill_spin.png", w: 256, h: 208, frames: 4, fps: 12, loop: true, offset: [] }, "boss_sau_khoan_actions/rock_drop_cast": { file: "sprites/boss_sau_khoan_actions/rock_drop_cast.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_sau_khoan_actions/charge_through": { file: "sprites/boss_sau_khoan_actions/charge_through.png", w: 256, h: 208, frames: 5, fps: 14, loop: false, offset: [] }, "boss_robot_mk7_actions/walk_down": { file: "sprites/boss_robot_mk7_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_robot_mk7_actions/walk_up": { file: "sprites/boss_robot_mk7_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_robot_mk7_actions/walk_left": { file: "sprites/boss_robot_mk7_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_robot_mk7_actions/walk_right": { file: "sprites/boss_robot_mk7_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_robot_mk7_actions/missile_volley": { file: "sprites/boss_robot_mk7_actions/missile_volley.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_robot_mk7_actions/arm_clamp": { file: "sprites/boss_robot_mk7_actions/arm_clamp.png", w: 256, h: 208, frames: 5, fps: 10, loop: false, offset: [] }, "boss_robot_mk7_actions/conveyor_reverse": { file: "sprites/boss_robot_mk7_actions/conveyor_reverse.png", w: 256, h: 208, frames: 4, fps: 8, loop: true, offset: [] }, "boss_robot_mk7_actions/self_destruct": { file: "sprites/boss_robot_mk7_actions/self_destruct.png", w: 256, h: 208, frames: 8, fps: 10, loop: false, offset: [] }, "boss_yeti_bang_gia_actions/walk_down": { file: "sprites/boss_yeti_bang_gia_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_yeti_bang_gia_actions/walk_up": { file: "sprites/boss_yeti_bang_gia_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_yeti_bang_gia_actions/walk_left": { file: "sprites/boss_yeti_bang_gia_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_yeti_bang_gia_actions/walk_right": { file: "sprites/boss_yeti_bang_gia_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_yeti_bang_gia_actions/ground_pound": { file: "sprites/boss_yeti_bang_gia_actions/ground_pound.png", w: 256, h: 208, frames: 6, fps: 12, loop: false, offset: [] }, "boss_yeti_bang_gia_actions/snowball_throw": { file: "sprites/boss_yeti_bang_gia_actions/snowball_throw.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_yeti_bang_gia_actions/blizzard_cast": { file: "sprites/boss_yeti_bang_gia_actions/blizzard_cast.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_yeti_bang_gia_actions/freeze_floor": { file: "sprites/boss_yeti_bang_gia_actions/freeze_floor.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_vua_ri_set_actions/walk_down": { file: "sprites/boss_vua_ri_set_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_vua_ri_set_actions/walk_up": { file: "sprites/boss_vua_ri_set_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_vua_ri_set_actions/walk_left": { file: "sprites/boss_vua_ri_set_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_vua_ri_set_actions/walk_right": { file: "sprites/boss_vua_ri_set_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_vua_ri_set_actions/bomb_throw": { file: "sprites/boss_vua_ri_set_actions/bomb_throw.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_vua_ri_set_actions/arm_sweep": { file: "sprites/boss_vua_ri_set_actions/arm_sweep.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_vua_ri_set_actions/summon_memories": { file: "sprites/boss_vua_ri_set_actions/summon_memories.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_vua_ri_set_actions/core_open": { file: "sprites/boss_vua_ri_set_actions/core_open.png", w: 256, h: 208, frames: 5, fps: 10, loop: false, offset: [] }, "boss_vua_ri_set_actions/light_burst_hit": { file: "sprites/boss_vua_ri_set_actions/light_burst_hit.png", w: 256, h: 208, frames: 6, fps: 12, loop: false, offset: [] }, "boss_vua_ri_set_actions/stomp": { file: "sprites/boss_vua_ri_set_actions/stomp.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_rong_dung_nham_actions/walk_down": { file: "sprites/boss_rong_dung_nham_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_rong_dung_nham_actions/walk_up": { file: "sprites/boss_rong_dung_nham_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_rong_dung_nham_actions/walk_left": { file: "sprites/boss_rong_dung_nham_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_rong_dung_nham_actions/walk_right": { file: "sprites/boss_rong_dung_nham_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_rong_dung_nham_actions/fire_breath": { file: "sprites/boss_rong_dung_nham_actions/fire_breath.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_rong_dung_nham_actions/tail_sweep": { file: "sprites/boss_rong_dung_nham_actions/tail_sweep.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_rong_dung_nham_actions/fly_up": { file: "sprites/boss_rong_dung_nham_actions/fly_up.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_rong_dung_nham_actions/fly_hover": { file: "sprites/boss_rong_dung_nham_actions/fly_hover.png", w: 256, h: 208, frames: 4, fps: 10, loop: true, offset: [] }, "boss_rong_dung_nham_actions/lava_drop": { file: "sprites/boss_rong_dung_nham_actions/lava_drop.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_rong_dung_nham_actions/land": { file: "sprites/boss_rong_dung_nham_actions/land.png", w: 256, h: 208, frames: 5, fps: 12, loop: false, offset: [] }, "enemies_4dir/enemy_slime_rust/walk_down": { file: "sprites/enemies_4dir/enemy_slime_rust/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_slime_rust/walk_up": { file: "sprites/enemies_4dir/enemy_slime_rust/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_slime_rust/walk_left": { file: "sprites/enemies_4dir/enemy_slime_rust/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_slime_rust/walk_right": { file: "sprites/enemies_4dir/enemy_slime_rust/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_rat_machine/walk_down": { file: "sprites/enemies_4dir/enemy_rat_machine/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_rat_machine/walk_up": { file: "sprites/enemies_4dir/enemy_rat_machine/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_rat_machine/walk_left": { file: "sprites/enemies_4dir/enemy_rat_machine/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_rat_machine/walk_right": { file: "sprites/enemies_4dir/enemy_rat_machine/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_nam_lun/walk_down": { file: "sprites/enemies_4dir/enemy_nam_lun/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_nam_lun/walk_up": { file: "sprites/enemies_4dir/enemy_nam_lun/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_nam_lun/walk_left": { file: "sprites/enemies_4dir/enemy_nam_lun/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_nam_lun/walk_right": { file: "sprites/enemies_4dir/enemy_nam_lun/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_buom_bao_tu/walk_down": { file: "sprites/enemies_4dir/enemy_buom_bao_tu/walk_down.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_buom_bao_tu/walk_up": { file: "sprites/enemies_4dir/enemy_buom_bao_tu/walk_up.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_buom_bao_tu/walk_left": { file: "sprites/enemies_4dir/enemy_buom_bao_tu/walk_left.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_buom_bao_tu/walk_right": { file: "sprites/enemies_4dir/enemy_buom_bao_tu/walk_right.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_doi_hang/walk_down": { file: "sprites/enemies_4dir/enemy_doi_hang/walk_down.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_doi_hang/walk_up": { file: "sprites/enemies_4dir/enemy_doi_hang/walk_up.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_doi_hang/walk_left": { file: "sprites/enemies_4dir/enemy_doi_hang/walk_left.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_doi_hang/walk_right": { file: "sprites/enemies_4dir/enemy_doi_hang/walk_right.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_golem_da/walk_down": { file: "sprites/enemies_4dir/enemy_golem_da/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_golem_da/walk_up": { file: "sprites/enemies_4dir/enemy_golem_da/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_golem_da/walk_left": { file: "sprites/enemies_4dir/enemy_golem_da/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_golem_da/walk_right": { file: "sprites/enemies_4dir/enemy_golem_da/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_xac_uop/walk_down": { file: "sprites/enemies_4dir/enemy_xac_uop/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_xac_uop/walk_up": { file: "sprites/enemies_4dir/enemy_xac_uop/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_xac_uop/walk_left": { file: "sprites/enemies_4dir/enemy_xac_uop/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_xac_uop/walk_right": { file: "sprites/enemies_4dir/enemy_xac_uop/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_bo_cap/walk_down": { file: "sprites/enemies_4dir/enemy_bo_cap/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_bo_cap/walk_up": { file: "sprites/enemies_4dir/enemy_bo_cap/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_bo_cap/walk_left": { file: "sprites/enemies_4dir/enemy_bo_cap/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_bo_cap/walk_right": { file: "sprites/enemies_4dir/enemy_bo_cap/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_cua_giap/walk_down": { file: "sprites/enemies_4dir/enemy_cua_giap/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_cua_giap/walk_up": { file: "sprites/enemies_4dir/enemy_cua_giap/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_cua_giap/walk_left": { file: "sprites/enemies_4dir/enemy_cua_giap/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_cua_giap/walk_right": { file: "sprites/enemies_4dir/enemy_cua_giap/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_hai_au/walk_down": { file: "sprites/enemies_4dir/enemy_hai_au/walk_down.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_hai_au/walk_up": { file: "sprites/enemies_4dir/enemy_hai_au/walk_up.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_hai_au/walk_left": { file: "sprites/enemies_4dir/enemy_hai_au/walk_left.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_hai_au/walk_right": { file: "sprites/enemies_4dir/enemy_hai_au/walk_right.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_nguoi_tuyet/walk_down": { file: "sprites/enemies_4dir/enemy_nguoi_tuyet/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_nguoi_tuyet/walk_up": { file: "sprites/enemies_4dir/enemy_nguoi_tuyet/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_nguoi_tuyet/walk_left": { file: "sprites/enemies_4dir/enemy_nguoi_tuyet/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_nguoi_tuyet/walk_right": { file: "sprites/enemies_4dir/enemy_nguoi_tuyet/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_canh_cut/walk_down": { file: "sprites/enemies_4dir/enemy_canh_cut/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_canh_cut/walk_up": { file: "sprites/enemies_4dir/enemy_canh_cut/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_canh_cut/walk_left": { file: "sprites/enemies_4dir/enemy_canh_cut/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_canh_cut/walk_right": { file: "sprites/enemies_4dir/enemy_canh_cut/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra/walk_down": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra/walk_up": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra/walk_left": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra/walk_right": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_drone/walk_down": { file: "sprites/enemies_4dir/enemy_drone/walk_down.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_drone/walk_up": { file: "sprites/enemies_4dir/enemy_drone/walk_up.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_drone/walk_left": { file: "sprites/enemies_4dir/enemy_drone/walk_left.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_drone/walk_right": { file: "sprites/enemies_4dir/enemy_drone/walk_right.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_quy_lua/walk_down": { file: "sprites/enemies_4dir/enemy_quy_lua/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_quy_lua/walk_up": { file: "sprites/enemies_4dir/enemy_quy_lua/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_quy_lua/walk_left": { file: "sprites/enemies_4dir/enemy_quy_lua/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_quy_lua/walk_right": { file: "sprites/enemies_4dir/enemy_quy_lua/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_golem_magma/walk_down": { file: "sprites/enemies_4dir/enemy_golem_magma/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_golem_magma/walk_up": { file: "sprites/enemies_4dir/enemy_golem_magma/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_golem_magma/walk_left": { file: "sprites/enemies_4dir/enemy_golem_magma/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_golem_magma/walk_right": { file: "sprites/enemies_4dir/enemy_golem_magma/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_ma_mo/walk_down": { file: "sprites/enemies_4dir/enemy_ma_mo/walk_down.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_ma_mo/walk_up": { file: "sprites/enemies_4dir/enemy_ma_mo/walk_up.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_ma_mo/walk_left": { file: "sprites/enemies_4dir/enemy_ma_mo/walk_left.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_ma_mo/walk_right": { file: "sprites/enemies_4dir/enemy_ma_mo/walk_right.png", w: 48, h: 48, frames: 6, fps: 10, loop: true, offset: [] }, "enemies_4dir/enemy_bo_xuong/walk_down": { file: "sprites/enemies_4dir/enemy_bo_xuong/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_bo_xuong/walk_up": { file: "sprites/enemies_4dir/enemy_bo_xuong/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_bo_xuong/walk_left": { file: "sprites/enemies_4dir/enemy_bo_xuong/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_bo_xuong/walk_right": { file: "sprites/enemies_4dir/enemy_bo_xuong/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_ri_set_binh/walk_down": { file: "sprites/enemies_4dir/enemy_ri_set_binh/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_ri_set_binh/walk_up": { file: "sprites/enemies_4dir/enemy_ri_set_binh/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_ri_set_binh/walk_left": { file: "sprites/enemies_4dir/enemy_ri_set_binh/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_ri_set_binh/walk_right": { file: "sprites/enemies_4dir/enemy_ri_set_binh/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra_2/walk_down": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra_2/walk_down.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra_2/walk_up": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra_2/walk_up.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra_2/walk_left": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra_2/walk_left.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "enemies_4dir/enemy_robot_tuan_tra_2/walk_right": { file: "sprites/enemies_4dir/enemy_robot_tuan_tra_2/walk_right.png", w: 48, h: 48, frames: 4, fps: 8, loop: true, offset: [] }, "boss_nu_hoang_bao_tu_actions/walk_down": { file: "sprites/boss_nu_hoang_bao_tu_actions/walk_down.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_nu_hoang_bao_tu_actions/walk_up": { file: "sprites/boss_nu_hoang_bao_tu_actions/walk_up.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_nu_hoang_bao_tu_actions/walk_left": { file: "sprites/boss_nu_hoang_bao_tu_actions/walk_left.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_nu_hoang_bao_tu_actions/walk_right": { file: "sprites/boss_nu_hoang_bao_tu_actions/walk_right.png", w: 256, h: 208, frames: 6, fps: 8, loop: true, offset: [] }, "boss_nu_hoang_bao_tu_actions/spore_rain": { file: "sprites/boss_nu_hoang_bao_tu_actions/spore_rain.png", w: 256, h: 208, frames: 6, fps: 10, loop: true, offset: [] }, "boss_nu_hoang_bao_tu_actions/cap_lower": { file: "sprites/boss_nu_hoang_bao_tu_actions/cap_lower.png", w: 256, h: 208, frames: 5, fps: 10, loop: false, offset: [] }, "boss_nu_hoang_bao_tu_actions/summon_shrooms": { file: "sprites/boss_nu_hoang_bao_tu_actions/summon_shrooms.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] }, "boss_nu_hoang_bao_tu_actions/fog_burst": { file: "sprites/boss_nu_hoang_bao_tu_actions/fog_burst.png", w: 256, h: 208, frames: 6, fps: 10, loop: false, offset: [] } };
  var Bt = lg, Ar = tg, ve = (e) => typeof window < "u" && window.__BOOM_ASSETS__?.[e] || `/boom/${e}`, Be = (e) => Ar[e] || Ar["item_" + e] || Ar.info, Dt = (e, a) => Be(e === 1 ? a : `ch${e}_${a}`);
  installArt(Ar,ga);
  var Ln = class {
    constructor() {
      this.images = /* @__PURE__ */ new Map();
    }
    get(a) {
      let t = this.images.get(a);
      return t || (t = new Image(), t.src = ve(a), this.images.set(a, t)), t.complete && t.naturalWidth > 0 ? t : null;
    }
    image(a, t, l, o, s, i = s) {
      let n = this.get(t);
      n && a.drawImage(n, l, o, s, i);
    }
    sprite(a, t, l, o, s, i, n) {
      if(artSprite(this,a,t,l,o,s,i,n))return;
      let u = Bt[t];
      if (!u) return;
      let r = this.get(u.file);
      if (!r) return;
      let _ = u.loop ? Math.floor(Math.max(0, n) / 1e3 * u.fps) % u.frames : Math.min(u.frames - 1, Math.floor(Math.max(0, n) / 1e3 * u.fps));
      a.drawImage(r, _ * u.w, 0, u.w, u.h, l, o, s, i);
    }
    draw(a, t, l, o) {
      const shell=a.parentElement,area=shell?.parentElement;
      if(area){const ratio=t.level.width/t.level.height,w=Math.max(8,Math.min(area.clientWidth,(area.clientHeight-8)*ratio+8)),h=(w-8)/ratio+8;
        if(shell.style.width!==`${w}px`)shell.style.width=`${w}px`;
        if(shell.style.height!==`${h}px`)shell.style.height=`${h}px`;}

      let i = t.level.width * 48, n = t.level.height * 48, u = Math.min(2, devicePixelRatio || 1);
      (a.width !== i * u || a.height !== n * u) && (a.width = i * u, a.height = n * u);
      let r = a.getContext("2d");
      r.imageSmoothingEnabled=false;
      r.setTransform(u, 0, 0, u, 0, 0), r.clearRect(0, 0, i, n), r.save(), l.shake && t.fx.some((d) => d.kind === "explosion" && t.time - d.at < 180) && r.translate(Math.sin(t.time) * 1.5, Math.cos(t.time) * 1.5);
      for (let d = 0; d < t.level.height; d++) for (let y = 0; y < t.level.width; y++) {
        let S = t.cells[d * t.level.width + y];
        this.image(r, Dt(t.level.chapter, (y + d) % 2 ? "floor_a" : "floor_b"), y * 48, d * 48, 48), r.strokeStyle = "#20371d13", r.strokeRect(y * 48, d * 48, 48, 48);
        let M = { bush: "bush", bounce: "ch2_bounce_mushroom", rail: "ch3_rail_h", sand: "ch4_quicksand", spike: "ch4_spike_trap", water: "ch5_water", ice: "ch6_ice_floor", fire: "ch6_bonfire", conveyor: "ch7_conveyor", teleport: "ch7_teleport", lava: "ch8_lava", bridge: "ch8_stone_bridge", door: "ch9_magic_door" };
        if (S.terrain && (this.image(r, Be(M[S.terrain]), y * 48, d * 48, 48), S.terrain === "teleport" && (r.fillStyle = "#fff", r.font = "bold 14px system-ui", r.fillText(d < t.level.height / 2 ? "A" : "B", y * 48 + 4, d * 48 + 18))), S.wall !== "none") {
          let g = S.wall === "hard" ? Dt(t.level.chapter, "hard_block") : Dt(t.level.chapter, "soft_block");
          if (this.image(r, g, y * 48, d * 48, 48), S.wall === "cracked" && (r.strokeStyle = S.hp === 1 ? "#e0753c" : "#423e35", r.lineWidth = 3, r.beginPath(), r.moveTo(y * 48 + 8, d * 48 + 8), r.lineTo(y * 48 + 25, d * 48 + 26), r.lineTo(y * 48 + 14, d * 48 + 38), r.stroke()), S.wall === "ice" && (r.fillStyle = "#adddf299", r.fillRect(y * 48 + 3, d * 48 + 3, 42, 42), this.image(r, Be("item_bomb_ice"), y * 48 + 12, d * 48 + 10, 24)), S.wall === "barrel" && this.image(r, Be("bomb_0"), y * 48 + 8, d * 48 + 8, 32), S.wall === "cage") {
            this.image(r, Be("pip_idle_front"), y * 48 + 10, d * 48 + 4, 28, 38), r.strokeStyle = "#64472c", r.lineWidth = 3;
            for (let c = 1; c < 4; c++) r.beginPath(), r.moveTo(y * 48 + c * 12, d * 48 + 3), r.lineTo(y * 48 + c * 12, d * 48 + 45), r.stroke();
          }
          S.wall === "mirror" && (r.fillStyle = "#bfe4e3", r.fillRect(y * 48 + 6, d * 48 + 6, 36, 36), r.strokeStyle = "#a487c4", r.lineWidth = 4, r.beginPath(), r.moveTo(y * 48 + 8, d * 48 + 40), r.lineTo(y * 48 + 40, d * 48 + 8), r.stroke()), S.wall === "machine" && this.image(r, Be("ch10_core_socket"), y * 48 + 4, d * 48 + 4, 40), t.treasure && S.item && (r.fillStyle = "#fff3b5", r.beginPath(), r.arc(y * 48 + 38, d * 48 + 9, 6, 0, Math.PI * 2), r.fill(), r.strokeStyle = "#b57a32", r.lineWidth = 1, r.stroke());
        } else S.item && this.image(r, Be("item_" + S.item), y * 48 + 6, d * 48 + 4 + Math.sin(t.time / 240) * 2, 36);
        S.switch && (r.fillStyle = S.lit ? "#fff487" : "#46738d", r.beginPath(), r.arc(y * 48 + 24, d * 48 + 24, 16, 0, Math.PI * 2), r.fill(), r.fillStyle = S.lit ? "#795226" : "white", r.font = "bold 19px system-ui", r.textAlign = "center", r.fillText(S.switch.toString(), y * 48 + 24, d * 48 + 31));
      }
      if (t.gate.revealed && (this.image(r, Dt(t.level.chapter, t.level.goals.every((d) => t.goals[d.kind] >= d.target) ? "gate_open" : "gate_locked"), t.gate.x * 48, t.gate.y * 48, 48), this.sprite(r, "fx/gate_glow", t.gate.x * 48 - 8, t.gate.y * 48 - 8, 64, 64, t.time)), l.warning) {
        for (let d of t.bombs) if (d.at - t.time < 1200) for (let y of bn(t, d)) r.fillStyle = `rgba(245,102,53,${0.12 + 0.07 * Math.sin(t.time / 100)})`, r.fillRect(y.x * 48 + 3, y.y * 48 + 3, 42, 42);
      }
      for (let d of t.warnings) {
        r.fillStyle = d.fired ? "#f0473988" : "#ffc23e66";
        for (let y of d.cells) {
          let S = y % t.level.width, M = Math.floor(y / t.level.width);
          t.cells[y].wall !== "hard" && (r.fillRect(S * 48 + 3, M * 48 + 3, 42, 42), l.colorblind && (r.fillStyle = "#402a20", r.font = "bold 26px system-ui", r.textAlign = "center", r.fillText("!", S * 48 + 24, M * 48 + 32), r.fillStyle = d.fired ? "#f0473988" : "#ffc23e66"));
        }
      }
      for (let d of t.bombs) {
        let y = o.bomb_skin || "bomb", S = Bt[`bombs/${y}/idle`] ? y : "bomb";
        this.sprite(r, `bombs/${S}/${d.at - t.time < 600 ? "flash" : "idle"}`, d.x * 48, d.y * 48, 48, 48, t.time), d.type !== "normal" && (r.strokeStyle = { fire: "#ff9c34", ice: "#b9f9ff", blackhole: "#ba89f0", light: "#fff796" }[d.type], r.lineWidth = 4, r.strokeRect(d.x * 48 + 4, d.y * 48 + 4, 40, 40));
      }
      for(const bomb of t.bombs)if(bomb.type!=='normal')this.image(r,Be('item_'+({fire:'bomb_fire',ice:'bomb_ice',blackhole:'bomb_blackhole',light:'light'}[bomb.type]||'bomb_plus')),bomb.x*48+8,bomb.y*48+8,32,32);
      let _ = (d, y = false) => {
        let pos=boomPosition(d,t.time), M=pos.x*48, g=pos.y*48;
        r.save(), y && t.player.invulnerable > t.time && (r.globalAlpha = Math.floor(t.time / 100) % 2 ? 0.45 : 1);
        let c = y ? `pip_${Object.keys(o).length ? "bare" : "default"}/${d.invulnerable>t.time+1200?"hit":d.moving?"run":"idle"}_${d.dir}` : `enemies_4dir/${d.kind === "enemy_nam_small" ? "enemy_nam_lun" : d.kind}/walk_${d.dir}`;
        if(y)drawWardrobe(this,r,o,d.dir,M,g-16,48,64,"behind");
        this.sprite(r,c,M,y?g-16:g,48,y?64:48,d.frozenAt ?? t.time);
        if(y)drawWardrobe(this,r,o,d.dir,M,g-16,48,64,"front");
        y && t.player.shield > t.time && this.sprite(r, "fx/shield_bubble", M - 4, g - 16, 56, 64, t.time), !y && d.hp > 1 && (r.fillStyle = "#e9f0ef", r.fillRect(M + 12, g - 7, 24, 4)), d.frozen > t.time && (r.fillStyle = "#b5f1ff55", r.fillRect(M, g - 6, 48, 48)), r.restore();
      };
      for (let d of t.enemies.filter((y) => !y.deadUntil)) _(d);
      if (t.boss) {
        const d=t.boss;d.windupMs=t.level.chapter===10?2000:1500;const pose=bossPose(d,t.time);
        const x=(d.x-1.15)*48,y=(d.y-1.6)*48,w=48*3.3,h=48*3.63;
        if(!artSprite(this,r,`art_boss/${d.id}/${pose}`,x,y,w,h,t.time)){
          const action=`boss_${d.id}_actions/${d.attack}`;
          const legacy=d.hp<=0?`boss_${d.id}/defeat`:t.time-d.attackAt<2350&&Bt[action]?action:d.weak>t.time?`boss_${d.id}/weak_idle`:`boss_${d.id}/idle_p${d.phase}`;
          this.sprite(r,legacy,x,y,w,h,Math.max(0,t.time-d.attackAt));
        }
        // Visible phase rank and vulnerability ring remain inside the existing footprint.
        if(d.hp>0){r.save();r.strokeStyle=pose===6?'#72f3df':d.phase===3?'#ff6c6c':'#e8b958';r.lineWidth=2;
          if(pose===6){r.beginPath();r.ellipse(d.x*48+24,(d.y+1.25)*48,44,10,0,0,Math.PI*2);r.stroke();}
          for(let rank=0;rank<d.phase;rank++){r.fillStyle=d.phase===3?'#ff6c6c':'#ffd47d';r.fillRect(d.x*48+14+rank*8,(d.y-1.5)*48,5,5);}r.restore();}
      }
      for (let d of t.rescued) this.image(r, Be("pip_idle_front"), d.x * 48 + 7, d.y * 48 - 10, 34, 45);
      let x = ga.find((d) => d.id === o.pet);
      x && "file" in x && this.image(r, iconPath(x.id,true), (t.player.x - 0.7) * 48, (t.player.y + 0.5) * 48, 28, 28);
      let m = ga.find((d) => d.id === o.footprint);
      m && "file" in m && t.time - t.player.lastMove < 700 && (r.save(), r.globalAlpha = 0.6 * (1 - (t.time - t.player.lastMove) / 700), this.image(r, iconPath(m.id,true), t.player.fromX * 48 + 8, t.player.fromY * 48 + 8, 32, 32), r.restore()), _(t.player, true);
      for (let d of t.fx) {
        let y = t.time - d.at;
        if (d.kind === "explosion") {
          boomDrawBlast(r,d,t.time,o.explosion_fx);cosmeticBlast(r,d,t.time,o.explosion_fx);
          if(o.explosion_fx){r.save();r.globalAlpha=Math.max(0,(1-y/500)*.7);for(const cell of (d.cells||[]).filter((_,index)=>index%3===0).slice(0,6))this.image(r,iconPath(o.explosion_fx,true),cell.x*48+14,cell.y*48+14,20,20);r.restore();}
        }
        else this.sprite(r, `fx/${{ break: "dust_puff", death: "enemy_death_puff", pickup: "pickup_sparkle", hit: "hit_flash", gate: "gate_enter" }[d.kind]}`, d.x * 48 - 4, d.y * 48 - 4, 56, 56, y);
      }
      if ((t.level.stage === 5 || t.curseUntil > t.time) && t.level.chapter !== 8) {
        r.save();
        let d = r.createRadialGradient(t.player.x * 48 + 24, t.player.y * 48 + 24, 48, t.player.x * 48 + 24, t.player.y * 48 + 24, 48 * 3.6);
        d.addColorStop(0, "#15261900"), d.addColorStop(1, "#0e142ce8"), r.fillStyle = d, r.fillRect(0, 0, i, n), r.restore();
      }
      r.restore(), a.dataset.phase = t.status, a.dataset.bombs = t.bombs.length.toString(), a.dataset.hearts = t.player.hp.toString(); a.dataset.playerX=(t.player.px??t.player.x).toFixed(4);a.dataset.playerY=(t.player.py??t.player.y).toFixed(4);
    }
  };
  var vn = class {
    constructor() {
      this.context = null;
      this.next = 0;
      this.note = 0;
    }
    unlock() {
      try {
        this.context ||= new AudioContext(), this.context.resume();
      } catch {
      }
    }
    tone(a, t = 0.08, l = "square", o = 0.025) {
      let s = this.context;
      if (!s || s.state !== "running") return;
      let i = s.createOscillator(), n = s.createGain();
      i.type = l, i.frequency.setValueAtTime(a, s.currentTime), n.gain.setValueAtTime(o, s.currentTime), n.gain.exponentialRampToValueAtTime(1e-4, s.currentTime + t), i.connect(n), n.connect(s.destination), i.start(), i.stop(s.currentTime + t);
    }
    effect(a) {
      a === "explode" ? (this.tone(85, 0.2, "sawtooth", 0.06), this.tone(47, 0.28, "triangle", 0.045)) : a === "pickup" || a === "win" ? (this.tone(660, 0.12), this.tone(880, 0.17, "triangle")) : a === "hit" ? this.tone(170, 0.2, "sawtooth") : a === "bomb" && this.tone(310, 0.06);
    }
    music(a, t, l) {
      if (!t || a < this.next) return;
      this.next = a + 320;
      let o = [262, 330, 392, 330, 294, 349, 440, 392];
      this.tone(o[this.note++ % o.length] * (l % 2 ? 1 : 0.75), 0.25, "triangle", 0.012);
    }
    close() {
      this.context?.close(), this.context = null;
    }
  };
  var og = { "C1-OPEN": [{ scene: "L\xE0ng R\xEAu Xanh y\xEAn b\xECnh l\xFAc b\xECnh minh, r\u1ED3i b\xF3ng \u0111en che tr\u1EDDi", text: '(Ch\u1EEF d\u1EABn) "Pixelia t\u1EEBng r\u1EF1c r\u1EE1 nh\u1EDD 10 L\xF5i S\xE1ng."' }, { scene: "Vua R\u1EC9 S\xE9t xu\u1EA5t hi\u1EC7n tr\xEAn \u0111\u1EC9nh th\xE1p, tay h\xFAt \xE1nh s\xE1ng t\u1EEB L\xF5i", text: 'Vua R\u1EC9 S\xE9t: "D\u1EEBng l\u1EA1i... t\u1EA5t c\u1EA3 h\xE3y d\u1EEBng l\u1EA1i."' }, { scene: "Pip gi\u1EADt m\xECnh t\u1EC9nh d\u1EADy trong nh\xE0 th\u1EE3 m\u1ECF, ngo\xE0i kia kh\xF3i b\u1ED1c l\xEAn", text: 'Pip: "Chuy\u1EC7n g\xEC th\u1EBF n\xE0y?!"' }, { scene: "B\xE0 M\u1ED9c \u0111\u01B0a Pip chi\u1EBFc T\xFAi Bom c\u0169; m\u1ED9t qu\u1EA3 bom tr\xF2n nh\u1EA3y ra", text: 'B\xE0 M\u1ED9c: "Ch\xE1u c\u1EA7m l\u1EA5y. N\xF3 bi\u1EBFt c\xE1ch l\xE0m vi\u1EC7c c\u1EE7a n\xF3." B\xF9m: "Ch\xE0o! T\xEAn t\xF4i l\xE0 B\xF9m! \u0110\u1EEBng nh\xECn t\xF4i nh\u01B0 th\u1EBF, t\xF4i kh\xF4ng n\u1ED5... tr\u1EEB khi c\u1EA7n."' }, { scene: "Pip v\xE0 B\xF9m nh\xECn ra c\u1ED5ng l\xE0ng; Nh\xEDm K\u1EBDm \u0111ang d\u1EF1ng l\u1EC1u", text: 'Nh\xEDm K\u1EBDm: "H\xE0ng t\u1ED1t gi\xE1 ph\u1EA3i ch\u0103ng! Ra tr\u1EADn m\xE0 tay tr\u1EAFng th\xEC ti\u1EBFc l\u1EAFm!"' }], "C1-MID": [{ scene: "D\xE2n l\xE0ng \u0111\u01B0\u1EE3c c\u1EE9u ch\u1EA1y ra c\u1ED5ng, \xF4m Pip", text: 'D\xE2n l\xE0ng: "C\u1EA3m \u01A1n ch\xE1u! C\u1EA3 l\xE0ng n\u1EE3 ch\xE1u r\u1ED3i!"' }, { scene: "B\xE0 M\u1ED9c nh\xECn xa v\u1EC1 ph\xEDa c\xE1nh \u0111\u1ED3ng n\u01A1i G\u1EA5u R\u1EC9 S\xE9t \u0111ang g\u1EA7m", text: 'B\xE0 M\u1ED9c: "Con g\u1EA5u \u0111\xF3 t\u1EEBng g\u1EB7t l\xFAa cho c\u1EA3 l\xE0ng... gi\u1EDD n\xF3 b\u1ECB \u0111i\u1EC1u khi\u1EC3n."' }, { scene: "Pip si\u1EBFt tay, B\xF9m nh\xE1y m\u1EAFt", text: 'Pip: "T\u1EE5i ch\xE1u s\u1EBD \u0111\u01B0a n\xF3 v\u1EC1." B\xF9m: "T\u1EE5i *ch\xE1u*? T\xF4i l\xE0 bom, kh\xF4ng ph\u1EA3i ch\xE1u... m\xE0 th\xF4i, b\xF9m!"' }], "C1-END": [{ scene: "G\u1EA5u g\u1EE5c xu\u1ED1ng, m\u1EA3nh r\u1EC9 r\u01A1i, L\xF5i S\xE1ng s\u1ED1 1 hi\u1EC7n l\xEAn", text: "(Hi\u1EC7u \u1EE9ng \xE1nh s\xE1ng, kh\xF4ng tho\u1EA1i)" }, { scene: "G\u1EA5u t\u1EC9nh l\u1EA1i, \u0111\xF4i m\u1EAFt m\xE1y s\xE1ng xanh, c\xFAi \u0111\u1EA7u", text: 'G\u1EA5u: "...C\u1EA3m \u01A1n."' }, { scene: "L\xF5i S\xE1ng nh\u1ECF bay l\xEAn, ch\u1EC9 v\u1EC1 h\u01B0\u1EDBng r\u1EEBng n\u1EA5m xa xa", text: 'B\xF9m: "N\xF3 ch\u1EC9 \u0111\u01B0\u1EDDng! \u0110i n\xE0o!"' }, { scene: "B\xF3ng Vua R\u1EC9 S\xE9t \u1EDF th\xE1p, m\u1ED9t L\xF5i x\xE1m l\u1EA1nh tr\xEAn tay", text: 'Vua R\u1EC9 S\xE9t: "M\u1ED9t con ki\u1EBFn nh\u1ECF... th\xFA v\u1ECB."' }], "C2-OPEN": [{ scene: "R\u1EEBng n\u1EA5m t\xEDm l\u1EA5p l\xE1nh nh\u01B0ng nhi\u1EC1u n\u1EA5m \u0111en th\xE2m", text: 'B\xF9m: "R\u1EEBng n\xE0y \u0111\u1EB9p... n\u1EBFu b\u1ECF qua m\u1EA5y c\xE2y \u0111ang th\u1ED1i."' }, { scene: "M\u1ED9t c\xF4 n\u1EA5m nh\u1ECF (Mimi) n\xFAp sau g\u1ED1c c\xE2y, run r\u1EA9y", text: 'Mimi: "\u0110\u1EEBng... \u0111\u1EEBng \u0111\u1EBFn g\u1EA7n! N\u1EEF Ho\xE0ng \u0111ang gi\u1EADn!"' }, { scene: "Pip ng\u1ED3i xu\u1ED1ng, \u0111\u01B0a tay ra, n\u1EDF n\u1EE5 c\u01B0\u1EDDi", text: 'Pip: "B\u1ECDn m\xECnh \u0111\u1EBFn gi\xFAp."' }, { scene: "Mimi d\u1EABn \u0111\u01B0\u1EDDng v\xE0o r\u1EEBng s\xE2u", text: 'Mimi: "\u0110i theo m\xECnh. \u0110\u1EEBng ch\u1EA1m v\xE0o b\xE0o t\u1EED s\xE1ng!"' }], "C2-MID": [{ scene: "D\xE2n n\u1EA5m \u0111\u01B0\u1EE3c c\u1EE9u t\u1EE5 t\u1EADp, r\u1EC5 tr\xF3i r\u01A1i xu\u1ED1ng", text: 'D\xE2n n\u1EA5m: "Ch\xFAng t\xF4i \u0111\u01B0\u1EE3c t\u1EF1 do r\u1ED3i!"' }, { scene: "Mimi k\u1EC3 v\u1EC1 N\u1EEF Ho\xE0ng ng\xE0y x\u01B0a d\u1ECBu d\xE0ng", text: 'Mimi: "N\u1EEF Ho\xE0ng t\u1EEBng ru c\u1EA3 r\u1EEBng ng\u1EE7. R\u1EC9 s\xE9t \u0111\xE3 l\xE0m b\xE0 \u1EA5y \u0111i\xEAn."' }, { scene: "Pip nh\xECn n\xF3n n\u1EA5m ph\xE1t s\xE1ng n\u01A1i xa", text: 'Pip: "M\xECnh s\u1EBD \u0111\xE1nh th\u1EE9c b\xE0 \u1EA5y."' }], "C2-END": [{ scene: "N\u1EEF Ho\xE0ng qu\u1EF3 xu\u1ED1ng, b\xE0o t\u1EED \u0111en tan th\xE0nh b\u1EE5i v\xE0ng", text: 'N\u1EEF Ho\xE0ng: "Ta... \u0111\xE3 l\xE0m g\xEC th\u1EBF n\xE0y?"' }, { scene: "R\u1EEBng n\u1EA5m s\xE1ng r\u1EF1c tr\u1EDF l\u1EA1i, L\xF5i S\xE1ng s\u1ED1 2 tr\xF4i l\xEAn", text: 'Mimi: "R\u1EEBng s\u1ED1ng l\u1EA1i r\u1ED3i!"' }, { scene: "N\u1EEF Ho\xE0ng ch\u1EC9 v\u1EC1 h\u01B0\u1EDBng h\u1EA7m m\u1ECF", text: 'N\u1EEF Ho\xE0ng: "R\u1EC9 s\xE9t \u0111\xE3 chui v\xE0o l\xF2ng \u0111\u1EA5t. L\xF5i ti\u1EBFp theo \u1EDF d\u01B0\u1EDBi \u0111\xF3."' }], "C3-OPEN": [{ scene: "C\u1EEDa h\u1EA7m m\u1ECF t\u1ED1i \u0111en, \u0111\u01B0\u1EDDng ray k\xE9o d\xE0i v\xE0o b\xF3ng t\u1ED1i", text: 'B\xF9m: "T\xF4i gh\xE9t hang. Bom v\xE0 hang kh\xF4ng h\u1EE3p nhau."' }, { scene: "Nh\xEDm K\u1EBDm xu\u1EA5t hi\u1EC7n v\u1EDBi ng\u1ECDn \u0111\xE8n m\u1ECF c\u0169", text: 'Nh\xEDm K\u1EBDm: "Ta t\u1EEBng l\xE0m th\u1EE3 \u1EDF \u0111\xE2y ba m\u01B0\u01A1i n\u0103m."' }, { scene: "Nh\xEDm K\u1EBDm tr\u1EA3i b\u1EA3n \u0111\u1ED3 ra, ch\u1EC9 v\xE0o m\u1ED9t ch\u1EA5m \u0111\u1ECF", text: 'Nh\xEDm K\u1EBDm: "R\u1EC9 s\xE9t \u0111\xE0o \u0111\u01B0\u1EDDng ray \u0111\u1EBFn t\u1EADn L\xF5i. C\u1EA9n th\u1EADn xe go\xF2ng."' }, { scene: "Pip g\u1EADt \u0111\u1EA7u, \u0111\u1ED9i m\u0169 b\u1EA3o h\u1ED9", text: 'Pip: "C\u1EA3m \u01A1n b\xE1c."' }], "C3-MID": [{ scene: "C\xE1c th\u1EE3 m\u1ECF \u0111\u01B0\u1EE3c c\u1EE9u \xF4m nhau trong toa xe", text: 'Th\u1EE3 m\u1ECF: "Ba ng\xE0y kh\xF4ng th\u1EA5y m\u1EB7t tr\u1EDDi!"' }, { scene: "Nh\xEDm K\u1EBDm nh\xECn th\u1EE3 c\u0169, m\u1EAFt \u0111\u1ECF hoe", text: 'Nh\xEDm K\u1EBDm: "Ta t\u01B0\u1EDFng c\xE1c c\u1EADu m\u1EA5t c\u1EA3 r\u1ED3i..."' }, { scene: "Rung chuy\u1EC3n; ti\u1EBFng khoan vang v\u1ECDng", text: 'B\xF9m: "C\xF3 th\u1EE9 g\xEC \u0111\xF3 r\u1EA5t to \u0111ang \u0111\xE0o v\u1EC1 ph\xEDa ch\xFAng ta."' }], "C3-END": [{ scene: "S\xE2u Khoan \u0111\u1ED5 g\u1EE5c, m\u0169i khoan v\u1EE1 v\u1EE5n", text: "(\xC2m thanh v\u1EE1 v\u1EE5n)" }, { scene: "L\xF5i S\xE1ng s\u1ED1 3 l\u01A1 l\u1EEDng gi\u1EEFa hang tinh th\u1EC3", text: 'Pip: "Ba r\u1ED3i."' }, { scene: "Nh\xEDm K\u1EBDm \u0111\u01B0a Pip m\u1ED9t t\u1EA5m b\u1EA3n \u0111\u1ED3 sa m\u1EA1c", text: 'Nh\xEDm K\u1EBDm: "Gi\xF3 c\xE1t n\u01A1i \u0111\xF3 m\u1EA1nh l\u1EAFm. Mang theo k\u1EB9o b\u1EA1c h\xE0." B\xF9m: "K\u1EB9o b\u1EA1c h\xE0... ch\u1ED1ng b\xE3o c\xE1t?"' }], "C4-OPEN": [{ scene: "Kim t\u1EF1 th\xE1p v\xE0ng gi\u1EEFa c\u1ED3n c\xE1t, b\xE3o c\xE1t cu\u1ED9n", text: 'B\xF9m: "N\xF3ng... bom kh\xF4ng th\xEDch n\xF3ng."' }, { scene: "C\u1EEDa th\xE1p kh\u1EAFc k\xFD hi\u1EC7u c\u1ED5 \u0111\u1EA1i", text: 'Pip: "Nh\u1EEFng k\xFD hi\u1EC7u n\xE0y... gi\u1ED1ng h\xECnh c\u1EE7a Vua R\u1EC9 S\xE9t."' }, { scene: "B\xF3ng x\xE1c \u01B0\u1EDBp \u0111i ngang qua", text: 'B\xF9m: "T\xF4i kh\xF4ng mu\u1ED1n n\xF3i g\xEC \u0111\xE2u... nh\u01B0ng ch\xFAng ta \u0111ang b\u1ECB theo d\xF5i."' }], "C4-MID": [{ scene: "C\xE1c k\xFD hi\u1EC7u s\xE1ng l\xEAn, hi\u1EC7n h\xECnh m\u1ED9t c\u1ED7 m\xE1y c\u1ED5 \u0111\u1EA1i", text: 'Pip: "\u0110\xE2y l\xE0... Vua R\u1EC9 S\xE9t?"' }, { scene: "Tranh kh\u1EAFc: ng\u01B0\u1EDDi x\u01B0a ch\u1EBF t\u1EA1o c\u1ED7 m\xE1y \u0111\u1EC3 b\u1EA3o v\u1EC7 Pixelia", text: 'B\xF9m: "H\xF3a ra \xF4ng ta l\xE0... ng\u01B0\u1EDDi g\xE1c c\u1ED5ng."' }, { scene: "Pip l\u1EB7ng l\u1EBD nh\xECn L\xF5i S\xE1ng trong tay", text: 'Pip: "V\u1EADy th\xEC v\xEC sao \xF4ng \u1EA5y l\u1EA1i l\xE0m th\u1EBF n\xE0y?"' }], "C4-END": [{ scene: "Pharaoh tan th\xE0nh c\xE1t v\xE0ng, L\xF5i S\xE1ng s\u1ED1 4 hi\u1EC7n ra", text: 'Pharaoh: "\xD4ng ta \u0111\xE3 d\u1EEBng \u0111\u1ED3ng h\u1ED3 c\u1EE7a ch\xFAng ta..."' }, { scene: "C\xE1t r\u01A1i t\u1EA1o th\xE0nh m\u0169i t\xEAn ch\u1EC9 ra bi\u1EC3n", text: 'B\xF9m: "Bi\u1EC3n. Cu\u1ED1i c\xF9ng c\u0169ng m\xE1t."' }], "C5-OPEN": [{ scene: "T\xE0u c\u1EE7a Pip c\u1EADp b\u1EBFn \u0111\u1EA3o, c\u1EDD h\u1EA3i t\u1EB7c r\xE1ch n\xE1t", text: 'B\xF9m: "T\xF4i... kh\xF4ng bi\u1EBFt b\u01A1i. T\xF4i l\xE0 bom."' }, { scene: "H\u1EA3i t\u1EB7c x\u01B0\u01A1ng \u0111\u1EE9ng g\xE1c, m\u1EAFt \u0111\u1ECF r\u1EF1c", text: 'H\u1EA3i t\u1EB7c: "L\u1EC7nh c\u1EE7a Vua... kh\xF4ng ai \u0111\u01B0\u1EE3c qua."' }, { scene: "Pip k\xE9o m\u0169, nh\u1EA3y kh\u1ECFi thuy\u1EC1n", text: 'Pip: "Ch\xFAng ta \u0111i th\xF4i."' }], "C5-MID": [{ scene: "C\xE1c th\u1EE7y th\u1EE7 \u0111\u01B0\u1EE3c c\u1EE9u h\xF2 reo tr\xEAn b\xE3i c\xE1t", text: 'Th\u1EE7y th\u1EE7: "Thuy\u1EC1n tr\u01B0\u1EDFng kh\xF4ng c\xF2n l\xE0 ch\xEDnh m\xECnh n\u1EEFa!"' }, { scene: "M\u1ED9t chi\u1EBFc la b\xE0n v\xE0ng ch\u1EC9 v\u1EC1 thuy\u1EC1n l\u1EDBn", text: 'Th\u1EE7y th\u1EE7: "H\u1EA1c S\u1EAFt \u0111ang gi\u1EEF L\xF5i tr\xEAn con t\xE0u \u0111\xF3."' }, { scene: "B\xF9m run run nh\xECn bi\u1EC3n", text: 'B\xF9m: "T\xF4i s\u1EBD... \u1EDF trong t\xFAi, \u0111\u01B0\u1EE3c ch\u1EE9?"' }], "C5-END": [{ scene: "Thuy\u1EC1n tr\u01B0\u1EDFng qu\u1EF3, c\xE1nh tay m\xF3c c\xE2u r\u1EE5ng", text: 'H\u1EA1c S\u1EAFt: "Ta nh\u1EDB bi\u1EC3n... ta nh\u1EDB gi\xF3..."' }, { scene: "L\xF5i S\xE1ng s\u1ED1 5 t\u1ECFa s\xE1ng tr\xEAn c\u1ED9t bu\u1ED3m", text: 'Pip: "N\u0103m r\u1ED3i. N\u1EEDa \u0111\u01B0\u1EDDng r\u1ED3i."' }, { scene: "B\u1EA7u tr\u1EDDi ph\xEDa b\u1EAFc ph\u1EE7 b\u0103ng tr\u1EAFng", text: 'Thuy\u1EC1n tr\u01B0\u1EDFng: "H\xE3y c\u1EA9n th\u1EADn \u1EDF \u0111\u1EC9nh tuy\u1EBFt. Yeti v\u1ED1n d\u0129 r\u1EA5t hi\u1EC1n."' }], "C6-OPEN": [{ scene: "N\xFAi tuy\u1EBFt tr\u1EAFng x\xF3a, gi\xF3 r\xEDt, Pip co ro", text: 'Pip: "L\u1EA1nh..."' }, { scene: "B\xF9m \u0111\xF3ng b\u0103ng m\u1ED9t n\u1EEDa, nh\u0103n nh\xF3", text: 'B\xF9m: "T\xF4i... kh\xF4ng... mu\u1ED1n... th\xE0nh... bom... \u0111\xE1."' }, { scene: "Chim c\xE1nh c\u1EE5t nh\u1ECF tr\u01B0\u1EE3t t\u1EDBi, k\xE9o tay Pip v\u1EC1 ph\xEDa l\u1EEDa tr\u1EA1i", text: 'C\xE1nh c\u1EE5t: "L\u1EEDa! L\u1EEDa tr\u1EA1i! Theo m\xECnh!"' }], "C6-MID": [{ scene: "C\xE1c ch\xFA c\xE1nh c\u1EE5t t\u1EE5 l\u1EA1i quanh Pip, nh\u1EA3y m\xFAa", text: 'C\xE1nh c\u1EE5t: "C\u1EA3m \u01A1n! C\u1EA3m \u01A1n! C\u1EA3m \u01A1n!"' }, { scene: "C\xE1nh c\u1EE5t gi\xE0 k\u1EC3 chuy\u1EC7n Yeti ng\xE0y x\u01B0a canh \u0111\u1EC9nh n\xFAi", text: 'C\xE1nh c\u1EE5t gi\xE0: "Yeti t\u1EEBng \xF4m ch\xFAng t\xF4i m\u1ED7i \u0111\xEAm b\xE3o."' }, { scene: "M\u1ED9t ti\u1EBFng g\u1EA7m vang l\xEAn t\u1EEB \u0111\u1EC9nh n\xFAi, nh\u01B0ng \u0111au \u0111\u1EDBn h\u01A1n l\xE0 hung d\u1EEF", text: 'B\xF9m: "Nghe nh\u01B0... \u0111ang kh\xF3c."' }], "C6-END": [{ scene: "Kh\u1ED1i b\u0103ng tr\xEAn \u0111\u1EA7u Yeti v\u1EE1 ra, \xF4ng ng\u1ED3i th\u1EE5p xu\u1ED1ng", text: 'Yeti: "Ta... xin l\u1ED7i."' }, { scene: "L\xF5i S\xE1ng s\u1ED1 6 tan th\xE0nh tuy\u1EBFt v\xE0ng, \u1EA5m l\xEAn c\u1EA3 \u0111\u1EC9nh n\xFAi", text: 'Pip: "\u1EA4m qu\xE1..."' }, { scene: "Ch\xE2n tr\u1EDDi ph\xEDa nam: th\xE1p c\u01A1 kh\xED kh\xF3i \u0111en", text: 'B\xF9m: "Th\xE0nh ph\u1ED1 m\xE1y m\xF3c. T\xF4i c\xF3 c\u1EA3m gi\xE1c n\u01A1i n\xE0y s\u1EBD... nhi\u1EC1u d\xE2y \u0111i\u1EC7n."' }], "C7-OPEN": [{ scene: "Th\xE0nh ph\u1ED1 robot s\xE1ng neon, b\u0103ng chuy\u1EC1n ch\u1EA1y kh\u1EAFp n\u01A1i", text: 'B\xF9m: "Ch\xE0, \u0111\u1EB9p qu\xE1. V\xE0... \u0111\xE1ng ng\u1EDD."' }, { scene: "Gizmo (robot nh\u1ECF, m\u1EAFt xanh lam) l\u0103n t\u1EDBi, c\xFAi ch\xE0o", text: 'Gizmo: "Ch\xE0o m\u1EEBng, l\u1EEF kh\xE1ch. T\xF4i l\xE0 Gizmo, h\u01B0\u1EDBng d\u1EABn vi\xEAn."' }, { scene: "Pip v\xE0 Gizmo b\u1EAFt tay", text: 'Pip: "R\u1EA5t vui \u0111\u01B0\u1EE3c g\u1EB7p." B\xF9m: "T\xF4i kh\xF4ng tin m\u1EA5y k\u1EBB l\u1ECBch s\u1EF1 qu\xE1."' }], "C7-MID": [{ scene: "M\xE0n h\xECnh l\u1EDBn hi\u1EC7n c\u1EA3nh Gizmo b\xE1o c\xE1o cho Vua R\u1EC9 S\xE9t", text: 'Gizmo (ghi \xE2m): "Ch\xFAng \u0111\xE3 \u0111\u1EBFn Ch\u01B0\u01A1ng 7, th\u01B0a ng\xE0i."' }, { scene: "Pip quay l\u1EA1i, Gizmo \u0111\u1EE9ng h\xECnh", text: 'Pip: "C\u1EADu \u0111\xE3 lu\xF4n l\xE0 ng\u01B0\u1EDDi c\u1EE7a \xF4ng \u1EA5y."' }, { scene: "Gizmo c\xFAi \u0111\u1EA7u, nh\u01B0ng tay n\u1EAFm ch\u1EB7t ch\xECa kh\xF3a", text: 'Gizmo: "T\xF4i... \u0111\xE3 sai. Nh\u01B0ng t\xF4i mu\u1ED1n s\u1EEDa."' }], "C7-END": [{ scene: "MK-7 n\u1ED5 tung, Gizmo che ch\u1EAFn cho Pip", text: 'Gizmo: "\u0110i \u0111i! T\xF4i s\u1EBD gi\u1EEF ch\xFAng!"' }, { scene: "L\xF5i S\xE1ng s\u1ED1 7 l\u01A1 l\u1EEDng, \xE1nh xanh d\u1ECBu", text: 'Pip: "Gizmo!"' }, { scene: "Gizmo b\u01B0\u1EDBc ra, xin l\u1ED7i, B\xF9m khoanh tay nh\u01B0ng g\u1EADt \u0111\u1EA7u", text: 'Gizmo: "Cho ph\xE9p t\xF4i \u0111i c\xF9ng." B\xF9m: "Ch\u1EC9 l\u1EA7n n\xE0y th\xF4i."' }, { scene: "N\xFAi l\u1EEDa \u0111\u1ECF r\u1EF1c ph\xEDa ch\xE2n tr\u1EDDi", text: 'Pip: "Ch\u01B0\u01A1ng ti\u1EBFp theo... n\xF3ng r\u1ED3i \u0111\u1EA5y."' }], "C8-OPEN": [{ scene: "Ch\xE2n n\xFAi l\u1EEDa, Pip v\xE0 B\xF9m \u0111i b\xEAn nhau, Gizmo \u1EDF xa", text: 'B\xF9m: "Ch\u1EC9 c\u1EA7n v\u01B0\u1EE3t qua ch\u1ED7 n\xE0y th\xF4i, r\u1ED3i..."' }, { scene: "M\u1ED9t b\xE0n tay m\xE1y kh\u1ED5ng l\u1ED3 v\u01B0\u01A1n t\u1EEB b\xF3ng t\u1ED1i, ch\u1ED9p l\u1EA5y B\xF9m", text: 'B\xF9m: "PIP!!"' }, { scene: "Pip lao t\u1EDBi nh\u01B0ng ch\u1EC9 ch\u1ED9p \u0111\u01B0\u1EE3c kh\xF4ng kh\xED", text: 'Pip: "B\xD9M!"' }, { scene: "Pip \u0111\u1EE9ng m\u1ED9t m\xECnh, chi\u1EBFc T\xFAi Bom tr\u1ED1ng tr\u1EA3i; nh\u1EA1c tr\u1EA7m xu\u1ED1ng", text: "(Im l\u1EB7ng)" }], "C8-MID": [{ scene: "Pip nh\u1EB7t n\u1EAFp bom nh\u1ECF c\u1EE7a B\xF9m, h\u1ED3i t\u01B0\u1EDFng c\u1EA3nh B\xF9m c\u01B0\u1EDDi", text: "(Ti\u1EBFng c\u01B0\u1EDDi vang v\u1ECDng)" }, { scene: "Gizmo \u0111\u1EB7t tay l\xEAn vai Pip", text: 'Gizmo: "Ch\xFAng ta s\u1EBD t\xECm th\u1EA5y c\u1EADu \u1EA5y."' }, { scene: "Pip si\u1EBFt n\u1EAFp bom v\xE0o ng\u1EF1c", text: 'Pip: "Ch\u1EDD m\xECnh nh\xE9, B\xF9m."' }], "C8-END": [{ scene: "R\u1ED3ng ch\u1EADm r\xE3i nh\u1EAFm m\u1EAFt, dung nham ngu\u1ED9i d\u1EA7n", text: 'R\u1ED3ng: "Ta kh\xF4ng mu\u1ED1n chi\u1EBFn \u0111\u1EA5u..."' }, { scene: "L\xF5i S\xE1ng s\u1ED1 8 tr\xF4i ra, k\xE9o theo m\u1ED9t d\u1EA3i s\xE1ng xanh", text: 'Pip: "\u0110\xF3 l\xE0... d\u1EA5u v\u1EBFt c\u1EE7a B\xF9m!"' }, { scene: "D\u1EA3i s\xE1ng ch\u1EC9 v\u1EC1 l\xE2u \u0111\xE0i m\u1EDD trong s\u01B0\u01A1ng", text: 'Gizmo: "L\xE2u \u0110\xE0i B\xF3ng Ma. C\u1EADu \u1EA5y \u1EDF \u0111\xF3."' }], "C9-OPEN": [{ scene: "L\xE2u \u0111\xE0i tr\xEAn \u0111\u1ED3i, s\u01B0\u01A1ng t\xEDm ph\u1EE7 k\xEDn, c\u1EEDa t\u1EF1 m\u1EDF", text: 'Gizmo: "H\u1EC7 th\u1ED1ng c\u1EA3nh b\xE1o... b\xEAn trong \u0111\u1EA7y sinh v\u1EADt kh\xF4ng t\xEAn."' }, { scene: "Pip h\xEDt m\u1ED9t h\u01A1i, si\u1EBFt n\u1EAFp bom", text: 'Pip: "M\xECnh \u0111\u1EBFn \u0111\xE2y, B\xF9m."' }, { scene: "M\u1ED9t ti\u1EBFng th\xEC th\u1EA7m y\u1EBFu \u1EDBt vang l\xEAn trong b\xF3ng t\u1ED1i", text: 'B\xF9m (xa x\u0103m): "Pip... \u0111\u1EEBng... l\u1EA1i g\u1EA7n..."' }], "C9-MID": [{ scene: "Phong \u1EA5n cu\u1ED1i v\u1EE1 tan, B\xF9m r\u01A1i v\xE0o tay Pip", text: 'B\xF9m: "C\u1EADu \u0111\u1EBFn mu\u1ED9n... m\u1ED9t ch\xFAt."' }, { scene: "Hai b\u1EA1n \xF4m nhau, Gizmo quay m\u1EB7t \u0111i lau m\u1EAFt", text: 'Pip: "M\xECnh xin l\u1ED7i." B\xF9m: "Th\xF4i n\xE0o, bom kh\xF4ng kh\xF3c... nh\u01B0ng c\u0169ng h\u01A1i \u1EA9m."' }, { scene: "M\u1ED9t t\u1EA5m g\u01B0\u01A1ng ma chi\u1EBFu h\xECnh Vua R\u1EC9 S\xE9t thu\u1EDF x\u01B0a, ng\u01B0\u1EDDi g\xE1c Pixelia", text: 'Vua R\u1EC9 S\xE9t (h\u1ED3i t\u01B0\u1EDFng): "Ta ch\u1EC9 mu\u1ED1n kh\xF4ng ai bi\u1EBFn m\u1EA5t n\u1EEFa..."' }], "C9-END": [{ scene: "Hi\u1EC7p s\u0129 tr\xFAt gi\xE1p, hi\u1EC7n ra m\u1ED9t ch\xE0ng l\xEDnh tr\u1EBB", text: 'Hi\u1EC7p s\u0129: "H\u1EAFn s\u1EE3... m\u1EA5t t\u1EA5t c\u1EA3. Nh\u01B0 ta."' }, { scene: "L\xF5i S\xE1ng s\u1ED1 9 bay t\u1EDBi Pip; ch\xEDn L\xF5i c\xF9ng rung nh\u1EB9", text: 'B\xF9m: "Ch\xEDn r\u1ED3i. Ch\u1EC9 c\xF2n m\u1ED9t."' }, { scene: "Ph\xE1o \u0111\xE0i c\u1EE7a Vua R\u1EC9 S\xE9t hi\u1EC7n l\xEAn, \xE1nh \u0111\u1ECF nh\u1EA5p nh\xE1y", text: 'Pip: "\u0110\u1EBFn l\xFAc r\u1ED3i."' }], "C10-OPEN": [{ scene: "Pip, B\xF9m, Gizmo tr\u01B0\u1EDBc c\u1ED5ng ph\xE1o \u0111\xE0i, 9 L\xF5i S\xE1ng xoay quanh", text: 'B\xF9m: "Cu\u1ED1i c\xF9ng c\u0169ng \u0111\u1EBFn \u0111\xE2y."' }, { scene: "Ph\xEDa sau l\xE0 d\xE2n l\xE0ng, d\xE2n n\u1EA5m, th\u1EE3 m\u1ECF, th\u1EE7y th\u1EE7, c\xE1nh c\u1EE5t... \u0111\u1EE9ng ch\u1EDD", text: 'D\xE2n l\xE0ng: "Ch\xFAng t\xF4i \u0111i c\xF9ng ch\xE1u!"' }, { scene: "Pip m\u1EC9m c\u01B0\u1EDDi, gi\u01A1 tay", text: 'Pip: "C\xF9ng nhau nh\xE9."' }], "C10-MID": [{ scene: "T\u1EA5t c\u1EA3 b\u1EA1n b\xE8 \u0111\u1EE9ng th\xE0nh v\xF2ng tr\xF2n, m\u1ED7i ng\u01B0\u1EDDi trao cho Pip m\u1ED9t tia s\xE1ng nh\u1ECF", text: 'Mimi: "C\u1EE7a r\u1EEBng n\u1EA5m." Nh\xEDm K\u1EBDm: "C\u1EE7a h\u1EA7m m\u1ECF... c\u1ED9ng th\xEAm ch\xFAt may m\u1EAFn."' }, { scene: "Gizmo ch\xECa tay, B\xF9m nh\u1EA3y l\xEAn vai Pip", text: 'Gizmo: "C\u1EE7a th\xE0nh ph\u1ED1 m\xE1y." B\xF9m: "C\xF2n t\xF4i l\xE0 ph\u1EA7n m\u1EA1nh nh\u1EA5t. B\xF9m."' }, { scene: "C\xE1nh c\u1EEDa ph\xF2ng L\xF5i h\xE9 m\u1EDF, \xE1nh s\xE1ng l\u1EA1nh h\u1EAFt ra", text: 'Pip: "\xD4ng \u1EA5y \u1EDF b\xEAn trong."' }], "C10-END-A": [{ scene: "Vua R\u1EC9 S\xE9t qu\u1EF3 tr\u01B0\u1EDBc L\xF5i T\u1ED1i \u0111ang tan", text: 'Vua R\u1EC9 S\xE9t: "Ta... \u0111\xE3 l\xE0m t\u1EA5t c\u1EA3 \u0111\u1EC3 gi\u1EEF c\xE1c ng\u01B0\u01A1i."' }, { scene: "Pip \u0111\u01B0a tay \u0111\u1EE1 \xF4ng, Bom \xC1nh S\xE1ng ph\xE1t ra \xE1nh v\xE0ng", text: 'Pip: "Ch\xFAng t\xF4i v\u1EABn \u1EDF \u0111\xE2y. \xD4ng kh\xF4ng ph\u1EA3i m\u1ED9t m\xECnh."' }, { scene: "Vua R\u1EC9 S\xE9t g\u1EADt \u0111\u1EA7u, \xE1nh s\xE1ng bao tr\xF9m", text: 'Vua R\u1EC9 S\xE9t: "C\u1EA3m \u01A1n."' }], "C10-END-B": [{ scene: "Vua R\u1EC9 S\xE9t ng\u01B0\u1EDBc nh\xECn, gi\xE1p r\u01A1i t\u1EEBng m\u1EA3ng", text: 'Vua R\u1EC9 S\xE9t: "Ng\u01B0\u01A1i s\u1EBD kh\xF4ng tr\xE1ch ta?"' }, { scene: "Pip l\u1EAFc \u0111\u1EA7u, B\xF9m khoanh tay", text: 'Pip: "C\xF3. Nh\u01B0ng ai c\u0169ng s\u1EE3 m\u1EA5t \u0111i th\u1EE9 m\xECnh y\xEAu."' }, { scene: "\xC1nh s\xE1ng t\u1EEB 9 L\xF5i tr\u1EA3i kh\u1EAFp Pixelia", text: 'B\xF9m: "B\xF9m. Th\u1EBF l\xE0 xong."' }], "C10-EPILOGUE": [{ scene: "Pixelia r\u1EF1c r\u1EE1 tr\u1EDF l\u1EA1i, m\u1ECDi ch\u01B0\u01A1ng hi\u1EC7n l\xEAn theo th\u1EE9 t\u1EF1 nh\u01B0 b\u1EA3n \u0111\u1ED3", text: '(Ch\u1EEF d\u1EABn) "Ch\xEDn L\xF5i S\xE1ng tr\u1EDF v\u1EC1. Pixelia \u0111\u01B0\u1EE3c th\u1EAFp l\u1EA1i."' }, { scene: "Vua R\u1EC9 S\xE9t, gi\u1EDD nh\u1ECF l\u1EA1i nh\u01B0 m\u1ED9t c\u1ED7 m\xE1y g\xE1c \u0111\xEAm, ng\u1ED3i b\xEAn b\xE0 M\u1ED9c", text: 'B\xE0 M\u1ED9c: "Cu\u1ED1i c\xF9ng \xF4ng c\u0169ng \u0111\u01B0\u1EE3c ngh\u1EC9 r\u1ED3i."' }, { scene: "Pip, B\xF9m, Gizmo tr\xEAn \u0111\u1ED3i, ho\xE0ng h\xF4n", text: 'B\xF9m: "Gi\u1EDD th\xEC l\xE0m g\xEC ti\u1EBFp?" Pip: "\u0110i ch\u01A1i."' }, { scene: "(Sau credits) M\u1ED9t tia s\xE1ng l\u1EA1 r\u01A1i xu\u1ED1ng H\u1EA7m V\xF4 T\u1EADn", text: 'Gi\u1ECDng b\xED \u1EA9n: "C\xF2n m\u1ED9t L\xF5i n\u1EEFa... ch\u01B0a ai bi\u1EBFt." *(m\u1EDF Ch\u01B0\u01A1ng Ph\u1EE5)*' }] };
  var f = at(Bs(), 1), ho = og, Br = (e) => `${Math.floor(e / 6e4)}:${Math.floor(e / 1e3 % 60).toString().padStart(2, "0")}`, Fx = { hat: "M\u0169", hair: "T\xF3c", face: "M\u1EB7t", outfit: "\xC1o", back: "L\u01B0ng", shoes: "Gi\xE0y", bomb_skin: "Bom", explosion_fx: "N\u1ED5", pet: "Pet", footprint: "D\u1EA5u ch\xE2n" };
  function me({ name: e, size: a = 22 }) {
    return (0, f.jsx)("img", { src: ve(Be(e)), alt: "", width: a, height: a, style:{imageRendering:"pixelated",...(e==="heart_empty"?{filter:"grayscale(1)",opacity:.3}:{})} });
  }
  function Rt({ equipped: e = {}, size: a = 120 }) {
    const layers=['back','outfit','shoes','hair','face','hat'];
    return (0,f.jsxs)('div',{className:'boom-pip',style:{width:a,height:a*4/3,position:'relative'},children:[
      (0,f.jsx)('span',{className:'boom-pip-base',role:'img','aria-label':'Pip',style:{position:'absolute',inset:0,backgroundImage:`url(${ve('art-v3/pip.webp')})`,backgroundSize:'400% 400%',backgroundPosition:'0% 0%',imageRendering:'pixelated',zIndex:1}}),
      ...layers.filter(slot=>e[slot]).map(slot=>{const anchor=WEAR_ANCHORS[slot];return (0,f.jsx)('img',{src:ve(iconPath(e[slot],true)),alt:slot,style:{position:'absolute',left:`${anchor[0]*100}%`,top:`${anchor[1]*100}%`,width:`${anchor[2]*100}%`,height:`${anchor[3]*100}%`,objectFit:'contain',imageRendering:'pixelated',zIndex:slot==='back'?0:2}},slot);})
    ]});
  }
  function Xx() {
    return (0, f.jsxs)("div", { className: "boom-wordmark", children: [(0, f.jsxs)("b", { children: ["BOOM", (0, f.jsx)("span", { children: "BUDDIES" })] }), (0, f.jsx)("small", { children: "H\xC0NH TR\xCCNH TH\u1EAEP L\u1EA0I L\xD5I S\xC1NG" })] });
  }
  var ug = [{ id: "move", title: "Xin ch\xE0o, t\xF4i l\xE0 B\xF9m!", text: "D\xF9ng joystick \u0111\u1EC3 di chuy\u1EC3n Pip. Tr\xEAn m\xE1y t\xEDnh, d\xF9ng WASD ho\u1EB7c c\xE1c ph\xEDm m\u0169i t\xEAn." }, { id: "bomb", title: "Th\u1EA3 bom, r\u1ED3i t\xECm ch\u1ED7 tr\xFA!", text: "Ch\u1EA1m TH\u1EA2 BOM ho\u1EB7c nh\u1EA5n Space. Bom n\u1ED5 sau 2,5 gi\xE2y theo h\xECnh ch\u1EEF th\u1EADp. Ch\u1EA1y v\xF2ng quanh c\u1ED9t \u0111\xE1 \u0111\u1EC3 tr\xE1nh v\xF9ng n\u1ED5. Bom \u0111\u1EA7u ti\xEAn \u1EDF m\xE0n 1 kh\xF4ng l\xE0m Pip m\u1EA5t tim." }, { id: "gate", title: "Target tr\u01B0\u1EDBc, c\u1ED5ng sau", text: "Ho\xE0n th\xE0nh m\u1EE5c ti\xEAu, ph\xE1 t\u01B0\u1EDDng t\xECm c\u1ED5ng r\u1ED3i b\u01B0\u1EDBc v\xE0o c\u1ED5ng s\xE1ng. N\u1ED5 tr\xFAng c\u1ED5ng \u0111\xE3 l\u1ED9 s\u1EBD g\u1ECDi th\xEAm k\u1EBB th\xF9! Item nh\u1EB7t \u0111\u01B0\u1EE3c ch\u1EC9 c\xF3 hi\u1EC7u l\u1EF1c trong m\xE0n hi\u1EC7n t\u1EA1i." }];
  function Dr(e) {
    let a = typeof window < "u" && !!window.__BOOM_REVIEW__, t = (0, z.useRef)(e.initialState), [l, o] = (0, z.useState)(() => {
      let p = Qh(a), w = t.current?.boom === 1 ? xn(t.current.run) : p.active;
      return w && (p.active = w), p;
    }), s = (0, z.useRef)(l);
    s.current = l;
    let i = (0, z.useRef)(l.active), [n, u] = (0, z.useState)(l.active ? "play" : "home"), [r, _] = (0, z.useState)(l.active?.status === "won" || l.active?.status === "lost" ? "result" : l.active ? "pause" : null), [x, m] = (0, z.useState)(l.active?.level.chapter || Math.min(10, l.cores.length + 1)), [d, y] = (0, z.useState)(va[0]), [S, M] = (0, z.useState)({}), [g, c] = (0, z.useState)("campaign"), [h, b] = (0, z.useState)("hat"), [C, O] = (0, z.useState)("enemies"), [k, B] = (0, z.useState)(""), [T, q] = (0, z.useState)(null), [ba, Ds] = (0, z.useState)(""), [ne, ul] = (0, z.useState)(null), [wa, Sn] = (0, z.useState)(null), [zt, Cn] = (0, z.useState)(0), [kn, In] = (0, z.useState)("normal"), [, Rs] = (0, z.useState)(0), [fl, Rr] = (0, z.useState)(l.lastResult && l.lastResult.id === l.active?.id ? l.lastResult.reward : null), Tn = (0, z.useRef)(null), dg = (0, z.useRef)(new Ln()), Ot = (0, z.useRef)(new vn()), de = (0, z.useRef)(null), Mn = (0, z.useRef)(null), go = (0, z.useRef)(null), An = (0, z.useRef)(0), zs = (0, z.useRef)(0), Os = (0, z.useRef)(""), Bn = (0, z.useRef)(""), Dn = (0, z.useRef)(null), Kx = (0, z.useRef)(0), He = (0, z.useRef)({ screen: n, dialog: r, story: ne, lesson: wa, confirm: T, special: kn, props: e });
    He.current = { screen: n, dialog: r, story: ne, lesson: wa, confirm: T, special: kn, props: e };
    if(window.__BOOM_TEST__)window.__boomTest={getRun:()=>i.current,create:Gh,levels:va,defaults:mo,step:jh,move:As,place:Ph,blast:bn,explode:Xh,position:boomPosition,drawBlast:boomDrawBlast,renderer:Ln,setRun:(run)=>{i.current=run;u("play");_(null);Sn(null);ul(null);Rs(v=>v+1);}};
    let L = i.current, rl = (p) => {
      s.current = p, o({ ...p }), Ir(p, a) || B("B\u1ED9 nh\u1EDB \u0111\u1EA7y \u2014 ch\u01B0a l\u01B0u \u0111\u01B0\u1EE3c ti\u1EBFn tr\xECnh.");
    }, je = (p) => {
      let w = JSON.parse(JSON.stringify(s.current));
      p(w), rl(w);
    }, zr = () => {
      let p = { ...s.current, active: i.current ? JSON.parse(JSON.stringify(i.current)) : null };
      rl(p), e.bridge?.saveGameState(i.current ? { boom: 1, run: i.current } : null);
    }, qt = () => He.current.screen === "play" && !He.current.dialog && !He.current.lesson && !He.current.story && !He.current.confirm && !He.current.props.isPaused && document.visibilityState === "visible";
    function _o(p) {
      de.current = null, Dn.current = r || (n === "play" ? "pause" : null), _(p), Ot.current.unlock();
    }
    function Rn() {
      de.current = null, _(Dn.current), Dn.current = null;
    }
    function Or(p) {
      B(p);
    }
    function Ht(p, w = "campaign") {
      de.current = null, y(p), m(p.chapter), M({}), c(w), _("prep"), Rr(null);
    }
    function qr(p) {
      let I = [...p.id === 1 ? ug : []];
      s.current.tutorials.includes(`chapter-${p.chapter}`) || I.push({ id: `chapter-${p.chapter}`, title: Ve[p.chapter - 1].mechanic, text: Ve[p.chapter - 1].tip });
      for (let G of p.goals) s.current.tutorials.includes(`goal-${G.kind}`) || I.push({ id: `goal-${G.kind}`, title: gn[G.kind], text: G.kind === "switch" ? "D\xF9ng v\u1EE5 n\u1ED5 k\xEDch ho\u1EA1t c\xF4ng t\u1EAFc theo th\u1EE9 t\u1EF1 s\u1ED1 \u0111ang hi\u1EC3n th\u1ECB. C\u1ED5ng ch\u1EC9 m\u1EDF khi m\u1ECDi target \u0111\u1EC1u \u0111\u1EA1t." : G.kind === "rescue" ? "Ph\xE1 l\u1ED3ng \u0111\u1EC3 c\u1EE9u b\u1EA1n b\xE8. N\u1ED5 tr\xFAng ng\u01B0\u1EDDi \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EE9u l\xE0m m\u1EA5t \u0111i\u1EC1u ki\u1EC7n kh\xF4ng b\u1ECB th\u01B0\u01A1ng." : G.kind === "survive" ? "Gi\u1EEF Pip s\u1ED1ng \u0111\u1EE7 th\u1EDDi gian target, sau \u0111\xF3 t\xECm v\xE0 b\u01B0\u1EDBc v\xE0o c\u1ED5ng." : G.kind === "collect" ? "Tinh th\u1EC3 n\u1EB1m trong t\u01B0\u1EDDng. Ph\xE1 t\u01B0\u1EDDng r\u1ED3i b\u01B0\u1EDBc t\u1EDBi \u0111\u1EC3 nh\u1EB7t, ph\xE1 t\u01B0\u1EDDng th\xF4i ch\u01B0a \u0111\u01B0\u1EE3c t\xEDnh." : G.kind === "boss" ? `Ch\u1EDD boss th\u1EF1c hi\u1EC7n chi\xEAu v\xE0 l\u1ED9 \u0111i\u1EC3m y\u1EBFu. ${oa[p.chapter - 1].weak_point}. Chi\xEAu lu\xF4n c\xF3 v\xF9ng c\u1EA3nh b\xE1o tr\u01B0\u1EDBc.` : "Xem thanh m\u1EE5c ti\xEAu ph\xEDa tr\xEAn b\xE0n ch\u01A1i. M\u1ED7i lo\u1EA1i m\u1EE5c ti\xEAu ch\u1EC9 \u0111\u01B0\u1EE3c t\xEDnh khi ho\xE0n th\xE0nh \u0111\xFAng y\xEAu c\u1EA7u." });
      return I.filter((G) => !s.current.tutorials.includes(G.id));
    }
    function cg() {
      let p = JSON.parse(JSON.stringify(s.current)), w = g === "endless" ? {} : { ...S }, I = g === "endless" || d.stage === 8 && ["radar", "treasure", "hammer"].includes(p.gift || "") ? null : p.gift;
      I && (I !== "clock" || d.seconds > 0) && Object.keys(w).filter((P) => w[P] > 0).length < 3 && (w[I] = Math.max(w[I] || 0, 1));
      let G = { ...w };
      if (I && G[I] && (G[I]--, p.gift = null), !$h(p, d.chapter, G, d.stage === 8)) {
        Or("Kh\xF4ng \u0111\u1EE7 Xu ho\u1EB7c qu\xE1 3 lo\u1EA1i h\u1ED7 tr\u1EE3.");
        return;
      }
      let $ = g === "daily" ? Number((/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replaceAll("-", "")) : crypto.getRandomValues(new Uint32Array(1))[0];
      i.current = Gh(d, $, p.stats, w, g, p.prefs.easy), g === "campaign" && p.reviveCoins > 0 && (i.current.reviveTokens = Math.max(i.current.reviveTokens, 1)), p.active = i.current, rl(p), u("play"), _(null), In("normal"), zs.current = 0, Bn.current = "", Os.current = "", An.current = 0, de.current = null, Ot.current.unlock();
      let Ut = `C${d.chapter}-OPEN`;
      if (d.stage === 1 && !p.stories.includes(Ut)) ul({ key: Ut, frame: 0, then: "start" });
      else {
        let P = qr(d);
        Sn(P.length ? P : null), Cn(0);
      }
      Rs((P) => P + 1);
    }
    function Hr() {
      if (ne) if (je((p) => {
        p.stories.includes(ne.key) || p.stories.push(ne.key);
      }), ul(null), ne.then === "start") {
        let p = qr(i.current.level);
        Sn(p.length ? p : null), Cn(0);
      } else ne.then === "map" && (u("map"), _(null));
    }
    function pg() {
      wa && (je((p) => {
        let w = wa[zt].id;
        p.tutorials.includes(w) || p.tutorials.push(w);
      }), zt + 1 < wa.length ? Cn(zt + 1) : (Sn(null), de.current = null));
    }
    let qs = (p) => {
      if (!(!qt() || !i.current)) {
        if (Ot.current.unlock(), p === "bomb") {
          let w = He.current.special;
          Ph(i.current, w) && w !== "normal" && i.current.player.special[w] === 0 && In("normal");
        } else Kh(i.current);
        Rs((w) => w + 1);
      }
    }, zn = (p) => {
      !qt() || !i.current || (de.current = p);
    };
    (0, z.useEffect)(() => {
      let p = setTimeout(() => B(""), 3800);
      return () => clearTimeout(p);
    }, [k]), (0, z.useEffect)(() => {
      let p = 0, w = performance.now(), I = 0, G = ($) => {
        let Ut = Math.min(50, $ - w);
        w = $;
        let P = i.current, bo = He.current;
        if (P) {
          if (!qt()) resetStick();
          if (qt()) {
            P.moveIntent=de.current, jh(P, Ut), Ot.current.music($, s.current.prefs.music && !bo.props.isMuted, P.level.chapter);
            let Hn = P.events.filter((ue) => ue.id > zs.current);
            for (let ue of Hn) s.current.prefs.sfx && !bo.props.isMuted && Ot.current.effect(ue.kind), ["pickup", "hit", "gatePenalty", "bossHit", "phase", "warning", "armor", "ice", "light"].includes(ue.kind) && B(ue.text), ue.kind === "explode" && s.current.prefs.haptics && navigator.vibrate?.(20);
            if (zs.current = Math.max(zs.current, ...P.events.map((ue) => ue.id)), P.status === "won" && !P.paid && Bn.current !== P.id) {
              Bn.current = P.id;
              let ue = JSON.parse(JSON.stringify(s.current)), Un = Wh(ue, P);
              ue.active = P, ue.lastResult = { id: P.id, reward: Un }, rl(ue), Rr(Un), _("result"), de.current = null, bo.props.onGameOver?.(P.score, { boom: 1, stars: Un.stars }), bo.props.bridge?.saveGameState({ boom: 1, run: P });
            }
            if (P.status === "lost" && Os.current !== P.id && (Os.current = P.id, je((ue) => {
              ue.failures[P.level.id] = (ue.failures[P.level.id] || 0) + 1, ue.failures[P.level.id] % 3 === 0 && (ue.gift = "shield"), ue.active = P;
            }), _("result"), de.current = null), $ - An.current > 1500) {
              An.current = $;
              let ue = { ...s.current, active: P };
              s.current = ue, Ir(ue, a), bo.props.bridge?.saveGameState({ boom: 1, run: P });
            }
          }
          Tn.current && dg.current.draw(Tn.current, P, s.current.prefs, s.current.equipped), $ - I > 120 && (I = $, Rs((Hn) => Hn + 1));
        }
        p = requestAnimationFrame(G);
      };
      return p = requestAnimationFrame(G), () => {
        cancelAnimationFrame(p), Ot.current.close();
      };
    }, []), (0, z.useEffect)(() => {
      let p = ($) => {
        if ($.target.matches("input,select,textarea")) return;
        let Ut = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
        Ut[$.key] ? ($.preventDefault(), zn(Ut[$.key])) : $.code === "Space" ? ($.preventDefault(), $.repeat || qs("bomb")) : $.key === "e" || $.key === "E" ? $.repeat || qs("skill") : $.key === "Escape" && (de.current = null, He.current.screen === "play" && !He.current.dialog && !He.current.lesson && !He.current.story ? _("pause") : He.current.dialog === "pause" && _(null));
      }, w = ($) => {
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes($.key) && (de.current = null);
      }, I = () => {resetStick();};
      window.addEventListener("keydown", p), window.addEventListener("keyup", w), window.addEventListener("blur", I), document.addEventListener("visibilitychange", I);
      let G = () => {
        i.current && (de.current = null, _("pause"));
      };
      return window.addEventListener("boom:restart", G), () => {
        window.removeEventListener("keydown", p), window.removeEventListener("keyup", w), window.removeEventListener("blur", I), document.removeEventListener("visibilitychange", I), window.removeEventListener("boom:restart", G);
      };
    }, []), (0, z.useEffect)(() => {
      e.isPaused && (de.current = null);
    }, [e.isPaused]);
    function resetStick() {
      go.current=null;de.current=null;
      if(Mn.current){Mn.current.style.setProperty('--stick-x','0px');Mn.current.style.setProperty('--stick-y','0px');Mn.current.dataset.active='false';}
    }
    function Ur(p) {
      if(go.current!==p.pointerId||!Mn.current)return;
      if(!qt()){resetStick();return;}
      p.preventDefault();
      const rect=Mn.current.getBoundingClientRect(),dx=p.clientX-rect.x-rect.width/2,dy=p.clientY-rect.y-rect.height/2;
      const length=Math.hypot(dx,dy),radius=rect.width*.31,scale=Math.min(1,radius/Math.max(1,length));
      Mn.current.style.setProperty('--stick-x',`${dx*scale}px`);Mn.current.style.setProperty('--stick-y',`${dy*scale}px`);Mn.current.dataset.active='true';
      de.current=length<rect.width*.075?null:Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';
    }
    function On() {
      de.current = null, zr(), u("map"), _(null);
    }
    function mg() {
      let p = i.current;
      if (p) if (je((w) => {
        w.active = null;
      }), e.bridge?.saveGameState(null), i.current = null, p.level.stage === 8) {
        m(Math.min(10, p.level.chapter + 1));
        let w = `C${p.level.chapter}-END`;
        ul({ key: p.level.chapter === 10 ? "C10-END-A" : w, frame: 0, then: "map" }), u("map"), _(null);
      } else p.level.stage === 6 && !l.stories.includes(`C${p.level.chapter}-MID`) ? (u("map"), _(null), ul({ key: `C${p.level.chapter}-MID`, frame: 0, then: "map" })) : p.mode === "endless" ? Ht({ ...va[p.level.id % 80], id: p.level.id + 1 }, "endless") : p.mode === "daily" ? (u("map"), _(null)) : Ht(va[Math.min(79, p.level.id)]);
    }
    let Er = () => {
      L && Ht(L.level, L.mode);
    };
    function hg() {
      if (!L) return;
      let p = !!L.boss && !L.boss.retryUsed;
      !p && s.current.reviveCoins <= 0 && !L.reviveTokens || (!p && s.current.reviveCoins > 0 && je((w) => w.reviveCoins--), Yh(L) && (Os.current = "", _(null), zr()));
    }
    let qn = (p, w) => je((I) => {
      I.prefs[p] = w;
    }), Nr = Object.values(l.stars).reduce((p, w) => p + w, 0), Gr = { prep: `M\xE0n ${d.chapter}-${d.stage}`, profile: "Profile c\u1EE7a Pip", wardrobe: "T\u1EE7 trang ph\u1EE5c", quests: "Nhi\u1EC7m v\u1EE5", codex: "S\u1ED5 s\u01B0u t\u1EA7m", settings: "C\xE0i \u0111\u1EB7t", pause: "T\u1EA1m d\u1EEBng", result: L?.status === "won" ? "C\u1ED5ng \u0111\xE3 m\u1EDF \xB7 M\xE0n ho\xE0n th\xE0nh!" : "Pip c\u1EA7n ngh\u1EC9 m\u1ED9t ch\xFAt", help: "C\xF9ng B\xF9m l\xE0m quen" }, et = (p, w, I) => (0, f.jsxs)("button", { className: "boom-primary", onClick: w, id: I, children: [p, (0, f.jsx)(sl, { size: 17 })] }), gg = (0, f.jsxs)("div", { className: "boom-currencies", children: [(0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "coin" }), l.coins.toLocaleString()] }), (0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "shard_sao" }), l.shards] }), (0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "gem_ngoc" }), l.gems] })] });
    return (0, f.jsxs)("div", { className: `boom-game ${n === "play" ? "boom-is-playing" : ""} ${l.prefs.colorblind ? "boom-colorblind" : ""}`, style: { "--boom-chapter": Ve[x - 1].color }, children: [a && (0, f.jsxs)("div", { className: "boom-review", children: [(0, f.jsx)("span", { children: "B\u1EA2N CH\u01A0I TH\u1EEC \xB7 Kh\xF4ng g\u1EEDi d\u1EEF li\u1EC7u l\xEAn server" }), (0, f.jsx)("button", { onClick: () => {
      let p = mo();
      p.coins = 5e3, p.shards = 50, p.gems = 300, p.reviveCoins = 10, rl(p), i.current = null, u("home"), _(null);
    }, children: "H\u1ED3 s\u01A1 test" })] }), (0, f.jsxs)("header", { className: "boom-header", children: [(0, f.jsxs)("button", { className: "boom-home-brand", "aria-label": "Trang ch\u1EE7 Boom Buddies", onClick: () => n === "play" ? _("pause") : u("home"), children: [(0, f.jsx)(me, { name: "bomb_0", size: 32 }), (0, f.jsxs)("span", { children: ["BOOM ", (0, f.jsx)("b", { children: "BUDDIES" })] })] }), gg, (0, f.jsx)("button", { className: "boom-icon", "aria-label": "C\xE0i \u0111\u1EB7t", onClick: () => _o("settings"), children: (0, f.jsx)(io, { size: 18 }) })] }), n === "home" && (0, f.jsxs)("main", { className: "boom-home", children: [(0, f.jsxs)("div", { className: "boom-home-eyebrow", children: [(0, f.jsx)("span", { className: "boom-dot" }), "PIXELIA \u0110ANG CH\u1EDC B\u1EA0N"] }), (0, f.jsxs)("div", { className: "boom-hero", children: [(0, f.jsx)("div", { className: "boom-hero-sun" }), (0, f.jsx)("div", { className: "boom-hero-tree one" }), (0, f.jsx)("div", { className: "boom-hero-tree two" }), (0, f.jsx)(Xx, {}), (0, f.jsxs)("div", { className: "boom-hero-characters", children: [(0, f.jsx)(Rt, { equipped: l.equipped, size: 125 }), (0, f.jsx)("img", { src: ve(Be("bum_front")), alt: "B\xF9m" })] }), (0, f.jsx)("span", { className: "boom-hero-ground" })] }), (0, f.jsxs)("div", { className: "boom-home-copy", children: [(0, f.jsxs)("h1", { children: ["M\u1ED9t qu\u1EA3 bom nh\u1ECF.", (0, f.jsx)("br", {}), "M\u1ED9t h\xE0nh tr\xECnh l\u1EDBn."] }), (0, f.jsxs)("p", { children: ["C\xF9ng ", l.name, " v\xE0 B\xF9m th\u1EAFp l\u1EA1i 10 L\xF5i S\xE1ng,", (0, f.jsx)("br", {}), "mang m\xE0u s\u1EAFc v\u1EC1 v\u1EDBi Pixelia."] })] }), (0, f.jsxs)("div", { className: "boom-home-actions", children: [et(l.active?.status === "playing" ? "Ti\u1EBFp t\u1EE5c h\xE0nh tr\xECnh" : "B\u1EAFt \u0111\u1EA7u h\xE0nh tr\xECnh", () => {
      l.active?.status === "playing" ? (i.current = l.active, u("play"), _("pause")) : Ht(va.find((p) => yn(l, p.id, a) && !l.stars[p.id]) || va[79]);
    }, "boom-continue"), (0, f.jsxs)("button", { className: "boom-secondary", onClick: () => u("map"), children: [(0, f.jsx)(Ss, { size: 17 }), "Ch\u1ECDn ch\u01B0\u01A1ng"] }), (0, f.jsxs)("div", { className: "boom-bonus-modes", children: [(0, f.jsxs)("button", { onClick: () => {
      let p = Number((/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replaceAll("-", ""));
      Ht(va[p % 7], "daily");
    }, children: [(0, f.jsx)(me, { name: "clock" }), "Th\u1EED th\xE1ch ng\xE0y"] }), (0, f.jsxs)("button", { disabled: !a && !l.cores.includes(10), onClick: () => Ht({ ...va[0], id: l.bestFloor + 1, name: `H\u1EA7m V\xF4 T\u1EADn \xB7 T\u1EA7ng ${l.bestFloor + 1}`, enemies: 4, goals: [{ kind: "kill", target: 4 }], seconds: 180 }, "endless"), children: [(0, f.jsx)(me, { name: "core_orb" }), "H\u1EA7m V\xF4 T\u1EADn ", !a && !l.cores.includes(10) && (0, f.jsx)(nl, { size: 13 })] })] })] }), (0, f.jsx)("nav", { className: "boom-bottom-nav", children: [["profile", no, "Pip"], ["quests", so, "Nhi\u1EC7m v\u1EE5"], ["codex", ws, "S\u01B0u t\u1EA7m"], ["settings", io, "C\xE0i \u0111\u1EB7t"]].map(([p, w, I]) => (0, f.jsxs)("button", { onClick: () => _o(p), children: [(0, f.jsx)(w, { size: 20 }), (0, f.jsx)("span", { children: I })] }, p)) })] }), n === "map" && (0, f.jsxs)("main", { className: "boom-map", children: [(0, f.jsxs)("div", { className: "boom-page-heading", children: [(0, f.jsx)("button", { className: "boom-icon", "aria-label": "V\u1EC1 trang ch\u1EE7", onClick: () => u("home"), children: (0, f.jsx)(oo, { size: 18 }) }), (0, f.jsxs)("div", { children: [(0, f.jsx)("small", { children: "H\xC0NH TR\xCCNH PIXELIA" }), (0, f.jsx)("h1", { children: "10 v\xF9ng \u0111\u1EA5t, m\u1ED9t l\u1EDDi h\u1EE9a." })] }), (0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "core_orb" }), l.cores.length, "/10"] })] }), (0, f.jsx)("div", { className: "boom-chapter-tabs", children: Ve.map((p, w) => (0, f.jsxs)("button", { "aria-label": `Ch\u01B0\u01A1ng ${w + 1}`, "aria-pressed": x === w + 1, disabled: !a && w > 0 && !l.cores.includes(w), onClick: () => m(w + 1), children: [w + 1, l.cores.includes(w + 1) && (0, f.jsx)(il, { size: 11 })] }, p.name)) }), (0, f.jsxs)("div", { className: "boom-region", children: [(0, f.jsxs)("div", { className: "boom-region-art", style: { backgroundImage: `url(${ve(Dt(x, "floor_a"))})` }, children: [(0, f.jsx)(Rt, { equipped: l.equipped, size: 75 }), (0, f.jsx)("img", { src: ve("art-v3/icons/bosses/"+oa[x-1].id+".webp"), alt: oa[x - 1].name_vi })] }), (0, f.jsxs)("div", { children: [(0, f.jsxs)("small", { children: ["CH\u01AF\u01A0NG ", x] }), (0, f.jsx)("h2", { children: Ve[x - 1].name }), (0, f.jsx)("p", { children: Ve[x - 1].mechanic })] })] }), (0, f.jsx)("div", { className: "boom-level-nodes", children: va.filter((p) => p.chapter === x).map((p) => (0, f.jsxs)("button", { className: `boom-level ${p.stage === 8 ? "boss" : ""} ${l.stars[p.id] ? "cleared" : ""}`, disabled: !yn(l, p.id, a), onClick: () => Ht(p), "aria-label": `M\xE0n ${p.chapter}-${p.stage}: ${p.name}`, children: [(0, f.jsx)("span", { children: p.stage === 8 ? (0, f.jsx)(me, { name: "core_orb", size: 28 }) : p.stage }), (0, f.jsx)("b", { children: p.stage === 8 ? "BOSS" : p.name }), (0, f.jsx)("small", { children: yn(l, p.id, a) ? "\u2605".repeat(l.stars[p.id] || 0) + "\u2606".repeat(3 - (l.stars[p.id] || 0)) : (0, f.jsx)(nl, { size: 14 }) })] }, p.id)) }), (0, f.jsx)("p", { className: "boom-map-hint", children: "Qua boss \u0111\u1EC3 m\u1EDF v\xF9ng ti\u1EBFp theo \xB7 Kh\xF4ng kh\xF3a ch\u01B0\u01A1ng b\u1EB1ng sao" }), (0, f.jsxs)("button", { className: "boom-secondary", onClick: () => _o("profile"), children: [(0, f.jsx)(no, { size: 18 }), l.name, " \xB7 Power ", Tr(l), " \xB7 ", Nr, " sao"] })] }), n === "play" && L && (0, f.jsxs)("main", { className: "boom-play", children: [(0, f.jsxs)("section", { className: "boom-hud", children: [(0, f.jsxs)("div", { className: "boom-hud-top", children: [(0, f.jsx)("div", { className: "boom-hearts", "aria-label": `${L.player.hp}/${L.player.maxHp} tim`, children: Array.from({ length: L.player.maxHp }, (p, w) => (0, f.jsx)(me, { name: w < L.player.hp ? "heart_full" : "heart_empty", size: 19 }, w)) }), (0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "clock", size: 17 }), Br(L.limit ? Math.max(0, L.limit - L.time) : L.time)] }), (0, f.jsx)("button", { className: "boom-icon", "aria-label": "T\u1EA1m d\u1EEBng", onClick: () => _("pause"), children: (0, f.jsx)(Cs, { size: 16 }) })] }), (0, f.jsxs)("div", { className: "boom-stage-label", children: [L.level.chapter, "-", L.level.stage, " \xB7 ", L.level.name] }), L.boss && (0, f.jsxs)("div", { className: "boom-boss-hud", children: [(0, f.jsx)("img", { src: ve("art-v3/icons/bosses/"+oa[L.level.chapter-1].id+".webp"), alt: "" }), (0, f.jsxs)("div", { children: [(0, f.jsxs)("b", { children: [oa[L.level.chapter - 1].name_vi, (0, f.jsxs)("small", { children: ["Giai \u0111o\u1EA1n ", L.boss.phase, "/3"] })] }), (0, f.jsx)("progress", { max: L.boss.maxHp, value: L.boss.hp }), (0, f.jsxs)("span", { children: [L.boss.hp, "/", L.boss.maxHp, " hit \xB7 ", L.boss.weak > L.time && L.time >= L.boss.attackAt + (L.level.chapter === 10 ? 2000 : 1500) ? "\u0110i\u1EC3m y\u1EBFu \u0111ang m\u1EDF!" : oa[L.level.chapter - 1].weak_point] })] })] }), (0, f.jsx)("div", { className: "boom-targets", children: L.level.goals.map((p) => (0, f.jsxs)("span", { className: L.goals[p.kind] >= p.target ? "done" : "", children: [(0, f.jsx)("b", { children: gn[p.kind] }), " ", Math.min(p.target, L.goals[p.kind]), "/", p.target, L.goals[p.kind] >= p.target && (0, f.jsx)(il, { size: 12 })] }, p.kind)) }), (0, f.jsxs)("div", { className: "boom-powers", children: [(0, f.jsxs)("span", { children: ["\u{1F4A3} ", L.player.capacity] }), (0, f.jsxs)("span", { children: ["\u{1F525} ", L.player.range] }), (0, f.jsxs)("span", { children: ["\u{1F45F} ", L.player.boots] }), L.player.shield > L.time && (0, f.jsxs)("span", { children: ["Khi\xEAn ", Math.ceil((L.player.shield - L.time) / 1e3), "s"] }), L.radar > L.time && (0, f.jsxs)("span", { children: ["C\u1ED5ng: ", L.gate.x > L.player.x ? "\u2192" : "\u2190", " ", L.gate.y > L.player.y ? "\u2193" : "\u2191"] }), L.level.chapter === 6 && L.level.stage === 5 && (0, f.jsxs)("span", { children: ["Nhi\u1EC7t ", Math.round(L.temperature), "%"] })] })] }), (0, f.jsx)("div", { className: "boom-board-area", style: {"--board-ratio":L.level.width/L.level.height}, children: (0, f.jsxs)("div", { className: "boom-board-shell", children: [(0, f.jsx)("canvas", { ref: Tn, role: "img", "aria-label": "B\u1EA3n \u0111\u1ED3 Boom Buddies", style: { aspectRatio: `${L.level.width}/${L.level.height}` }, onPointerDown: (p) => {
      if (l.prefs.controls !== "tap" || !qt()) return;
      let w = p.currentTarget.getBoundingClientRect(), I = Math.floor((p.clientX - w.x) / w.width * L.level.width), G = Math.floor((p.clientY - w.y) / w.height * L.level.height);
      zn(Math.abs(I - L.player.x) > Math.abs(G - L.player.y) ? I > L.player.x ? "right" : "left" : G > L.player.y ? "down" : "up");
    }, onPointerUp: () => de.current = null, onPointerCancel: () => de.current = null }), L.status === "exiting" && (0, f.jsxs)("div", { className: "boom-exit-banner", children: [(0, f.jsx)(me, { name: "gate_open", size: 38 }), (0, f.jsx)("b", { children: "\u0110\xE3 ho\xE0n th\xE0nh m\u1EE5c ti\xEAu!" }), (0, f.jsx)("span", { children: "Pip \u0111ang b\u01B0\u1EDBc qua c\u1ED5ng\u2026" })] }), wa && (0, f.jsx)("div", { className: "boom-teaching", children: (0, f.jsxs)("section", { role: "dialog", "aria-modal": "true", "aria-label": "H\u01B0\u1EDBng d\u1EABn Boom Buddies", children: [(0, f.jsx)("img", { src: ve(Be("bum_front")), alt: "B\xF9m" }), (0, f.jsxs)("small", { children: [zt + 1, "/", wa.length, " \xB7 C\xD9NG B\xD9M L\xC0M QUEN"] }), (0, f.jsx)("h2", { children: wa[zt].title }), (0, f.jsx)("p", { children: wa[zt].text }), (0, f.jsxs)("button", { className: "boom-primary", onClick: pg, autoFocus: true, children: [zt + 1 < wa.length ? "Ti\u1EBFp theo" : "M\xECnh hi\u1EC3u r\u1ED3i \xB7 B\u1EAFt \u0111\u1EA7u", (0, f.jsx)(sl, { size: 16 })] })] }) })] }) }), (0, f.jsxs)("div", { className: `boom-controls ${l.prefs.leftHand ? "left-hand" : ""}`, style: { "--control-scale": l.prefs.buttonSize }, children: [(0, f.jsxs)("button", { className: "boom-skill", disabled: !qt() || !L.player.remote && !L.player.glove && !L.hammer, "aria-label": "D\xF9ng k\u1EF9 n\u0103ng", onPointerDown: (p) => {p.preventDefault();qs("skill");}, onClick: (p) => {if(p.detail===0)qs("skill");}, children: [(0, f.jsx)(me, { name: L.player.remote ? "item_remote" : L.player.glove ? "item_glove" : "btn_item", size: 27 }), (0, f.jsxs)("small", { children: [L.player.remote ? "N\u1ED5 ngay" : L.player.glove ? "N\xE9m bom" : "K\u1EF9 n\u0103ng", " \xB7 E"] })] }), (0, f.jsxs)("div", { className: "boom-joystick", ref: Mn, role: "group", "aria-label": "Joystick di chuy\u1EC3n", onPointerDown: (p) => {
      if(qt() && go.current===null){p.preventDefault();go.current=p.pointerId;p.currentTarget.setPointerCapture(p.pointerId);Ur(p);}
    }, onPointerMove: Ur, onPointerUp: (p) => {
      if(go.current===p.pointerId)resetStick();
    }, onPointerCancel: (p) => {if(go.current===p.pointerId)resetStick();}, onLostPointerCapture: (p) => {if(go.current===p.pointerId)resetStick();}, onContextMenu: (p) => p.preventDefault(), children: [(0, f.jsx)("span", { className: "boom-joystick-knob" }), (0, f.jsx)(vs, { className: "up", size: 15 }), (0, f.jsx)(Ls, { className: "down", size: 15 }), (0, f.jsx)(oo, { className: "left", size: 15 }), (0, f.jsx)(sl, { className: "right", size: 15 })] }), (0, f.jsxs)("button", { className: "boom-bomb-button", id: "boom-bomb", disabled: !qt() || L.bombs.filter((p) => p.owner === "pip").length >= Math.min(6, L.player.capacity) || L.bombs.some((p) => p.x === L.player.x && p.y === L.player.y), onPointerDown: (p) => {p.preventDefault();qs("bomb");}, onClick: (p) => {if(p.detail===0)qs("bomb");}, children: [(0, f.jsx)(me, { name: "bomb_0", size: 33 }), (0, f.jsx)("b", { children: "TH\u1EA2 BOM" }), (0, f.jsx)("small", { children: "SPACE" })] })] }), Object.values(L.player.special).some((p) => p > 0) && (0, f.jsx)("div", { className: "boom-special-picker", children: ["normal", "fire", "ice", "blackhole", "light"].filter((p) => p === "normal" || L.player.special[p] > 0).map((p) => (0, f.jsx)("button", { "aria-pressed": kn === p, onClick: () => In(p), children: p === "normal" ? "Bom th\u01B0\u1EDDng" : p === "fire" ? `L\u1EEDa ${L.player.special.fire}` : p === "ice" ? `B\u0103ng ${L.player.special.ice}` : p === "blackhole" ? `H\u1ED1 \u0111en ${L.player.special.blackhole}` : `\xC1nh s\xE1ng ${L.player.special.light}` }, p)) }), (0, f.jsx)("div", { className: "boom-gate-note", children: L.status === "exiting" ? "\u0110ang ho\xE0n t\u1EA5t di\u1EC5n ho\u1EA1t\u2026" : kr(L) ? "Target \u0111\xE3 \u0111\u1EE7 \xB7 T\xECm c\u1ED5ng v\xE0 b\u01B0\u1EDBc v\xE0o!" : L.gate.revealed ? "C\u1ED5ng \u0111\xE3 l\u1ED9 \xB7 Ho\xE0n th\xE0nh target c\xF2n l\u1EA1i" : "Ph\xE1 t\u01B0\u1EDDng \u0111\u1EC3 t\xECm c\u1ED5ng \u1EA9n" })] }), r && (0, f.jsx)("div", { className: "boom-shade", children: (0, f.jsxs)("section", { role: "dialog", "aria-modal": "true", "aria-label": Gr[r], className: `boom-modal boom-${r}`, children: [(0, f.jsxs)("header", { children: [(0, f.jsxs)("div", { children: [(0, f.jsx)("small", { children: "BOOM BUDDIES" }), (0, f.jsx)("h2", { children: Gr[r] })] }), (0, f.jsx)("button", { className: "boom-icon", "aria-label": "\u0110\xF3ng", onClick: () => {
      r === "result" ? On() : r === "pause" ? _(null) : r === "prep" ? (_(null), n === "play" && L?.status === "lost" && _("result")) : Rn();
    }, children: (0, f.jsx)(Is, { size: 18 }) })] }), (0, f.jsxs)("div", { className: "boom-modal-body", children: [r === "prep" && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsxs)("div", { className: "boom-prep-summary", children: [(0, f.jsx)(Rt, { equipped: l.equipped, size: 54 }), (0, f.jsxs)("div", { children: [(0, f.jsx)("small", { children: Ve[d.chapter - 1].name }), (0, f.jsx)("h3", { children: d.name }), (0, f.jsxs)("p", { children: [d.targetText, " \xB7 ", d.seconds ? `${d.seconds}s` : "Kh\xF4ng gi\u1EDBi h\u1EA1n gi\u1EDD", " \xB7 ", d.width, "\xD7", d.height] })] })] }), (0, f.jsxs)("div", { className: "boom-prep-enemies", children: [(0, f.jsx)("span", { children: "K\u1EBB th\xF9" }), d.stage === 8 ? (0, f.jsx)("img", { src: ve("art-v3/icons/bosses/"+oa[d.chapter-1].id+".webp"), alt: "" }) : Ve[d.chapter - 1].enemies.map((p) => (0, f.jsx)("img", { src: ve(Be(p)), alt: "" }, p)), (0, f.jsx)("small", { children: d.enemyText })] }), (0, f.jsx)("p", { className: "boom-prep-tip", children: d.stage === 8 ? oa[d.chapter - 1].weak_point : Ve[d.chapter - 1].tip }), (0, f.jsxs)("div", { className: "boom-prep-section-title", children: [(0, f.jsx)("b", { children: "L\u1EC1u Nh\xEDm K\u1EBDm" }), (0, f.jsxs)("span", { children: [Object.values(S).filter((p) => p > 0).length, "/3 lo\u1EA1i"] })] }), (0, f.jsx)("div", { className: `boom-booster-grid ${g === "endless" ? "boom-endless-shop" : ""}`, children: uo.filter((p) => (d.seconds > 0 || p.id !== "clock") && (d.stage !== 8 || !["radar", "treasure", "hammer"].includes(p.id))).map((p) => {
      let w = S[p.id] || 0;
      return (0, f.jsxs)("div", { className: w ? "selected" : "", children: [(0, f.jsx)(me, { name: p.icon, size: 26 }), (0, f.jsxs)("div", { children: [(0, f.jsx)("b", { children: p.name }), (0, f.jsxs)("small", { children: [Ts(p.id, d.chapter), " Xu"] })] }), (0, f.jsx)("button", { "aria-label": `B\u1EDBt ${p.name}`, disabled: !w, onClick: () => M((I) => ({ ...I, [p.id]: w - 1 })), children: "\u2212" }), (0, f.jsx)("strong", { children: w }), (0, f.jsx)("button", { "aria-label": `Th\xEAm ${p.name}`, disabled: w >= p.max || !w && Object.values(S).filter((I) => I > 0).length >= 3, onClick: () => M((I) => ({ ...I, [p.id]: w + 1 })), children: "+" })] }, p.id);
    }) }), l.gift && (0, f.jsxs)("p", { className: "boom-free-gift", children: [(0, f.jsx)(so, { size: 15 }), "Qu\xE0 mi\u1EC5n ph\xED: ", uo.find((p) => p.id === l.gift)?.name, " \xB7 t\u1EF1 th\xEAm n\u1EBFu c\xF2n slot"] }), g === "endless" && (0, f.jsx)("p", { className: "boom-note", children: "H\u1EA7m V\xF4 T\u1EADn ch\u1EC9 mang ch\u1EC9 s\u1ED1 Profile, kh\xF4ng d\xF9ng booster." }), (0, f.jsxs)("div", { className: "boom-prep-total", children: [(0, f.jsx)("span", { children: "Ch\u1EC9 ti\xEAu hao khi b\u1EAFt \u0111\u1EA7u m\xE0n" }), (0, f.jsxs)("b", { children: [Object.entries(S).reduce((p, [w, I]) => p + Ts(w, d.chapter) * (I || 0), 0), " Xu"] })] })] }), r === "profile" && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsxs)("div", { className: "boom-profile-hero", children: [(0, f.jsx)(Rt, { equipped: l.equipped, size: 88 }), (0, f.jsxs)("div", { children: [(0, f.jsxs)("label", { children: ["T\xEAn nh\xE2n v\u1EADt", (0, f.jsx)("input", { maxLength: 24, value: l.name, onChange: (p) => je((w) => w.name = p.target.value), "aria-label": "T\xEAn Pip" })] }), (0, f.jsxs)("b", { children: ["Power ", Tr(l), " / 138"] }), (0, f.jsxs)("p", { children: [Nr, " sao \xB7 ", l.cores.length, " L\xF5i S\xE1ng"] }), (0, f.jsxs)("button", { className: "boom-secondary", onClick: () => _o("wardrobe"), children: [(0, f.jsx)(ks, { size: 16 }), "Trang ph\u1EE5c"] })] })] }), (0, f.jsx)("div", { className: "boom-stat-list", children: Object.entries(fo).map(([p, w]) => {
      let I = l.stats[p], G = I === w.cost.length;
      return (0, f.jsxs)("div", { children: [(0, f.jsxs)("span", { children: [(0, f.jsx)("b", { children: w.name }), (0, f.jsxs)("small", { children: [I, "/", w.cost.length] })] }), (0, f.jsx)("button", { disabled: G || l.coins < w.cost[I] || l.shards < w.shards[I], onClick: () => je(($) => {
        Zh($, p);
      }), children: G ? "T\u1ED1i \u0111a" : `${w.cost[I]} Xu${w.shards[I] ? ` \xB7 ${w.shards[I]} Sao` : ""}` })] }, p);
    }) }), (0, f.jsx)("p", { className: "boom-note", children: "N\xE2ng ch\u1EC9 s\u1ED1 b\u1EB1ng t\xE0i nguy\xEAn ki\u1EBFm \u0111\u01B0\u1EE3c. Trang ph\u1EE5c v\xE0 pet ch\u1EC9 l\xE0m \u0111\u1EB9p." }), (0, f.jsx)("button", { className: "boom-secondary", onClick: () => q("stats"), children: "\u0110\u1EB7t l\u1EA1i ch\u1EC9 s\u1ED1 \xB7 ho\xE0n 80% Xu, 100% Sao" })] }), r === "wardrobe" && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsxs)("div", { className: "boom-wardrobe-preview", children: [(0, f.jsx)(Rt, { equipped: l.equipped, size: 70 }), (0, f.jsxs)("div", { children: [(0, f.jsx)("h3", { children: l.name }), (0, f.jsx)("p", { children: "Trang ph\u1EE5c kh\xF4ng \u1EA3nh h\u01B0\u1EDFng s\u1EE9c m\u1EA1nh." }), (0, f.jsx)("button", { className: "boom-secondary", onClick: () => je((p) => {
      delete p.equipped[h];
    }), children: "B\u1ECF m\u1EB7c slot n\xE0y" })] })] }), (0, f.jsx)("div", { className: "boom-slot-tabs", children: Object.entries(Fx).map(([p, w]) => (0, f.jsx)("button", { "aria-pressed": h === p, onClick: () => b(p), children: w }, p)) }), (0, f.jsx)("div", { className: "boom-cosmetic-grid", children: ga.filter((p) => p.slot === h).map((p) => {
      let w = l.owned.includes(p.id), I = Mr(p.id);
      return (0, f.jsxs)("button", { "aria-pressed": l.equipped[h] === p.id, className: w ? "owned" : "", onClick: () => je((G) => {
        w || eg(G, p.id) ? G.equipped[h] = p.id : Or(I.boss ? "Nh\u1EADn khi h\u1EA1 boss ch\u01B0\u01A1ng t\u01B0\u01A1ng \u1EE9ng." : "Ch\u01B0a \u0111\u1EE7 t\xE0i nguy\xEAn \u0111\u1EC3 nh\u1EADn m\xF3n n\xE0y.");
      }), children: [(0, f.jsx)("img", { src: ve("cosmetic/" + (p.icon || ("file" in p ? p.file : ""))), alt: "" }), (0, f.jsx)("b", { children: p.vi }), (0, f.jsx)("small", { children: l.equipped[h] === p.id ? "\u0110ang m\u1EB7c" : w ? "M\u1EB7c" : I.boss ? "Th\u01B0\u1EDFng boss" : I.coins ? `${I.coins} Xu` : `${I.gems} Ng\u1ECDc` })] }, p.id);
    }) })] }), r === "quests" && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsxs)("div", { className: "boom-gift-card", children: [(0, f.jsx)(me, { name: "gift", size: 45 }), (0, f.jsxs)("div", { children: [(0, f.jsx)("h3", { children: "Qu\xE0 c\u1EE7a B\xF9m m\u1ED7i ng\xE0y" }), (0, f.jsx)("p", { children: "1 booster mi\u1EC5n ph\xED, kh\xF4ng qu\u1EA3ng c\xE1o." })] }), (0, f.jsx)("button", { className: "boom-secondary", disabled: l.giftDay === (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), onClick: () => je((p) => {
      ag(p);
    }), children: "Nh\u1EADn" })] }), [{ id: "walls", name: "M\u1EDF l\u1ED1i cho Pixelia", target: 30, n: l.quests.walls }, { id: "chain", name: "Ba bom, m\u1ED9t ti\u1EBFng b\xF9m", target: 1, n: l.quests.chain }, { id: "wins", name: "Ng\u01B0\u1EDDi b\u1EA1n d\u0169ng c\u1EA3m", target: 10, n: l.quests.wins }].map((p) => (0, f.jsxs)("div", { className: "boom-quest", children: [(0, f.jsx)("h3", { children: p.name }), (0, f.jsx)("progress", { max: p.target, value: p.n }), (0, f.jsxs)("span", { children: [Math.min(p.n, p.target), "/", p.target, " \xB7 40 Xu"] }), (0, f.jsx)("button", { disabled: p.n < p.target || l.quests.claimed.includes(p.id), onClick: () => je((w) => {
      !w.quests.claimed.includes(p.id) && p.n >= p.target && (w.quests.claimed.push(p.id), w.coins += 40);
    }), children: l.quests.claimed.includes(p.id) ? "\u0110\xE3 nh\u1EADn" : "Nh\u1EADn" })] }, p.id)), (0, f.jsx)("p", { className: "boom-note", children: "Thua li\xEAn ti\u1EBFp 3 l\u1EA7n \u1EDF c\xF9ng m\xE0n: t\u1EB7ng Khi\xEAn Kh\u1EDFi \u0110\u1EA7u. G\u1EE3i \xFD kh\xF4ng l\xE0m m\u1EA5t sao." })] }), r === "codex" && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsx)("div", { className: "boom-slot-tabs", children: ["enemies", "boss", "stories"].map((p) => (0, f.jsx)("button", { "aria-pressed": C === p, onClick: () => O(p), children: p === "enemies" ? "K\u1EBB th\xF9" : p === "boss" ? "10 Boss" : "Truy\u1EC7n" }, p)) }), C === "boss" ? (0, f.jsx)("div", { className: "boom-codex-grid", children: oa.map((p) => (0, f.jsxs)("article", { children: [(0, f.jsx)("img", { src: ve("boss/" + p.icon), alt: "" }), (0, f.jsx)("b", { children: p.name_vi }), (0, f.jsxs)("small", { children: [p.hp_hits, " hit \xB7 3 giai \u0111o\u1EA1n"] }), (0, f.jsx)("p", { children: p.weak_point })] }, p.id)) }) : C === "stories" ? (0, f.jsx)("div", { className: "boom-story-list", children: Object.keys(ho).map((p) => (0, f.jsxs)("button", { disabled: !a && !l.stories.includes(p), onClick: () => {
      _(null), ul({ key: p, frame: 0, then: "none" });
    }, children: [p.replace("C", "Ch\u01B0\u01A1ng ").replace("-OPEN", " \xB7 M\u1EDF \u0111\u1EA7u").replace("-MID", " \xB7 Gi\u1EEFa ch\u01B0\u01A1ng").replace("-END", " \xB7 K\u1EBFt ch\u01B0\u01A1ng"), !a && !l.stories.includes(p) && (0, f.jsx)(nl, { size: 13 })] }, p)) }) : (0, f.jsx)("div", { className: "boom-codex-grid", children: Ve.flatMap((p, w) => p.enemies.map((I) => (0, f.jsxs)("article", { children: [(0, f.jsx)("img", { src: ve(Be(I)), alt: "" }), (0, f.jsx)("b", { children: I.replace("enemy_", "").replaceAll("_", " ") }), (0, f.jsxs)("small", { children: ["Ch\u01B0\u01A1ng ", w + 1] }), (0, f.jsx)("p", { children: /golem|giap/.test(I) ? "Gi\xE1p: c\u1EA7n 2 v\u1EE5 n\u1ED5." : /doi|drone|buom/.test(I) ? "Bay qua t\u01B0\u1EDDng m\u1EC1m." : /rat|cap/.test(I) ? "Truy \u0111u\u1ED5i Pip \u1EDF g\u1EA7n." : "\u0110\u1ECDc h\u01B0\u1EDBng \u0111i \u0111\u1EC3 d\u1EE5 v\xE0o v\xF9ng n\u1ED5." })] }, I))) })] }), r === "settings" && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsx)("p", { className: "boom-note", children: "T\xF9y ch\u1EC9nh tr\u01B0\u1EDBc ho\u1EB7c trong v\xE1n. \u0110\u1ED3ng h\u1ED3 d\u1EEBng khi m\u1EDF popup." }), (0, f.jsxs)("div", { className: "boom-settings-list", children: [[["warning", "D\u1EF1 \u0111o\xE1n v\xF9ng n\u1ED5"], ["colorblind", "K\xFD hi\u1EC7u cho ng\u01B0\u1EDDi m\xF9 m\xE0u"], ["shake", "Rung m\xE0n h\xECnh khi n\u1ED5"], ["haptics", "Rung thi\u1EBFt b\u1ECB"], ["sfx", "\xC2m thanh"], ["music", "Nh\u1EA1c n\u1EC1n"], ["easy", "Ch\u1EBF \u0111\u1ED9 d\u1EC5 \xB7 kh\xF4ng m\u1EA5t sao"], ["leftHand", "Joystick b\xEAn ph\u1EA3i"]].map(([p, w]) => (0, f.jsxs)("label", { children: [(0, f.jsx)("span", { children: w }), (0, f.jsx)("input", { type: "checkbox", checked: !!l.prefs[p], onChange: (I) => qn(p, I.target.checked) })] }, p)), (0, f.jsxs)("label", { children: [(0, f.jsx)("span", { children: "C\u1EE1 n\xFAt \u0111i\u1EC1u khi\u1EC3n" }), (0, f.jsx)("input", { type: "range", min: ".8", max: "1.2", step: ".1", value: l.prefs.buttonSize, onChange: (p) => qn("buttonSize", Number(p.target.value)) })] }), (0, f.jsxs)("label", { children: [(0, f.jsx)("span", { children: "Di chuy\u1EC3n" }), (0, f.jsxs)("select", { value: l.prefs.controls, onChange: (p) => qn("controls", p.target.value), children: [(0, f.jsx)("option", { value: "joystick", children: "Joystick" }), (0, f.jsx)("option", { value: "tap", children: "Ch\u1EA1m theo \xF4" })] })] })] }), (0, f.jsx)("button", { className: "boom-secondary", onClick: () => q("reset"), children: "\u0110\u1EB7t l\u1EA1i to\xE0n b\u1ED9 ti\u1EBFn tr\xECnh" })] }), r === "pause" && L && (0, f.jsxs)("div", { className: "boom-pause-content", children: [(0, f.jsx)(Rt, { equipped: l.equipped, size: 95 }), (0, f.jsxs)("h3", { children: ["M\xE0n ", L.level.chapter, "-", L.level.stage, " \xB7 ", L.level.name] }), (0, f.jsx)("p", { children: "Th\u1EDDi gian d\u1EEBng l\u1EA1i. Item \u0111ang d\xF9ng \u0111\u01B0\u1EE3c gi\u1EEF nguy\xEAn." }), et("Ti\u1EBFp t\u1EE5c", () => {
      _(null), Ot.current.unlock();
    }), (0, f.jsx)("button", { className: "boom-secondary", onClick: () => q("restart"), children: "Ch\u01A1i l\u1EA1i m\xE0n" }), (0, f.jsx)("button", { className: "boom-secondary", onClick: () => _o("settings"), children: "C\xE0i \u0111\u1EB7t" }), (0, f.jsx)("button", { className: "boom-secondary", onClick: () => q("quit"), children: "V\u1EC1 b\u1EA3n \u0111\u1ED3" })] }), r === "result" && L && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsxs)("div", { className: "boom-result-hero", children: [(0, f.jsx)(me, { name: L.status === "won" ? "gate_open" : "heart_empty", size: 64 }), (0, f.jsx)("h3", { children: L.status === "won" ? L.level.stage === 8 ? `L\xF5i S\xE1ng ${L.level.chapter}/10 \u0111\xE3 tr\u1EDF v\u1EC1!` : "Pip \u0111\xE3 t\xECm \u0111\u01B0\u1EE3c l\u1ED1i \u0111i!" : L.reason }), (0, f.jsx)("div", { className: "boom-stars", children: L.status === "won" ? "\u2605".repeat(fl?.stars || po(L)) + "\u2606".repeat(3 - (fl?.stars || po(L))) : "B\u1EA1n lu\xF4n c\xF3 th\u1EC3 th\u1EED l\u1EA1i." }), (0, f.jsxs)("p", { children: [L.level.chapter, "-", L.level.stage, " \xB7 ", L.level.name, " \xB7 ", Br(L.time)] })] }), (0, f.jsx)("div", { className: "boom-result-targets", children: L.level.goals.map((p) => (0, f.jsxs)("div", { children: [(0, f.jsxs)("span", { children: [gn[p.kind], " ", Math.min(p.target, L.goals[p.kind]), "/", p.target] }), L.goals[p.kind] >= p.target ? (0, f.jsx)(il, { size: 17 }) : (0, f.jsx)("span", { children: "Ch\u01B0a \u0111\u1EA1t" })] }, p.kind)) }), L.status === "won" ? (0, f.jsxs)(f.Fragment, { children: [(0, f.jsxs)("div", { className: "boom-rewards", children: [(0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "coin", size: 25 }), "+", fl?.coins || 0, " Xu"] }), (0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "shard_sao", size: 25 }), "+", fl?.shards || 0, " Sao"] }), !!fl?.gems && (0, f.jsxs)("span", { children: [(0, f.jsx)(me, { name: "gem_ngoc", size: 25 }), "+", fl.gems, " Ng\u1ECDc"] })] }), (0, f.jsxs)("p", { className: "boom-note", children: [L.damage === 0 ? "\u2713 Kh\xF4ng m\u1EA5t tim" : "Ch\u01A1i l\u1EA1i v\xE0 gi\u1EEF \u0111\u1EE7 tim \u0111\u1EC3 th\xEAm sao", " \xB7 ", L.time < L.level.fast * 1e3 ? "\u2713 Ho\xE0n th\xE0nh nhanh" : `M\u1ED1c nhanh: ${Br(L.level.fast * 1e3)}`] }), L.level.stage === 8 && (0, f.jsx)("p", { className: "boom-free-gift", children: "M\u1EDF ch\u01B0\u01A1ng ti\u1EBFp theo \xB7 Nh\u1EADn m\u0169 boss v\xE0 pet \xB7 Kh\xF4ng c\u1EA7n ti\xEAu sao." })] }) : (0, f.jsxs)(f.Fragment, { children: [(0, f.jsx)("p", { className: "boom-note", children: l.failures[L.level.id] >= 2 ? `B\xF9m g\u1EE3i \xFD: c\u1ED5ng n\u1EB1m v\u1EC1 ph\xEDa ${L.gate.x > L.player.x ? "ph\u1EA3i" : "tr\xE1i"}. ${Ve[L.level.chapter - 1].tip}` : "D\xF9ng c\u1ED9t \u0111\xE1 \u0111\u1EC3 tr\xE1nh v\u1EE5 n\u1ED5 v\xE0 ch\u1EDD th\u1EDDi \u0111i\u1EC3m k\u1EBB th\xF9 \u0111i qua." }), (!L.revived || !!L.boss && !L.boss.retryUsed) && (0, f.jsx)("button", { className: "boom-secondary", onClick: hg, disabled: !L.boss && !l.reviveCoins && !L.reviveTokens, children: L.boss && !L.boss.retryUsed ? "Th\u1EED l\u1EA1i t\u1EEB giai \u0111o\u1EA1n n\xE0y \xB7 mi\u1EC5n ph\xED" : "H\u1ED3i sinh \xB7 1 Xu H\u1ED3i Sinh" })] })] }), r === "help" && (0, f.jsxs)(f.Fragment, { children: [(0, f.jsx)(Rt, { size: 90 }), (0, f.jsx)("h3", { children: "Th\u1EA3 bom. T\xECm ch\u1ED7 tr\xFA. C\u1EE9u Pixelia." }), ug.map((p) => (0, f.jsxs)("p", { children: [(0, f.jsx)("b", { children: p.title }), (0, f.jsx)("br", {}), p.text] }, p.id))] })] }), (0, f.jsx)("footer", { children: r === "prep" ? et("B\u1EAFt \u0111\u1EA7u", cg, "boom-start") : r === "result" ? (0, f.jsxs)(f.Fragment, { children: [L?.status === "won" ? et(L.level.stage === 8 ? "Ti\u1EBFp t\u1EE5c c\xE2u chuy\u1EC7n" : "M\xE0n ti\u1EBFp theo", mg, "boom-next") : et("Th\u1EED l\u1EA1i", Er, "boom-retry"), (0, f.jsx)("button", { className: "boom-secondary", onClick: On, children: "V\u1EC1 b\u1EA3n \u0111\u1ED3" })] }) : r === "profile" ? et("Xong", Rn) : r === "pause" ? null : et("Xong", Rn) })] }) }), ne && (0, f.jsxs)("div", { className: "boom-story", role: "dialog", "aria-modal": "true", "aria-label": "C\xE2u chuy\u1EC7n Pixelia", children: [(0, f.jsxs)("header", { children: [(0, f.jsx)("span", { children: ne.key.replace("C", "CH\u01AF\u01A0NG ").replace("-OPEN", " \xB7 M\u1EDE \u0110\u1EA6U").replace("-MID", " \xB7 CHUY\u1EC6N GI\u1EEEA CH\u01AF\u01A0NG").replace("-END", " \xB7 L\xD5I S\xC1NG") }), (0, f.jsx)("button", { onClick: Hr, children: "B\u1ECF qua" })] }), (0, f.jsxs)("div", { className: "boom-story-art", style: { backgroundImage: `url(${ve(Dt(Number(ne.key.match(/\d+/)?.[0] || 1), "floor_a"))})` }, children: [(0, f.jsxs)("div", { className: "boom-story-scene", children: [(0, f.jsx)(Rt, { equipped: l.equipped, size: 125 }), (0, f.jsx)("img", { src: ve(Be("bum_front")), alt: "B\xF9m" })] }), (0, f.jsx)("p", { children: ho[ne.key]?.[ne.frame]?.scene })] }), (0, f.jsxs)("div", { className: "boom-story-dialogue", children: [(0, f.jsx)(me, { name: "bomb_0", size: 38 }), (0, f.jsx)("p", { children: ho[ne.key]?.[ne.frame]?.text || "Pixelia l\u1EA1i s\xE1ng l\xEAn. M\u1ED9t h\xE0nh tr\xECnh m\u1EDBi \u0111ang ch\u1EDD." })] }), (0, f.jsx)("div", { className: "boom-story-dots", children: (ho[ne.key] || [{}]).map((p, w) => (0, f.jsx)("span", { className: w === ne.frame ? "active" : "" }, w)) }), et(ne.frame + 1 < (ho[ne.key]?.length || 1) ? "Ti\u1EBFp theo" : "Ti\u1EBFp t\u1EE5c h\xE0nh tr\xECnh", () => ne.frame + 1 < (ho[ne.key]?.length || 1) ? ul({ ...ne, frame: ne.frame + 1 }) : Hr())] }), T && (0, f.jsx)("div", { className: "boom-shade boom-confirm", children: (0, f.jsxs)("section", { role: "dialog", "aria-modal": "true", "aria-label": "X\xE1c nh\u1EADn", className: "boom-confirm-card", children: [(0, f.jsx)(me, { name: "bum_front", size: 62 }), (0, f.jsx)("h2", { children: T === "reset" ? "\u0110\u1EB7t l\u1EA1i ti\u1EBFn tr\xECnh?" : T === "stats" ? "\u0110\u1EB7t l\u1EA1i ch\u1EC9 s\u1ED1?" : T === "restart" ? "Ch\u01A1i l\u1EA1i t\u1EEB \u0111\u1EA7u?" : "V\u1EC1 b\u1EA3n \u0111\u1ED3?" }), (0, f.jsx)("p", { children: T === "reset" ? "To\xE0n b\u1ED9 ch\u1EC9 s\u1ED1, trang ph\u1EE5c v\xE0 ti\u1EBFn \u0111\u1ED9 ch\u01B0\u01A1ng s\u1EBD b\u1ECB x\xF3a. G\xF5 X\xD3A \u0111\u1EC3 x\xE1c nh\u1EADn." : T === "stats" ? "Ho\xE0n l\u1EA1i 80% Xu v\xE0 to\xE0n b\u1ED9 M\u1EA3nh Sao \u0111\xE3 d\xF9ng n\xE2ng ch\u1EC9 s\u1ED1." : T === "restart" ? "Booster c\u1EE7a l\u01B0\u1EE3t ch\u01A1i hi\u1EC7n t\u1EA1i \u0111\xE3 ti\xEAu hao." : "V\xE1n hi\u1EC7n t\u1EA1i \u0111\u01B0\u1EE3c l\u01B0u tr\xEAn thi\u1EBFt b\u1ECB \u0111\u1EC3 ch\u01A1i ti\u1EBFp." }), T === "reset" && (0, f.jsx)("input", { "aria-label": "G\xF5 X\xD3A", value: ba, onChange: (p) => Ds(p.target.value) }), (0, f.jsxs)("div", { children: [(0, f.jsx)("button", { className: "boom-secondary", onClick: () => q(null), children: "H\u1EE7y" }), (0, f.jsx)("button", { className: "boom-primary", disabled: T === "reset" && ba !== "X\xD3A", onClick: () => {
      T === "reset" ? (rl(mo()), i.current = null, e.bridge?.saveGameState(null), u("home"), _(null), Ds("")) : T === "stats" ? je(Jh) : T === "restart" ? Er() : On(), q(null);
    }, children: "X\xE1c nh\u1EADn" })] })] }) }), k && (0, f.jsx)("div", { className: "boom-toast", role: "status", children: k })] });
  }
  var rg = at(Bs(), 1);
  window.__BOOM_REVIEW__ = true;
  var Vx = { submitScore: async () => ({ isNewHighScore: false }), grantExp: () => {
  }, grantCoins: () => {
  }, grantGems: () => {
  }, reportProgress: () => {
  }, reportQuest: () => {
  }, triggerLootRoll: () => null, playSound: () => {
  }, getEquippedSkin: () => "", getSkin: () => "", saveGameState: () => {
  }, loadGameState: () => null };
  mountBoom = (container, initialProps) => {
    const root=(0, fg.createRoot)(container);
    const render=(props)=>root.render((0, rg.jsx)(Dr,{bridge:Vx,onGameOver:()=>{},onRestart:()=>{},...props}));
    render(initialProps);
    return {update:render,unmount:()=>root.unmount()};
  };
})();
/*! Bundled license information:

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/arrow-down.js:
lucide-react/dist/esm/icons/arrow-left.js:
lucide-react/dist/esm/icons/arrow-right.js:
lucide-react/dist/esm/icons/arrow-up.js:
lucide-react/dist/esm/icons/book-open.js:
lucide-react/dist/esm/icons/check.js:
lucide-react/dist/esm/icons/gift.js:
lucide-react/dist/esm/icons/lock.js:
lucide-react/dist/esm/icons/map-pin.js:
lucide-react/dist/esm/icons/pause.js:
lucide-react/dist/esm/icons/settings.js:
lucide-react/dist/esm/icons/shirt.js:
lucide-react/dist/esm/icons/user.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.546.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

export {mountBoom};

