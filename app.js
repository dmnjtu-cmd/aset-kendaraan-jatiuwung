// =====================================================
// ASSET KENDARAAN JATIUWUNG
// =====================================================

// Gunakan Publishable Key saja.
// JANGAN memasukkan service_role / Secret Key ke file ini.

const SUPABASE_URL =
"https://uwlvuvoqkgvwyxvkfdsd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_2SehD19CRmHFNHNEVakfMQ_Q58rNdi1";

const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// VARIABLE
// =====================================================

let data = [];
let maintenanceData = [];

const $ = id => document.getElementById(id);


// =====================================================
// LOGIN / LOGOUT
// =====================================================

async function loginUser(email, password){

    const result =
        await sb.auth.signInWithPassword({
            email,
            password
        });

    if(result.error){
        $("msg").textContent =
            result.error.message;

        return false;
    }

    return true;
}


async function logoutUser(){

    await sb.auth.signOut();

    showLogin();
}


// =====================================================
// TAMPILAN LOGIN
// =====================================================

function showLogin(){

    $("login").hidden = false;
    $("app").hidden = true;

    $("login").style.display = "flex";
    $("app").style.display = "none";

}


function showApp(){

    $("login").hidden = true;
    $("app").hidden = false;

    $("login").style.display = "none";
    $("app").style.display = "block";

}


// =====================================================
// NAVIGASI
// =====================================================

function openPage(page){

    document
        .querySelectorAll(".page")
        .forEach(el => {
            el.classList.remove("active");
        });

    const target =
        $("page-" + page);

    if(target){
        target.classList.add("active");
    }


    document
        .querySelectorAll(".menu-btn")
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                btn.dataset.page === page
            );

        });


    const titles = {

        dashboard:
            "Dashboard",

        kendaraan:
            "Data Kendaraan",

        dokumen:
            "Dokumen Kendaraan",

        pemeliharaan:
            "Pemeliharaan & Suku Cadang",

        "jatuh-tempo":
            "Jatuh Tempo",

        profil:
            "Profil Admin"

    };


    $("topTitle").textContent =
        titles[page] || "Dashboard";


    // Tutup sidebar di HP
    $("sidebar").classList.remove("open");


    if(page === "dashboard"){
        renderDashboard();
    }

    if(page === "kendaraan"){
        renderVehicles();
    }

    if(page === "dokumen"){
        renderDocuments();
    }

    if(page === "pemeliharaan"){
        renderMaintenance();
    }

    if(page === "jatuh-tempo"){
        renderDueDates();
    }

}


// =====================================================
// LOAD DATA KENDARAAN
// =====================================================

async function loadVehicles(){

    const result =
        await sb
            .from("kendaraan")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:false
                }
            );


    if(result.error){

        console.error(result.error);

        $("databaseStatus").textContent =
            "Gagal membaca database";

        return;

    }


    data = result.data || [];


    $("databaseStatus").textContent =
        "Terhubung";


    renderDashboard();
    renderVehicles();
    renderDocuments();
    renderDueDates();

}


// =====================================================
// DASHBOARD
// =====================================================

function renderDashboard(){

    const mobil =
        data.filter(
            x => x.jenis_kendaraan === "Mobil"
        ).length;

    const motor =
        data.filter(
            x => x.jenis_kendaraan === "Motor"
        ).length;

    const bentor =
        data.filter(
            x => x.jenis_kendaraan === "Bentor"
        ).length;


    $("mobil").textContent = mobil;
    $("motor").textContent = motor;
    $("bentor").textContent = bentor;
    $("total").textContent = data.length;


    const recent =
        data.slice(0,5);


    if(!recent.length){

        $("recentVehicles").innerHTML =
            `<div class="empty">
                Belum ada data kendaraan.
             </div>`;

        return;

    }


    $("recentVehicles").innerHTML =
        recent.map(v => `

            <div class="info-box">

                <strong>
                    ${escapeHtml(v.nomor_polisi || "-")}
                </strong>

                <span>
                    ${escapeHtml(v.merk_tipe || "-")}
                    ·
                    ${escapeHtml(v.jenis_kendaraan || "-")}
                </span>

            </div>

        `).join("");

}


// =====================================================
// RENDER DATA KENDARAAN
// =====================================================

