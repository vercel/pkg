module.exports = {

  patches: {

    'index.js': [
      { do: 'erase' },
      'module.exports = function() {' +
        'throw new Error("EncloseJS: \'callsites\' package is ' +
        'temporarily unsupported. Please create a github issue.")' +
      '};'
    ]

  }

};
