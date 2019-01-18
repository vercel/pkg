module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 6,
          browsers: ['last 4 versions', 'safari >= 7']
        }
      }
    ]
  ],
  plugins: []
};