function renderVehicles(){

    const search =
        ($("search")?.value || "")
        .toLowerCase()
        .trim();


    const filter =
        $("filter")?.value || "";


    const rows =
        data.filter(v => {

            const text = [

                v.nomor_polisi,
                v.nama_pemegang,
                v.merk_tipe,
                v.nomor_rangka,
                v.nomor_mesin

            ]
            .join(" ")
            .toLowerCase();


            return (

                (!filter ||
                    v.jenis_kendaraan === filter)

                &&

                (!search ||
                    text.includes(search))

            );

        });


    if(!rows.length){

        $("vehicleTable").innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="empty">
                        Belum ada kendaraan.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    $("vehicleTable").innerHTML =
        rows.map((v,index) => `

            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            v.nomor_polisi || "-"
                        )}
                    </strong>
                </td>

                <td>
                    <span class="badge ${
                        v.jenis_kendaraan === "Mobil"
                        ? "badge-blue"
                        : v.jenis_kendaraan === "Motor"
                        ? "badge-green"
                        : "badge-orange"
                    }">
                        ${escapeHtml(
                            v.jenis_kendaraan || "-"
                        )}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        v.merk_tipe || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        v.nama_pemegang || "-"
                    )}
                </td>

                <td>
                    ${v.tahun_pengadaan || "-"}
                </td>

                <td>
                    ${formatDate(
                        v.tanggal_perpanjangan
                    )}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="btn btn-secondary"
                            onclick="editVehicle('${v.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="btn btn-danger"
                            onclick="deleteVehicle('${v.id}')"
                        >
                            Hapus
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}


// =====================================================
// TAMBAH KENDARAAN
// =====================================================

function openAddVehicle(){

    $("vehicleForm").reset();

    $("id").value = "";

    $("dlgTitle").textContent =
        "Tambah Kendaraan";

    $("formMsg").textContent = "";

    $("dlg").showModal();

}


// =====================================================
// EDIT KENDARAAN
// =====================================================

window.editVehicle = function(id){

    const v =
        data.find(x => x.id === id);


    if(!v){
        return;
    }


    $("id").value =
        v.id || "";

    $("jenis").value =
        v.jenis_kendaraan || "";

    $("plat").value =
        v.nomor_polisi || "";

    $("nama").value =
        v.nama_pemegang || "";

    $("merk").value =
        v.merk_tipe || "";

    $("tahun").value =
        v.tahun_pengadaan || "";

    $("rangka").value =
        v.nomor_rangka || "";

    $("mesin").value =
        v.nomor_mesin || "";

    $("tempo").value =
        v.tanggal_perpanjangan || "";

    $("kaleng").value =
        v.tanggal_ganti_kaleng || "";


    $("dlgTitle").textContent =
        "Edit Kendaraan";

    $("formMsg").textContent = "";

    $("dlg").showModal();

};


// =====================================================
// SIMPAN KENDARAAN
// =====================================================

$("vehicleForm").onsubmit =
async function(e){

    e.preventDefault();


    const payload = {

        jenis_kendaraan:
            $("jenis").value,

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
            ? Number($("tahun").value)
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


    let result;


    if($("id").value){

        result =
            await sb
                .from("kendaraan")
                .update(payload)
                .eq("id",$("id").value);

    }else{

        result =
            await sb
                .from("kendaraan")
                .insert(payload);

    }


    if(result.error){

        $("formMsg").textContent =
            result.error.message;

        return;

    }


    $("dlg").close();

    await loadVehicles();

};


// =====================================================
// HAPUS KENDARAAN
// =====================================================

window.deleteVehicle =
async function(id){

    if(!confirm(
        "Apakah kendaraan ini benar-benar ingin dihapus?"
    )){
        return;
    }


    const result =
        await sb
            .from("kendaraan")
            .delete()
            .eq("id",id);


    if(result.error){

        alert(result.error.message);

        return;

    }


    await loadVehicles();

};


// =====================================================
// DOKUMEN
// =====================================================

function renderDocuments(){

    if(!data.length){

        $("documentTable").innerHTML = `

            <tr>
                <td colspan="4">
                    <div class="empty">
                        Belum ada data kendaraan.
                    </div>
                </td>
            </tr>

        `;

        return;

    }


    $("documentTable").innerHTML =
        data.map(v => `

            <tr>

                <td>
                    <strong>
                        ${escapeHtml(
                            v.nomor_polisi || "-"
                        )}
                    </strong>
                </td>

                <td>
                    <span class="badge badge-orange">
                        Belum tersedia
                    </span>
                </td>

                <td>
                    <span class="badge badge-orange">
                        Belum tersedia
                    </span>
                </td>

                <td>
                    <span class="badge badge-orange">
                        Belum tersedia
                    </span>
                </td>

            </tr>

        `).join("");

}


// =====================================================
// PEMELIHARAAN
// =====================================================

async function loadMaintenance(){

    const result =
        await sb
            .from("pemeliharaan")
            .select(`
                *,
                kendaraan(
                    nomor_polisi
                )
            `)
            .order(
                "tanggal",
                {
                    ascending:false
                }
            );


    if(result.error){

        console.log(
            "Tabel pemeliharaan belum tersedia."
        );

        maintenanceData = [];

        return;

    }


    maintenanceData =
        result.data || [];

}


function renderMaintenance(){

    if(!maintenanceData.length){

        $("maintenanceTable").innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="empty">

                        Belum ada riwayat
                        pemeliharaan.

                        <br><br>

                        Data akan muncul setelah
                        tabel pemeliharaan dibuat.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    $("maintenanceTable").innerHTML =
        maintenanceData.map(m => `

            <tr>

                <td>
                    ${formatDate(m.tanggal)}
                </td>

                <td>
                    ${escapeHtml(
                        m.kendaraan?.nomor_polisi || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        m.jenis || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        m.keterangan || "-"
                    )}
                </td>

                <td>
                    Rp ${Number(
                        m.biaya || 0
                    ).toLocaleString("id-ID")}
                </td>

            </tr>

        `).join("");

}


// =====================================================
// JATUH TEMPO
// =====================================================

function renderDueDates(){

    const today =
        new Date();


    const limit =
        new Date();

    limit.setDate(
        limit.getDate() + 90
    );


    const due =
        data.filter(v => {

            if(!v.tanggal_perpanjangan){
                return false;
            }

            const date =
                new Date(
                    v.tanggal_perpanjangan
                );

            return (
                date >= today &&
                date <= limit
            );

        });


    if(!due.length){

        $("dueList").innerHTML = `

            <div class="empty">

                Tidak ada kendaraan yang
                mendekati jatuh tempo
                dalam 90 hari.

            </div>

        `;

        return;

    }


    $("dueList").innerHTML =
        due.map(v => {

            const date =
                new Date(
                    v.tanggal_perpanjangan
                );

            const diff =
                Math.ceil(
                    (date - today) /
                    (1000 * 60 * 60 * 24)
                );


            return `

                <div class="info-box">

                    <strong>
                        ${escapeHtml(
                            v.nomor_polisi || "-"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            v.merk_tipe || "-"
                        )}
                        · Jatuh tempo
                        ${formatDate(
                            v.tanggal_perpanjangan
                        )}
                    </span>

                    <br>

                    <span class="badge ${
                        diff <= 30
                        ? "badge-red"
                        : "badge-orange"
                    }">

                        ${diff} hari lagi

                    </span>

                </div>

            `;

        }).join("");

}


// =====================================================
// HELPER
// =====================================================

function formatDate(value){

    if(!value){
        return "-";
    }


    const date =
        new Date(value);


    if(isNaN(date)){
        return value;
    }


    return date.toLocaleDateString(
        "id-ID",
        {
            day:"2-digit",
            month:"2-digit",
            year:"numeric"
        }
    );

}


function escapeHtml(value){

    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


// =====================================================
// EVENT LOGIN
// =====================================================

$("loginForm").onsubmit =
async function(e){

    e.preventDefault();

    $("msg").textContent =
        "Sedang masuk...";


    const success =
        await loginUser(
            $("email").value.trim(),
            $("password").value
        );


    if(success){

        $("msg").textContent = "";

        showApp();

        const session =
            await sb.auth.getSession();

        if(session.data.session){

            const email =
                session.data.session.user.email;

            $("userEmail").textContent =
                email;

            $("dashboardEmail").textContent =
                email;

            $("profileEmail").textContent =
                email;

        }

        await loadVehicles();
        await loadMaintenance();

        openPage("dashboard");

    }

};


// =====================================================
// LOGOUT
// =====================================================

$("logout").onclick =
async function(){

    await logoutUser();

};


// =====================================================
// MENU
// =====================================================

document
    .querySelectorAll(".menu-btn")
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                openPage(
                    btn.dataset.page
                );

            }
        );

    });


// =====================================================
// BUTTON
// =====================================================

$("add").onclick =
openAddVehicle;

$("dashboardAdd").onclick =
openAddVehicle;


$("batal").onclick =
function(){

    $("dlg").close();

};


$("closeDlg").onclick =
function(){

    $("dlg").close();

};


$("refresh").onclick =
async function(){

    await loadVehicles();

};


// =====================================================
// SEARCH
// =====================================================

$("search").oninput =
renderVehicles;

$("filter").onchange =
renderVehicles;


// =====================================================
// MOBILE MENU
// =====================================================

$("mobileMenu").onclick =
function(){

    $("sidebar").classList.toggle(
        "open"
    );

};


// =====================================================
// AUTH STATE
// =====================================================

sb.auth.onAuthStateChange(
async function(event, session){

    if(session){

        showApp();

        const email =
            session.user.email;

        $("userEmail").textContent =
            email;

        $("dashboardEmail").textContent =
            email;

        $("profileEmail").textContent =
            email;

    }else{

        showLogin();

    }

});


// =====================================================
// START APPLICATION
// =====================================================

(async function(){

    const result =
        await sb.auth.getSession();


    if(result.data.session){

        showApp();

        const email =
            result.data.session.user.email;

        $("userEmail").textContent =
            email;

        $("dashboardEmail").textContent =
            email;

        $("profileEmail").textContent =
            email;


        await loadVehicles();

        await loadMaintenance();

        openPage("dashboard");

    }else{

        showLogin();

    }

})();
