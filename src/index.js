// the mirador version that is used here is not on npm yet
import mirador from '/home/mathias/github/mirador';
import config from './mirador-config';
import downloadImagePlugin from './plugins/download-image';
import slideshowPlugin from './plugins/slideshow';

mirador.viewer(config, [
  downloadImagePlugin,
  slideshowPlugin,
]);
