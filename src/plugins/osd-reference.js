import React from 'react';

class OSDReferenceComponent extends React.Component {
  constructor(props) {
    super(props);
    const { windowId} = props.targetProps;
    this.osdRef = React.createRef();
    OSDReferences.set(windowId, this.osdRef);
  }
  render() {
    return <this.props.TargetComponent {...this.props.targetProps} ref={this.osdRef} />
  }
}

export const OSDReferences = {
  refs: {},
  get(windowId) {
    return this.refs[windowId];
  },
  set(windowId, ref) {
    this.refs[windowId] = ref;
  },
};

export default {
  name: 'OSD Reference',
  target: 'OpenSeadragonViewer',
  mode: 'wrap',
  component: OSDReferenceComponent,
}
