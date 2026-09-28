// ISI HANYA Publishable Key. JANGAN masukkan Secret Key.
const SUPABASE_URL="https://uwlvuvoqkgvwyxvkfdsd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_2SehD19CRmHFNHNEVakfMQ_Q58rNdi1";

const sb=window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let data=[];

const $=x=>document.getElementById(x);

function configured(){
  return !!sb;
}

function showLogin(){
  $("login").hidden=false;
  $("login").style.display="flex";

  $("app").hidden=true;
  $("app").style.display="none";
}

function showApp(){
  $("login").hidden=true;
  $("login").style.display="none";

  $("app").hidden=false;
  $("app").style.display="block";

  load();
}

function render(){

  const q=$("search").value.toLowerCase();
  const f=$("filter").value;

  const rows=data.filter(v=>
    (!f || v.jenis_kendaraan===f) &&
    (!q ||
      [
        v.nomor_polisi,
        v.nama_pemegang,
        v.merk_tipe
      ]
      .join(" ")
      .toLowerCase()
      .includes(q)
    )
  );

  $("mobil").textContent=
    data.filter(x=>x.jenis_kendaraan==="Mobil").length;

  $("motor").textContent=
    data.filter(x=>x.jenis_kendaraan==="Motor").length;

  $("bentor").textContent=
    data.filter(x=>x.jenis_kendaraan==="Bentor").length;

  $("total").textContent=data.length;

  $("list").innerHTML=rows.length
    ? rows.map(v=>`
      <div class="row">
        <div>
          <strong>
            ${v.nomor_polisi||"-"} — ${v.merk_tipe||"-"}
          </strong>

          <span>
            ${v.nama_pemegang||"-"} · ${v.jenis_kendaraan}
          </span>

          <br>

          <span>
            Perpanjangan:
            ${v.tanggal_perpanjangan||"-"}
            ·
            Ganti kaleng:
            ${v.tanggal_ganti_kaleng||"-"}
          </span>
        </div>

        <div>
          <button onclick="edit('${v.id}')">
            Edit
          </button>

          <button onclick="hapus('${v.id}')">
            Hapus
          </button>
        </div>
      </div>
    `).join("")
    : "<p>Belum ada kendaraan.</p>";
}

async function load(){

  let r=await sb
    .from("kendaraan")
    .select("*")
    .order("created_at",{ascending:false});

  if(r.error){
    alert(r.error.message);
    return;
  }

  data=r.data||[];

  render();
}

$("loginForm").onsubmit=async e=>{

  e.preventDefault();

  if(!configured()){
    $("msg").textContent=
      "Belum dihubungkan ke Supabase.";
    return;
  }

  $("msg").textContent="";

  let r=await sb.auth.signInWithPassword({
    email:$("email").value,
    password:$("password").value
  });

  if(r.error){
    $("msg").textContent=r.error.message;
    return;
  }

  showApp();
};

$("logout").onclick=async()=>{
  await sb.auth.signOut();
};

$("add").onclick=()=>{

  $("vehicleForm").reset();

  $("id").value="";

  $("dlgTitle").textContent=
    "Tambah Kendaraan";

  $("dlg").showModal();
};

$("batal").onclick=()=>{
  $("dlg").close();
};

$("search").oninput=render;

$("filter").onchange=render;

$("vehicleForm").onsubmit=async e=>{

  e.preventDefault();

  let payload={
    jenis_kendaraan:$("jenis").value,

    nomor_polisi:
      $("plat").value
      .trim()
      .toUpperCase(),

    nama_pemegang:
      $("nama").value.trim(),

    merk_tipe:
      $("merk").value.trim(),

    tahun_pengadaan:
      $("tahun").value
      ? +$("tahun").value
      : null,

    nomor_rangka:
      $("rangka").value.trim(),

    nomor_mesin:
      $("mesin").value.trim(),

    tanggal_perpanjangan:
      $("tempo").value || null,

    tanggal_ganti_kaleng:
      $("kaleng").value || null
  };

  let r;

  if($("id").value){

    r=await sb
      .from("kendaraan")
      .update(payload)
      .eq("id",$("id").value);

  }else{

    r=await sb
      .from("kendaraan")
      .insert(payload);

  }

  if(r.error){

    $("formMsg").textContent=
      r.error.message;

    return;
  }

  $("dlg").close();

  await load();
};

window.edit=id=>{

  let v=data.find(x=>x.id===id);

  if(!v) return;

  $("id").value=v.id;

  $("jenis").value=
    v.jenis_kendaraan;

  $("plat").value=
    v.nomor_polisi||"";

  $("nama").value=
    v.nama_pemegang||"";

  $("merk").value=
    v.merk_tipe||"";

  $("tahun").value=
    v.tahun_pengadaan||"";

  $("rangka").value=
    v.nomor_rangka||"";

  $("mesin").value=
    v.nomor_mesin||"";

  $("tempo").value=
    v.tanggal_perpanjangan||"";

  $("kaleng").value=
    v.tanggal_ganti_kaleng||"";

  $("dlgTitle").textContent=
    "Edit Kendaraan";

  $("dlg").showModal();
};

window.hapus=async id=>{

  if(!confirm("Hapus kendaraan ini?")){
    return;
  }

  let r=await sb
    .from("kendaraan")
    .delete()
    .eq("id",id);

  if(r.error){

    alert(r.error.message);

  }else{

    await load();

  }
};

(async()=>{

  if(!configured()){
    showLogin();
    return;
  }

  let r=await sb.auth.getSession();

  if(r.data.session){

    showApp();

  }else{

    showLogin();

  }

  sb.auth.onAuthStateChange(
    (_event,session)=>{

      if(session){

        showApp();

      }else{

        showLogin();

      }

    }
  );

})();
