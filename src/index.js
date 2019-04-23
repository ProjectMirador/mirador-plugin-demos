// the mirador version that is used here is not on npm yet
import mirador from '/home/mathias/github/mirador';
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
