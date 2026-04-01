async function run() {
  const r1 = await fetch('https://api.restful-api.dev/objects', {
    method: 'POST',
    body: JSON.stringify({ name: 'linksDb', data: { watchLinks: {} } }),
    headers: { 'Content-Type': 'application/json' }
  });
  const object1 = await r1.json();
  console.log('Created:', object1.id);
  
  const r2 = await fetch('https://api.restful-api.dev/objects/' + object1.id, {
    method: 'PUT',
    body: JSON.stringify({ name: 'linksDb', data: { watchLinks: { "match123": "url" } } }),
    headers: { 'Content-Type': 'application/json' }
  });
  console.log('Updated:', await r2.status);
  
  const r3 = await fetch('https://api.restful-api.dev/objects/' + object1.id);
  console.log('Fetched:', await r3.json());
}
run();
