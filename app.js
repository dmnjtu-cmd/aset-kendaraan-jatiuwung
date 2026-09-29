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


    if($("topTitle")){

        $("topTitle").textContent =
            titles[page] || "Dashboard";

    }


    if($("sidebar")){

        $("sidebar").classList.remove("open");

    }


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

        if($("databaseStatus")){

            $("databaseStatus").textContent =
                "Gagal membaca database";

        }

        return false;
    }


    data =
        result.data || [];


    if($("databaseStatus")){

        $("databaseStatus").textContent =
            "Terhubung";

    }


    renderDashboard();
    renderVehicles();
    renderDocuments();
    renderDueDates();

    return true;
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


    if($("mobil"))
        $("mobil").textContent = mobil;

    if($("motor"))
        $("motor").textContent = motor;

    if($("bentor"))
        $("bentor").textContent = bentor;

    if($("total"))
        $("total").textContent = data.length;


    const recent =
        data.slice(0,5);


    if(!$("recentVehicles"))
        return;


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
                    ${escapeHtml(
                        v.nomor_polisi || "-"
                    )}
                </strong>

                <span>

                    ${escapeHtml(
                        v.merk_tipe || "-"
                    )}

                    ·

                    ${escapeHtml(
                        v.jenis_kendaraan || "-"
                    )}

                    <br>

                    Pemegang:
                    ${escapeHtml(
                        v.nama_pemegang || "-"
                    )}

                </span>

            </div>

        `).join("");

}


// =====================================================
// RENDER DATA KENDARAAN
// =====================================================

function renderVehicles(){

    if(!$("vehicleTable"))
        return;


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
                v.nip_pegawai,
                v.jabatan_pegawai,
                v.unit_kerja,
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
                            type="button"
                            class="btn btn-secondary"
                            onclick="editVehicle('${v.id}')"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
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
// BUKA FORM TAMBAH
// =====================================================

function openAddVehicle(){

    if(!$("vehicleForm"))
        return;


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
        data.find(
            x => x.id === id
        );


    if(!v){

        alert(
            "Data kendaraan tidak ditemukan."
        );

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


    // DATA PEMEGANG / PEGAWAI

    if($("nip"))
        $("nip").value =
            v.nip_pegawai || "";


    if($("jabatan"))
        $("jabatan").value =
            v.jabatan_pegawai || "";


    if($("unit"))
        $("unit").value =
            v.unit_kerja || "";


    // DATA PERPANJANGAN

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

if($("vehicleForm")){

    $("vehicleForm").onsubmit =
    async function(e){

        e.preventDefault();


        $("formMsg").textContent =
            "Menyimpan data...";


        // =================================================
        // AMBIL DATA FORM
        // =================================================

        const payload = {

            // DATA KENDARAAN

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
                ? Number(
                    $("tahun").value
                )
                : null,

            nomor_rangka:
                $("rangka").value.trim(),

            nomor_mesin:
                $("mesin").value.trim(),


            // DATA PEMEGANG / PEGAWAI

            nip_pegawai:
                $("nip")
                ? $("nip").value.trim()
                : "",

            jabatan_pegawai:
                $("jabatan")
                ? $("jabatan").value.trim()
                : "",

            unit_kerja:
                $("unit")
                ? $("unit").value.trim()
                : "",


            // DATA PERPANJANGAN

            tanggal_perpanjangan:
                $("tempo").value || null,

            tanggal_ganti_kaleng:
                $("kaleng").value || null

        };


        // =================================================
        // VALIDASI
        // =================================================

        if(!payload.jenis_kendaraan){

            $("formMsg").textContent =
                "Jenis kendaraan wajib dipilih.";

            return;
        }


        if(!payload.nomor_polisi){

            $("formMsg").textContent =
                "Nomor polisi wajib diisi.";

            return;
        }


        if(!payload.nama_pemegang){

            $("formMsg").textContent =
                "Nama pemegang kendaraan wajib diisi.";

            return;
        }


        // =================================================
        // SIMPAN / UPDATE
        // =================================================

        let result;


        try{

            if($("id").value){

                // UPDATE

                result =
                    await sb
                        .from("kendaraan")
                        .update(payload)
                        .eq(
                            "id",
                            $("id").value
                        );

            }else{

                // INSERT

                result =
                    await sb
                        .from("kendaraan")
                        .insert(payload);

            }

        }catch(error){

            console.error(error);

            $("formMsg").textContent =
                "Terjadi kesalahan saat menyimpan.";

            return;
        }


        // =================================================
        // ERROR DATABASE
        // =================================================

        if(result.error){

            console.error(
                "Supabase error:",
                result.error
            );


            $("formMsg").textContent =
                "Gagal menyimpan: " +
                result.error.message;


            return;
        }


        // =================================================
        // BERHASIL
        // =================================================

        $("formMsg").textContent =
            "Data berhasil disimpan.";


        await loadVehicles();


        setTimeout(
            function(){

                if($("dlg").open){

                    $("dlg").close();

                }


                $("vehicleForm").reset();

                $("id").value = "";

                $("formMsg").textContent = "";

            },
            400
        );

    };

}


// =====================================================
// TOMBOL BATAL
// =====================================================

if($("batal")){

    $("batal").onclick =
    function(e){

        e.preventDefault();


        $("vehicleForm").reset();

        $("id").value = "";

        $("formMsg").textContent = "";


        if($("dlg").open){

            $("dlg").close();

        }

    };

}


// =====================================================
// TOMBOL CLOSE DIALOG
// =====================================================

if($("closeDlg")){

    $("closeDlg").onclick =
    function(e){

        e.preventDefault();


        $("vehicleForm").reset();

        $("id").value = "";

        $("formMsg").textContent = "";


        if($("dlg").open){

            $("dlg").close();

        }

    };

}


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
            .eq(
                "id",
                id
            );


    if(result.error){

        alert(
            result.error.message
        );

        return;
    }


    await loadVehicles();

};


// =====================================================
// DOKUMEN
// =====================================================

function renderDocuments(){

    if(!$("documentTable"))
        return;


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

    if(!$("maintenanceTable"))
        return;


    if(!maintenanceData.length){

        $("maintenanceTable").innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="empty">

                        Belum ada riwayat
                        pemeliharaan.

                        <br><br>

                        Data akan muncul setelah
                        tabel pemeliharaan tersedia.

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

    const box = $("dueList");

    if(!box){
        return;
    }


    // =====================================================
    // TANGGAL HARI INI
    // =====================================================

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    // =====================================================
    // BATAS 90 HARI KE DEPAN
    // =====================================================

    const limit = new Date(today);

    limit.setDate(
        limit.getDate() + 90
    );


    // =====================================================
    // FILTER KENDARAAN
    // =====================================================

    const due = data
        .filter(vehicle => {

            const rawDate =
                vehicle.tanggal_perpanjangan;


            // Tidak ada tanggal
            if(
                rawDate === null ||
                rawDate === undefined ||
                rawDate === ""
            ){

                return false;

            }


            // Ubah tanggal database menjadi Date
            const dueDate =
                new Date(rawDate);


            // Kalau tanggal tidak valid
            if(
                Number.isNaN(
                    dueDate.getTime()
                )
            ){

                return false;

            }


            dueDate.setHours(
                0,
                0,
                0,
                0
            );


            /*
             * PENTING
             *
             * Jangan menggunakan:
             *
             * dueDate >= today
             *
             * karena kendaraan yang sudah
             * lewat jatuh tempo tidak akan muncul.
             *
             * Kita tampilkan:
             *
             * - sudah jatuh tempo
             * - hari ini
             * - maksimal 90 hari ke depan
             */

            return dueDate <= limit;

        });


    // =====================================================
    // URUTKAN DARI YANG PALING MENDESAK
    // =====================================================

    due.sort(
        (a,b) => {

            return (
                new Date(
                    a.tanggal_perpanjangan
                ).getTime()
            )
            -
            (
                new Date(
                    b.tanggal_perpanjangan
                ).getTime()
            );

        }
    );


    // =====================================================
    // TIDAK ADA DATA
    // =====================================================

    if(due.length === 0){

        box.innerHTML = `

            <div class="empty">

                <strong>
                    Tidak ada kendaraan
                    yang perlu diperhatikan.
                </strong>

                <br><br>

                Sistem memantau kendaraan
                yang sudah jatuh tempo
                dan sampai 90 hari ke depan.

            </div>

        `;

        return;

    }


    // =====================================================
    // TAMPILKAN DATA
    // =====================================================

    box.innerHTML = due
        .map(vehicle => {


            const dueDate =
                new Date(
                    vehicle.tanggal_perpanjangan
                );


            dueDate.setHours(
                0,
                0,
                0,
                0
            );


            // Selisih hari
            const diff =
                Math.round(
                    (
                        dueDate.getTime()
                        -
                        today.getTime()
                    )
                    /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );


            let status = "";
            let badge = "";


            // =================================================
            // SUDAH JATUH TEMPO
            // =================================================

            if(diff < 0){

                status =
                    "Sudah jatuh tempo " +
                    Math.abs(diff) +
                    " hari";

                badge =
                    "badge-red";

            }


            // =================================================
            // HARI INI
            // =================================================

            else if(diff === 0){

                status =
                    "Jatuh tempo hari ini";

                badge =
                    "badge-red";

            }


            // =================================================
            // 1 - 30 HARI
            // =================================================

            else if(diff <= 30){

                status =
                    diff +
                    " hari lagi";

                badge =
                    "badge-red";

            }


            // =================================================
            // 31 - 60 HARI
            // =================================================

            else if(diff <= 60){

                status =
                    diff +
                    " hari lagi";

                badge =
                    "badge-orange";

            }


            // =================================================
            // 61 - 90 HARI
            // =================================================

            else{

                status =
                    diff +
                    " hari lagi";

                badge =
                    "badge-blue";

            }


            return `

                <div class="info-box">

                    <strong>

                        ${escapeHtml(
                            vehicle.nomor_polisi || "-"
                        )}

                    </strong>


                    <span>

                        ${escapeHtml(
                            vehicle.merk_tipe || "-"
                        )}

                        ·

                        ${escapeHtml(
                            vehicle.jenis_kendaraan || "-"
                        )}

                    </span>


                    <br>


                    <span>

                        Pemegang:

                        ${escapeHtml(
                            vehicle.nama_pemegang || "-"
                        )}

                    </span>


                    <br>


                    <span>

                        Jatuh tempo:

                        <strong>

                            ${formatDate(
                                vehicle.tanggal_perpanjangan
                            )}

                        </strong>

                    </span>


                    <br>


                    <span class="
                        badge
                        ${badge}
                    ">

                        ${status}

                    </span>

                </div>

            `;

        })
        .join("");

}
// =====================================================
// SECURITY / ESCAPE HTML
// =====================================================

function escapeHtml(value){

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


// =====================================================
// EVENT LOGIN
// =====================================================

if($("loginForm")){

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


                if($("userEmail"))
                    $("userEmail").textContent =
                        email;


                if($("dashboardEmail"))
                    $("dashboardEmail").textContent =
                        email;


                if($("profileEmail"))
                    $("profileEmail").textContent =
                        email;

            }


            await loadVehicles();

            await loadMaintenance();

            openPage("dashboard");

        }

    };

}


// =====================================================
// LOGOUT
// =====================================================

if($("logout")){

    $("logout").onclick =
    async function(){

        await logoutUser();

    };

}


// =====================================================
// MENU
// =====================================================

document
    .querySelectorAll(".menu-btn")
    .forEach(btn => {

        btn.addEventListener(
            "click",
            function(){

                openPage(
                    btn.dataset.page
                );

            }
        );

    });


// =====================================================
// BUTTON TAMBAH
// =====================================================

if($("add")){

    $("add").onclick =
        openAddVehicle;

}


if($("dashboardAdd")){

    $("dashboardAdd").onclick =
        openAddVehicle;

}


// =====================================================
// REFRESH
// =====================================================

if($("refresh")){

    $("refresh").onclick =
    async function(){

        await loadVehicles();

    };

}


// =====================================================
// SEARCH
// =====================================================

if($("search")){

    $("search").oninput =
        renderVehicles;

}


if($("filter")){

    $("filter").onchange =
        renderVehicles;

}


// =====================================================
// MOBILE MENU
// =====================================================

if($("mobileMenu")){

    $("mobileMenu").onclick =
    function(){

        if($("sidebar")){

            $("sidebar").classList.toggle(
                "open"
            );

        }

    };

}


// =====================================================
// AUTH STATE
// =====================================================

sb.auth.onAuthStateChange(
    async function(event, session){

        if(session){

            showApp();


            const email =
                session.user.email;


            if($("userEmail"))
                $("userEmail").textContent =
                    email;


            if($("dashboardEmail"))
                $("dashboardEmail").textContent =
                    email;


            if($("profileEmail"))
                $("profileEmail").textContent =
                    email;


        }else{

            showLogin();

        }

    }
);


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


        if($("userEmail"))
            $("userEmail").textContent =
                email;


        if($("dashboardEmail"))
            $("dashboardEmail").textContent =
                email;


        if($("profileEmail"))
            $("profileEmail").textContent =
                email;


        await loadVehicles();

        await loadMaintenance();

        openPage("dashboard");


    }else{

        showLogin();

    }

})();
