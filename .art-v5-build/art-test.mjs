var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports) {
    "use strict";
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = Symbol.for("react.memo");
    var REACT_LAZY_TYPE = Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    function noop() {
    }
    var ReactSharedInternals = { H: null, A: null, T: null, S: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== refProp ? refProp : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(oldElement.type, newKey, oldElement.props);
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type) children = null;
      var invokeCallback = false;
      if (null === children) invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children) return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject;
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error;
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
      }
      if (1 === payload._status) return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    var Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports.Activity = REACT_ACTIVITY_TYPE;
    exports.Children = Children;
    exports.Component = Component;
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.Profiler = REACT_PROFILER_TYPE;
    exports.PureComponent = PureComponent;
    exports.StrictMode = REACT_STRICT_MODE_TYPE;
    exports.Suspense = REACT_SUSPENSE_TYPE;
    exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports.cacheSignal = function() {
      return null;
    };
    exports.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, props);
    };
    exports.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports.createElement = function(type, config, children) {
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength) props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key, props);
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports.isValidElement = isValidElement;
    exports.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports.startTransition = function(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    };
    exports.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports.useEffect = function(create, deps) {
      return ReactSharedInternals.H.useEffect(create, deps);
    };
    exports.useEffectEvent = function(callback) {
      return ReactSharedInternals.H.useEffectEvent(callback);
    };
    exports.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports.useImperativeHandle = function(ref, create, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
    };
    exports.useInsertionEffect = function(create, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create, deps);
    };
    exports.useLayoutEffect = function(create, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create, deps);
    };
    exports.useMemo = function(create, deps) {
      return ReactSharedInternals.H.useMemo(create, deps);
    };
    exports.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports.version = "19.2.8";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.2.8";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_production();
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.js
var require_react_jsx_runtime_production = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.js"(exports) {
    "use strict";
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
    var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
    function jsxProd(type, config, maybeKey) {
      var key = null;
      void 0 !== maybeKey && (key = "" + maybeKey);
      void 0 !== config.key && (key = "" + config.key);
      if ("key" in config) {
        maybeKey = {};
        for (var propName in config)
          "key" !== propName && (maybeKey[propName] = config[propName]);
      } else maybeKey = config;
      config = maybeKey.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== config ? config : null,
        props: maybeKey
      };
    }
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsx = jsxProd;
    exports.jsxs = jsxProd;
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children)
          if (isStaticChildren)
            if (isArrayImpl(children)) {
              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                validateChildKeys(children[isStaticChildren]);
              Object.freeze && Object.freeze(children);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
          children = getComponentNameFromType(type);
          var keys = Object.keys(config).filter(function(k) {
            return "key" !== k;
          });
          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
            isStaticChildren,
            children,
            keys,
            children
          ), didWarnAboutKeySpread[children + isStaticChildren] = true);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(
          maybeKey,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        return ReactElement(
          type,
          children,
          maybeKey,
          getOwner(),
          debugStack,
          debugTask
        );
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      var React2 = require_react(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      React2 = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = React2.react_stack_bottom_frame.bind(
        React2,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutKeySpread = {};
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.jsx = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          false,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.jsxs = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          true,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
    })();
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_jsx_runtime_production();
    } else {
      module.exports = require_react_jsx_runtime_development();
    }
  }
});

// src/games/dungeon-tap/components/CombatArt.tsx
var import_react = __toESM(require_react(), 1);

// src/games/dungeon-tap/director.ts
var ROOM_RULES = {
  scout: { name: "Trinh s\xE1t", hint: "Ch\u1EA1m ho\u1EB7c gi\u1EEF T\u1EA5n c\xF4ng \u0111\u1EC3 n\u1ED1i combo.", hp: 1, gold: 1, waves: 1 },
  armor: { name: "Thi\u1EBFt gi\xE1p", hint: "\u0110\xF2n th\u1EE9 8 ph\xE1 gi\xE1p. D\u1ED3n tuy\u1EC7t k\u1EF9 khi gi\xE1p v\u1EE1.", hp: 1.15, gold: 1.2, waves: 1 },
  swarm: { name: "B\u1EA7y \u0111\xE0n", hint: "Ba \u0111\u1EE3t nh\u1ECF. Gi\u1EEF nh\u1ECBp combo qua c\xE1c \u0111\u1EE3t.", hp: 1.1, gold: 1.15, waves: 3 },
  caster: { name: "Ph\xE1p s\u01B0", hint: "H\u1EA1 nhanh \u0111\u1EC3 h\u1ED3i th\xEAm 15 n\u0103ng l\u01B0\u1EE3ng.", hp: 0.9, gold: 1, waves: 1 },
  elite: { name: "Tinh anh", hint: "\u0110\u1ECBch b\u1EC1n h\u01A1n; ph\u1EA7n th\u01B0\u1EDFng v\xE0ng v\xE0 \u0111\u1ED3 t\u1ED1t h\u01A1n.", hp: 1.65, gold: 1.8, waves: 1 },
  treasure: { name: "Kho b\xE1u", hint: "Kho\u1EA3ng ngh\u1EC9 ng\u1EAFn \u0111\u1EC3 ki\u1EBFm v\xE0ng n\xE2ng c\u1EA5p.", hp: 0.65, gold: 1.8, waves: 1 },
  gauntlet: { name: "Li\xEAn chi\u1EBFn", hint: "Hai \u0111\u1EE3t li\xEAn ti\u1EBFp. T\xEDch n\u0103ng l\u01B0\u1EE3ng cho boss.", hp: 1.3, gold: 1.4, waves: 2 },
  rest: { name: "Su\u1ED1i h\u1ED3i ph\u1EE5c", hint: "H\u1EA1 h\u1ED9 v\u1EC7 \u0111\u1EC3 h\u1ED3i 30 n\u0103ng l\u01B0\u1EE3ng tr\u01B0\u1EDBc boss.", hp: 0.65, gold: 0.9, waves: 1 },
  boss: { name: "C\u1ED5ng Titan", hint: "\u0110\u1EE1 \u0111\xF2n l\xFAc v\xF2ng c\u1EA3nh b\xE1o s\xE1ng; ph\u1EA3n c\xF4ng khi l\u1ED9 l\xF5i.", hp: 4.8, gold: 4, waves: 1 }
};
var RHYTHMS = [
  ["scout", "armor", "swarm", "caster", "elite", "treasure", "armor", "gauntlet", "rest", "boss"],
  ["scout", "swarm", "caster", "armor", "elite", "treasure", "gauntlet", "armor", "rest", "boss"],
  ["scout", "caster", "armor", "swarm", "elite", "treasure", "armor", "gauntlet", "rest", "boss"]
];
function roomFor(stage) {
  return RHYTHMS[Math.floor((stage - 1) / 10) % RHYTHMS.length][(stage - 1) % 10];
}
var STANCES = {
  blade: { name: "Ki\u1EBFm v\u0169", description: "+25% s\xE1t th\u01B0\u01A1ng ch\u1EA1m", tap: 1.25, ally: 1, gold: 1 },
  legion: { name: "Qu\xE2n \u0111o\xE0n", description: "+30% s\xE1t th\u01B0\u01A1ng \u0111\u1ED3ng \u0111\u1ED9i", tap: 1, ally: 1.3, gold: 1 },
  fortune: { name: "Th\u1EE3 s\u0103n", description: "+25% v\xE0ng h\u1EA1 qu\xE1i", tap: 1, ally: 1, gold: 1.25 }
};
function bossPhase(time, _hpRatio = 1, stage = 10) {
  const pattern = bossPattern(stage), duration = pattern.cycle;
  const cycle = Math.floor(time / duration), t = time % duration;
  return { cycle, t, duration, phase: t < pattern.strikeAt - 2 ? "guard" : t < pattern.strikeAt ? "windup" : "exposed", canParry: t >= pattern.strikeAt - pattern.window && t < pattern.strikeAt };
}
var runeCost = (level) => 1 + Math.floor(level / 2);
var BOSS_PATTERNS = [
  { name: "Ch\xF9y ch\u1EA5n \u0111\u1ECBa", cycle: 7.5, strikeAt: 4.5, window: 1.25, penalty: 2, guard: 8, effect: "slam", hint: "\u0110\u1EE1 ch\xF9y \u0111\u1EC3 m\u1EDF l\xF5i Titan." },
  { name: "Khi\xEAn x\u01B0\u01A1ng", cycle: 8, strikeAt: 4.75, window: 1.25, penalty: 2, guard: 10, effect: "shield", hint: "Gi\xE1p b\u1EC1n h\u01A1n: c\u1EA7n 10 nh\xE1t ph\xE1 gi\xE1p." },
  { name: "T\u01A1 \u0111\u1ED9c", cycle: 7, strikeAt: 4.25, window: 1.25, penalty: 3, guard: 8, effect: "poison", hint: "Tr\u01B0\u1EE3t \u0111\u1EE1: t\u01A1 \u0111\u1ED9c l\u1EA5y 3 gi\xE2y." },
  { name: "Huy\u1EBFt tri\u1EC1u", cycle: 7.75, strikeAt: 4.75, window: 1.25, penalty: 2, guard: 8, effect: "siphon", hint: "Tr\u01B0\u1EE3t \u0111\u1EE1: h\xFAt th\xEAm 15 n\u0103ng l\u01B0\u1EE3ng." },
  { name: "H\u1ECFa t\u1EE9c", cycle: 8.5, strikeAt: 5, window: 1.5, penalty: 4, guard: 8, effect: "fire", hint: "H\u1ECFa t\u1EE9c ch\u1EADm nh\u01B0ng l\u1EA5y 4 gi\xE2y n\u1EBFu tr\u01B0\u1EE3t." },
  { name: "B\u0103ng phong", cycle: 8, strikeAt: 4.75, window: 1.25, penalty: 2, guard: 9, effect: "frost", hint: "Tr\u01B0\u1EE3t \u0111\u1EE1: \u0111\xF3ng b\u0103ng 10 n\u0103ng l\u01B0\u1EE3ng." },
  { name: "L\xF4i k\xEDch", cycle: 6.75, strikeAt: 4, window: 1, penalty: 2.5, guard: 8, effect: "thunder", hint: "Nh\u1ECBp nhanh; c\u1EEDa s\u1ED5 \u0111\u1EE1 d\xE0i 1 gi\xE2y." },
  { name: "H\u01B0 v\xF4", cycle: 7, strikeAt: 4.5, window: 1.25, penalty: 3, guard: 8, effect: "void", hint: "Tr\u01B0\u1EE3t \u0111\u1EE1: t\u0103ng h\u1ED3i chi\xEAu k\u1EF9 n\u0103ng th\xEAm 1,5 gi\xE2y." }
];
function bossPattern(stage) {
  const starts = [1, 21, 41, 61, 81, 101, 131, 161];
  let chapter = 0;
  starts.forEach((start, i) => {
    if (stage >= start) chapter = i;
  });
  return BOSS_PATTERNS[chapter];
}

