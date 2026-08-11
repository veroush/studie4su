console.log('>>> FETCH DEBUG PRELOAD LOADED <<<');

const __originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const url = typeof args[0] === 'string' ? args[0] : args[0].url;
  const stack = new Error().stack;
  console.log('[FETCH DEBUG] →', url);
  console.log('[FETCH DEBUG] stack:\n' + stack);
  try {
    const res = await __originalFetch(...args);
    console.log('[FETCH DEBUG] ✓', url, res.status);
    return res;
  } catch (err) {
    console.log('[FETCH DEBUG] ✗ FAILED', url, err.message);
    throw err;
  }
};