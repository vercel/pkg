module.exports = function (stamp) {
  return {
    allow: (!(/^arm/).test(stamp.a))
  };
};
