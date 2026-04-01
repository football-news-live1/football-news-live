const body = JSON.stringify({ jsonData: { watchLinks: {} } });
fetch('https://api.myjson.online/v1/records', {
  method: 'POST',
  body,
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
