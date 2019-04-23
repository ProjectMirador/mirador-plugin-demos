import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import StartIcon from '@material-ui/icons/PlayCircleOutline';
import StopIcon from '@material-ui/icons/PauseCircleOutline';
import mirador from 'mirador';


/**
* This component will be placed to the window menu.
* It gets two actions passed: `startSlideshow` and `stopSlideshow`.
* It also gets the information passed wether the slideshow is
* currently on or off.
*/
const SlideshowUI = (props) => {
  const startButton = (
    <IconButton onClick={props.startSlideshow}>
      <StartIcon />
    </IconButton>
  );
  const stopButton = (
    <IconButton onClick={props.stopSlideshow}>
      <StopIcon />
    </IconButton>
  );
  return props.on ? stopButton : startButton;
}

/**
* This is a custom reducer that will be included in
* the mirador store. For each window it stores the
* information if the slideshow is on or off. It also
* stores an `interval` ID for each window that is returned
* by the `setInterval` function in `startSlideshow`.
* This interval can by used to stop the slideshow.
*/
const slideshowReducer = (state = {}, action) => {
  if (action.type === 'START_SLIDESHOW') {
    return {
      ...state,
      [action.windowId]: {
        on: true,
        interval: action.interval,
      },
    };
  }
  if (action.type === 'STOP_SLIDESHOW') {
    return {
      ...state,
      [action.windowId]: {
        on: false,
      },
    };
  }
  return state
};

/**
* A redux thunk action. It starts the slide show
* by setting up an interval. The interval periodically
* triggers the `setCanvas` actions that is exported by mirador.
*/
const startSlideshow = (windowId) => (dispatch, getState) => {
  // Here we use `getState` to get acces to the state of core mirador
  const canvasLength = mirador.selectors.getCanvases(getState(), { windowId }).length;
  const interval = setInterval(() => {
    const currentIndex = getState().windows[windowId].canvasIndex;
    const nextCanvas = currentIndex < canvasLength - 1 ? currentIndex + 1 : 0;
    // This action triggers the window reducer which is a core reducer of mirador.
    dispatch(mirador.actions.setCanvas(windowId, nextCanvas));
  }, 2000);
  // This action triggers the plugin slideshow reducer which is under the plugins control.
  dispatch({ type: 'START_SLIDESHOW', interval, windowId });
};

/**
* A redux thunk action to stop the slideshow
*/
const stopSlideshow = (windowId) => (dispatch, getState) => {
  // Here we use `getState` to get acces to the state of the plugin
  clearInterval(getState().slideshow[windowId].interval);
  // This action triggers the plugin slideshow reducer which is under the plugins control.
  dispatch({ type: 'STOP_SLIDESHOW', windowId })
};

/**
* This is a selector function. It returns the on/off information
* from the plugins state.
*/
const selectSlideshowOn = (state, windowId) => {
  return state.slideshow &&
    state.slideshow[windowId] &&
    state.slideshow[windowId].on;
};

/**
* This function is used to inject state pieces
* to the plugin component.
*/
const mapStateToProps = (state, { windowId }) => ({
  on: selectSlideshowOn(state, windowId),
});

/**
* This function is used to inject the created
* actions to the plugin component.
*/
const mapDispatchToProps = (dispatch, { windowId }) => ({
  startSlideshow: () => dispatch(startSlideshow(windowId)),
  stopSlideshow: () => dispatch(stopSlideshow(windowId)),
});

export default {
  name: 'Slideshow',
  // The plugins target
  target: 'WindowTopMenu',
  // The mode of the plugin
  mode: 'add',
  // Component that will be added to the window menu
  component: SlideshowUI,
  mapStateToProps: mapStateToProps,
  mapDispatchToProps: mapDispatchToProps,
  reducers: {
    slideshow: slideshowReducer,
  }
};