// src/games/dungeon-tap/storyChapters.ts
var STORY_CHAPTERS = [
  {
    id: 1,
    name: "Ch\u01B0\u01A1ng 1: Thung L\u0169ng Goblin",
    title: "Bi\xEAn Gi\u1EDBi H\u1EAFc \xC1m",
    lore: "L\u0169 Goblin n\u1ED5i lo\u1EA1n d\u01B0\u1EDBi s\u1EF1 b\u1EA3o h\u1ED9 c\u1EE7a t\u1ED9c Titan c\u1ED5 \u0111\u1EA1i. H\xE3y vung thanh ki\u1EBFm th\u1EA7n m\u1EDF \u0111\u01B0\u1EDDng qua thung l\u0169ng \u0111\xE1 cu\u1ED9i.",
    startStage: 1,
    endStage: 20,
    bossName: "Goblin V\u01B0\u01A1ng Kh\u1ED5ng L\u1ED3",
    bossAvatar: "\u{1F47A}",
    bgGradient: "from-amber-950 via-slate-900 to-stone-950",
    badge: "\u{1F332}"
  },
  {
    id: 2,
    name: "Ch\u01B0\u01A1ng 2: H\u1EA7m M\u1ECF Khung X\u01B0\u01A1ng",
    title: "L\u0103ng M\u1ED9 B\u1ECB Nguy\u1EC1n R\u1EE7a",
    lore: "T\u1EA7ng s\xE2u h\u1EA7m m\u1ECF b\u1ECF hoang tr\xE0n ng\u1EADp c\xE1c chi\u1EBFn binh vong linh v\xE0 ng\u01B0\u1EDDi \u0111\xE1 b\u1EA5t t\u1EED canh gi\u1EEF kho b\xE1u ng\xE0n n\u0103m.",
    startStage: 21,
    endStage: 40,
    bossName: "\u0110\u1EA1i T\u01B0\u1EDBng Khung X\u01B0\u01A1ng B\u1EA5t Di\u1EC7t",
    bossAvatar: "\u{1F480}",
    bgGradient: "from-slate-950 via-zinc-900 to-indigo-950",
    badge: "\u26CF\uFE0F"
  },
  {
    id: 3,
    name: "Ch\u01B0\u01A1ng 3: R\u1EEBng Ph\xF9 Th\u1EE7y Ma Qu\xE1i",
    title: "V\xF9ng \u0110\u1EA5t \u0110\u1ED9c D\u01B0\u1EE3c",
    lore: "Nh\u1EEFng c\xE2y \u0111\u1EA1i th\u1EE5 ph\xE1t s\xE1ng l\xE2n tinh v\xE0 b\u1EA7y nh\u1EC7n h\u01B0 kh\xF4ng ph\u1EE5c k\xEDch b\u1EA5t k\u1EF3 l\u1EEF kh\xE1ch n\xE0o d\xE1m \u0111\u1EB7t ch\xE2n v\xE0o.",
    startStage: 41,
    endStage: 60,
    bossName: "M\u1EABu Ch\xFAa Nh\u1EC7n H\u01B0 Kh\xF4ng",
    bossAvatar: "\u{1F577}\uFE0F",
    bgGradient: "from-emerald-950 via-slate-950 to-teal-950",
    badge: "\u{1F33F}"
  },
  {
    id: 4,
    name: "Ch\u01B0\u01A1ng 4: Ph\xE1o \u0110\xE0i Huy\u1EBFt Ma",
    title: "Th\xE0nh Tr\xEC B\xF3ng T\u1ED1i",
    lore: "L\xE2u \u0111\xE0i c\u1ED5 k\xEDnh che khu\u1EA5t \xE1nh m\u1EB7t tr\u1EDDi, n\u01A1i c\xE1c \xE1c ma v\xE0 b\xE1 t\u01B0\u1EDBc ma c\xE0 r\u1ED3ng thao t\xFAng ma thu\u1EADt \u0111en t\u1ED1i.",
    startStage: 61,
    endStage: 80,
    bossName: "B\xE1 T\u01B0\u1EDBc Huy\u1EBFt Ma Dracula",
    bossAvatar: "\u{1F9DB}\u200D\u2642\uFE0F",
    bgGradient: "from-rose-950 via-neutral-950 to-slate-950",
    badge: "\u{1F3F0}"
  },
  {
    id: 5,
    name: "Ch\u01B0\u01A1ng 5: N\xFAi L\u1EEDa Dung Nham",
    title: "Tr\xE1i Tim R\u1ED3ng L\u1EEDa",
    lore: "D\xF2ng dung nham cu\u1ED3n cu\u1ED9n \u0111\u1ECF r\u1EF1c nung ch\u1EA3y m\u1ECDi th\u1EE9. N\u01A1i ng\u1EF1 tr\u1ECB c\u1EE7a ch\xFAa t\u1EC3 r\u1ED3ng l\u1EEDa v\xE0 c\xE1c Titan dung nham.",
    startStage: 81,
    endStage: 100,
    bossName: "H\u1ECEA LONG V\u01AF\u01A0NG TITAN",
    bossAvatar: "\u{1F409}",
    bgGradient: "from-red-950 via-amber-950 to-stone-950",
    badge: "\u{1F30B}"
  },
  {
    id: 6,
    name: "Ch\u01B0\u01A1ng 6: B\u0103ng Phong C\u1EF1c \u0110\u1ECBa",
    title: "V\xF9ng \u0110\u1EA5t B\u0103ng Gi\xE1 V\u0129nh H\u1EB1ng",
    lore: "C\u01A1n b\xE3o tuy\u1EBFt v\u0129nh c\u1EEDu \u0111\xF3ng b\u0103ng c\u1EA3 linh h\u1ED3n. Ng\u01B0\u1EDDi kh\u1ED5ng l\u1ED3 b\u0103ng tuy\u1EBFt canh gi\u1EEF c\xE1nh c\u1ED5ng thi\xEAn \u0111\u01B0\u1EDDng.",
    startStage: 101,
    endStage: 130,
    bossName: "B\u0103ng Ma Kh\u1ED5ng L\u1ED3 Frostbite",
    bossAvatar: "\u{1F976}",
    bgGradient: "from-cyan-950 via-sky-950 to-slate-950",
    badge: "\u2744\uFE0F"
  },
  {
    id: 7,
    name: "Ch\u01B0\u01A1ng 7: \u0110\u1EC1n Th\u1EDD L\xF4i \u0110i\u1EC7n",
    title: "\u0110i\u1EC7n Th\u1EDD Th\u1EA7n S\u1EA5m",
    lore: "S\xE9t r\u1EA1ch x\xE9 to\u1EA1c b\u1EA7u tr\u1EDDi, ngu\u1ED3n n\u0103ng l\u01B0\u1EE3ng nguy\xEAn b\u1EA3n c\u1EE7a v\u0169 tr\u1EE5 \u0111ang ch\u1EDD \u0111\u1EE3i k\u1EBB x\u1EE9ng \u0111\xE1ng h\u1EA5p thu.",
    startStage: 131,
    endStage: 160,
    bossName: "L\xF4i Th\u1EA7n Titan Mj\xF6lnir",
    bossAvatar: "\u26A1",
    bgGradient: "from-yellow-950 via-indigo-950 to-slate-950",
    badge: "\u26A1"
  },
  {
    id: 8,
    name: "Ch\u01B0\u01A1ng 8: V\u1EF1c Th\u1EB3m Titan H\u01B0 V\xF4",
    title: "H\u01B0 Kh\xF4ng V\xF4 T\u1EADn",
    lore: "Kh\xF4ng gian b\u1ECB b\xF3p m\xE9o, n\u01A1i quy t\u1EE5 nh\u1EEFng Titan v\u0169 tr\u1EE5 t\u1ED1i th\u01B0\u1EE3ng v\u1EDBi s\u1EE9c m\u1EA1nh h\u1EE7y di\u1EC7t th\u1EBF gi\u1EDBi.",
    startStage: 161,
    endStage: 200,
    bossName: "CH\xDAA T\u1EC2 H\u01AF V\xD4 KAI THE PUPPET",
    bossAvatar: "\u{1F479}",
    bgGradient: "from-purple-950 via-slate-950 to-zinc-950",
    badge: "\u{1F30C}"
  }
];
function getStoryChapterForStage(stage) {
  const found = STORY_CHAPTERS.find((c) => stage >= c.startStage && stage <= c.endStage);
  if (found) return found;
  return {
    id: Math.floor((stage - 1) / 20) + 1,
    name: `Ch\u01B0\u01A1ng ${Math.floor((stage - 1) / 20) + 1}: V\u1EF1c Th\u1EB3m C\u1EF1c H\u1EA1n`,
    title: "Chinh Ph\u1EE5c Huy\u1EC1n Tho\u1EA1i",
    lore: "V\u01B0\u1EE3t qua m\u1ECDi gi\u1EDBi h\u1EA1n c\u1EE7a ng\u01B0\u1EDDi tr\u1EA7n m\u1EAFt th\u1ECBt, \u0111\u1ED1i \u0111\u1EA7u tr\u1EF1c di\u1EC7n v\u1EDBi nh\u1EEFng Titan h\xF9ng m\u1EA1nh nh\u1EA5t v\u0169 tr\u1EE5.",
    startStage: Math.floor((stage - 1) / 20) * 20 + 1,
    endStage: Math.floor((stage - 1) / 20) * 20 + 20,
    bossName: "CH\xDAA T\u1EC2 TITAN TH\xC1I C\u1ED4",
    bossAvatar: "\u{1F451}",
    bgGradient: "from-violet-950 via-neutral-950 to-slate-950",
    badge: "\u{1F451}"
  };
}
function generateMonsterForStage(stage) {
  const isBoss = stage % 10 === 0;
  const chapter = getStoryChapterForStage(stage);
  const baseHealth = 85;
  const healthGrowth = 1.16;
  let calculatedHp = Math.round(baseHealth * Math.pow(healthGrowth, stage - 1));
  if (isBoss) {
    calculatedHp = Math.round(calculatedHp * 5.5);
  }
  const baseAtk = 10;
  const attackPower = Math.round(baseAtk * Math.pow(1.15, stage - 1));
  const baseGold = 18;
  let goldReward = Math.round(baseGold * Math.pow(1.16, stage - 1));
  if (isBoss) {
    goldReward = Math.round(goldReward * 4.5);
  }
  if (isBoss) {
    const bossIdx = Math.min(7, chapter.id - 1);
    const minibossNames = ["Goblin Ch\xF9y S\u1EAFt", "H\u1ED9 V\u1EC7 X\u01B0\u01A1ng C\u1ED5", "Nh\u1EC7n D\u1EC7t T\u01A1 \u0110\u1ED9c", "Hi\u1EC7p S\u0129 Huy\u1EBFt Nguy\u1EC7t", "\u1EA4u Long Dung Nham", "C\u1EF1 Nh\xE2n B\u0103ng Gi\xE1p", "K\u1EF5 S\u0129 L\xF4i V\u0169", "S\u1EE9 Gi\u1EA3 H\u01B0 V\xF4"];
    const bossTemplate = { name: stage === chapter.endStage ? chapter.bossName : minibossNames[bossIdx], avatar: chapter.bossAvatar, title: stage === chapter.endStage ? "Th\u1EE7 l\u0129nh ch\u01B0\u01A1ng" : "H\u1ED9 v\u1EC7 c\u1ED5ng Titan" };
    return {
      id: `boss-${stage}-${Date.now()}`,
      name: `[C\u1EA4P ${stage}] ${bossTemplate.name}`,
      title: `${bossTemplate.title} - BOSS T\u1EA6NG ${stage}`,
      avatar: bossTemplate.avatar,
      level: stage,
      stage,
      hp: calculatedHp,
      maxHp: calculatedHp,
      attackPower,
      goldReward,
      isBoss: true,
      timeRemaining: 30,
      // 30s countdown for boss
      maxTime: 30,
      theme: chapter.bgGradient
    };
  }
  const pools = [
    ["Goblin Trinh S\xE1t", "Goblin Thi\u1EBFt Gi\xE1p", "Qu\u1EF7 R\u1EEBng"],
    ["Khung X\u01B0\u01A1ng \u0110ao Ph\u1EE7", "H\u1ED9 V\u1EC7 L\u0103ng M\u1ED9", "Ph\xE1p S\u01B0 Vong Linh"],
    ["Nh\u1EC7n H\u01B0 Kh\xF4ng", "Ma C\xE2y \u0110\u1ED9c D\u01B0\u1EE3c", "Ph\xF9 Th\u1EE7y R\u1EEBng"],
    ["D\u01A1i Huy\u1EBFt D\u1EA1", "L\xEDnh G\xE1c Huy\u1EBFt Ma", "B\xF3ng Ma Th\xE0nh C\u1ED5"],
    ["Tinh Linh H\u1ECFa Ng\u1EE5c", "H\u1ED9 V\u1EC7 Dung Nham", "R\u1ED3ng Con L\u1EEDa"],
    ["B\u0103ng Linh", "Chi\u1EBFn Binh Tuy\u1EBFt", "Ph\xF9 Th\u1EE7y B\u0103ng"],
    ["H\u1ED9 V\u1EC7 L\xF4i \u0110i\u1EC7n", "S\u1EE9 Gi\u1EA3 S\u1EA5m S\xE9t", "K\u1EF5 Binh Thi\xEAn L\xF4i"],
    ["K\u1EBB S\u0103n H\u01B0 V\xF4", "\u1EA2o \u1EA2nh Titan", "B\xF3ng Ma V\u1EF1c Th\u1EB3m"]
  ];
  const regTemplate = { name: pools[Math.min(7, chapter.id - 1)][(stage * 7 + 3) % 3], avatar: chapter.bossAvatar };
  return {
    id: `mob-${stage}-${Date.now()}`,
    name: `${regTemplate.name} (T${stage})`,
    title: `Qu\xE1i V\u1EADt C\u1EA5p ${stage}`,
    avatar: regTemplate.avatar,
    level: stage,
    stage,
    hp: calculatedHp,
    maxHp: calculatedHp,
    attackPower,
    goldReward,
    isBoss: false,
    timeRemaining: 999,
    maxTime: 999,
    theme: chapter.bgGradient
  };
}

// src/games/dungeon-tap/enemyRoster.ts
var ENEMY_ROSTER = [
  ["Goblin Trinh S\xE1t", "Goblin Thi\u1EBFt Gi\xE1p", "Qu\u1EF7 R\u1EEBng", "K\u1EF5 Lang Goblin", "D\u01A1i R\xEAu", "B\u1ECD Gi\xE1p \u0110\u1ED3ng"],
  ["Khung X\u01B0\u01A1ng \u0110ao Ph\u1EE7", "H\u1ED9 V\u1EC7 L\u0103ng M\u1ED9", "Ph\xE1p S\u01B0 Vong Linh", "U H\u1ED3n \xC1o Cho\xE0ng", "Ch\xF3 S\u0103n X\u01B0\u01A1ng", "Qu\u1EA1 C\u1ED1t"],
  ["Nh\u1EC7n H\u01B0 Kh\xF4ng", "Ma C\xE2y \u0110\u1ED9c D\u01B0\u1EE3c", "Ph\xF9 Th\u1EE7y R\u1EEBng", "L\u1EE3n R\u1EEBng Gai", "M\u1ED9c Linh L\xE2n Tinh", "M\xE3ng X\xE0 \u0110\u1ED9c"],
  ["D\u01A1i Huy\u1EBFt D\u1EA1", "L\xEDnh G\xE1c Huy\u1EBFt Ma", "B\xF3ng Ma Th\xE0nh C\u1ED5", "Ng\u01B0\u1EDDi S\xF3i H\u1EAFc D\u1EA1", "Th\u1EA1ch Qu\u1EF7 Huy\u1EBFt Nguy\u1EC7t", "T\xEDn \u0110\u1ED3 Huy\u1EBFt Gi\xE1o"],
  ["Tinh Linh H\u1ECFa Ng\u1EE5c", "H\u1ED9 V\u1EC7 Dung Nham", "R\u1ED3ng Con L\u1EEDa", "B\u1ECD C\u1EA1p Dung Nham", "\u0110i\u1EC3u Nh\xE2n Tro T\xE0n", "Ch\xF3 S\u0103n H\u1ECFa Ng\u1EE5c"],
  ["B\u0103ng Linh", "Chi\u1EBFn Binh Tuy\u1EBFt", "Ph\xF9 Th\u1EE7y B\u0103ng", "B\u1EA1ch Lang B\u0103ng Nha", "C\xFA Tuy\u1EBFt Pha L\xEA", "Cua Gi\xE1p B\u0103ng"],
  ["H\u1ED9 V\u1EC7 L\xF4i \u0110i\u1EC7n", "S\u1EE9 Gi\u1EA3 S\u1EA5m S\xE9t", "K\u1EF5 Binh Thi\xEAn L\xF4i", "L\xF4i X\xE0 Kim Gi\xE1p", "\u0110i\u1EC3u Nh\xE2n B\xE3o T\u1ED1", "R\u1EBFt M\xE1y C\u1ED5 Ng\u1EEF"],
  ["K\u1EBB S\u0103n H\u01B0 V\xF4", "\u1EA2o \u1EA2nh Titan", "B\xF3ng Ma V\u1EF1c Th\u1EB3m", "Ch\xF3 S\u0103n V\u1EF1c Th\u1EB3m", "Ng\xE0i H\u01B0 Kh\xF4ng", "Nh\xE3n Ma X\xFAc Tu"]
];
function squadSpecies(stage, wave, serial, count) {
  const cycle = [0, 3, 1, 4, 2, 5], offset = (serial + Math.floor((stage - 1) / 10) * 2) % 6;
  return Array.from({ length: count }, (_, i) => cycle[(offset + i) % 6]);
}
var SQUAD_COUNTS = { scout: 2, armor: 2, swarm: 3, caster: 2, elite: 3, treasure: 1, gauntlet: 3, rest: 2, boss: 1 };
var ROLES_BY_BIOME = [
  ["melee", "guard", "caster", "ambusher", "flyer", "swarm"],
  ["melee", "guard", "caster", "caster", "ambusher", "flyer"],
  ["swarm", "guard", "caster", "ambusher", "flyer", "swarm"],
  ["flyer", "guard", "caster", "ambusher", "flyer", "caster"],
  ["swarm", "guard", "caster", "ambusher", "flyer", "swarm"],
  ["flyer", "guard", "caster", "ambusher", "flyer", "guard"],
  ["guard", "caster", "melee", "ambusher", "flyer", "guard"],
  ["melee", "guard", "caster", "ambusher", "flyer", "caster"]
];
var enemyRole = (biome, species) => ROLES_BY_BIOME[Math.max(0, Math.min(7, biome))][species];

// src/games/dungeon-tap/components/RasterSprite.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);

// src/games/dungeon-tap/components/TitanArt.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function actorFrame(pose, clock, boss, party) {
  if (boss) return { idle: 0, walk: 1, step: 2, windup: 3, attack: 4, recovery: 5, exposed: 6, hurt: 6, defeat: 7 }[pose] ?? 0;
  if (party) return { idle: 0, walk: 0, windup: 1, attack: 2, hurt: 3, exposed: 3, defeat: 3 }[pose] ?? 0;
  return ["attack", "windup"].includes(pose) ? 1 : 0;
}

// src/games/dungeon-tap/components/CombatArt.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function bossArtPose(s) {
  const p = bossPhase(s.encounterTime, 1, s.stage), pattern = bossPattern(s.stage), age = p.t - pattern.strikeAt;
  if (s.exposed > 0 || s.parriedCycle === p.cycle && p.phase !== "guard") return "exposed";
  if (p.phase === "windup") return "windup";
  if (age >= 0 && age < 0.28) return "attack";
  if (age >= 0.28 && age < 0.65) return "recovery";
  if (p.phase === "exposed") return "exposed";
  return p.t < 0.5 ? "walk" : p.t < 1 ? "step" : "idle";
}

