const Color = function (r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
};

Color.prototype.rgb = function () {
  return `rgb(${this.r}, ${this.g}, ${this.b})`;
};

Color.prototype.hex = function () {
  const rHex = this.r.toString(16).padStart(2, "0").toUpperCase();
  const gHex = this.g.toString(16).padStart(2, "0").toUpperCase();
  const bHex = this.b.toString(16).padStart(2, "0").toUpperCase();
  return `#${rHex}${gHex}${bHex}`;
};

Color.prototype.rgba = function (a) {
  return `rgba(${this.r}, ${this.g}, ${this.b}, ${a})`;
};

const color = new Color(203, 243, 203);

console.log(color.rgb(), color.hex(), color.rgba(0.5));
