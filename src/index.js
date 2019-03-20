import mirador from 'mirador';
import config from './mirador-config';
import downloadImagePlugin from './plugins/download-image';

mirador.viewer(config, [downloadImagePlugin]);
