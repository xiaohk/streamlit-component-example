import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(async ({ command, mode }) => {
  if (command === 'serve') {
    // Development
    return {
      plugins: [],
      server: {
        watch: {
          usePolling: true,
        },
      },
    };
  } else if (command === 'build') {
    switch (mode) {
      case 'production': {
        // Production: standard web page (default mode)
        return {
          build: {
            outDir: 'dist',
            rollupOptions: {
              input: {
                main: resolve(__dirname, 'index.html'),
              },
            },
          },
          plugins: [],
        };
      }

      case 'library': {
        // Production: library that can be imported in other apps
        return {
          publicDir: false,
          build: {
            lib: {
              // Could also be a dictionary or array of multiple entry points
              entry: [resolve(__dirname, 'src/index.ts')],
              name: 'quest-board',
              formats: ['es'],
            },
            outDir: 'lib',
          },
          plugins: [dts()],
        };
      }

      default: {
        console.error(`Error: unknown production mode ${mode}`);
        return null;
      }
    }
  }
});
