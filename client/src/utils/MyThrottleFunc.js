export function MyThrottleFunction(func, wait) {
  let lastcall = 0;
  let id;
  return function (...args) {
    let current = Date.now();
    if (current - lastcall >= wait) {
      func(...args);
      lastcall = current;
    } else {
      if (id) clearTimeout(id);
      id = setTimeout(() => {
        func(...args);
        lastcall = Date.now();
      }, wait - (current - lastcall));
    }
  };
}

// wait 3000
// frist call 1234
// current time 1323
// current - first -> pasttime
// time left to reach wait miliseconds = wait - pasttime