// src/games/dungeon-tap/equipmentData.ts
var RARITY_CONFIG = {
  common: {
    name: "Ph\u1ED5 Th\xF4ng",
    color: "#94a3b8",
    border: "border-slate-500",
    bg: "bg-slate-900/80",
    statMultiplier: 1,
    dropWeight: 55
  },
  rare: {
    name: "Hi\u1EBFm",
    color: "#38bdf8",
    border: "border-cyan-500",
    bg: "bg-cyan-950/80",
    statMultiplier: 1.8,
    dropWeight: 30
  },
  epic: {
    name: "S\u1EED Thi",
    color: "#c084fc",
    border: "border-purple-500",
    bg: "bg-purple-950/80",
    statMultiplier: 3.2,
    dropWeight: 12
  },
  legendary: {
    name: "Th\u1EA7n Tho\u1EA1i",
    color: "#fbbf24",
    border: "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]",
    bg: "bg-amber-950/80",
    statMultiplier: 6,
    dropWeight: 3
  }
};
var WEAPON_NAMES = [
  "Ki\u1EBFm R\u1EC9 S\xE9t",
  "Ki\u1EBFm Th\xE9p R\xE8n",
  "\u0110ao L\u1EEDa H\u1ECFa Ng\u1EE5c",
  "Th\xE1nh Ki\u1EBFm Excalibur",
  "Song Ki\u1EBFm Cu\u1ED3ng Phong",
  "L\u01B0\u1EE1i H\xE1i H\u01B0 V\xF4",
  "B\xFAa S\u1EA5m S\xE9t Titan"
];
var ARMOR_NAMES = [
  "\xC1o V\u1EA3i T\xE2n Binh",
  "Gi\xE1p Da B\xE1o",
  "Gi\xE1p S\u1EAFt Hi\u1EC7p S\u0129",
  "Gi\xE1p Titan B\u1EA5t Ho\u1EA1i",
  "Long B\xE0o H\u1ECFa Long",
  "\xC1o Cho\xE0ng B\xF3ng T\u1ED1i",
  "Chi\u1EBFn Gi\xE1p Th\xE1i C\u1ED5"
];
var HELMET_NAMES = [
  "M\u0169 V\u1EA3i Gai",
  "M\u0169 S\u1EAFt Chi\u1EBFn Binh",
  "V\u01B0\u01A1ng Mi\u1EC7n Ma Thu\u1EADt",
  "M\u0169 R\u1ED3ng Huy\u1EBFt T\u1ED9c",
  "M\u1EB7t N\u1EA1 S\xE1t Th\u1EE7",
  "V\u01B0\u01A1ng Mi\u1EC7n Titan"
];
var CLOAK_NAMES = [
  "Kh\u0103n Cho\xE0ng \u0110\u1ECF",
  "\xC1o Cho\xE0ng Gi\xF3",
  "C\xE1nh D\u01A1i Huy\u1EBFt D\u1EA1",
  "\xC1o Cho\xE0ng Sao B\u0103ng",
  "C\xE1nh Ph\u01B0\u1EE3ng Ho\xE0ng L\u1EEDa",
  "H\u01B0 V\xF4 Phi Phong"
];
var RING_NAMES = [
  "Nh\u1EABn \u0110\u1ED3ng C\u1ED5",
  "Nh\u1EABn B\u1EA1c Tinh X\u1EA3o",
  "Nh\u1EABn Ng\u1ECDc L\u1EE5c B\u1EA3o",
  "Nh\u1EABn Midas Ho\xE0ng Kim",
  "Nh\u1EABn Ma Th\u1EA7n H\u1ED7n Mang",
  "V\xF2ng C\u1ED5 R\u1ED3ng \u0110en"
];
var SLOT_ICONS = {
  weapon: "\u2694\uFE0F",
  armor: "\u{1F6E1}\uFE0F",
  helmet: "\u{1F451}",
  cloak: "\u{1F9E3}",
  ring: "\u{1F48D}"
};
function getRandomRarity(stage, rng = Math.random) {
  const bonusRarity = Math.min(25, Math.floor(stage / 10) * 3);
  const roll = rng() * 100;
  if (roll < 3 + bonusRarity * 0.3) return "legendary";
  if (roll < 15 + bonusRarity * 0.6) return "epic";
  if (roll < 45 + bonusRarity * 0.8) return "rare";
  return "common";
}
function generateLootItem(stage, forcedSlot, rng = Math.random) {
  const slots = ["weapon", "armor", "helmet", "cloak", "ring"];
  const slot = forcedSlot || slots[Math.floor(rng() * slots.length)];
  const rarity = getRandomRarity(stage, rng);
  const rarityInfo = RARITY_CONFIG[rarity];
  let nameList = WEAPON_NAMES;
  if (slot === "armor") nameList = ARMOR_NAMES;
  if (slot === "helmet") nameList = HELMET_NAMES;
  if (slot === "cloak") nameList = CLOAK_NAMES;
  if (slot === "ring") nameList = RING_NAMES;
  const baseName = nameList[Math.floor(rng() * nameList.length)];
  const itemLevel = 1;
  const stageScale = 1 + 0.03 * Math.max(0, stage - 1);
  const statScale = stageScale * rarityInfo.statMultiplier;
  let tapDmgBonus = 0;
  let heroDmgBonus = 0;
  let critRateBonus = 0;
  let goldBonus = 0;
  if (slot === "weapon") {
    tapDmgBonus = Math.round(15 * statScale);
    critRateBonus = Math.min(25, Math.round(3 * rarityInfo.statMultiplier));
  } else if (slot === "armor") {
    tapDmgBonus = Math.round(8 * statScale);
    heroDmgBonus = Math.round(10 * statScale);
  } else if (slot === "helmet") {
    heroDmgBonus = Math.round(18 * statScale);
  } else if (slot === "cloak") {
    critRateBonus = Math.min(30, Math.round(4 * rarityInfo.statMultiplier));
    tapDmgBonus = Math.round(10 * statScale);
  } else if (slot === "ring") {
    goldBonus = Math.round(12 * statScale);
    heroDmgBonus = Math.round(8 * statScale);
  }
  const sellValue = Math.round(20 * statScale);
  const upgradeCost = Math.round(35 * statScale);
  return {
    id: `item-${Math.floor(rng() * 1e12)}-${rng().toString(36).substring(2, 7)}`,
    name: baseName,
    slot,
    rarity,
    level: 1,
    tapDmgBonus,
    heroDmgBonus,
    critRateBonus,
    goldBonus,
    icon: SLOT_ICONS[slot],
    description: `Trang b\u1ECB ${rarityInfo.name} c\u1EA5p 1 nh\u1EB7t \u0111\u01B0\u1EE3c t\u1EA1i T\u1EA7ng ${stage}.`,
    sellValue,
    upgradeCost,
    baseLevelStats: {
      tapDmgBonus,
      heroDmgBonus,
      critRateBonus,
      goldBonus
    }
  };
}
var STARTER_EQUIPMENT = {
  weapon: {
    id: "starter-weapon",
    name: "Ki\u1EBFm G\u1ED7 T\u1EADp S\u1EF1",
    slot: "weapon",
    rarity: "common",
    level: 1,
    tapDmgBonus: 10,
    heroDmgBonus: 0,
    critRateBonus: 2,
    goldBonus: 0,
    icon: "\u{1F5E1}\uFE0F",
    description: "V\u0169 kh\xED kh\u1EDFi \u0111\u1EA7u m\u1ED9c m\u1EA1c c\u1EE7a Ki\u1EBFm S\u0129.",
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 10,
      heroDmgBonus: 0,
      critRateBonus: 2,
      goldBonus: 0
    }
  },
  armor: {
    id: "starter-armor",
    name: "\xC1o V\u1EA3i T\xE2n Binh",
    slot: "armor",
    rarity: "common",
    level: 1,
    tapDmgBonus: 5,
    heroDmgBonus: 5,
    critRateBonus: 0,
    goldBonus: 0,
    icon: "\u{1F6E1}\uFE0F",
    description: "Gi\xE1p nh\u1EB9 b\u1EA3o h\u1ED9 c\u01A1 b\u1EA3n.",
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 5,
      heroDmgBonus: 5,
      critRateBonus: 0,
      goldBonus: 0
    }
  },
  helmet: {
    id: "starter-helmet",
    name: "B\u0103ng \u0110\u1EA7u V\u1EA3i",
    slot: "helmet",
    rarity: "common",
    level: 1,
    tapDmgBonus: 0,
    heroDmgBonus: 8,
    critRateBonus: 0,
    goldBonus: 0,
    icon: "\u{1F451}",
    description: "B\u0103ng \u0111\u1EA7u gi\xFAp t\u0103ng t\u1EADp trung.",
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 0,
      heroDmgBonus: 8,
      critRateBonus: 0,
      goldBonus: 0
    }
  },
  cloak: {
    id: "starter-cloak",
    name: "Kh\u0103n Qu\xE0ng Du M\u1EE5c",
    slot: "cloak",
    rarity: "common",
    level: 1,
    tapDmgBonus: 4,
    heroDmgBonus: 0,
    critRateBonus: 3,
    goldBonus: 0,
    icon: "\u{1F9E3}",
    description: "Kh\u0103n qu\xE0ng ph\u1EA5t ph\u01A1 trong gi\xF3 b\xE3o.",
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 4,
      heroDmgBonus: 0,
      critRateBonus: 3,
      goldBonus: 0
    }
  },
  ring: {
    id: "starter-ring",
    name: "Nh\u1EABn \u0110\u1ED3ng Th\xF4",
    slot: "ring",
    rarity: "common",
    level: 1,
    tapDmgBonus: 0,
    heroDmgBonus: 0,
    critRateBonus: 0,
    goldBonus: 10,
    icon: "\u{1F48D}",
    description: "Nh\u1EABn \u0111\u1ED3ng th\xF4 mang l\u1EA1i ch\xFAt may m\u1EAFn.",
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 0,
      heroDmgBonus: 0,
      critRateBonus: 0,
      goldBonus: 10
    }
  }
};

