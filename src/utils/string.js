'use strict';

function pascal(str) {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function camel(str) {
  const p = pascal(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function kebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

module.exports = { pascal, camel, kebab };
