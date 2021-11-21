import { css, styled, run, React } from "uebersicht";

const { createRef, useEffect, useRef, useState } = React;


// ============================================
// notes
// ============================================

  /*
    AT INIT ESTABLISH IF WIDGET PREQUISITES ARE MET,
    FOR EXAMPLE:
      IF WIDGET IS ONLINE ONLY, 
      IF WIDGET NEEDS ACCESS TO NODE BINARY
      IF WIDGET NEEDS SOMETHING IN PATH
      IF THERE IS A GENERAL GROUP OF SHELL SCRIPTS OR NODE SCRIPTS NEEDED, ARE PREQUISITES FOR RUNNING MET
  */

// ============================================


// ============================================
// config
// ============================================


  let mainContainerOpts = {
    styleOpts: {
      zIndex: 1,
      color: 'white',
      backgroundColor: 'rgba(0,0,0, 0.2)',
      backdropFilter: 'none',
      inputColor: '#dcdcdc'
    },
    positionOpts: {
      xKey: 'right',
      xVal: 24,
      xUnit: 'px',
      yKey: 'top',
      yVal: 24,
      yUnit: 'px'
    },
    dimensionOpts: {
      wKey: 'width',
      wVal: 600,
      wUnit: 'px',
      hKey: 'height',
      hVal: 600,
      hUnit: 'px',
    }
  };
  let debugContainerOpts = {
    styleOpts: {
      zIndex: 1,
      color: 'white',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(20px)'
    },
    positionOpts: {
      xKey: 'right',
      xVal: 712,
      xUnit: 'px',
      yKey: 'top',
      yVal: 12,
      yUnit: 'px'
    },
    dimensionOpts: {
      wKey: 'width',
      wVal: 340,
      wUnit: 'px',
      hKey: 'height',
      hVal: 512,
      hUnit: 'px',
    }
  };


  let widgetRefreshRaw = {
    h: 0,
    m: 0,
    s: 30
  };
  // set as fase if 0
  // export const refreshFrequency = parseRefreshTime(widgetRefreshRaw);
  export const refreshFrequency = false;

// ============================================

// ============================================
// utils
// ============================================
  const once = function (func) {
    var result;
    return function () {
      if (func) {
        result = func.apply(this, arguments);
        func = null;
      }
      return result;
    }
  };
  const isObject = value => value !== null && typeof value === 'object';
  const deepMerge = (...sources) => {
    let returnValue = {};

    for (const source of sources) {
      if (Array.isArray(source)) {
        if (!(Array.isArray(returnValue))) {
          returnValue = [];
        }

        returnValue = [...returnValue, ...source];
      } else if (isObject(source)) {
        for (let [key, value] of Object.entries(source)) {
          if (isObject(value) && Reflect.has(returnValue, key)) {
            value = deepMerge(returnValue[key], value);
          }

          returnValue = {...returnValue, [key]: value};
        }
      }
    }

    return returnValue;
  };
  const reduceArrToObj = (srcArr) => {
    return srcArr.reduce((accumulator, item) => {
      accumulator[item.keyRef] = item.keyVal
      return accumulator;
    }, {});
  };
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  function throttle (func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  };
  function parseRefreshTime(refreshTimeRaw) {
    let OneSec = 1000;
    let OneMin = (OneSec * 60);
    let OneHour = (OneMin * 60);
    let refreshTimeParsed = 0
    if (refreshTimeRaw.h) {
      refreshTimeParsed += (refreshTimeRaw.h * OneHour)
    }
    if (refreshTimeRaw.m) {
      refreshTimeParsed += (refreshTimeRaw.m * OneMin)
    }
    if (refreshTimeRaw.s) {
      refreshTimeParsed += (refreshTimeRaw.s * OneSec)
    }
    return refreshTimeParsed;
  };
// ============================================


