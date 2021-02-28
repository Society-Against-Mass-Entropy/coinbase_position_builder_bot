const sleep = require("../lib/sleep");

test("sleep 0", async () => {
  const startTime = new Date().getTime();
  await sleep();
  const endTime = new Date().getTime();
  const elapsed = endTime - startTime;
  expect(elapsed).toBeGreaterThan(-1);
  expect(elapsed).toBeLessThan(10);
});
test("sleep 200ms", async () => {
  const startTime = new Date().getTime();
  await sleep(200);
  const endTime = new Date().getTime();
  const elapsed = endTime - startTime;
  expect(elapsed).toBeGreaterThan(199);
  expect(elapsed).toBeLessThan(500);
});
