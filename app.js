const fileInput=document.querySelector("#chart"), preview=document.querySelector("#preview");
const analyze=document.querySelector("#analyze"), status=document.querySelector("#status");
const result=document.querySelector("#result"), output=document.querySelector("#analysis");
let selectedFile=null, timeframe="1m";
document.querySelectorAll("[data-tf]").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll("[data-tf]").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); timeframe=btn.dataset.tf;
}));
fileInput.addEventListener("change",()=>{
  selectedFile=fileInput.files?.[0]||null;
  if(!selectedFile){analyze.disabled=true;return}
  if(!["image/png","image/jpeg","image/webp"].includes(selectedFile.type)||selectedFile.size>7*1024*1024){
    status.textContent="PNG/JPG/WEBP এবং ৭ MB-এর কম ছবি নির্বাচন করুন।";selectedFile=null;analyze.disabled=true;return;
  }
  preview.src=URL.createObjectURL(selectedFile);preview.style.display="block";
  analyze.disabled=false;status.textContent="ছবি প্রস্তুত। বিশ্লেষণ শুরু করতে চাপ দিন।";
});
analyze.addEventListener("click",async()=>{
  if(!selectedFile)return;
  analyze.disabled=true;status.textContent="AI ছবিটি বিশ্লেষণ করছে…";result.hidden=true;
  try{
    const imageData=await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(selectedFile);
    });
    const response=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      imageData,timeframe,pair:document.querySelector("#pair").value.trim()
    })});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"বিশ্লেষণ ব্যর্থ হয়েছে।");
    output.textContent=data.analysis;result.hidden=false;status.textContent="বিশ্লেষণ সম্পন্ন।";
  }catch(err){status.textContent=err.message||"সমস্যা হয়েছে। আবার চেষ্টা করুন।"}
  finally{analyze.disabled=!selectedFile}
});
