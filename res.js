'use strict';

exports.ok = function(values, res) {
  res.json(values);
  res.end();
};
