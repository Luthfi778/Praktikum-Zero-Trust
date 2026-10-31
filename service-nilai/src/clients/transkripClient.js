const config=require('../config');
async function sync(items) {
  const auth=await fetch(`${config.GATEWAY_URL}/auth/service`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({clientId:config.SERVICE_CLIENT_ID,clientSecret:config.SERVICE_CLIENT_SECRET})});
  const authData=await auth.json();
  if(!auth.ok) throw new Error(authData.error||'Gagal memperoleh token service');
  const response=await fetch(`${config.GATEWAY_URL}/transkrip/sinkron`,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${authData.accessToken}`},body:JSON.stringify({items})});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||data.reason||'Sinkronisasi ditolak');
  return data;
}
module.exports={sync};