// src/games/dungeon-tap/allyEquipmentData.ts
var PROFESSION_METAS = {
  archer: {
    id: "archer",
    name: "X\u1EA1 Th\u1EE7",
    icon: "\u{1F3F9}",
    role: "S\xE1t th\u01B0\u01A1ng v\u1EADt l\xFD t\u1EA7m xa & B\xE3o t\xEAn",
    weaponSlotName: "Cung T\xEAn Chuy\xEAn D\u1EE5ng",
    armorSlotName: "\xC1o Cho\xE0ng / Gi\xE1p Gi\xF3",
    accessorySlotName: "\u1ED0ng T\xEAn / Nh\u1EABn Phong Linh",
    weaponIcon: "\u{1F3F9}",
    armorIcon: "\u{1FAB6}",
    accessoryIcon: "\u{1F3AF}",
    description: "Th\xE0nh th\u1EA1o cung t\xEAn v\xE0 \u1ED1ng ti\u1EC5n ma thu\u1EADt, b\u1EAFn r\xE1ch ph\xF2ng th\u1EE7 qu\xE1i v\u1EADt."
  },
  mage: {
    id: "mage",
    name: "Ph\xE1p S\u01B0",
    icon: "\u{1F9D9}\u200D\u2642\uFE0F",
    role: "S\xE1t th\u01B0\u01A1ng ma ph\xE1p b\u1ED9c ph\xE1t & Thi\xEAn th\u1EA1ch",
    weaponSlotName: "Ph\xE1p Tr\u01B0\u1EE3ng Ma Thu\u1EADt",
    armorSlotName: "Ph\xE1p B\xE0o / \xC1o Cho\xE0ng",
    accessorySlotName: "Qu\u1EA3 C\u1EA7u / D\xE2y Chuy\u1EC1n Tinh T\xFA",
    weaponIcon: "\u{1FA84}",
    armorIcon: "\u{1F52E}",
    accessoryIcon: "\u2728",
    description: "\u0110i\u1EC1u khi\u1EC3n h\u1ECFa di\u1EC7m nguy\xEAn t\u1ED1 v\xE0 ng\u01B0ng t\u1EE5 thi\xEAn th\u1EA1ch h\u1EE7y di\u1EC7t."
  },
  golem: {
    id: "golem",
    name: "H\u1ED9 V\u1EC7 Titan",
    icon: "\u{1F5FF}",
    role: "Ch\u1EA5n \u0111\u1ED9ng di\u1EC7n r\u1ED9ng & \u0110\u1EE1 \u0111\xF2n m\u1EB7t \u0111\u1EA5t",
    weaponSlotName: "Ch\xF9y Gai Nham Th\u1EA1ch",
    armorSlotName: "Gi\xE1p H\u1EAFc Th\u1EA1ch / B\xE0n Th\u1EA1ch",
    accessorySlotName: "L\xF5i \u0110\u1ECBa C\u1EA7u / Ph\xF9 Hi\u1EC7u Titan",
    weaponIcon: "\u{1F528}",
    armorIcon: "\u{1FAA8}",
    accessoryIcon: "\u{1F48E}",
    description: "S\u1EE9c m\u1EA1nh b\xE0n th\u1EA1ch d\u1EABm n\xE1t m\u1EB7t \u0111\u1EA5t v\xE0 g\xE2y ch\u1EA5n \u0111\u1ED9ng kh\xF4n l\u01B0\u1EDDng."
  },
  assassin: {
    id: "assassin",
    name: "S\xE1t Th\u1EE7",
    icon: "\u{1F977}",
    role: "Ch\xED m\u1EA1ng t\u1EED huy\u1EC7t & Tr\u1EA3m k\xEDch b\xF3ng t\u1ED1i",
    weaponSlotName: "Song \u0110ao H\u1EAFc \xC1m",
    armorSlotName: "Gi\xE1p D\u1EA1 H\xE0nh / \xC1o Cho\xE0ng \u0110en",
    accessorySlotName: "M\u1EB7t N\u1EA1 H\u01B0 Kh\xF4ng / Nh\u1EABn \u0110o\u1EA1t M\u1EC7nh",
    weaponIcon: "\u{1F5E1}\uFE0F",
    armorIcon: "\u{1F3AD}",
    accessoryIcon: "\u{1F48D}",
    description: "\u1EA8n hi\u1EC7n trong b\xF3ng \u0111\xEAm, k\u1EBFt li\u1EC5u qu\xE1i v\u1EADt b\u1EB1ng nh\u1EEFng nh\xE1t \u0111\xE2m hi\u1EC3m h\xF3c."
  },
  priestess: {
    id: "priestess",
    name: "Th\xE1nh N\u1EEF",
    icon: "\u{1F9DA}\u200D\u2640\uFE0F",
    role: "H\u1ED3i ph\u1EE5c Mana & Ph\xFAc l\xE0nh \xE1nh s\xE1ng",
    weaponSlotName: "Quy\u1EC1n Tr\u01B0\u1EE3ng Th\xE1nh Quang",
    armorSlotName: "Th\xE1nh Y / \xC1o Cho\xE0ng Tinh Linh",
    accessorySlotName: "V\u01B0\u01A1ng Mi\u1EC7n / D\xE2y Chuy\u1EC1n Th\xE1nh Linh",
    weaponIcon: "\u2728",
    armorIcon: "\u{1F451}",
    accessoryIcon: "\u{1F4FF}",
    description: "Truy\u1EC1n d\u1EABn n\u0103ng l\u01B0\u1EE3ng tinh linh thanh t\u1EA9y v\xE0 ti\u1EBFp t\u1EBF linh l\u1EF1c cho to\xE0n \u0111\u1ED9i."
  },
  dragon_knight: {
    id: "dragon_knight",
    name: "K\u1EF5 S\u0129 Long V\u01B0\u01A1ng",
    icon: "\u{1F432}",
    role: "Long h\u1ED1ng cu\u1ED3ng b\u1EA1o & H\u01A1i th\u1EDF r\u1ED3ng thi\xEAng",
    weaponSlotName: "Long Th\u01B0\u01A1ng Th\xE1i C\u1ED5",
    armorSlotName: "Long Gi\xE1p V\u1EA3y R\u1ED3ng",
    accessorySlotName: "Long Ch\xE2u / V\u1EA3y R\u1ED3ng Th\u1EA7n",
    weaponIcon: "\u{1F531}",
    armorIcon: "\u{1F6E1}\uFE0F",
    accessoryIcon: "\u{1F52E}",
    description: "Th\u1EEBa h\u01B0\u1EDFng long huy\u1EBFt v\u0129 \u0111\u1EA1i, c\xE0n qu\xE9t sa tr\u01B0\u1EDDng b\u1EB1ng ng\u1ECDn gi\xE1o r\u1ED3ng th\u1EA7n."
  }
};
var WEAPONS_BY_PROFESSION = {
  archer: ["Cung S\u0103n R\u1EEBng Xanh", "Cung G\u1ED7 Tinh Linh", "Th\u1EA7n Cung Phong B\xE3o", "N\u1ECF Th\u1EA7n B\u0103ng Gi\xE1", "Nguy\u1EC7t \u1EA2nh Cung", "V\xF4 \u1EA2nh Th\u1EA7n Cung"],
  mage: ["G\u1EADy Ph\xE9p H\u1ECDc Vi\u1EC7c", "Tr\u01B0\u1EE3ng H\u1ECFa Long", "Ph\xE1p Tr\u01B0\u1EE3ng H\u01B0 V\xF4", "Quy\u1EC1n Tr\u01B0\u1EE3ng B\xE3o L\u1EEDa", "Th\xE1nh Tr\u01B0\u1EE3ng Tinh T\xFA", "Tr\u01B0\u1EE3ng H\u1ED7n Mang"],
  golem: ["Ch\xF9y Kh\u1ED1i \u0110\xE1", "B\xFAa R\xE8n C\u1EF1 Th\u1EA7n", "Ch\xF9y Gai Nham Th\u1EA1ch", "N\u1EAFm \u0110\u1EA5m H\u1ED9 V\u1EC7", "Thi\xEAn Nham Thi\u1EBFt Ch\xF9y", "C\u1ED9t Tr\u1EE5 Titan"],
  assassin: ["Dao G\u0103m Th\xE9p \u0110en", "\u0110o\u1EA3n Ki\u1EBFm T\u1EA9m \u0110\u1ED9c", "Song \u0110ao Huy\u1EBFt D\u1EA1", "L\u01B0\u1EE1i H\xE1i V\xF4 \u1EA2nh", "Tuy\u1EC7t M\u1EC7nh Song \u0110ao", "Th\u1EA7n Ki\u1EBFm H\u01B0 Kh\xF4ng"],
  priestess: ["Chu\xF4ng Nguy\u1EC7n C\u1EA7u", "Tr\u01B0\u1EE3ng Th\xE1nh Linh", "Quy\u1EC1n Tr\u01B0\u1EE3ng \xC1nh S\xE1ng", "G\u1EADy Ph\xE9p Tinh Linh", "Th\xE1nh Quang Th\u1EA7n Tr\u01B0\u1EE3ng", "Kh\u1EA3i Ho\xE0n Th\xE1nh Tr\u01B0\u1EE3ng"],
  dragon_knight: ["Tr\u01B0\u1EDDng Th\u01B0\u01A1ng Hi\u1EC7p S\u0129", "Long Th\u01B0\u01A1ng V\u1EA3y \u0110\u1ECF", "Chi\u1EBFn K\xEDch Long Th\u1EA7n", "H\u1EAFc Long Tr\u1EA3m \u0110ao", "B\xE1 V\u01B0\u01A1ng Long Th\u01B0\u01A1ng", "Long Th\u1EA7n Di\u1EC7t Th\u1EBF Th\u01B0\u01A1ng"]
};
var ARMORS_BY_PROFESSION = {
  archer: ["\xC1o V\u1EA3i Ng\u1EE5y Trang", "\xC1o Cho\xE0ng Gi\xF3", "Gi\xE1p Da X\u1EA1 Th\u1EE7", "M\u0169 Th\u1EE3 S\u0103n Tinh Linh", "V\u0169 D\u1EF1c Phi Phong", "Th\u1EA7n Phong V\u0169 Y"],
  mage: ["\xC1o Cho\xE0ng T\xE2n Ph\xE1p S\u01B0", "Ph\xE1p B\xE0o H\u1ECFa Linh", "\xC1o Cho\xE0ng Ma L\u1EF1c", "V\u01B0\u01A1ng Mi\u1EC7n Nguy\xEAn T\u1ED1", "H\u1EAFc Ma \xC1o Cho\xE0ng", "Ch\xED T\xF4n Ma Th\u1EA7n B\xE0o"],
  golem: ["T\u1EA5m Ch\u1EAFn \u0110\xE1 Hoa", "Gi\xE1p H\u1EAFc Th\u1EA1ch", "Khi\xEAn B\xE0n Th\u1EA1ch", "Kh\u1ED1i Nham Th\u1EA1ch B\u1EA5t Ho\u1EA1i", "Th\xE1i C\u1ED5 Th\u1EA1ch Gi\xE1p", "Titan B\u1EA5t Di\u1EC7t Thu\u1EABn"],
  assassin: ["M\u1EB7t N\u1EA1 V\u1EA3i \u0110en", "Gi\xE1p Da D\u1EA1 H\xE0nh", "\xC1o Cho\xE0ng B\xF3ng T\u1ED1i", "H\u1EAFc Y Th\xEDch Kh\xE1ch", "U Linh \xC1m Y", "H\u01B0 Kh\xF4ng V\xF4 \u1EA2nh Gi\xE1p"],
  priestess: ["Kh\u0103n Th\xE1nh M\u1EABu", "Th\xE1nh Y B\u1EA1ch Ng\xE2n", "V\xF2ng Nguy\u1EC7t Qu\u1EBF \xC1nh S\xE1ng", "Trang Ph\u1EE5c Tinh Linh", "Thi\xEAn S\u1EE9 Th\xE1nh B\xE0o", "Th\u1EA7n Th\xE1nh Quang Huy Gi\xE1p"],
  dragon_knight: ["Gi\xE1p Da R\u1ED3ng L\u1EEDa", "Long Gi\xE1p V\u1EA3y R\u1ED3ng", "Khi\xEAn \u0110\u1EA7u R\u1ED3ng", "M\u0169 Gi\xE1p Long V\u01B0\u01A1ng", "Huy\u1EBFt Long Chi\u1EBFn Kh\u1EA3i", "Th\u1EA7n Long B\u1EA5t T\u1EED Gi\xE1p"]
};
var ACCESSORIES_BY_PROFESSION = {
  archer: ["\u1ED0ng T\xEAn S\u01A1 C\u1EA5p", "Nh\u1EABn Phong Linh", "K\xEDnh Ng\u1EAFm Tinh Linh", "B\xF9a \u01AF\u1EDBc Th\u1EA7n Phong", "L\xF4ng V\u0169 Ph\u01B0\u1EE3ng Ho\xE0ng", "Th\u1EA7n X\u1EA1 Di v\u1EADt"],
  mage: ["Qu\u1EA3 C\u1EA7u T\u1EADp S\u1EF1", "D\xE2y Chuy\u1EC1n Tinh T\xFA", "L\u1ECD Ma L\u1EF1c V\u0129nh C\u1EEDu", "Tr\xE1i Tim H\u1ECFa Long", "B\u1EA3o Ng\u1ECDc Nguy\xEAn T\u1ED1", "Tinh Th\u1EC3 H\u1ED7n Mang"],
  golem: ["M\u1EA3nh V\u1EE5n H\u1EAFc Th\u1EA1ch", "L\xF5i \u0110\u1ECBa C\u1EA7u", "Ph\xF9 Hi\u1EC7u C\u1EF1 Th\u1EA7n", "\u1EA4n T\xEDn B\xE0n Th\u1EA1ch", "Tr\xE1i Tim Nham Th\u1EA1ch", "Di V\u1EADt C\u1ED5 Titan"],
  assassin: ["Nh\u1EABn Th\xE9p \u0110en", "M\u1EB7t N\u1EA1 H\u01B0 Kh\xF4ng", "Nh\u1EABn \u0110o\u1EA1t M\u1EC7nh", "B\xF9a \xC1m D\u1EA1", "Huy\u1EBFt Ch\xE2u Th\xEDch Kh\xE1ch", "H\u01B0 Kh\xF4ng T\u1EED Th\u1EA7n Th\u1EA1ch"],
  priestess: ["Chu\u1ED7i H\u1EA1t B\xECnh An", "D\xE2y Chuy\u1EC1n Tinh Linh", "Th\xE1nh Huy \xC1nh S\xE1ng", "Ch\xE9n Th\xE1nh Ban Ph\xFAc", "B\u1EA3o Ch\xE2u Quang Di\u1EC7u", "H\xE0o Quang N\u1EEF Th\u1EA7n"],
  dragon_knight: ["M\xF3ng Vu\u1ED1t R\u1ED3ng Con", "V\u1EA3y R\u1ED3ng Th\u1EA7n", "Long Ch\xE2u Th\xE1i C\u1ED5", "Tr\xE1i Tim Long V\u01B0\u01A1ng", "B\u1EA3o H\u1ED9 Long Th\u1EA7n", "Di V\u1EADt Long Ho\xE0ng"]
};
function generateAllyLootItem(stage, forcedProfession, forcedSlot, rng = Math.random) {
  const professions = ["archer", "mage", "golem", "assassin", "priestess", "dragon_knight"];
  const profession = forcedProfession || professions[Math.floor(rng() * professions.length)];
  const profMeta = PROFESSION_METAS[profession];
  const slots = ["ally_weapon", "ally_armor", "ally_accessory"];
  const slot = forcedSlot || slots[Math.floor(rng() * slots.length)];
  const rarity = getRandomRarity(stage, rng);
  const rarityInfo = RARITY_CONFIG[rarity];
  const nameList = slot === "ally_weapon" ? WEAPONS_BY_PROFESSION[profession] : slot === "ally_armor" ? ARMORS_BY_PROFESSION[profession] : ACCESSORIES_BY_PROFESSION[profession];
  const baseName = nameList[Math.floor(rng() * nameList.length)];
  const itemLevel = 1;
  const stageScale = 1 + 0.03 * Math.max(0, stage - 1);
  const statScale = stageScale * rarityInfo.statMultiplier;
  let dpsBonusPercent = 0;
  let skillBonusPercent = 0;
  let cooldownReductionSec = 0;
  let teamBuffBonusPercent = 0;
  if (slot === "ally_weapon") {
    dpsBonusPercent = Math.round(25 * statScale);
    skillBonusPercent = Math.round(20 * statScale);
  } else if (slot === "ally_armor") {
    dpsBonusPercent = Math.round(15 * statScale);
    skillBonusPercent = Math.round(15 * statScale);
    cooldownReductionSec = Math.min(4, Math.round(0.5 * rarityInfo.statMultiplier * 10) / 10);
    teamBuffBonusPercent = Math.round(8 * statScale);
  } else {
    dpsBonusPercent = Math.round(18 * statScale);
    skillBonusPercent = Math.round(25 * statScale);
    cooldownReductionSec = Math.min(3, Math.round(0.4 * rarityInfo.statMultiplier * 10) / 10);
    teamBuffBonusPercent = Math.round(15 * statScale);
  }
  const sellValue = Math.round(25 * statScale);
  const upgradeCost = Math.round(40 * statScale);
  const icon = slot === "ally_weapon" ? profMeta.weaponIcon : slot === "ally_armor" ? profMeta.armorIcon : profMeta.accessoryIcon;
  return {
    id: `ally-item-${Math.floor(rng() * 1e12)}-${rng().toString(36).substring(2, 7)}`,
    name: baseName,
    profession,
    professionName: profMeta.name,
    slot,
    rarity,
    level: 1,
    dpsBonusPercent,
    skillBonusPercent,
    cooldownReductionSec,
    teamBuffBonusPercent,
    icon,
    description: `Trang b\u1ECB ${rarityInfo.name} chuy\xEAn d\u1EE5ng cho ${profMeta.name} c\u1EA5p ${itemLevel}.`,
    sellValue,
    upgradeCost
  };
}
var STARTER_ALLY_EQUIPMENT = {
  archer: {
    weapon: {
      id: "starter-archer-weapon",
      name: "Cung G\u1ED7 S\u01A1 C\u1EA5p (+1)",
      profession: "archer",
      professionName: "X\u1EA1 Th\u1EE7",
      slot: "ally_weapon",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 15,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: "\u{1F3F9}",
      description: "Cung g\u1ED7 kh\u1EDFi \u0111\u1EA7u gi\xFAp cung th\u1EE7 t\u0103ng t\u1ED1c \u0111\u1ED9 b\u1EAFn t\xEAn.",
      sellValue: 15,
      upgradeCost: 30
    },
    armor: {
      id: "starter-archer-armor",
      name: "\xC1o Cho\xE0ng R\u1EEBng Xanh (+1)",
      profession: "archer",
      professionName: "X\u1EA1 Th\u1EE7",
      slot: "ally_armor",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 10,
      skillBonusPercent: 10,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 5,
      icon: "\u{1FAB6}",
      description: "Kh\u0103n cho\xE0ng ng\u1EE5y trang b\u1EA3o h\u1ED9 cung th\u1EE7.",
      sellValue: 15,
      upgradeCost: 30
    },
    accessory: {
      id: "starter-archer-accessory",
      name: "\u1ED0ng T\xEAn Phong Linh (+1)",
      profession: "archer",
      professionName: "X\u1EA1 Th\u1EE7",
      slot: "ally_accessory",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 12,
      skillBonusPercent: 18,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 8,
      icon: "\u{1F3AF}",
      description: "\u1ED0ng t\xEAn tinh linh gi\xFAp t\xEAn b\u1EAFn nhanh v\xE0 chu\u1EA9n x\xE1c h\u01A1n.",
      sellValue: 15,
      upgradeCost: 30
    }
  },
  mage: {
    weapon: {
      id: "starter-mage-weapon",
      name: "G\u1EADy Ph\xE9p T\u1EADp S\u1EF1 (+1)",
      profession: "mage",
      professionName: "Ph\xE1p S\u01B0",
      slot: "ally_weapon",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 25,
      skillBonusPercent: 20,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: "\u{1FA84}",
      description: "G\u1EADy g\u1ED7 t\u1EADp ng\u01B0ng t\u1EE5 qu\u1EA3 c\u1EA7u ma thu\u1EADt.",
      sellValue: 20,
      upgradeCost: 40
    },
    armor: {
      id: "starter-mage-armor",
      name: "Ph\xE1p B\xE0o H\u1ECDc Vi\u1EC7c (+1)",
      profession: "mage",
      professionName: "Ph\xE1p S\u01B0",
      slot: "ally_armor",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 12,
      skillBonusPercent: 12,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 5,
      icon: "\u{1F52E}",
      description: "\xC1o cho\xE0ng gi\xFAp \u1ED5n \u0111\u1ECBnh lu\u1ED3ng ma l\u1EF1c.",
      sellValue: 20,
      upgradeCost: 40
    },
    accessory: {
      id: "starter-mage-accessory",
      name: "Qu\u1EA3 C\u1EA7u Tinh T\xFA (+1)",
      profession: "mage",
      professionName: "Ph\xE1p S\u01B0",
      slot: "ally_accessory",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 22,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 10,
      icon: "\u2728",
      description: "Qu\u1EA3 c\u1EA7u th\u1EE7y tinh khu\u1EBFch \u0111\u1EA1i uy l\u1EF1c ph\xE1p thu\u1EADt.",
      sellValue: 20,
      upgradeCost: 40
    }
  },
  golem: {
    weapon: {
      id: "starter-golem-weapon",
      name: "Ch\xF9y Kh\u1ED1i \u0110\xE1 Nh\u1ECF (+1)",
      profession: "golem",
      professionName: "H\u1ED9 V\u1EC7 Titan",
      slot: "ally_weapon",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 22,
      skillBonusPercent: 20,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: "\u{1F528}",
      description: "Kh\u1ED1i \u0111\xE1 th\xF4 c\u1EE9ng t\u1EA1o n\xEAn c\xFA \u0111\u1EADp m\u1EA1nh m\u1EBD.",
      sellValue: 30,
      upgradeCost: 60
    },
    armor: {
      id: "starter-golem-armor",
      name: "T\u1EA5m Ch\u1EAFn \u0110\u1EA5t M\u1EB9 (+1)",
      profession: "golem",
      professionName: "H\u1ED9 V\u1EC7 Titan",
      slot: "ally_armor",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 10,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 8,
      icon: "\u{1FAA8}",
      description: "M\u1EB7t gi\xE1p b\u1EB1ng \u0111\xE1 hoa gia c\u1ED1 th\xE2n th\u1EC3 Titan.",
      sellValue: 30,
      upgradeCost: 60
    },
    accessory: {
      id: "starter-golem-accessory",
      name: "L\xF5i \u0110\u1ECBa C\u1EA7u Titan (+1)",
      profession: "golem",
      professionName: "H\u1ED9 V\u1EC7 Titan",
      slot: "ally_accessory",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 16,
      skillBonusPercent: 18,
      cooldownReductionSec: 0.4,
      teamBuffBonusPercent: 12,
      icon: "\u{1F48E}",
      description: "Tinh th\u1EA1ch l\xF5i \u0111\u1EA5t nung n\xF3ng n\u0103ng l\u01B0\u1EE3ng b\xE0n th\u1EA1ch.",
      sellValue: 30,
      upgradeCost: 60
    }
  },
  assassin: {
    weapon: {
      id: "starter-assassin-weapon",
      name: "\u0110o\u1EA3n \u0110ao H\u1EAFc S\u1EAFc (+1)",
      profession: "assassin",
      professionName: "S\xE1t Th\u1EE7",
      slot: "ally_weapon",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 30,
      skillBonusPercent: 25,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: "\u{1F5E1}\uFE0F",
      description: "L\u01B0\u1EE1i \u0111o\u1EA3n \u0111ao r\xE8n th\xE9p \u0111en s\u1EAFc b\xE9n.",
      sellValue: 50,
      upgradeCost: 100
    },
    armor: {
      id: "starter-assassin-armor",
      name: "Gi\xE1p Da D\u1EA1 H\xE0nh (+1)",
      profession: "assassin",
      professionName: "S\xE1t Th\u1EE7",
      slot: "ally_armor",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 15,
      cooldownReductionSec: 0.8,
      teamBuffBonusPercent: 5,
      icon: "\u{1F3AD}",
      description: "Trang ph\u1EE5c \u0111en tuy\u1EC1n gi\xFAp s\xE1t th\u1EE7 h\xF2a v\xE0o b\xF3ng t\u1ED1i.",
      sellValue: 50,
      upgradeCost: 100
    },
    accessory: {
      id: "starter-assassin-accessory",
      name: "Nh\u1EABn \u0110o\u1EA1t M\u1EC7nh (+1)",
      profession: "assassin",
      professionName: "S\xE1t Th\u1EE7",
      slot: "ally_accessory",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 25,
      cooldownReductionSec: 0.6,
      teamBuffBonusPercent: 8,
      icon: "\u{1F48D}",
      description: "Chi\u1EBFc nh\u1EABn t\u1EA9m \xE1m kh\xED t\u0103ng kh\u1EA3 n\u0103ng ch\xED m\u1EA1ng hi\u1EC3m \xE1c.",
      sellValue: 50,
      upgradeCost: 100
    }
  },
  priestess: {
    weapon: {
      id: "starter-priestess-weapon",
      name: "Tr\u01B0\u1EE3ng Tinh Linh Non (+1)",
      profession: "priestess",
      professionName: "Th\xE1nh N\u1EEF",
      slot: "ally_weapon",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 30,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 10,
      icon: "\u2728",
      description: "C\xE0nh c\xE2y th\u1EA7n ph\xE1t s\xE1ng ban ph\u01B0\u1EDBc l\xE0nh.",
      sellValue: 80,
      upgradeCost: 150
    },
    armor: {
      id: "starter-priestess-armor",
      name: "V\xF2ng Nguy\u1EC7t Qu\u1EBF (+1)",
      profession: "priestess",
      professionName: "Th\xE1nh N\u1EEF",
      slot: "ally_armor",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 12,
      skillBonusPercent: 20,
      cooldownReductionSec: 1,
      teamBuffBonusPercent: 10,
      icon: "\u{1F451}",
      description: "V\u01B0\u01A1ng mi\u1EC7n k\u1EBFt t\u1EEB l\xE1 c\xE2y th\xE1nh quang.",
      sellValue: 80,
      upgradeCost: 150
    },
    accessory: {
      id: "starter-priestess-accessory",
      name: "D\xE2y Chuy\u1EC1n Th\xE1nh Quang (+1)",
      profession: "priestess",
      professionName: "Th\xE1nh N\u1EEF",
      slot: "ally_accessory",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 30,
      cooldownReductionSec: 0.8,
      teamBuffBonusPercent: 18,
      icon: "\u{1F4FF}",
      description: "Chu\u1ED7i ng\u1ECDc th\xE1nh li\xEAn t\u1EE5c t\xEDch l\u0169y linh l\u1EF1c ch\u1EEFa l\xE0nh.",
      sellValue: 80,
      upgradeCost: 150
    }
  },
  dragon_knight: {
    weapon: {
      id: "starter-dragon-weapon",
      name: "Long Th\u01B0\u01A1ng R\xE8n Th\xF4 (+1)",
      profession: "dragon_knight",
      professionName: "K\u1EF5 S\u0129 Long V\u01B0\u01A1ng",
      slot: "ally_weapon",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 35,
      skillBonusPercent: 25,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 8,
      icon: "\u{1F531}",
      description: "Thanh tr\u01B0\u1EDDng th\u01B0\u01A1ng \u0111\xFAc b\u1EB1ng v\u1EA3y r\u1ED3ng non.",
      sellValue: 120,
      upgradeCost: 250
    },
    armor: {
      id: "starter-dragon-armor",
      name: "Long Gi\xE1p V\u1EA3y \u0110\u1ECF (+1)",
      profession: "dragon_knight",
      professionName: "K\u1EF5 S\u0129 Long V\u01B0\u01A1ng",
      slot: "ally_armor",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 15,
      cooldownReductionSec: 1,
      teamBuffBonusPercent: 12,
      icon: "\u{1F6E1}\uFE0F",
      description: "T\u1EA5m gi\xE1p ki\xEAn c\u1ED1 ch\u1ED1ng ch\u1ECBu h\u01A1i th\u1EDF r\u1ED3ng d\u1EEF.",
      sellValue: 120,
      upgradeCost: 250
    },
    accessory: {
      id: "starter-dragon-accessory",
      name: "Long Ch\xE2u Th\xE1i C\u1ED5 (+1)",
      profession: "dragon_knight",
      professionName: "K\u1EF5 S\u0129 Long V\u01B0\u01A1ng",
      slot: "ally_accessory",
      rarity: "common",
      level: 1,
      dpsBonusPercent: 25,
      skillBonusPercent: 30,
      cooldownReductionSec: 0.8,
      teamBuffBonusPercent: 15,
      icon: "\u{1F52E}",
      description: "Vi\xEAn long ch\xE2u c\u1ED5 t\u1ECFa nhi\u1EC7t huy\u1EBFt r\u1ED3ng th\u1EA7n uy d\u0169ng.",
      sellValue: 120,
      upgradeCost: 250
    }
  }
};
function calculateAllyItemPower(item) {
  if (!item) return 0;
  return Math.round(
    item.dpsBonusPercent * 1.5 + item.skillBonusPercent * 1.2 + item.cooldownReductionSec * 15 + item.teamBuffBonusPercent * 2 + item.level * 3
  );
}

