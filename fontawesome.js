// fontawesome.js
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { config } from '@fortawesome/fontawesome-svg-core';

// Prevent automatic CSS addition since we're using Next.js
config.autoAddCss = false;

library.add(fas);