// ============================================
// CSS Styles
// ============================================

  const style = css`
    position: fixed;
    ${mainContainerOpts.positionOpts.xKey}: ${mainContainerOpts.positionOpts.xVal}${mainContainerOpts.positionOpts.xUnit};
    ${mainContainerOpts.positionOpts.yKey}: ${mainContainerOpts.positionOpts.yVal}${mainContainerOpts.positionOpts.yUnit};
    ${mainContainerOpts.dimensionOpts.wKey}: ${mainContainerOpts.dimensionOpts.wVal}${mainContainerOpts.dimensionOpts.wUnit};
    ${mainContainerOpts.dimensionOpts.hKey}: ${mainContainerOpts.dimensionOpts.hVal}${mainContainerOpts.dimensionOpts.hUnit};
    z-index: ${mainContainerOpts.styleOpts.zIndex};
    color: ${mainContainerOpts.styleOpts.color};
    background-color: ${mainContainerOpts.styleOpts.backgroundColor};
    backdrop-filter: ${mainContainerOpts.styleOpts.backdropFilter};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    * {
      -webkit-box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .rel-100 {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .visually-hidden {
      position: absolute !important;
      height: 1px;
      width: 1px;
      overflow: hidden;
      clip: rect(1px, 1px, 1px, 1px);
      white-space: nowrap;
    }
    .Xcli-display {
      position: absolute;
      top: 0;
      bottom: 32px;
      left: 0;
      right: 0;
      overflow: hidden;
    }
    .Xcli-pre {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;
      white-space: pre-line;
      & > span {
        font-family: monaco, "Courier New", Courier, monospace;
        font-size: 18px;
        display: block;
        &::before { 
          content: "\n";
          white-space: pre-line;
        }
      }
    }


    .Xcli-prompt {
      position: absolute;
      height: 32px;
      bottom: 0;
      left: 0;
      width: 42px;
      padding-bottom: 2px;
      font-size: 27px;
      color: #66ffc3;
    }
    .Xcli-input {
      background-color: transparent;
      border: none;
      position: absolute;
      height: 30px;
      bottom: 2px;
      left: 42px;
      width: calc(100% - 42px);
      font-family: monaco, "Courier New", Courier, monospace;
      font-size: 24px;
      color: ${mainContainerOpts.styleOpts.inputColor};
      &:focus { 
        outline: none;
      }
    }
    .inp-termite {
      max-width: 90%;
      background: rgba(0,127,128,0.68);
      box-shadow: 0px 0px 6px rgba(0,255,255,0.5);
      border: 1px solid rgba(128,255,255,0.25);
      color: rgba(255,255,255,0.75);
      text-shadow: 0 0 4px rgba(0,255,255,0.95);
      font-size: 16px;
      padding: 2px 6px;
      outline: none;
      &:hover {
        box-shadow: 0px 0px 6px rgba(0,255,255,0.75);
        border: 1px solid rgba(128,255,255,0.75);
      }
      &:focus {
        box-shadow: 0px 0px 6px rgba(0,255,255,0.75);
        border: 1px solid rgba(128,255,255,0.75);
      }
    }
    .inp-termite-secondary {
      background-color: transparent;
      color: rgba(0,127,128,0.8);
      text-shadow: 0 0 4px rgba(0,255,255,0.3);
      border: 1px solid rgba(128,255,255,0.5);
      box-shadow: 0px 0px 6px rgba(0,255,255,0.25);
    }
    .btn-termite {
      background: rgba(0,127,128,0.68);
      box-shadow: 0px 0px 12px rgba(0,255,255,0.5);
      border: 1px solid rgba(128,255,255,0.25);
      color: rgba(255,255,255,0.75);
      text-shadow: none;
      /* text-shadow: 0 0 10px rgba(0,255,255,0.95); */
      /* text-shadow: none; */
      font-size: 16px;
      padding: 2px 6px;
      user-select: none;
      outline: none;
      &:hover {
        box-shadow: 0px 0px 12px rgba(0,255,255,0.75);
        border: 1px solid rgba(128,255,255,0.75);
      }
    }
    .btn-termite-primary:active {
      background: rgba(0,127,128,0.9);
    }
    .btn-termite-secondary {
      background-color: transparent;
      color: rgba(0,127,128,0.8);
      text-shadow: none;
      /* text-shadow: 0 0 12px rgba(0,255,255,0.3); */
      /* text-shadow: none; */
      border: 1px solid rgba(128,255,255,0.5);
      box-shadow: 0px 0px 12px rgba(0,255,255,0.25);
      &:active {
        box-shadow: 0px 0px 12px rgba(0,255,255,0.75);
      }      
    }
  `;

// ============================================


