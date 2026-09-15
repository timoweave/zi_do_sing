import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import '@fontsource-variable/noto-sans';
import '@fontsource-variable/noto-serif';
import '@fontsource/huninn';
import 'cn-fontsource-source-han-serif-sc-vf/font.css';
import 'cn-fontsource-lxgw-wen-kai-screen-r/font.css';
import 'cn-fontsource-975-maru-sc-bold/font.css';
import 'cn-fontsource-975-maru-sc-regular/font.css';
import 'cn-fontsource-975-maru-sc-medium-regular/font.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
