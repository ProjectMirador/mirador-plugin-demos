import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import OpenInNewIcon from '@material-ui/icons/OpenInNewOutlined';
import mirador from 'mirador';
import omit from 'lodash/omit';

const CopyWindowComponent = (props) => (
  <>
    <IconButton onClick={props.copyWindow}>
      <OpenInNewIcon />
    </IconButton>
  </>
);

const copyWindowAction = (windowId) => (dispatch, getState) => {
  const window = getState().windows[windowId];
  const cleanedWindow = omit(window, [
    'id',
    'companionWindowIds',
    'thumbnailNavigationId',
  ]);
  dispatch(mirador.actions.addWindow(cleanedWindow));
};

const mapStateToProps = (state) => ({
  state: state,
});

const mapDispatchToProps = (dispatch, { windowId }) => ({
  copyWindow: () => dispatch(copyWindowAction(windowId)),
});

export default {
  target: 'WindowTopMenu',
  mode: 'add',
  component: CopyWindowComponent,
  mapDispatchToProps: mapDispatchToProps,
  mapStateToProps: mapStateToProps,
}
