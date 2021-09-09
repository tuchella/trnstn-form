# trnstn-form

[![build](https://github.com/tuchella/trnstn-form/actions/workflows/node.yml/badge.svg)](https://github.com/tuchella/trnstn-form/actions/workflows/node.yml)

A [kirby](https://github.com/getkirby/getkirby.com) plugin for 
[TRNSTNRADIO.com](https://trnstnradio.com/) providing a simple form
for scheduling events.

## Development

Install dependencies:

```
npm install
```

Start a development server:

```
npm run serve
```

If you have a kirby server installed at `trnstn-form/../kirby` you can also run the 
following command to watch the project workspace for changes. It will compile and install
the plugin in the location above on each change (you can also adapt this to your environment 
by changing the `PATH_TO_KIRBY` constant in the _build-php.js_ script). 

```
npm run watch
```

Then you just start your php server and access the app from there:

```
php -S localhost:8000 ../kirby/kirby/router.php
```



## Build

For the production build you must provide your keys in `src/util/keys.ts` before building. The run the following command:

```
npm run build-plugin
```

This will create a directory at `build/plugin` ready to be dropped into
your kirby server's plugin directory. For more information about the
installation see [INSTALL.md](./INSTALL.md)