// src/games/dungeon-tap/skillsAndAllies.ts
var INITIAL_SKILLS = [
  {
    id: "heavenly_strike",
    name: "Thi\xEAn Ki\u1EBFm",
    icon: "\u26A1",
    description: "Tri\u1EC7u h\u1ED3i c\u1EF1 ki\u1EBFm \xE1nh s\xE1ng gi\xE1ng xu\u1ED1ng g\xE2y s\xE1t th\u01B0\u01A1ng kh\u1ED5ng l\u1ED3 (x45 S\xE1t Th\u01B0\u01A1ng Ch\xE9m)!",
    manaCost: 20,
    cooldown: 8,
    currentCooldown: 0,
    duration: 0,
    activeRemaining: 0,
    level: 1,
    unlockLevel: 1,
    baseUpgradeCost: 100,
    upgradeCost: 100,
    multiplier: 45
  },
  {
    id: "berserker_rage",
    name: "Cu\u1ED3ng N\u1ED9",
    icon: "\u{1F525}",
    description: "K\xEDch ho\u1EA1t tr\u1EA1ng th\xE1i cu\u1ED3ng s\xE1t: 100% T\u1EC9 L\u1EC7 B\u1EA1o K\xEDch v\xE0 S\xE1t Th\u01B0\u01A1ng x3.0!",
    manaCost: 35,
    cooldown: 25,
    currentCooldown: 0,
    duration: 10,
    activeRemaining: 0,
    level: 1,
    unlockLevel: 5,
    baseUpgradeCost: 350,
    upgradeCost: 350,
    multiplier: 3
  },
  {
    id: "hand_of_midas",
    name: "B\xE0n Tay V\xE0ng",
    icon: "\u{1F4B0}",
    description: "Ch\u1EA1m tay h\xF3a v\xE0ng trong 15s: M\u1ED7i c\xFA tap v\xE0 \u0111\xF2n \u0111\xE1nh c\u1EE7a \u0111\u1ED3ng \u0111\u1ED9i r\u01A1i x5.0 V\xE0ng!",
    manaCost: 40,
    cooldown: 35,
    currentCooldown: 0,
    duration: 15,
    activeRemaining: 0,
    level: 1,
    unlockLevel: 10,
    baseUpgradeCost: 1200,
    upgradeCost: 1200,
    multiplier: 5
  },
  {
    id: "shadow_clone",
    name: "Ph\xE2n Th\xE2n",
    icon: "\u{1F5E1}\uFE0F",
    description: "Tri\u1EC7u h\u1ED3i b\xF3ng ma s\xE1t th\u1EE7 t\u1EF1 \u0111\u1ED9ng ch\xE9m qu\xE1i v\u1EDBi 80% S\xE1t Th\u01B0\u01A1ng Tap li\xEAn t\u1EE5c trong 15s!",
    manaCost: 50,
    cooldown: 45,
    currentCooldown: 0,
    duration: 15,
    activeRemaining: 0,
    level: 1,
    unlockLevel: 15,
    baseUpgradeCost: 4500,
    upgradeCost: 4500,
    multiplier: 0.8
  },
  {
    id: "blade_storm",
    name: "B\xE3o Ki\u1EBFm",
    icon: "\u{1F32A}\uFE0F",
    description: "Xoay t\xEDt b\xE3o ki\u1EBFm tr\u1EA3m li\xEAn ho\xE0n: Ch\xE9m x12 S\xE1t Th\u01B0\u01A1ng Tap m\u1ED7i 0.4s li\xEAn t\u1EE5c trong 10s!",
    manaCost: 45,
    cooldown: 30,
    currentCooldown: 0,
    duration: 10,
    activeRemaining: 0,
    level: 1,
    unlockLevel: 20,
    baseUpgradeCost: 12e3,
    upgradeCost: 12e3,
    multiplier: 12
  },
  {
    id: "war_cry",
    name: "Chi\u1EBFn Kh\u1EA3i",
    icon: "\u{1F3BA}",
    description: "H\u1ED1ng vang chi\u1EBFn tr\u1EADn: T\u0103ng +150% S\xE1t Th\u01B0\u01A1ng \u0110\u1ED3ng \u0110\u1ED9i v\xE0 h\u1ED3i ph\u1EE5c ngay +30 Mana trong 12s!",
    manaCost: 50,
    cooldown: 40,
    currentCooldown: 0,
    duration: 12,
    activeRemaining: 0,
    level: 1,
    unlockLevel: 25,
    baseUpgradeCost: 35e3,
    upgradeCost: 35e3,
    multiplier: 2.5
  },
  {
    id: "radiant_slash",
    name: "Quang Di\u1EC7m",
    icon: "\u26A1\u2694\uFE0F",
    description: "Th\u1EA7n ki\u1EBFm quang l\xF4i gi\xE1ng th\u1EBF: G\xE2y x85 S\xE1t Th\u01B0\u01A1ng Tap v\xE0 ph\xE1 gi\xE1p qu\xE1i v\u1EADt (+50% s\xE1t th\u01B0\u01A1ng nh\u1EADn) trong 8s!",
    manaCost: 60,
    cooldown: 22,
    currentCooldown: 0,
    duration: 8,
    activeRemaining: 0,
    level: 1,
    unlockLevel: 30,
    baseUpgradeCost: 1e5,
    upgradeCost: 1e5,
    multiplier: 85
  }
];
var INITIAL_ALLIES = [
  {
    id: "ally-archer",
    name: "Cung Th\u1EE7 Tinh Anh",
    avatar: "\u{1F3F9}",
    title: "X\u1EA1 Th\u1EE7 R\u1EEBng Xanh",
    profession: "archer",
    professionName: "X\u1EA1 Th\u1EE7",
    professionIcon: "\u{1F3F9}",
    level: 1,
    baseDmg: 8,
    currentDmg: 8,
    baseCost: 50,
    upgradeCost: 60,
    unlocked: true,
    dpsBonusType: "all",
    description: "B\u1EAFn t\xEAn li\xEAn t\u1EE5c t\u1EEB xa v\xE0o \u0111i\u1EC3m y\u1EBFu c\u1EE7a qu\xE1i v\u1EADt.",
    skill: {
      id: "skill-archer-rain",
      name: "M\u01B0a T\xEAn Xuy\xEAn Ph\xE1",
      icon: "\u{1F3F9}\u26A1",
      description: "B\xE3o t\xEAn li\xEAn ho\xE0n g\xE2y s\xE1t th\u01B0\u01A1ng b\u1ED9c ph\xE1t c\u1EF1c m\u1EA1nh.",
      cooldown: 8,
      currentCooldown: 8,
      level: 1,
      baseMultiplier: 6,
      effectType: "burst"
    },
    skills: [
      {
        id: "skill-archer-rain",
        name: "M\u01B0a T\xEAn Xuy\xEAn Ph\xE1",
        icon: "\u{1F3F9}\u26A1",
        description: "B\xE3o t\xEAn li\xEAn ho\xE0n g\xE2y s\xE1t th\u01B0\u01A1ng b\u1ED9c ph\xE1t c\u1EF1c m\u1EA1nh.",
        cooldown: 8,
        currentCooldown: 8,
        level: 1,
        baseMultiplier: 6,
        effectType: "burst"
      },
      {
        id: "skill-archer-frost",
        name: "Ti\u1EC5n Phong B\u0103ng Gi\xE1",
        icon: "\u{1F3F9}\u2744\uFE0F",
        description: "T\xEAn b\u0103ng l\xE0m ch\u1EADm qu\xE1i & k\xE9o d\xE0i th\u1EDDi gian Tr\xF9m +2s.",
        cooldown: 12,
        currentCooldown: 12,
        level: 1,
        baseMultiplier: 5,
        effectType: "buff"
      },
      {
        id: "skill-archer-sniper",
        name: "Xuy\xEAn T\xE2m Th\u1EA7n Ti\u1EC5n",
        icon: "\u{1F3AF}\u{1F3F9}",
        description: "M\u0169i t\xEAn ch\xED m\u1EA1ng xuy\xEAn gi\xE1p g\xE2y x18 DPS b\u1ED9c ph\xE1t.",
        cooldown: 15,
        currentCooldown: 15,
        level: 1,
        baseMultiplier: 18,
        effectType: "burst"
      }
    ],
    currentSkillIndex: 0,
    equippedWeapon: STARTER_ALLY_EQUIPMENT.archer.weapon,
    equippedArmor: STARTER_ALLY_EQUIPMENT.archer.armor,
    equippedAccessory: STARTER_ALLY_EQUIPMENT.archer.accessory
  },
  {
    id: "ally-mage",
    name: "Ph\xE1p S\u01B0 L\u1EEDa",
    avatar: "\u{1F9D9}\u200D\u2642\uFE0F",
    title: "\u0110\u1EA1i Ph\xE1p S\u01B0 H\u1ECFa H\u1EC7",
    profession: "mage",
    professionName: "Ph\xE1p S\u01B0",
    professionIcon: "\u{1F9D9}\u200D\u2642\uFE0F",
    level: 0,
    baseDmg: 25,
    currentDmg: 0,
    baseCost: 200,
    upgradeCost: 200,
    unlocked: false,
    dpsBonusType: "crit",
    description: "Ph\xF3ng qu\u1EA3 c\u1EA7u l\u1EEDa ma thu\u1EADt thi\xEAu \u0111\u1ED1t qu\xE1i v\u1EADt.",
    skill: {
      id: "skill-mage-meteor",
      name: "Thi\xEAn Th\u1EA1ch H\u1ECFa Di\u1EC7m",
      icon: "\u2604\uFE0F\u{1F525}",
      description: "Tri\u1EC7u h\u1ED3i thi\xEAn th\u1EA1ch thi\xEAu r\u1EE5i qu\xE1i v\u1EADt v\u1EDBi l\u01B0\u1EE3ng s\xE1t th\u01B0\u01A1ng kh\u1ED5ng l\u1ED3.",
      cooldown: 10,
      currentCooldown: 10,
      level: 1,
      baseMultiplier: 10,
      effectType: "damage"
    },
    skills: [
      {
        id: "skill-mage-meteor",
        name: "Thi\xEAn Th\u1EA1ch H\u1ECFa Di\u1EC7m",
        icon: "\u2604\uFE0F\u{1F525}",
        description: "Tri\u1EC7u h\u1ED3i thi\xEAn th\u1EA1ch thi\xEAu r\u1EE5i qu\xE1i v\u1EADt v\u1EDBi l\u01B0\u1EE3ng s\xE1t th\u01B0\u01A1ng kh\u1ED5ng l\u1ED3.",
        cooldown: 10,
        currentCooldown: 10,
        level: 1,
        baseMultiplier: 10,
        effectType: "damage"
      },
      {
        id: "skill-mage-blizzard",
        name: "B\xE3o Tuy\u1EBFt B\u0103ng Gi\xE1",
        icon: "\u2744\uFE0F\u{1F32A}\uFE0F",
        description: "B\xE3o tuy\u1EBFt g\xE2y s\xE1t th\u01B0\u01A1ng b\u0103ng v\xE0 h\u1ED3i ph\u1EE5c ngay +12 MP.",
        cooldown: 13,
        currentCooldown: 13,
        level: 1,
        baseMultiplier: 7,
        effectType: "mana"
      },
      {
        id: "skill-mage-thunder",
        name: "L\xF4i \u0110\xECnh V\u1EA1n Qu\xE2n",
        icon: "\u26A1\u{1F9D9}\u200D\u2642\uFE0F",
        description: "Ph\xF3ng lu\u1ED3ng s\xE9t nguy\xEAn t\u1ED1 g\xE2y x20 DPS h\u1EE7y di\u1EC7t.",
        cooldown: 16,
        currentCooldown: 16,
        level: 1,
        baseMultiplier: 20,
        effectType: "burst"
      }
    ],
    currentSkillIndex: 0,
    equippedWeapon: STARTER_ALLY_EQUIPMENT.mage.weapon,
    equippedArmor: STARTER_ALLY_EQUIPMENT.mage.armor,
    equippedAccessory: STARTER_ALLY_EQUIPMENT.mage.accessory
  },
  {
    id: "ally-golem",
    name: "Ng\u01B0\u1EDDi \u0110\xE1 Titan",
    avatar: "\u{1F5FF}",
    title: "H\u1ED9 V\u1EC7 \u0110\u1EA5t M\u1EB9",
    profession: "golem",
    professionName: "H\u1ED9 V\u1EC7 Titan",
    professionIcon: "\u{1F5FF}",
    level: 0,
    baseDmg: 75,
    currentDmg: 0,
    baseCost: 800,
    upgradeCost: 800,
    unlocked: false,
    dpsBonusType: "tap",
    description: "\u0110\u1EA5m m\u1EA1nh xu\u1ED1ng m\u1EB7t \u0111\u1EA5t g\xE2y ch\u1EA5n \u0111\u1ED9ng di\u1EC7n r\u1ED9ng.",
    skill: {
      id: "skill-golem-quake",
      name: "\u0110\u1ECBa Ch\u1EA5n Kinh Thi\xEAn",
      icon: "\u{1F5FF}\u{1F4A5}",
      description: "D\u1EABm m\u1EA1nh xu\u1ED1ng \u0111\u1EA5t g\xE2y ch\u1EA5n \u0111\u1ED9ng di\u1EC7n r\u1ED9ng h\u1ED7 tr\u1EE3 s\xE1t th\u01B0\u01A1ng to\xE0n \u0111\u1ED9i.",
      cooldown: 12,
      currentCooldown: 12,
      level: 1,
      baseMultiplier: 8,
      effectType: "quake"
    },
    skills: [
      {
        id: "skill-golem-quake",
        name: "\u0110\u1ECBa Ch\u1EA5n Kinh Thi\xEAn",
        icon: "\u{1F5FF}\u{1F4A5}",
        description: "D\u1EABm m\u1EA1nh xu\u1ED1ng \u0111\u1EA5t g\xE2y ch\u1EA5n \u0111\u1ED9ng di\u1EC7n r\u1ED9ng h\u1ED7 tr\u1EE3 s\xE1t th\u01B0\u01A1ng to\xE0n \u0111\u1ED9i.",
        cooldown: 12,
        currentCooldown: 12,
        level: 1,
        baseMultiplier: 8,
        effectType: "quake"
      },
      {
        id: "skill-golem-shield",
        name: "Nham Th\u1EA1ch H\u1ED9 Th\u1EC3",
        icon: "\u{1FAA8}\u{1F6E1}\uFE0F",
        description: "K\xEDch ho\u1EA1t khi\xEAn \u0111\xE1 t\u0103ng +30% S\xE1t Th\u01B0\u01A1ng to\xE0n \u0111\u1ED9i trong 8s.",
        cooldown: 15,
        currentCooldown: 15,
        level: 1,
        baseMultiplier: 6,
        effectType: "buff"
      },
      {
        id: "skill-golem-slam",
        name: "C\u1EF1 Nh\xE2n Ph\u1EABn N\u1ED9",
        icon: "\u{1F528}\u{1F5FF}",
        description: "C\xFA \u0111\u1EADp ng\xE0n c\xE2n nghi\u1EC1n n\xE1t gi\xE1p qu\xE1i v\u1EADt x22 DPS.",
        cooldown: 18,
        currentCooldown: 18,
        level: 1,
        baseMultiplier: 22,
        effectType: "burst"
      }
    ],
    currentSkillIndex: 0,
    equippedWeapon: STARTER_ALLY_EQUIPMENT.golem.weapon,
    equippedArmor: STARTER_ALLY_EQUIPMENT.golem.armor,
    equippedAccessory: STARTER_ALLY_EQUIPMENT.golem.accessory
  },
  {
    id: "ally-assassin",
    name: "S\xE1t Th\u1EE7 B\xF3ng T\u1ED1i",
    avatar: "\u{1F977}",
    title: "L\u01B0\u1EE1i Dao V\xF4 \u1EA2nh",
    profession: "assassin",
    professionName: "S\xE1t Th\u1EE7",
    professionIcon: "\u{1F977}",
    level: 0,
    baseDmg: 240,
    currentDmg: 0,
    baseCost: 3500,
    upgradeCost: 3500,
    unlocked: false,
    dpsBonusType: "crit",
    description: "Xu\u1EA5t qu\u1EF7 nh\u1EADp th\u1EA7n ch\xE9m v\xE0o t\u1EED huy\u1EC7t qu\xE1i v\u1EADt.",
    skill: {
      id: "skill-assassin-deathstrike",
      name: "Tr\u1EA3m K\xEDch H\u01B0 Kh\xF4ng",
      icon: "\u{1F977}\u{1F5E1}\uFE0F",
      description: "Tr\u1EA3m k\xEDch t\u1EED huy\u1EC7t qu\xE1i v\u1EADt g\xE2y s\xE1t th\u01B0\u01A1ng b\u1EA1o k\xEDch ch\xED t\u1EED 100%.",
      cooldown: 9,
      currentCooldown: 9,
      level: 1,
      baseMultiplier: 15,
      effectType: "burst"
    },
    skills: [
      {
        id: "skill-assassin-deathstrike",
        name: "Tr\u1EA3m K\xEDch H\u01B0 Kh\xF4ng",
        icon: "\u{1F977}\u{1F5E1}\uFE0F",
        description: "Tr\u1EA3m k\xEDch t\u1EED huy\u1EC7t qu\xE1i v\u1EADt g\xE2y s\xE1t th\u01B0\u01A1ng b\u1EA1o k\xEDch ch\xED t\u1EED 100%.",
        cooldown: 9,
        currentCooldown: 9,
        level: 1,
        baseMultiplier: 15,
        effectType: "burst"
      },
      {
        id: "skill-assassin-poison",
        name: "Phi \u0110ao \u0110\u1ED9c D\u01B0\u1EE3c",
        icon: "\u{1F5E1}\uFE0F\u{1F9EA}",
        description: "Ph\xF3ng \xE1m kh\xED \u0111\u1ED9c g\xE2y s\xE1t th\u01B0\u01A1ng li\xEAn t\u1EE5c v\xE0 r\u1EDBt th\xEAm v\xE0ng.",
        cooldown: 12,
        currentCooldown: 12,
        level: 1,
        baseMultiplier: 9,
        effectType: "damage"
      },
      {
        id: "skill-assassin-shadow",
        name: "B\xF3ng Ma T\u1EED Th\u1EA7n",
        icon: "\u{1F464}\u26A1",
        description: "\xC1m s\xE1t sau l\u01B0ng b\u1EB1ng \u0111\xF2n \u0111\xE1nh ch\xED t\u1EED x25 DPS.",
        cooldown: 16,
        currentCooldown: 16,
        level: 1,
        baseMultiplier: 25,
        effectType: "burst"
      }
    ],
    currentSkillIndex: 0,
    equippedWeapon: STARTER_ALLY_EQUIPMENT.assassin.weapon,
    equippedArmor: STARTER_ALLY_EQUIPMENT.assassin.armor,
    equippedAccessory: STARTER_ALLY_EQUIPMENT.assassin.accessory
  },
  {
    id: "ally-priestess",
    name: "N\u1EEF Th\u1EA7n \xC1nh S\xE1ng",
    avatar: "\u{1F9DA}\u200D\u2640\uFE0F",
    title: "Th\xE1nh N\u1EEF Tinh Linh",
    profession: "priestess",
    professionName: "Th\xE1nh N\u1EEF",
    professionIcon: "\u{1F9DA}\u200D\u2640\uFE0F",
    level: 0,
    baseDmg: 850,
    currentDmg: 0,
    baseCost: 15e3,
    upgradeCost: 15e3,
    unlocked: false,
    dpsBonusType: "gold",
    description: "Ban ph\xFAc l\xE0nh t\u0103ng l\u01B0\u1EE3ng v\xE0ng v\xE0 h\u1ED7 tr\u1EE3 \xE1nh s\xE1ng thanh t\u1EA9y.",
    skill: {
      id: "skill-priestess-blessing",
      name: "Th\xE1nh Quang Ph\xF9 Tr\u1EE3",
      icon: "\u{1F9DA}\u200D\u2640\uFE0F\u2728",
      description: "H\u1ED3i ph\u1EE5c t\u1EE9c th\xEC Mana cho Ki\u1EBFm S\u0129 v\xE0 r\u1EDBt th\xEAm v\xE0ng th\u01B0\u1EDFng!",
      cooldown: 12,
      currentCooldown: 12,
      level: 1,
      baseMultiplier: 25,
      effectType: "mana"
    },
    skills: [
      {
        id: "skill-priestess-blessing",
        name: "Th\xE1nh Quang Ph\xF9 Tr\u1EE3",
        icon: "\u{1F9DA}\u200D\u2640\uFE0F\u2728",
        description: "H\u1ED3i ph\u1EE5c t\u1EE9c th\xEC Mana cho Ki\u1EBFm S\u0129 v\xE0 r\u1EDBt th\xEAm v\xE0ng th\u01B0\u1EDFng!",
        cooldown: 12,
        currentCooldown: 12,
        level: 1,
        baseMultiplier: 25,
        effectType: "mana"
      },
      {
        id: "skill-priestess-cleanse",
        name: "Thanh T\u1EA9y Tinh Linh",
        icon: "\u{1F31F}\u{1F54A}\uFE0F",
        description: "Ban ph\u01B0\u1EDBc t\u0103ng +40% S\xE1t Th\u01B0\u01A1ng Tap cho Ki\u1EBFm S\u0129 trong 8s.",
        cooldown: 15,
        currentCooldown: 15,
        level: 1,
        baseMultiplier: 12,
        effectType: "buff"
      },
      {
        id: "skill-priestess-miracle",
        name: "Ph\xE9p M\xE0u C\u1EE9u Th\u1EBF",
        icon: "\u{1F496}\u2728",
        description: "T\u1EE9c th\xEC gi\u1EA3m 3s h\u1ED3i chi\xEAu cho to\xE0n b\u1ED9 k\u1EF9 n\u0103ng & h\u1ED3i +35 MP!",
        cooldown: 20,
        currentCooldown: 20,
        level: 1,
        baseMultiplier: 35,
        effectType: "cd_reduction"
      }
    ],
    currentSkillIndex: 0,
    equippedWeapon: STARTER_ALLY_EQUIPMENT.priestess.weapon,
    equippedArmor: STARTER_ALLY_EQUIPMENT.priestess.armor,
    equippedAccessory: STARTER_ALLY_EQUIPMENT.priestess.accessory
  },
  {
    id: "ally-dragon-knight",
    name: "K\u1EF5 S\u0129 Long V\u01B0\u01A1ng",
    avatar: "\u{1F432}",
    title: "Ch\xFAa T\u1EC3 Chi\u1EBFn Tr\u01B0\u1EDDng",
    profession: "dragon_knight",
    professionName: "K\u1EF5 S\u0129 Long V\u01B0\u01A1ng",
    professionIcon: "\u{1F432}",
    level: 0,
    baseDmg: 3200,
    currentDmg: 0,
    baseCost: 65e3,
    upgradeCost: 65e3,
    unlocked: false,
    dpsBonusType: "all",
    description: "C\u01B0\u1EE1i r\u1ED3ng phun l\u1EEDa c\xE0n qu\xE9t s\u1EA1ch m\u1ECDi ch\u01B0\u1EDBng ng\u1EA1i v\u1EADt.",
    skill: {
      id: "skill-dragon-roar",
      name: "Long H\u1ED1ng H\u1EE7y Di\u1EC7t",
      icon: "\u{1F432}\u{1F525}",
      description: "Tri\u1EC7u h\u1ED3i long h\u1ECFa c\xE0n qu\xE9t thi\xEAu \u0111\u1ED1t m\u1ECDi ch\u01B0\u1EDBng ng\u1EA1i v\u1EADt.",
      cooldown: 14,
      currentCooldown: 14,
      level: 1,
      baseMultiplier: 22,
      effectType: "burst"
    },
    skills: [
      {
        id: "skill-dragon-roar",
        name: "Long H\u1ED1ng H\u1EE7y Di\u1EC7t",
        icon: "\u{1F432}\u{1F525}",
        description: "Tri\u1EC7u h\u1ED3i long h\u1ECFa c\xE0n qu\xE9t thi\xEAu \u0111\u1ED1t m\u1ECDi ch\u01B0\u1EDBng ng\u1EA1i v\u1EADt.",
        cooldown: 14,
        currentCooldown: 14,
        level: 1,
        baseMultiplier: 22,
        effectType: "burst"
      },
      {
        id: "skill-dragon-rage",
        name: "Huy\u1EBFt Long Cu\u1ED3ng N\u1ED9",
        icon: "\u{1F409}\u{1FA78}",
        description: "Th\u1EE9c t\u1EC9nh long huy\u1EBFt t\u0103ng +50% S\xE1t Th\u01B0\u01A1ng to\xE0n \u0111\u1ED9i trong 8s.",
        cooldown: 17,
        currentCooldown: 17,
        level: 1,
        baseMultiplier: 15,
        effectType: "buff"
      },
      {
        id: "skill-dragon-cataclysm",
        name: "Long Th\u1EA7n Gi\xE1ng Th\u1EBF",
        icon: "\u{1F531}\u{1F432}",
        description: "C\xFA qu\xE9t th\u1EA7n long di\u1EC7t th\u1EBF g\xE2y x35 DPS b\u1ED9c ph\xE1t c\u1EF1c h\u1EA1n!",
        cooldown: 22,
        currentCooldown: 22,
        level: 1,
        baseMultiplier: 35,
        effectType: "burst"
      }
    ],
    currentSkillIndex: 0,
    equippedWeapon: STARTER_ALLY_EQUIPMENT.dragon_knight.weapon,
    equippedArmor: STARTER_ALLY_EQUIPMENT.dragon_knight.armor,
    equippedAccessory: STARTER_ALLY_EQUIPMENT.dragon_knight.accessory
  }
];

