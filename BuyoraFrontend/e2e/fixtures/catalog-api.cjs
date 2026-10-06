// Deterministic, local-only UI fixtures. This does not connect to a database,
// contact a payment provider, or send emails. Never use this as the store backend.
const http = require('node:http');
const categories = [
 {id:1,publicId:'00000000-0000-4000-8000-000000000001',name:'Electronics',slug:'electronics',level:0,productCount:3,children:[]},
 {id:2,publicId:'00000000-0000-4000-8000-000000000002',name:'Home & Living',slug:'home-living',level:0,productCount:2,children:[]},
 {id:3,publicId:'00000000-0000-4000-8000-000000000003',name:'Fashion',slug:'fashion',level:0,productCount:1,children:[]},
 {id:4,publicId:'00000000-0000-4000-8000-000000000004',name:'Beauty',slug:'beauty',level:0,productCount:1,children:[]}
];
const products=[
 ['Studio wireless headphones','studio-headphones',12500,16000,1],
 ['Everyday travel speaker','travel-speaker',8900,9900,1],
 ['Minimal desk lamp','desk-lamp',7200,undefined,2],
 ['Canvas weekend tote','weekend-tote',4800,undefined,3],
 ['Everyday coffee cup','coffee-cup',2400,2900,2],
 ['Daily care essentials','daily-care',3500,undefined,4]
].map(([name,slug,price,compareAtPrice,cat],i)=>({
 id:i+1,name,slug,shortDescription:'A sample product for Buyora UI verification.',description:'This is sample catalog data used only for interface testing.',
 category:categories.find(c=>c.id===cat),brand:{id:1,name:'Buyora Studio',slug:'buyora-studio'},
 images:[{id:10+i,url:'/placeholder.svg',altText:name,order:0,isPrimary:true},{id:20+i,url:'/window.svg',altText:'Alternate test image',order:1,isPrimary:false}],
 primaryImage:{id:10+i,url:'/placeholder.svg',altText:name,order:0,isPrimary:true},
 variants:[{id:100+i,sku:'QA-'+(i+1),price,compareAtPrice,availableQuantity:8,stockQuantity:8,reservedQuantity:0,attributes:i===0?{color:'Black'}:{},isActive:true},
 ...(i===0?[{id:200,sku:'QA-IVORY',price:13500,availableQuantity:0,stockQuantity:0,reservedQuantity:0,attributes:{color:'Ivory'},isActive:true}]:[])],
 attributes:i===0?[{id:1,name:'Color',slug:'color',values:[{id:1,value:'Black',order:0},{id:2,value:'Ivory',order:1}]}]:[],
 basePrice:price,averageRating:0,reviewCount:0,status:'ACTIVE',isFeatured:i<4,isNewArrival:i>=2,isBestSeller:i<4,
 specifications:{Material:'Sample specification',Warranty:'See store policy'},createdAt:'2026-10-01T00:00:00Z',updatedAt:'2026-10-01T00:00:00Z'
}));
let items=[];
const settings={businessName:'Buyora',businessAddress:'',supportEmail:'',whatsappNumber:'',supportHours:'',returnWindowDays:30,freeReturnShipping:false,deliveryMinDays:3,deliveryMaxDays:5,codDistricts:[],districtExtraDays:{}};
const user={id:1,publicId:'00000000-0000-4000-8000-000000000005',email:'ui-fixture@example.test',firstName:'UI',lastName:'Fixture',roles:['ADMIN'],emailVerified:true,status:'ACTIVE'};
const shipping=[{id:'1',name:'Standard delivery',price:350,description:'Configured delivery estimate applies.'}];
function cart(){const subtotal=items.reduce((n,i)=>n+i.totalPrice,0);return {id:'fixture-cart',items,itemCount:items.reduce((n,i)=>n+i.quantity,0),summary:{subtotal,discountAmount:0,shippingAmount:0,taxAmount:0,total:subtotal,freeShipping:false}};}
function paged(rows,url){const page=Number(url.searchParams.get('page')||0),size=Number(url.searchParams.get('size')||20);return {content:rows.slice(page*size,(page+1)*size),number:page,size,totalElements:rows.length,totalPages:Math.ceil(rows.length/size),first:page===0,last:(page+1)*size>=rows.length};}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:3000');res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Headers','Content-Type,X-XSRF-TOKEN');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');
 if(req.method==='OPTIONS'){res.writeHead(204).end();return;}
 const url=new URL(req.url,'http://127.0.0.1:8091'),path=url.pathname.replace('/api/v1','');
 let raw='';for await(const chunk of req)raw+=chunk;let body={};try{body=JSON.parse(raw||'{}');}catch{}
 let data=null,status=200;
 if(path==='/auth/csrf')data={token:'ui-fixture',headerName:'X-XSRF-TOKEN'};
 else if(path==='/auth/me')data=user;
 else if(path==='/store/info'||path==='/admin/store-settings')data=settings;
 else if(path==='/store/delivery')data={district:url.searchParams.get('district'),minDays:3,maxDays:5,codAvailable:true,methods:shipping};
 else if(path==='/categories'||path==='/categories/tree')data=categories;
 else if(path.startsWith('/categories/'))data=categories.find(c=>c.slug===path.split('/').pop());
 else if(path==='/brands')data=paged([{id:1,name:'Buyora Studio',slug:'buyora-studio'}],url);
 else if(path==='/products/featured'||path==='/products/best-sellers'||path==='/products/new-arrivals')data=products.slice(0,4);
 else if(path==='/products/facets')data=[{name:'Color',slug:'color',values:['Black','Ivory']}];
 else if(path==='/products/suggestions')data=products.filter(p=>p.name.toLowerCase().includes((url.searchParams.get('q')||'').toLowerCase())).map(p=>({type:'product',id:p.id,name:p.name,slug:p.slug,price:p.basePrice,imageUrl:'/placeholder.svg'}));
 else if(path==='/products'||path==='/products/search'||path==='/admin/products')data=paged(products.filter(p=>p.name.toLowerCase().includes((url.searchParams.get('q')||'').toLowerCase())),url);
 else if(path.startsWith('/products/by-id/'))data=products.find(p=>p.id===Number(path.split('/').pop()));
 else if(path.endsWith('/complements'))data=path.startsWith('/admin/')?[2]:[products[1]];
 else if(path.endsWith('/reviews'))data=paged([],url);
 else if(path.startsWith('/products/'))data=products.find(p=>p.slug===path.split('/')[2]);
 else if(path.startsWith('/admin/products/'))data=products.find(p=>p.id===Number(path.split('/')[3]));
 else if(path==='/wishlist')data={items:[],totalItems:0};
 else if(path==='/wishlist/merge')data={mergedProductIds:body.productIds||[],wishlist:{items:[],totalItems:0}};
 else if(path==='/alerts')data=[];
 else if(path==='/cart/items'&&req.method==='POST'){
  const product=products.find(p=>p.variants.some(v=>v.id===body.variantId)),variant=product?.variants.find(v=>v.id===body.variantId);
  if(!variant||variant.availableQuantity<(body.quantity||1)){status=409;data={message:'Unavailable'};}
  else {items.push({id:items.length+1,product:{id:product.id,name:product.name,slug:product.slug,primaryImage:product.primaryImage},variant,quantity:body.quantity,unitPrice:variant.price,totalPrice:variant.price*body.quantity,discountAmount:0});data=cart();}
 }else if(path==='/cart')data=cart();
 else if(path==='/checkout/preview')data={summary:cart().summary,paymentMethods:['CASH_ON_DELIVERY'],shippingMethods:shipping};
 else if(path==='/admin/categories')data=paged(categories,url);
 else if(path==='/admin/analytics')data=[{event:'product_view',count:12},{event:'add_to_cart',count:4}];
 else if(path==='/admin/payment-reconciliation')data=[];
 else if(path==='/admin/email-operations')data={pending:0,failed:0,sent:0};
 else if(path==='/account/addresses')data=[];
 else if(path==='/admin/returns')data=paged([],url);
 else if(path==='/analytics/events')data=null;
 else {status=404;data={message:'UI fixture route unavailable'};}
 res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data??null));
});
server.listen(8091,'127.0.0.1',()=>console.log('Buyora UI fixture API ready on 127.0.0.1:8091 - sample data only'));