// ============================================
// STYLED CONTAINERS
// ============================================
  const DebugContainer = styled('div')`
    position: fixed;
    ${debugContainerOpts.positionOpts.xKey}: ${debugContainerOpts.positionOpts.xVal}${debugContainerOpts.positionOpts.xUnit};
    ${debugContainerOpts.positionOpts.yKey}: ${debugContainerOpts.positionOpts.yVal}${debugContainerOpts.positionOpts.yUnit};
    ${debugContainerOpts.dimensionOpts.wKey}: ${debugContainerOpts.dimensionOpts.wVal}${debugContainerOpts.dimensionOpts.wUnit};
    ${debugContainerOpts.dimensionOpts.hKey}: ${debugContainerOpts.dimensionOpts.hVal}${debugContainerOpts.dimensionOpts.hUnit};
    z-index: ${debugContainerOpts.styleOpts.zIndex};
    color: ${debugContainerOpts.styleOpts.color};
    background-color: ${debugContainerOpts.styleOpts.backgroundColor};
    backdrop-filter: ${debugContainerOpts.styleOpts.backdropFilter};
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    border: 2px solid #fff;
    border-radius: 8px;
    & > h2 {
      color: ${props => props.primary ? 'blue' : 'white'};
      font-size: 1.6rem;
      margin: 8px 0;
      font-family: Helvetica Neue;
      font-weight: 300;
    }
    & h3 {
      font-size: 1.4rem;
      color: ${props => props.testColor ? props.testColor : 'white'};
    }
    & h4 {
      font-size: 1.2rem;
      color: ${props => props.testColor ? props.testColor : 'white'};
    }
    & > p {
      font-size: 1.0rem;
      color: lightgreen;
    }
  `;
// ============================================

// ============================================
// MAIN JS Logic
// ============================================
  export const initialState = {
    title: 'Template A',
    subtitle: 'template widget',
    debugMessage: 'initial debug message',
    error: null,
    count: 0,
    dummyStateProp: 'dummy state prop',
    initTime: new Date().getTime(),
    initTimeStr: new Date().toLocaleTimeString(),
    subGroupActivityState: {
      protoMatrix: true,
      paxtonFaction: false,
      styleGuide: false,
      ternComp: true,
      debugContainer: true
    },
    ternState: {
      isActive: false,
      isLoggedIn: true
    },
    debugState: {
      isActive: false,
      debugMessage: 'initial debug message',
    },
  };
  export const updateState = (event, state) => {
    let { type, output = null } = event;
    if (event.error) {
      return { ...state,
        error: event.error
        // warning: `We got an error: ${event.error}`
      };
    };
    switch (type) {
      case "MUT_SINGLE":
        return { ...state, [output.keyRef]: output.keyVal };
      case "MUT_MULTI":
        let mutMultiOutput = reduceArrToObj(output)
        return { ...state, ...mutMultiOutput };
      default: {
        return state;
      }
    }
  };

  let initFunc = once(async function (ctx) {
    // console.clear()
    const { dispatch  } = ctx;
    const initialOverrides = {
      subtitle: 'a prototype template widget',
      subGroupActivityState: {
        gipox: true
      }
    };
    function handleMutObj(key, val, overrides = {}) {
      // body...
      let outputObj = {
        keyRef: key,
        keyVal: { ...val, ...overrides}
      }
      // console.log(outputObj)
      dispatch({ type: 'MUT_SINGLE', output: outputObj });
    }
    let multiMutModelNonRun = [];
    for (const prop in initialState) {
      if (isObject(initialState[prop])) {
        let mutObjOverride = (initialOverrides.hasOwnProperty(prop)) ? initialOverrides[prop] : {};
        handleMutObj(prop, initialState[prop], mutObjOverride);
      } else {
        let mutMultiKeyVal = (initialOverrides.hasOwnProperty(prop)) ? initialOverrides[prop] : initialState[prop];
        multiMutModelNonRun.push({
          keyRef: prop,
          keyVal: mutMultiKeyVal
        });
      }
    };
    dispatch({ type: 'MUT_MULTI', output: multiMutModelNonRun });
    // console.log('ELLemental init');

    // 
    // let rcnOpts = {
    //   scriptPath: scriptDefaultPath,
    //   scriptFile: 'nlinkCore.js',
    //   scriptArgs: ['default']
    // };
    // await runCallNode({
    //   runOpts: rcnOpts
    // });
  });
  export const init = (dispatch) => {
    initFunc({
      dispatch,
    })
  };
// ============================================