// src/games/dungeon-tap/utils/upgradeMath.ts
var HERO_BASE_COST = 18;
var HERO_COST_GROWTH = 1.18;
function calculateHeroUpgradeCost(currentLevel, count) {
  if (count <= 0) return 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.round(HERO_BASE_COST * Math.pow(HERO_COST_GROWTH, currentLevel + i - 1));
  }
  return total;
}
function getHeroMilestoneData(level) {
  const multiplier = Math.pow(1.1, Math.floor(level / 5));
  const prevMilestone = Math.floor(level / 5) * 5;
  const nextMilestone = prevMilestone + 5;
  const levelsToNext = nextMilestone - level;
  const progressPercent = Math.min(100, Math.max(0, (level - prevMilestone) / 5 * 100));
  return { multiplier, nextMilestone, progressPercent, levelsToNext };
}
function calculateAllyUpgradeCost(baseCost, currentLevel, count) {
  if (count <= 0) return 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.round(baseCost * Math.pow(1.2, currentLevel + i));
  }
  return total;
}
function getAllyMilestoneData(level) {
  let multiplier = 1;
  for (let m = 5; m <= level; m += 5) {
    multiplier *= 1.08;
  }
  const prevMilestone = Math.floor(level / 5) * 5;
  const nextMilestone = prevMilestone + 5;
  const progressPercent = Math.min(100, Math.max(0, (level - prevMilestone) / 5 * 100));
  return { multiplier, nextMilestone, progressPercent };
}
function getItemBaseStats(item) {
  if (!item) {
    return { tapDmgBonus: 0, heroDmgBonus: 0, critRateBonus: 0, goldBonus: 0, power: 0 };
  }
  if (item.baseLevelStats) {
    const b = item.baseLevelStats;
    const power2 = Math.round(
      (b.tapDmgBonus || 0) * 1 + (b.heroDmgBonus || 0) * 1 + (b.critRateBonus || 0) * 2.5 + (b.goldBonus || 0) * 0.8
    );
    return {
      tapDmgBonus: b.tapDmgBonus || 0,
      heroDmgBonus: b.heroDmgBonus || 0,
      critRateBonus: b.critRateBonus || 0,
      goldBonus: b.goldBonus || 0,
      power: power2
    };
  }
  const lvl = Math.max(1, item.level || 1);
  if (lvl === 1) {
    const power2 = Math.round(
      (item.tapDmgBonus || 0) * 1 + (item.heroDmgBonus || 0) * 1 + (item.critRateBonus || 0) * 2.5 + (item.goldBonus || 0) * 0.8
    );
    return {
      tapDmgBonus: item.tapDmgBonus || 0,
      heroDmgBonus: item.heroDmgBonus || 0,
      critRateBonus: item.critRateBonus || 0,
      goldBonus: item.goldBonus || 0,
      power: power2
    };
  }
  const factor = Math.pow(1.25, lvl - 1);
  const tapDmgBonus = Math.round((item.tapDmgBonus || 0) / factor);
  const heroDmgBonus = Math.round((item.heroDmgBonus || 0) / factor);
  const critRateBonus = Math.max(0, (item.critRateBonus || 0) - (lvl - 1));
  const goldBonus = Math.round((item.goldBonus || 0) / factor);
  const power = Math.round(
    tapDmgBonus * 1 + heroDmgBonus * 1 + critRateBonus * 2.5 + goldBonus * 0.8
  );
  return { tapDmgBonus, heroDmgBonus, critRateBonus, goldBonus, power };
}
function calculateItemBasePower(item) {
  if (!item) return 0;
  const base = getItemBaseStats(item);
  return base.power;
}
function calculateSkillUpgradeCost(baseCost, currentLevel, count = 1) {
  if (count <= 0) return 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.round(baseCost * Math.pow(1.35, currentLevel + i - 1));
  }
  return total;
}
function getSkillData(skillId, level) {
  switch (skillId) {
    case "heavenly_strike": {
      const currentMult = 8 + (level - 1) * 2;
      const nextMult = 8 + level * 2;
      return {
        primaryValue: currentMult,
        currentEffect: `G\xE2y x${currentMult} S\xE1t Th\u01B0\u01A1ng Ch\xE9m t\u1EE9c th\xEC`,
        nextEffect: `G\xE2y x${nextMult} S\xE1t Th\u01B0\u01A1ng Ch\xE9m (+2x)`
      };
    }
    case "berserker_rage": {
      const currentMult = Math.round((2 + (level - 1) * 0.1) * 10) / 10;
      const nextMult = Math.round((2 + level * 0.1) * 10) / 10;
      const currentDur = 10 + Math.floor((level - 1) / 2);
      const nextDur = 10 + Math.floor(level / 2);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `100% B\u1EA1o k\xEDch, S\xE1t th\u01B0\u01A1ng x${currentMult} trong ${currentDur}s`,
        nextEffect: `S\xE1t th\u01B0\u01A1ng x${nextMult} trong ${nextDur}s`
      };
    }
    case "hand_of_midas": {
      const currentMult = Math.round(Math.min(5, 2 + (level - 1) * 0.15) * 10) / 10;
      const nextMult = Math.round(Math.min(5, 2 + level * 0.15) * 10) / 10;
      const currentDur = 15 + Math.floor((level - 1) / 2);
      const nextDur = 15 + Math.floor(level / 2);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `Nh\u1EADn x${currentMult} V\xE0ng khi h\u1EA1 qu\xE1i trong ${currentDur}s`,
        nextEffect: `R\u01A1i x${nextMult} V\xE0ng trong ${nextDur}s`
      };
    }
    case "shadow_clone": {
      const currentRatio = Math.round((0.5 + (level - 1) * 0.05) * 100);
      const nextRatio = Math.round((0.5 + level * 0.05) * 100);
      const currentDur = 15 + Math.floor((level - 1) / 2);
      const nextDur = 15 + Math.floor(level / 2);
      return {
        primaryValue: currentRatio / 100,
        secondaryValue: currentDur,
        currentEffect: `Ch\xE9m li\xEAn t\u1EE5c v\u1EDBi ${currentRatio}% Tap Dmg trong ${currentDur}s`,
        nextEffect: `Ch\xE9m v\u1EDBi ${nextRatio}% Tap Dmg trong ${nextDur}s`
      };
    }
    case "blade_storm": {
      const currentMult = Math.round((1.5 + (level - 1) * 0.25) * 10) / 10;
      const nextMult = Math.round((1.5 + level * 0.25) * 10) / 10;
      const currentDur = 10 + Math.floor((level - 1) / 3);
      const nextDur = 10 + Math.floor(level / 3);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `B\xE3o ki\u1EBFm xoay ch\xE9m x${currentMult} Tap Dmg m\u1ED7i 0.4s trong ${currentDur}s`,
        nextEffect: `Ch\xE9m x${nextMult} Tap Dmg m\u1ED7i 0.4s trong ${nextDur}s`
      };
    }
    case "war_cry": {
      const currentMult = Math.round(Math.min(3.5, 1.5 + (level - 1) * 0.1) * 10) / 10;
      const nextMult = Math.round(Math.min(3.5, 1.5 + level * 0.1) * 10) / 10;
      const currentManaRestore = 30 + (level - 1) * 5;
      const currentDur = 12 + Math.floor((level - 1) / 2);
      const nextDur = 12 + Math.floor(level / 2);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `T\u0103ng x${currentMult} DPS \u0110\u1ED9i (+${Math.round((currentMult - 1) * 100)}%), h\u1ED3i +${currentManaRestore} MP trong ${currentDur}s`,
        nextEffect: `T\u0103ng x${nextMult} DPS \u0110\u1ED9i, h\u1ED3i +${currentManaRestore + 5} MP trong ${nextDur}s`
      };
    }
    case "radiant_slash": {
      const currentMult = 15 + (level - 1) * 4;
      const nextMult = 15 + level * 4;
      const currentArmorBreak = Math.min(80, 50 + (level - 1) * 3);
      const nextArmorBreak = Math.min(80, 50 + level * 3);
      return {
        primaryValue: currentMult,
        secondaryValue: currentArmorBreak,
        currentEffect: `G\xE2y x${currentMult} Tap Dmg t\u1EE9c th\xEC & Ph\xE1 gi\xE1p qu\xE1i (+${currentArmorBreak}% s\xE1t th\u01B0\u01A1ng nh\u1EADn) trong 8s`,
        nextEffect: `G\xE2y x${nextMult} Tap Dmg & Ph\xE1 gi\xE1p (+${nextArmorBreak}%) trong 8s`
      };
    }
    default:
      return {
        primaryValue: 1,
        currentEffect: "",
        nextEffect: ""
      };
  }
}

