const touch = require("../lib/touch");
const fs = require("fs");

test("touch an existing file", async () => {
  const file = `${__dirname}/../README.md`;
  const lastModifiedTime = fs.statSync(file).mtime.getTime();
  await touch(file);
  const newModifiedTime = fs.statSync(file).mtime.getTime();
  expect(newModifiedTime).toBeGreaterThan(lastModifiedTime);
});
test("touch to create a new file", async () => {
  const file = `${__dirname}/touch.test.md`;
  let exists = await fs.promises
    .access(file)
    .then(() => true)
    .catch(() => false);
  expect(exists).toBe(false);
  await touch(file);
  exists = await fs.promises
    .access(file)
    .then(() => true)
    .catch(() => false);
  expect(exists).toBe(true);
  fs.unlinkSync(file);
});
