const obj = {};
let keyCount = 0;
while (true) {
  obj[Math.random().toString(36)] = keyCount;
  if (++keyCount % 10000 === 0) console.log(keyCount);
}
