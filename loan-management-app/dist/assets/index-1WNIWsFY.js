(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))c(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&c(u)}).observe(document,{childList:!0,subtree:!0});function l(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function c(a){if(a.ep)return;a.ep=!0;const o=l(a);fetch(a.href,o)}})();const oe={WEEKLY:{label:"Weekly",periodsPerYear:52,daysInterval:7},BIWEEKLY:{label:"Bi-weekly (Fortnightly)",periodsPerYear:26,daysInterval:14},MONTHLY:{label:"Monthly",periodsPerYear:12,daysInterval:30}},M={FLAT:"flat",REDUCING:"reducing"};function ie(n,e,l="MONTHLY"){const c=new Date(n);if(c.setHours(12,0,0,0),l==="WEEKLY")c.setDate(c.getDate()+e*7);else if(l==="BIWEEKLY")c.setDate(c.getDate()+e*14);else{const a=c.getDate();c.setMonth(c.getMonth()+e),c.getDate()!==a&&a<=31&&c.setDate(0)}return c.toISOString().split("T")[0]}function N(n,e="$"){const l=Number(n)||0;return`${e} ${l.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`}function C({principal:n,annualRate:e,interestMethod:l=M.FLAT,termCount:c,frequency:a="MONTHLY",startDate:o=new Date().toISOString().split("T")[0],processingFee:u=0}){const i=Number(n),d=Number(e),t=parseInt(c,10),m=Number(u)||0,s=oe[a]||oe.MONTHLY;if(!i||i<=0||!t||t<=0)return{principal:0,totalInterest:0,totalRepayment:0,processingFee:m,installmentAmount:0,schedule:[]};const v=[];let h=0;if(l===M.FLAT){const b=t/s.periodsPerYear;h=Math.round(i*(d/100)*b*100)/100;const $=i+h,g=Math.floor(i/t*100)/100,x=Math.floor(h/t*100)/100;let k=i;for(let L=1;L<=t;L++){const B=L===t,I=B?Math.round(k*100)/100:g,y=B?Math.round((h-x*(t-1))*100)/100:x,E=Math.round((I+y)*100)/100;k=Math.max(0,Math.round((k-I)*100)/100),v.push({installment_number:L,due_date:ie(o,L,a),principal_due:I,interest_due:y,fees_due:0,total_due:E,principal_paid:0,interest_paid:0,fees_paid:0,amount_paid:0,remaining_balance:k,status:"pending"})}return{principal:i,totalInterest:h,totalRepayment:$,processingFee:m,installmentAmount:v[0]?v[0].total_due:0,frequency:a,interestMethod:l,schedule:v}}else{const b=d/100/s.periodsPerYear;let $=0;b===0?$=i/t:$=i*(b*Math.pow(1+b,t))/(Math.pow(1+b,t)-1),$=Math.round($*100)/100;let g=i;for(let k=1;k<=t;k++){const L=k===t,B=Math.round(g*b*100)/100;let I=L?g:Math.round(($-B)*100)/100;I>g&&(I=g);const y=Math.round((I+B)*100)/100;g=Math.max(0,Math.round((g-I)*100)/100),h+=B,v.push({installment_number:k,due_date:ie(o,k,a),principal_due:I,interest_due:B,fees_due:0,total_due:y,principal_paid:0,interest_paid:0,fees_paid:0,amount_paid:0,remaining_balance:g,status:"pending"})}h=Math.round(h*100)/100;const x=Math.round((i+h)*100)/100;return{principal:i,totalInterest:h,totalRepayment:x,processingFee:m,installmentAmount:$,frequency:a,interestMethod:l,schedule:v}}}function X(n,e,l,c){let a=Math.round(Number(c)*100)/100;const o={chargesPaid:0,interestPaid:0,principalPaid:0,excessPrincipal:0,chargeDetails:[],installmentDetails:[]},u=l.map(t=>({...t})),i=e.map(t=>({...t}));for(const t of u){if(a<=0)break;if(t.waived)continue;const m=Math.round(((t.amount||0)-(t.amount_paid||0))*100)/100;if(m>0){const s=Math.min(a,m);t.amount_paid=Math.round(((t.amount_paid||0)+s)*100)/100,a=Math.round((a-s)*100)/100,o.chargesPaid=Math.round((o.chargesPaid+s)*100)/100,o.chargeDetails.push({charge_id:t.id,type:t.type,amount_paid:s})}}i.sort((t,m)=>t.installment_number-m.installment_number);for(const t of i){if(a<=0)break;const m=t.interest_due||0,s=t.interest_paid||0,v=Math.max(0,Math.round((m-s)*100)/100);if(v>0){const h=Math.min(a,v);t.interest_paid=Math.round((s+h)*100)/100,t.amount_paid=Math.round(((t.amount_paid||0)+h)*100)/100,a=Math.round((a-h)*100)/100,o.interestPaid=Math.round((o.interestPaid+h)*100)/100}}for(const t of i){if(a<=0)break;const m=t.principal_due||0,s=t.principal_paid||0,v=Math.max(0,Math.round((m-s)*100)/100);if(v>0){const h=Math.min(a,v);t.principal_paid=Math.round((s+h)*100)/100,t.amount_paid=Math.round(((t.amount_paid||0)+h)*100)/100,a=Math.round((a-h)*100)/100,o.principalPaid=Math.round((o.principalPaid+h)*100)/100}}a>0&&(o.excessPrincipal=a,o.principalPaid=Math.round((o.principalPaid+a)*100)/100,a=0);const d=new Date().toISOString().split("T")[0];for(const t of i){const m=t.total_due||0,s=t.amount_paid||0;s>=m?t.status="paid":s>0?t.status=t.due_date<d?"overdue":"partially_paid":t.status=t.due_date<d?"overdue":"pending"}return{allocation:o,updatedInstallments:i,updatedCharges:u,remainingExcess:a}}function Y(n,e,l,c){const a=(l||[]).filter(y=>y.loan_id===n.id&&!y.reversed).sort((y,E)=>new Date(y.date)-new Date(E.date)),o=(c||[]).filter(y=>y.loan_id===n.id).map(y=>({...y,amount_paid:0}));let u=e.filter(y=>y.loan_id===n.id).map(y=>({...y,principal_paid:0,interest_paid:0,fees_paid:0,amount_paid:0,status:"pending"})).sort((y,E)=>y.installment_number-E.installment_number),i=0;for(const y of a){const E=X(n,u,o,y.amount);u=E.updatedInstallments,E.updatedCharges.forEach(P=>{const R=o.findIndex(T=>T.id===P.id);R!==-1&&(o[R]=P)}),i+=y.amount}const d=new Date().toISOString().split("T")[0];for(const y of u)y.amount_paid>=y.total_due?y.status="paid":y.amount_paid>0?y.status=y.due_date<d?"overdue":"partially_paid":y.status=y.due_date<d?"overdue":"pending";const t=u.reduce((y,E)=>y+(E.principal_due||0),0),m=u.reduce((y,E)=>y+(E.principal_paid||0),0),s=u.reduce((y,E)=>y+(E.interest_due||0),0),v=u.reduce((y,E)=>y+(E.interest_paid||0),0),h=o.filter(y=>!y.waived).reduce((y,E)=>y+(E.amount||0),0),b=o.filter(y=>!y.waived).reduce((y,E)=>y+(E.amount_paid||0),0),$=Math.max(0,Math.round((t-m)*100)/100),g=Math.max(0,Math.round((s-v)*100)/100),x=Math.max(0,Math.round((h-b)*100)/100),k=Math.round(($+g+x)*100)/100;let L="active";const B=u.some(y=>y.status==="overdue");return k<=0?L="paid_off":B?L="overdue":L="active",{loan:{...n,total_paid:Math.round(i*100)/100,outstanding_principal:$,outstanding_interest:g,outstanding_charges:x,total_outstanding:k,status:L},installments:u,charges:o}}function we(n,e,l="Admin"){return{id:`rev_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,loan_id:n.loan_id,amount:-Math.abs(n.amount),date:new Date().toISOString().split("T")[0],method:n.method,received_by:l,receipt_number:`REV-${n.receipt_number||n.id}`,notes:`REVERSAL of payment ${n.receipt_number}. Reason: ${e}`,is_reversal:!0,original_payment_id:n.id,timestamp:new Date().toISOString()}}const $e={id:"org_bz_01",name:"Belize QuickLend Financial Services",tagline:"Fast, Transparent Micro-Lending & Collateral Loans",currency:"BZD ($)",currency_symbol:"$",address:"14 Albert Street, Downtown Belize City",phone:"+501 223-4567",whatsapp:"+501 620-8000",email:"collections@quicklend.bz",default_interest_method:M.FLAT,default_rate:20,grace_period_days:3,late_fee_type:"fixed",late_fee_amount:25},xe=[{id:"usr_1",name:"Patrick (Admin/Owner)",role:"owner",email:"patrick@quicklend.bz"},{id:"usr_2",name:"Sarah Miller",role:"loan_officer",email:"sarah@quicklend.bz"},{id:"usr_3",name:"Carlos Mendez",role:"collector",email:"carlos@quicklend.bz"},{id:"usr_4",name:"Auditor Belize",role:"read_only",email:"audit@quicklend.bz"}],Ee=[{id:"bor_01",name:"Elena Martinez",id_number:"BZ-748921-C",phone:"+501 622-1144",email:"elena.m@sanignacio.bz",address:"Burns Avenue, San Ignacio, Cayo",employer:"Self-Employed (San Ignacio Produce Market Stall #14)",guarantor:"Mateo Martinez (Brother, +501 623-8899)",notes:"Long-standing market vendor. Excellent weekly payer.",status:"active",rating:"excellent"},{id:"bor_02",name:"Marcus Flowers",id_number:"BZ-381902-B",phone:"+501 610-8833",email:"marcus.flowers@bdf.gov.bz",address:"Mile 8 George Price Hwy, Belize City",employer:"Belize Defence Force (Civilian Personnel)",guarantor:"Sergeant L. Thompson (+501 611-3322)",notes:"Payday advance loan tied to 15th and 30th govt salary deductions.",status:"active",rating:"good"},{id:"bor_03",name:"Darrell Young",id_number:"BZ-992314-P",phone:"+501 629-4455",email:"darrell.taxi@gmail.com",address:"Constitution Drive, Belmopan",employer:"Independent Taxi & Courier Operator",guarantor:"Brenda Young (Wife, +501 630-1122)",notes:"Vehicle transmission repair loan. Missed last bi-weekly payment due to maintenance delay.",status:"overdue",rating:"risky"},{id:"bor_04",name:"Vanessa Castillo",id_number:"BZ-405118-O",phone:"+501 631-7722",email:"vcastillo.grocery@gmail.com",address:"Baker's Street, Orange Walk Town",employer:"Owner, Sugar City Grocery & Dry Goods",guarantor:"Hernan Castillo (+501 632-4411)",notes:"Wholesale inventory restocking loan. Currently 40+ days in arrears. Responding on WhatsApp.",status:"overdue",rating:"critical"},{id:"bor_05",name:"Kevin Bradley",id_number:"BZ-827361-S",phone:"+501 624-9900",email:"kbradley.charters@placencia.com",address:"Sidewalk Placencia Village, Stann Creek",employer:"Placencia Reef & Sportfishing Tours",guarantor:"Captain Ray Bradley (+501 625-1100)",notes:"Outboard motor overhaul financing. Paid off in full ahead of schedule.",status:"active",rating:"excellent"},{id:"bor_06",name:"Lisbeth Novelo",id_number:"BZ-193822-C",phone:"+501 615-3321",email:"lnovelo@stfrancis.edu.bz",address:"4th Avenue, Corozal Town",employer:"Ministry of Education (St. Francis Xavier Primary)",guarantor:"Principal J. Campos (+501 616-2244)",notes:"School tuition financing for daughter. Perfect on-time salary payer.",status:"active",rating:"good"},{id:"bor_07",name:"Carlos Pech",id_number:"BZ-552910-A",phone:"+501 628-5544",email:"carlos.pech.dive@sanpedro.com",address:"Barrier Reef Drive, San Pedro, Ambergris Caye",employer:"Blue Wave Dive Shop",guarantor:"Maria Pech (+501 629-9911)",notes:"Weekly equipment loan. Always pays cash at the branch.",status:"active",rating:"good"},{id:"bor_08",name:"Arlene Sutherland",id_number:"BZ-601934-D",phone:"+501 602-9988",email:"arlene.bakes@dangriga.bz",address:"Commerce Street, Dangriga",employer:"Owner, Sunrise Bakery & Creole Bread",guarantor:"Anthony Sutherland (+501 603-4477)",notes:"Commercial baking oven loan. Regular bi-weekly payer.",status:"active",rating:"good"},{id:"bor_09",name:"Dwight Tillett",id_number:"BZ-719302-B",phone:"+501 614-7766",email:"dwight.tillett@portloyola.bz",address:"Fabers Road, Belize City",employer:"Port Loyola Auto Works",guarantor:"Keith Tillett (+501 615-8833)",notes:"Tool acquisition loan. Just past due date by 5 days.",status:"overdue",rating:"attention"},{id:"bor_10",name:"Maria Guitterez",id_number:"BZ-882019-T",phone:"+501 633-2211",email:"maria.toledocrafts@gmail.com",address:"Front Street, Punta Gorda, Toledo",employer:"Toledo Cacao & Handicraft Emporium",guarantor:"Eusebio Guitterez (+501 634-1188)",notes:"Monthly loan for craft festival supplies.",status:"active",rating:"good"},{id:"bor_11",name:"Jamaal Banner",id_number:"BZ-229481-B",phone:"+501 620-4499",email:"jamaal.banner@gov.bz",address:"Ring Road, Belmopan",employer:"Central Information Technology Office (CITO)",guarantor:"Sharon Banner (+501 621-7733)",notes:"Personal loan for home computer equipment. Automatic salary direct deposit.",status:"active",rating:"excellent"},{id:"bor_12",name:"Cindy Hyde",id_number:"BZ-339182-C",phone:"+501 612-8877",email:"cindy.hyde@westernpharm.bz",address:"Bullet Tree Road, San Ignacio, Cayo",employer:"Western Pharmacy San Ignacio",guarantor:"Rene Hyde (+501 613-2211)",notes:"Short-term payday emergency loan. Paid off completely.",status:"active",rating:"excellent"},{id:"bor_13",name:"Ricardo Moguel",id_number:"BZ-118492-O",phone:"+501 635-1199",email:"rmoguel.haulage@gmail.com",address:"Trial Farm Village, Orange Walk District",employer:"Moguel Heavy Haulage & Cane Transport",guarantor:"Nestor Moguel (+501 636-5544)",notes:"Sugar cane tractor repairs. 70+ days delinquent. Legal notice prepared.",status:"overdue",rating:"critical"},{id:"bor_14",name:"Natasha Bennett",id_number:"BZ-948102-K",phone:"+501 607-3344",email:"nbennett.nurse@khmh.bz",address:"Princess Margaret Drive, Belize City",employer:"Karl Heusner Memorial Hospital (KHMH RN)",guarantor:"Dr. Aaron Bennett (+501 608-9922)",notes:"Bi-weekly medical advance loan. Dependable healthcare worker.",status:"active",rating:"excellent"},{id:"bor_15",name:"Trevor Leslie",id_number:"BZ-502931-P",phone:"+501 626-6622",email:"trevor.chef@hopkinsresort.bz",address:"Hopkins Village, Stann Creek",employer:"Hopkins Bay Resort (Executive Sous Chef)",guarantor:"Darlene Leslie (+501 627-4488)",notes:"Paid off 3-month loan early. High credit standing.",status:"active",rating:"excellent"}];function U(){const n=[],e=[],l=[],c=[],a=C({principal:1200,annualRate:15,interestMethod:M.FLAT,termCount:12,frequency:"WEEKLY",startDate:"2026-08-10",processingFee:30}),o={id:"ln_001",loan_number:"LN-2026-001",borrower_id:"bor_01",borrower_name:"Elena Martinez",principal:1200,rate:15,interest_method:"flat",term_count:12,frequency:"WEEKLY",start_date:"2026-08-10",fees:30,status:"active",created_by:"Sarah Miller",notes:"San Ignacio market produce inventory loan"};a.schedule.forEach(r=>{n.push({...r,loan_id:o.id,id:`inst_${o.id}_${r.installment_number}`})});for(let r=1;r<=6;r++){const _=n.find(w=>w.loan_id===o.id&&w.installment_number===r).due_date;e.push({id:`pay_${o.id}_0${r}`,loan_id:o.id,amount:a.installmentAmount,date:_,method:"cash",received_by:"Sarah Miller",receipt_number:`RCP-BZ-100${r}`,notes:`Installment #${r} weekly market payment`,timestamp:`${_}T10:15:00Z`})}const u=C({principal:3e3,annualRate:18,interestMethod:M.FLAT,termCount:8,frequency:"BIWEEKLY",startDate:"2026-08-15",processingFee:50}),i={id:"ln_002",loan_number:"LN-2026-002",borrower_id:"bor_02",borrower_name:"Marcus Flowers",principal:3e3,rate:18,interest_method:"flat",term_count:8,frequency:"BIWEEKLY",start_date:"2026-08-15",fees:50,status:"active",created_by:"Sarah Miller",notes:"Govt salary payday loan"};u.schedule.forEach(r=>{n.push({...r,loan_id:i.id,id:`inst_${i.id}_${r.installment_number}`})});for(let r=1;r<=3;r++){const _=n.find(w=>w.loan_id===i.id&&w.installment_number===r);e.push({id:`pay_${i.id}_0${r}`,loan_id:i.id,amount:u.installmentAmount,date:_.due_date,method:"bank_transfer",received_by:"Patrick (Admin/Owner)",receipt_number:`RCP-BZ-200${r}`,notes:`Govt salary direct transfer installment #${r}`,timestamp:`${_.due_date}T14:30:00Z`})}const d=C({principal:2e3,annualRate:20,interestMethod:M.FLAT,termCount:6,frequency:"BIWEEKLY",startDate:"2026-08-01",processingFee:40}),t={id:"ln_003",loan_number:"LN-2026-003",borrower_id:"bor_03",borrower_name:"Darrell Young",principal:2e3,rate:20,interest_method:"flat",term_count:6,frequency:"BIWEEKLY",start_date:"2026-08-01",fees:40,status:"overdue",created_by:"Carlos Mendez",notes:"Taxi gearbox overhaul loan"};d.schedule.forEach(r=>{n.push({...r,loan_id:t.id,id:`inst_${t.id}_${r.installment_number}`})});for(let r=1;r<=2;r++){const _=n.find(w=>w.loan_id===t.id&&w.installment_number===r);e.push({id:`pay_${t.id}_0${r}`,loan_id:t.id,amount:d.installmentAmount,date:_.due_date,method:"cash",received_by:"Carlos Mendez",receipt_number:`RCP-BZ-300${r}`,notes:`Taxi cash receipt #${r}`,timestamp:`${_.due_date}T16:00:00Z`})}l.push({id:"chg_001",loan_id:t.id,type:"late_fee",amount:25,waived:!1,reason:"Missed due date on installment #3 (>10 days past due)",created_at:"2026-09-20"});const m=C({principal:4500,annualRate:24,interestMethod:M.REDUCING,termCount:6,frequency:"MONTHLY",startDate:"2026-06-15",processingFee:75}),s={id:"ln_004",loan_number:"LN-2026-004",borrower_id:"bor_04",borrower_name:"Vanessa Castillo",principal:4500,rate:24,interest_method:"reducing",term_count:6,frequency:"MONTHLY",start_date:"2026-06-15",fees:75,status:"overdue",created_by:"Sarah Miller",notes:"Orange Walk Grocery expansion"};m.schedule.forEach(r=>{n.push({...r,loan_id:s.id,id:`inst_${s.id}_${r.installment_number}`})});const v=n.find(r=>r.loan_id===s.id&&r.installment_number===1);e.push({id:`pay_${s.id}_01`,loan_id:s.id,amount:m.installmentAmount,date:v.due_date,method:"mobile_digiwallet",received_by:"Sarah Miller",receipt_number:"RCP-BZ-4001",notes:"DigiWallet payment for 1st installment",timestamp:`${v.due_date}T11:20:00Z`}),l.push({id:"chg_002",loan_id:s.id,type:"late_fee",amount:50,waived:!1,reason:"Arrears penalty for 2 missed monthly installments",created_at:"2026-08-25"});const h=C({principal:1500,annualRate:15,interestMethod:M.FLAT,termCount:4,frequency:"MONTHLY",startDate:"2026-04-01",processingFee:25}),b={id:"ln_005",loan_number:"LN-2026-005",borrower_id:"bor_05",borrower_name:"Kevin Bradley",principal:1500,rate:15,interest_method:"flat",term_count:4,frequency:"MONTHLY",start_date:"2026-04-01",fees:25,status:"paid_off",created_by:"Patrick (Admin/Owner)",notes:"Outboard engine loan. Completely settled."};h.schedule.forEach(r=>{n.push({...r,loan_id:b.id,id:`inst_${b.id}_${r.installment_number}`})});for(let r=1;r<=4;r++){const _=n.find(w=>w.loan_id===b.id&&w.installment_number===r);e.push({id:`pay_${b.id}_0${r}`,loan_id:b.id,amount:h.installmentAmount,date:_.due_date,method:"bank_transfer",received_by:"Patrick (Admin/Owner)",receipt_number:`RCP-BZ-500${r}`,notes:`Installment #${r} paid in full`,timestamp:`${_.due_date}T09:00:00Z`})}const $=C({principal:2500,annualRate:18,interestMethod:M.REDUCING,termCount:10,frequency:"MONTHLY",startDate:"2026-07-01",processingFee:50}),g={id:"ln_006",loan_number:"LN-2026-006",borrower_id:"bor_06",borrower_name:"Lisbeth Novelo",principal:2500,rate:18,interest_method:"reducing",term_count:10,frequency:"MONTHLY",start_date:"2026-07-01",fees:50,status:"active",created_by:"Sarah Miller",notes:"Tuition support loan"};$.schedule.forEach(r=>{n.push({...r,loan_id:g.id,id:`inst_${g.id}_${r.installment_number}`})});for(let r=1;r<=3;r++){const _=n.find(w=>w.loan_id===g.id&&w.installment_number===r);e.push({id:`pay_${g.id}_0${r}`,loan_id:g.id,amount:$.installmentAmount,date:_.due_date,method:"bank_transfer",received_by:"Sarah Miller",receipt_number:`RCP-BZ-600${r}`,notes:`Teacher salary installment #${r}`,timestamp:`${_.due_date}T15:00:00Z`})}const x=C({principal:800,annualRate:12,interestMethod:M.FLAT,termCount:8,frequency:"WEEKLY",startDate:"2026-09-01",processingFee:20}),k={id:"ln_007",loan_number:"LN-2026-007",borrower_id:"bor_07",borrower_name:"Carlos Pech",principal:800,rate:12,interest_method:"flat",term_count:8,frequency:"WEEKLY",start_date:"2026-09-01",fees:20,status:"active",created_by:"Carlos Mendez",notes:"Scuba gear emergency purchase"};x.schedule.forEach(r=>{n.push({...r,loan_id:k.id,id:`inst_${k.id}_${r.installment_number}`})});for(let r=1;r<=4;r++){const _=n.find(w=>w.loan_id===k.id&&w.installment_number===r);e.push({id:`pay_${k.id}_0${r}`,loan_id:k.id,amount:x.installmentAmount,date:_.due_date,method:"cash",received_by:"Carlos Mendez",receipt_number:`RCP-BZ-700${r}`,notes:`Weekly tourist tip cash installment #${r}`,timestamp:`${_.due_date}T17:15:00Z`})}const L=C({principal:5e3,annualRate:20,interestMethod:M.REDUCING,termCount:12,frequency:"BIWEEKLY",startDate:"2026-08-01",processingFee:100}),B={id:"ln_008",loan_number:"LN-2026-008",borrower_id:"bor_08",borrower_name:"Arlene Sutherland",principal:5e3,rate:20,interest_method:"reducing",term_count:12,frequency:"BIWEEKLY",start_date:"2026-08-01",fees:100,status:"active",created_by:"Sarah Miller",notes:"Dangriga bakery commercial mixer financing"};L.schedule.forEach(r=>{n.push({...r,loan_id:B.id,id:`inst_${B.id}_${r.installment_number}`})});for(let r=1;r<=4;r++){const _=n.find(w=>w.loan_id===B.id&&w.installment_number===r);e.push({id:`pay_${B.id}_0${r}`,loan_id:B.id,amount:L.installmentAmount,date:_.due_date,method:"bank_transfer",received_by:"Sarah Miller",receipt_number:`RCP-BZ-800${r}`,notes:`Bakery revenue payment #${r}`,timestamp:`${_.due_date}T10:00:00Z`})}const I=C({principal:1800,annualRate:15,interestMethod:M.FLAT,termCount:6,frequency:"MONTHLY",startDate:"2026-07-25",processingFee:35}),y={id:"ln_009",loan_number:"LN-2026-009",borrower_id:"bor_09",borrower_name:"Dwight Tillett",principal:1800,rate:15,interest_method:"flat",term_count:6,frequency:"MONTHLY",start_date:"2026-07-25",fees:35,status:"overdue",created_by:"Carlos Mendez",notes:"Auto repair shop tool kit financing"};I.schedule.forEach(r=>{n.push({...r,loan_id:y.id,id:`inst_${y.id}_${r.installment_number}`})});for(let r=1;r<=2;r++){const _=n.find(w=>w.loan_id===y.id&&w.installment_number===r);e.push({id:`pay_${y.id}_0${r}`,loan_id:y.id,amount:I.installmentAmount,date:_.due_date,method:"cash",received_by:"Carlos Mendez",receipt_number:`RCP-BZ-900${r}`,notes:`Auto shop mechanic cash receipt #${r}`,timestamp:`${_.due_date}T13:45:00Z`})}const E=C({principal:2200,annualRate:16,interestMethod:M.FLAT,termCount:6,frequency:"MONTHLY",startDate:"2026-08-10",processingFee:40}),P={id:"ln_010",loan_number:"LN-2026-010",borrower_id:"bor_10",borrower_name:"Maria Guitterez",principal:2200,rate:16,interest_method:"flat",term_count:6,frequency:"MONTHLY",start_date:"2026-08-10",fees:40,status:"active",created_by:"Sarah Miller",notes:"Toledo cacao & craft inventory"};E.schedule.forEach(r=>{n.push({...r,loan_id:P.id,id:`inst_${P.id}_${r.installment_number}`})});for(let r=1;r<=2;r++){const _=n.find(w=>w.loan_id===P.id&&w.installment_number===r);e.push({id:`pay_${P.id}_0${r}`,loan_id:P.id,amount:E.installmentAmount,date:_.due_date,method:"bank_transfer",received_by:"Sarah Miller",receipt_number:`RCP-BZ-101${r}`,notes:`Handicrafts sale proceeds payment #${r}`,timestamp:`${_.due_date}T11:00:00Z`})}const R=C({principal:1600,annualRate:14,interestMethod:M.FLAT,termCount:8,frequency:"BIWEEKLY",startDate:"2026-08-20",processingFee:30}),T={id:"ln_011",loan_number:"LN-2026-011",borrower_id:"bor_11",borrower_name:"Jamaal Banner",principal:1600,rate:14,interest_method:"flat",term_count:8,frequency:"BIWEEKLY",start_date:"2026-08-20",fees:30,status:"active",created_by:"Patrick (Admin/Owner)",notes:"Govt IT staff computer equipment"};R.schedule.forEach(r=>{n.push({...r,loan_id:T.id,id:`inst_${T.id}_${r.installment_number}`})});for(let r=1;r<=3;r++){const _=n.find(w=>w.loan_id===T.id&&w.installment_number===r);e.push({id:`pay_${T.id}_0${r}`,loan_id:T.id,amount:R.installmentAmount,date:_.due_date,method:"bank_transfer",received_by:"Patrick (Admin/Owner)",receipt_number:`RCP-BZ-111${r}`,notes:`Direct bank salary transfer #${r}`,timestamp:`${_.due_date}T10:00:00Z`})}const V=C({principal:1e3,annualRate:10,interestMethod:M.FLAT,termCount:4,frequency:"MONTHLY",startDate:"2026-04-15",processingFee:20}),O={id:"ln_012",loan_number:"LN-2026-012",borrower_id:"bor_12",borrower_name:"Cindy Hyde",principal:1e3,rate:10,interest_method:"flat",term_count:4,frequency:"MONTHLY",start_date:"2026-04-15",fees:20,status:"paid_off",created_by:"Sarah Miller",notes:"Short-term medical emergency loan"};V.schedule.forEach(r=>{n.push({...r,loan_id:O.id,id:`inst_${O.id}_${r.installment_number}`})});for(let r=1;r<=4;r++){const _=n.find(w=>w.loan_id===O.id&&w.installment_number===r);e.push({id:`pay_${O.id}_0${r}`,loan_id:O.id,amount:V.installmentAmount,date:_.due_date,method:"cash",received_by:"Sarah Miller",receipt_number:`RCP-BZ-121${r}`,notes:`Pharmacy counter cash payment #${r}`,timestamp:`${_.due_date}T16:00:00Z`})}const K=C({principal:6e3,annualRate:24,interestMethod:M.FLAT,termCount:12,frequency:"MONTHLY",startDate:"2026-05-10",processingFee:100}),D={id:"ln_013",loan_number:"LN-2026-013",borrower_id:"bor_13",borrower_name:"Ricardo Moguel",principal:6e3,rate:24,interest_method:"flat",term_count:12,frequency:"MONTHLY",start_date:"2026-05-10",fees:100,status:"overdue",created_by:"Carlos Mendez",notes:"Heavy haul sugar cane tractor breakdown loan. Non-responsive to calls."};K.schedule.forEach(r=>{n.push({...r,loan_id:D.id,id:`inst_${D.id}_${r.installment_number}`})});const te=n.find(r=>r.loan_id===D.id&&r.installment_number===1);e.push({id:`pay_${D.id}_01`,loan_id:D.id,amount:K.installmentAmount,date:te.due_date,method:"cash",received_by:"Carlos Mendez",receipt_number:"RCP-BZ-1301",notes:"Initial cash installment",timestamp:`${te.due_date}T12:00:00Z`}),l.push({id:"chg_003",loan_id:D.id,type:"late_fee",amount:75,waived:!1,reason:"Arrears charge for 60+ days delinquent status",created_at:"2026-08-30"});const ne=C({principal:2800,annualRate:16,interestMethod:M.REDUCING,termCount:10,frequency:"BIWEEKLY",startDate:"2026-08-15",processingFee:50}),q={id:"ln_014",loan_number:"LN-2026-014",borrower_id:"bor_14",borrower_name:"Natasha Bennett",principal:2800,rate:16,interest_method:"reducing",term_count:10,frequency:"BIWEEKLY",start_date:"2026-08-15",fees:50,status:"active",created_by:"Sarah Miller",notes:"KHMH registered nurse staff advance"};ne.schedule.forEach(r=>{n.push({...r,loan_id:q.id,id:`inst_${q.id}_${r.installment_number}`})});for(let r=1;r<=3;r++){const _=n.find(w=>w.loan_id===q.id&&w.installment_number===r);e.push({id:`pay_${q.id}_0${r}`,loan_id:q.id,amount:ne.installmentAmount,date:_.due_date,method:"bank_transfer",received_by:"Sarah Miller",receipt_number:`RCP-BZ-140${r}`,notes:`KHMH payroll transfer #${r}`,timestamp:`${_.due_date}T15:30:00Z`})}const ae=C({principal:1200,annualRate:12,interestMethod:M.FLAT,termCount:3,frequency:"MONTHLY",startDate:"2026-05-01",processingFee:25}),j={id:"ln_015",loan_number:"LN-2026-015",borrower_id:"bor_15",borrower_name:"Trevor Leslie",principal:1200,rate:12,interest_method:"flat",term_count:3,frequency:"MONTHLY",start_date:"2026-05-01",fees:25,status:"paid_off",created_by:"Patrick (Admin/Owner)",notes:"Hopkins chef seasonal kitchen tools loan"};ae.schedule.forEach(r=>{n.push({...r,loan_id:j.id,id:`inst_${j.id}_${r.installment_number}`})});for(let r=1;r<=3;r++){const _=n.find(w=>w.loan_id===j.id&&w.installment_number===r);e.push({id:`pay_${j.id}_0${r}`,loan_id:j.id,amount:ae.installmentAmount,date:_.due_date,method:"mobile_digiwallet",received_by:"Patrick (Admin/Owner)",receipt_number:`RCP-BZ-150${r}`,notes:`DigiWallet payment installment #${r}`,timestamp:`${_.due_date}T10:45:00Z`})}const _e=[o,i,t,s,b,g,k,B,y,P,T,O,D,q,j],re=[];let Q=[],J=[];for(const r of _e){const _=Y(r,n,e,l);re.push(_.loan),Q=Q.concat(_.installments),J=J.concat(_.charges)}return c.push({id:"aud_001",action:"SYSTEM_INIT",user:"Patrick (Owner)",target:"Organization",details:"Initialized Belize QuickLend production ledger",timestamp:"2026-08-01T08:00:00Z"},{id:"aud_002",action:"LOAN_ORIGINATED",user:"Sarah Miller",target:"Loan LN-2026-001 (Elena Martinez)",details:"Originated BZD $1,200.00 microloan with 12 weekly installments",timestamp:"2026-08-10T09:30:00Z"},{id:"aud_003",action:"PAYMENT_RECORDED",user:"Sarah Miller",target:"Loan LN-2026-001",details:"Recorded cash payment BZD $115.00 (Receipt RCP-BZ-1001)",timestamp:"2026-08-17T10:15:00Z"},{id:"aud_004",action:"LATE_FEE_APPLIED",user:"Automated Job",target:"Loan LN-2026-003 (Darrell Young)",details:"Applied fixed late charge of BZD $25.00 for missed installment #3",timestamp:"2026-09-20T00:05:00Z"},{id:"aud_005",action:"WHATSAPP_REMINDER_SENT",user:"Carlos Mendez",target:"Borrower Darrell Young (+501 629-4455)",details:"Triggered overdue WhatsApp notice for balance BZD $1,180.00",timestamp:"2026-09-22T14:10:00Z"}),{organization:$e,users:xe,borrowers:Ee,loans:re,rawInstallments:n,installments:Q,payments:e,charges:J,auditLogs:c}}const ye="LENDTRACK_DB_V1";function ke(){try{const n=localStorage.getItem(ye);if(!n){const l=U();return z(l),l}const e=JSON.parse(n);if(!e.borrowers||!e.loans||!e.installments){const l=U();return z(l),l}return e}catch(n){console.warn("Failed to parse localStorage data, resetting to seed:",n);const e=U();return z(e),e}}function z(n){try{localStorage.setItem(ye,JSON.stringify(n))}catch(e){console.error("Error saving data to localStorage:",e)}}function Le(){const n=U();return z(n),n}function Z(n,{action:e,target:l,details:c,user:a="Patrick (Owner)"}){const o={id:`aud_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,action:e,user:a,target:l,details:c,timestamp:new Date().toISOString()};return n.auditLogs=[o,...n.auditLogs||[]],z(n),o}function Be(n,e,l,c){const a=(l==null?void 0:l.days_overdue)||0,o=(c==null?void 0:c.currency_symbol)||"$",u=N((l==null?void 0:l.total_due)||(e==null?void 0:e.total_outstanding)||0,o),i=(e==null?void 0:e.loan_number)||"Loan",d=(c==null?void 0:c.name)||"QuickLend";let t="polite";a>30?t="formal_critical":a>14?t="urgent":a>3&&(t="notice");let m="";switch(t){case"formal_critical":m=`*FINAL URGENT NOTICE - ${d}*

Dear ${n.name},
Your account for ${i} is severely delinquent by *${a} days* with an outstanding balance of *${u}*.

Please contact our office immediately at ${c.phone} or visit us at ${c.address} to avoid collateral action and guarantor contact.

Thank you,
${d} Collections`;break;case"urgent":m=`*OVERDUE PAYMENT NOTICE - ${d}*

Hello ${n.name},
This is a follow-up regarding your payment for ${i}, which was due on ${l.due_date} (${a} days ago).

The current amount due is *${u}* (including applicable late fees).

Kindly make your payment today or send proof of transfer. Reply here or call ${c.phone} if you need assistance.`;break;case"notice":m=`*Payment Reminder - ${d}*

Hi ${n.name},
Just a reminder that your installment of *${u}* for ${i} is past due (${a} days).

Please make this payment at your earliest convenience to maintain your good standing and avoid additional late charges.

Have a great day!`;break;case"polite":default:m=`*Upcoming Payment Reminder - ${d}*

Hi ${n.name},
This is a courtesy reminder that your next installment of *${u}* for ${i} is due on *${(l==null?void 0:l.due_date)||"soon"}*.

Thank you for keeping your account current!`;break}return m}function Ie(n,e){let l=(n||"").replace(/\D/g,"");l.length===7&&(l=`501${l}`);const c=encodeURIComponent(e);return`https://wa.me/${l}?text=${c}`}function Me({organization:n,payment:e,loan:l,borrower:c,allocationBreakdown:a}){const o=n.currency_symbol||"$",u=e.date||new Date().toISOString().split("T")[0],i=(e.method||"cash").toUpperCase().replace("_"," ");return`
    <div class="receipt-wrapper printable-area" id="thermal-receipt-doc">
      <div class="receipt-header">
        <div class="receipt-org-name">${n.name}</div>
        <div class="receipt-meta">${n.address}</div>
        <div class="receipt-meta">Tel: ${n.phone}</div>
        <div class="receipt-meta" style="margin-top: 4px; font-weight: 700;">OFFICIAL PAYMENT RECEIPT</div>
      </div>

      <div class="receipt-row">
        <span>Receipt #:</span>
        <span style="font-weight: 700;">${e.receipt_number}</span>
      </div>
      <div class="receipt-row">
        <span>Date/Time:</span>
        <span>${u}</span>
      </div>
      <div class="receipt-row">
        <span>Loan Ref:</span>
        <span style="font-weight: 700;">${l.loan_number}</span>
      </div>
      <div class="receipt-row">
        <span>Borrower:</span>
        <span style="font-weight: 700;">${c.name}</span>
      </div>
      <div class="receipt-row">
        <span>Payment Method:</span>
        <span>${i}</span>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-row receipt-total">
        <span>TOTAL RECEIVED:</span>
        <span>${N(e.amount,o)}</span>
      </div>

      <div class="receipt-divider"></div>

      <div style="font-size: 0.7rem; color: #4B5563; margin-bottom: 4px; font-weight: 700; text-transform: uppercase;">
        Allocation Breakdown:
      </div>

      ${(a==null?void 0:a.chargesPaid)>0?`
      <div class="receipt-row" style="font-size: 0.75rem;">
        <span>- Late Fees & Charges:</span>
        <span>${N(a.chargesPaid,o)}</span>
      </div>`:""}

      <div class="receipt-row" style="font-size: 0.75rem;">
        <span>- Interest Applied:</span>
        <span>${N((a==null?void 0:a.interestPaid)||0,o)}</span>
      </div>

      <div class="receipt-row" style="font-size: 0.75rem;">
        <span>- Principal Reduction:</span>
        <span>${N((a==null?void 0:a.principalPaid)||0,o)}</span>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-row" style="font-weight: 700;">
        <span>REMAINING BALANCE:</span>
        <span>${N(l.total_outstanding||0,o)}</span>
      </div>

      <div class="receipt-footer">
        <div>Received by: ${e.received_by||"Officer"}</div>
        <div style="margin-top: 4px;">*** KEEP THIS RECEIPT FOR YOUR RECORDS ***</div>
        <div style="margin-top: 2px;">Thank you for your business!</div>
      </div>
    </div>
  `}function Ce(){window.print()}const Se=`Borrower Name,Phone,Address,Employer,Principal,Interest Rate,Interest Method,Term Count,Frequency,Start Date
Eusebio Mendez,+501 622-4411,Orange Walk Town,Sugar Cane Hauler,2500,20,flat,12,monthly,2026-09-01
Kareem Williams,+501 610-9922,Belize City,Port Authority Officer,1500,15,flat,6,biweekly,2026-09-15
Maricela Cruz,+501 628-7733,San Ignacio,Market Vendor,800,12,flat,8,weekly,2026-09-20`;function Ae(n){const e=n.trim().split(/\r?\n/).filter(a=>a.trim().length>0);if(e.length<2)return[];const l=e[0].split(",").map(a=>a.trim().replace(/^["']|["']$/g,"")),c=[];for(let a=1;a<e.length;a++){const o=[];let u=!1,i="";for(const d of e[a])d==='"'||d==="'"?u=!u:d===","&&!u?(o.push(i.trim()),i=""):i+=d;if(o.push(i.trim()),o.length>=5){const d={};l.forEach((t,m)=>{d[t]=o[m]||""}),c.push(d)}}return c}function De(n,e){let l=0,c=0;const a=[...e.borrowers],o=[...e.loans];let u=[...e.installments];const i=[...e.auditLogs],d=new Date;return n.forEach((t,m)=>{const s=t["Borrower Name"]||t.name||`Borrower ${m+1}`,v=t.Phone||t.phone||"+501 600-0000",h=t.Address||t.address||"Belize",b=t.Employer||t.employer||"General Employment",$=parseFloat(t.Principal||t.principal||1e3),g=parseFloat(t["Interest Rate"]||t.rate||18),k=(t["Interest Method"]||t.method||"flat").toLowerCase().includes("reduc")?M.REDUCING:M.FLAT,L=parseInt(t["Term Count"]||t.term||6,10),B=(t.Frequency||t.frequency||"monthly").toUpperCase(),I=B.includes("WEEK")?B.includes("BI")?"BIWEEKLY":"WEEKLY":"MONTHLY",y=t["Start Date"]||t.start_date||d.toISOString().split("T")[0];let E=a.find(D=>D.name.toLowerCase()===s.toLowerCase());E||(E={id:`bor_imp_${Date.now()}_${m}`,name:s,id_number:`IMP-${Math.floor(1e5+Math.random()*9e5)}`,phone:v,email:`${s.toLowerCase().replace(/\s+/g,".")}@client.bz`,address:h,employer:b,guarantor:"Refer to original spreadsheet record",notes:"Imported via CSV migration wizard",status:"active",rating:"good"},a.push(E),l++);const P=C({principal:$,annualRate:g,interestMethod:k,termCount:L,frequency:I,startDate:y,processingFee:30}),R=`ln_imp_${Date.now()}_${m}`,T=`LN-IMP-${100+o.length+1}`,V={id:R,loan_number:T,borrower_id:E.id,borrower_name:E.name,principal:$,rate:g,interest_method:k,term_count:L,frequency:I,start_date:y,fees:30,status:"active",created_by:"CSV Import Wizard",notes:`Batch imported from spreadsheet on ${d.toISOString().split("T")[0]}`},O=P.schedule.map(D=>({...D,id:`inst_${R}_${D.installment_number}`,loan_id:R}));u=u.concat(O);const K=Y(V,u,e.payments,e.charges);o.push(K.loan),c++}),i.unshift({id:`aud_imp_${Date.now()}`,action:"CSV_BATCH_IMPORT",user:"Patrick (Owner)",target:`${c} Loans`,details:`Successfully imported ${l} new borrowers and ${c} active loans via CSV`,timestamp:d.toISOString()}),{...e,borrowers:a,loans:o,installments:u,auditLogs:i,importedBorrowersCount:l,importedLoansCount:c}}function Pe(){return`
    <div class="landing-page-container" style="max-width: 1100px; margin: 0 auto; padding-top: 1rem;">
      <!-- Hero Section -->
      <section style="text-align: center; padding: 3rem 1rem 3.5rem 1rem; position: relative;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.4rem 1rem; border-radius: 9999px; margin-bottom: 1.5rem;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
          <span style="font-size: 0.775rem; font-weight: 700; color: #34D399; letter-spacing: 0.05em; text-transform: uppercase;">Built for Private Lenders & Micro-Agencies</span>
        </div>

        <h1 style="font-size: 2.85rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 1.25rem; color: #FFFFFF;">
          Know exactly <span style="background: linear-gradient(135deg, #34D399, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">who owes you what.</span>
        </h1>

        <p style="font-size: 1.15rem; color: #94A3B8; max-width: 720px; margin: 0 auto 2.25rem auto; line-height: 1.6;">
          Loan tracking software for credit unions, small lenders, and businesses that offer financing. Replace fragile spreadsheets and handwritten notebooks in a day.
        </p>

        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-primary" id="landing-cta-demo" style="padding: 0.85rem 1.75rem; font-size: 0.95rem;">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Explore Live Interactive Demo
          </button>
          <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I%20saw%20LendTrack%20for%20private%20lenders.%20Can%20you%20show%20me%20the%20demo%3F" target="_blank" class="btn btn-whatsapp" style="padding: 0.85rem 1.75rem; font-size: 0.95rem;">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
            Chat with Me on WhatsApp
          </a>
        </div>
      </section>

      <!-- Three Core Benefits Grid -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 800; text-align: center; margin-bottom: 2rem;">Why Lenders Switch From Excel & Paper</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <div class="card" style="padding: 1.75rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.15); color: #34D399; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Automatic Schedules</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
              Enter a loan and get every installment, interest figure, and due date instantly. Supports flat rate and reducing balance with zero formula mistakes.
            </p>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.15); color: #F87171; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Late Payments Flagged</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
              See who's overdue at a glance. Tap once to send personalized, polite or firm payment reminders directly over WhatsApp with exact balances.
            </p>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(59, 130, 246, 0.15); color: #60A5FA; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Clean Auditable Records</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
              Print instant 80mm thermal receipts or full borrower statements. Never delete payments—reverse them with a full audit log to stop disputes cold.
            </p>
          </div>
        </div>
      </section>

      <!-- Interactive Loss Prevention Calculator -->
      <section class="card" style="margin-bottom: 4rem; padding: 2.25rem; border-color: rgba(16, 185, 129, 0.3); background: linear-gradient(180deg, rgba(19, 29, 49, 0.9) 0%, rgba(11, 18, 32, 0.95) 100%);">
        <div style="display: flex; flex-direction: column; md:flex-row; gap: 2rem; align-items: center;">
          <div style="flex: 1;">
            <div class="badge badge-active" style="margin-bottom: 0.75rem;">ROI Estimator</div>
            <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">How Much Are Spreadsheet Errors Costing You?</h3>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">
              Small lenders typically lose $200–$800 BZD every month from missed late fees, miscalculated partial payments, and untracked aging arrears.
            </p>

            <div style="margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem;">
                <span style="color: var(--text-muted);">Active Borrowers Managed:</span>
                <span style="font-weight: 800; font-family: var(--font-mono); color: #34D399;" id="calc-borrowers-val">60</span>
              </div>
              <input type="range" id="calc-borrowers-slider" min="15" max="300" step="5" value="60" style="width: 100%; accent-color: #10B981; cursor: pointer;">
            </div>
          </div>

          <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem 2rem; text-align: center; min-width: 280px;">
            <div style="font-size: 0.775rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 0.35rem;">
              Estimated Monthly Savings
            </div>
            <div style="font-size: 2.25rem; font-weight: 800; color: #34D399; font-family: var(--font-mono); margin-bottom: 0.35rem;" id="calc-savings-display">
              $ 650.00 BZD
            </div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">
              From collected late charges & 12+ hours saved reconciliations
            </div>
          </div>
        </div>
      </section>

      <!-- 3-Step Migration Workflow -->
      <section style="margin-bottom: 4rem; text-align: center;">
        <h2 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem;">How It Works</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2.5rem;">You don't need IT staff or tech skills. We handle the switch.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; text-align: left;">
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 2rem; font-weight: 800; color: #10B981; font-family: var(--font-mono); margin-bottom: 0.5rem;">01</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem;">Send Your Borrower List</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Send us your existing Excel sheet, notebook photos, or use our 1-click CSV import tool.
            </p>
          </div>

          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 2rem; font-weight: 800; color: #3B82F6; font-family: var(--font-mono); margin-bottom: 0.5rem;">02</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem;">We Configure Your Rules</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              We set up your custom interest rates, flat/reducing methods, grace periods, and logo.
            </p>
          </div>

          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 2rem; font-weight: 800; color: #F59E0B; font-family: var(--font-mono); margin-bottom: 0.5rem;">03</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem;">You Collect Within Days</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Your staff records payments, prints receipts, and tracks delinquencies with zero headaches.
            </p>
          </div>
        </div>
      </section>

      <!-- Packages & Pricing -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 800; text-align: center; margin-bottom: 0.5rem;">Simple, Predictable Packages</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; text-align: center; margin-bottom: 2.5rem;">No surprise fees. No percentage of your loan capital.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; align-items: stretch;">
          <!-- Starter -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 2rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Starter</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">For single operators and independent lenders.</p>
              
              <div style="margin-bottom: 1.5rem;">
                <span style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-mono);">$99</span>
                <span style="color: var(--text-muted); font-size: 0.85rem;">BZD / month</span>
                <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 2px;">+ $150 BZD one-time onboarding</div>
              </div>

              <ul style="list-style: none; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 1 Loan Officer / User</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Up to 100 active loans</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Automatic repayment schedules</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Printable thermal/PDF receipts</li>
              </ul>
            </div>

            <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I'm%20interested%20in%20the%20Starter%20Package%20for%20LendTrack." target="_blank" class="btn btn-secondary" style="width: 100%;">
              Get Started with Starter
            </a>
          </div>

          <!-- Standard (Featured) -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 2rem; border-color: #10B981; box-shadow: 0 0 24px rgba(16, 185, 129, 0.2); position: relative;">
            <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #10B981; color: #042F1A; font-size: 0.7rem; font-weight: 800; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase;">
              Most Popular
            </div>

            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Standard</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">For established lending offices & credit teams.</p>
              
              <div style="margin-bottom: 1.5rem;">
                <span style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-mono); color: #34D399;">$199</span>
                <span style="color: var(--text-muted); font-size: 0.85rem;">BZD / month</span>
                <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 2px;">+ $250 BZD one-time onboarding & data migration</div>
              </div>

              <ul style="list-style: none; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Up to 5 User accounts (Officers/Collectors)</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Unlimited active loans</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 1-Click WhatsApp Reminders & Templates</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Complete Portfolio Aging Reports (PAR 30/60)</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Excel / CSV Data Migration included</li>
              </ul>
            </div>

            <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I'm%20interested%20in%20the%20Standard%20Package%20for%20LendTrack." target="_blank" class="btn btn-primary" style="width: 100%;">
              Choose Standard
            </a>
          </div>

          <!-- Custom -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 2rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Custom</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">Multi-branch agencies & credit unions.</p>
              
              <div style="margin-bottom: 1.5rem;">
                <span style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-mono);">Quoted</span>
                <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 2px;">Tailored to branch network</div>
              </div>

              <ul style="list-style: none; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Multiple branches & regional isolation</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Custom payment gateway / SMS integrations</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Borrower self-service balance portal</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Dedicated account manager & SLA</li>
              </ul>
            </div>

            <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I'd%20like%20a%20Custom%20Quote%20for%20our%20lending%20agency." target="_blank" class="btn btn-secondary" style="width: 100%;">
              Contact for Custom Quote
            </a>
          </div>
        </div>
      </section>

      <!-- Outreach Message Arsenal (Part 3) -->
      <section class="card" style="margin-bottom: 4rem; padding: 2rem; background: var(--bg-surface);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Direct Outreach Arsenal (For WhatsApp & DMs)</h3>
            <p style="color: var(--text-muted); font-size: 0.825rem;">Use these tested outreach messages when contacting lending agencies in Belize.</p>
          </div>
          <span class="badge badge-active">Sales Enablement</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.825rem; color: #34D399;">Initial Outreach (Cold WhatsApp)</span>
              <button class="btn btn-sm btn-secondary copy-btn" data-text="Hi [Name], I build loan management software for lenders in Belize. If you're tracking loans in Excel or a notebook, it automatically builds repayment schedules, flags late payers, and prints receipts. I have a live demo with sample data. Can I show you in 10 minutes? No obligation.">
                Copy
              </button>
            </div>
            <p style="font-size: 0.85rem; color: #E2E8F0; line-height: 1.5; font-style: italic;">
              "Hi [Name], I build loan management software for lenders in Belize. If you're tracking loans in Excel or a notebook, it automatically builds repayment schedules, flags late payers, and prints receipts. I have a live demo with sample data. Can I show you in 10 minutes? No obligation."
            </p>
          </div>

          <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.825rem; color: #FBBF24;">Follow-Up Message (Day 2)</span>
              <button class="btn btn-sm btn-secondary copy-btn" data-text="Hi [Name], just following up. Most lenders I show this to say the overdue list alone saves them hours each week. Happy to do a quick call or send the demo link.">
                Copy
              </button>
            </div>
            <p style="font-size: 0.85rem; color: #E2E8F0; line-height: 1.5; font-style: italic;">
              "Hi [Name], just following up. Most lenders I show this to say the overdue list alone saves them hours each week. Happy to do a quick call or send the demo link."
            </p>
          </div>
        </div>
      </section>

      <!-- Footer Disclaimer -->
      <footer style="text-align: center; border-top: 1px solid var(--border-subtle); padding: 2rem 1rem 1rem 1rem; color: var(--text-dim); font-size: 0.8rem;">
        <p>This is a record-keeping and management tool for licensed or established lenders. We do not make or arrange loans.</p>
        <p style="margin-top: 0.5rem;">© 2026 LendTrack Financial Technologies. All rights reserved.</p>
      </footer>
    </div>
  `}let p=ke(),G="dashboard";var de;let F=((de=p.loans[0])==null?void 0:de.id)||null,H="Patrick (Owner)";function f(n){var e;return N(n,((e=p.organization)==null?void 0:e.currency_symbol)||"$")}function A(n,e="success"){const l=document.getElementById("toast-container");if(!l)return;const c=document.createElement("div");c.className=`toast ${e==="error"?"toast-error":""}`,c.innerHTML=`
    <span style="font-weight: 700;">${e==="error"?"⚠️":"✓"}</span>
    <span>${n}</span>
  `,l.appendChild(c),setTimeout(()=>{c.style.opacity="0",c.style.transform="translateY(10px)",c.style.transition="all 0.25s ease",setTimeout(()=>c.remove(),250)},3500)}function fe(){const e=p.loans.filter(t=>t.status!=="paid_off").reduce((t,m)=>t+(m.total_outstanding||0),0),l=new Date().toISOString().substring(0,7),c=p.payments.filter(t=>!t.reversed&&t.date&&t.date.startsWith(l)).reduce((t,m)=>t+(m.amount||0),0),a=p.loans.filter(t=>t.status==="overdue"),o=document.getElementById("ticker-portfolio"),u=document.getElementById("ticker-collected"),i=document.getElementById("ticker-overdue"),d=document.getElementById("tab-overdue-count");o&&(o.textContent=f(e)),u&&(u.textContent=f(c)),i&&(i.textContent=`${a.length} Loans`),d&&(d.textContent=a.length)}function S(n){G=n,document.querySelectorAll(".nav-tab-btn").forEach(l=>{l.classList.toggle("active",l.dataset.tab===n)});const e=document.getElementById("main-content");if(e){switch(n){case"dashboard":se(e);break;case"borrowers":ze(e);break;case"new-loan":Re(e);break;case"loan-ledger":be(e);break;case"overdue":Fe(e);break;case"reports":Oe(e);break;case"csv-importer":Ne(e);break;case"audit-log":He(e);break;case"landing":e.innerHTML=Pe(),je();break;default:se(e)}fe()}}function se(n){var s,v,h,b,$;const e=p.loans.filter(g=>g.status!=="paid_off"),l=p.loans.filter(g=>g.status==="overdue"),c=e.reduce((g,x)=>g+(x.total_outstanding||0),0),a=l.reduce((g,x)=>g+(x.total_outstanding||0),0),o=c>0?Math.round(a/c*1e3)/10:0,u=new Date().toISOString().substring(0,7),i=p.payments.filter(g=>!g.reversed&&g.date&&g.date.startsWith(u)).reduce((g,x)=>g+(x.amount||0),0),d=new Date().toISOString().split("T")[0],t=p.installments.filter(g=>g.status!=="paid").sort((g,x)=>new Date(g.due_date)-new Date(x.due_date)).slice(0,6),m=[...p.payments].sort((g,x)=>new Date(x.timestamp||x.date)-new Date(g.timestamp||g.date)).slice(0,5);n.innerHTML=`
    <!-- Top Stat Cards -->
    <div class="grid-cols-4">
      <div class="card stat-card" style="--card-accent: #10B981;">
        <div class="stat-header">
          <span class="stat-title">Active Portfolio</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #34D399;">${f(c)}</div>
        <div class="stat-sub">Across ${e.length} active borrowers</div>
      </div>

      <div class="card stat-card" style="--card-accent: #3B82F6;">
        <div class="stat-header">
          <span class="stat-title">Collected This Month</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #60A5FA;">${f(i)}</div>
        <div class="stat-sub">MTD Cash & Bank Inflows</div>
      </div>

      <div class="card stat-card" style="--card-accent: #EF4444;">
        <div class="stat-header">
          <span class="stat-title">Delinquency (PAR)</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #F87171;">${o}%</div>
        <div class="stat-sub">${l.length} accounts (${f(a)}) in arrears</div>
      </div>

      <div class="card stat-card" style="--card-accent: #8B5CF6;">
        <div class="stat-header">
          <span class="stat-title">Borrower Directory</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #A78BFA;">${p.borrowers.length}</div>
        <div class="stat-sub">15 Pre-seeded active profiles</div>
      </div>
    </div>

    <!-- Delinquency Alert Banner (if any) -->
    ${l.length>0?`
    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.85rem;">
        <span style="font-size: 1.5rem;">🚨</span>
        <div>
          <div style="font-weight: 700; color: #F87171; font-size: 0.95rem;">
            ${l.length} Loans Require Immediate Recovery Attention
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Total overdue principal & charges: <strong style="color: #FFF;">${f(a)}</strong>. Send 1-click WhatsApp payment reminders now.
          </div>
        </div>
      </div>
      <button class="btn btn-danger btn-sm" id="dash-btn-overdue-desk">
        Open Collections Desk
      </button>
    </div>`:""}

    <!-- Main Two-Column Section -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
      
      <!-- Upcoming Due Collections -->
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700;">Installments Due Soon</h3>
          <span class="badge badge-pending">Upcoming</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Borrower</th>
                <th>Amount Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(g=>{const x=p.loans.find(L=>L.id===g.loan_id);return`
                  <tr>
                    <td class="font-mono" style="font-weight: 600; color: ${g.due_date<d?"#F87171":"var(--text-main)"};">
                      ${g.due_date}
                    </td>
                    <td style="font-weight: 600;">
                      ${x?x.borrower_name:"Borrower"}
                      <div style="font-size: 0.725rem; color: var(--text-dim);">${(x==null?void 0:x.loan_number)||""}</div>
                    </td>
                    <td class="font-mono" style="font-weight: 700;">
                      ${f(g.total_due-(g.amount_paid||0))}
                    </td>
                    <td>
                      <span class="badge badge-${g.status}">${g.status}</span>
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm record-pay-direct-btn" data-loan-id="${g.loan_id}" data-amount="${g.total_due-(g.amount_paid||0)}">
                        Pay
                      </button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Payments & Auditable Receipts -->
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700;">Recent Payment Ledger</h3>
          <span class="badge badge-paid">Verified</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Officer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${m.map(g=>`
                <tr style="${g.is_reversal?"opacity: 0.6; text-decoration: line-through;":""}">
                  <td class="font-mono" style="font-weight: 700; color: #60A5FA;">
                    ${g.receipt_number||g.id}
                  </td>
                  <td>${g.date}</td>
                  <td class="font-mono" style="font-weight: 700; color: ${g.amount<0?"#F87171":"#34D399"};">
                    ${f(g.amount)}
                  </td>
                  <td style="text-transform: capitalize; font-size: 0.75rem;">
                    ${(g.method||"cash").replace("_"," ")}
                  </td>
                  <td style="font-size: 0.75rem; color: var(--text-muted);">${g.received_by||"Staff"}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm print-payment-receipt-btn" data-payment-id="${g.id}">
                      Receipt
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Quick Operations Launcher -->
    <div class="card" style="background: rgba(19, 29, 49, 0.5);">
      <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);">
        Quick Workflows
      </h3>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-primary" id="dash-btn-new-loan">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Originate New Loan (Live Preview)
        </button>
        <button class="btn btn-secondary" id="dash-btn-record-payment">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          Record Cash / Bank Payment
        </button>
        <button class="btn btn-whatsapp" id="dash-btn-whatsapp-desk">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
          Send WhatsApp Reminder
        </button>
        <button class="btn btn-secondary" id="dash-btn-import-csv">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Import Excel / CSV
        </button>
      </div>
    </div>
  `,(s=document.getElementById("dash-btn-overdue-desk"))==null||s.addEventListener("click",()=>S("overdue")),(v=document.getElementById("dash-btn-new-loan"))==null||v.addEventListener("click",()=>S("new-loan")),(h=document.getElementById("dash-btn-record-payment"))==null||h.addEventListener("click",()=>W()),(b=document.getElementById("dash-btn-whatsapp-desk"))==null||b.addEventListener("click",()=>S("overdue")),($=document.getElementById("dash-btn-import-csv"))==null||$.addEventListener("click",()=>S("csv-importer")),n.querySelectorAll(".record-pay-direct-btn").forEach(g=>{g.addEventListener("click",()=>{W(g.dataset.loanId,g.dataset.amount)})}),n.querySelectorAll(".print-payment-receipt-btn").forEach(g=>{g.addEventListener("click",()=>{ee(g.dataset.paymentId)})})}function ze(n){var l,c;n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Borrower Directory</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Manage borrower credit profiles, guarantors, KYC and historical performance.</p>
      </div>
      <div style="display: flex; gap: 0.75rem;">
        <input type="text" id="borrower-search" class="form-input" placeholder="Search name, phone, town..." style="width: 260px;">
        <button class="btn btn-primary" id="btn-add-borrower-manual">+ Add Borrower</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table" id="borrowers-table">
        <thead>
          <tr>
            <th>Borrower Name</th>
            <th>ID / Phone</th>
            <th>Location & District</th>
            <th>Employment</th>
            <th>Active Loan</th>
            <th>Credit Standing</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="borrowers-tbody">
          <!-- Rendered dynamically -->
        </tbody>
      </table>
    </div>
  `;function e(a=""){const o=document.getElementById("borrowers-tbody");if(!o)return;const u=p.borrowers.filter(i=>{const d=a.toLowerCase();return i.name.toLowerCase().includes(d)||i.phone&&i.phone.includes(d)||i.address&&i.address.toLowerCase().includes(d)||i.employer&&i.employer.toLowerCase().includes(d)});o.innerHTML=u.map(i=>{const t=p.loans.filter(s=>s.borrower_id===i.id).find(s=>s.status!=="paid_off"),m=(i.phone||"").replace(/\D/g,"");return`
        <tr>
          <td>
            <div style="font-weight: 700; font-size: 0.95rem;">${i.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${i.id_number}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>${i.phone}</span>
              <a href="https://wa.me/${m.length===7?"501"+m:m}" target="_blank" title="WhatsApp Chat" style="color: #25D366;">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
              </a>
            </div>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${i.email||""}</div>
          </td>
          <td>${i.address}</td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${i.employer}</td>
          <td>
            ${t?`
              <div class="font-mono" style="font-weight: 700; color: ${t.status==="overdue"?"#F87171":"#34D399"};">
                ${f(t.total_outstanding)}
              </div>
              <div style="font-size: 0.725rem; color: var(--text-dim);">${t.loan_number}</div>
            `:'<span style="color: var(--text-dim);">No active balance</span>'}
          </td>
          <td>
            <span class="badge badge-${i.rating==="critical"||i.rating==="risky"?"overdue":"active"}">
              ${i.rating||"Good"}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm view-borrower-profile-btn" data-borrower-id="${i.id}">
                Profile
              </button>
              ${t?`
                <button class="btn btn-primary btn-sm view-borrower-ledger-btn" data-loan-id="${t.id}">
                  Ledger
                </button>
              `:`
                <button class="btn btn-secondary btn-sm new-loan-for-borrower-btn" data-borrower-id="${i.id}">
                  + Loan
                </button>
              `}
            </div>
          </td>
        </tr>
      `}).join(""),o.querySelectorAll(".view-borrower-profile-btn").forEach(i=>{i.addEventListener("click",()=>Te(i.dataset.borrowerId))}),o.querySelectorAll(".view-borrower-ledger-btn").forEach(i=>{i.addEventListener("click",()=>{F=i.dataset.loanId,S("loan-ledger")})}),o.querySelectorAll(".new-loan-for-borrower-btn").forEach(i=>{i.addEventListener("click",()=>{S("new-loan");const d=document.getElementById("nl-borrower-select");d&&(d.value=i.dataset.borrowerId)})})}e(),(l=document.getElementById("borrower-search"))==null||l.addEventListener("input",a=>{e(a.target.value)}),(c=document.getElementById("btn-add-borrower-manual"))==null||c.addEventListener("click",()=>{const a=prompt("Enter Full Name of Borrower:");if(!a)return;const o=prompt("Enter Phone Number (+501...):","+501 "),u=prompt("Enter Town / District:","Belize City"),i=prompt("Enter Employer / Business:","Self-Employed"),d={id:`bor_${Date.now()}`,name:a,id_number:`BZ-${Math.floor(1e5+Math.random()*9e5)}-M`,phone:o||"+501 600-0000",email:`${a.toLowerCase().replace(/\s+/g,".")}@gmail.com`,address:u||"Belize",employer:i||"General",guarantor:"None recorded",notes:"Manually created borrower profile",status:"active",rating:"good"};p.borrowers.unshift(d),Z(p,{action:"BORROWER_CREATED",user:H,target:d.name,details:`Created new borrower profile for ${d.name}`}),z(p),A(`Borrower ${d.name} added successfully!`),e()})}function Te(n){var u;const e=p.borrowers.find(i=>i.id===n);if(!e)return;const l=p.loans.filter(i=>i.borrower_id===e.id),c=document.getElementById("modal-borrower-profile"),a=document.getElementById("bp-modal-title"),o=document.getElementById("bp-modal-content");a.textContent=`Borrower: ${e.name}`,o.innerHTML=`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem;">
      <div>
        <div style="color: var(--text-muted);">Social Security / ID:</div>
        <div style="font-weight: 700;">${e.id_number}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Phone & WhatsApp:</div>
        <div style="font-weight: 700;">${e.phone}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Residential Address:</div>
        <div style="font-weight: 700;">${e.address}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Employer / Source of Income:</div>
        <div style="font-weight: 700;">${e.employer}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Guarantor / Reference:</div>
        <div style="font-weight: 700;">${e.guarantor}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Credit Standing:</div>
        <div><span class="badge badge-active">${e.rating||"Good"}</span></div>
      </div>
    </div>

    <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">Loan History (${l.length})</h4>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Loan Ref</th>
            <th>Principal</th>
            <th>Rate</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${l.map(i=>`
            <tr>
              <td class="font-mono" style="font-weight: 700;">${i.loan_number}</td>
              <td class="font-mono">${f(i.principal)}</td>
              <td>${i.rate}% (${i.interest_method})</td>
              <td class="font-mono" style="font-weight: 700;">${f(i.total_outstanding)}</td>
              <td><span class="badge badge-${i.status}">${i.status}</span></td>
              <td>
                <button class="btn btn-secondary btn-sm select-loan-from-modal-btn" data-loan-id="${i.id}">
                  Open Ledger
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
      <button class="btn btn-secondary" data-close="modal-borrower-profile">Close</button>
      <button class="btn btn-primary" id="bp-btn-create-loan" data-borrower-id="${e.id}">
        + Issue New Loan to ${e.name.split(" ")[0]}
      </button>
    </div>
  `,o.querySelectorAll(".select-loan-from-modal-btn").forEach(i=>{i.addEventListener("click",()=>{c.classList.remove("active"),F=i.dataset.loanId,S("loan-ledger")})}),(u=document.getElementById("bp-btn-create-loan"))==null||u.addEventListener("click",i=>{c.classList.remove("active"),S("new-loan");const d=document.getElementById("nl-borrower-select");d&&(d.value=i.target.dataset.borrowerId)}),c.classList.add("active")}function Re(n){var c;const e=new Date().toISOString().split("T")[0];n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Originate New Loan</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          Configure principal, terms, and repayment frequency with an instant live schedule preview.
        </p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: minmax(360px, 460px) 1fr; gap: 2rem; align-items: start;">
      
      <!-- Parameters Form -->
      <div class="card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem;">Loan Parameters</h3>
        
        <form id="form-new-loan">
          <div class="form-group">
            <label class="form-label">Borrower</label>
            <select id="nl-borrower-select" class="form-select" required>
              ${p.borrowers.map(a=>`
                <option value="${a.id}">${a.name} (${a.phone})</option>
              `).join("")}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Principal Amount ($)</label>
              <input type="number" id="nl-principal" class="form-input font-mono" value="1500" step="50" min="100" required>
            </div>
            <div class="form-group">
              <label class="form-label">Annual / Flat Rate (%)</label>
              <input type="number" id="nl-rate" class="form-input font-mono" value="20" step="0.5" min="1" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Interest Calculation Method</label>
              <select id="nl-method" class="form-select">
                <option value="flat" selected>Flat Rate (Simple)</option>
                <option value="reducing">Reducing Balance (Amortized)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Repayment Frequency</label>
              <select id="nl-frequency" class="form-select">
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY" selected>Bi-weekly (Fortnightly)</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Number of Installments</label>
              <input type="number" id="nl-term" class="form-input font-mono" value="6" min="1" max="104" required>
            </div>
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input type="date" id="nl-start-date" class="form-input" value="${e}" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Processing / Documentation Fee ($)</label>
            <input type="number" id="nl-fee" class="form-input font-mono" value="35" min="0" step="5">
          </div>

          <div class="form-group">
            <label class="form-label">Internal Loan Purpose / Collateral Notes</label>
            <textarea id="nl-notes" class="form-textarea" rows="2" placeholder="e.g. Vehicle title #9921 held, personal emergency, market inventory..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 0.95rem;">
            Originate Loan & Generate Schedule
          </button>
        </form>
      </div>

      <!-- Live Schedule Preview Panel -->
      <div>
        <!-- Live Summary Bar -->
        <div class="card" style="margin-bottom: 1.25rem; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; text-align: center;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Total Principal</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #FFF;" id="prev-total-principal">$ 0.00</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Total Interest</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #60A5FA;" id="prev-total-interest">$ 0.00</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Total Repayment</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #34D399;" id="prev-total-repayment">$ 0.00</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Per Installment</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #FBBF24;" id="prev-per-installment">$ 0.00</div>
            </div>
          </div>
        </div>

        <!-- Schedule Table -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.05rem; font-weight: 700;">Live Installment Schedule Preview</h3>
            <span class="badge badge-active" id="prev-freq-badge">Bi-weekly</span>
          </div>

          <div class="table-container" style="max-height: 480px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Total Due</th>
                  <th>Balance Remaining</th>
                </tr>
              </thead>
              <tbody id="prev-schedule-tbody">
                <!-- Live preview injected -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;function l(){const a=parseFloat(document.getElementById("nl-principal").value)||0,o=parseFloat(document.getElementById("nl-rate").value)||0,u=document.getElementById("nl-method").value,i=document.getElementById("nl-frequency").value,d=parseInt(document.getElementById("nl-term").value,10)||0,t=document.getElementById("nl-start-date").value||e,m=parseFloat(document.getElementById("nl-fee").value)||0,s=C({principal:a,annualRate:o,interestMethod:u,termCount:d,frequency:i,startDate:t,processingFee:m});document.getElementById("prev-total-principal").textContent=f(s.principal),document.getElementById("prev-total-interest").textContent=f(s.totalInterest),document.getElementById("prev-total-repayment").textContent=f(s.totalRepayment),document.getElementById("prev-per-installment").textContent=f(s.installmentAmount),document.getElementById("prev-freq-badge").textContent=i;const v=document.getElementById("prev-schedule-tbody");return v.innerHTML=s.schedule.map(h=>`
      <tr>
        <td class="font-mono" style="font-weight: 700;">#${h.installment_number}</td>
        <td class="font-mono">${h.due_date}</td>
        <td class="font-mono">${f(h.principal_due)}</td>
        <td class="font-mono" style="color: #60A5FA;">${f(h.interest_due)}</td>
        <td class="font-mono" style="font-weight: 700; color: #34D399;">${f(h.total_due)}</td>
        <td class="font-mono" style="color: var(--text-dim);">${f(h.remaining_balance)}</td>
      </tr>
    `).join(""),s}["nl-principal","nl-rate","nl-method","nl-frequency","nl-term","nl-start-date","nl-fee"].forEach(a=>{var o,u;(o=document.getElementById(a))==null||o.addEventListener("input",l),(u=document.getElementById(a))==null||u.addEventListener("change",l)}),l(),(c=document.getElementById("form-new-loan"))==null||c.addEventListener("submit",a=>{a.preventDefault();const o=document.getElementById("nl-borrower-select").value,u=p.borrowers.find(I=>I.id===o);if(!u)return;const i=parseFloat(document.getElementById("nl-principal").value),d=parseFloat(document.getElementById("nl-rate").value),t=document.getElementById("nl-method").value,m=document.getElementById("nl-frequency").value,s=parseInt(document.getElementById("nl-term").value,10),v=document.getElementById("nl-start-date").value,h=parseFloat(document.getElementById("nl-fee").value)||0,b=document.getElementById("nl-notes").value,$=C({principal:i,annualRate:d,interestMethod:t,termCount:s,frequency:m,startDate:v,processingFee:h}),g=`ln_${Date.now()}`,x=`LN-2026-${100+p.loans.length+1}`,k={id:g,loan_number:x,borrower_id:u.id,borrower_name:u.name,principal:i,rate:d,interest_method:t,term_count:s,frequency:m,start_date:v,fees:h,status:"active",created_by:H,notes:b||"New loan created via LendTrack"},L=$.schedule.map(I=>({...I,id:`inst_${g}_${I.installment_number}`,loan_id:g}));p.installments=p.installments.concat(L);const B=Y(k,p.installments,p.payments,p.charges);p.loans.unshift(B.loan),Z(p,{action:"LOAN_ORIGINATED",user:H,target:`${x} (${u.name})`,details:`Originated ${f(i)} loan with ${s} ${m.toLowerCase()} installments at ${d}% (${t})`}),z(p),A(`Loan ${x} originated for ${u.name}!`),F=g,S("loan-ledger")})}function be(n){var d,t,m;!F&&p.loans.length>0&&(F=p.loans[0].id);const e=p.loans.find(s=>s.id===F)||p.loans[0];if(!e){n.innerHTML='<div class="card" style="text-align: center; padding: 3rem;">No loans found. Originate a loan first.</div>';return}const l=p.borrowers.find(s=>s.id===e.borrower_id)||{name:e.borrower_name,phone:""},c=p.installments.filter(s=>s.loan_id===e.id).sort((s,v)=>s.installment_number-v.installment_number),a=p.payments.filter(s=>s.loan_id===e.id).sort((s,v)=>new Date(v.date||v.timestamp)-new Date(s.date||s.timestamp));p.charges.filter(s=>s.loan_id===e.id);const o=c.reduce((s,v)=>s+(v.total_due||0),0),u=c.reduce((s,v)=>s+(v.amount_paid||0),0),i=o>0?Math.min(100,Math.round(u/o*100)):0;n.innerHTML=`
    <!-- Top Selector & Actions -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div>
          <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 4px;">
            Select Loan Account:
          </label>
          <select id="ledger-loan-select" class="form-select" style="min-width: 320px; font-weight: 600;">
            ${p.loans.map(s=>`
              <option value="${s.id}" ${s.id===e.id?"selected":""}>
                ${s.loan_number} - ${s.borrower_name} (${f(s.total_outstanding)} due) [${s.status.toUpperCase()}]
              </option>
            `).join("")}
          </select>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary" id="ledger-btn-statement">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Statement
        </button>
        <button class="btn btn-primary" id="ledger-btn-pay">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          Record Payment
        </button>
      </div>
    </div>

    <!-- Loan Overview & Balance Cards -->
    <div class="card" style="margin-bottom: 1.5rem; padding: 1.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h2 style="font-size: 1.5rem; font-weight: 800;">${e.loan_number}</h2>
            <span class="badge badge-${e.status}">${e.status}</span>
          </div>
          <div style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.25rem;">
            Borrower: <strong style="color: #FFF;">${l.name}</strong> • ${l.phone} • ${l.address}
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 0.775rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Total Outstanding Balance</div>
          <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: ${e.status==="overdue"?"#F87171":"#34D399"};">
            ${f(e.total_outstanding)}
          </div>
        </div>
      </div>

      <!-- Financial Metrics Breakdown -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Original Principal</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700;">${f(e.principal)}</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Principal Remaining</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: #FFF;">${f(e.outstanding_principal)}</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Interest Rate & Method</div>
          <div style="font-size: 0.95rem; font-weight: 600;">${e.rate}% (${e.interest_method})</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Frequency & Terms</div>
          <div style="font-size: 0.95rem; font-weight: 600;">${e.term_count} (${e.frequency})</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Late Fees / Charges</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: ${e.outstanding_charges>0?"#F87171":"#FFF"};">
            ${f(e.outstanding_charges)}
          </div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Total Paid To Date</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: #60A5FA;">${f(u)}</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.775rem; margin-bottom: 0.35rem;">
          <span style="color: var(--text-muted);">Repayment Completion</span>
          <span style="font-weight: 700; color: #34D399;">${i}%</span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 9999px; overflow: hidden;">
          <div style="width: ${i}%; height: 100%; background: linear-gradient(90deg, #10B981, #34D399); border-radius: 9999px; transition: width 0.3s ease;"></div>
        </div>
      </div>
    </div>

    <!-- Tabs for Installments vs Payments vs Charges -->
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">Repayment Installments Schedule</h3>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Due Date</th>
              <th>Principal Due</th>
              <th>Interest Due</th>
              <th>Total Due</th>
              <th>Paid Amount</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${c.map(s=>{const v=Math.max(0,s.total_due-(s.amount_paid||0));return`
                <tr>
                  <td class="font-mono" style="font-weight: 700;">#${s.installment_number}</td>
                  <td class="font-mono" style="font-weight: 600;">${s.due_date}</td>
                  <td class="font-mono">${f(s.principal_due)}</td>
                  <td class="font-mono" style="color: #60A5FA;">${f(s.interest_due)}</td>
                  <td class="font-mono" style="font-weight: 700;">${f(s.total_due)}</td>
                  <td class="font-mono" style="color: #34D399;">${f(s.amount_paid||0)}</td>
                  <td class="font-mono" style="font-weight: 700; color: ${v>0?"#F87171":"var(--text-dim)"};">
                    ${f(v)}
                  </td>
                  <td>
                    <span class="badge badge-${s.status}">${s.status}</span>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Transactions Table (With Reversal Support) -->
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800;">Payment & Reversal History</h3>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Never deleted • Fully auditable</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Received By</th>
              <th>Notes / Audit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${a.length===0?`
              <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No payments recorded yet.</td></tr>
            `:a.map(s=>`
              <tr style="${s.is_reversal?"opacity: 0.55; text-decoration: line-through;":""}">
                <td class="font-mono" style="font-weight: 700; color: #60A5FA;">
                  ${s.receipt_number||s.id}
                </td>
                <td>${s.date}</td>
                <td class="font-mono" style="font-weight: 700; color: ${s.amount<0?"#F87171":"#34D399"};">
                  ${f(s.amount)}
                </td>
                <td style="text-transform: capitalize;">${(s.method||"cash").replace("_"," ")}</td>
                <td style="font-size: 0.8rem;">${s.received_by||"Staff"}</td>
                <td style="font-size: 0.775rem; color: var(--text-muted); max-width: 250px;">
                  ${s.notes||"-"}
                </td>
                <td>
                  <div style="display: flex; gap: 0.4rem;">
                    ${s.is_reversal?'<span class="badge badge-overdue">Reversed</span>':`
                      <button class="btn btn-secondary btn-sm print-payment-receipt-btn" data-payment-id="${s.id}">
                        Receipt
                      </button>
                      <button class="btn btn-danger btn-sm reverse-payment-btn" data-payment-id="${s.id}" data-amount="${s.amount}">
                        Reverse
                      </button>
                    `}
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,(d=document.getElementById("ledger-loan-select"))==null||d.addEventListener("change",s=>{F=s.target.value,be(n)}),(t=document.getElementById("ledger-btn-pay"))==null||t.addEventListener("click",()=>{W(e.id)}),(m=document.getElementById("ledger-btn-statement"))==null||m.addEventListener("click",()=>{window.print()}),n.querySelectorAll(".print-payment-receipt-btn").forEach(s=>{s.addEventListener("click",()=>ee(s.dataset.paymentId))}),n.querySelectorAll(".reverse-payment-btn").forEach(s=>{s.addEventListener("click",()=>qe(s.dataset.paymentId))})}function Fe(n){const e=new Date,l=e.toISOString().split("T")[0],c=[];p.loans.forEach(o=>{const i=p.installments.filter(d=>d.loan_id===o.id).filter(d=>d.due_date<l&&d.status!=="paid");if(i.length>0){i.sort((h,b)=>new Date(h.due_date)-new Date(b.due_date));const d=i[0],t=new Date(d.due_date),m=Math.max(1,Math.floor((e-t)/(1e3*60*60*24))),s=i.reduce((h,b)=>h+(b.total_due-(b.amount_paid||0)),0),v=p.borrowers.find(h=>h.id===o.borrower_id)||{name:o.borrower_name,phone:""};c.push({loan:o,borrower:v,oldestInstallment:{...d,days_overdue:m},daysOverdue:m,overdueCount:i.length,totalOverdueAmount:s})}}),c.sort((o,u)=>u.daysOverdue-o.daysOverdue),n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h2 style="font-size: 1.5rem; font-weight: 800;">Collections & WhatsApp Recovery Desk</h2>
          <span class="badge badge-overdue">${c.length} Delinquent</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          1-tap WhatsApp payment reminders with custom polite, urgent, or legal escalation notices.
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem;" id="aging-filter-pills">
        <button class="btn btn-secondary btn-sm aging-pill active" data-bracket="all">All (${c.length})</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="1-7">1–7 Days</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="8-14">8–14 Days</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="15-30">15–30 Days</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="30+">30+ Days (PAR 30)</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Borrower</th>
            <th>Phone</th>
            <th>Loan Ref</th>
            <th>Days Late</th>
            <th>Overdue Amount</th>
            <th>Recommended Action</th>
            <th>Direct Recovery Action</th>
          </tr>
        </thead>
        <tbody id="overdue-tbody">
          <!-- Injected dynamically -->
        </tbody>
      </table>
    </div>
  `;function a(o="all"){const u=document.getElementById("overdue-tbody");if(!u)return;const i=c.filter(d=>o==="1-7"?d.daysOverdue>=1&&d.daysOverdue<=7:o==="8-14"?d.daysOverdue>=8&&d.daysOverdue<=14:o==="15-30"?d.daysOverdue>=15&&d.daysOverdue<=30:o==="30+"?d.daysOverdue>30:!0);if(i.length===0){u.innerHTML='<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No accounts in this arrears bracket.</td></tr>';return}u.innerHTML=i.map(d=>{const t=Be(d.borrower,d.loan,d.oldestInstallment,p.organization),m=Ie(d.borrower.phone,t);let s="";return d.daysOverdue>30?s='<span class="badge badge-overdue">PAR 30+ (Legal Action)</span>':d.daysOverdue>14?s='<span class="badge badge-overdue">Urgent Warning</span>':d.daysOverdue>7?s='<span class="badge badge-pending">Second Notice</span>':s='<span class="badge badge-pending">Gentle Reminder</span>',`
        <tr>
          <td>
            <div style="font-weight: 700; font-size: 0.95rem;">${d.borrower.name}</div>
            <div style="font-size: 0.725rem; color: var(--text-dim);">${d.borrower.address}</div>
          </td>
          <td class="font-mono">${d.borrower.phone}</td>
          <td>
            <span class="font-mono" style="font-weight: 700; color: #60A5FA;">${d.loan.loan_number}</span>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${d.overdueCount} installment(s) late</div>
          </td>
          <td>
            <span class="font-mono" style="font-weight: 800; font-size: 1rem; color: ${d.daysOverdue>30?"#F87171":"#FBBF24"};">
              ${d.daysOverdue} Days
            </span>
          </td>
          <td class="font-mono" style="font-weight: 800; font-size: 1rem; color: #F87171;">
            ${f(d.totalOverdueAmount)}
          </td>
          <td>${s}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <a href="${m}" target="_blank" class="btn btn-whatsapp btn-sm whatsapp-reminder-btn" data-borrower="${d.borrower.name}" data-loan="${d.loan.loan_number}">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
                WhatsApp Reminder
              </a>
              <button class="btn btn-secondary btn-sm overdue-pay-btn" data-loan-id="${d.loan.id}" data-amount="${d.totalOverdueAmount}">
                Collect
              </button>
            </div>
          </td>
        </tr>
      `}).join(""),u.querySelectorAll(".whatsapp-reminder-btn").forEach(d=>{d.addEventListener("click",()=>{Z(p,{action:"WHATSAPP_REMINDER_SENT",user:H,target:`${d.dataset.borrower} (${d.dataset.loan})`,details:`Sent automated collections WhatsApp message to ${d.dataset.borrower}`}),A(`Logged WhatsApp reminder to ${d.dataset.borrower}`)})}),u.querySelectorAll(".overdue-pay-btn").forEach(d=>{d.addEventListener("click",()=>{W(d.dataset.loanId,d.dataset.amount)})})}a("all"),document.querySelectorAll(".aging-pill").forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(".aging-pill").forEach(u=>u.classList.remove("active")),o.classList.add("active"),a(o.dataset.bracket)})})}function Oe(n){const e=p.loans.filter(h=>h.status!=="paid_off"),l=e.reduce((h,b)=>h+(b.outstanding_principal||0),0),c=e.reduce((h,b)=>h+(b.outstanding_interest||0),0),a=e.reduce((h,b)=>h+(b.outstanding_charges||0),0),o=l+c+a,u=new Date,i=u.toISOString().split("T")[0];let d=0,t=0,m=0,s=0;e.forEach(h=>{const b=p.installments.filter($=>$.loan_id===h.id&&$.due_date<i&&$.status!=="paid");if(b.length===0)d+=h.total_outstanding||0;else{b.sort((g,x)=>new Date(g.due_date)-new Date(x.due_date));const $=Math.max(1,Math.floor((u-new Date(b[0].due_date))/(1e3*60*60*24)));$<=30?t+=h.total_outstanding||0:$<=60?m+=h.total_outstanding||0:s+=h.total_outstanding||0}});const v={cash:0,bank_transfer:0,mobile_digiwallet:0,cheque:0};p.payments.filter(h=>!h.reversed).forEach(h=>{const b=h.method||"cash";v[b]!==void 0?v[b]+=h.amount||0:v.cash+=h.amount||0}),n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Portfolio Analytics & Aging Reports</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Standard microfinance aging analysis (PAR 30, PAR 60, PAR 90) and collections summary.</p>
      </div>
      <button class="btn btn-secondary" onclick="window.print()">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Print Report
      </button>
    </div>

    <!-- Portfolio Summary Metrics -->
    <div class="grid-cols-4" style="margin-bottom: 1.5rem;">
      <div class="card stat-card" style="--card-accent: #10B981;">
        <span class="stat-title">Total Active Portfolio</span>
        <div class="stat-value font-mono" style="color: #34D399;">${f(o)}</div>
        <div class="stat-sub">Principal + Accrued Interest</div>
      </div>

      <div class="card stat-card" style="--card-accent: #3B82F6;">
        <span class="stat-title">Principal at Risk (PAR 30+)</span>
        <div class="stat-value font-mono" style="color: #60A5FA;">
          ${o>0?((m+s)/o*100).toFixed(1):0}%
        </div>
        <div class="stat-sub">${f(m+s)} delinquent >30 days</div>
      </div>

      <div class="card stat-card" style="--card-accent: #F59E0B;">
        <span class="stat-title">Uncollected Late Fees</span>
        <div class="stat-value font-mono" style="color: #FBBF24;">${f(a)}</div>
        <div class="stat-sub">Recoverable penalty charges</div>
      </div>

      <div class="card stat-card" style="--card-accent: #8B5CF6;">
        <span class="stat-title">Total Lifetime Collections</span>
        <div class="stat-value font-mono" style="color: #A78BFA;">
          ${f(p.payments.filter(h=>!h.reversed).reduce((h,b)=>h+(b.amount||0),0))}
        </div>
        <div class="stat-sub">${p.payments.length} verified receipts</div>
      </div>
    </div>

    <!-- Aging Schedule Table -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Portfolio Aging Distribution (PAR)</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aging Category</th>
              <th>Status Definition</th>
              <th>Outstanding Balance</th>
              <th>% of Portfolio</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 700; color: #34D399;">Current & On-Time</td>
              <td>0 days past due date</td>
              <td class="font-mono" style="font-weight: 700;">${f(d)}</td>
              <td class="font-mono">${o>0?(d/o*100).toFixed(1):0}%</td>
              <td><span class="badge badge-active">Normal</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #FBBF24;">Early Arrears (1–30 Days)</td>
              <td>Missed 1 payment cycle (Grace period applied)</td>
              <td class="font-mono" style="font-weight: 700;">${f(t)}</td>
              <td class="font-mono">${o>0?(t/o*100).toFixed(1):0}%</td>
              <td><span class="badge badge-pending">Watchlist</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #F87171;">Late Default (31–60 Days)</td>
              <td>Missed 2 payment cycles (PAR 30+)</td>
              <td class="font-mono" style="font-weight: 700;">${f(m)}</td>
              <td class="font-mono">${o>0?(m/o*100).toFixed(1):0}%</td>
              <td><span class="badge badge-overdue">Substandard</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #DC2626;">Severe Arrears (60+ Days)</td>
              <td>PAR 60+ (Guarantor and Collateral Recovery)</td>
              <td class="font-mono" style="font-weight: 700;">${f(s)}</td>
              <td class="font-mono">${o>0?(s/o*100).toFixed(1):0}%</td>
              <td><span class="badge badge-overdue" style="background: rgba(220, 38, 38, 0.3);">Doubtful</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Collections by Payment Method Breakdown -->
    <div class="card">
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Collections Inflow by Channel</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.775rem; color: var(--text-muted); text-transform: uppercase;">Cash at Branch</div>
          <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: #34D399; margin: 0.25rem 0;">${f(v.cash)}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">Counter receipts</div>
        </div>
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.775rem; color: var(--text-muted); text-transform: uppercase;">Bank Transfer / Direct Deposit</div>
          <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: #60A5FA; margin: 0.25rem 0;">${f(v.bank_transfer)}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">Belize Bank / Heritage / Atlantic</div>
        </div>
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.775rem; color: var(--text-muted); text-transform: uppercase;">DigiWallet / Mobile Pay</div>
          <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: #FBBF24; margin: 0.25rem 0;">${f(v.mobile_digiwallet)}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">Instant mobile collections</div>
        </div>
      </div>
    </div>
  `}function Ne(n){var l,c,a;n.innerHTML=`
    <div style="max-width: 900px; margin: 0 auto;">
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem;">Excel / CSV Migration Wizard</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Eliminate the biggest barrier to switching. Paste or upload your current lending spreadsheet to automatically create borrowers and recalculate repayment schedules in seconds.
        </p>
      </div>

      <div class="card" style="margin-bottom: 1.5rem; padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700;">Paste CSV Data or Load Template</h3>
          <button class="btn btn-secondary btn-sm" id="btn-load-sample-csv">
            Load Belize Lenders Sample CSV
          </button>
        </div>

        <div class="form-group">
          <textarea id="csv-paste-input" class="form-textarea font-mono" rows="8" placeholder="Paste your CSV with headers: Borrower Name, Phone, Address, Employer, Principal, Interest Rate, Interest Method, Term Count, Frequency, Start Date..."></textarea>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--text-dim);">
            Columns supported: Name, Phone, Address, Principal, Rate, Term, Frequency, Method
          </span>
          <button class="btn btn-primary" id="btn-parse-csv">
            Validate & Preview Rows
          </button>
        </div>
      </div>

      <!-- Preview Container -->
      <div id="csv-preview-container" style="display: none;" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700;">Data Validation Preview</h3>
            <div style="font-size: 0.8rem; color: #34D399;" id="csv-preview-count">0 rows ready to import</div>
          </div>
          <button class="btn btn-primary" id="btn-execute-import">
            Import Into Live System
          </button>
        </div>

        <div class="table-container" style="max-height: 340px; overflow-y: auto;">
          <table class="data-table" id="csv-preview-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Phone</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Method</th>
                <th>Term</th>
              </tr>
            </thead>
            <tbody id="csv-preview-tbody">
              <!-- Injected dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;let e=[];(l=document.getElementById("btn-load-sample-csv"))==null||l.addEventListener("click",()=>{const o=document.getElementById("csv-paste-input");o&&(o.value=Se)}),(c=document.getElementById("btn-parse-csv"))==null||c.addEventListener("click",()=>{var t;const o=((t=document.getElementById("csv-paste-input"))==null?void 0:t.value)||"";if(e=Ae(o),e.length===0){A("Could not parse any rows. Check CSV format.","error");return}const u=document.getElementById("csv-preview-container"),i=document.getElementById("csv-preview-count"),d=document.getElementById("csv-preview-tbody");i.textContent=`Found ${e.length} valid loans ready for batch creation`,d.innerHTML=e.map(m=>`
      <tr>
        <td style="font-weight: 700;">${m["Borrower Name"]||m.name}</td>
        <td class="font-mono">${m.Phone||m.phone}</td>
        <td class="font-mono">${f(m.Principal||m.principal)}</td>
        <td>${m["Interest Rate"]||m.rate}%</td>
        <td>${m["Interest Method"]||m.method}</td>
        <td>${m["Term Count"]||m.term} (${m.Frequency||m.frequency})</td>
      </tr>
    `).join(""),u.style.display="block",A(`Validated ${e.length} rows successfully!`)}),(a=document.getElementById("btn-execute-import"))==null||a.addEventListener("click",()=>{e.length!==0&&(p=De(e,p),z(p),A(`Batch import complete! Added ${e.length} loans.`),S("dashboard"))})}function He(n){var l;const e=p.auditLogs||[];n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Immutable Audit Log</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          Cryptographic & operational change log. Records every origination, payment, reversal, and reminder.
        </p>
      </div>
      <button class="btn btn-secondary btn-sm" id="btn-export-audit">
        Export Audit JSON
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action Type</th>
            <th>Authorized User</th>
            <th>Target Account</th>
            <th>Transaction Details</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(c=>`
            <tr>
              <td class="font-mono" style="font-size: 0.775rem; color: var(--text-muted);">
                ${c.timestamp?c.timestamp.replace("T"," ").substring(0,19):"-"}
              </td>
              <td>
                <span class="badge ${c.action.includes("REVERSAL")?"badge-overdue":"badge-active"}">
                  ${c.action}
                </span>
              </td>
              <td style="font-weight: 600;">${c.user||"System"}</td>
              <td style="color: #60A5FA; font-weight: 600;">${c.target||"-"}</td>
              <td style="font-size: 0.825rem; color: var(--text-main);">${c.details}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `,(l=document.getElementById("btn-export-audit"))==null||l.addEventListener("click",()=>{const c=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),a=URL.createObjectURL(c),o=document.createElement("a");o.href=a,o.download=`lendtrack-audit-${new Date().toISOString().split("T")[0]}.json`,o.click(),A("Audit log exported successfully!")})}function W(n=null,e=null){const l=document.getElementById("modal-payment"),c=document.getElementById("payment-loan-select"),a=document.getElementById("payment-amount"),o=document.getElementById("payment-date"),u=document.getElementById("payment-received-by");if(!l||!c)return;if(c.innerHTML=p.loans.filter(t=>t.status!=="paid_off").map(t=>`
      <option value="${t.id}" ${t.id===(n||F)?"selected":""}>
        ${t.loan_number} - ${t.borrower_name} (${f(t.total_outstanding)} due)
      </option>
    `).join(""),c.options.length===0){A("No active loans with outstanding balances found.","error");return}o.value=new Date().toISOString().split("T")[0],u.value=H;function i(){const t=p.loans.find(h=>h.id===c.value);if(!t)return;const m=p.borrowers.find(h=>h.id===t.borrower_id),s=p.installments.filter(h=>h.loan_id===t.id&&h.status!=="paid");s.sort((h,b)=>new Date(h.due_date)-new Date(b.due_date));const v=s[0];document.getElementById("pay-box-borrower").textContent=m?m.name:t.borrower_name,document.getElementById("pay-box-balance").textContent=f(t.total_outstanding),document.getElementById("pay-box-installment").textContent=f(v?v.total_due-(v.amount_paid||0):0),e?a.value=e:v&&(a.value=(v.total_due-(v.amount_paid||0)).toFixed(2)),d()}function d(){const t=p.loans.find(g=>g.id===c.value),m=parseFloat(a.value)||0,s=document.getElementById("waterfall-preview-text");if(!t||m<=0){s.innerHTML="Enter an amount above to see the automatic allocation across fees, interest, and principal.";return}const v=p.installments.filter(g=>g.loan_id===t.id),h=p.charges.filter(g=>g.loan_id===t.id),$=X(t,v,h,m).allocation;s.innerHTML=`
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem;">
        <div><strong>Late Charges:</strong> <span style="color: #F87171;">${f($.chargesPaid)}</span></div>
        <div><strong>Interest Paid:</strong> <span style="color: #60A5FA;">${f($.interestPaid)}</span></div>
        <div><strong>Principal Paid:</strong> <span style="color: #34D399;">${f($.principalPaid)}</span></div>
      </div>
      ${$.excessPrincipal>0?`<div style="margin-top: 0.35rem; color: #FBBF24;">* Includes ${f($.excessPrincipal)} extra prepayment directly reducing principal balance.</div>`:""}
    `}c.onchange=i,a.oninput=d,i(),l.classList.add("active")}var le;(le=document.getElementById("form-record-payment"))==null||le.addEventListener("submit",n=>{var h;n.preventDefault();const e=document.getElementById("payment-loan-select").value,l=p.loans.find(b=>b.id===e),c=parseFloat(document.getElementById("payment-amount").value),a=document.getElementById("payment-date").value,o=document.getElementById("payment-method").value,u=document.getElementById("payment-received-by").value,i=document.getElementById("payment-notes").value;if(!l||!c||c<=0){A("Please enter a valid payment amount.","error");return}const d=`RCP-BZ-${Math.floor(1e3+Math.random()*9e3)}`,t=`pay_${Date.now()}`,m={id:t,loan_id:l.id,amount:c,date:a,method:o,received_by:u,receipt_number:d,notes:i||"Counter receipt collection",timestamp:new Date().toISOString()};p.payments.unshift(m);const s=Y(l,p.installments,p.payments,p.charges),v=p.loans.findIndex(b=>b.id===l.id);v!==-1&&(p.loans[v]=s.loan),p.installments=p.installments.filter(b=>b.loan_id!==l.id).concat(s.installments),Z(p,{action:"PAYMENT_RECORDED",user:u,target:`${l.loan_number} (${l.borrower_name})`,details:`Recorded ${f(c)} payment via ${o}. Receipt: ${d}`}),z(p),A(`Recorded payment of ${f(c)} (Receipt ${d})!`),(h=document.getElementById("modal-payment"))==null||h.classList.remove("active"),ee(t),S(G)});function ee(n){var t;const e=p.payments.find(m=>m.id===n);if(!e)return;const l=p.loans.find(m=>m.id===e.loan_id),c=p.borrowers.find(m=>m.id===(l==null?void 0:l.borrower_id))||{name:(l==null?void 0:l.borrower_name)||"Borrower"},a=p.installments.filter(m=>m.loan_id===l.id),o=p.charges.filter(m=>m.loan_id===l.id),u=X(l,a,o,e.amount),i=Me({organization:p.organization,payment:e,loan:l,borrower:c,allocationBreakdown:u.allocation}),d=document.getElementById("receipt-render-target");d&&(d.innerHTML=i),(t=document.getElementById("modal-receipt"))==null||t.classList.add("active")}function qe(n){var l;p.payments.find(c=>c.id===n)&&(document.getElementById("reversal-payment-id").value=n,(l=document.getElementById("modal-reversal"))==null||l.classList.add("active"))}var ce;(ce=document.getElementById("form-reversal"))==null||ce.addEventListener("submit",n=>{var i;n.preventDefault();const e=document.getElementById("reversal-payment-id").value,l=document.getElementById("reversal-reason").value,c=document.getElementById("reversal-authorizer").value,a=p.payments.find(d=>d.id===e);if(!a)return;a.reversed=!0;const o=we(a,l,c);p.payments.unshift(o);const u=p.loans.find(d=>d.id===a.loan_id);if(u){const d=Y(u,p.installments,p.payments,p.charges),t=p.loans.findIndex(m=>m.id===u.id);t!==-1&&(p.loans[t]=d.loan),p.installments=p.installments.filter(m=>m.loan_id!==u.id).concat(d.installments)}Z(p,{action:"PAYMENT_REVERSAL",user:c,target:`Payment ${a.receipt_number||a.id}`,details:`Reversed payment of ${f(a.amount)}. Reason: ${l}`}),z(p),A(`Reversed payment ${a.receipt_number}. Balances restored.`),(i=document.getElementById("modal-reversal"))==null||i.classList.remove("active"),S(G)});function je(){var c;(c=document.getElementById("landing-cta-demo"))==null||c.addEventListener("click",()=>S("dashboard"));const n=document.getElementById("calc-borrowers-slider"),e=document.getElementById("calc-borrowers-val"),l=document.getElementById("calc-savings-display");n&&e&&l&&n.addEventListener("input",a=>{const o=parseInt(a.target.value,10);e.textContent=o;const u=Math.round(o*10.85);l.textContent=`$ ${u.toLocaleString("en-US",{minimumFractionDigits:2})} BZD`}),document.querySelectorAll(".copy-btn").forEach(a=>{a.addEventListener("click",()=>{const o=a.dataset.text;navigator.clipboard.writeText(o).then(()=>{const u=a.textContent;a.textContent="Copied!",a.style.color="#34D399",setTimeout(()=>{a.textContent=u,a.style.color=""},2e3),A("Outreach message copied to clipboard!")})})})}document.querySelectorAll("[data-close]").forEach(n=>{n.addEventListener("click",()=>{var l;const e=n.dataset.close;(l=document.getElementById(e))==null||l.classList.remove("active")})});window.addEventListener("click",n=>{n.target.classList.contains("modal-overlay")&&n.target.classList.remove("active")});var me;(me=document.getElementById("currency-select"))==null||me.addEventListener("change",n=>{const e=n.target.value.includes("USD")?"USD $":"$";p.organization.currency=n.target.value,p.organization.currency_symbol=e,z(p),A(`Currency set to ${n.target.value}`),S(G)});var ue;(ue=document.getElementById("user-role-select"))==null||ue.addEventListener("change",n=>{H=n.target.value,A(`Switched user to ${H}`)});var pe;(pe=document.getElementById("btn-quick-record-payment"))==null||pe.addEventListener("click",()=>W());var he;(he=document.getElementById("btn-quick-new-loan"))==null||he.addEventListener("click",()=>S("new-loan"));var ge;(ge=document.getElementById("btn-print-receipt"))==null||ge.addEventListener("click",Ce);var ve;(ve=document.getElementById("btn-reset-demo"))==null||ve.addEventListener("click",()=>{var n;confirm("Are you sure you want to reset all data back to the default Belize QuickLend demo state?")&&(p=Le(),F=((n=p.loans[0])==null?void 0:n.id)||null,A("Reset data back to original 15 Belizean demo borrowers."),S("dashboard"))});document.querySelectorAll(".nav-tab-btn").forEach(n=>{n.addEventListener("click",()=>S(n.dataset.tab))});S("dashboard");fe();console.log("LendTrack Loan Management Core initialized successfully.");
