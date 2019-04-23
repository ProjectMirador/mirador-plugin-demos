import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import IconButton from '@material-ui/core/IconButton';
import ImageIcon from '@material-ui/icons/ImageOutlined';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

// the mirador version that is used here is not on npm yet
import mirador from '/home/mathias/github/mirador';
import { OSDReferences } from './osd-reference';

const ERR_NO_IMAGE_SERVICE = "Can not find an image service in the manifest file.";
const ERR_FAILED_TO_FETCH_INFO_JSON = "Failed to fetch info.json.";

/**********************************************************
* Plugin Button
**********************************************************/

function PluginMenuButton({ onClick }) {
  return (
    <IconButton onClick={onClick}>
      <ImageIcon />
    </IconButton>
  )
}

/**********************************************************
* Download Dialog
**********************************************************/

class DownloadDialog extends React.Component {
  constructor(props) {
    super(props)
    const { formats, qualities} = props;
    this.state = {
      region: 'full',
      quality: qualities && qualities[0],
      format: formats && formats[0],
    };
    this.saveSelectedValue = this.saveSelectedValue.bind(this);
    this.handleDownloadClick = this.handleDownloadClick.bind(this);
  }

  saveSelectedValue(event, prop) {
    this.setState({ [prop]: event.target.value });
  }

  handleDownloadClick(event) {
    this.props.onDownload(this.state);
  }

  renderRegionRadioButtons() {
    const { region } = this.state;
    const choices = [
      { label: 'Full Image', value: 'full'},
      { label: 'Current Region', value: 'current'},
    ]

    return choices.map(choice => (
      <FormControlLabel
        key={choice.value}
        checked={region === choice.value}
        value={choice.value}
        onChange={(ev) => this.saveSelectedValue(ev, 'region')}
        control={<Radio />}
        label={choice.label}
      />
    ));
  }

  renderQualitySelections() {
    const { qualities } = this.props;
    return (
      <FormControl>
        <InputLabel>Quality</InputLabel>
        <Select native onChange={(ev) => this.saveSelectedValue(ev, 'quality')}>
          { qualities.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
      </FormControl>
    )
  }

  renderFormatSelections() {
    const { formats } = this.props;
    return (
      <FormControl>
        <InputLabel>Format</InputLabel>
        <Select native onChange={(ev) => this.saveSelectedValue(ev, 'format')}>
          { formats.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
      </FormControl>
    )
  }

  renderDownloadButton() {
    const { handleDownloadClick} = this;
    return (
      <Button color="secondary" onClick={handleDownloadClick}>
        Download
      </Button>
    )
  }

  renderDownloadForm() {
    const { formats, qualities } = this.props;
    return(
      <>
        <Grid item>
          { this.renderRegionRadioButtons() }
        </Grid>
        <Grid container item spacing={32}>
          <Grid item>
            { qualities && this.renderQualitySelections() }
          </Grid>
          <Grid item>
            { formats && this.renderFormatSelections() }
          </Grid>
        </Grid>
        <Grid item>
        </Grid>
        <Grid item>
        { this.renderDownloadButton() }
        </Grid>
      </>
    )
  }

  renderErrorMessage() {
    return this.props.error.message;
  }

  render() {
    const { open, onClose, error, formats, qualities } = this.props;
    return (
      <Dialog open={open} onClose={onClose} disableEnforceFocus>
        <DialogContent>
          <Grid container direction="column" spacing={16}>
            { error ? this.renderErrorMessage() : this.renderDownloadForm() }
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

DownloadDialog.propTypes = {
  onDownload: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  error: PropTypes.object,
  formats: PropTypes.array,
  qualities: PropTypes.array,
}

DownloadDialog.defaultProps = {
  error: null,
  formats: null,
  qualities: null,
}

/**********************************************************
* Download Controller
**********************************************************/

class DownloadController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      imageServiceError: null,
      formats: null,
      qualities: null,
      imageServiceBaseUrl: null,
    };

    this.toggleDialog = this.toggleDialog.bind(this);
    this.downloadImage = this.downloadImage.bind(this);
  }

  getImageServiceBaseUrl() {
    return get(this.props.canvas, '__jsonld.images[0].resource.service.@id');
  }

  saveImageInfos(infoJson) {
    const formats = get(infoJson, 'profile[1].formats');
    const qualities = get(infoJson, 'profile[1].qualities');
    this.setState({ formats, qualities });
  }

  componentDidMount() {
    const that = this;
    this.imageServiceBaseUrl = this.getImageServiceBaseUrl();
    if (this.imageServiceBaseUrl) {
      fetch(this.imageServiceBaseUrl + '/info.json')
      .then(resp => resp.json())
      .then(infoJson => that.saveImageInfos(infoJson))
      .catch(err =>  that.saveError({ message: ERR_FAILED_TO_FETCH_INFO_JSON }));
    } else {
      this.saveError({ message: ERR_NO_IMAGE_SERVICE })
    }
  }

  saveError(error) {
    this.setState({ imageServiceError: error })
  }

  toggleDialog(event) {
    this.setState(prevState => ({ showDialog: !prevState.showDialog }));
  }

  downloadImage({ region, quality, format }) {
    region = region || 'full';
    quality = quality || 'default';
    format = format || 'jpg';
    let imageUrl;

    if (region === 'full') {
      imageUrl = this.imageServiceBaseUrl + `/full/full/0/${quality}.${format}`
    }
    if (region === 'current') {
      const { x, y, w, h } = this.getCurrentImageBounds();
      imageUrl = this.imageServiceBaseUrl + `/${x},${y},${w},${h}/full/0/${quality}.${format}`
    }
    window.open(imageUrl);
  }

  getCurrentImageBounds() {
    const bounds = OSDReferences.get(this.props.windowId).current.viewer.viewport.getBounds();
    console.log(bounds);
    return this.parseOSDBounds(bounds);
  }

  parseOSDBounds(bounds) {
    const parse = num => num > 0 ? parseInt(num) : 0;
    return {
      x: parse(bounds.x),
      y: parse(bounds.y),
      w: parse(bounds.width),
      h: parse(bounds.height),
    }
  }

  render() {
    const { showDialog, imageServiceError, formats, qualities } = this.state;
    return (
      <>
        <PluginMenuButton
          onClick={this.toggleDialog} />
        { showDialog && (
          <DownloadDialog
            open={true}
            onClose={this.toggleDialog}
            formats={formats}
            qualities={qualities}
            onDownload={this.downloadImage}
            error={imageServiceError}/>
        )}
      </>
    );
  }
}

const mapStateToProps = (state, props) => ({
  canvas: mirador.selectors.getCanvas(state, props)
});

/**********************************************************
* Plugin Object
**********************************************************/

export default {
  name: 'Download Image',
  target: 'WindowTopMenu',
  mode: 'add',
  component: DownloadController,
  mapStateToProps: mapStateToProps,
}