// ============================================
// SUB COMPONENTS
// ============================================

  const NoComp = ((props = {}) => {
    // use props n dispatch
    let {
      dispatch,
      passProps,
      passFuncs
    } = props;
    // defaults, props, overrides
    let compPropsDefault = {
      description: 'a conditional component for no'
    };
    let compPropsOverride = {
      title: 'NoComp'
    };
    let compProps = deepMerge(compPropsDefault, passProps, compPropsOverride);
    let {
      description = 'default description',
      title = 'default title'
    } = compProps;

    let compStyleParams = {
      zIndex: 1,
      color: 'white',
      backgroundColor: 'rgba(255, 75, 75, 0.2)',
      backdropFilter: 'blur(20px)'
    };
    const compStyle = css`
      position: relative;
      width: 100%;
      height: 100px;
      z-index: ${compStyleParams.zIndex};
      color: ${compStyleParams.color};
      background-color: ${compStyleParams.backgroundColor};
      backdrop-filter: ${compStyleParams.backdropFilter};
    `;


    let controls = [
      {
        id: 'ctl01'
      }
    ];
    let controlInitial = controls.map((ref, index) => { 
      return { ...ref , value: '', index: index }
    });
    const [controlState, setControlState] = useState(controlInitial);

    let controlRef = useRef([]);
    controlRef.current = controls.map(
      (ref, index) =>   controlRef.current[index] = createRef()
    );

    function onControlChange(event) {
      // need update system
      // console.log('onControlChange');
      // console.log(event.target.value);
    };
    function checkIndex({index}) {
      // body...
      // console.log('checkIndex index',index);
      let elem = controlRef.current[index].current;
      if (!elem.value) { return; }
      let controlStateCache = Array.from(new Set(controlState));
      // console.log(controlStateCache[index]);
      controlStateCache.splice(index, 1, deepMerge(controlStateCache[index], {
        value: elem.value
      }));
      // console.log(controlStateCache[index]);
      setControlState(controlStateCache);
      // console.log(elem.value);
      // .focus();
    };
    return (
      <div className={`${css(compStyle)} ${true ? '' : 'visually-hidden'}`}>
        <h2>{title}</h2>
        <p>description: {description}</p>

        <div>
          <input
            type="text"
            spellCheck="false"
            ref={controlRef.current[0]}
            defaultValue={controlState[0].value}
            onChange={onControlChange}
            className="inp-termite" />
          <button
            onClick={() => checkIndex({ index: 0 })}
            className="btn-termite btn-termite-secondary">
              update
          </button>
        </div>
      </div>
    )
  });


  const YesComp = ((props = {}) => {
    // use props n dispatch
    let {
      dispatch,
      passProps,
      passFuncs
    } = props;
    // defaults, props, overrides
    let compPropsDefault = {
      description: 'a conditional component for yes'
    };
    let compPropsOverride = {
      title: 'YesComp'
    };
    let compProps = deepMerge(compPropsDefault, passProps, compPropsOverride);
    let {
      description = 'default description',
      title = 'default title'
    } = compProps;

    let compStyleParams = {
      zIndex: 1,
      color: 'white',
      backgroundColor: 'rgba(0, 214, 114, 0.2)',
      backdropFilter: 'blur(20px)'
    };
    const compStyle = css`
      position: relative;
      width: 100%;
      height: 100%;
    `;
    // input
    const xcliPromptStr = ':$>';
    const [xcliBusy, setXcliBusy] = useState(false);

    const [xcliInputState, setXcliInputState] = useState('');

    const xcliPreEndRef = useRef(null);
    const [xcliPreState, setXcliPreState] = useState([
      {
        category: 'demo',
        rawText: 'hi this is  a demo message'
      },        
      {
        category: 'demo',
        rawText: 'bye this is a demo message'
      }
    ]);

    const scrollToBottom = () => {
      xcliPreEndRef.current.scrollIntoView({ behavior: "smooth" })
    };

    /*
      catch clear, change dir etc
    */
    function appendXcliPre(ctx) {
      let { rawText, category } = ctx;
      // console.log('appendXcliPre rawText: ',rawText);
      let xcliPreStateCache = Array.from(new Set(xcliPreState));
      let newItemText = (category === 'inputEcho') ? `${xcliPromptStr} ${rawText}` : `${rawText}`;
      let newItem = {
        category: category,
        rawText: newItemText
      };
      xcliPreStateCache.push(newItem);
      setXcliPreState(xcliPreStateCache);
    };
    async function commandEmitter(rawCmd) {
      try {

        // add prompt and raw to prestate

        setXcliBusy(true);

        let [runErr, runRes] = await passFuncs.runFunc({
          runStr: rawCmd
        });
        if (runErr) {
          setXcliBusy(false);
          console.log('error commandEmitter');
          return;
        }
        console.log('success commandEmitter');
        console.log(runRes);
        appendXcliPre({
          rawText: runRes,
          category: 'responseEcho'
        });
        setXcliBusy(false);
      } catch(e) {
        console.log('error commandEmitter');
        setXcliBusy(false);
      }
    };

    function onControlChange(val) {
      // can use for autocompletion
      if (xcliBusy) { return; }
      // console.log('onControlChange: ',val);
      setXcliInputState(val);
    };
    /*
      MUST PAUSE INPUT ON SUBMIT
    */
    function handleClineEnter() {
      // make new string, repeat to display and run command, clear input
      if (xcliBusy) { return; }
      // console.log('handleClineEnter: ',xcliInputState);
      let rawCmd = `${xcliInputState}`;
      setXcliInputState('');
      // console.log('rawCmd: ', rawCmd);
      appendXcliPre({
        rawText: rawCmd,
        category: 'inputEcho'
      });
      commandEmitter(rawCmd);
    };
    // should have specific useeffect hre
    // useEffect(scrollToBottom, [messages]);
    useEffect(() => {
      console.log('xcliPreState updated');
      scrollToBottom();
    }, [xcliPreState]);

    useEffect(() => {
      console.log('yes Widget mounted');
    }, []);

    return (
      <div className={`${css(compStyle)} ${true ? '' : 'visually-hidden'}`}>
        {/*<h2>{title}</h2>*/}
        {/*<p>description: {description}</p>*/}
        <div className="Xcli-display">

          <pre className="Xcli-pre">
            {xcliPreState.map((item, index) => (
              <span key={index}>{item.rawText}</span>
            ))}
            <div ref={xcliPreEndRef} />
          </pre>

        </div>
        <div className="Xcli-prompt">
          {xcliPromptStr}
        </div>
        <input
          type="text"
          spellCheck="false"
          value={xcliInputState}
          onChange={(e) => onControlChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleClineEnter()}
          className="Xcli-input" />
      </div>
    )
  });



  const TernComp = (props) => {
    let {
      isLoggedIn,
      dispatch,
      passProps,
      passFuncs
    } = props;
    // could generate additions here
    let ChildProps = {
      dispatch, passProps, passFuncs
    };
    useEffect(() => {
      // console.log('Widget mounted');

    }, []);
    function toggleTern() {
      // body...
      console.log('toggleTern');
      // isLoggedIn = !isLoggedIn;
    };


    if (isLoggedIn) {
      return (
        <div className="rel-100">
          <YesComp {...ChildProps} />
        </div>
      )
    }
    return (
      <div className="rel-100">
        <h2>teminator</h2>
        <NoComp {...ChildProps} />
        <button onClick={() => {
            console.clear()
          }}>clear console
        </button>
        <button onClick={() => {
            toggleTern()
          }}>tern toggle
        </button>
      </div>
    )
  };
