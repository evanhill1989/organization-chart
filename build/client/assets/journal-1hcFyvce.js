import{s as a}from"./supabaseClient-B7OnGE80.js";async function l(){const{data:r,error:e}=await a.from("journal_entries").select("*").order("entry_date",{ascending:!1});if(e)throw e;return r||[]}async function f(r){const{data:e,error:n}=await a.from("journal_entries").select("*").eq("id",r).single();if(n){if(n.code==="PGRST116")return null;throw n}const{data:t,error:s}=await a.from("journal_entry_tasks").select(`
      id,
      journal_entry_id,
      org_node_id,
      action,
      created_at,
      org_node:org_nodes(*)
    `).eq("journal_entry_id",r).order("org_node_id",{ascending:!0}).order("created_at",{ascending:!1});if(s)throw s;const d=t?.reduce((o,i)=>(o.findIndex(u=>u.org_node_id===i.org_node_id)===-1&&o.push(i),o),[])||[];return{...e,tasks:d}}async function g(r,e){const{data:n,error:t}=await a.from("journal_entries").update({...e,updated_at:new Date().toISOString()}).eq("id",r).select().single();if(t)throw t;return n}export{f as a,l as f,g as u};
