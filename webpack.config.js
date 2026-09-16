const path = require('path');

module.exports = (_, { mode }) => {
    return {
        ...mode !== 'production' && { devtool: 'source-map' },
        mode: mode,
        entry: mode === 'production' ? './frontend/index.js' : './frontend/client.js',
        output: {
            path: path.resolve('./backend/www'),
            filename: 'spatial.js',
            library: 'spatial',
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        devServer: {
            client: {
                overlay: false
            },
            static: {
                directory: path.join(__dirname, './backend/www'),
            },
            compress: true
        },
        externals: mode === 'production' ? { 'perun-core': 'perun-core' } : {},
        module: {
            rules: [
                {
                    test: /\.(js|jsx)?$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            cacheDirectory: true
                        }
                    }
                },
                {
                    // For pure CSS (without CSS modules)
                    test: /\.css$/i,
                    exclude: /\.module\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    // For CSS modules
                    test: /\.module\.css$/i,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName: '[name]-[local]'
                                }
                            },
                        },
                    ],
                },
                {
                    /*
                     * Images reached from CSS, inlined rather than emitted.
                     *
                     * `asset/resource` wrote each of these to backend/www under a hashed
                     * name -- and `.gitignore` carries `backend/www/*.png`, so not one of
                     * them was ever committed. Only spatial.js, config.js and index.html
                     * are tracked there. So the layer switcher's icon, Leaflet's marker
                     * icon and the wind rose have resolved to files that exist on the
                     * machine that ran the build and nowhere else.
                     *
                     * There is no publicPath either, so even a shipped asset would be
                     * fetched relative to whatever route the host application happens to
                     * be on rather than relative to this bundle.
                     *
                     * Inlining settles both: the bytes travel inside spatial.js, which is
                     * the one file every consumer actually loads.
                     */
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/inline',
                },
                {
                    // Fonts stay on disk: none are referenced today, and inlining one
                    // would put a hundred kilobytes into every consumer's page.
                    test: /\.(eot|ttf|woff|woff2)$/i,
                    type: 'asset/resource',
                },
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx']
        }
    }
};
