'use strict';

const { AddressSpace } = require('node-opcua-address-space');

const { generateAddressSpace } = require('node-opcua-address-space/nodeJS');
const { nodesets } = require('node-opcua-nodesets');

(async () => {
  const addressSpace = AddressSpace.create({});
  await generateAddressSpace(addressSpace, [nodesets.standard]);
  console.log('42');
})();
