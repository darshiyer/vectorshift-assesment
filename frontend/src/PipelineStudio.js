import React from 'react';
import './PipelineStudio.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const h=React.createElement;
const CAT={io:'#22d3ee',model:'#7c83ff',text:'#b07cff',logic:'#f5a524',data:'#10cf95'};
function Icon(type){
  const p={stroke:'currentColor',strokeWidth:1.5,fill:'none',strokeLinecap:'round',strokeLinejoin:'round'};
  const sv=(...c)=>h('svg',{width:15,height:15,viewBox:'0 0 16 16'},...c);
  switch(type){
    case'input':return sv(h('rect',{x:7,y:3,width:6.5,height:10,rx:1.5,...p}),h('path',{d:'M2 8h6M5.5 5.5 8 8l-2.5 2.5',...p}));
    case'output':return sv(h('rect',{x:2.5,y:3,width:6.5,height:10,rx:1.5,...p}),h('path',{d:'M8 8h6M11.5 5.5 14 8l-2.5 2.5',...p}));
    case'llm':return sv(h('path',{d:'M8 2.2l1.4 3.4L13 7l-3.6 1.4L8 12 6.6 8.4 3 7l3.6-1.4z',...p}),h('circle',{cx:12.5,cy:3.5,r:1,...p}));
    case'text':return sv(h('path',{d:'M3 4h10M3 7.5h10M3 11h6',...p}));
    case'filter':return sv(h('path',{d:'M2.5 3.5h11l-4 4.6V13l-3 1V8.1z',...p}));
    case'math':return sv(h('path',{d:'M8 3v10M3 8h10',...p}),h('circle',{cx:4,cy:4,r:.7,fill:'currentColor',stroke:'none'}),h('circle',{cx:12,cy:12,r:.7,fill:'currentColor',stroke:'none'}));
    case'api':return sv(h('circle',{cx:8,cy:8,r:5.5,...p}),h('path',{d:'M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11',...p}));
    case'kb':return sv(h('path',{d:'M8 2.5 14 5 8 7.5 2 5z',...p}),h('path',{d:'M2 8l6 2.5L14 8M2 11l6 2.5L14 11',...p}));
    case'note':return sv(h('path',{d:'M3 2.5h7L13 5.5V13a1 1 0 01-1 1H4a1 1 0 01-1-1z',...p}),h('path',{d:'M9.5 2.5V6h3.2',...p}));
    default:return sv();
  }
}
const DEFS={
  input:{cat:'io',title:'Input',ins:[],outs:[{id:'value',label:'value'}],fields:[{k:'name',lab:'Name',kind:'text'},{k:'type',lab:'Type',kind:'select',opts:['Text','File','Number']}]},
  output:{cat:'io',title:'Output',ins:[{id:'value',label:'value'}],outs:[],fields:[{k:'name',lab:'Name',kind:'text'},{k:'type',lab:'Type',kind:'select',opts:['Text','File','JSON']}]},
  llm:{cat:'model',title:'LLM',ins:[{id:'system',label:'system'},{id:'prompt',label:'prompt'}],outs:[{id:'response',label:'response'}],fields:[{k:'model',lab:'Model',kind:'select',opts:['gpt-4o','claude-3.7','llama-3.1','mistral-l']},{k:'temp',lab:'Temperature',kind:'text'}]},
  text:{cat:'text',title:'Text',ins:[{id:'in',label:'input'}],outs:[{id:'output',label:'output'}],fields:[{k:'text',lab:'Template',kind:'area'}]},
  filter:{cat:'logic',title:'Filter',ins:[{id:'in',label:'input'}],outs:[{id:'pass',label:'pass'},{id:'fail',label:'fail'}],fields:[{k:'cond',lab:'Condition',kind:'text'},{k:'op',lab:'Mode',kind:'select',opts:['keep','drop','dedupe']}]},
  math:{cat:'logic',title:'Math',ins:[{id:'a',label:'a'},{id:'b',label:'b'}],outs:[{id:'result',label:'result'}],fields:[{k:'op',lab:'Operation',kind:'select',opts:['add','subtract','multiply','divide']}]},
  api:{cat:'data',title:'API Request',ins:[{id:'body',label:'body'}],outs:[{id:'response',label:'response'}],fields:[{k:'method',lab:'Method',kind:'select',opts:['GET','POST','PUT','DELETE']},{k:'url',lab:'URL',kind:'text'}]},
  kb:{cat:'data',title:'Knowledge Base',ins:[{id:'query',label:'query'}],outs:[{id:'results',label:'results'}],fields:[{k:'source',lab:'Source',kind:'select',opts:['docs','support','codebase']},{k:'topk',lab:'Top K',kind:'text'}]},
  note:{cat:'text',title:'Note',ins:[],outs:[],fields:[{k:'note',lab:'',kind:'note'}]}
};
const NODE_W=248,HEADER_H=46,PORTS_PT=10,PORT_GAP=24,PORT_C=HEADER_H+PORTS_PT+PORT_GAP/2;
const PALETTE=[
  {label:'Input / Output',cat:'io',types:['input','output']},
  {label:'Models',cat:'model',types:['llm']},
  {label:'Text',cat:'text',types:['text','note']},
  {label:'Logic',cat:'logic',types:['filter','math']},
  {label:'Data',cat:'data',types:['kb','api']},
];
function defFields(type){
  const d={input:{name:'input_1',type:'Text'},output:{name:'output_1',type:'Text'},llm:{model:'gpt-4o',temp:'0.7'},
    text:{text:'Summarise {{input}} for the user.'},filter:{cond:'score > 0.5',op:'keep'},math:{op:'add'},
    api:{method:'GET',url:'https://api.acme.dev/v1'},kb:{source:'docs',topk:'5'},note:{note:'Pin context or TODOs here.'}};
  return {...d[type]};
}
export class PipelineStudio extends React.Component{
  constructor(p){super(p);
    this.counters={input:1,output:1,llm:1,text:1,filter:1,math:1,api:1,kb:1,note:1};
    const N=[
      {id:'input_1',type:'input',x:30,y:70,fields:{name:'user_query',type:'Text'}},
      {id:'text_1',type:'text',x:30,y:300,fields:{text:'You are a concise assistant for {{user_query}}.'}},
      {id:'llm_1',type:'llm',x:360,y:150,fields:{model:'gpt-4o',temp:'0.7'}},
      {id:'output_1',type:'output',x:720,y:210,fields:{name:'answer',type:'Text'}},
    ];
    const E=[
      {id:'e1',source:'input_1',sh:'value',target:'llm_1',th:'prompt'},
      {id:'e2',source:'text_1',sh:'output',target:'llm_1',th:'system'},
      {id:'e3',source:'llm_1',sh:'response',target:'output_1',th:'value'},
    ];
    this.state={nodes:N,edges:E,selectedId:null,draggingId:null,connecting:null,hoverTarget:null,
      pan:{x:60,y:30},zoom:.9,modal:null,modalClosing:false,ac:null,paletteDrag:null,mouse:{x:0,y:0},
      dispNodes:0,dispEdges:0,cycles:[],status:'valid',panning:false,celebrate:false};
  }
  componentDidMount(){
    this._mm=e=>this.onMove(e); this._mu=e=>this.onUp(e); this._kd=e=>{if(e.key==='Escape'){this.setState({connecting:null,modal:this.state.modal?null:null,modalClosing:false,ac:null});if(this.state.modal)this.closeModal();}if((e.key==='Delete'||e.key==='Backspace')&&this.state.selectedId&&!/input|textarea/i.test(e.target.tagName))this.delNode(this.state.selectedId);};
    window.addEventListener('mousemove',this._mm);window.addEventListener('mouseup',this._mu);window.addEventListener('keydown',this._kd);
    this.sync(true);
  }
  componentWillUnmount(){window.removeEventListener('mousemove',this._mm);window.removeEventListener('mouseup',this._mu);window.removeEventListener('keydown',this._kd);}
  /* ---- geometry ---- */
  rect(){return this._cv?this._cv.getBoundingClientRect():{left:0,top:0,width:1000,height:700};}
  toWorld(cx,cy){const r=this.rect(),{pan,zoom}=this.state;return{x:(cx-r.left-pan.x)/zoom,y:(cy-r.top-pan.y)/zoom};}
  hPos(node,side,i){return{x:side==='out'?node.x+NODE_W:node.x,y:node.y+PORT_C+i*PORT_GAP};}
  edgePath(sx,sy,tx,ty){const co=Math.max(40,Math.abs(tx-sx)*.5);return`M ${sx} ${sy} C ${sx+co} ${sy}, ${tx-co} ${ty}, ${tx} ${ty}`;}
  findOut(nid){const n=this.state.nodes.find(x=>x.id===nid);if(!n)return null;const d=DEFS[n.type];return d.outs.map((o,i)=>({...o,i,pos:this.hPos(n,'out',i),n}));}
  /* ---- counts ---- */
  animateCounts(){const tn=this.state.nodes.length,te=this.state.edges.length;cancelAnimationFrame(this._cr);const sn=this.state.dispNodes,se=this.state.dispEdges,t0=performance.now(),D=520;
    const tick=t=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);this.setState({dispNodes:Math.round(sn+(tn-sn)*e),dispEdges:Math.round(se+(te-se)*e)});if(k<1)this._cr=requestAnimationFrame(tick);};this._cr=requestAnimationFrame(tick);}
  /* ---- graph analysis ---- */
  cycleNodes(){const ns=this.state.nodes,es=this.state.edges,adj={};ns.forEach(n=>adj[n.id]=[]);es.forEach(e=>{if(adj[e.source])adj[e.source].push(e.target);});
    let idx=0;const stack=[],on={},low={},num={},res=new Set();
    const dfs=v=>{num[v]=low[v]=idx++;stack.push(v);on[v]=1;for(const w of adj[v]){if(num[w]===undefined){dfs(w);low[v]=Math.min(low[v],low[w]);}else if(on[w])low[v]=Math.min(low[v],num[w]);}if(low[v]===num[v]){const c=[];let w;do{w=stack.pop();on[w]=0;c.push(w);}while(w!==v);if(c.length>1)c.forEach(x=>res.add(x));}};
    ns.forEach(n=>{if(num[n.id]===undefined)dfs(n.id);});es.forEach(e=>{if(e.source===e.target)res.add(e.source);});return res;}
  warnNodes(){const ns=this.state.nodes,es=this.state.edges,conn=new Set();es.forEach(e=>{conn.add(e.source);conn.add(e.target);});
    return ns.filter(n=>n.type!=='note'&&!conn.has(n.id)).map(n=>n.id);}
  topo(){const ns=this.state.nodes.filter(n=>n.type!=='note'),es=this.state.edges,indeg={},adj={};ns.forEach(n=>{indeg[n.id]=0;adj[n.id]=[];});
    es.forEach(e=>{if(adj[e.source]){adj[e.source].push(e.target);if(indeg[e.target]!==undefined)indeg[e.target]++;}});
    const q=ns.filter(n=>indeg[n.id]===0).map(n=>n.id),order=[];while(q.length){const v=q.shift();order.push(v);for(const w of adj[v])if(--indeg[w]===0)q.push(w);}return{order,isDag:order.length===ns.length};}
  sync(init){const cyc=[...this.cycleNodes()];const warns=this.warnNodes();const status=cyc.length?'errors':(warns.length?'warnings':'valid');
    const prev=this.state.status;const becameValid=!init&&status==='valid'&&prev!=='valid';
    this.setState({cycles:cyc},()=>{this.setState({status});this.animateCounts();
      if(becameValid){this.setState({celebrate:true});clearTimeout(this._ct);this._ct=setTimeout(()=>this.setState({celebrate:false}),950);}});}
  /* ---- mutations ---- */
  addNode(type,wx,wy){const n=++this.counters[type];const id=type+'_'+n;
    const f=defFields(type);if(type==='input')f.name='input_'+n;if(type==='output')f.name='output_'+n;
    this.setState(s=>({nodes:[...s.nodes,{id,type,x:Math.round(wx-NODE_W/2),y:Math.round(wy-30),fields:f}],selectedId:id}),()=>this.sync());}
  delNode(id){this.setState(s=>({nodes:s.nodes.filter(n=>n.id!==id),edges:s.edges.filter(e=>e.source!==id&&e.target!==id),selectedId:null}),()=>this.sync());}
  delEdge(id){this.setState(s=>({edges:s.edges.filter(e=>e.id!==id)}),()=>this.sync());}
  setField(id,k,v){this.setState(s=>({nodes:s.nodes.map(n=>n.id===id?{...n,fields:{...n.fields,[k]:v}}:n)}));}
  clearAll(){this.setState({nodes:[],edges:[],selectedId:null,connecting:null,ac:null},()=>this.sync());}
  /* ---- interactions ---- */
  onCanvasDown(e){if(e.target.closest('.node')||e.target.closest('.handle'))return;
    this.setState({selectedId:null,ac:null,panning:true});this._pan={x:e.clientX,y:e.clientY,px:this.state.pan.x,py:this.state.pan.y};}
  onNodeDown(e,id){if(e.target.closest('.node-del')||e.target.closest('input,select,textarea,.handle'))return;
    e.stopPropagation();const n=this.state.nodes.find(x=>x.id===id);
    this.setState({selectedId:id,draggingId:id,nodes:[...this.state.nodes.filter(x=>x.id!==id),n]});
    this._drag={x:e.clientX,y:e.clientY,nx:n.x,ny:n.y};}
  onHandleDown(e,nid,side,hid,i){e.stopPropagation();if(side!=='out')return;const n=this.state.nodes.find(x=>x.id===nid);const pos=this.hPos(n,'out',i);
    const w=this.toWorld(e.clientX,e.clientY);this.setState({connecting:{from:nid,hid,fx:pos.x,fy:pos.y,x:w.x,y:w.y,cat:DEFS[n.type].cat},selectedId:null});}
  onHandleEnter(nid,side,hid){const c=this.state.connecting;if(!c||side!=='in')return;
    if(nid===c.from)return;const dup=this.state.edges.some(ed=>ed.source===c.from&&ed.sh===c.hid&&ed.target===nid&&ed.th===hid);if(dup)return;
    this.setState({hoverTarget:{nid,hid}});}
  onHandleLeave(){if(this.state.connecting)this.setState({hoverTarget:null});}
  onMove(e){const s=this.state;
    if(s.panning&&this._pan){this.setState({pan:{x:this._pan.px+(e.clientX-this._pan.x),y:this._pan.py+(e.clientY-this._pan.y)}});return;}
    if(s.draggingId&&this._drag){const dx=(e.clientX-this._drag.x)/s.zoom,dy=(e.clientY-this._drag.y)/s.zoom;
      this.setState({nodes:s.nodes.map(n=>n.id===s.draggingId?{...n,x:Math.round(this._drag.nx+dx),y:Math.round(this._drag.ny+dy)}:n)});return;}
    if(s.connecting){const w=this.toWorld(e.clientX,e.clientY);this.setState({connecting:{...s.connecting,x:w.x,y:w.y},mouse:{x:e.clientX,y:e.clientY}});}
    if(s.paletteDrag){this.setState({mouse:{x:e.clientX,y:e.clientY}});}}
  onUp(e){const s=this.state;
    if(s.connecting){const ht=s.hoverTarget;if(ht){const id='e'+Date.now();
      this.setState(st=>({edges:[...st.edges,{id,source:s.connecting.from,sh:s.connecting.hid,target:ht.nid,th:ht.hid}],connecting:null,hoverTarget:null}),()=>this.sync());}
      else this.setState({connecting:null,hoverTarget:null});}
    if(s.draggingId)this.setState({draggingId:null});
    if(s.panning)this.setState({panning:false});
    if(s.paletteDrag){const r=this.rect();if(e.clientX>=r.left&&e.clientX<=r.left+r.width&&e.clientY>=r.top&&e.clientY<=r.top+r.height){const w=this.toWorld(e.clientX,e.clientY);this.addNode(s.paletteDrag.type,w.x,w.y);}this.setState({paletteDrag:null});}}
  startPalette(e,type){e.preventDefault();this.setState({paletteDrag:{type},mouse:{x:e.clientX,y:e.clientY}});}
  onWheel(e){e.preventDefault();const r=this.rect(),{pan,zoom}=this.state;const d=-e.deltaY*.0014;const nz=Math.min(2,Math.max(.35,zoom*(1+d)));
    const mx=e.clientX-r.left,my=e.clientY-r.top;const wx=(mx-pan.x)/zoom,wy=(my-pan.y)/zoom;
    this.setState({zoom:nz,pan:{x:mx-wx*nz,y:my-wy*nz}});}
  zoomBy(f){const r=this.rect(),{pan,zoom}=this.state;const nz=Math.min(2,Math.max(.35,zoom*f));const cx=r.width/2,cy=r.height/2;const wx=(cx-pan.x)/zoom,wy=(cy-pan.y)/zoom;this.setState({zoom:nz,pan:{x:cx-wx*nz,y:cy-wy*nz}});}
  fit(){const ns=this.state.nodes;if(!ns.length){this.setState({zoom:.9,pan:{x:60,y:30}});return;}
    const r=this.rect();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;ns.forEach(n=>{x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x+NODE_W);y1=Math.max(y1,n.y+200);});
    const w=x1-x0,hh=y1-y0;const z=Math.min(1.3,Math.min((r.width-120)/w,(r.height-120)/hh));this.setState({zoom:z,pan:{x:(r.width-w*z)/2-x0*z,y:(r.height-hh*z)/2-y0*z}});}
  ripple(e){const b=e.currentTarget,r=b.getBoundingClientRect(),s=document.createElement('span');s.className='rip';const d=Math.max(r.width,r.height)*2.2;s.style.width=s.style.height=d+'px';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';b.appendChild(s);setTimeout(()=>s.remove(),620);}
  async submit(e){this.ripple(e);const ns=this.state.nodes,es=this.state.edges;
    try{const res=await fetch(`${API_BASE}/pipelines/parse`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nodes:ns.map(n=>({id:n.id})),edges:es.map(ed=>({source:ed.source,target:ed.target}))})});
      if(!res.ok)throw new Error('Request failed ('+res.status+')');
      const d=await res.json();
      this.setState({modal:{nodes:d.num_nodes,edges:d.num_edges,isDag:d.is_dag,order:d.execution_order||[],cycles:d.cycle_nodes||[],error:null},modalClosing:false});
    }catch(err){this.setState({modal:{nodes:ns.length,edges:es.length,isDag:false,order:[],cycles:[],error:err.message},modalClosing:false});}}
  closeModal(){this.setState({modalClosing:true});clearTimeout(this._mt);this._mt=setTimeout(()=>this.setState({modal:null,modalClosing:false}),200);}
  /* ---- autocomplete ---- */
  varNames(){const ins=this.state.nodes.filter(n=>n.type==='input').map(n=>({k:n.fields.name||n.id,t:'input'}));
    return [...ins,{k:'context',t:'global'},{k:'history',t:'global'},{k:'query',t:'global'}];}
  onTextInput(e,id){const v=e.target.value,caret=e.target.selectionStart;this.setField(id,'text',v);
    e.target.style.height='auto';e.target.style.height=Math.min(160,e.target.scrollHeight)+'px';
    const open=v.lastIndexOf('{{',caret-1);if(open!==-1){const close=v.indexOf('}}',open);if(close===-1||close>=caret){const q=v.slice(open+2,caret).trim();this.setState({ac:{id,q,start:open,caret}});return;}}
    if(this.state.ac)this.setState({ac:null});}
  pickVar(id,name){const s=this.state.ac;if(!s)return;const n=this.state.nodes.find(x=>x.id===id);const v=n.fields.text;
    const before=v.slice(0,s.start),after=v.slice(s.caret);const nv=before+'{{'+name+'}}'+after;this.setField(id,'text',nv);this.setState({ac:null});}
  /* ---- renderers ---- */
  renderNode(node){const d=DEFS[node.type],cat=node.cat=CAT[d.cat];const sel=this.state.selectedId===node.id;const drg=this.state.draggingId===node.id;
    const err=this.state.cycles.includes(node.id);const rows=Math.max(d.ins.length,d.outs.length);
    const cls=['node',node.type==='note'?'note-node':'',sel?'selected':'',drg?'dragging':'',err?'err':''].filter(Boolean).join(' ');
    const handles=[];
    d.ins.forEach((p,i)=>{const ht=this.state.hoverTarget,c=this.state.connecting;
      const mag=c&&ht&&ht.nid===node.id&&ht.hid===p.id;const live=c&&c.from!==node.id;
      handles.push(h('div',{key:'in'+p.id,className:'handle '+(mag?'magnet':'')+(live?' live':''),style:{left:0,top:PORT_C+i*PORT_GAP},
        onMouseEnter:()=>this.onHandleEnter(node.id,'in',p.id),onMouseLeave:()=>this.onHandleLeave(),onMouseDown:e=>this.onHandleDown(e,node.id,'in',p.id,i)}));});
    d.outs.forEach((p,i)=>{handles.push(h('div',{key:'out'+p.id,className:'handle',style:{left:NODE_W,top:PORT_C+i*PORT_GAP},
        onMouseDown:e=>this.onHandleDown(e,node.id,'out',p.id,i)}));});
    const portGrid=rows>0?h('div',{className:'ports',style:{minHeight:rows*PORT_GAP}},
      h('div',{className:'port-col'},d.ins.map(p=>h('div',{className:'port-row',key:p.id},h('span',{className:'port-dot'}),p.label))),
      h('div',{className:'port-col right'},d.outs.map(p=>h('div',{className:'port-row',key:p.id},p.label,h('span',{className:'port-dot'}))))):null;
    const fields=d.fields.map(f=>this.renderField(node,f));
    return h('div',{key:node.id,className:cls,style:{left:node.x,top:node.y,'--cat':cat},onMouseDown:e=>this.onNodeDown(e,node.id)},
      h('div',{className:'node-head'},h('div',{className:'node-ic'},Icon(node.type)),
        h('div',{className:'node-title'},d.title),h('div',{className:'node-id'},node.id),
        h('div',{className:'node-del',title:'Delete',onMouseDown:e=>{e.stopPropagation();this.delNode(node.id);}},
          h('svg',{width:13,height:13,viewBox:'0 0 13 13',fill:'none'},h('path',{d:'M3 3l7 7M10 3l-7 7',stroke:'currentColor',strokeWidth:1.4,strokeLinecap:'round'})))),
      h('div',{className:'node-body'},portGrid,h('div',{className:'fields'},...fields)),
      ...handles);
  }
  renderField(node,f){const v=node.fields[f.k]??'';
    if(f.kind==='note')return h('textarea',{key:f.k,className:'note-area',value:v,placeholder:'Write a note…',
      onMouseDown:e=>e.stopPropagation(),onChange:e=>this.setField(node.id,f.k,e.target.value)});
    if(f.kind==='select')return h('div',{className:'field',key:f.k},h('label',{className:'field-lab'},f.lab),
      h('select',{className:'nf-select',value:v,onMouseDown:e=>e.stopPropagation(),onChange:e=>this.setField(node.id,f.k,e.target.value)},
        f.opts.map(o=>h('option',{key:o,value:o},o))));
    if(f.kind==='area'){const ac=this.state.ac&&this.state.ac.id===node.id?this.state.ac:null;
      const items=ac?this.varNames().filter(x=>x.k.toLowerCase().includes(ac.q.toLowerCase())):[];
      return h('div',{className:'field',key:f.k,style:{position:'relative'}},h('label',{className:'field-lab'},f.lab),
        h('textarea',{className:'nf-area',value:v,rows:3,onMouseDown:e=>e.stopPropagation(),
          onInput:e=>this.onTextInput(e,node.id),onBlur:()=>setTimeout(()=>this.state.ac&&this.state.ac.id===node.id&&this.setState({ac:null}),140),onChange:()=>{}}),
        ac&&items.length?h('div',{className:'ac'},h('div',{className:'ac-head'},'Variables'),
          items.map((it,i)=>h('div',{className:'ac-item'+(i===0?' on':''),key:it.k,onMouseDown:e=>{e.preventDefault();this.pickVar(node.id,it.k);}},
            h('span',{},'{{'),h('span',{className:'vk'},it.k),h('span',{},'}}'),h('span',{className:'vt'},it.t)))):null);
    }
    return h('div',{className:'field',key:f.k},h('label',{className:'field-lab'},f.lab),
      h('input',{className:'nf-input',value:v,spellCheck:false,onMouseDown:e=>e.stopPropagation(),onChange:e=>this.setField(node.id,f.k,e.target.value)}));
  }
  renderCanvas(){const{nodes,edges,pan,zoom,connecting}=this.state;
    const grid=h('div',{className:'grid',style:{backgroundImage:'radial-gradient(circle, rgba(124,131,255,.16) 1.2px, transparent 1.2px), radial-gradient(circle, rgba(255,255,255,.045) 1px, transparent 1px)',
      backgroundSize:(zoom*26)+'px '+(zoom*26)+'px,'+(zoom*26)+'px '+(zoom*26)+'px',backgroundPosition:pan.x+'px '+pan.y+'px,'+pan.x+'px '+pan.y+'px'}});
    const epaths=[];edges.forEach(e=>{const sn=nodes.find(n=>n.id===e.source),tn=nodes.find(n=>n.id===e.target);if(!sn||!tn)return;
      const si=DEFS[sn.type].outs.findIndex(o=>o.id===e.sh),ti=DEFS[tn.type].ins.findIndex(o=>o.id===e.th);
      const sp=this.hPos(sn,'out',Math.max(0,si)),tp=this.hPos(tn,'in',Math.max(0,ti));
      const path=this.edgePath(sp.x+4000,sp.y+4000,tp.x+4000,tp.y+4000);
      const c0=CAT[DEFS[sn.type].cat],c1=CAT[DEFS[tn.type].cat];const bad=this.state.cycles.includes(e.source)&&this.state.cycles.includes(e.target);
      const gid='g'+e.id;
      epaths.push(h('g',{key:e.id},
        h('defs',{},h('linearGradient',{id:gid,gradientUnits:'userSpaceOnUse',x1:sp.x+4000,y1:sp.y+4000,x2:tp.x+4000,y2:tp.y+4000},
          h('stop',{offset:0,stopColor:bad?'#ff5a6e':c0}),h('stop',{offset:1,stopColor:bad?'#ff5a6e':c1}))),
        h('path',{className:'edge-base',d:path,stroke:'url(#'+gid+')'}),
        h('path',{className:'edge-flow',d:path,stroke:bad?'#ff5a6e':c1,pathLength:100,style:{color:bad?'#ff5a6e':c1}}),
        h('path',{className:'edge-hit',d:path,onClick:()=>this.delEdge(e.id)})));});
    if(connecting){const path=this.edgePath(connecting.fx+4000,connecting.fy+4000,connecting.x+4000,connecting.y+4000);
      epaths.push(h('path',{key:'tmp',className:'wire-temp',d:path,style:{stroke:connecting.cat}}));}
    const svg=h('svg',{className:'edge-svg'},epaths);
    const world=h('div',{className:'world',style:{transform:'translate('+pan.x+'px,'+pan.y+'px) scale('+zoom+')'}},
      svg,nodes.map(n=>this.renderNode(n)));
    return h(React.Fragment,{},grid,world);
  }
  renderMinimap(){const{nodes,pan,zoom}=this.state;const r=this.rect();const W=188,H=124;
    let x0=0,y0=0,x1=1000,y1=700;if(nodes.length){x0=1e9;y0=1e9;x1=-1e9;y1=-1e9;nodes.forEach(n=>{x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x+NODE_W);y1=Math.max(y1,n.y+150);});}
    const pad=80;x0-=pad;y0-=pad;x1+=pad;y1+=pad;const sc=Math.min(W/(x1-x0),H/(y1-y0));
    const mx=v=>(v-x0)*sc,my=v=>(v-y0)*sc;
    const vx=mx(-pan.x/zoom),vy=my(-pan.y/zoom),vw=(r.width/zoom)*sc,vh=(r.height/zoom)*sc;
    return h('svg',{width:W,height:H,viewBox:'0 0 '+W+' '+H},
      nodes.map(n=>h('rect',{key:n.id,x:mx(n.x),y:my(n.y),width:NODE_W*sc,height:130*sc,rx:2,fill:CAT[DEFS[n.type].cat],opacity:.85})),
      h('rect',{x:vx,y:vy,width:vw,height:vh,fill:'rgba(255,255,255,.06)',stroke:'rgba(255,255,255,.4)',strokeWidth:1,rx:3}));
  }
  renderGhost(){const g=this.state.paletteDrag;if(!g)return null;const cat=CAT[DEFS[g.type].cat];
    return h('div',{className:'ghost',style:{left:this.state.mouse.x,top:this.state.mouse.y,'--cat':cat}},
      h('span',{className:'pchip-ic'},Icon(g.type)),DEFS[g.type].title);}
  renderModal(){const m=this.state.modal;if(!m)return null;const ok=!m.error&&m.isDag&&m.nodes>0;
    return h('div',{className:'scrim'+(this.state.modalClosing?' closing':''),onMouseDown:e=>{if(e.target===e.currentTarget)this.closeModal();}},
      h('div',{className:'modal'},
        h('div',{className:'modal-top'},
          h('div',{className:'modal-x',onClick:()=>this.closeModal()},h('svg',{width:13,height:13,viewBox:'0 0 13 13'},h('path',{d:'M3 3l7 7M10 3l-7 7',stroke:'currentColor',strokeWidth:1.4,strokeLinecap:'round'}))),
          h('div',{className:'modal-verdict'},
            h('div',{className:'verdict-ic '+(ok?'ok':'bad')},ok?
              h('svg',{width:24,height:24,viewBox:'0 0 24 24',fill:'none'},h('path',{d:'M5 12.5l4.5 4.5L19 7',stroke:'currentColor',strokeWidth:2.2,strokeLinecap:'round',strokeLinejoin:'round'})):
              h('svg',{width:24,height:24,viewBox:'0 0 24 24',fill:'none'},h('path',{d:'M12 7v6M12 17h.01',stroke:'currentColor',strokeWidth:2.2,strokeLinecap:'round'},),h('circle',{cx:12,cy:12,r:9,stroke:'currentColor',strokeWidth:2}))),
            h('div',{className:'verdict-t'},h('b',{},m.error?'Backend unreachable':ok?'Valid pipeline':'Invalid pipeline'),
              h('span',{},m.error?(m.error+'. Make sure the API is running.'):ok?'This graph is a directed acyclic graph — ready to run.':(m.cycles.length?'A cycle was detected — pipelines must be acyclic.':'Add at least one node to run.'))))),
        h('div',{className:'modal-stats'},
          h('div',{className:'mstat'},h('b',{},m.nodes),h('span',{},'Nodes')),
          h('div',{className:'mstat'},h('b',{},m.edges),h('span',{},'Edges'))),
        h('div',{className:'modal-order'},
          h('div',{className:'order-h'},ok?'Execution order':'Issue'),
          ok?h('div',{className:'order-list'},m.order.map((id,i)=>{const n=this.state.nodes.find(x=>x.id===id);const cat=n?CAT[DEFS[n.type].cat]:'#888';
            return h('div',{className:'order-row',key:id,style:{animationDelay:(i*45)+'ms'}},
              h('div',{className:'order-n'},i+1),h('div',{className:'order-id'},id),
              h('div',{className:'order-cat',style:{'--cat':cat}},n?DEFS[n.type].title:'')); })):
            h('div',{className:'order-bad'},m.cycles.length?('Nodes in cycle: '+m.cycles.join(' → ')+'. Remove a connecting edge to break the loop.'):'Drag a node onto the canvas, then connect and submit.'))));
  }
  render(){
    const v=this.renderVals();
    return (
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <svg className="brand-glyph" viewBox="0 0 34 34" fill="none">
              <defs><linearGradient id="bgrad" x1="0" y1="0" x2="34" y2="34"><stop offset="0" stopColor="#22d3ee"/><stop offset=".55" stopColor="#7c83ff"/><stop offset="1" stopColor="#b07cff"/></linearGradient></defs>
              <path className="lk" d="M9 9 L25 17 M25 17 L9 25" stroke="url(#bgrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4"/>
              <circle className="nd nd1" cx="9" cy="9" r="4.4" fill="url(#bgrad)"/>
              <circle className="nd nd2" cx="25" cy="17" r="4.4" fill="url(#bgrad)"/>
              <circle className="nd nd3" cx="9" cy="25" r="4.4" fill="url(#bgrad)"/>
            </svg>
            <div><div className="brand-title">Pipeline Studio</div><div className="brand-sub">node orchestration</div></div>
          </div>
          <div className="tb-center">
            <div className={`pill ${v.statusClass} ${v.celebrateClass}`}><span className="dot"></span>{v.statusLabel}</div>
            <div className="counters"><div className="ctr"><b>{v.dispNodes}</b><span>nodes</span></div><div className="ctr"><b>{v.dispEdges}</b><span>edges</span></div></div>
          </div>
          <div className="tb-actions">
            <button className="btn" onClick={v.onClear}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 4h9M5.5 4V2.7c0-.4.3-.7.7-.7h1.6c.4 0 .7.3.7.7V4M4 4l.4 7.3c0 .4.3.7.7.7h3.8c.4 0 .7-.3.7-.7L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>Clear</button>
            <button className="btn btn-primary" onClick={v.onSubmit}><svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h8M7.5 4l3.5 3.5L7.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Submit Pipeline</button>
          </div>
        </header>
        <div className="body">
          <aside className="palette">
            <div className="palette-head">Node Library</div>
            {v.palette.map((g,gi)=>(
              <div className="pgroup" key={gi}>
                <div className="pgroup-label" style={{'--gl':g.color}}>{g.label}</div>
                <div className="pchips">
                  {g.items.map((it,ii)=>(
                    <div className="pchip" key={ii} style={{'--cat':it.color}} onMouseDown={it.onDown}><span className="pchip-ic">{it.icon}</span><span className="pchip-label">{it.label}</span><span className="pchip-grab">⋮⋮</span></div>
                  ))}
                </div>
              </div>
            ))}
          </aside>
          <main className="canvas-wrap">
            <div className={`canvas ${v.panClass}`} ref={el=>{this._cv=el;}} onMouseDown={v.onCanvasDown} onWheel={v.onWheel}>{v.canvas}</div>
            {v.isEmpty && (
              <div className="empty">
                <svg className="empty-ic" viewBox="0 0 64 64" fill="none"><circle cx="14" cy="32" r="6" stroke="#6e7689" strokeWidth="2"/><circle cx="50" cy="18" r="6" stroke="#6e7689" strokeWidth="2"/><circle cx="50" cy="46" r="6" stroke="#6e7689" strokeWidth="2"/><path d="M20 32 38 20M20 32 38 44" stroke="#6e7689" strokeWidth="2" strokeDasharray="3 4"/></svg>
                <h3>Your canvas is empty</h3>
                <p>Drag a node from the library on the left to begin composing your pipeline.</p>
              </div>
            )}
            <div className="controls"><button className="ctrl-btn" onClick={v.onZoomIn}>+</button><button className="ctrl-btn" onClick={v.onZoomOut}>−</button><button className="ctrl-btn" onClick={v.onFit}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5V3a1 1 0 011-1h2M12 5V3a1 1 0 00-1-1H9M2 9v2a1 1 0 001 1h2M12 9v2a1 1 0 01-1 1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></button><div className="ctrl-z">{v.zoomPct}</div></div>
            <div className="minimap">{v.minimap}</div>
          </main>
        </div>
        {v.ghost}
        {v.modal}
      </div>
    );
  }

  renderVals(){const s=this.state;
    const labels={valid:'Pipeline valid',warnings:'Has warnings',errors:'Has errors'};
    const palette=PALETTE.map(g=>({label:g.label,color:CAT[g.cat],items:g.types.map(t=>({label:DEFS[t].title,color:CAT[DEFS[t].cat],icon:Icon(t),onDown:e=>this.startPalette(e,t)}))}));
    return {
      palette,
      canvas:this.renderCanvas(),minimap:this.renderMinimap(),ghost:this.renderGhost(),modal:this.renderModal(),
      statusClass:s.status==='valid'?'is-valid':s.status==='warnings'?'is-warn':'is-err',
      celebrateClass:s.celebrate?'celebrate':'',
      statusLabel:labels[s.status],dispNodes:s.dispNodes,dispEdges:s.dispEdges,
      isEmpty:s.nodes.length===0,panClass:s.panning?'panning':'',zoomPct:Math.round(s.zoom*100)+'%',
      onCanvasDown:e=>this.onCanvasDown(e),onWheel:e=>this.onWheel(e),
      onClear:e=>{this.ripple(e);this.clearAll();},onSubmit:e=>this.submit(e),
      onZoomIn:()=>this.zoomBy(1.2),onZoomOut:()=>this.zoomBy(1/1.2),onFit:()=>this.fit(),
    };
  }
}