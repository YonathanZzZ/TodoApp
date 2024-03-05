import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serverURL = 'http://localhost:8080';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
        },
        plugins: [react()],
    };
});