/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  extends: "./.dependency-cruiser.cjs",
  options: {
    exclude: {
      dynamic: true
    }
  }
};
