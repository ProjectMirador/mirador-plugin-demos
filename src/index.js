import mirador from 'mirador';
import config from './mirador-config';

import slideshowPlugin from './plugins/slideshow';
import copyWindowPlugin from './plugins/copy-window';
import osdReferencePlugin from './plugins/osd-reference';
import downloadImagePlugin from './plugins/download-image';

const miradorInstance = mirador.viewer(config, [
  slideshowPlugin,
  copyWindowPlugin,
  osdReferencePlugin,
  downloadImagePlugin,
]);

export default miradorInstance;
