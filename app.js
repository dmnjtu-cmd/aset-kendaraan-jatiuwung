<!doctype html>
<html lang="id">

<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>Asset Kendaraan Jatiuwung</title>

<link rel="stylesheet" href="styles.css">

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>

<body>

<!-- =====================================================
     LOGIN
     ===================================================== -->

<div id="login" class="center">

    <div class="card auth">

        <h1>Asset Kendaraan Jatiuwung</h1>

        <p>Login Admin</p>

        <form id="loginForm">

            <input
                id="email"
                type="email"
                placeholder="Email"
                required
            >

            <input
                id="password"
                type="password"
                placeholder="Password"
                required
            >

            <button type="submit">
                Masuk
            </button>

            <small id="msg"></small>

        </form>

    </div>

</div>


<!-- =====================================================
     APLIKASI
     ===================================================== -->

<div id="app" hidden>

    <header>

        <b>Asset Kendaraan Jatiuwung</b>

        <button id="logout">
            Keluar
        </button>

    </header>


    <main>

        <div class="head">

            <div>

                <h1>
                    Dashboard Kendaraan
                </h1>

                <p>
                    Kelola Mobil, Motor, dan Bentor/Roda Tiga.
                </p>

            </div>

            <button id="add">
                + Tambah Kendaraan
            </button>

        </div>


        <!-- =================================================
             STATISTIK
             ================================================= -->

        <div class="stats">

            <div>
                Mobil
                <b id="mobil">0</b>
            </div>

            <div>
                Motor
                <b id="motor">0</b>
            </div>

            <div>
                Bentor
                <b id="bentor">0</b>
            </div>

            <div>
                Total
                <b id="total">0</b>
            </div>

        </div>


        <!-- =================================================
             DATA KENDARAAN
             ================================================= -->

        <div class="card">

            <div class="filters">

                <input
                    id="search"
                    placeholder="Cari nomor polisi, nama atau merk..."
                >

                <select id="filter">

                    <option value="">
                        Semua jenis
                    </option>

                    <option value="Mobil">
                        Mobil
                    </option>

                    <option value="Motor">
                        Motor
                    </option>

                    <option value="Bentor">
                        Bentor
                    </option>

                </select>

            </div>

            <div id="list"></div>

        </div>

    </main>

</div>


<!-- =====================================================
     MODAL TAMBAH / EDIT KENDARAAN
     ===================================================== -->

<dialog id="dlg">

    <form
        id="vehicleForm"
        class="card"
    >

        <h2 id="dlgTitle">
            Tambah Kendaraan
        </h2>


        <!-- ID DATABASE -->

        <input
            id="id"
            type="hidden"
        >


        <!-- =================================================
             DATA KENDARAAN
             ================================================= -->

        <select
            id="jenis"
            required
        >

            <option value="">
                Jenis kendaraan
            </option>

            <option value="Mobil">
                Mobil
            </option>

            <option value="Motor">
                Motor
            </option>

            <option value="Bentor">
                Bentor
            </option>

        </select>


        <input
            id="plat"
            placeholder="Nomor Polisi"
            required
        >


        <input
            id="nama"
            placeholder="Nama Pemegang"
            required
        >


        <!-- =================================================
             DATA PEGAWAI
             ================================================= -->

        <input
            id="nip"
            type="text"
            placeholder="NIP Pegawai"
        >


        <input
            id="jabatan"
            type="text"
            placeholder="Jabatan Pegawai"
        >


        <input
            id="unit"
            type="text"
            placeholder="Unit Kerja"
        >


        <!-- =================================================
             DATA KENDARAAN LANJUTAN
             ================================================= -->

        <input
            id="merk"
            placeholder="Merk & Tipe"
        >


        <input
            id="tahun"
            type="number"
            placeholder="Tahun Pengadaan"
        >


        <input
            id="rangka"
            placeholder="Nomor Rangka"
        >


        <input
            id="mesin"
            placeholder="Nomor Mesin"
        >


        <!-- =================================================
             TANGGAL
             ================================================= -->

        <label>

            Tanggal Perpanjangan STNK

            <input
                id="tempo"
                type="date"
            >

        </label>


        <label>

            Tanggal Ganti Kaleng / Plat

            <input
                id="kaleng"
                type="date"
            >

        </label>


        <!-- =================================================
             TOMBOL
             ================================================= -->

        <div class="actions">

            <button
                type="button"
                id="batal"
            >
                Batal
            </button>

            <button
                type="submit"
            >
                Simpan Kendaraan
            </button>

        </div>


        <small id="formMsg"></small>

    </form>

</dialog>


<!-- =====================================================
     JAVASCRIPT
     ===================================================== -->

<script src="app.js"></script>

</body>

</html>