// src/games/dungeon-tap/engine.ts
var bounded = (n, fallback = 0, max = 1e120) => typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.min(max, n) : fallback;
var integer = (n, fallback = 1, max = 1e3) => Math.floor(bounded(n, fallback, max));
var clone = (v) => JSON.parse(JSON.stringify(v));
var random = (s) => {
  s.seed = Math.imul(1664525, s.seed) + 1013904223 >>> 0;
  return s.seed / 4294967296;
};
function tell(s, text, kind = "info") {
  s.event = { id: s.event.id + 1, text, kind };
}
function spawn(stage, wave = 1, farming = false) {
  const m = generateMonsterForStage(farming ? Math.max(1, stage - 1) : stage);
  const room = farming ? "scout" : roomFor(stage), rule = ROOM_RULES[room];
  const hp = Math.round(m.maxHp * (m.isBoss ? rule.hp / 5.5 : rule.hp / rule.waves));
  return { ...m, id: `room-${stage}-${wave}-${farming}`, stage, hp, maxHp: hp, goldReward: Math.round(m.goldReward * (m.isBoss ? rule.gold / 4.5 : rule.gold / rule.waves)) };
}
function spawnSquad(stage, wave = 1, farming = false, serial = 0) {
  const budget = spawn(stage, wave, farming), ch = Math.min(7, getStoryChapterForStage(stage).id - 1);
  if (budget.isBoss) {
    const chapter = getStoryChapterForStage(stage), titan = stage === chapter.endStage || stage > 200 && stage % 20 === 0;
    return [{ ...budget, role: "boss", rank: titan ? "titan" : "champion", species: titan ? -1 : (Math.floor(stage / 10) + serial) % 6, guardHits: 0, exposedFor: 0, id: `boss-${stage}-${serial}` }];
  }
  const kind = farming ? "scout" : roomFor(stage), count = SQUAD_COUNTS[kind] || 2;
  const species = squadSpecies(stage, wave, serial, count);
  const weights = species.map((i) => enemyRole(ch, i) === "guard" ? 1.3 : enemyRole(ch, i) === "swarm" ? 0.65 : enemyRole(ch, i) === "caster" ? 0.85 : 1), total = weights.reduce((a, b) => a + b, 0);
  let hpUsed = 0, goldUsed = 0;
  return species.map((variant, i) => {
    const last = i === count - 1, hp = last ? budget.maxHp - hpUsed : Math.floor(budget.maxHp * weights[i] / total), gold = last ? budget.goldReward - goldUsed : Math.floor(budget.goldReward * weights[i] / total);
    hpUsed += hp;
    goldUsed += gold;
    return { ...budget, id: `unit-${stage}-${wave}-${serial}-${i}`, name: ENEMY_ROSTER[ch][variant], title: enemyRole(ch, variant), isBoss: false, hp, maxHp: hp, goldReward: gold, species: variant, role: enemyRole(ch, variant), rank: "troop", guardHits: 0, exposedFor: 0 };
  });
}
function selectTarget(s, unit) {
  s.monster = { ...unit };
  s.guardHits = unit.guardHits;
  s.exposed = unit.exposedFor;
}
function setWave(s) {
  s.enemies = spawnSquad(s.stage, s.wave, s.farming, s.encounterSerial);
  selectTarget(s, s.enemies[0]);
  s.casterPulse = 0;
  s.waveGoldBase = 0;
}
function freshState(seed = 72691) {
  const enemies = spawnSquad(1);
  return {
    version: 4,
    enemies,
    encounterSerial: 0,
    casterPulse: 0,
    waveGoldBase: 0,
    damageTotal: 0,
    stage: 1,
    maxStageReached: 1,
    gold: 100,
    heroLevel: 1,
    equipped: clone(STARTER_EQUIPMENT),
    inventory: [],
    allies: clone(INITIAL_ALLIES),
    skills: clone(INITIAL_SKILLS).map(tuneSkill),
    allyInventory: [],
    monstersSlain: 0,
    bossesSlain: 0,
    autoPickup: true,
    monster: enemies[0],
    wave: 1,
    farming: false,
    mana: 100,
    bossTimer: 30,
    combo: 0,
    comboTTL: 0,
    guardHits: 0,
    exposed: 0,
    encounterTime: 0,
    parriedCycle: -1,
    resolvedCycle: -1,
    stance: "blade",
    runes: 0,
    runeRanks: { blade: 0, legion: 0, fortune: 0 },
    firstClears: [],
    dryDrops: 0,
    dryRare: 0,
    seed: seed >>> 0,
    elapsed: 0,
    lastTap: -1,
    event: { id: 0, text: "Ch\u1EA1m v\xE0o Titan ho\u1EB7c gi\u1EEF T\u1EA5n c\xF4ng. T\u1EA7ng 10 c\xF3 boss \u0111\u1EA7u ti\xEAn.", kind: "info" },
    hitId: 0,
    legacyMarks: 0,
    earned: 0,
    spent: 0,
    pending: []
  };
}
var markCost = (s) => Math.min(1e120, Math.round(spawn(s.maxStageReached).goldReward * 20 * Math.pow(1.4, s.legacyMarks)));
var maxManaFor = (s) => 100 + Math.floor(s.heroLevel / 5) * 5;
var active = (s, id) => s.skills.find((k) => k.id === id && k.activeRemaining > 0);
function statsFor(s) {
  const e = Object.values(s.equipped).filter(Boolean);
  const soften = (v, knee = 300) => Math.min(1200, v <= knee ? v : knee + Math.log1p((v - knee) / 100) * 100);
  const sum = (k) => soften(e.reduce((n, it) => n + Number(it[k] || 0), 0), k === "goldBonus" ? 150 : 300);
  const tap = Math.round(10 * Math.pow(1.15, s.heroLevel - 1) * getHeroMilestoneData(s.heroLevel).multiplier * (1 + sum("tapDmgBonus") / 100) * STANCES[s.stance].tap * (1 + 0.04 * s.runeRanks.blade));
  let dps = 0;
  for (const a of s.allies.filter((a2) => a2.unlocked)) {
    const gear = [a.equippedWeapon, a.equippedArmor, a.equippedAccessory];
    dps += a.currentDmg * (1 + soften(gear.reduce((n, it) => n + (it?.dpsBonusPercent || 0) + (it?.teamBuffBonusPercent || 0), 0)) / 100);
  }
  dps *= (1 + sum("heroDmgBonus") / 100) * STANCES[s.stance].ally * (1 + 0.04 * s.runeRanks.legion) * (active(s, "war_cry")?.multiplier || 1);
  return {
    tap: Math.min(1e120, tap),
    dps: Math.min(1e120, dps),
    crit: active(s, "berserker_rage") ? 1 : Math.min(0.8, 0.05 + sum("critRateBonus") / 100),
    critMult: active(s, "berserker_rage")?.multiplier || 2,
    gold: (1 + sum("goldBonus") / 100) * STANCES[s.stance].gold * (1 + 0.04 * s.runeRanks.fortune) * (active(s, "hand_of_midas")?.multiplier || 1)
  };
}
function tuneSkill(k) {
  const d = getSkillData(k.id, k.level);
  return { ...k, multiplier: d.primaryValue, duration: k.id === "radiant_slash" ? 8 : d.secondaryValue ?? k.duration, upgradeCost: calculateSkillUpgradeCost(k.baseUpgradeCost, k.level) };
}
function pay(s, cost) {
  if (!Number.isFinite(cost) || cost <= 0 || s.gold < cost) return false;
  s.gold -= cost;
  s.spent += cost;
  return true;
}
function enter(s, stage, farming = false) {
  s.stage = stage;
  s.farming = farming;
  s.wave = 1;
  s.encounterSerial++;
  setWave(s);
  s.bossTimer = 30;
  s.encounterTime = 0;
  s.guardHits = 0;
  s.exposed = 0;
  s.parriedCycle = -1;
  s.resolvedCycle = -1;
}
function addGear(s, it) {
  if (!s.autoPickup) {
    s.pending = [...s.pending, it];
    return;
  }
  if ("profession" in it) s.allyInventory = [it, ...s.allyInventory];
  else s.inventory = [it, ...s.inventory];
}
function defeat(s) {
  const boss = s.monster.isBoss, room = s.farming ? "scout" : roomFor(s.stage), rule = ROOM_RULES[room];
  const goldMult = statsFor(s).gold;
  const reward = Math.min(1e120, Math.round((s.waveGoldBase + s.monster.goldReward) * goldMult) - Math.round(s.waveGoldBase * goldMult));
  s.waveGoldBase += s.monster.goldReward;
  s.gold = Math.min(1e120, s.gold + reward);
  s.earned += reward;
  if (boss) s.bossesSlain++;
  else s.monstersSlain++;
  const killed = s.monster.id;
  s.enemies = s.enemies.filter((e) => e.id !== killed);
  if (s.enemies.length) {
    selectTarget(s, s.enemies[0]);
    tell(s, `+${reward} v\xE0ng`, "win");
    return;
  }
  const lastWave = s.wave >= rule.waves;
  if (lastWave) {
    s.dryDrops++;
    const drop = boss || s.dryDrops >= 7 || random(s) < (room === "elite" ? 0.6 : 0.28);
    if (drop) {
      s.dryDrops = 0;
      s.dryRare++;
      let it = generateLootItem(s.stage, void 0, () => random(s));
      if (it.rarity !== "common") s.dryRare = 0;
      else if (s.dryRare >= 5) {
        it = { ...it, rarity: "rare", name: "B\u1EA3o ch\u1EE9ng \xB7 " + it.name, tapDmgBonus: Math.round(it.tapDmgBonus * 1.8), heroDmgBonus: Math.round(it.heroDmgBonus * 1.8), goldBonus: Math.round(it.goldBonus * 1.8), baseLevelStats: void 0 };
        s.dryRare = 0;
      }
      addGear(s, it);
      tell(s, `+${Math.round(reward)} v\xE0ng \xB7 ${it.name}`, "loot");
    } else tell(s, `+${Math.round(reward)} v\xE0ng`, "win");
    if (boss || random(s) < 0.16) addGear(s, generateAllyLootItem(s.stage, void 0, void 0, () => random(s)));
  }
  if (boss && !s.firstClears.includes(s.stage)) {
    s.firstClears = [...s.firstClears, s.stage];
    s.runes += s.stage % 20 === 0 ? 2 : 1;
    tell(s, "H\u1EA1 Titan l\u1EA7n \u0111\u1EA7u! Nh\u1EADn \u1EA4n Titan \u0111\u1EC3 kh\u1EAFc s\u1EE9c m\u1EA1nh v\u0129nh vi\u1EC5n.", "win");
  }
  if (room === "caster") s.mana = Math.min(maxManaFor(s), s.mana + 15);
  if (room === "rest") s.mana = Math.min(maxManaFor(s), s.mana + 30);
  if (s.farming) {
    s.encounterSerial++;
    setWave(s);
    s.encounterTime = 0;
    return;
  }
  if (!lastWave) {
    s.wave++;
    s.encounterSerial++;
    setWave(s);
    return;
  }
  const next = Math.min(1e3, s.stage + 1);
  s.maxStageReached = Math.max(s.maxStageReached, next);
  enter(s, next);
  if (next === 1e3 && s.firstClears.includes(1e3)) tell(s, "\u0110\xE3 ch\u1EA1m gi\u1EDBi h\u1EA1n b\u1EA3n th\u1EED: t\u1EA7ng 1.000. C\xF3 th\u1EC3 ch\u01A1i l\u1EA1i \u0111\u1EC3 ho\xE0n thi\u1EC7n trang b\u1ECB.", "info");
}
function damage(s, amount, source, crit = false) {
  if (s.monster.hp <= 0 || !Number.isFinite(amount) || amount <= 0 || s.encounterTime < 0.65) return;
  const boss = s.monster.isBoss, room = s.farming ? "scout" : roomFor(s.stage), unit = s.enemies.find((e) => e.id === s.monster.id);
  const guarded = boss || unit?.role === "guard";
  const phase = bossPhase(s.encounterTime, 1, s.stage);
  if (source !== "ally" && guarded) {
    s.guardHits += source === "skill" ? 3 : 1;
    if (s.guardHits >= (boss ? bossPattern(s.stage).guard : 8)) {
      s.guardHits = 0;
      s.exposed = 3;
      tell(s, "PH\xC1 GI\xC1P \xB7 d\u1ED3n s\xE1t th\u01B0\u01A1ng!", "parry");
    }
  }
  const exposed = s.exposed > 0 || boss && phase.phase === "exposed";
  const armor = guarded && !exposed ? 0.65 : 1;
  const mult = (exposed ? 1.6 : armor) * (active(s, "radiant_slash") ? 1 + Math.min(0.8, 0.5 + ((active(s, "radiant_slash")?.level || 1) - 1) * 0.03) : 1);
  const floor = boss && s.encounterTime < bossPattern(s.stage).strikeAt ? s.monster.maxHp * 0.4 : 0;
  const beforeHP = s.monster.hp;
  s.monster = { ...s.monster, hp: Math.max(floor, s.monster.hp - Math.max(0.01, amount * mult)) };
  s.damageTotal += Math.max(0, beforeHP - s.monster.hp);
  if (unit) {
    unit.hp = s.monster.hp;
    unit.maxHp = s.monster.maxHp;
    unit.guardHits = s.guardHits;
    unit.exposedFor = s.exposed;
  }
  s.hitId++;
  if (crit && s.monster.hp > 0) tell(s, `B\u1EA0O K\xCDCH \xD7${statsFor(s).critMult.toFixed(1)}`, "crit");
  if (s.monster.hp <= 0) defeat(s);
}
function reduceDungeon(state, action) {
  const s = { ...state, enemies: state.enemies.map((e) => ({ ...e })), skills: state.skills.map((k) => ({ ...k })), allies: state.allies.map((a) => ({ ...a, skills: a.skills.map((k) => ({ ...k })) })), runeRanks: { ...state.runeRanks } };
  switch (action.type) {
    case "tick": {
      const dt = Math.min(0.25, Math.max(0, action.dt));
      if (!dt) return state;
      s.elapsed += dt;
      s.comboTTL = Math.max(0, s.comboTTL - dt);
      if (s.comboTTL === 0) s.combo = 0;
      for (const e of s.enemies) e.exposedFor = Math.max(0, e.exposedFor - dt);
      s.exposed = Math.max(0, s.exposed - dt);
      s.mana = Math.min(maxManaFor(s), s.mana + 2 * dt);
      s.encounterTime += dt;
      for (const k of s.skills) {
        k.currentCooldown = Math.max(0, k.currentCooldown - dt);
        k.activeRemaining = Math.max(0, k.activeRemaining - dt);
      }
      if (!s.monster.isBoss && s.enemies.some((e) => e.role === "caster")) {
        s.casterPulse += dt;
        if (s.casterPulse >= 5) {
          s.casterPulse -= 5;
          s.mana = Math.max(0, s.mana - 3);
          tell(s, "Ph\xE1p s\u01B0 h\xFAt 3 n\u0103ng l\u01B0\u1EE3ng \xB7 H\u1EA1 ph\xE1p s\u01B0 \u0111\u1EC3 ng\u1EAFt ph\xE9p.", "info");
        }
      }
      const stats = statsFor(s);
      let dps = stats.dps;
      const shadow = active(s, "shadow_clone");
      if (shadow) dps += stats.tap * shadow.multiplier * 4;
      const storm = active(s, "blade_storm");
      if (storm) dps += stats.tap * storm.multiplier / 0.4;
      for (const a of s.allies.filter((a2) => a2.unlocked)) {
        const idx = a.currentSkillIndex || 0, k = a.skills[idx];
        if (!k) continue;
        k.currentCooldown = Math.max(0, k.currentCooldown - dt);
        if (k.currentCooldown === 0) {
          const power = a.currentDmg * k.baseMultiplier * (1 + 0.15 * (k.level - 1)) * (1 + (a.equippedWeapon?.skillBonusPercent || 0) / 100);
          if (k.effectType === "mana" || k.effectType === "buff") s.mana = Math.min(maxManaFor(s), s.mana + 12 + k.level);
          else if (k.effectType === "cd_reduction") s.skills = s.skills.map((sk) => ({ ...sk, currentCooldown: Math.max(0, sk.currentCooldown - 2) }));
          else dps += power / dt;
          if (k.effectType === "quake" && s.monster.isBoss) s.bossTimer = Math.min(30, s.bossTimer + 1);
          a.currentSkillIndex = (idx + 1) % a.skills.length;
          const next = a.skills[a.currentSkillIndex];
          next.currentCooldown = Math.max(3, k.cooldown - (a.equippedArmor?.cooldownReductionSec || 0) - (a.equippedAccessory?.cooldownReductionSec || 0));
        }
        a.skill = { ...a.skills[a.currentSkillIndex || 0] };
      }
      const before = s.monster.id;
      damage(s, dps * dt, "ally");
      if (s.monster.isBoss && s.monster.id === before) {
        const phase = bossPhase(s.encounterTime, 1, s.stage);
        s.bossTimer = Math.max(0, s.bossTimer - dt * (s.monster.hp / s.monster.maxHp <= 0.4 ? 1.15 : 1));
        if (phase.t >= bossPattern(s.stage).strikeAt && s.resolvedCycle < phase.cycle) {
          s.resolvedCycle = phase.cycle;
          if (s.parriedCycle !== phase.cycle) {
            const pattern = bossPattern(s.stage);
            s.bossTimer = Math.max(0, s.bossTimer - pattern.penalty);
            s.combo = 0;
            if (pattern.effect === "siphon" || pattern.effect === "frost") s.mana = Math.max(0, s.mana - (pattern.effect === "siphon" ? 15 : 10));
            if (pattern.effect === "void") s.skills = s.skills.map((k) => ({ ...k, currentCooldown: k.currentCooldown + 1.5 }));
            tell(s, `${pattern.name}! \u2212${pattern.penalty} gi\xE2y. ${pattern.hint}`, "info");
          }
        }
        if (s.bossTimer <= 0) {
          enter(s, s.stage, true);
          s.combo = 0;
          tell(s, "H\u1EBFt gi\u1EDD \xB7 Gi\u1EEF v\xE0ng v\xE0 trang b\u1ECB. N\xE2ng c\u1EA5p r\u1ED3i t\xE1i \u0111\u1EA5u.", "info");
        }
      }
      return s;
    }
    case "target": {
      const unit = s.enemies.find((e) => e.id === action.id && e.hp > 0);
      if (!unit || unit.id === s.monster.id) return state;
      selectTarget(s, unit);
      return s;
    }
    case "tap": {
      if (s.elapsed - s.lastTap < 0.09) return state;
      s.lastTap = s.elapsed;
      s.combo = Math.min(30, s.combo + 1);
      s.comboTTL = 1.4;
      s.mana = Math.min(maxManaFor(s), s.mana + 3);
      const stat = statsFor(s), crit = random(s) < stat.crit;
      damage(s, stat.tap * (1 + 0.015 * s.combo) * (crit ? stat.critMult : 1) + stat.dps * 0.12, "tap", crit);
      return s;
    }
    case "parry": {
      if (!s.monster.isBoss) return state;
      const phase = bossPhase(s.encounterTime, 1, s.stage);
      if (!phase.canParry || s.parriedCycle === phase.cycle) return state;
      s.parriedCycle = phase.cycle;
      s.exposed = 3;
      const unit = s.enemies.find((e) => e.id === s.monster.id);
      if (unit) unit.exposedFor = 3;
      s.mana = Math.min(maxManaFor(s), s.mana + 10);
      tell(s, "\u0110\u1EE0 HO\xC0N H\u1EA2O \xB7 +10 n\u0103ng l\u01B0\u1EE3ng \xB7 l\u1ED9 l\xF5i 3 gi\xE2y", "parry");
      return s;
    }
    case "cast": {
      const k = s.skills.find((k2) => k2.id === action.id);
      if (!k || s.heroLevel < k.unlockLevel || k.currentCooldown > 0 || s.mana < k.manaCost) return state;
      s.mana -= k.manaCost;
      k.currentCooldown = k.cooldown;
      k.activeRemaining = k.duration;
      if (k.id === "war_cry") s.mana = Math.min(maxManaFor(s), s.mana + 30 + (k.level - 1) * 5);
      if (k.id === "heavenly_strike" || k.id === "radiant_slash") damage(s, statsFor(s).tap * k.multiplier, "skill", true);
      tell(s, k.name, "hit");
      return s;
    }
    case "hero": {
      const count = Math.min(1e3 - s.heroLevel, integer(action.count, 0, 1e3));
      if (count <= 0) return state;
      const cost = calculateHeroUpgradeCost(s.heroLevel, count);
      if (!pay(s, cost)) return state;
      s.heroLevel += count;
      tell(s, `Ki\u1EBFm s\u0129 c\u1EA5p ${s.heroLevel}`, "loot");
      return s;
    }
    case "ally": {
      const a = s.allies.find((a2) => a2.id === action.id);
      if (!a) return state;
      const n = a.unlocked ? Math.min(1e3 - a.level, integer(action.count, 0, 1e3)) : 1;
      if (n <= 0) return state;
      const cost = a.unlocked ? calculateAllyUpgradeCost(a.baseCost, a.level, n) : a.upgradeCost;
      if (!pay(s, cost)) return state;
      a.level = a.unlocked ? a.level + n : 1;
      a.unlocked = true;
      a.currentDmg = Math.round(a.baseDmg * Math.pow(1.16, a.level) * getAllyMilestoneData(a.level).multiplier);
      a.upgradeCost = calculateAllyUpgradeCost(a.baseCost, a.level, 1);
      a.skills = a.skills.map((k) => ({ ...k, level: 1 + Math.floor(a.level / 5) }));
      a.skill = a.skills[a.currentSkillIndex || 0];
      tell(s, `${a.name} c\u1EA5p ${a.level}`, "loot");
      return s;
    }
    case "skill": {
      const k = s.skills.find((k2) => k2.id === action.id);
      if (!k || s.heroLevel < k.unlockLevel) return state;
      const n = Math.min(500 - k.level, integer(action.count, 0, 500));
      if (n <= 0 || !pay(s, calculateSkillUpgradeCost(k.baseUpgradeCost, k.level, n))) return state;
      s.skills = s.skills.map((sk) => sk.id === k.id ? tuneSkill({ ...sk, level: sk.level + n }) : sk);
      return s;
    }
    case "equip": {
      if (action.allyId) {
        const a = s.allies.find((a2) => a2.id === action.allyId && a2.unlocked), it = s.allyInventory.find((i) => i.id === action.id);
        if (!a || !it || a.profession !== it.profession) return state;
        const key = it.slot === "ally_weapon" ? "equippedWeapon" : it.slot === "ally_armor" ? "equippedArmor" : "equippedAccessory";
        const old = a[key];
        a[key] = it;
        s.allyInventory = s.allyInventory.filter((i) => i.id !== it.id);
        if (old) s.allyInventory = [...s.allyInventory, old];
      } else {
        const it = s.inventory.find((i) => i.id === action.id);
        if (!it) return state;
        const old = s.equipped[it.slot];
        s.equipped = { ...s.equipped, [it.slot]: it };
        s.inventory = s.inventory.filter((i) => i.id !== it.id);
        if (old) s.inventory = [...s.inventory, old];
      }
      return s;
    }
    case "sell": {
      const inv = action.ally ? s.allyInventory : s.inventory, it = inv.find((i) => i.id === action.id);
      if (!it) return state;
      s.gold += it.sellValue;
      s.earned += it.sellValue;
      if (action.ally) s.allyInventory = s.allyInventory.filter((i) => i.id !== it.id);
      else s.inventory = s.inventory.filter((i) => i.id !== it.id);
      return s;
    }
    case "sellAll": {
      const inv = action.ally ? s.allyInventory : s.inventory;
      const value = inv.reduce((n, it) => n + it.sellValue, 0);
      s.gold += value;
      s.earned += value;
      if (action.ally) s.allyInventory = [];
      else s.inventory = [];
      return s;
    }
    case "best": {
      let cur = s;
      if (action.ally) {
        for (const a of s.allies.filter((a2) => a2.unlocked && (!action.allyId || a2.id === action.allyId))) for (const slot of ["ally_weapon", "ally_armor", "ally_accessory"]) {
          const key = slot === "ally_weapon" ? "equippedWeapon" : slot === "ally_armor" ? "equippedArmor" : "equippedAccessory";
          let best = a[key];
          for (const it of cur.allyInventory.filter((it2) => it2.profession === a.profession && it2.slot === slot)) if (calculateAllyItemPower(it) > calculateAllyItemPower(best)) best = it;
          if (best && best.id !== a[key]?.id) cur = reduceDungeon(cur, { type: "equip", id: best.id, allyId: a.id });
        }
      } else for (const slot of Object.keys(s.equipped)) {
        let best = cur.equipped[slot];
        for (const it of cur.inventory.filter((it2) => it2.slot === slot)) if (calculateItemBasePower(it) > calculateItemBasePower(best)) best = it;
        if (best && best.id !== cur.equipped[slot]?.id) cur = reduceDungeon(cur, { type: "equip", id: best.id });
      }
      return cur;
    }
    case "upgradeItem": {
      if (action.allyId) {
        const a = s.allies.find((a2) => a2.id === action.allyId);
        if (!a) return state;
        const key = action.slot === "ally_weapon" ? "equippedWeapon" : action.slot === "ally_armor" ? "equippedArmor" : "equippedAccessory";
        const it2 = a[key];
        if (!it2 || it2.level >= 20 || !pay(s, it2.upgradeCost)) return state;
        a[key] = { ...it2, level: it2.level + 1, dpsBonusPercent: Math.round(it2.dpsBonusPercent * 1.12), skillBonusPercent: Math.round(it2.skillBonusPercent * 1.12), cooldownReductionSec: Math.min(6, it2.cooldownReductionSec + 0.3), teamBuffBonusPercent: Math.round(it2.teamBuffBonusPercent * 1.12), upgradeCost: Math.round(it2.upgradeCost * 1.45), sellValue: Math.round(it2.sellValue * 1.3) };
        return s;
      }
      const eq = Object.values(s.equipped).find((it2) => it2?.id === action.id), base = eq || s.inventory.find((it2) => it2.id === action.id);
      if (!base) return state;
      let it = { ...base, baseLevelStats: base.baseLevelStats || { tapDmgBonus: base.tapDmgBonus, heroDmgBonus: base.heroDmgBonus, critRateBonus: base.critRateBonus, goldBonus: base.goldBonus } };
      let n = 0;
      const count = action.count === -1 ? 1e3 : integer(action.count, 0, 1e3);
      while (n < count && it.level < 20 && pay(s, it.upgradeCost)) {
        n++;
        it = { ...it, level: it.level + 1, tapDmgBonus: Math.round(it.tapDmgBonus * 1.12), heroDmgBonus: Math.round(it.heroDmgBonus * 1.12), critRateBonus: Math.min(45, it.critRateBonus + (it.critRateBonus ? 1 : 0)), goldBonus: Math.round(it.goldBonus * 1.12), upgradeCost: Math.round(it.upgradeCost * 1.45), sellValue: Math.round(it.sellValue * 1.3) };
      }
      if (!n) return state;
      if (eq) s.equipped = { ...s.equipped, [it.slot]: it };
      else s.inventory = s.inventory.map((i) => i.id === it.id ? it : i);
      return s;
    }
    case "retreat":
      if (!s.monster.isBoss) return state;
      enter(s, s.stage, true);
      tell(s, "C\xE0y v\xE0ng \xB7 T\xE1i \u0111\u1EA5u khi s\u1EB5n s\xE0ng.");
      return s;
    case "boss":
      if (s.stage % 10 !== 0 || !s.farming) return state;
      enter(s, s.stage);
      return s;
    case "stage":
      if (!Number.isInteger(action.stage) || action.stage < 1 || action.stage > s.maxStageReached) return state;
      enter(s, action.stage);
      s.combo = 0;
      return s;
    case "stance":
      if (!(action.stance in STANCES)) return state;
      s.stance = action.stance;
      return s;
    case "rune": {
      const rank = s.runeRanks[action.branch];
      if (rank === void 0 || rank >= 10 || s.runes < runeCost(rank)) return state;
      s.runes -= runeCost(rank);
      s.runeRanks[action.branch]++;
      tell(s, "\u0110\xE3 kh\u1EAFc \u1EA4n Titan \xB7 +4% s\u1EE9c m\u1EA1nh nh\xE1nh", "loot");
      return s;
    }
    case "mark":
      if (s.maxStageReached < 200 || s.legacyMarks >= 1e3 || !pay(s, markCost(s))) return state;
      s.legacyMarks++;
      tell(s, `Bia chi\u1EBFn t\xEDch b\u1EADc ${s.legacyMarks} \xB7 ch\u1EC9 thay \u0111\u1ED5i danh hi\u1EC7u, kh\xF4ng t\u0103ng s\xE1t th\u01B0\u01A1ng`, "loot");
      return s;
    case "pickup":
      for (const it of s.pending) {
        if ("profession" in it) s.allyInventory = [it, ...s.allyInventory];
        else s.inventory = [it, ...s.inventory];
      }
      s.pending = [];
      return s;
    case "autoPickup":
      s.autoPickup = !s.autoPickup;
      return s.autoPickup ? reduceDungeon(s, { type: "pickup" }) : s;
    default:
      return state;
  }
}
export {
  actorFrame,
  bossArtPose,
  freshState,
  reduceDungeon
};
/*! Bundled license information:

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

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
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

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