// ============================================

// ============================================
// MAIN RENDER
// ============================================
  export const render = (props, dispatch) => {
    //
    let {
      subGroupActivityState: sGaS = {},
      ternState = {},
      debugState = {},
      debugMessage = ''
    } = props;

    async function dispatchFunc(ctx){
      // console.log('dispatchFunc');
      // for multi we need existing value and some array reference
      dSingleBlock: {
        if (ctx.domain !== 'MUT_SINGLE') {
          break dSingleBlock;
        }
        let stateVal = props[ctx.data.context];
        let updateVal = isObject(stateVal) ? deepMerge(stateVal, ctx.data.value) : ctx.data.value;
        // console.log(updateVal);
        // isObject()
        dispatch({ type: 'MUT_SINGLE', output: {
          keyRef: ctx.data.context,
          keyVal: updateVal
        } });
      }
      dArrBlock: {
        break dArrBlock;
        console.log('MUT_MULTI');
        dispatch({ type: 'MUT_SINGLE', output: {
          keyRef: ctx.data.context,
          keyVal: ctx.data.value
        } });
      }
    };

    async function runFuncNova(ctx) {
      try {
        let { runStr } = ctx;
        // let runStrShellA = 'printenv SHELL';
        let response = await run(runStr);
        // can do further processing here
        // console.log(response);
        return [null, response];
      } catch (e) {
        // console.log(e);
        // console.log('unspecified error with run func');
        return [e, null];
      }
    };

    const ChildPropsModel = {
      passProps: {
        description: 'example childprop model',
      },
      passFuncs: {
        passFuncA: (ctx) => {
          console.log('ChildPropsModel passFuncA', ctx);
        },
        passFuncB: (ctx) => {
          console.log('ChildPropsModel passFuncB', ctx);
        },
        runFunc: runFuncNova
      }
    };
    let TernChildProps = deepMerge(ChildPropsModel, {
      passProps: {
        description: 'tern child'
      }
    });
    function toggleTern() {
      // body...
      console.log('toggleTern');
      // isLoggedIn = !isLoggedIn;
    };

    const DebugPropsModel = {
      passProps: {
        description: 'example debug props model',
      }
    };
    let DebugContainerProps = deepMerge(DebugPropsModel, {
      primary: true,
      passProps: {
        
      },
      testColor: 'grey'
    });

    return (
      <div className={style}>
        {/*<h1>Template A</h1>*/}
        {/*<p>For conditional rendering we can use an internal component.</p>*/}

        <div className={`rel-100 ${true ? '' : 'visually-hidden'}`}>
          <TernComp {...TernChildProps} dispatch={dispatch} isLoggedIn={ternState.isLoggedIn} />
        </div>


        <DebugContainer {...DebugContainerProps}>
          <h2>Debug</h2>
          <p>this is the debug container</p>

          {/* basic-debug */}
            <div className={` ${true ? '' : 'visually-hidden'}`}>
              <h3>basic debug</h3>
              <button onClick={() => {
                  console.clear()
                }}>clear console
              </button>
              <button onClick={() => {
                  toggleTern()
                }}>tern toggle
              </button>
            </div>
          {/* basic-debug */}


          {/* dispatch */}
            <div className={` ${true ? '' : 'visually-hidden'}`}>
              <h3>dispatches</h3>
              {/*tern toggle */}
              <button
                className={`btn-termite btn-termite-primary ${true ? '' : 'visually-hidden'}`}
                onClick={() => {
                  dispatchFunc({
                    domain: 'MUT_SINGLE',
                    data: {
                      context: 'ternState',
                      value: {
                        isLoggedIn: !ternState.isLoggedIn
                      }
                    }
                  })
                }}>Dispatch obj test - toggle tern
              </button>
              {/*mut debug */}
              <p>debug message: {debugMessage}</p>
              <button
                className={`btn-termite btn-termite-primary ${true ? '' : 'visually-hidden'}`}
                onClick={() => {
                  dispatchFunc({
                    domain: 'MUT_SINGLE',
                    data: {
                      context: 'debugMessage',
                      value: 'interactivity testA'
                    }
                  })
                }}>Dispatch str test
              </button>
            </div>
          {/* dispatch */}

          {/* iteration */}
            <div className={` ${true ? '' : 'visually-hidden'}`}>
              <h3>activity states</h3>

              {/* sgas */}
                <div className={` ${true ? '' : 'visually-hidden'}`}>
                  <h4>subGroupActivityState</h4>
                  {Object.entries(sGaS).map(([key,value], index) => (
                    <div key={index}>
                        <p>key: {key}, value: {value}</p>
                    </div>
                  ))}
                </div>
              {/* sgas */}

              {/* ternState */}
                <div className={` ${true ? '' : 'visually-hidden'}`}>
                  <h4>ternState</h4>
                  {Object.entries(ternState).map(([key,value], index) => (
                    <div key={index}>
                        <p>key: {key}, value: {value ? 'true' : 'false'}</p>
                    </div>
                  ))}

                </div>
              {/* ternState */}

              {/* debugState */}
                <div className={` ${true ? '' : 'visually-hidden'}`}>
                  <h4>debugState</h4>
                  {Object.entries(debugState).map(([key,value], index) => (
                    <div key={index}>
                        <p>key: {key}, value: {value}</p>
                    </div>
                  ))}


                </div>
              {/* debugState */}
            </div>
          {/* iteration */}
        </DebugContainer>

        {/* styleguide */}
          <div className={` ${sGaS.styleGuide ? '' : 'visually-hidden'}`}>
            <h2>styleguide</h2>
            <input type="text" className="inp-termite" />
            <input type="text" className="inp-termite inp-termite-secondary" />
            <br />
            <button className="btn-termite btn-termite-primary">
              Primary
            </button>
            <button className="btn-termite btn-termite-secondary">
              Secondary
            </button>
          </div>
        {/* styleguide */}
      </div>
  )};
// ============================================


