import{s as a}from"./supabaseClient-BnqcRS6D.js";async function _(){const{data:r,error:e}=await a.from("journal_entries").select("*").order("entry_date",{ascending:!1});if(e)throw e;return r||[]}async function f(r){const{data:e,error:t}=await a.from("journal_entries").select("*").eq("id",r).single();if(t){if(t.code==="PGRST116")return null;throw t}const{data:n,error:s}=await a.from("journal_entry_tasks").select(`
      id,
      journal_entry_id,
      org_node_id,
      action,
      created_at
    `).eq("journal_entry_id",r).order("org_node_id",{ascending:!0}).order("created_at",{ascending:!1});if(s)throw s;const d=n?.reduce((o,i)=>(o.findIndex(u=>u.org_node_id===i.org_node_id)===-1&&o.push(i),o),[])||[];return{...e,tasks:d}}async function g(r,e){const{data:t,error:n}=await a.from("journal_entries").update({...e,updated_at:new Date().toISOString()}).eq("id",r).select().single();if(n)throw n;return t}export{f as a,_ as f,g as u};
