async function test() {
  console.log("Testing grammar prompt...");
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer sk-cadadb97e8cc4e39b3af03bcd903906f"},
    body:JSON.stringify({model:"deepseek-v4-flash",messages:[
      {role:"system",content:'You are a Mandarin teacher. Output ONLY a JSON object: {"grammar":[{"id":"G1","pattern":"test"}]}'},
      {role:"user",content:"Generate 3 grammar points for Day 31 cafe scenario."}
    ],max_tokens:2000,stream:false,thinking:{type:"disabled"},temperature:0.2}),
    signal:AbortSignal.timeout(30000)
  });
  const d = await r.json();
  console.log("Status:", r.status);
  console.log("Finish:", d.choices?.[0]?.finish_reason);
  console.log("Content:", d.choices?.[0]?.message?.content?.slice(0,500));
  console.log("Reasoning tokens:", d.usage?.completion_tokens_details?.reasoning_tokens || 0);
}
test().catch(e => console.error("FAIL:", e.message));
