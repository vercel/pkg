module.exports = {

  patches: {

    'lib/kerberos.js': [
      'require(\'../build/Release/kerberos\')',
      'require(\'../build/Release/kerberos\', \'can-ignore\')'
    ],

    'lib/sspi.js': [
      'require(\'../build/Release/kerberos\')',
      'require(\'../build/Release/kerberos\', \'can-ignore\')'
    ],

    'lib/win32/wrappers/security_credentials.js': [
      'require(\'../../../build/Release/kerberos\')',
      'require(\'../../../build/Release/kerberos\', \'can-ignore\')'
    ],

    'lib/win32/wrappers/security_context.js': [
      'require(\'../../../build/Release/kerberos\')',
      'require(\'../../../build/Release/kerberos\', \'can-ignore\')'
    ],

    'lib/win32/wrappers/security_buffer.js': [
      'require(\'../../../build/Release/kerberos\')',
      'require(\'../../../build/Release/kerberos\', \'can-ignore\')'
    ],

    'lib/win32/wrappers/security_buffer_descriptor.js': [
      'require(\'../../../build/Release/kerberos\')',
      'require(\'../../../build/Release/kerberos\', \'can-ignore\')'
    ]

  }

};
