/**
* This plugin adds a button to the window top bar. On Click it tries to
* extract the image url of the currently selected canvas and opens the
* image in a new tap.
*/

import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import ImageIcon from '@material-ui/icons/ImageOutlined';
import mirador from 'mirador';

/**
* Extract image url of the selected canvas from manifest.
* For the sake of simplicity it only recognizes the url if it's
* a fully qualified jpeg url. That is, it doesn't transform
* a info.json to a image url.
*
* Also note that `canvas` here is a manifesto object.
*/
function getImageUrlFromCanvas(canvas) {
  const url = canvas.getImages()[0] &&
    canvas.getImages()[0].getResource().id;
  if (url && url.endsWith('.jpg'))
    return url;
}

/**
* This component will be places in the window top bar.
* It gets the current canvas injected (as manifesto object).
*/
class DownloadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showErrorDialog: false };
  }
  handleButtonClick(ev) {
    ev.preventDefault();
    const url = getImageUrlFromCanvas(this.props.canvas);
    url ? window.open(url) : this.toggleErrorDialog();
  }
  toggleErrorDialog(url) {
    this.setState(prevState => ({ showErrorDialog: !prevState.showErrorDialog }));
  }
  render() {
    const { showErrorDialog } = this.state;
    return (
      <>
        <IconButton onClick={this.handleButtonClick.bind(this)}>
          <ImageIcon />
        </IconButton>
        <Dialog open={showErrorDialog} onClose={this.toggleErrorDialog.bind(this)}>
          <DialogContent>
            Could not extract a image url from manifest.
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

/**
* Inject the current canvas into the component.
* Here we use state selectors that are exported by Mirador.
*/
function mapStateToProps(state, { windowId }) {
  return {
    canvas: mirador.selectors.getSelectedCanvas(state, windowId)
  };
};

/**
* This is the actual plugin object.
*/
export default {
  /* Component the plugin addresses */
  target: 'WindowTopBarButtons',
  /* Plugin mode replace */
  mode: 'replace',
  /* Component that will be renderd in place of the target */
  component: DownloadButton,
  /* This function will be used to connect the plugin component to the mirador store */
  mapStateToProps: mapStateToProps,
};
