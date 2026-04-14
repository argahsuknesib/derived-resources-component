function marked(value) {
  return value;
}
marked.parse = value => value;
marked.parseInline = value => value;
marked.setOptions = () => marked;
marked.use = () => marked;
marked.lexer = () => [];
marked.parser = () => '';
marked.defaults = {};

module.exports = marked;
module.exports.marked = marked;
